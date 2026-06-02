import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | OptiHire",
  description: "How OptiHire collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
          <p>
            OptiHire ("we", "our", or "us") is committed to protecting your
            personal information. This Privacy Policy explains what data we
            collect, why we collect it, and how we use it when you use our
            resume analysis and job-matching service.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name,
            email address, and the resume documents you upload. We also collect
            usage data (pages visited, features used) to improve our service.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use your information to provide, personalise, and improve
            OptiHire — including analysing your resume with AI, matching you to
            relevant jobs, and sending you service-related communications.
          </p>

          <h2>3. Data Retention</h2>
          <p>
            Your uploaded resumes and analysis results are retained for as long
            as your account is active. You may request deletion at any time via
            your account settings or by contacting us.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We use third-party services (such as Supabase for authentication and
            storage) that have their own privacy policies. We do not sell your
            personal data to advertisers.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            Depending on your jurisdiction you may have rights to access,
            correct, or erase your personal data. To exercise these rights,
            contact us at{" "}
            <a
              href="mailto:privacy@optihire.app"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              privacy@optihire.app
            </a>
            .
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Continued use of
            OptiHire after changes are posted constitutes your acceptance of the
            revised policy.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions about this policy? Reach us at{" "}
            <a
              href="mailto:privacy@optihire.app"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              privacy@optihire.app
            </a>
            .
          </p>
        </div>

        <div className="mt-12 border-t pt-6 flex gap-4 text-sm text-muted-foreground">
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
