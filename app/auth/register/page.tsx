"use client";

import { useState, useEffect } from "react";
import { signUpUser, loginUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getUniversities, University } from "@/lib/supabase/db";
import { 
  User, Phone, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, 
  CheckCircle, Eye, EyeOff, Building2, BookOpen, GraduationCap, 
  MapPin, PhoneCall, ShieldCheck, CheckSquare, ChevronDown, Globe, Check, Calendar
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Register() {
  const [step, setStep] = useState(1);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    setIsMockMode(!isSupabaseConfigured());
  }, []);

  const handleClearMockData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_profiles");
      localStorage.removeItem("ugintern_session");
      sessionStorage.removeItem("ugintern_session");
      document.cookie = "ugintern_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      alert("Local mock database cleared successfully! Reloading page...");
      window.location.reload();
    }
  };
  
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    dateOfBirth: "",
    // Step 2: Academic
    university: "",
    college: "",
    course: "", // UG / PG
    departmentStream: "", // Branch
    semester: "",
    batch: "",
    rollNumber: "",
    registrationNumber: "",
    // Step 3: Contact
    address: "", // House No, Street, City, State, Pincode
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelation: "",
    documentId: "", // Govt ID
    agreedTerms: false,
    agreedUpdates: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const univs = await getUniversities();
        setUniversities(univs);
      } catch (err) {
        console.error("Failed to load universities:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (formData.university) {
      const selectedUniv = universities.find(u => u.name === formData.university);
      if (selectedUniv) {
        setColleges(selectedUniv.colleges);
      } else {
        setColleges([]);
      }
      // Reset college if university changes
      setFormData(prev => ({ ...prev, college: "" }));
    } else {
      setColleges([]);
    }
  }, [formData.university, universities]);

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.password || !formData.dateOfBirth) {
      setError("Please fill in all account details including Date of Birth.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 7) {
      setError("Password must be at least 7 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!formData.university || !formData.college || !formData.course || !formData.departmentStream || 
        !formData.semester || !formData.batch || !formData.rollNumber || !formData.registrationNumber) {
      setError("Please fill in all academic details.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;
    
    setError("");
    setSuccess("");

    if (!formData.address || !formData.emergencyContactName || !formData.emergencyContactNumber || !formData.emergencyContactRelation) {
      setError("Please fill in all mandatory contact details.");
      return;
    }
    if (!formData.agreedTerms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    try {
      await signUpUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phoneNumber,
        formData.college,
        formData.university,
        formData.course,
        formData.semester,
        formData.address,
        formData.documentId || "N/A",
        formData.departmentStream,
        formData.batch,
        formData.rollNumber,
        formData.registrationNumber,
        formData.emergencyContactName,
        formData.emergencyContactNumber,
        formData.emergencyContactRelation,
        formData.agreedTerms,
        formData.agreedUpdates,
        formData.dateOfBirth
      );
      
      setSuccess("Account registered successfully! Setting up your session...");
      
      // Auto login the user
      await loginUser(formData.email, formData.password);
      
      setSuccess("Account registered successfully! Redirecting to payment...");

      // Redirect to payment page
      setTimeout(() => {
        window.location.href = "/student/payment";
      }, 1500);
    } catch (err: any) {
      const errMsg = err.message || "Failed to complete registration.";
      setError(errMsg);
      alert(errMsg); // Native browser alert popup as requested for active feedback
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", dots: [false, false, false, false], color: "text-zinc-300", colorClass: "bg-transparent border-zinc-300" };
    
    const hasMinLength = pass.length >= 7;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    const score = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score <= 1) {
      return {
        label: "Weak",
        dots: [true, false, false, false],
        color: "text-red-500",
        colorClass: "bg-red-500 border-red-500"
      };
    } else if (score <= 3) {
      return {
        label: "Medium",
        dots: [true, true, false, false],
        color: "text-amber-500",
        colorClass: "bg-amber-500 border-amber-500"
      };
    } else {
      return {
        label: "Strong",
        dots: [true, true, true, true],
        color: "text-emerald-500",
        colorClass: "bg-emerald-500 border-emerald-500"
      };
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15, ease: "easeIn" as const } }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#F8FAFC]">
      
      {/* LEFT SECTION (Branding - 40%) */}
      <div className="hidden md:flex md:w-2/5 md:h-full relative bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white overflow-hidden flex-col justify-between p-8 lg:p-10 shrink-0 select-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Header Branding Box */}
        <div className="relative z-10 w-full max-w-sm shrink-0">
          <div className="bg-slate-950/25 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
            <Link href="/" className="flex items-center gap-2 font-bold text-white mb-1.5">
              <img 
                src="/logo-icon.png" 
                className="h-14 w-auto object-contain" 
              />
            </Link>
            <p className="text-indigo-100/90 font-medium text-[11px] tracking-wide">Empowering Students, Shaping Future</p>
          </div>
        </div>

        {/* Central Illustration and Floating Cards */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full py-4">
          <div className="relative w-full h-64 flex items-center justify-center">
            
            {/* Center Illustration */}
            <div className="relative w-52 h-52 z-10">
              <Image 
                src="/student_internship_branding.png" 
                alt="Students" 
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Floating Certificate Card */}
            <motion.div 
              className="absolute top-0 left-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-2.5 w-44"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="h-8 w-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <GraduationCap className="h-4.5 w-4.5 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">Certified Intern</div>
                <div className="text-[11px] font-extrabold text-white">Placement Ready</div>
              </div>
            </motion.div>

            {/* Floating Offer Letter Preview Card */}
            <motion.div 
              className="absolute bottom-0 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-2.5 w-48"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">Verified Offer</div>
                <div className="text-[11px] font-extrabold text-white flex items-center gap-1">
                  <span>UG Intern Ltd.</span>
                  <span className="text-[8px] text-emerald-300 font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded-full">Active</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Sparks */}
            <motion.div 
              className="absolute top-10 right-16 z-20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 text-xs shadow-md">✦</div>
            </motion.div>
            <motion.div 
              className="absolute bottom-10 left-16 z-20"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
            >
              <div className="h-5.5 w-5.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 text-xs shadow-md">★</div>
            </motion.div>
          </div>
        </div>

        {/* Feature & Three Stats Cards */}
        <div className="relative z-10 w-full mt-auto shrink-0">
          <div className="space-y-2 mb-6 hidden lg:block">
            {["Industry-recognized Certificates", "Real Project Experience", "Placement Assistance", "24×7 Student Support"].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-indigo-50 font-medium text-xs">
                <div className="h-4.5 w-4.5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-emerald-300 stroke-[3]" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
              </div>
              <div className="text-base font-black text-white">5000+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-purple-300" />
              </div>
              <div className="text-base font-black text-white">100+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Colleges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-300" />
              </div>
              <div className="text-base font-black text-white">50+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Form - 60%) */}
      <div className="w-full md:w-3/5 md:h-full flex flex-col overflow-y-auto md:overflow-hidden min-h-screen md:min-h-0 bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-5 bg-white border-b border-zinc-200 shrink-0">
           <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
            <img 
              src="/logo-icon.png" 
              className="h-10 w-auto object-contain" 
            />
          </Link>
          <Link href="/auth/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Login
          </Link>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-end p-4 shrink-0">
           <span className="text-xs font-medium text-zinc-500 mr-2">Already registered?</span>
           <Link href="/auth/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
             Login here →
           </Link>
        </div>

        {/* Form Container */}
        <div className="flex-grow flex items-center justify-center py-2 px-4 sm:px-8 md:overflow-hidden relative">
          <div className="w-full max-w-[620px] flex flex-col shrink-0">
            
            {/* Card */}
            <div className="bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[24px] p-5 sm:p-7 flex flex-col w-full relative">
              <form onSubmit={handleRegister} className="flex flex-col">
                
                {/* Fixed Step Indicator inside Card */}
                <div className="pb-4 border-b border-zinc-100 mb-4 shrink-0">
                  {/* Form Title & Completion */}
                  <div className="flex justify-between items-baseline mb-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                        {step === 1 ? "Account Information" : step === 2 ? "Academic Details" : "Contact Details"}
                      </h2>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                        {step === 1 ? "Create your credentials" : step === 2 ? "Provide academic background" : "Verify contact information"}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {step === 1 ? "33% Complete" : step === 2 ? "66% Complete" : "100% Complete"}
                    </span>
                  </div>

                  {/* Node Progress Bar */}
                  <div className="relative flex items-center justify-between w-full px-6 mt-1">
                    <div className="absolute left-[36px] right-[36px] top-1/2 -translate-y-1/2 h-1 bg-zinc-100 rounded-full z-0">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" 
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </div>

                    {[
                      { id: 1, label: "Account" },
                      { id: 2, label: "Academic" },
                      { id: 3, label: "Contact" }
                    ].map((node) => {
                      const isCompleted = step > node.id;
                      const isActive = step === node.id;

                      return (
                        <div key={node.id} className="relative z-10 flex flex-col items-center">
                          <motion.div 
                            className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              isCompleted 
                                ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] border-transparent text-white shadow-md shadow-indigo-500/10"
                                : isActive
                                  ? "bg-white border-[#7C3AED] ring-4 ring-purple-600/15"
                                  : "bg-white border-zinc-200 text-zinc-400"
                            }`}
                            animate={{ 
                              scale: isActive ? 1.1 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            ) : (
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#7C3AED]' : 'bg-zinc-300'}`} />
                            )}
                          </motion.div>
                          <span className={`text-[9px] font-bold mt-1.5 transition-colors duration-300 uppercase tracking-wider ${
                            isActive ? "text-[#7C3AED]" : isCompleted ? "text-zinc-700" : "text-zinc-400"
                          }`}>
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
 
                {/* Mock Mode Development Helper Banner */}
                {isMockMode && (
                  <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-800 font-medium shrink-0">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-amber-900">Developer Mock Mode Active</strong>
                        <span className="text-[11px] text-amber-700 leading-relaxed block mt-0.5">
                          The client is running in Mock Mode because Supabase credentials are not loaded in your browser. Restart your local Next.js dev server after adding `.env.local` to connect to Supabase.
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={handleClearMockData}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm shadow-amber-600/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Clear Mock DB
                      </button>
                    </div>
                  </div>
                )}

                {/* Error/Success Messages Inside Card */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div key="error-message" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-600 font-semibold shrink-0">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div key="success-message" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-600 font-semibold shrink-0">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Content & Actions */}
                <div className="py-1">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1 */}
                    {step === 1 && (
                      <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                            <input type="text" required value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} 
                              className="w-full pl-11 pr-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="John Doe" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Email Address *</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                            <input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} 
                              className="w-full pl-11 pr-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="john@example.com" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Phone Number *</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                              <input type="tel" required value={formData.phoneNumber} onChange={e => updateForm('phoneNumber', e.target.value)} 
                                className="w-full pl-11 pr-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="+91 98765 43210" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Date of Birth *</label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400 animate-pulse" />
                              <input type="date" required value={formData.dateOfBirth} onChange={e => updateForm('dateOfBirth', e.target.value)} 
                                className="w-full pl-11 pr-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Password *</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                            <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => updateForm('password', e.target.value)} 
                              className="w-full pl-11 pr-11 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="At least 7 characters" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          
                          {/* Dynamic Password Strength Indicator */}
                          {formData.password && (
                            <div className="space-y-1.5 mt-1.5 px-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="text-zinc-500 font-medium">Strength:</span>
                                <span className={`${passwordStrength.color} uppercase tracking-wider`}>{passwordStrength.label}</span>
                                <div className="flex gap-1">
                                  {passwordStrength.dots.map((filled, i) => (
                                    <div
                                      key={i}
                                      className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${
                                        filled
                                          ? passwordStrength.colorClass
                                          : "border-zinc-300 bg-transparent"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Dynamic Checklist */}
                              <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold text-zinc-500 pt-1 border-t border-zinc-100">
                                <div className="flex items-center gap-1">
                                  <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${formData.password.length >= 7 ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                  <span className={formData.password.length >= 7 ? 'text-zinc-800 font-bold' : ''}>Min 7 characters</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${/[A-Z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                  <span className={/[A-Z]/.test(formData.password) ? 'text-zinc-800 font-bold' : ''}>One uppercase letter</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                  <span className={/[0-9]/.test(formData.password) ? 'text-zinc-800 font-bold' : ''}>One number</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-zinc-800 font-bold' : ''}>One special character</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <motion.button 
                          type="button" 
                          onClick={handleNextStep} 
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-4 h-[54px] flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-base font-semibold text-white shadow-lg shadow-indigo-500/20 cursor-pointer transition-all duration-200"
                        >
                          Continue to Academic Details
                          <ArrowRight className="h-5 w-5" />
                        </motion.button>

                      </motion.div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">University Name *</label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                            <select required value={formData.university} onChange={e => updateForm('university', e.target.value)} 
                              className="w-full pl-11 pr-10 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer">
                              <option value="" disabled>Select your University</option>
                              {universities.map(u => (
                                <option key={u.name} value={u.name}>{u.name}</option>
                              ))}
                              <option value="Other">Other / Not Listed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">College Name *</label>
                          <div className="relative">
                            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                            <select required value={formData.college} onChange={e => updateForm('college', e.target.value)} disabled={!formData.university}
                              className="w-full pl-11 pr-10 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                              <option value="" disabled>Select your College</option>
                              {colleges.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                              <option value="Other">Other / Not Listed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Course/Degree *</label>
                            <div className="relative">
                              <select required value={formData.course} onChange={e => updateForm('course', e.target.value)} className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer pr-10">
                                <option value="" disabled>Select</option>
                                <option value="UG">UG (Undergraduate)</option>
                                <option value="PG">PG (Postgraduate)</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Branch *</label>
                            <div className="relative">
                              <select required value={formData.departmentStream} onChange={e => updateForm('departmentStream', e.target.value)} className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer pr-10">
                                <option value="" disabled>Select</option>
                                <option value="B.Tech/BE">B.Tech/BE</option>
                                <option value="BCA">BCA</option>
                                <option value="BSC">B.Sc</option>
                                <option value="BBA">BBA</option>
                                <option value="BCOM">B.Com</option>
                                <option value="BA">BA</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Semester *</label>
                            <div className="relative">
                              <select required value={formData.semester} onChange={e => updateForm('semester', e.target.value)} className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer pr-10">
                                <option value="" disabled>Select</option>
                                {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Batch *</label>
                            <div className="relative">
                              <select required value={formData.batch} onChange={e => updateForm('batch', e.target.value)} className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 appearance-none cursor-pointer pr-10">
                                <option value="" disabled>Select</option>
                                {["2022-26", "2023-27", "2024-28", "2025-29", "Other"].map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Univ Reg No. *</label>
                            <input type="text" required value={formData.registrationNumber} onChange={e => updateForm('registrationNumber', e.target.value)} 
                              className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="Reg Number" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Roll Number *</label>
                            <input type="text" required value={formData.rollNumber} onChange={e => updateForm('rollNumber', e.target.value)} 
                              className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="Roll Number" />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                          <motion.button 
                            type="button" 
                            onClick={() => setStep(1)} 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-1/3 h-[54px] flex items-center justify-center gap-2 rounded-[14px] bg-white border border-zinc-300 hover:bg-zinc-50 text-sm font-semibold text-zinc-700 cursor-pointer transition-all duration-200"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                          </motion.button>
                          <motion.button 
                            type="button" 
                            onClick={handleNextStep} 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-2/3 h-[54px] flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-base font-semibold text-white shadow-lg shadow-indigo-500/20 cursor-pointer transition-all duration-200"
                          >
                            Continue
                            <ArrowRight className="h-5 w-5" />
                          </motion.button>
                        </div>

                      </motion.div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Full Address *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3 h-[18px] w-[18px] text-zinc-400" />
                            <textarea required value={formData.address} onChange={e => updateForm('address', e.target.value)} rows={2}
                              className="w-full pl-11 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 resize-none placeholder:text-zinc-400 min-h-[64px]" 
                              placeholder="House No, Street, City, State, Pincode" />
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="p-3.5 rounded-[16px] border border-amber-200 bg-amber-50/20 space-y-2.5">
                          <h3 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <PhoneCall className="h-3.5 w-3.5 text-amber-700"/> Emergency Contact
                          </h3>
                          <div className="flex flex-col gap-1">
                            <input type="text" required value={formData.emergencyContactName} onChange={e => updateForm('emergencyContactName', e.target.value)} 
                              className="w-full px-4 h-[56px] text-sm bg-white border border-amber-200/60 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="Contact Person Name *" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <input type="tel" required value={formData.emergencyContactNumber} onChange={e => updateForm('emergencyContactNumber', e.target.value)} 
                                className="w-full px-4 h-[56px] text-sm bg-white border border-amber-200/60 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="Phone Number *" />
                            </div>
                            <div className="relative">
                              <select required value={formData.emergencyContactRelation} onChange={e => updateForm('emergencyContactRelation', e.target.value)} className="w-full px-4 h-[56px] text-sm bg-white border border-amber-200/60 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all appearance-none cursor-pointer pr-10">
                                <option value="" disabled>Relationship *</option>
                                {["Father", "Mother", "Brother", "Sister", "Guardian", "Other"].map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Govt ID Number (Optional)</label>
                          <input type="text" value={formData.documentId} onChange={e => updateForm('documentId', e.target.value)} 
                            className="w-full px-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400" placeholder="Aadhar / PAN" />
                        </div>

                        <div className="flex flex-col gap-2 mb-2 select-none">
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                              <input type="checkbox" className="peer sr-only" checked={formData.agreedTerms} onChange={e => updateForm('agreedTerms', e.target.checked)} />
                              <div className="h-4 w-4 rounded border border-zinc-300 peer-checked:bg-[#7C3AED] peer-checked:border-[#7C3AED] transition-all group-hover:border-[#7C3AED]/70"></div>
                              <Check className="absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
                            </div>
                            <span className="text-[10px] text-zinc-600 font-medium leading-normal">
                              I agree to the <Link href="/terms-and-conditions" className="text-indigo-600 font-bold hover:underline">Terms and Conditions</Link> and Privacy Policy. *
                            </span>
                          </label>
                          
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                              <input type="checkbox" className="peer sr-only" checked={formData.agreedUpdates} onChange={e => updateForm('agreedUpdates', e.target.checked)} />
                              <div className="h-4 w-4 rounded border border-zinc-300 peer-checked:bg-[#7C3AED] peer-checked:border-[#7C3AED] transition-all group-hover:border-[#7C3AED]/70"></div>
                              <Check className="absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
                            </div>
                            <span className="text-[10px] text-zinc-600 font-medium leading-normal">
                              I agree to receive updates, assessment alerts, and promotions via Email and SMS.
                            </span>
                          </label>
                        </div>

                        <div className="flex gap-4 pt-2">
                          <motion.button 
                            type="button" 
                            onClick={() => setStep(2)} 
                            disabled={loading} 
                            whileHover={loading ? {} : { y: -2 }}
                            whileTap={loading ? {} : { scale: 0.98 }}
                            className="w-1/3 h-[54px] flex items-center justify-center gap-2 rounded-[14px] bg-white border border-zinc-300 hover:bg-zinc-50 text-sm font-semibold text-zinc-700 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                          </motion.button>
                          <motion.button 
                            type="submit" 
                            disabled={loading} 
                            whileHover={loading ? {} : { y: -2 }}
                            whileTap={loading ? {} : { scale: 0.98 }}
                            className="w-2/3 h-[54px] flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-base font-semibold text-white shadow-lg shadow-indigo-500/20 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                Register Now
                                <CheckCircle className="h-4.5 w-4.5" />
                              </>
                            )}
                          </motion.button>
                        </div>

                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Center-Aligned Trust Elements (static bottom of card) */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-4 pt-3.5 border-t border-zinc-100 text-[10px] text-zinc-500 font-semibold select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                    <span>UGC Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                    <span>Secure Registration</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                    <span>5000+ Students Trusted</span>
                  </div>
                </div>

              </form>
            </div>

            {/* reCAPTCHA footer */}
            <div className="text-center mt-3.5 text-xs text-zinc-500 font-medium shrink-0">
              Protected by reCAPTCHA and subject to the UG Intern Privacy Policy.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
