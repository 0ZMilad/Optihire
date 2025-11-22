import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BarChart3, FileText, Cpu } from "lucide-react";

const partnerLogos = [
  { name: "Microsoft", src: "/microsoft.jpg", width: 160, height: 40 },
  { name: "Google", src: "/google.jpg", width: 160, height: 40 },
  { name: "jpmorgan", src: "/jpmorgan.jpg", width: 180, height: 60 },
  { name: "NatWest", src: "/natwest.jpg", width: 140, height: 36 },
];

const PartnerLogos = () => (
  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:opacity-100 transition-all duration-500">
    {partnerLogos.map(({ name, src, width, height }) => (
      <div key={name} className="relative h-6 sm:h-8 w-auto">
        <Image
          src={src}
          alt={`${name} logo`}
          width={width}
          height={height}
          className="h-full w-auto object-contain"
        />
      </div>
    ))}
  </div>
);

export function HeroSection() {
  return (
    <section className="relative w-full pt-6 sm:pt-12 pb-12 sm:pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="fixed inset-0 -z-50 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid items-center gap-8 md:gap-12 lg:gap-8 xl:gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="mx-auto max-w-2xl space-y-8 sm:space-y-10 text-center lg:mx-0 lg:text-left flex flex-col justify-center h-full z-10">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-foreground leading-[1.1]">
                Unlock Your <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-600">
                  Career Potential.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                AI-powered insights, personalised feedback, and seamless
                application tracking—all designed to get you the job you
                deserve.
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
              <PartnerLogos />
            </div>
          </div>

          <div className="relative w-full max-w-[500px] h-[500px] mx-auto flex items-center justify-center lg:perspective-[1000px] hidden md:flex">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-3 z-20">
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="h-3 w-[1px] bg-slate-200"></div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                ANALYZING_V2.0
              </span>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-primary/5 rounded-full blur-[80px] animate-pulse"></div>

            <div className="relative w-[320px] h-[440px] bg-white rounded-lg border border-slate-200 shadow-2xl overflow-visible lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0 group">
              <div className="h-24 bg-slate-50/50 border-b border-slate-100 p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <FileText className="text-slate-400 h-6 w-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-3/4 bg-slate-200 rounded-sm"></div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded-sm"></div>
                </div>
              </div>

              <div className="p-6 space-y-5 opacity-100">
                <div className="relative">
                  <div className="flex gap-4 p-2 -m-2 rounded-lg transition-colors duration-500 hover:bg-emerald-50/50">
                    <div className="h-32 w-2 bg-slate-100 rounded-full"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-2 w-full bg-slate-200 rounded-sm"></div>
                      <div className="h-2 w-5/6 bg-emerald-100 rounded-sm"></div>
                      <div className="h-2 w-full bg-slate-200 rounded-sm"></div>
                      <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-md mt-2"></div>
                    </div>
                  </div>
                </div>

                <div className="relative space-y-2 pt-2">
                  <div className="h-2 w-3/4 bg-slate-200 rounded-sm"></div>
                  <div className="h-2 w-1/2 bg-slate-200 rounded-sm"></div>
                </div>
              </div>

              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-lg">
                <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent -translate-y-full animate-scan">
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-primary/30 shadow-[0_0_20px_rgba(255,107,107,0.5)]"></div>
                </div>
              </div>

              <svg className="absolute inset-0 w-[180%] h-[140%] -top-[20%] -left-[40%] pointer-events-none z-0 visible lg:block hidden">
                <path
                  d="M 48 165 L 10 165 L 10 90"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="opacity-60"
                />
                <circle
                  cx="48"
                  cy="165"
                  r="3"
                  fill="#10B981"
                  className="animate-pulse"
                />

                <path
                  d="M 250 340 L 310 340 L 310 380"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="opacity-60"
                />
                <circle
                  cx="250"
                  cy="340"
                  r="3"
                  fill="#6366F1"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <div className="absolute top-20 -left-4 md:-left-20 bg-white/90 backdrop-blur-md border border-emerald-100 p-3 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-float z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-1.5 rounded-md border border-emerald-100 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                    Detected
                  </p>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    "React", "TypeScript"
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 -right-4 md:-right-20 bg-white/90 backdrop-blur-md border border-indigo-100 p-3 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-float-delayed z-10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-1.5 rounded-md border border-indigo-100 shadow-sm">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                    ATS Score
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      87/100
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                      HIGH
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-0">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 ring-4 ring-white">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI Analysis Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
