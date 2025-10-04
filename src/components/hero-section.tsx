import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <section className="container mx-auto px-3 sm:px-4 md:px-6 pt-2 sm:pt-4 pb-8 sm:pb-10 lg:pt-6 lg:pb-16">
      <div className="grid items-center gap-8 md:gap-10 lg:gap-12 xl:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8 text-center lg:mx-0 lg:text-left">
          <div className="flex justify-center lg:justify-end">
            <Badge
              variant="outline"
              className="gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary border-transparent lg:mr-35"
            >
              Proven by recruiters and powered by AI
            </Badge>
          </div>

          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight text-balance text-foreground">
            <span className="block">Level up with</span>
            <span className="mt-1 sm:mt-2 block">
              <span className="font-bold text-slate-600 dark:text-slate-200">
                OptiHire
              </span>
              <Badge
                variant="outline"
                className="ml-2 sm:ml-3 md:ml-4 inline-flex items-center rounded-full border border-white/35 bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 align-middle text-[0.5rem] sm:text-[0.6rem] md:text-[0.7rem] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_16px_36px_-20px_rgba(37,99,235,0.45)] backdrop-blur-xl ring-1 ring-primary/35"
              >
                AI
              </Badge>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2 sm:px-0">
            Diagnose your resume, surface perfect-fit roles, and track every
            application in one place. We combine ATS scoring with human-ready
            recommendations so you can go from search to offer faster.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base w-full sm:w-auto"
            >
              Upload your resume
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base w-full"
              >
                View dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-6 sm:pt-8 md:pt-10">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center lg:text-left">
              Trusted by job seekers hired at
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-4 sm:gap-y-6 lg:justify-start">
              {partnerLogos.map((logo) => (
                <Image
                  key={logo.name}
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={logo.width}
                  height={logo.height}
                  className="h-6 sm:h-8 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl hidden md:block">
          <div className="absolute -left-8 sm:-left-12 -top-8 sm:-top-12 h-24 w-24 sm:h-36 sm:w-36 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -bottom-8 sm:-bottom-10 right-0 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-accent/20 blur-3xl"></div>
          <Card className="relative overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[32px] border border-border bg-white/60 p-4 sm:p-6 lg:p-8 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.65)] backdrop-blur scale-90 md:scale-95 lg:scale-100 origin-center gap-4 sm:gap-5 lg:gap-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  Opportunity match
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                  92% fit · Stripe
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-500/10 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-600 whitespace-nowrap border-transparent"
              >
                Top 5%
              </Badge>
            </div>

            <Card className="gap-3 sm:gap-4 rounded-2xl lg:rounded-3xl bg-muted/30 p-4 sm:p-5 lg:p-6 border-transparent shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  ATS score
                </span>
                <span className="text-base sm:text-lg font-semibold text-foreground">
                  87/100
                </span>
              </div>
              <Progress value={87} className="h-2 bg-muted" />

              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary flex-shrink-0"></span>
                  <span className="line-clamp-1">
                    Tailor your leadership achievements
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/70 flex-shrink-0"></span>
                  <span className="line-clamp-1">
                    Align keywords with the job description
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/50 flex-shrink-0"></span>
                  <span className="line-clamp-1">
                    Highlight quantifiable outcomes
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="rounded-2xl lg:rounded-3xl bg-primary/10 p-4 sm:p-5 lg:p-6 text-xs sm:text-sm text-primary border-transparent shadow-none">
              "OptiHire helped me overhaul my resume in a weekend and land three
              interviews the following week."
              <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-primary/70">
                — Maya Edwards · Product Manager
              </p>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  );
}
