import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, ShieldCheck, Zap, Users, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home | SkillIntern",
  description: "SkillIntern is a secure certification verification platform for internships, providing test scorecards and credentials.",
};

export default function Home() {
  const stats = [
    { label: "Active Students", value: "12,400+", icon: Users, color: "from-indigo-500 to-indigo-600" },
    { label: "Certifications Issued", value: "8,950+", icon: Award, color: "from-violet-500 to-violet-600" },
    { label: "Assessments Conducted", value: "24,000+", icon: Zap, color: "from-amber-500 to-amber-600" },
    { label: "University Partners", value: "48+", icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
  ];

  const features = [
    {
      title: "Industry Aligned MCQs",
      description: "Our assessment tests are carefully designed to check real-world engineering and design concepts.",
      icon: Zap,
    },
    {
      title: "Secure Verification",
      description: "Every certificate has a unique ID stored securely in our database, making it 100% verifiable by employers.",
      icon: ShieldCheck,
    },
    {
      title: "Detailed Performance Scorecards",
      description: "Get a downloadable scorecard showing your score, pass percentage, and a breakdown of questions.",
      icon: Award,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Background Gradients and Modern Glowing Orbs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />
      
      {/* Big glowing modern blur orbs */}
      <div className="absolute top-[10%] left-[20%] -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "-3s" }} />

      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 text-center relative flex flex-col justify-center items-center min-h-[75vh]">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4.5 py-1.5 text-xs font-bold text-indigo-600 mb-8 animate-float shadow-sm">
            <Award className="h-3.5 w-3.5 text-indigo-500" /> Empowering Next-Gen Talent
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 max-w-5xl mx-auto leading-[1.15] mb-6">
            Validate Your Expertise.<br className="hidden sm:inline" />
            <span className="text-indigo-600">
              Earn Verified Certifications.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            Take structured assessment tests across Web Development, Backend Engineering, and UI/UX Design. Get instant verifiable certificates and complete scorecards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-8 py-4.5 text-base font-bold text-white shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
            >
              Get Started Now
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/internships"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 px-8 py-4.5 text-base font-semibold text-zinc-600 hover:text-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              Browse Internships
            </Link>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                    <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-2.5 text-zinc-400">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-zinc-900 tracking-tight">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-200 mt-12">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Why Certify With SkillIntern?
            </h2>
            <p className="text-zinc-600 text-base font-light leading-relaxed">
              We bridge the gap between classroom theory and industry expectations by providing structured test milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="glass-card rounded-3xl p-8 flex flex-col justify-between">
                  <div>
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">{feat.title}</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed font-light">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
