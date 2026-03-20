import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  const section = (title: string) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--amber)',
    marginBottom: '0.75rem',
    marginTop: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  })

  const body = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    lineHeight: 1.9,
    color: 'var(--text-dim)',
    marginBottom: '0rem',
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 5rem', maxWidth: '720px', margin: '0 auto' }}>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Privacy Policy
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Your data.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Plain and simple.</em>
        </h1>

        <p style={{ ...body, marginTop: '1.5rem' }}>
          Out On The Air ("OOTA") is a free, non-commercial platform for amateur radio operators. This policy explains what data we collect, how we use it, and what rights you have. Last updated: March 2026.
        </p>

        {/* What we collect */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          What we collect
        </p>
        <p style={body}>
          When you register, we collect your <strong style={{ color: 'var(--text)' }}>email address</strong> and <strong style={{ color: 'var(--text)' }}>FCC callsign</strong>. When you log activations, we store your <strong style={{ color: 'var(--text)' }}>QSO records</strong> including date, band, mode, frequency, and contact callsigns. When you post a spot, we store your callsign, frequency, mode, and location description. We do not collect your real name, address, or payment information.
        </p>

        {/* How we use it */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          How we use it
        </p>
        <p style={body}>
          Your data is used solely to operate OOTA — displaying the public log, leaderboard, spots board, awards, and operator profiles. Your callsign and activation log are publicly visible as part of the platform. Your email address is never displayed publicly and is used only for account authentication and password resets.
        </p>

        {/* What we don't do */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          What we don't do
        </p>
        <p style={body}>
          We do not sell, rent, or share your data with third parties. We do not serve advertising. We do not use your data for any purpose outside of running this platform. We do not use tracking pixels, fingerprinting, or behavioral analytics.
        </p>

        {/* Data storage */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          Data storage
        </p>
        <p style={body}>
          OOTA is built on <strong style={{ color: 'var(--text)' }}>Supabase</strong>, a managed database platform hosted on AWS infrastructure. Your data is stored securely with row-level security enforced — only you can modify your own records. Supabase's privacy policy is available at supabase.com/privacy.
        </p>

        {/* Your rights */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          Your rights
        </p>
        <p style={body}>
          You may request a copy of your data, correction of inaccurate data, or deletion of your account and all associated records at any time. To make a request, email us at{' '}
          <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none' }}>
            outontheair@outlook.com
          </a>
          . We will respond within 30 days.
        </p>

        {/* Cookies */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          Cookies
        </p>
        <p style={body}>
          OOTA uses a session cookie to keep you signed in. No third-party cookies are set. No advertising cookies are used.
        </p>

        {/* Changes */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          Changes to this policy
        </p>
        <p style={body}>
          If we make material changes to this policy, we will update the date at the top of this page. Continued use of OOTA after changes constitutes acceptance of the updated policy.
        </p>

        {/* Contact */}
        <p style={section('')}>
          <span style={{ display: 'inline-block', width: '1.5rem', height: '0.5px', background: 'var(--amber)' }} />
          Contact
        </p>
        <p style={body}>
          Questions about this policy? Email{' '}
          <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none' }}>
            outontheair@outlook.com
          </a>.
        </p>

      </section>

      <Footer />
    </main>
  )
}
