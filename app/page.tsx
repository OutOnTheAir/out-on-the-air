import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import SpotsBoard from '@/components/SpotsBoard'
import WhyOOTA from '@/components/WhyOOTA'
import TaglineStrip from '@/components/TaglineStrip'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <StatsBar />
      <SpotsBoard />
      <WhyOOTA />
      <TaglineStrip />
      <Footer />
    </main>
  )
}
