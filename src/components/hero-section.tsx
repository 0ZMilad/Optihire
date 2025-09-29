import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const partnerLogos = [
  { name: "Vercel", src: "/vercel.svg", width: 96, height: 24 },
  { name: "Next.js", src: "/next.svg", width: 96, height: 24 },
  { name: "Global Talent", src: "/globe.svg", width: 48, height: 48 },
  { name: "WorkSuite", src: "/window.svg", width: 48, height: 48 },
];

export function HeroSection() {
  return (
    <section className="container mx-auto px-6 pt-6 pb-14 lg:pt-12 lg:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className="mx-auto max-w-2xl space-y-8 text-center lg:mx-0 lg:text-left">
          <div className="flex justify-center lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary lg:mr-12">
              Proven by recruiters and powered by AI
            </div>
          </div>

          <h1 className="text-center text-4xl font-semibold leading-[0.95] text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Level up with</span>
            <span className="mt-2 block">
              <span className="font-bold text-slate-600 dark:text-slate-200">
                OptiHire
              </span>
              <span className="ml-4 inline-flex items-center rounded-full border border-white/35 bg-white/20 px-3 py-1 align-middle text-[0.7rem] font-semibold uppercase tracking-[0.5em] text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_16px_36px_-20px_rgba(37,99,235,0.45)] backdrop-blur-xl ring-1 ring-primary/35">
                AI
              </span>
            </span>
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl">
            Diagnose your resume, surface perfect-fit roles, and track every
            application in one place. We combine ATS scoring with human-ready
            recommendations so you can go from search to offer faster.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Upload your resume
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground text-center lg:text-left">
              Trusted by job seekers hired at
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:justify-start">
              {partnerLogos.map((logo) => (
                <Image
                  key={logo.name}
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={logo.width}
                  height={logo.height}
                  className="h-8 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-xl lg:block">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-white/60 p-8 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.65)] backdrop-blur">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Opportunity match
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    92% fit · Stripe
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600">
                  In the top 5%
                </span>
              </div>

              <div className="grid gap-4 rounded-3xl bg-muted/30 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    ATS score
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    87/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[87%] rounded-full bg-primary"></div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Tailor your leadership achievements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/70"></span>
                    Align keywords with the job description
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/50"></span>
                    Highlight quantifiable outcomes
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl bg-primary/10 p-6 text-sm text-primary">
                "OptiHire helped me overhaul my resume in a weekend and land
                three interviews the following week."
                <p className="mt-3 text-xs uppercase tracking-widest text-primary/70">
                  — Maya Edwards · Product Manager
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
