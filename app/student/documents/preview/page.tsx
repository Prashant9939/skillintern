"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  RefreshCw,
  Info
} from "lucide-react";

const templateTitleMap: Record<string, string> = {
  offer_letter: "Internship Offer Letter",
  receipt: "Payment Receipt",
  attendance_sheet: "Attendance Record",
  marksheet: "Assessment Marksheet",
  project_report: "Internship Report",
  certificate: "Internship Certificate",
};

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const templateType = searchParams.get("templateType");
  const studentId = searchParams.get("studentId");
  const internshipId = searchParams.get("internshipId");

  const [pdfStatus, setPdfStatus] = useState<"generating" | "ready" | "failed">("generating");
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const documentName = templateType ? (templateTitleMap[templateType] || templateType.replace(/_/g, ' ')) : "Document";
  
  // Endpoints
  const htmlPreviewUrl = `/api/documents/download?templateType=${templateType}&studentId=${studentId}&internshipId=${internshipId}&format=html`;
  const pdfDownloadUrl = `/api/documents/download?templateType=${templateType}&studentId=${studentId}&internshipId=${internshipId}&format=pdf&disposition=attachment`;

  // Start background generation
  const startBackgroundGeneration = async () => {
    if (!templateType || !studentId || !internshipId) {
      return;
    }
    
    setPdfStatus("generating");
    setPdfError(null);
    setDownloadTriggered(false);

    try {
      // Trigger background PDF generation endpoint (returns when PDF file is written in cache)
      const res = await fetch(`/api/documents/download?templateType=${templateType}&studentId=${studentId}&internshipId=${internshipId}&format=pdf&disposition=inline`);
      
      if (!res.ok) {
        throw new Error("Failed to compile background PDF.");
      }

      setPdfStatus("ready");
      
      // Attempt background download immediately when ready
      triggerBackgroundDownload();
    } catch (err: any) {
      console.error("Background generation error:", err);
      setPdfStatus("failed");
      setPdfError(err.message || "PDF compilation failed.");
    }
  };

  useEffect(() => {
    startBackgroundGeneration();
  }, [templateType, studentId, internshipId]);

  const triggerBackgroundDownload = () => {
    if (downloadTriggered) return;
    setDownloadTriggered(true);

    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfDownloadUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    } catch (e) {
      console.error("Failed to run auto-download background iframe:", e);
    }
  };

  const handleManualDownload = () => {
    const link = document.createElement("a");
    link.href = pdfDownloadUrl;
    link.setAttribute("download", `${templateType}_${studentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!templateType || !studentId || !internshipId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="bg-white border border-zinc-200 rounded-[24px] p-8 shadow-xs max-w-md mx-auto space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-extrabold text-zinc-900">Invalid Document Request</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            The document generator could not resolve the required query parameters. Please return to the Document Vault and select a valid document.
          </p>
          <Link
            href="/student/documents"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/student/documents"
            className="h-10 w-10 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
            title="Back to Documents"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">Document Preview</span>
            <h1 className="text-base sm:text-lg font-black text-zinc-850 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-zinc-400" />
              {documentName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {pdfStatus === "generating" && (
            <button
              disabled
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 font-bold py-2.5 px-4 text-xs select-none"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </button>
          )}
          {pdfStatus === "ready" && (
            <button
              onClick={handleManualDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs transition-all active:scale-97 shadow-sm shadow-emerald-600/10 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
          {pdfStatus === "failed" && (
            <button
              onClick={startBackgroundGeneration}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 text-xs transition-all active:scale-97 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Retry PDF Generation
            </button>
          )}
          <Link
            href="/student/documents"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-bold py-2.5 px-4 text-xs transition-all cursor-pointer"
          >
            Close Preview
          </Link>
        </div>
      </div>

      {/* Main Preview Block */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col min-h-[550px] relative">
        
        {/* PDF Status Notification Banner */}
        {pdfStatus === "generating" && (
          <div className="bg-indigo-50/50 border-b border-indigo-100 px-4 py-3 sm:px-6 flex items-start gap-2.5 text-indigo-900">
            <Loader2 className="h-4.5 w-4.5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Rendering preview & preparing your PDF download...</p>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-normal">
                You can review the document preview below. The official PDF is compiling in the background and will download automatically once ready.
              </p>
            </div>
          </div>
        )}

        {pdfStatus === "ready" && (
          <div className="bg-emerald-50/50 border-b border-emerald-100 px-4 py-3 sm:px-6 flex items-start gap-2.5 text-emerald-900">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Your PDF is ready.</p>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-normal">
                The download was triggered automatically. If the download didn't start or was blocked, please{" "}
                <button 
                  onClick={handleManualDownload} 
                  className="text-emerald-700 underline font-extrabold hover:text-emerald-800 focus:outline-none cursor-pointer"
                >
                  click here to download manually
                </button>.
              </p>
            </div>
          </div>
        )}

        {pdfStatus === "failed" && (
          <div className="bg-rose-50/50 border-b border-rose-100 px-4 py-3 sm:px-6 flex items-start gap-2.5 text-rose-900">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Background PDF compiling failed.</p>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-normal">
                The HTML preview below is fully verified, but compiling the official PDF timed out. Please{" "}
                <button 
                  onClick={startBackgroundGeneration} 
                  className="text-rose-700 underline font-extrabold hover:text-rose-800 focus:outline-none cursor-pointer"
                >
                  click here to retry compiling
                </button> or contact support.
              </p>
            </div>
          </div>
        )}

        {/* HTML Preview Frame Embed */}
        <div className="flex-1 w-full h-[650px] relative bg-zinc-50">
          <iframe
            src={htmlPreviewUrl}
            className="w-full h-full border-0 absolute inset-0 bg-white"
            title={documentName}
          />
        </div>
      </div>
    </div>
  );
}

export default function DocumentPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#FAFAFC] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5B5FF7] border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-medium">Loading document preview...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
