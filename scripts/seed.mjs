// Seeds the Firebase emulator with a demo user + a few completed reports.
// Run after `firebase emulators:start` is up.
//
//   node scripts/seed.mjs
//
import { initializeApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore, connectFirestoreEmulator, doc, setDoc, serverTimestamp,
} from 'firebase/firestore';

const config = {
  apiKey: 'demo-api-key',
  authDomain: 'reportflow-demo.firebaseapp.com',
  projectId: 'demo-reportflow',
  storageBucket: 'reportflow-demo.appspot.com',
  messagingSenderId: '0',
  appId: '0',
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const PASSWORD = 'demo1234';
const DEMO_USERS = [
  { email: 'demo@reportflow.app',     name: 'Demo Adjuster',  title: 'Senior Claims Adjuster' },
  { email: 'avery@reportflow.app',    name: 'Avery Patel',    title: 'Auto Claims Specialist' },
  { email: 'rowan@reportflow.app',    name: 'Rowan Kim',      title: 'Property Claims Lead' },
];

async function ensureUser(email = 'demo@reportflow.app') {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    return cred.user;
  } catch {
    const cred = await signInWithEmailAndPassword(auth, email, PASSWORD);
    return cred.user;
  }
}

const sampleReports = [
  {
    title: 'Auto Collision — Marcus Chen (CLM-2026-04471)',
    data: {
      claimant: { name: 'Marcus Chen', policyNumber: 'AP-7720-441', claimNumber: 'CLM-2026-04471', email: 'marcus.chen@example.com', phone: '(415) 555-0188' },
      incident: { date: '2026-04-12', location: '4th & Folsom, San Francisco, CA', description: 'Insured vehicle (2023 Toyota Camry SE) was rear-ended at a red light by a 2019 Ford F-150. Police report on file.', claimType: 'auto_collision' },
      damages: [
        { description: 'Rear bumper assembly — replacement', category: 'Vehicle', estimatedCost: 1850 },
        { description: 'Trunk lid — repair and repaint', category: 'Vehicle', estimatedCost: 1240 },
        { description: 'Rear right tail-light housing', category: 'Vehicle', estimatedCost: 380 },
        { description: 'Initial chiropractic visit', category: 'Medical', estimatedCost: 285 },
      ],
      estimatedTotalUSD: 3755,
      recommendedPayoutUSD: 3255,
      riskFlags: [
        { severity: 'low', label: 'Delayed injury report', rationale: 'Insured reported neck stiffness 36 hours after incident.' },
      ],
      summary: 'Rear-end collision at low speed. Damage concentrated at rear of vehicle. Police report supports insured\'s account; at-fault carrier accepting liability.',
      nextSteps: ['Confirm soft-tissue injury via follow-up records', 'Obtain final body-shop invoice'],
    },
  },
  {
    title: 'Water Damage — Priya Sharma',
    data: {
      claimant: { name: 'Priya Sharma', policyNumber: 'HP-3320-118', claimNumber: 'CLM-2026-04488', email: 'priya.sharma@example.com', phone: '(206) 555-0143' },
      incident: { date: '2026-04-08', location: '1248 Maple Ave, Seattle, WA', description: 'Burst supply line under master-bath sink overnight.', claimType: 'water_damage' },
      damages: [
        { description: 'Hardwood flooring (380 sq ft)', category: 'Structure', estimatedCost: 5200 },
        { description: 'Drywall removal & replacement', category: 'Structure', estimatedCost: 1800 },
        { description: 'Mold remediation', category: 'Structure', estimatedCost: 2400 },
        { description: 'Water extraction & dehumidification', category: 'Structure', estimatedCost: 1650 },
        { description: 'Persian rug', category: 'Contents', estimatedCost: 1450 },
      ],
      estimatedTotalUSD: 12500,
      recommendedPayoutUSD: 12000,
      riskFlags: [
        { severity: 'medium', label: 'No prior maintenance record', rationale: 'Supply line ~14 yrs old; document for future replacement-vs-repair.' },
      ],
      summary: 'Sudden water loss caused by failed supply line. Mitigation began within 24 hours per IICRC S520.',
      nextSteps: ['Verify mitigation invoices', 'Schedule on-site inspection'],
    },
  },
  {
    title: 'Burglary — David Okonkwo',
    data: {
      claimant: { name: 'David Okonkwo', policyNumber: 'HP-9911-002', claimNumber: 'CLM-2026-04501', email: 'd.okonkwo@example.com' },
      incident: { date: '2026-04-15', location: '88 Beacon St, Boston, MA', description: 'Overnight burglary; rear basement window forced open.', claimType: 'theft_burglary' },
      damages: [
        { description: 'Basement window & frame repair', category: 'Structure', estimatedCost: 480 },
        { description: 'MacBook Pro 16"', category: 'Contents', estimatedCost: 2900 },
        { description: 'Sony A7 IV camera + lenses', category: 'Contents', estimatedCost: 4200 },
        { description: 'Wedding ring (scheduled item)', category: 'Contents', estimatedCost: 6500 },
      ],
      estimatedTotalUSD: 14080,
      recommendedPayoutUSD: 13580,
      riskFlags: [
        { severity: 'medium', label: 'High-value scheduled item', rationale: 'Verify wedding ring appraisal is current.' },
      ],
      summary: 'Forced-entry burglary through basement window. Items consistent with police report; receipts on file.',
      nextSteps: ['Verify scheduled appraisal', 'Confirm electronics serial numbers'],
    },
  },
];

async function run() {
  // Create each demo user and seed the same set of reports under each one's uid
  for (const u of DEMO_USERS) {
    const user = await ensureUser(u.email);
    console.log(`\n✓ Demo user: ${user.email}`);
    for (const [i, r] of sampleReports.entries()) {
      const id = `seed_${user.uid.slice(0, 6)}_${i}`;
      await setDoc(doc(db, 'reports', id), {
        id,
        ownerId: user.uid,
        title: r.title,
        status: 'ready',
        files: [
          { name: 'claim_form.pdf', size: 248_000, contentType: 'application/pdf', storagePath: `users/${user.uid}/seed/${id}/claim_form.pdf` },
          { name: 'damage_photo_1.jpg', size: 1_240_000, contentType: 'image/jpeg', storagePath: `users/${user.uid}/seed/${id}/damage_photo_1.jpg` },
        ],
        data: r.data,
        modelUsed: 'seed',
        fixtureMode: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  ✓ Seeded: ${r.title}`);
    }
  }
  console.log('\nDone. Sign in at http://localhost:5173 with any demo account:');
  for (const u of DEMO_USERS) console.log(`  ${u.email} / ${PASSWORD}`);
  console.log('');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
