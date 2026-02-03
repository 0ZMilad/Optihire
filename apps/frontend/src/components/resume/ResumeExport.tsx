"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, FileDown } from "lucide-react";
import type { ResumeData } from "./types";

interface ResumeExportProps {
  resumeData: ResumeData;
  className?: string;
}

export default function ResumeExport({ resumeData, className }: ResumeExportProps) {
  // Build a clean HTML document for export (used by PDF/Word)
  const buildExportHTML = () => {
    const safe = (v: string) => (v || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safe(resumeData.name || "Resume")}</title>
  <style>
    :root { --text: #111; }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--text); margin: 0; padding: 32px; }
    .resume { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 28px; margin: 0 0 4px; }
    .muted { color: #666; margin: 0 0 16px; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }
    h2 { font-size: 16px; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: .04em; }
    p { line-height: 1.6; white-space: pre-wrap; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <main class="resume">
    <h1>${safe(resumeData.name) || "Your Name"}</h1>
    <p class="muted">${safe(resumeData.title) || "Role / Title"}</p>
    <hr />
    <section>
      <p>${safe(resumeData.summary) || "A concise professional summary."}</p>
    </section>
    <section>
      <h2>Experience</h2>
      <p>${safe(resumeData.experience) || "Describe your impact and outcomes."}</p>
    </section>
    <section>
      <h2>Skills</h2>
      <p>${safe(resumeData.skills) || "List core skills"}</p>
    </section>
  </main>
</body>
</html>`;
  };

  const downloadPDF = () => {
    const html = buildExportHTML();
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    // Ensure print after load for reliable rendering
    const onLoad = () => {
      win.focus();
      win.print();
    };
    if (win.document.readyState === "complete") onLoad();
    else win.addEventListener("load", onLoad, { once: true } as any);
  };

  const downloadWord = () => {
    const html = buildExportHTML();
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.name || "Resume"}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Button variant="outline" className="flex-1" onClick={downloadPDF}>
        <FileText className="mr-2 size-4" />
        Download PDF
      </Button>
      <Button variant="outline" className="flex-1" onClick={downloadWord}>
        <FileDown className="mr-2 size-4" />
        Download Word
      </Button>
    </div>
  );
}
