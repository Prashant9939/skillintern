"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import {
  getTestResultById,
  TestResult,
} from "@/lib/supabase/db";
import {
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const { push } = useRouter();
  const resultId = params.id as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!resultId) return;
      try {
        const u = await getCurrentUser();
        if (!u) {
          push("/auth/login");
          return;
        }

        const res = await getTestResultById(resultId);
        if (!res) {
          push("/student/dashboard");
          return;
        }
        setResult(res);


      } catch (err) {
        console.error("Error loading test results", err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId, push]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-slate-50 min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-zinc-550 text-sm font-medium">Fetching evaluation data...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 relative z-10 text-zinc-800">
      <div className="flex justify-center py-8">
        <div className="w-full max-w-2xl glass-panel border border-zinc-200/80 bg-white rounded-3xl p-6 sm:p-10 relative text-center flex flex-col items-center shadow-md">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {result.passed ? (
              <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-250 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-float">
                <CheckCircle className="h-10 w-10" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-red-50 text-red-655 border border-red-200 flex items-center justify-center shadow-lg shadow-red-500/10 animate-float">
                <XCircle className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mt-8 mb-8">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Assessment Result</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
              {result.internship_title}
            </h1>
            <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto font-light leading-relaxed">
              {result.passed 
                ? "Congratulations! You successfully cleared the passing threshold and finished the assessment." 
                : "You scored below the passing mark of 70%. Feel free to study the checklist requirements and retake the test."}
            </p>
          </div>

          {/* Score Stats card */}
          <div className="grid grid-cols-3 gap-4 w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 mb-8">
            <div className="text-center">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">Score</span>
              <span className="text-lg sm:text-xl font-extrabold text-zinc-900 mt-1 block">{result.score} / {result.total_questions}</span>
            </div>
            <div className="text-center border-x border-zinc-200/60">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">Percentage</span>
              <span className="text-lg sm:text-xl font-extrabold text-indigo-600 mt-1 block">{result.percentage}%</span>
            </div>
            <div className="text-center">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">Result</span>
              <span className={`text-xs sm:text-sm font-bold mt-1.5 inline-block px-2.5 py-0.5 rounded-full ${
                result.passed ? "bg-emerald-50 text-emerald-600 border border-emerald-150" : "bg-red-50 text-red-655 border border-red-150"
              }`}>
                {result.passed ? "PASS" : "FAIL"}
              </span>
            </div>
          </div>

          {/* Action Downloads for Certificate Info */}
          {result.passed && (
            <div className="w-full bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5 mb-8 text-left flex items-start gap-3.5">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900">Your Internship Documents Are Ready!</h4>
                <p className="text-zinc-550 text-xs font-light leading-relaxed">
                  All your personalized documents (including your <strong>Offer Letter</strong>, <strong>Internship Certificate</strong>, and <strong>Project Report</strong>) are available for viewing, verification, and printing.
                </p>
                <div className="pt-2">
                  <Link
                    href="/student/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Go to Dashboard Overview &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Back navigation */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full pt-6 border-t border-zinc-200/60">
            <Link
              href="/student/dashboard"
              className="text-xs text-zinc-550 hover:text-indigo-650 flex items-center gap-1 font-bold transition-colors"
            >
              Return to Dashboard
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            {!result.passed && (
              <Link
                href={`/student/test/${result.internship_id}`}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retake Test
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
