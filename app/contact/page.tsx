"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 pt-28 pb-16 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Get in Touch</span>
          <h1 className="text-4xl font-extrabold text-zinc-900 mt-5 tracking-tight">
            How Can We Help You?
          </h1>
          <p className="mt-4 text-zinc-600 font-light">
            Have questions about certificates, validation checks, or setting up company test portals? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Info Side */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-center">
            <div className="glass-panel rounded-3xl p-6 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">Email Support</h4>
                <p className="text-xs text-zinc-500 hover:text-indigo-600 transition-colors">support@ugintern.com</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">Call Us</h4>
                <p className="text-xs text-zinc-500 font-medium">+1 (555) 234-5678</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">Headquarters</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-light">
                  100 Innovation Way, Suite 400<br />Silicon Valley, CA 94025
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-8">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              {submitted ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-zinc-500 text-sm max-w-sm font-light">
                    Thank you for reaching out. A support coordinator will respond to your inquiry via email within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors"
                      placeholder="Certificate validation issue, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors resize-none"
                      placeholder="Write your message details..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
