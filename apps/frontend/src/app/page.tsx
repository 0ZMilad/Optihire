import { AnnouncementBanner } from "@/components/announcement-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 xl:px-12 pt-4">
          <div className="flex w-full max-w-[1600px] flex-col gap-2 sm:gap-3 lg:gap-4">
            <HeroSection />
          </div>
        </div>
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
