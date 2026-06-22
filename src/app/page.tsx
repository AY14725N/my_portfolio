import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Impact from "@/components/Impact";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MouseSpotlight from "@/components/MouseSpotlight";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <MouseSpotlight />
      <Navbar />
      <Hero />
      <div className="glow-line" />
      <Impact />
      <div className="glow-line" />
      <Skills />
      <div className="glow-line" />
      <Experience />
      <div className="glow-line" />
      <Contact />
      <Footer />
    </main>
  );
}
