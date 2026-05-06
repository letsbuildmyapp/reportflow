// Realistic synthetic data so the demo runs without an ANTHROPIC_API_KEY.
export function extractedReportFixture(title: string) {
  const seed = hash(title);
  const variants = [
    {
      claimant: { name: 'Marcus Chen', policyNumber: 'AP-7720-441', claimNumber: 'CLM-2026-04471', email: 'marcus.chen@example.com', phone: '(415) 555-0188' },
      incident: { date: '2026-04-12', location: '4th & Folsom, San Francisco, CA', description: 'Insured vehicle (2023 Toyota Camry SE) was rear-ended at a red light by a 2019 Ford F-150. Insured was stationary; police report on file (#SF26-04-1922). No injuries reported on scene; insured later reported neck stiffness.', claimType: 'auto_collision' },
      damages: [
        { description: 'Rear bumper assembly — replacement', category: 'Vehicle', estimatedCost: 1850, notes: 'OEM part recommended' },
        { description: 'Trunk lid — repair and repaint', category: 'Vehicle', estimatedCost: 1240 },
        { description: 'Rear right tail-light housing', category: 'Vehicle', estimatedCost: 380 },
        { description: 'Diagnostic / alignment', category: 'Vehicle', estimatedCost: 220 },
        { description: 'Initial chiropractic visit', category: 'Medical', estimatedCost: 285, notes: 'Soft-tissue eval' },
      ],
      estimatedTotalUSD: 0,
      recommendedPayoutUSD: 3475,
      riskFlags: [
        { severity: 'low', label: 'Delayed injury report', rationale: 'No injury noted on scene; insured reported neck stiffness 36 hours later. Standard for soft-tissue but should be confirmed with medical records.' },
      ],
      summary: 'Rear-end collision at low speed; insured was stationary at a signal. Damage concentrated at rear of vehicle (bumper, trunk, tail-light). Police report supports insured\'s account, and the at-fault party\'s insurer has accepted liability per attached correspondence. Recommended payout of $3,475 reflects total estimated damages minus the standard $500 deductible.',
      nextSteps: [
        'Confirm soft-tissue injury via follow-up medical records',
        'Obtain final body-shop invoice before disbursement',
        'Verify subrogation with at-fault party\'s carrier (State Farm)',
      ],
    },
    {
      claimant: { name: 'Priya Sharma', policyNumber: 'HP-3320-118', claimNumber: 'CLM-2026-04488', email: 'priya.sharma@example.com', phone: '(206) 555-0143' },
      incident: { date: '2026-04-08', location: '1248 Maple Ave, Seattle, WA 98103', description: 'Burst supply line under master-bath sink overnight. Water reached approximately 380 sq ft of upstairs flooring and migrated to ceiling/walls of dining room below. Insured reported the loss within 6 hours of discovery.', claimType: 'water_damage' },
      damages: [
        { description: 'Hardwood flooring (380 sq ft) — replace', category: 'Structure', estimatedCost: 5200 },
        { description: 'Drywall removal & replacement (dining ceiling)', category: 'Structure', estimatedCost: 1800 },
        { description: 'Mold remediation', category: 'Structure', estimatedCost: 2400, notes: 'Per IICRC S520' },
        { description: 'Water extraction & dehumidification (5 days)', category: 'Structure', estimatedCost: 1650 },
        { description: 'Dining table set (water damage)', category: 'Contents', estimatedCost: 1100 },
        { description: 'Persian rug (cleaning attempt failed)', category: 'Contents', estimatedCost: 1450 },
      ],
      estimatedTotalUSD: 0,
      recommendedPayoutUSD: 13100,
      riskFlags: [
        { severity: 'medium', label: 'No prior maintenance record', rationale: 'Supply line appears original (~14 yrs). Recommend documenting age in case of future replacement-vs-repair dispute.' },
      ],
      summary: 'Sudden water loss caused by failed supply line. Damage is consistent with the reported timeline and contained to one floor and the room below. Mitigation work began within 24 hours and follows IICRC S520 standards. Total damages of $13,600 less $500 deductible yields recommended payout of $13,100.',
      nextSteps: [
        'Verify mitigation invoices against IICRC documentation',
        'Schedule on-site adjuster inspection within 5 business days',
        'Confirm replacement-cost values for hardwood and contents',
      ],
    },
    {
      claimant: { name: 'David Okonkwo', policyNumber: 'HP-9911-002', claimNumber: 'CLM-2026-04501', email: 'd.okonkwo@example.com' },
      incident: { date: '2026-04-15', location: '88 Beacon St, Boston, MA 02108', description: 'Overnight burglary; rear basement window forced open. Items reported missing primarily electronics and jewelry. Boston PD report #BPD-26-0488 filed.', claimType: 'theft_burglary' },
      damages: [
        { description: 'Basement window & frame repair', category: 'Structure', estimatedCost: 480 },
        { description: 'MacBook Pro 16" M3', category: 'Contents', estimatedCost: 2900 },
        { description: 'Sony A7 IV camera + 2 lenses', category: 'Contents', estimatedCost: 4200 },
        { description: 'Jewelry — wedding ring (appraisal on file)', category: 'Contents', estimatedCost: 6500, notes: 'Scheduled item; sub-limit applies' },
        { description: 'Cash (per police report)', category: 'Contents', estimatedCost: 800 },
      ],
      estimatedTotalUSD: 0,
      recommendedPayoutUSD: 14380,
      riskFlags: [
        { severity: 'medium', label: 'High-value scheduled item', rationale: 'Wedding ring is a scheduled item; verify current appraisal and photo on file before payout.' },
        { severity: 'low', label: 'Cash claim', rationale: 'Standard policy limit on cash is typically $500–1000; confirm coverage limit applies.' },
      ],
      summary: 'Forced-entry burglary through basement window. Items claimed are consistent with police report and insured has provided receipts and serial numbers for all electronics. Wedding ring is a scheduled item with appraisal on file. Recommended payout of $14,380 reflects covered losses minus deductible and applicable cash sub-limit.',
      nextSteps: [
        'Verify scheduled wedding ring appraisal is within 24 months',
        'Apply cash sub-limit ($1,000) per policy',
        'Request serial numbers for electronics and confirm against police report',
      ],
    },
  ];

  const v = variants[seed % variants.length];
  v.estimatedTotalUSD = v.damages.reduce((s, d) => s + d.estimatedCost, 0);
  return v;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
