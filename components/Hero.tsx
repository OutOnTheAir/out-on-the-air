export default function Hero() {
  return (
    <section style={{
      minHeight: '88vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(232,168,66,0.07) 0%, transparent 70%)',
      }} />

      <div className="fade-up" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem', fontWeight: 500,
        letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'var(--amber-dim)', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <span style={{ display: 'block', width: '2rem', height: '0.5px', background: 'var(--amber-dim)' }} />
        Amateur Radio Activation Program
        <span style={{ display: 'block', width: '2rem', height: '0.5px', background: 'var(--amber-dim)' }} />
      </div>

      <h1 className="fade-up fade-up-delay-1" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 600, lineHeight: 1.05,
        color: 'var(--text)', marginBottom: '0.5rem',
      }}>
        Leave the shack.<br />
        <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--amber)' }}>Find the world.</em>
      </h1>

      <p className="fade-up fade-up-delay-2" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
        fontStyle: 'italic', fontWeight: 400,
        color: 'var(--text-dim)', marginBottom: '2.5rem',
      }}>
        Any location. Any antenna. Any power.
      </p>

      <div className="fade-up fade-up-delay-3" style={{
        fontSize: '0.9rem', fontWeight: 300,
        color: 'var(--text-dim)', maxWidth: '500px',
        lineHeight: 1.8, marginBottom: '3rem',
        padding: '1.25rem 1.5rem',
        borderLeft: '2px solid var(--amber)',
        textAlign: 'left',
      }}>
        <em style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>
          "The soul of OOTA is human-to-human connection through skill and radio craft."
        </em>
        <br /><br />
        Voice or CW. 160 through 6 meters. One QSO is all it takes.
        A parking lot counts. A rooftop counts. A beach at midnight counts.
        If you left home and you're on the air — you're Out On The Air.
      </div>

      <div className="fade-up fade-up-delay-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/register" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'var(--amber)', color: 'var(--bg)',
          border: 'none', padding: '0.9rem 2rem',
          textDecoration: 'none', display: 'inline-block',
        }}>
          Create Account
        </a>
        <a href="#spots" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-dim)',
          border: '0.5px solid var(--border-dim)', padding: '0.9rem 2rem',
          textDecoration: 'none', display: 'inline-block',
        }}>
          View Live Spots
        </a>
      </div>
    </section>
  )
}
