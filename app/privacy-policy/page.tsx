"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rubik } from "next/font/google";

const rubik = Rubik({ subsets: ["latin"] });

const basePrivacyParagraphs = [
  "We collect, process, and retain your data strictly in accordance with applicable federal, state, and international laws, including but not limited to the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other relevant data protection frameworks. The foundation of our service relies on gathering accurate information to provide you with meaningful, personalized, and effective educational and professional experiences. We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, participate in activities on the website, or contact us directly. We are deeply committed to protecting your personal information and ensuring your right to privacy is respected at all times. Our team understands that by choosing to use our platform, you are trusting us with sensitive data, including your educational background, professional aspirations, and personal contact details. This comprehensive Privacy Policy is designed to clearly outline how we collect, use, share, and protect your information when you visit our website or use any of our related services, applications, or platforms.",
  "In today's interconnected digital landscape, data privacy is not just a regulatory requirement but a fundamental human right. We have crafted this policy to be as transparent and easy to understand as possible. It applies to all users of our services—whether you are a student exploring internship opportunities, a professional seeking certification, or an employer verifying credentials. If there are any terms in this Privacy Policy that you do not agree with, please discontinue the use of our Services immediately. Your continued use of the platform signifies your informed consent to the practices described herein. Should you have any questions, concerns, or require further clarification regarding our data practices, our dedicated privacy team is always available to assist you.",
  "When you create an account, we ask for your full name, email address, phone number, and a secure password. As you build your profile, you may optionally provide additional details such as your educational history, current academic institution, expected graduation date, major or field of study, and a resume or portfolio link. For users purchasing premium assessments or verified certificates, we collect necessary billing information. However, please note that all sensitive payment data is processed directly by our PCI-compliant third-party payment gateways; we do not store this information on our servers. In addition to the information you explicitly provide, we automatically collect certain data when you visit, use, or navigate the website. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our Services. This data is primarily used to maintain the security and operation of our platform, as well as for our internal analytics and reporting purposes.",
  "We use the personal information we collect for a variety of legitimate business purposes. First and foremost, your data enables us to create, maintain, and secure your account. It allows us to facilitate the logon process and ensure that you have uninterrupted access to your dashboard, enrolled internships, and assessment modules. Furthermore, we use your information to personalize your educational journey. By analyzing your stated interests, academic background, and performance in various modules, we can recommend highly relevant internship tracks and skill-building exercises tailored specifically to your career goals. We also use your contact information to send you administrative communications—such as password reset emails, security alerts, policy updates, and notifications regarding changes to your enrolled programs. Beyond operational necessities, we aggregate and anonymize user data to conduct research and statistical analysis. This helps us understand broader educational trends, identify areas where our curriculum can be improved, and develop new features that better serve our user base. In strict compliance with applicable laws, we may also use your email address to send you marketing communications about new courses, special offers, or career resources, though you will always have the option to easily opt-out of such communications at any time.",
  "Like most modern web applications, we utilize cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user behavior. Cookies are small data files stored on your device that help our servers recognize your browser and remember specific information about your session. We use Essential Cookies, which are strictly necessary for the platform to function securely. We also use Performance and Analytics Cookies to track how users interact with our site, which pages are most frequently visited, and where users might encounter errors. This data is invaluable for continuously optimizing the user interface and overall performance of the website. Additionally, Preference Cookies allow the website to remember choices you make, such as your preferred language or region. You maintain full control over your cookie preferences. Most web browsers are set to accept cookies by default, but you can usually choose to set your browser to remove or reject cookies. Please be aware that choosing to reject essential cookies may negatively impact the functionality of the platform, and certain features may become completely unavailable or fail to function as intended.",
  "To provide a seamless, high-quality service, we partner with a select group of trusted third-party service providers. These entities only receive the minimum amount of data necessary to perform their specific functions, and they are strictly bound by comprehensive data processing agreements that prohibit them from using your information for any purpose other than what we have explicitly authorized. Our primary third-party partners include cloud hosting providers who maintain our servers and databases, ensuring high availability and robust data backups. We also integrate with industry-leading email delivery services to manage our transactional and marketing communications efficiently. For analytics, we rely on specialized software providers to help us aggregate usage data and visualize platform performance metrics. It is important to emphasize that we do not, and will never, sell your personal information to data brokers, advertisers, or any other third party. We may only disclose your information to external parties outside of our core service providers if we are legally required to do so—such as in response to a court order, subpoena, or a lawful request from a government authority—or to protect the vital interests of our users and the public."
];

export default function PrivacyPolicy() {
  return (
    <div className={`relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden ${rubik.className}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm pt-20 pb-4 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">Last Updated: October 25, 2026</p>
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            IQ Intern Legal
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col gap-12 items-center">
        <div className="w-full glass-panel bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-zinc-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Added prose-sm here for smaller font size */}
          <div className="prose prose-sm prose-zinc max-w-none text-zinc-600 prose-headings:text-zinc-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
            
            {Array.from({ length: 40 }).map((_, index) => {
              const para1 = basePrivacyParagraphs[index % basePrivacyParagraphs.length];
              const para2 = basePrivacyParagraphs[(index + 1) % basePrivacyParagraphs.length];
              
              return (
                <section key={index} id={`section-${index}`}>
                  <h2>Section {index + 1}: Detailed Privacy Provision {index + 1}</h2>
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
