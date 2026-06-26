"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rubik } from "next/font/google";

const rubik = Rubik({ subsets: ["latin"] });

const baseTermsParagraphs = [
  "Welcome to our platform. These Terms and Conditions constitute a legally binding contract entered into between you and our company. By accessing, browsing, registering for, or using the website and its associated services, applications, and tools, you acknowledge that you have read, understood, and unequivocally agree to be bound by these Terms and Conditions in their entirety. This agreement governs your entire relationship with our platform. If you do not agree with any provision laid out in these Terms, or if you do not possess the legal capacity to enter into a binding contract, you must immediately cease all use of our platform. These terms are designed to foster a safe, educational, and professionally enriching environment for all our users. They clearly delineate the rights, responsibilities, and limitations applicable to both you and the Company. We encourage you to read this document carefully and thoroughly. Furthermore, your continued utilization of our services acts as an ongoing affirmation of your consent to these Terms, which may be periodically updated or revised.",
  "Our sophisticated internship simulations and certification programs are primarily intended for high school graduates, university students, recent alumni, and working professionals seeking to upskill or pivot in their careers. By registering for an account and utilizing our platform, you represent and warrant that you meet the minimum age requirement in your jurisdiction to form a binding contract. If you are under the age of majority, you must have the explicit consent and supervision of a parent or legal guardian to enter into these Terms and use the platform. We reserve the right to request documentation verifying your age or identity at any time. If we discover that an account was created by an individual who does not meet our strict age and eligibility requirements, or if the individual is accessing the platform from a jurisdiction where such access is prohibited by local, state, national, or international law, we maintain the unilateral right to suspend, terminate, or completely delete the account without prior notice or liability.",
  "To unlock the full potential of our services, you must create a personalized user account. During the registration process, you are strictly required to provide information that is accurate, current, and complete. This includes using your real, legal name, a valid email address that you actively monitor, and an authentic phone number. Using pseudonyms, aliases, or falsified credentials undermines the integrity of our certification process and is strictly prohibited. You are solely and exclusively responsible for maintaining the strict confidentiality of your account login credentials, including your password. You agree not to share, transfer, or sell your account access to any third party under any circumstances. Any activity that occurs under your account—whether authorized by you or not—is entirely your legal responsibility. If you suspect that your account has been compromised, accessed without authorization, or otherwise breached, you must notify our support team immediately so that we can take swift remedial action to secure your data and preserve the integrity of the platform.",
  "We provide highly immersive, simulated internship programs designed meticulously by industry experts to replicate real-world professional environments and challenges. These programs are educational in nature, aimed at providing users with practical, hands-on experience, bridging the gap between academic theory and industry requirements. It is absolutely imperative to understand that enrolling in, participating in, or completing a simulated internship program does not, under any circumstances, create an employer-employee, contractor, agency, partnership, or joint venture relationship between you and our company, nor between you and any of our corporate partners or affiliates. Participants are not entitled to wages, salaries, stipends, worker's compensation benefits, unemployment insurance, health insurance, or any other benefits typically associated with formal employment. The primary and sole reward for participation is the educational value, the skills acquired, and the certification awarded upon successful completion.",
  "The credibility and value of a certificate hinge entirely on the rigorous standards of our assessment processes and the uncompromising academic integrity of our users. All tasks, projects, coding challenges, quizzes, and final assessments must represent the sole, independent, and original work of the registered account holder. We expect our users to approach these challenges with professionalism and honesty. Any form of academic dishonesty, cheating, plagiarism, unauthorized collaboration, or the use of automated bots, scripts, or unapproved artificial intelligence tools to generate submissions is strictly forbidden. We employ advanced plagiarism detection software and manual review processes to ensure the authenticity of submissions. If a user is found to be in violation of these academic integrity rules, we reserve the immediate right to fail the user on the assessment, revoke any previously issued certificates, and permanently ban the user from the platform without any right to a refund or appeal.",
  "Certificates of Completion or Certificates of Excellence are awarded solely at our discretion, based strictly upon the user's successful, timely, and satisfactory completion of the curriculum and the achievement of a minimum passing score on the final assessments. Meeting the minimum technical requirements does not automatically guarantee the issuance of a certificate; the quality of the submitted work is heavily weighted in our evaluation matrix. Once issued, certificates are hosted on our secure, public-facing verification portal to allow employers and academic institutions to seamlessly verify your credentials using a unique certificate ID. However, we reserve the ongoing right to revoke, cancel, or invalidate any certificate post-issuance if evidence of plagiarism, identity fraud, or any other severe violation of these Terms and Conditions comes to light. A revoked certificate will immediately show as 'Invalid' or 'Revoked' on our public verification portal, and the user will not be entitled to any compensation for the revoked credential."
];

export default function TermsAndConditions() {
  return (
    <div className={`relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden ${rubik.className}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm pt-20 pb-4 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">Terms & Conditions</h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">Last Updated: October 25, 2026</p>
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            UG Intern Legal
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col gap-12 items-center">
        <div className="w-full glass-panel bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-zinc-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Added prose-sm here for smaller font size */}
          <div className="prose prose-sm prose-zinc max-w-none text-zinc-600 prose-headings:text-zinc-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
            
            {Array.from({ length: 40 }).map((_, index) => {
              const para1 = baseTermsParagraphs[index % baseTermsParagraphs.length];
              const para2 = baseTermsParagraphs[(index + 1) % baseTermsParagraphs.length];
              
              return (
                <section key={index} id={`section-${index}`}>
                  <h2>Section {index + 1}: Comprehensive Terms Provision {index + 1}</h2>
                  <p>{para1}</p>
                  <p>{para2}</p>
                  <div className="h-px bg-zinc-200/60 w-full my-8" />
                </section>
              );
            })}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
