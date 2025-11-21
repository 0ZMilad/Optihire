import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const partnerLogos = [
  { name: "Microsoft", src: "/microsoft.jpg", width: 160, height: 40 },
  { name: "Google", src: "/google.jpg", width: 160, height: 40 },
  { name: "jpmorgan", src: "/jpmorgan.jpg", width: 180, height: 60 },
  { name: "NatWest", src: "/natwest.jpg", width: 140, height: 36 },
];

export function HeroSection() {
  return (
    <section className="container mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-12 pb-12 sm:pb-20 lg:pt-20 lg:pb-28 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:40px_40px]">
      <div className="grid items-center gap-8 md:gap-12 lg:gap-16 xl:gap-24 lg:grid-cols-[1fr_1fr]">
        <div className="mx-auto max-w-2xl space-y-8 sm:space-y-10 text-center lg:mx-0 lg:text-left flex flex-col justify-center h-full">
          
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-foreground leading-[1.1]">
              Unlock Your <br className="hidden lg:block" />
              Career Potential.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              AI-powered insights, personalised feedback, and seamless application tracking—all designed to get you the job you deserve.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground font-semibold text-base px-8 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Upload your resume
            </Button>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 rounded-full border border-gray-200 text-black hover:bg-gray-50"
              >
                View dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-4 sm:pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-4">
              Trusted by top companies
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-50 grayscale hover:opacity-100 transition-all duration-500">
              {partnerLogos.map((logo) => (
                <div key={logo.name} className="relative h-6 sm:h-8 w-auto">
                  <Image
                    src={logo.src}
                    alt={`${logo.name} logo`}
                    width={logo.width}
                    height={logo.height}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl hidden md:block lg:-translate-x-6">
          <div className="absolute -left-8 sm:-left-12 -top-8 sm:-top-12 h-24 w-24 sm:h-36 sm:w-36 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -bottom-8 sm:-bottom-10 right-0 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-accent/20 blur-3xl"></div>
          
          <Card className="relative overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[32px] border border-gray-100 bg-white/80 p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Opportunity Match
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground tracking-tight">92%</span>
                  <span className="text-lg font-medium text-muted-foreground">fit · Stripe</span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 px-3 py-1"
              >
                Top 5%
              </Badge>
            </div>

            <div className="space-y-5 rounded-2xl bg-gray-50/80 p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  ATS Score
                </span>
                <span className="text-sm font-bold text-foreground">
                  87/100
                </span>
              </div>
              
              <Progress value={87} className="h-2 bg-gray-200" />

              <ul className="space-y-3">
                {[
                  "Tailor your leadership achievements",
                  "Align keywords with job description",
                  "Highlight quantifiable outcomes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600 italic leading-relaxed">
                "Optihire helped me overhaul my resume in a weekend and land three interviews the following week."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent opacity-80" />
                <p className="text-xs font-semibold text-gray-900">
                  Maya Edwards <span className="text-muted-foreground font-normal">· Product Manager</span>
                </p>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </section>
  );
}
