export type ReportStatus = 'queued' | 'processing' | 'ready' | 'error';

export type ClaimType =
  | 'auto_collision'
  | 'property_damage'
  | 'water_damage'
  | 'theft_burglary'
  | 'fire'
  | 'other';

export interface ClaimantInfo {
  name: string;
  policyNumber: string;
  claimNumber: string;
  email?: string;
  phone?: string;
}

export interface IncidentInfo {
  date: string; // ISO
  location: string;
  description: string;
  claimType: ClaimType;
}

export interface DamageItem {
  description: string;
  category: string;
  estimatedCost: number;
  notes?: string;
}

export interface RiskFlag {
  severity: 'low' | 'medium' | 'high';
  label: string;
  rationale: string;
}

export interface ExtractedReport {
  claimant: ClaimantInfo;
  incident: IncidentInfo;
  damages: DamageItem[];
  estimatedTotalUSD: number;
  recommendedPayoutUSD: number;
  riskFlags: RiskFlag[];
  summary: string; // narrative
  nextSteps: string[];
}

export interface UploadedFile {
  name: string;
  size: number;
  contentType: string;
  storagePath: string;
  downloadURL?: string;
}

export interface Report {
  id: string;
  ownerId: string;
  title: string;
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;
  files: UploadedFile[];
  data?: ExtractedReport;
  error?: string;
  pdfPath?: string;
  pdfURL?: string;
  modelUsed?: string;
  fixtureMode?: boolean;
}
