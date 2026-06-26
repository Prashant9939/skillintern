/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import { getPlatformSettings, getStudentPayments, PlatformSettings, Payment } from "@/lib/supabase/db";
import { CreditCard, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Script from "next/script";

export default function PaymentPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>({ assessment_fee: 150, payments_enabled: true });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkPaymentStatus() {
      try {
        const u = await getCurrentUser();
        if (!u) {
          window.location.href = "/auth/login";
          return;
        }
        setUser(u);

        const [pays, stg] = await Promise.all([
          getStudentPayments(u.id),
          getPlatformSettings()
        ]);
        setSettings(stg);

        // If payments are disabled or they already have an unused credit, redirect to internships page
        const unusedCredits = pays.filter((p) => p.internship_id === "general_credit_unused" && p.status === "completed");
        if (!stg.payments_enabled || unusedCredits.length > 0) {
          window.location.href = "/student/internships";
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading payment page data:", err);
        setLoading(false);
      }
    }
    checkPaymentStatus();
  }, []);

  const handlePayment = async (isMock: boolean = false) => {
    if (!user) return;
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      // 1. Create order on the backend (sends general internshipId)
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: "general_credit_unused",
          studentId: user.id
        }),
      });

      const orderData = await res.json();

      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to initiate payment. Please try again.");
      }

      // If mock payment is requested, or if the Razorpay object is missing (offline/dev mode)
      if (isMock || typeof (window as any).Razorpay === "undefined") {
        console.warn("Using simulated/mock payment verification...");
        const mockVerifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "mock_signature",
          }),
        });

        const verifyData = await mockVerifyRes.json();

        if (mockVerifyRes.ok && verifyData.success) {
          const completedPayment: Payment = {
            id: `pay-${Math.random().toString(36).substr(2, 9)}`,
            student_id: user.id,
            internship_id: "general_credit_unused",
            amount: settings.assessment_fee * 100,
            status: "completed",
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "mock_signature",
            created_at: new Date().toISOString(),
          };

          // Cache in local storage for frontend fallback
          if (typeof window !== "undefined") {
            const mockPayments = JSON.parse(localStorage.getItem("mock_payments") || "[]");
            mockPayments.push(completedPayment);
            localStorage.setItem("mock_payments", JSON.stringify(mockPayments));
          }

          setSuccess("Payment successful! Redirecting to select your internship...");
          setTimeout(() => {
            window.location.href = "/student/internships";
          }, 1500);
        } else {
          throw new Error(verifyData.error || "Payment verification failed.");
        }
        return;
      }

      // 2. Open Real Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SvZr486cWgXNIQ",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "IQ Intern",
        description: "One-Time Assessment & Enrollment Fee",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on the backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const completedPayment: Payment = {
                id: `pay-${Math.random().toString(36).substr(2, 9)}`,
                student_id: user.id,
                internship_id: "general_credit_unused",
                amount: settings.assessment_fee * 100,
                status: "completed",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                created_at: new Date().toISOString(),
              };

              // Cache in local storage fallback
              if (typeof window !== "undefined") {
                const mockPayments = JSON.parse(localStorage.getItem("mock_payments") || "[]");
                mockPayments.push(completedPayment);
                localStorage.setItem("mock_payments", JSON.stringify(mockPayments));
              }

              setSuccess("Payment successful! Redirecting to select your internship...");
              setTimeout(() => {
                window.location.href = "/student/internships";
              }, 1500);
            } else {
              setError(verifyData.error || "Payment verification failed.");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            setError("Error verifying payment signature. Please try again.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone_number || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError("Payment failed: " + response.error.description);
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment setup error:", err);
      setError(err.message || "Failed to load payment portal.");
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("iqintern_session");
    document.cookie = "iqintern_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = "/auth/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-650 text-sm font-semibold">Loading secure portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      {/* Basic Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur px-6 sm:px-12 shadow-sm relative">
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <img 
            src="/logo-icon.png" 
            className="h-10 w-auto object-contain" 
          />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-red-600 transition-colors border border-zinc-250 bg-white hover:bg-red-50 px-3.5 py-1.5 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Logout / Back to Sign In
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-xl bg-white border border-zinc-250/80 shadow-xl rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          {/* Top light glow */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          {/* Icon Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[#4f46e5] text-xs font-extrabold uppercase tracking-wider block">One-Time Fee</span>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Unlock Platform Access</h2>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-zinc-600 text-sm font-light leading-relaxed">
              Hi <span className="font-bold text-zinc-950">{user?.full_name}</span>! IQ Intern requires a one-time evaluation & platform registration fee of <span className="font-bold text-indigo-600">₹{settings.assessment_fee}</span>. Once paid, you will instantly unlock:
            </p>

            {/* Benefit Bullets */}
            <div className="bg-slate-50 border border-zinc-200/80 p-5 rounded-2xl space-y-3.5 text-xs text-zinc-700 font-medium">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unlimited access to all <strong>11+ industry-aligned internship tracks</strong></span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Access to the rigorous MCQ evaluations & testing dashboards</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Immediate download of verified <strong>Offer Letters</strong></span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Verified <strong>Certificates, Project Reports & Marksheets</strong> on passing</span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-650">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            {/* Checkout Pricing box */}
            <div className="border-t border-b border-zinc-200/60 py-4 flex justify-between items-center text-sm font-semibold">
              <span className="text-zinc-700 font-bold">Evaluation Fee Amount</span>
              <span className="text-xl font-extrabold text-zinc-950">₹{settings.assessment_fee}.00</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handlePayment(false)}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 text-sm transition-all shadow-md shadow-indigo-650/10 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {processing ? "Launching Payment Gateway..." : "Pay Securely with Razorpay"}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => handlePayment(true)}
                disabled={processing}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-250 hover:bg-zinc-50 text-zinc-700 font-bold py-3.5 px-6 text-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Simulate Mock Payment (Local Testing)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <footer className="py-6 border-t border-zinc-200/60 bg-white text-center text-xs text-zinc-600 font-semibold">
        <p>© 2026 IQ Intern. Secure 256-bit SSL encrypted transaction portal.</p>
      </footer>
    </div>
  );
}
