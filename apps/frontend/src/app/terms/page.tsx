import Link from "next/link";

export const metadata = {
  title: "Terms of Service | OptiHire",
  description: "The terms that govern your use of the OptiHire platform.",
};

export default function TermsOfServicePage() {
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

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
          <p>
            By accessing or using OptiHire ("the Service"), you agree to be bound by these Terms of
            Service. If you do not agree, please do not use the Service.
          </p>

          <h2>1. Use of the Service</h2>
          <p>
            OptiHire is provided for personal, non-commercial use to help individuals improve their
            resumes and discover job opportunities. You must not use the Service for any unlawful
            purpose or in violation of these Terms.
          </p>

          <h2>2. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. Notify us immediately of any
            unauthorised use.
          </p>

          <h2>3. Uploaded Content</h2>
          <p>
            You retain ownership of any resumes or documents you upload. By uploading content, you
            grant OptiHire a limited licence to process that content solely to provide the Service
            to you.
          </p>

          <h2>4. AI-Generated Suggestions</h2>
          <p>
            Suggestions provided by our AI tools are for informational purposes only. OptiHire does
            not guarantee employment outcomes and accepts no liability for decisions made based on
            AI-generated content.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All software, design, and content comprising the OptiHire platform (excluding your
            uploaded content) is owned by OptiHire and protected by applicable intellectual
            property laws.
          </p>

          <h2>6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time for
            violations of these Terms or for any other reason at our discretion.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, OptiHire shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We may revise these Terms at any time. Continued use of the Service after revisions are
            posted constitutes your acceptance of the updated Terms.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <a
              href="mailto:legal@optihire.app"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              legal@optihire.app
            </a>
            .
          </p>
        </div>

        <div className="mt-12 border-t pt-6 flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
