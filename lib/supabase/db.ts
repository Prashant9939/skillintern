import { supabase, isSupabaseConfigured } from "./client";

export interface Internship {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  category: string;
  created_at?: string;
}

export interface Question {
  id: string;
  internship_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export interface TestResult {
  id: string;
  student_id: string;
  internship_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
  student_name?: string;
  internship_title?: string;
  reference_number?: string;
}



export interface DocumentTemplate {
  id: string;
  code: string;
  name: string;
  html_content: string;
  is_visible: boolean;
  updated_at: string;
}



// -------------------------------------------------------------
// DEFAULT MOCK DATA POPULATORS
// -------------------------------------------------------------
const DEFAULT_INTERNSHIPS: Internship[] = [
  {
    id: "int-web-dev",
    title: "Frontend React Developer",
    description: "Build premium user interfaces using React, Next.js, and CSS Grid/Flexbox. Focus on performance, design aesthetics, and responsive layout structures.",
    requirements: ["HTML5, CSS3, ES6+ Javascript", "Basic understanding of React state management", "Familiarity with Tailwind CSS or Vanilla CSS variables"],
    duration: "3 Months",
    category: "Web Development",
  },
  {
    id: "int-backend",
    title: "Backend Node.js Engineer",
    description: "Develop robust API endpoints, integrate databases, and configure servers. Focus on security, RLS policies, and performance scaling.",
    requirements: ["Node.js, Express, and Typescript", "Familiarity with SQL Databases (PostgreSQL)", "API design and OAuth architecture"],
    duration: "3 Months",
    category: "Software Engineering",
  },
  {
    id: "int-design",
    title: "UI/UX Product Designer",
    description: "Design high-fidelity wireframes, interactive user flows, and modern design systems. Focus on user empathy, typography, and color theory.",
    requirements: ["Proficiency in Figma or Adobe XD", "Strong eye for typography, alignment, and spacing", "Creating component libraries & interactive mockups"],
    duration: "2 Months",
    category: "Design",
  }
];

const DEFAULT_QUESTIONS: Record<string, Omit<Question, "id">[]> = {
  "int-web-dev": [
    {
      internship_id: "int-web-dev",
      question_text: "Which hook is used to perform side effects in a React functional component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-web-dev",
      question_text: "What does Next.js App Router use to render components on the server by default?",
      options: ["Client Components", "Server Components", "Static Site Generation", "Incremental Static Regeneration"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-web-dev",
      question_text: "Which CSS property is used to set the spacing inside an element?",
      options: ["margin", "padding", "border", "gap"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-web-dev",
      question_text: "In React, what is the purpose of the 'key' prop in list items?",
      options: ["To style the elements differently", "To identify elements uniquely for reconciliation", "To bind click events", "To store metadata"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-web-dev",
      question_text: "What does CSS glassmorphism typically rely on for its translucent blur effect?",
      options: ["filter: blur()", "backdrop-filter: blur()", "opacity: 0.5", "background-color: transparent"],
      correct_option_index: 1,
    }
  ],
  "int-backend": [
    {
      internship_id: "int-backend",
      question_text: "Which SQL command is used to add new rows of data to a table?",
      options: ["ADD ROW", "INSERT INTO", "UPDATE", "CREATE RECORD"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-backend",
      question_text: "What does 'RLS' stand for in PostgreSQL/Supabase database design?",
      options: ["Real-time Log Syncing", "Row Level Security", "Relation Layout Schema", "Resource Limit Service"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-backend",
      question_text: "Which HTTP status code represents an Unauthorized request?",
      options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-backend",
      question_text: "In Node.js, how do you handle asynchronous operations in a cleaner, synchronous-like syntax?",
      options: ["Callbacks", "Promises", "Async/Await", "Event Emitters"],
      correct_option_index: 2,
    },
    {
      internship_id: "int-backend",
      question_text: "Which database indexing method is typically the default for PostgreSQL tables?",
      options: ["B-Tree", "Hash", "GIN", "GiST"],
      correct_option_index: 0,
    }
  ],
  "int-design": [
    {
      internship_id: "int-design",
      question_text: "What is the key difference between serif and sans-serif typefaces?",
      options: ["Serif has decorative feet at character strokes", "Sans-serif is only used in headers", "Serif is always bold", "Sans-serif is cursive"],
      correct_option_index: 0,
    },
    {
      internship_id: "int-design",
      question_text: "Which visual design concept prioritizes elements in order of user importance?",
      options: ["Visual Hierarchy", "Proximity", "White Space", "Color Harmony"],
      correct_option_index: 0,
    },
    {
      internship_id: "int-design",
      question_text: "What is the optimal color contrast ratio recommended by WCAG 2.1 AA for normal text?",
      options: ["3:1", "4.5:1", "7:1", "10:1"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-design",
      question_text: "What does 'UI' design stand for?",
      options: ["User Interaction", "User Interface", "Universal Integration", "Usability Index"],
      correct_option_index: 1,
    },
    {
      internship_id: "int-design",
      question_text: "In design, what is 'Negative Space' or 'White Space'?",
      options: ["Unused pixels in code", "The empty space between design elements", "Background templates that are colored white", "The styling reset CSS"],
      correct_option_index: 1,
    }
  ]
};

// Local storage init helper
function getMockStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(val);
  } catch (e) {
    console.error(`Error reading key "${key}" from localStorage:`, e);
    try {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    } catch (_) {}
    return defaultValue;
  }
}

function setMockStorage<T>(key: string, data: T) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing key to localStorage:`, e);
    }
  }
}

// -------------------------------------------------------------
// INTERNSHIPS OPERATIONS
// -------------------------------------------------------------
export async function getInternships(): Promise<Internship[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("getInternships query failed, falling back to mock data:", error);
        return getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
      }
      if (!data || data.length === 0) {
        return getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
      }
      return data;
    } catch (err) {
      console.warn("getInternships failed, falling back to mock data:", err);
      return getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
    }
  } else {
    return getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
  }
}

export async function getInternshipById(id: string): Promise<Internship | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("internships").select("*").eq("id", id).single();
      if (error) {
        console.warn("getInternshipById query failed, falling back to mock data:", error);
        const list = await getInternships();
        return list.find((i) => i.id === id) || null;
      }
      return data;
    } catch (err) {
      console.warn("getInternshipById failed, falling back to mock data:", err);
      const list = await getInternships();
      return list.find((i) => i.id === id) || null;
    }
  } else {
    const list = await getInternships();
    return list.find((i) => i.id === id) || null;
  }
}

function saveInternshipMock(internship: Omit<Internship, "id"> & { id?: string }): Internship {
  const list = getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
  const id = internship.id || `int-${Math.random().toString(36).substr(2, 9)}`;
  const saved: Internship = {
    ...internship,
    id,
    created_at: new Date().toISOString(),
  };

  const idx = list.findIndex((i) => i.id === id);
  if (idx !== -1) {
    list[idx] = saved;
  } else {
    list.push(saved);
  }
  setMockStorage("mock_internships", list);
  return saved;
}

export async function saveInternship(internship: Omit<Internship, "id"> & { id?: string }): Promise<Internship> {
  if (isSupabaseConfigured() && supabase) {
    try {
      if (internship.id) {
        const { data, error } = await supabase
          .from("internships")
          .update(internship)
          .eq("id", internship.id)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from database update");
        return data;
      } else {
        const { data, error } = await supabase
          .from("internships")
          .insert(internship)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from database insert");
        return data;
      }
    } catch (err) {
      console.warn("saveInternship to Supabase failed, falling back to mock:", err);
      return saveInternshipMock(internship);
    }
  } else {
    return saveInternshipMock(internship);
  }
}

export async function deleteInternship(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Delete dependent records in parallel
      await Promise.all([
        supabase.from("questions").delete().eq("internship_id", id),
        supabase.from("documents").delete().eq("internship_id", id),
        supabase.from("test_results").delete().eq("internship_id", id)
      ]);

      // 5. Finally delete the internship track
      const { error } = await supabase.from("internships").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteInternship error details:", error);
        throw error;
      }
      return true;
    } catch (err) {
      console.warn("deleteInternship from Supabase failed, falling back to mock:", err);
      return deleteInternshipMock(id);
    }
  } else {
    return deleteInternshipMock(id);
  }
}

function deleteInternshipMock(id: string): boolean {
  const list = getMockStorage<Internship[]>("mock_internships", []);
  const filtered = list.filter((i) => i.id !== id);
  setMockStorage("mock_internships", filtered);

  // clean up questions too
  const allQuestions = getMockStorage<Question[]>("mock_questions", []);
  const filteredQuestions = allQuestions.filter((q) => q.internship_id !== id);
  setMockStorage("mock_questions", filteredQuestions);

  const allDocuments = getMockStorage<any[]>("mock_documents", []);
  const filteredDocuments = allDocuments.filter((d) => d.internship_id !== id);
  setMockStorage("mock_documents", filteredDocuments);

  return true;
}

// -------------------------------------------------------------
// QUESTIONS OPERATIONS
// -------------------------------------------------------------
export async function getQuestions(internshipId: string): Promise<Question[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("internship_id", internshipId);
      if (error) {
        console.warn("getQuestions query failed, falling back to mock data:", error);
        return getMockQuestionsFallback(internshipId);
      }
      if (!data || data.length === 0) {
        return getMockQuestionsFallback(internshipId);
      }
      return data || [];
    } catch (err) {
      console.warn("getQuestions failed, falling back to mock data:", err);
      return getMockQuestionsFallback(internshipId);
    }
  } else {
    return getMockQuestionsFallback(internshipId);
  }
}

function getMockQuestionsFallback(internshipId: string): Question[] {
  const allQuestions = getMockStorage<Question[]>("mock_questions", []);
  const internshipQuestions = allQuestions.filter((q) => q.internship_id === internshipId);

  // If mock question storage is empty, initialize default questions
  if (allQuestions.length === 0 && DEFAULT_QUESTIONS[internshipId]) {
    const formatted = DEFAULT_QUESTIONS[internshipId].map((q, idx) => ({
      ...q,
      id: `q-${internshipId}-${idx}`,
    }));
    // Save them all to mock storage
    const updatedList = [...allQuestions, ...formatted];
    setMockStorage("mock_questions", updatedList);
    return formatted;
  } else if (internshipQuestions.length === 0 && DEFAULT_QUESTIONS[internshipId]) {
    // populate defaults for this internship specifically
    const formatted = DEFAULT_QUESTIONS[internshipId].map((q, idx) => ({
      ...q,
      id: `q-${internshipId}-${idx}`,
    }));
    const updatedList = [...allQuestions, ...formatted];
    setMockStorage("mock_questions", updatedList);
    return formatted;
  }
  
  return internshipQuestions;
}

function saveQuestionMock(question: Omit<Question, "id"> & { id?: string }): Question {
  const list = getMockStorage<Question[]>("mock_questions", []);
  const id = question.id || `q-${Math.random().toString(36).substr(2, 9)}`;
  const saved: Question = { ...question, id };

  const idx = list.findIndex((q) => q.id === id);
  if (idx !== -1) {
    list[idx] = saved;
  } else {
    list.push(saved);
  }
  setMockStorage("mock_questions", list);
  return saved;
}

export async function saveQuestion(question: Omit<Question, "id"> & { id?: string }): Promise<Question> {
  if (isSupabaseConfigured() && supabase) {
    try {
      if (question.id) {
        const { data, error } = await supabase
          .from("questions")
          .update(question)
          .eq("id", question.id)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from database update");
        return data;
      } else {
        const { data, error } = await supabase
          .from("questions")
          .insert(question)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from database insert");
        return data;
      }
    } catch (err) {
      console.warn("saveQuestion to Supabase failed, falling back to mock:", err);
      return saveQuestionMock(question);
    }
  } else {
    return saveQuestionMock(question);
  }
}

export async function deleteQuestion(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
    return true;
  } else {
    const list = getMockStorage<Question[]>("mock_questions", []);
    const filtered = list.filter((q) => q.id !== id);
    setMockStorage("mock_questions", filtered);
    return true;
  }
}

// -------------------------------------------------------------
// TEST RESULTS & CERTIFICATE OPERATIONS
// -------------------------------------------------------------
export function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SI-${year}${month}-${randomChars}`;
}

// -------------------------------------------------------------
// TEST RESULTS & CERTIFICATE OPERATIONS
// -------------------------------------------------------------
export async function getTestResults(studentId?: string): Promise<TestResult[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("test_results").select("*, profiles(full_name), internships(title)");
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      const { data, error } = await query.order("completed_at", { ascending: false });
      if (error) {
        console.warn("getTestResults query failed, falling back to mock data:", error);
        return getMockTestResultsFallback(studentId);
      }
      
      return (data || []).map((r: any) => ({
        id: r.id,
        student_id: r.student_id,
        internship_id: r.internship_id,
        score: r.score,
        total_questions: r.total_questions,
        percentage: Number(r.percentage),
        passed: r.passed,
        completed_at: r.completed_at,
        student_name: r.profiles?.full_name,
        internship_title: r.internships?.title,
        reference_number: r.reference_number,
      }));
    } catch (err) {
      console.warn("getTestResults failed, falling back to mock data:", err);
      return getMockTestResultsFallback(studentId);
    }
  } else {
    return getMockTestResultsFallback(studentId);
  }
}

async function getMockTestResultsFallback(studentId?: string): Promise<TestResult[]> {
  const list = getMockStorage<TestResult[]>("mock_test_results", []);
  const students = getMockStorage<any[]>("mock_profiles", []);
  const internships = await getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);

  const mapped = list.map((res) => {
    const studentObj = students.find((s) => s.id === res.student_id);
    const internObj = internships.find((i) => i.id === res.internship_id);
    return {
      ...res,
      student_name: studentObj?.full_name || "Unknown Student",
      internship_title: internObj?.title || "Unknown Internship",
    };
  });

  if (studentId) {
    return mapped.filter((r) => r.student_id === studentId);
  }
  return mapped;
}

export async function getTestResultById(id: string): Promise<TestResult | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*, profiles(full_name), internships(title)")
        .eq("id", id)
        .single();
      if (error) {
        console.warn("getTestResultById query failed, falling back to mock data:", error);
        const list = await getTestResults();
        return list.find((r) => r.id === id) || null;
      }
      
      return {
        id: data.id,
        student_id: data.student_id,
        internship_id: data.internship_id,
        score: data.score,
        total_questions: data.total_questions,
        percentage: Number(data.percentage),
        passed: data.passed,
        completed_at: data.completed_at,
        student_name: data.profiles?.full_name,
        internship_title: data.internships?.title,
        reference_number: data.reference_number,
      };
    } catch (err) {
      console.warn("getTestResultById failed, falling back to mock data:", err);
      const list = await getTestResults();
      return list.find((r) => r.id === id) || null;
    }
  } else {
    const list = await getTestResults();
    return list.find((r) => r.id === id) || null;
  }
}

export async function saveTestResult(res: Omit<TestResult, "id">): Promise<TestResult> {
  const reference_number = res.passed && !res.reference_number ? generateReferenceNumber() : res.reference_number;
  const insertData = {
    ...res,
    reference_number
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("No data returned from database insert");
      return data;
    } catch (err) {
      console.warn("saveTestResult to Supabase failed, falling back to mock:", err);
      return saveTestResultMock(insertData);
    }
  } else {
    return saveTestResultMock(insertData);
  }
}

function saveTestResultMock(res: Omit<TestResult, "id">): TestResult {
  const list = getMockStorage<TestResult[]>("mock_test_results", []);
  const id = `res-${Math.random().toString(36).substr(2, 9)}`;
  const saved: TestResult = { ...res, id };
  list.push(saved);
  setMockStorage("mock_test_results", list);
  return saved;
}


// -------------------------------------------------------------
// PROFILE READ FOR CURRENT USER
// -------------------------------------------------------------
export async function getStudentProfile(userId: string): Promise<any | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.warn("getStudentProfile query failed, falling back to mock data:", error);
        return getMockProfileFallback(userId);
      }
      return data;
    } catch (err) {
      console.warn("getStudentProfile failed, falling back to mock data:", err);
      return getMockProfileFallback(userId);
    }
  } else {
    return getMockProfileFallback(userId);
  }
}

function getMockProfileFallback(userId: string): any | null {
  if (typeof window === "undefined") return null;
  const profiles = JSON.parse(localStorage.getItem("mock_profiles") || "[]");
  return profiles.find((p: any) => p.id === userId) || null;
}


// -------------------------------------------------------------
// PROFILES — ADMIN PANEL
// -------------------------------------------------------------

// All students only (for stats / student-specific views)
export async function getStudentProfiles(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone_number, department_stream, role, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("getStudentProfiles query failed, falling back to mock data:", error);
        return getMockStorage<any[]>("mock_profiles", []).filter((p: any) => p.role === "student");
      }
      return data || [];
    } catch (err) {
      console.warn("getStudentProfiles failed, falling back to mock data:", err);
      return getMockStorage<any[]>("mock_profiles", []).filter((p: any) => p.role === "student");
    }
  } else {
    return getMockStorage<any[]>("mock_profiles", []).filter((p: any) => p.role !== "admin");
  }
}

// All registered users including admins (no password hashes returned)
export async function getAllProfiles(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone_number, department_stream, role, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("getAllProfiles query failed, falling back to mock data:", error);
        return getMockStorage<any[]>("mock_profiles", []).map(stripPassword);
      }
      return data || [];
    } catch (err) {
      console.warn("getAllProfiles failed, falling back to mock data:", err);
      return getMockStorage<any[]>("mock_profiles", []).map(stripPassword);
    }
  } else {
    return getMockStorage<any[]>("mock_profiles", []).map(stripPassword);
  }
}

function stripPassword(p: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, password_hash, ...rest } = p;
  return rest;
}

export async function updateStudentProfile(userId: string, data: any): Promise<{ success: boolean; data?: any }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: updatedData, error } = await supabase
        .from("profiles")
        .update({
          ...data,
          profile_completed: true
        })
        .eq("id", userId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: updatedData };
    } catch (err: any) {
      console.warn("updateStudentProfile to Supabase failed, falling back to mock:", err);
      return updateStudentProfileMock(userId, data);
    }
  } else {
    return updateStudentProfileMock(userId, data);
  }
}

function updateStudentProfileMock(userId: string, data: any): { success: boolean; data?: any } {
  if (typeof window === "undefined") return { success: false };
  
  const profiles = JSON.parse(localStorage.getItem("mock_profiles") || "[]");
  const idx = profiles.findIndex((p: any) => p.id === userId);
  
  if (idx !== -1) {
    const updated = {
      ...profiles[idx],
      ...data,
      profile_completed: true
    };
    profiles[idx] = updated;
    localStorage.setItem("mock_profiles", JSON.stringify(profiles));
    return { success: true, data: updated };
  }
  
  return { success: false };
}



// -------------------------------------------------------------
// DATABASE INITIALIZATION / SEEDING UTILITY
// -------------------------------------------------------------
export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: "Supabase is not configured. Running in Mock local mode." };
  }

  try {
    // 1. Check if internships already exist in the live database
    const { data: existing, error: fetchErr } = await supabase.from("internships").select("id").limit(1);
    if (fetchErr) {
      throw new Error(`Failed to check existing tables: ${fetchErr.message}. Ensure schema.sql has been run on Supabase SQL Editor.`);
    }

    if (existing && existing.length > 0) {
      return { success: true, message: "Database already contains internships. Seeding is not required." };
    }

    // 2. Database is empty, start seeding
    // Seeding Web Development Track
    const { data: webTrack, error: webErr } = await supabase
      .from("internships")
      .insert({
        title: "Frontend React Developer",
        description: "Build premium user interfaces using React, Next.js, and CSS Grid/Flexbox. Focus on performance, design aesthetics, and responsive layout structures.",
        requirements: ["HTML5, CSS3, ES6+ Javascript", "Basic understanding of React state management", "Familiarity with Tailwind CSS or Vanilla CSS variables"],
        duration: "3 Months",
        category: "Web Development",
      })
      .select()
      .single();

    if (webErr) throw webErr;

    // Seed questions for Web Dev Track
    const webQuestions = DEFAULT_QUESTIONS["int-web-dev"].map((q) => ({
      internship_id: webTrack.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index,
    }));
    const { error: qWebErr } = await supabase.from("questions").insert(webQuestions);
    if (qWebErr) throw qWebErr;

    // Seeding Backend Track
    const { data: backendTrack, error: backErr } = await supabase
      .from("internships")
      .insert({
        title: "Backend Node.js Engineer",
        description: "Develop robust API endpoints, integrate databases, and configure servers. Focus on security, RLS policies, and performance scaling.",
        requirements: ["Node.js, Express, and Typescript", "Familiarity with SQL Databases (PostgreSQL)", "API design and OAuth architecture"],
        duration: "3 Months",
        category: "Software Engineering",
      })
      .select()
      .single();

    if (backErr) throw backErr;

    // Seed questions for Backend Track
    const backendQuestions = DEFAULT_QUESTIONS["int-backend"].map((q) => ({
      internship_id: backendTrack.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index,
    }));
    const { error: qBackErr } = await supabase.from("questions").insert(backendQuestions);
    if (qBackErr) throw qBackErr;

    // Seeding Design Track
    const { data: designTrack, error: desErr } = await supabase
      .from("internships")
      .insert({
        title: "UI/UX Product Designer",
        description: "Design high-fidelity wireframes, interactive user flows, and modern design systems. Focus on user empathy, typography, and color theory.",
        requirements: ["Proficiency in Figma or Adobe XD", "Strong eye for typography, alignment, and spacing", "Creating component libraries & interactive mockups"],
        duration: "2 Months",
        category: "Design",
      })
      .select()
      .single();

    if (desErr) throw desErr;

    // Seed questions for Design Track
    const designQuestions = DEFAULT_QUESTIONS["int-design"].map((q) => ({
      internship_id: designTrack.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index,
    }));
    const { error: qDesErr } = await supabase.from("questions").insert(designQuestions);
    if (qDesErr) throw qDesErr;

    return { success: true, message: "Database seeded successfully with default tracks and questions!" };
  } catch (err: any) {
    return { success: false, message: err.message || "An error occurred during database seeding." };
  }
}



// -------------------------------------------------------------
// HTML DOCUMENT TEMPLATES OPERATIONS
// -------------------------------------------------------------
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("code", { ascending: true });
        
      if (error) {
        console.warn("getDocumentTemplates failed, falling back to mock:", error);
        return getMockDocumentTemplates();
      }
      
      if (!data || data.length === 0) {
        // Database is empty, let's seed default templates
        const seeded = await getMockDocumentTemplates();
        const client = supabase;
        if (!client) return seeded;
        // Try to insert them into Supabase in parallel
        await Promise.all(
          seeded.map(async (t) => {
            try {
              await client.from("document_templates").insert({
                code: t.code,
                name: t.name,
                html_content: t.html_content,
                is_visible: t.is_visible
              });
            } catch (insertErr) {
              console.error("Failed to seed template to database:", insertErr);
            }
          })
        );
        return seeded;
      }
      
      return data || [];
    } catch (err) {
      console.warn("getDocumentTemplates failed, falling back to mock:", err);
      return getMockDocumentTemplates();
    }
  } else {
    return getMockDocumentTemplates();
  }
}

async function getMockDocumentTemplates(): Promise<DocumentTemplate[]> {
  if (typeof window === "undefined") return [];
  const list = getMockStorage<DocumentTemplate[]>("mock_document_templates", []);
  if (list.length === 0) {
    // Fetch defaults
    const defaults = await seedDefaultTemplatesFromFiles();
    setMockStorage("mock_document_templates", defaults);
    return defaults;
  }
  return list;
}

async function seedDefaultTemplatesFromFiles(): Promise<DocumentTemplate[]> {
  const codes = ["offer_letter", "certificate", "project_report"];
  const names: Record<string, string> = {
    offer_letter: "Offer Letter",
    certificate: "Internship Certificate",
    project_report: "Project Report"
  };
  const files: Record<string, string> = {
    offer_letter: "offer_letter.html",
    certificate: "certificate.html",
    project_report: "project_report.html"
  };
  
  const templates = await Promise.all(
    codes.map(async (code) => {
      let html = "";
      try {
        const res = await fetch(`/templates/${files[code]}`);
        if (res.ok) {
          html = await res.text();
        } else {
          throw new Error(`Fetch status ${res.status}`);
        }
      } catch (e) {
        console.warn(`Could not fetch template file for ${code}, using fallback:`, e);
        html = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 40px; background: #fafafa;"><div style="background: white; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 8px;"><h1>Internship ${names[code]}</h1><hr/><p>Student Name: <strong>{{STUDENT_NAME}}</strong></p><p>College Name: <strong>{{COLLEGE_NAME}}</strong></p><p>Internship Track: <strong>{{INTERNSHIP_TITLE}}</strong></p><p>Grade: <strong>{{GRADE}}</strong></p><p>Verification ID: <strong>{{VERIFICATION_ID}}</strong></p></div></body></html>`;
      }
      
      return {
        id: `dt-${code}`,
        code,
        name: names[code],
        html_content: html,
        is_visible: true,
        updated_at: new Date().toISOString()
      };
    })
  );
  return templates;
}

export async function getDocumentTemplateByCode(code: string): Promise<DocumentTemplate | null> {
  const list = await getDocumentTemplates();
  return list.find((t) => t.code === code) || null;
}

export async function saveDocumentTemplate(code: string, htmlContent: string, isVisible: boolean): Promise<DocumentTemplate> {
  const updatedTpl = {
    code,
    html_content: htmlContent,
    is_visible: isVisible,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .update({
          html_content: htmlContent,
          is_visible: isVisible,
          updated_at: updatedTpl.updated_at
        })
        .eq("code", code)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("saveDocumentTemplate failed, falling back to mock:", err);
      return saveDocumentTemplateMock(code, htmlContent, isVisible);
    }
  } else {
    return saveDocumentTemplateMock(code, htmlContent, isVisible);
  }
}

function saveDocumentTemplateMock(code: string, htmlContent: string, isVisible: boolean): DocumentTemplate {
  const list = getMockStorage<DocumentTemplate[]>("mock_document_templates", []);
  const idx = list.findIndex((t) => t.code === code);
  
  const templateName = code === "offer_letter" ? "Offer Letter" : code === "certificate" ? "Internship Certificate" : "Project Report";
  
  const saved: DocumentTemplate = {
    id: idx !== -1 ? list[idx].id : `dt-${code}`,
    code,
    name: idx !== -1 ? list[idx].name : templateName,
    html_content: htmlContent,
    is_visible: isVisible,
    updated_at: new Date().toISOString()
  };

  if (idx !== -1) {
    list[idx] = saved;
  } else {
    list.push(saved);
  }
  setMockStorage("mock_document_templates", list);
  return saved;
}




