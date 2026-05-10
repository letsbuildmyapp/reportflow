import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import Anthropic from '@anthropic-ai/sdk';
import { extractedReportFixture } from './fixture';

initializeApp();

const SYSTEM_PROMPT = `You are ReportFlow's claim extraction assistant. You analyze insurance claim source documents (PDFs, photos of damage, scanned forms, adjuster notes) and produce a structured claim report draft.

Your output must be a JSON object that strictly conforms to the provided schema. Be conservative — never invent dollar amounts, names, or policy numbers that aren't supported by the inputs. When data is missing, leave string fields empty ("") and numeric fields at 0, and add a risk flag describing what's missing.

Damage line items: each item should be a single physical damage or loss (one car panel, one room, one stolen item). Categories: "Vehicle", "Structure", "Contents", "Medical", "Other".

The narrative summary should be 3–5 sentences, neutral and adjuster-ready. Avoid speculation. Cite specific numbers from the inputs.

Risk flags: raise medium/high flags for any indicators of fraud, missing documentation, inconsistent statements, or unusually large claim amounts. Severity: "low" | "medium" | "high".

Recommended payout: typically equals total damages minus the standard deductible ($500 unless otherwise stated). Note any reason it should differ in nextSteps.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    claimant: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        policyNumber: { type: 'string' },
        claimNumber: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
      required: ['name', 'policyNumber', 'claimNumber'],
      additionalProperties: false,
    },
    incident: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        location: { type: 'string' },
        description: { type: 'string' },
        claimType: {
          type: 'string',
          enum: ['auto_collision', 'property_damage', 'water_damage', 'theft_burglary', 'fire', 'other'],
        },
      },
      required: ['date', 'location', 'description', 'claimType'],
      additionalProperties: false,
    },
    damages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          category: { type: 'string' },
          estimatedCost: { type: 'number' },
          notes: { type: 'string' },
        },
        required: ['description', 'category', 'estimatedCost'],
        additionalProperties: false,
      },
    },
    estimatedTotalUSD: { type: 'number' },
    recommendedPayoutUSD: { type: 'number' },
    riskFlags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          label: { type: 'string' },
          rationale: { type: 'string' },
        },
        required: ['severity', 'label', 'rationale'],
        additionalProperties: false,
      },
    },
    summary: { type: 'string' },
    nextSteps: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'claimant', 'incident', 'damages', 'estimatedTotalUSD',
    'recommendedPayoutUSD', 'riskFlags', 'summary', 'nextSteps',
  ],
  additionalProperties: false,
};

interface ProcessReportData {
  reportId: string;
}

export const processReport = onCall<ProcessReportData>(
  { region: 'us-central1', timeoutSeconds: 540, memory: '1GiB' },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required');
    const { reportId } = req.data;
    if (!reportId) throw new HttpsError('invalid-argument', 'reportId is required');

    const db = getFirestore();
    const docRef = db.collection('reports').doc(reportId);
    const snap = await docRef.get();
    if (!snap.exists) throw new HttpsError('not-found', 'Report not found');
    const report = snap.data() as any;
    if (report.ownerId !== req.auth.uid) throw new HttpsError('permission-denied', 'Not your report');

    await docRef.update({ status: 'processing', updatedAt: FieldValue.serverTimestamp(), error: '' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const useFixture = !apiKey;

    try {
      let extracted;
      let modelUsed = 'fixture';

      if (useFixture) {
        // No API key — return realistic fixture so the demo doesn't error.
        await new Promise((r) => setTimeout(r, 5000));
        extracted = extractedReportFixture(report.title);
      } else {
        const client = new Anthropic({ apiKey });
        const fileCount = (report.files || []).length;
        const useOpus = fileCount > 3; // multi-doc → use Opus per spec

        const userContent: any[] = [];

        // Pull file contents from Storage and attach (text or images).
        // We pass image bytes inline; for PDFs we describe via a doc block when supported,
        // and for non-supported types we send filename hints.
        const bucket = getStorage().bucket();
        for (const f of report.files || []) {
          try {
            const [buf] = await bucket.file(f.storagePath).download();
            const ct = f.contentType || '';
            if (ct.startsWith('image/')) {
              userContent.push({
                type: 'image',
                source: { type: 'base64', media_type: ct, data: buf.toString('base64') },
              });
              userContent.push({ type: 'text', text: `(file: ${f.name})` });
            } else if (ct === 'application/pdf') {
              userContent.push({
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') },
              });
              userContent.push({ type: 'text', text: `(file: ${f.name})` });
            } else if (ct.startsWith('text/') || ct === 'application/json') {
              userContent.push({ type: 'text', text: `--- ${f.name} ---\n${buf.toString('utf8').slice(0, 50_000)}` });
            } else {
              userContent.push({ type: 'text', text: `(uploaded ${f.name}, content type ${ct}, ${buf.length} bytes — content not directly readable)` });
            }
          } catch (e) {
            userContent.push({ type: 'text', text: `(file ${f.name}: failed to load — ${(e as Error).message})` });
          }
        }

        userContent.push({
          type: 'text',
          text: `Report title: ${report.title}\n\nExtract the structured claim report from the documents above. Output JSON matching the schema.`,
        });

        modelUsed = useOpus ? 'claude-opus-4-7' : 'claude-sonnet-4-6';

        const resp = await client.messages.create({
          model: modelUsed,
          max_tokens: 8000,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userContent }],
          // structured output
          // @ts-ignore — output_config is supported on current API
          output_config: {
            format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
          },
        });

        const textBlock = resp.content.find((b: any) => b.type === 'text') as any;
        if (!textBlock?.text) throw new Error('No text output from model');
        extracted = JSON.parse(textBlock.text);
      }

      // recompute total to be safe
      extracted.estimatedTotalUSD = (extracted.damages || []).reduce(
        (s: number, d: any) => s + (Number(d.estimatedCost) || 0),
        0,
      );

      await docRef.update({
        status: 'ready',
        data: extracted,
        modelUsed,
        fixtureMode: useFixture,
        updatedAt: FieldValue.serverTimestamp(),
        error: '',
      });

      return { ok: true, fixture: useFixture };
    } catch (err) {
      console.error('processReport failed', err);
      await docRef.update({
        status: 'error',
        error: (err as Error).message?.slice(0, 500) ?? 'Unknown error',
        updatedAt: FieldValue.serverTimestamp(),
      });
      throw new HttpsError('internal', (err as Error).message ?? 'Failed to process');
    }
  },
);
