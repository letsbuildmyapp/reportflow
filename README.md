# ReportFlow — AI Insurance Claim Reports

Demo product by [letsbuildmyapp.com](https://letsbuildmyapp.com). Upload claim documents (PDFs, photos, DOCX), get a structured, editable report with AI-extracted fields, narrative summary, risk flags, and a PDF export.

**Niche:** insurance claim reports (synthetic data — no real PHI).

## Visual identity

- **Archetype:** Glassy / Apple-esque — soft pastel gradients, frosted blur, `rounded-3xl`, generous padding, Framer Motion micro-interactions, both light and dark mode.
- **Type:** Inter (text) + Inter Tight (display).
- **Palette:** OKLCH `brand` (violet 270°) + `accent` (cyan 200°) over a soft pastel mesh.
- **Hero:** animated floating cards in a glassy bento.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3 + custom glass primitives (no shadcn dependency for speed; primitives mimic that DX)
- React Router v7, TanStack Query, react-hook-form + zod, Framer Motion, lucide-react, sonner
- Firebase: Auth, Firestore, Storage, Cloud Functions (Node 20, TypeScript), Hosting
- `@anthropic-ai/sdk` (Cloud Function only — never bundled in the browser)
- `@react-pdf/renderer` for PDF export

## Run locally (against Firebase emulators)

```bash
# 1. Install root deps
npm install

# 2. Install + build functions
cd functions && npm install && npm run build && cd ..

# 3. (Optional) Set the Anthropic key for real AI extraction. Without it the function
#    returns realistic fixture data so the demo never errors out.
cp functions/.env.example functions/.env
# then edit functions/.env to add ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the Firebase emulator suite (Auth, Firestore, Storage, Functions, Hosting UI)
npx firebase emulators:start

# 5. In another terminal, seed the emulator with a demo user + 3 sample reports
node scripts/seed.mjs

# 6. In another terminal, run Vite
npm run dev
```

Then open <http://localhost:5173>. Sign in with `demo@reportflow.app` / `demo1234`.

The Firebase emulator UI is at <http://localhost:4000>.

## How it works

1. User uploads files on `/new`. Files go to Firebase Storage at `users/{uid}/reports/{reportId}/...`.
2. A Firestore `reports/{id}` doc is created with status `queued`.
3. Frontend invokes the `processReport` callable Cloud Function.
4. Function:
   - Pulls each file from Storage.
   - Builds a multimodal user message (image blocks for photos, document blocks for PDFs, text for txt/json).
   - Calls Anthropic with `claude-sonnet-4-6` by default (or `claude-opus-4-7` when more than 3 source files), prompt caching enabled on the system prompt, and a JSON-schema-constrained `output_config.format`.
   - If `ANTHROPIC_API_KEY` is unset, returns fixture data (so the demo never errors).
   - Writes the result back to Firestore; status becomes `ready` or `error`.
5. Frontend (`/report/:id`) subscribes via `onSnapshot` — UI shows live processing animation, then editable form.
6. User edits any field, clicks **Export PDF** — `@react-pdf/renderer` generates the PDF in-browser, uploads to Storage, and downloads locally.

## Handoff steps (Alex)

When ready to deploy to a real Firebase project:

1. Create a Firebase project (e.g. `reportflow`) at https://console.firebase.google.com.
2. Enable: Authentication (Email/Password + Google), Firestore (production mode), Storage, Functions (Blaze plan required for Functions on Node 20).
3. Update `.firebaserc` with your project ID.
4. Create two Hosting sites (`reportflow-staging`, `reportflow`) and apply targets:

   ```bash
   npx firebase target:apply hosting staging reportflow-staging
   npx firebase target:apply hosting production reportflow
   ```

5. Copy your project's web config into `.env.local` (use `.env.example` as a template) and set `VITE_USE_EMULATOR=false`.
6. Set the Anthropic key as a Functions secret:

   ```bash
   npx firebase functions:secrets:set ANTHROPIC_API_KEY
   ```

   Then update `functions/src/index.ts` to declare the secret on the function (`secrets: ['ANTHROPIC_API_KEY']`) before deploying.
7. Deploy to **staging first** (per project rule):

   ```bash
   npm run build
   npx firebase deploy --only hosting:staging,functions,firestore,storage
   ```

8. Confirm in staging, then deploy to production.

## Decisions worth revisiting after the build

- **Tone of copy** on the landing page — currently confident-but-warm; could be more neutral B2B.
- **Claim niche** — could pivot to real-estate inspections or medical lab summaries; the data model is shared.
- **Default model** — Sonnet 4.6 for cost; Opus 4.7 for >3-file extractions. Threshold is arbitrary, easy to tune.
- **PDF brand** — currently violet `#6447D6`; should match final agency palette.
- **No shadcn yet** — used hand-rolled glass primitives for speed.
