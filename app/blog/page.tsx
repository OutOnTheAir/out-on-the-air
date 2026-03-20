import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function BlogPage() {
  const postsDir = path.join(process.cwd(), 'content/posts')

  let posts: { slug: string; title: string; date: string; summary: string }[] = []

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))
    posts = files
      .map(filename => {
        const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
        const { data } = matter(raw)
        return {
          slug:    filename.replace('.mdx', ''),
          title:   data.title   ?? 'Untitled',
          date:    data.date    ?? '',
          summary: data.summary ?? '',
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Field Notes
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Dispatches from<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>the field.</em>
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.8,
          color: 'var(--text-dim)', marginBottom: '3rem',
        }}>
          Updates, guides, and notes from the OOTA team.
        </p>

        {posts.length === 0 ? (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', opacity: 0.5 }}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0rem' }}>
            {posts.map((post, i) => (
              <a key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '2rem 0',
                  borderBottom: '0.5px solid var(--border-dim)',
                  borderTop: i === 0 ? '0.5px solid var(--border-dim)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--text-muted)', marginBottom: '0.6rem',
                  }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.4rem', fontWeight: 700,
                    color: 'var(--text)', marginBottom: '0.5rem',
                    lineHeight: 1.2,
                  }}>
                    {post.title}
                  </h2>
                  {post.summary && (
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem', lineHeight: 1.8,
                      color: 'var(--text-dim)',
                    }}>
                      {post.summary}
                    </p>
                  )}
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--amber)', marginTop: '0.75rem',
                  }}>
                    Read →
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
