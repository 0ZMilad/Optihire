import { FileText, Target, BarChart3, ShieldCheck } from "lucide-react";

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
  {
    name: "Privacy First",
    description:
      "Your data is yours. We never share your personal information with third parties without your explicit consent.",
    icon: ShieldCheck,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-xl lg:order-1">
            <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>
            <div className="p-6 space-y-4 mt-12 bg-gray-50/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-50 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          <div className="flex flex-col justify-center lg:order-2">
            <div className="text-left">
              <h2 className="text-base font-semibold leading-7 text-brand-primary">
                Everything you need
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Supercharge your job search
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                OptiHire gives you the tools to stand out in a crowded job market.
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
