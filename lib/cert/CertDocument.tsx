// ============================================================
// lib/cert/CertDocument.tsx
// PDF cert using @react-pdf/renderer
// Three styles: dark, modern, retro
// ============================================================

import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'
import { type CertStyleKey } from './certStyles'
import { type EvaluatedAward } from '@/lib/awards'

// ============================================================
// STYLE SHEETS
// ============================================================

const darkStyles = StyleSheet.create({
  page: {
    backgroundColor: '#1a0e06',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  outerBorder: {
    border: '1.5pt solid #8a6a3a',
    padding: 28,
    flex: 1,
    backgroundColor: '#130a04',
  },
  innerBorder: {
    border: '0.5pt solid #5a4020',
    padding: 24,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRule: {
    borderTop: '0.5pt solid #8a6a3a',
    width: 60,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 7,
    letterSpacing: 4,
    color: '#8a6a3a',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#e8d5a3',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  awardedLabel: {
    fontSize: 7,
    letterSpacing: 3,
    color: '#8a6a3a',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 6,
  },
  callsign: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#c9a84c',
    letterSpacing: 2,
    marginBottom: 4,
  },
  divider: {
    borderTop: '0.5pt solid #5a4020',
    width: '80%',
    marginTop: 20,
    marginBottom: 16,
  },
  description: {
    fontSize: 9,
    color: '#8a9a7a',
    textAlign: 'center',
    lineHeight: 1.6,
    fontStyle: 'italic',
    maxWidth: 320,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 28,
  },
  footerText: {
    fontSize: 7,
    color: '#5a4a2a',
  },
  gem: {
    fontSize: 10,
    color: '#8a6a3a',
    letterSpacing: 6,
  },
})

const modernStyles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  topBar: {
    height: 4,
    backgroundColor: '#4a3aff',
    marginBottom: 32,
    borderRadius: 2,
  },
  eyebrow: {
    fontSize: 7,
    letterSpacing: 4,
    color: '#4a3aff',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 8,
  },
  awardedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  callsignPill: {
    backgroundColor: '#eeeeff',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  callsign: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2a1acc',
    letterSpacing: 1,
  },
  awardedLabel: {
    fontSize: 9,
    color: '#888888',
  },
  description: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 1.6,
    maxWidth: 380,
    marginBottom: 40,
  },
  divider: {
    borderTop: '0.5pt solid #eeeeee',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    fontSize: 8,
    color: '#999999',
    lineHeight: 1.5,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4a3aff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
})

const retroStyles = StyleSheet.create({
  page: {
    backgroundColor: '#f5f0e8',
    padding: 36,
    fontFamily: 'Helvetica',
  },
  outerBorder: {
    border: '2pt solid #1a3a5c',
    padding: 20,
    flex: 1,
  },
  innerBorder: {
    border: '0.5pt solid #1a3a5c',
    padding: 20,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  seal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: '1.5pt solid #1a3a5c',
    backgroundColor: '#e8e0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a5c',
  },
  headerText: {
    flex: 1,
  },
  orgName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: '#1a3a5c',
    textTransform: 'uppercase',
  },
  orgSub: {
    fontSize: 8,
    color: '#4a6a8c',
    marginTop: 2,
  },
  divider: {
    borderTop: '1pt solid #1a3a5c',
    marginVertical: 12,
  },
  thinDivider: {
    borderTop: '0.5pt solid #1a3a5c',
    marginVertical: 10,
  },
  awardTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: '#1a3a5c',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  awardedLabel: {
    fontSize: 8,
    color: '#4a6a8c',
    textAlign: 'center',
    marginBottom: 4,
  },
  callsign: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a5c',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  description: {
    fontSize: 8,
    color: '#4a6a8c',
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  sigLine: {
    borderTop: '0.5pt solid #1a3a5c',
    paddingTop: 4,
    fontSize: 7,
    color: '#4a6a8c',
    width: 100,
  },
  certNum: {
    fontSize: 7,
    color: '#4a6a8c',
    fontFamily: 'Helvetica',
    letterSpacing: 1,
  },
})

// ============================================================
// HELPERS
// ============================================================

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function certNumber(userId: string, slug: string) {
  const hash = (userId + slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return `OOTA-${String(hash % 100000).padStart(5, '0')}`
}

// ============================================================
// DARK CERT
// ============================================================

function DarkCert({ award, callsign, earnedDate }: CertProps) {
  const s = darkStyles
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.outerBorder}>
        <View style={s.innerBorder}>
          <View style={s.topRule} />
          <Text style={s.eyebrow}>Out on the Air</Text>
          <Text style={s.title}>{award.award.name}</Text>
          <Text style={s.awardedLabel}>Awarded to</Text>
          <Text style={s.callsign}>{callsign}</Text>
          <View style={s.divider} />
          <Text style={s.description}>{award.award.description}</Text>
          {award.award.threshold && (
            <Text style={[s.description, { marginTop: 6, color: '#c9a84c', fontStyle: 'normal', fontSize: 8 }]}>
              {award.award.threshold}
            </Text>
          )}
          <View style={s.footer}>
            <Text style={s.footerText}>outontheair.com</Text>
            <Text style={s.gem}>✦  ✦  ✦</Text>
            <Text style={s.footerText}>{formatDate(earnedDate)}</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}

// ============================================================
// MODERN CERT
// ============================================================

function ModernCert({ award, callsign, earnedDate, userId }: CertProps) {
  const s = modernStyles
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.topBar} />
      <Text style={s.eyebrow}>Out on the Air — Award Certificate</Text>
      <Text style={s.title}>{award.award.name}</Text>
      <View style={s.awardedRow}>
        <View style={s.callsignPill}>
          <Text style={s.callsign}>{callsign}</Text>
        </View>
        <Text style={s.awardedLabel}>awarded to</Text>
      </View>
      <Text style={s.description}>{award.award.description}</Text>
      <View style={s.divider} />
      <View style={s.footer}>
        <View>
          <Text style={[s.footerLeft, { color: '#333333', fontSize: 9 }]}>outontheair.com</Text>
          <Text style={s.footerLeft}>{formatDate(earnedDate)}</Text>
          <Text style={s.footerLeft}>{certNumber(userId, award.award.slug)}</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>OA</Text>
        </View>
      </View>
    </Page>
  )
}

// ============================================================
// RETRO CERT
// ============================================================

function RetroCert({ award, callsign, earnedDate, userId }: CertProps) {
  const s = retroStyles
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.outerBorder}>
        <View style={s.innerBorder}>
          <View style={s.header}>
            <View style={s.seal}>
              <Text style={s.sealText}>OA</Text>
            </View>
            <View style={s.headerText}>
              <Text style={s.orgName}>Out on the Air</Text>
              <Text style={s.orgSub}>Official Award Certificate</Text>
            </View>
          </View>
          <View style={s.divider} />
          <Text style={s.awardTitle}>{award.award.name}</Text>
          <Text style={s.awardedLabel}>This certifies that</Text>
          <Text style={s.callsign}>{callsign}</Text>
          <Text style={s.description}>
            has satisfactorily demonstrated achievement of{'\n'}
            {award.award.name} — Out on the Air Award Programme
          </Text>
          {award.award.threshold && (
            <Text style={[s.description, { color: '#1a3a5c', fontFamily: 'Helvetica-Bold' }]}>
              {award.award.threshold}
            </Text>
          )}
          <View style={s.thinDivider} />
          <View style={s.footer}>
            <View style={s.sigLine}>
              <Text>OOTA Administration</Text>
            </View>
            <Text style={s.certNum}>{certNumber(userId, award.award.slug)}</Text>
            <View style={[s.sigLine, { textAlign: 'right' }]}>
              <Text>{formatDate(earnedDate)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  )
}

// ============================================================
// MAIN EXPORT
// ============================================================

interface CertProps {
  award: EvaluatedAward
  callsign: string
  earnedDate: Date
  userId: string
  styleKey: CertStyleKey
}

export default function CertDocument(props: CertProps) {
  return (
    <Document
      title={`${props.award.award.name} — ${props.callsign} — OOTA`}
      author="Out on the Air"
      subject="OOTA Award Certificate"
    >
      {props.styleKey === 'dark'   && <DarkCert   {...props} />}
      {props.styleKey === 'modern' && <ModernCert {...props} />}
      {props.styleKey === 'retro'  && <RetroCert  {...props} />}
    </Document>
  )
}
