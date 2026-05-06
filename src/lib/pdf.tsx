import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ExtractedReport, Report } from '../types';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: 'Helvetica', color: '#1a1a2a' },
  header: { borderBottom: '2 solid #6447D6', paddingBottom: 14, marginBottom: 20 },
  brand: { fontSize: 9, letterSpacing: 2, color: '#6447D6', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  meta: { fontSize: 9, color: '#666' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#6447D6', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 110, color: '#666', fontSize: 10 },
  value: { flex: 1, fontSize: 10 },
  paragraph: { lineHeight: 1.5, fontSize: 10.5, color: '#333' },
  table: { borderTop: '1 solid #ddd', borderLeft: '1 solid #ddd', marginTop: 6 },
  tr: { flexDirection: 'row', borderBottom: '1 solid #ddd' },
  th: { backgroundColor: '#F4F2FB', padding: 6, fontFamily: 'Helvetica-Bold', borderRight: '1 solid #ddd', fontSize: 9 },
  td: { padding: 6, borderRight: '1 solid #ddd', fontSize: 9.5 },
  totals: { marginTop: 10, padding: 10, backgroundColor: '#F4F2FB', borderRadius: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  flag: { padding: 6, marginBottom: 4, borderRadius: 4, borderLeft: '3 solid' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, fontSize: 8, color: '#888', textAlign: 'center', borderTop: '1 solid #eee', paddingTop: 8 },
});

function severityColor(sev: 'low' | 'medium' | 'high') {
  return sev === 'high' ? '#c0392b' : sev === 'medium' ? '#d97706' : '#0e8a4f';
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function ReportPDF({ report, data }: { report: Report; data: ExtractedReport }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>REPORTFLOW · CLAIM REPORT</Text>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.meta}>
            Claim #{data.claimant.claimNumber} · Generated {new Date(report.updatedAt || Date.now()).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claimant</Text>
          <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{data.claimant.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Policy #</Text><Text style={styles.value}>{data.claimant.policyNumber}</Text></View>
          {data.claimant.email && <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{data.claimant.email}</Text></View>}
          {data.claimant.phone && <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{data.claimant.phone}</Text></View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident</Text>
          <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.value}>{data.incident.claimType.replace(/_/g, ' ')}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{data.incident.date}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{data.incident.location}</Text></View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.paragraph}>{data.incident.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Damages</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, { width: '40%' }]}>Description</Text>
              <Text style={[styles.th, { width: '22%' }]}>Category</Text>
              <Text style={[styles.th, { width: '18%', textAlign: 'right' }]}>Estimate</Text>
              <Text style={[styles.th, { width: '20%' }]}>Notes</Text>
            </View>
            {data.damages.map((d, i) => (
              <View style={styles.tr} key={i}>
                <Text style={[styles.td, { width: '40%' }]}>{d.description}</Text>
                <Text style={[styles.td, { width: '22%' }]}>{d.category}</Text>
                <Text style={[styles.td, { width: '18%', textAlign: 'right' }]}>{fmtUSD(d.estimatedCost)}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{d.notes ?? '—'}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Estimated Total Damages</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fmtUSD(data.estimatedTotalUSD)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Recommended Payout</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#6447D6' }}>{fmtUSD(data.recommendedPayoutUSD)}</Text>
            </View>
          </View>
        </View>

        {data.riskFlags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Flags</Text>
            {data.riskFlags.map((f, i) => (
              <View key={i} style={[styles.flag, { borderLeftColor: severityColor(f.severity), backgroundColor: '#faf8ff' }]}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>
                  [{f.severity.toUpperCase()}] {f.label}
                </Text>
                <Text style={{ fontSize: 9.5, color: '#444', marginTop: 2 }}>{f.rationale}</Text>
              </View>
            ))}
          </View>
        )}

        {data.nextSteps?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
            {data.nextSteps.map((s, i) => (
              <View style={styles.bullet} key={i}>
                <Text style={{ width: 14 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 10 }}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generated by ReportFlow · AI-assisted draft. Reviewed and edited by claim adjuster prior to issue. · Page 1
        </Text>
      </Page>
    </Document>
  );
}

export async function generatePDFBlob(report: Report, data: ExtractedReport): Promise<Blob> {
  const blob = await pdf(<ReportPDF report={report} data={data} />).toBlob();
  return blob;
}
