import { AnnouncementBanner } from "@/components/announcement-banner";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <AnnouncementBanner />
      <HeroSection />
    </div>
  );
}
