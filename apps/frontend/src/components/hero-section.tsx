import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, User } from "lucide-react";

const partnerLogos = [
  { name: "Microsoft", src: "/microsoft.jpg", width: 160, height: 40 },
  { name: "Google", src: "/google.jpg", width: 160, height: 40 },
  { name: "jpmorgan", src: "/jpmorgan.jpg", width: 180, height: 60 },
  { name: "NatWest", src: "/natwest.jpg", width: 140, height: 36 },
];

export function HeroSection() {
  return (
    <section className="relative container mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-12 pb-12 sm:pb-20 lg:pt-20 lg:pb-28">
      <div className="grid items-center gap-8 md:gap-12 lg:gap-8 xl:gap-12 lg:grid-cols-[1fr_1fr]">
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
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:opacity-100 transition-all duration-500">
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
          
          <Card className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-6 pb-14 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
            
            {/* Header: User Identity */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
               <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="h-4 w-4 text-gray-500" />
               </div>
               <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">John's Resume</p>
                  <p className="text-xs text-muted-foreground">Last updated 2m ago</p>
               </div>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
                  Top 5%
               </Badge>
            </div>

            {/* Main Content: Score & Match */}
            <div className="grid grid-cols-[auto_1fr] gap-6 items-center mb-6">
               {/* Radial Score */}
               <div className="flex flex-col items-center gap-2">
                  <div className="relative h-24 w-24">
                     <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                        <circle className="text-[#27AE60]" strokeWidth="8" strokeDasharray="263.89" strokeDashoffset="34.3" strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">87</span>
                        <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded-full">Good</span>
                     </div>
                  </div>
               </div>

               {/* Match Info */}
               <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Job Match</p>
                  <div className="flex items-center gap-2">
                     <span className="text-2xl font-bold text-gray-900">92% Match</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Senior Product Designer at</span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#635BFF]" />
                      Stripe
                    </div>
                  </div>
               </div>
            </div>

            {/* Action Items List */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
               <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-[#FFFCFB] border-l-4 border-l-[#C0392B]">
                  <div className="flex items-start gap-3">
                     <AlertTriangle className="h-4 w-4 text-[#C0392B] mt-0.5 shrink-0" />
                     <span className="text-sm font-medium text-gray-900">Missing keywords: "Agile", "SQL"</span>
                  </div>
                  <button className="text-xs font-semibold text-[#C0392B] bg-transparent border border-[#C0392B] px-3 py-1.5 rounded-md hover:bg-[#C0392B]/5 transition-colors">Fix</button>
               </div>
               
               <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-[#FFFCFB] border-l-4 border-l-[#C0392B]">
                  <div className="flex items-start gap-3">
                     <AlertTriangle className="h-4 w-4 text-[#C0392B] mt-0.5 shrink-0" />
                     <span className="text-sm font-medium text-gray-900">Leadership phrasing is weak</span>
                  </div>
                  <button className="text-xs font-semibold text-[#C0392B] bg-transparent border border-[#C0392B] px-3 py-1.5 rounded-md hover:bg-[#C0392B]/5 transition-colors">Fix</button>
               </div>

               <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-[#F7FCF9] border-l-4 border-l-[#27AE60]">
                  <div className="flex items-start gap-3">
                     <Check className="h-4 w-4 text-[#27AE60] mt-0.5 shrink-0" />
                     <span className="text-sm font-medium text-gray-900">Education matches requirements</span>
                  </div>
               </div>
            </div>

          </Card>

          {/* Floating Testimonial (Outside Card) */}
          <div className="absolute -right-2 -bottom-2 max-w-[260px] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 hidden sm:block">
             <div className="relative rounded-xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100">
                <p className="text-xs text-gray-600 italic leading-relaxed mb-2">
                   "Optihire helped me land 3 interviews in a week!"
                </p>
                <div className="flex items-center gap-2">
                   <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent opacity-80" />
                   <p className="text-[10px] font-semibold text-gray-900">
                      Maya Edwards <span className="text-muted-foreground font-normal">· PM</span>
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="h-12 w-[1px] bg-gradient-to-b from-gray-300 to-transparent"></div>
      </div>
    </section>
  );
}
