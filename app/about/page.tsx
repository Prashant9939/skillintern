/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Compass, Eye, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | UG Intern",
  description: "Learn more about UG Intern's mission to bridge the gap between academic education and industry readiness.",
};

export default function About() {
  const values = [
    {
      title: "Our Mission",
      desc: "To help engineering and design students showcase their actual project readiness through authenticated assessment pathways.",
      icon: Compass,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Our Vision",
      desc: "Creating a globally recognized certification standard that represents reliable, cheat-proof, and hands-on developer testing.",
      icon: Eye,
      color: "text-violet-600",
      bgColor: "bg-violet-50"
    },
    {
      title: "Our Core Trust",
      desc: "We stand for absolute transparency. Every credential we issue has full detail scores and answers history linked.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 mt-5 tracking-tight">
            Bridging Academics & Industry
          </h1>
          <p className="mt-4 text-zinc-600 text-lg font-light">
            UG Intern was founded to provide a clear, standardized, and secure validation platform for internships.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl border border-zinc-200/50 mb-6 ${v.bgColor} ${v.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{v.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed font-light">{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed text */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">How It Works</h2>
          <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-light">
            <p>
              Students register on our platform by entering their basic academic details. They can search through active, vetted internship tracks listed by companies.
            </p>
            <p>
              To claim a certification, students must take a proctored, timed multiple-choice questionnaire assessment test. The test evaluates practical code comprehension, design guidelines, and system architectures.
            </p>
            <p>
              On passing (40% score or higher), the platform generates a unique certificate containing the student's name, test date, and unique validation code. A scorecard is also produced containing their detailed test metadata, ready for resume insertion or LinkedIn sharing.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
