import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { Timings } from "@/components/Timings"
import { About } from "@/components/About"
import { Services } from "@/components/Services"
import { Gallery } from "@/components/Gallery"
import { Notifications } from "@/components/Notifications"
import { Donation } from "@/components/Donation"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Timings />
      <About />
      <Services />
      <Gallery />
      <Donation />
      <Notifications />
      <Footer />
    </main>
  );
}
