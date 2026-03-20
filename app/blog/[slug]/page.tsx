import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'content/posts')
  if (!fs.existsSync(postsDir)) return []
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))
  return files.map(f => ({ slug: f.replace('.mdx', '') }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) notFound()

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <article style={{ padding: '5rem 2rem 5rem', maxWidth: '720px', margin: '0 auto' }}>

        {/* Back link */}
        <a href="/blog" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-muted)', textDecoration: 'none',
          display: 'inline-block', marginBottom: '2.5rem',
        }}>
          ← Field Notes
        </a>

        {/* Date */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          {data.title}
        </h1>

        {/* Summary */}
        {data.summary && (
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem', lineHeight: 1.8,
            color: 'var(--text-dim)', marginBottom: '3rem',
            borderBottom: '0.5px solid var(--border-dim)', paddingBottom: '2rem',
          }}>
            {data.summary}
          </p>
        )}

        {/* Body */}
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.05rem',
          fontWeight: 300,
          lineHeight: 1.85,
          color: 'var(--text)',
        }}
          className="prose-oota"
        >
          <MDXRemote source={content} />
        </div>

        {/* Footer nav */}
        <div style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '0.5px solid var(--border-dim)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <a href="/blog" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-dim)', textDecoration: 'none',
          }}>
            ← All Posts
          </a>
          <a href="/" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--amber)', textDecoration: 'none',
          }}>
            outontheair.com →
          </a>
        </div>

      </article>

      <Footer />
    </main>
  )
}
