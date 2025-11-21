import { FileText, Target, BarChart3, Lock } from "lucide-react";
import Image from "next/image";

const features = [
  {
    name: "AI Resume Analysis",
    description:
      "Get instant, detailed feedback on your resume. Our AI analyses formatting, keywords, and content to ensure you pass ATS filters.",
    icon: FileText,
  },
  {
    name: "Smart Job Matching",
    description:
      "Stop searching endlessly. We match your skills and experience with the perfect job opportunities across thousands of listings.",
    icon: Target,
  },
  {
    name: "Application Tracking",
    description:
      "Keep your job search organised. Track every application status, interview date, and offer in one intuitive dashboard.",
    icon: BarChart3,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 lg:order-1 lg:sticky lg:top-[100px] lg:self-start">
            <div className="relative w-full aspect-[4/3] lg:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="absolute top-12 left-0 right-0 bottom-0 bg-gray-50">
                <Image
                  src="/Optihire 4K.png"
                  alt="OptiHire Dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#F0F0F0] p-8">
              <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100">
                <div className="text-center px-2">
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    10k<span className="text-[#FF6B6B]">+</span>
                  </div>
                  <div className="text-sm font-medium text-[#666666] uppercase tracking-wide mt-1">
                    Resumes Optimised
                  </div>
                </div>
                <div className="text-center px-2">
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    500<span className="text-[#FF6B6B]">+</span>
                  </div>
                  <div className="text-sm font-medium text-[#666666] uppercase tracking-wide mt-1">
                    Companies Hiring
                  </div>
                </div>
                <div className="text-center px-2">
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    3<span className="text-[#FF6B6B]">x</span>
                  </div>
                  <div className="text-sm font-medium text-[#666666] uppercase tracking-wide mt-1">
                    Faster Interviews
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#F3F4F6] p-2.5 rounded-full shrink-0">
                  <Lock className="w-5 h-5 text-[#374151]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1A1A1A]">Privacy First</div>
                  <div className="text-xs text-[#666666]">Your data is yours. 256-bit Encryption.</div>
                </div>
              </div>
              <div className="bg-[#EAFBF1] text-[#27AE60] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                AES-256
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5 lg:order-2">
            <div className="text-left">
              <h2 className="text-base font-semibold leading-7 text-brand-primary">
                Everything you need
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Supercharge your job search
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Optihire gives you the tools to stand out in a crowded job market.
                From resume optimisation to application tracking, we've got you covered.
              </p>
            </div>

            <div className="mt-10 space-y-8">
              {features.map((feature) => (
                <div key={feature.name} className="relative flex gap-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <feature.icon
                      className="h-6 w-6 text-brand-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      {feature.name}
                    </dt>
                    <dd className="text-base leading-7 text-gray-600">
                      {feature.description}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
