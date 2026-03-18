import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import SpotsBoard from '@/components/SpotsBoard'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <StatsBar />
      <SpotsBoard />
      <Footer />
    </main>
  )
}
