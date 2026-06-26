/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
import { supabase, isSupabaseConfigured } from "./client";
import { getCurrentUser } from "./auth";

// Cache storage for optimized requests
const dbCache: Record<string, { data: any; expiry: number }> = {};
export const CACHE_TTL = {
  short: 15 * 1000,    // 15 seconds
  medium: 60 * 1000,   // 1 minute
  long: 5 * 60 * 1000, // 5 minutes
};

export function getCachedData<T>(key: string): T | null {
  if (typeof window !== "undefined") {
    try {
      const cachedStr = sessionStorage.getItem(`db_cache_${key}`);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && cached.expiry > Date.now()) {
          return cached.data as T;
        }
        sessionStorage.removeItem(`db_cache_${key}`);
      }
    } catch (e) {
      console.warn("Failed to read from sessionStorage cache:", e);
    }
  }

  const cached = dbCache[key];
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  delete dbCache[key];
  return null;
}

export function setCachedData<T>(key: string, data: T, ttl: number) {
  const expiry = Date.now() + ttl;
  dbCache[key] = {
    data,
    expiry
  };

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`db_cache_${key}`, JSON.stringify({ data, expiry }));
    } catch (e) {
      console.warn("Failed to write to sessionStorage cache:", e);
    }
  }
}

export function invalidateCacheKey(keyPrefix: string) {
  Object.keys(dbCache).forEach((key) => {
    if (key.startsWith(keyPrefix)) {
      delete dbCache[key];
    }
  });

  if (typeof window !== "undefined") {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`db_cache_${keyPrefix}`)) {
          sessionStorage.removeItem(key);
          i--; // Adjust index since we removed an item
        }
      }
    } catch (e) {
      console.warn("Failed to invalidate sessionStorage cache:", e);
    }
  }
}

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

export interface ResultChangeHistory {
  id: string;
  admin_id: string;
  student_id: string;
  test_result_id: string;
  field_name: string;
  previous_value: string | null;
  new_value: string | null;
  changed_at: string;
}



export interface DocumentTemplate {
  id: string;
  code: string;
  name: string;
  html_content: string;
  is_visible: boolean;
  updated_at: string;
  internship_id?: string | null;
}

export interface SupportTicket {
  id: string;
  student_id: string;
  subject: string;
  description: string;
  category: string;
  status: "open" | "in_progress" | "resolved";
  admin_reply?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
}




// -------------------------------------------------------------
// DEFAULT MOCK DATA POPULATORS
// -------------------------------------------------------------
const DEFAULT_INTERNSHIPS: Internship[] = [
  {
    id: "int-web-dev",
    title: "Web Development",
    description: "Build responsive, high-performance web applications using modern web technologies. Focus on frontend layout systems, JavaScript/TypeScript framework architectures, and practical API integration.",
    requirements: ["HTML5, CSS3, ES6+ JavaScript", "Basic understanding of React/Next.js frameworks", "8 Real-world Projects requirement"],
    duration: "120 Hrs",
    category: "Engineering",
  },
  {
    id: "int-python",
    title: "Python Programming",
    description: "Master the fundamentals of Python programming, core automation script design, object-oriented concepts, and API creation. Focus on practical scripting models.",
    requirements: ["Basic algorithmic thinking", "5 Scripting Projects requirement", "Level: Beginner to Intermediate"],
    duration: "120 Hrs",
    category: "Development",
  },
  {
    id: "int-ai",
    title: "Artificial Intelligence",
    description: "Design, build, and deploy machine learning and deep learning models. Focus on neural networks, natural language processing, and computer vision architectures.",
    requirements: ["Strong Python skills & basic statistics", "4 ML/Deep Learning Models requirement", "Level: Advanced"],
    duration: "120 Hrs",
    category: "Data & AI",
  },
  {
    id: "int-cybersec",
    title: "Cyber Security",
    description: "Understand security protocols, network defenses, vulnerability auditing, and penetration testing methodologies. Focus on ethical hacking controls.",
    requirements: ["Basic networking concepts (TCP/IP)", "6 Penetration Testing Audits requirement", "Level: Intermediate"],
    duration: "120 Hrs",
    category: "Security",
  },
  {
    id: "int-datasci",
    title: "Data Science",
    description: "Analyze complex datasets, configure automated ETL data pipelines, create interactive analytics dashboards, and draw statistical inferences.",
    requirements: ["Python data analysis libraries (pandas)", "5 Data Analysis Pipelines requirement", "Level: Intermediate to Advanced"],
    duration: "120 Hrs",
    category: "Data & AI",
  },
  {
    id: "int-digimark",
    title: "Digital Marketing",
    description: "Design high-conversion SEO optimization layouts, run test ad campaigns, manage search metrics, and analyze consumer conversions.",
    requirements: ["Basic digital platforms literacy", "3 SEO & Ad Campaign Audits requirement", "Level: Beginner"],
    duration: "120 Hrs",
    category: "Business",
  },
  {
    id: "int-uiux",
    title: "UI/UX Product Design",
    description: "Design interactive user flows, build high-fidelity interactive wireframes, and design clean system typography. Focus on human-centered design structures.",
    requirements: ["Figma design tool fundamentals", "4 High-Fidelity Prototypes requirement", "Level: Beginner to Intermediate"],
    duration: "120 Hrs",
    category: "Design",
  },
  {
    id: "int-cloud",
    title: "Cloud Computing",
    description: "Deploy and manage secure virtual machines, setup scale load balancers, configure database instances, and audit cloud network architecture.",
    requirements: ["Basic virtual hosting concepts", "5 Cloud Deployment Architectures requirement", "Level: Intermediate"],
    duration: "120 Hrs",
    category: "Engineering",
  },
  {
    id: "int-finance",
    title: "Finance & Accounting",
    description: "Analyze corporate financial statements, build portfolio valuation models, audit ledger compliance, and write tax compliance files.",
    requirements: ["Spreadsheets and financial auditing formulas", "3 Portfolio Valuation Reports requirement", "Level: Beginner to Intermediate"],
    duration: "120 Hrs",
    category: "Business",
  },
  {
    id: "int-hr",
    title: "Human Resources (HR)",
    description: "Design corporate hiring pipelines, organize employee onboarding documents, manage payroll records, and draft compliance policy manuals.",
    requirements: ["Corporate communication & documentation skills", "4 Corporate Hiring Pipelines requirement", "Level: Beginner"],
    duration: "120 Hrs",
    category: "Business",
  },
  {
    id: "int-entrepreneur",
    title: "Entrepreneurship",
    description: "Construct modern business model canvas sheets, outline startup validation checkpoints, audit market research reports, and practice venture pitch decks.",
    requirements: ["Innovative business planning logic", "2 Business Model Canvas Plans requirement", "Level: Intermediate"],
    duration: "120 Hrs",
    category: "Management",
  }
];

const DEFAULT_QUESTIONS: Record<string, Omit<Question, "id">[]> = {
  "int-web-dev": [
    { internship_id: "int-web-dev", question_text: "Which hook is used to perform side effects in a React functional component?", options: ["useState", "useEffect", "useContext", "useReducer"], correct_option_index: 1 },
    { internship_id: "int-web-dev", question_text: "What does Next.js App Router use to render components on the server by default?", options: ["Client Components", "Server Components", "Static Site Generation", "Incremental Site Regeneration"], correct_option_index: 1 },
    { internship_id: "int-web-dev", question_text: "Which CSS property is used to set the spacing inside an element?", options: ["margin", "padding", "border", "gap"], correct_option_index: 1 },
    { internship_id: "int-web-dev", question_text: "In React, what is the purpose of the 'key' prop in list items?", options: ["To style elements differently", "To identify elements uniquely for reconciliation", "To bind click events", "To store metadata"], correct_option_index: 1 },
    { internship_id: "int-web-dev", question_text: "What does CSS glassmorphism typically rely on for its translucent blur effect?", options: ["filter: blur()", "backdrop-filter: blur()", "opacity: 0.5", "background-color: transparent"], correct_option_index: 1 },
    { internship_id: "int-web-dev", question_text: "Which HTML5 semantic element is recommended to wrap the main content of a page?", options: ["div", "section", "main", "article"], correct_option_index: 2 },
    { internship_id: "int-web-dev", question_text: "What is the primary function of the 'flex-shrink' property in CSS Flexbox?", options: ["Specifies how much a flex item will shrink relative to the rest", "Forces items to wrap to a new line", "Sets the initial width of a flex item", "Prevents items from expanding"], correct_option_index: 0 },
    { internship_id: "int-web-dev", question_text: "How do you prevent a form from submitting and reloading the page using JavaScript?", options: ["e.stopImmediatePropagation()", "e.stopPropagation()", "e.preventDefault()", "return false;"], correct_option_index: 2 },
    { internship_id: "int-web-dev", question_text: "What is the difference between the '==' and '===' comparison operators in JavaScript?", options: ["'===' checks both value and type, while '==' only checks value", "'==' checks both value and type, while '===' only checks value", "There is no functional difference", "'===' is only for objects, '==' is for primitives"], correct_option_index: 0 },
    { internship_id: "int-web-dev", question_text: "Which CSS position value keeps an element relative to the viewport even when scrolling?", options: ["absolute", "relative", "sticky", "fixed"], correct_option_index: 3 }
  ],
  "int-python": [
    { internship_id: "int-python", question_text: "What is the correct output of print(type([])) in Python?", options: ["<class 'dict'>", "<class 'tuple'>", "<class 'list'>", "<class 'set'>"], correct_option_index: 2 },
    { internship_id: "int-python", question_text: "Which keyword is used in Python to define a custom reusable function?", options: ["func", "function", "def", "define"], correct_option_index: 2 },
    { internship_id: "int-python", question_text: "What is the recommended pythonic way to open a file to ensure it gets closed automatically?", options: ["open('file.txt')", "with open('file.txt') as f:", "try open('file.txt')", "file.open('file.txt')"], correct_option_index: 1 },
    { internship_id: "int-python", question_text: "How do you check if an item 'x' exists in a Python list named 'my_list'?", options: ["if x exists in my_list:", "if my_list.has(x):", "if x in my_list:", "if my_list.contains(x):"], correct_option_index: 2 },
    { internship_id: "int-python", question_text: "Which list method is used to remove and return the last element in Python?", options: ["remove()", "pop()", "delete()", "discard()"], correct_option_index: 1 },
    { internship_id: "int-python", question_text: "Which of the following sequence types is immutable in Python?", options: ["list", "dict", "set", "tuple"], correct_option_index: 3 },
    { internship_id: "int-python", question_text: "How do you declare inheritance between a Child class and a Parent class in Python?", options: ["class Child extends Parent:", "class Child(Parent):", "class Child implements Parent:", "class Child inherits Parent:"], correct_option_index: 1 },
    { internship_id: "int-python", question_text: "What is PEP 8 in the context of Python development?", options: ["A package installer tool", "The style guide for writing Python code", "A performance optimization protocol", "A built-in database interface"], correct_option_index: 1 },
    { internship_id: "int-python", question_text: "What does the dict.get('nonexistent', 0) method return if 'nonexistent' is not a key in the dictionary?", options: ["None", "0", "KeyError", "False"], correct_option_index: 1 },
    { internship_id: "int-python", question_text: "Which built-in function returns the total number of items in a list or sequence in Python?", options: ["size()", "length()", "len()", "count()"], correct_option_index: 2 }
  ],
  "int-ai": [
    { internship_id: "int-ai", question_text: "Which activation function is most commonly used for the output layer of a binary classification neural network?", options: ["ReLU", "Sigmoid", "Tanh", "Softmax"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "In machine learning, what does the term 'epoch' represent during model training?", options: ["A single iteration over one batch of training data", "One full pass of the training algorithm through the entire dataset", "The time required to train a model", "The score of the evaluation metrics"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "Which of the following techniques is commonly used to prevent a model from overfitting the training data?", options: ["Increasing learning rate", "Regularization (e.g. Dropout)", "Removing validation data", "Adding more dimensions unchecked"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "What does the learning rate control in a gradient descent optimization algorithm?", options: ["The number of layers in the neural network", "The size of the steps taken towards the minimum of the loss function", "The batch size of the training dataset", "The validation split ratio"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "Which layer type in a Convolutional Neural Network (CNN) is primarily responsible for extracting spatial features from input images?", options: ["Dense Layer", "Convolutional Layer", "Pooling Layer", "Dropout Layer"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "Which Python library is highly standard for tokenization, stemming, and POS-tagging in Natural Language Processing (NLP)?", options: ["TensorFlow", "Scikit-Learn", "NLTK", "SciPy"], correct_option_index: 2 },
    { internship_id: "int-ai", question_text: "Which search algorithm is typically used in game playing trees to evaluate optimal moves for players?", options: ["Breadth-First Search", "Minimax", "Dijkstra's Algorithm", "Binary Search"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "What is the primary difference between Supervised and Unsupervised Learning?", options: ["Supervised uses labeled data; Unsupervised uses unlabeled data", "Supervised uses regression; Unsupervised uses classification", "Supervised is for deep learning; Unsupervised is for statistical models", "There is no difference in data labeling requirements"], correct_option_index: 0 },
    { internship_id: "int-ai", question_text: "What is the main objective of the Backpropagation algorithm in neural networks?", options: ["Generate new inputs dynamically", "Calculate gradients of the loss function to update network weights", "Select the optimal learning rate automatically", "Initialize weights to zero"], correct_option_index: 1 },
    { internship_id: "int-ai", question_text: "Which popular open-source deep learning framework was developed and is maintained by Google?", options: ["PyTorch", "TensorFlow", "Caffe", "Theano"], correct_option_index: 1 }
  ],
  "int-cybersec": [
    { internship_id: "int-cybersec", question_text: "What are the core components of the security model represented by the CIA Triad?", options: ["Control, Integrity, Authorization", "Confidentiality, Integrity, Availability", "Cryptography, Identification, Authentication", "Compliance, Inspection, Auditing"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "Which network protocol is standard for establishing a secure, encrypted shell connection to a remote server?", options: ["Telnet", "FTP", "SSH", "HTTP"], correct_option_index: 2 },
    { internship_id: "int-cybersec", question_text: "What type of attack involves injecting malicious commands into input fields to manipulate database queries?", options: ["Cross-Site Scripting (XSS)", "SQL Injection (SQLi)", "Man-in-the-Middle (MitM)", "Buffer Overflow"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "What is the default TCP port configuration for secure web browser communication over HTTPS?", options: ["80", "22", "8080", "443"], correct_option_index: 3 },
    { internship_id: "int-cybersec", question_text: "What is Phishing in the context of network security threat models?", options: ["Injecting viruses through network ports", "Social engineering attacks designed to trick users into revealing sensitive data", "Flooding servers with dummy request packets", "Cracking passwords using database tables"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "What is the key difference between Symmetric and Asymmetric encryption?", options: ["Symmetric uses one private key; Asymmetric uses a public-private key pair", "Symmetric uses public keys; Asymmetric uses private keys only", "Symmetric is slower than Asymmetric", "Symmetric does not use keys"], correct_option_index: 0 },
    { internship_id: "int-cybersec", question_text: "Which command-line tool is standard for auditing network interfaces and IP addresses in Linux systems?", options: ["ipconfig", "ifconfig", "netstat", "ping"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "What is Ransomware in cybersecurity categorization?", options: ["Malware that duplicates itself across hosts to hog resources", "Malware that encrypts candidate files and demands payment to release keys", "Adware that shows popup advertisements", "Spyware that records keystrokes"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "What is the primary architectural function of a network Firewall?", options: ["To speed up packet delivery speeds", "To filter incoming and outgoing traffic based on pre-established rules", "To translate domain names to host IPs", "To host virtual subnets"], correct_option_index: 1 },
    { internship_id: "int-cybersec", question_text: "What does 2FA stand for in user access configuration models?", options: ["Two-Factor Authorization", "Two-Factor Authentication", "Double Security File Check", "Twice Encrypted Login"], correct_option_index: 1 }
  ],
  "int-datasci": [
    { internship_id: "int-datasci", question_text: "Which Python library is widely considered the standard for structural data manipulation and analysis?", options: ["Matplotlib", "Pandas", "PyTorch", "NumPy"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "In statistical hypothesis testing, what does the p-value represent?", options: ["The probability that the alternate hypothesis is completely true", "The probability of observing results as extreme as the actual test under the null hypothesis", "The percentage of correct predictions in the model", "The margin of error in sample statistics"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "Which statistical metric describes the middle value dividing a sorted dataset into two equal halves?", options: ["Mean", "Median", "Mode", "Variance"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "What is Imputation in the context of data cleaning and pre-processing?", options: ["Removing duplicate records from tables", "Substituting missing values with estimated statistical values (like mean/median)", "Normalizing numeric fields", "Grouping logs by categorical labels"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "Which SQL clause is used to filter aggregated data records produced by a GROUP BY statement?", options: ["WHERE", "HAVING", "ORDER BY", "FILTER"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "What is the primary objective of scaling or normalizing numeric columns in data pre-processing?", options: ["To convert strings to integers", "To scale values to a common range to prevent size bias in models", "To remove outliers from the database", "To join tables on index keys"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "Which data visualization plot type is best suited to show the frequency distribution of a continuous variable?", options: ["Scatter Plot", "Histogram", "Line Chart", "Pie Chart"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "What is the difference between Mean Absolute Error (MAE) and Mean Squared Error (MSE)?", options: ["MAE squares errors; MSE uses absolute differences", "MSE penalizes larger errors more heavily than MAE by squaring the terms", "There is no difference between them", "MAE is only for classification models"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "What is the main objective of Linear Regression models?", options: ["Classify inputs into discrete labels", "Minimize the sum of squared differences between predictions and actual values", "Cluster datapoints into visual groups", "Reduce dimensions of datasets"], correct_option_index: 1 },
    { internship_id: "int-datasci", question_text: "Which of the following algorithms is an unsupervised clustering technique?", options: ["Logistic Regression", "Decision Tree", "K-Means", "Support Vector Machines"], correct_option_index: 2 }
  ],
  "int-digimark": [
    { internship_id: "int-digimark", question_text: "What does SEO stand for in search marketing terms?", options: ["Social Engagement Optimization", "Search Engine Optimization", "Search Engine Organization", "Site Evaluation Index"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "What does CTR stand for when evaluating digital advertisement campaigns?", options: ["Cost-Through-Rate", "Click-Through Rate", "Conversion-To-Reach", "Click-Target Ratio"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "Which Google platform tool is standard for analyzing traffic analytics, audience demographics, and conversion flows?", options: ["Google Ads", "Google Search Console", "Google Analytics", "Google Tag Manager"], correct_option_index: 2 },
    { internship_id: "int-digimark", question_text: "What does PPC stand for in search ad pricing models?", options: ["Pay-Per-Click", "Payment-Per-Campaign", "Point-Per-Click", "Price-Per-Conversion"], correct_option_index: 0 },
    { internship_id: "int-digimark", question_text: "What is the purpose of Meta Tags in the HTML header of websites?", options: ["To load analytics script frameworks", "To provide metadata descriptions that help search engines index the page", "To style text components", "To redirect users to sub-sites"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "In analytics console indices, what does the Bounce Rate represent?", options: ["The percentage of visitors who purchase items on their first click", "The percentage of visitors who leave the site after viewing only a single page", "The speed at which packets load on mobile viewports", "The rate of repeated ad impressions"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "What is a primary Key Performance Indicator (KPI) for email marketing outreach?", options: ["Page load speed", "Open and Click-Through Rates", "Domain authority score", "CPC margin"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "What does CTA stand for in UI button layout guidelines?", options: ["Click-To-Action", "Call to Action", "Client Target Area", "Clear Text Alignment"], correct_option_index: 1 },
    { internship_id: "int-digimark", question_text: "Which platform is highly recommended for running B2B targeted visual advertisement campaigns?", options: ["TikTok", "Instagram", "LinkedIn", "Pinterest"], correct_option_index: 2 },
    { internship_id: "int-digimark", question_text: "What is the primary goal of SEO keyword research?", options: ["To find high-volume search phrases with lower bidding competition", "To write database SQL indexing scripts", "To register domain names", "To encrypt user password keys"], correct_option_index: 0 }
  ],
  "int-uiux": [
    { internship_id: "int-uiux", question_text: "What is the primary focus of User Experience (UX) design?", options: ["To select visual branding color themes", "To optimize the usability, structure, and user satisfaction of digital products", "To write responsive HTML styling rules", "To scale databases to handle traffic"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is a Wireframe in product design lifecycles?", options: ["The final high-fidelity clickable visual prototype", "A low-fidelity structural blueprint mapping screen layouts", "The CSS styling rules sheet", "A database relationship map"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is the purpose of building a User Persona in UX research?", options: ["To mock server connections", "To create a fictional profile representing target user archetypes and behaviors", "To create user authentication database tables", "To design responsive logo designs"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What does the UX design principle of 'Proximity' advocate for?", options: ["Placing unrelated elements near each other", "Grouping related layout items close to each other to show correlation", "Making buttons as large as possible", "Using high contrast colors"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is the recommended range for web typography line-height to ensure optimal text readability?", options: ["1.0 to 1.2 times font size", "1.4 to 1.6 times font size", "2.0 to 2.5 times font size", "Only fixed pixel values"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "Which Figma feature is standard for creating reusable, nested design assets like buttons or text templates?", options: ["Frames", "Components and Variants", "Groups", "Vector Networks"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is the UX research method of 'Card Sorting' primarily used to evaluate?", options: ["Color contrast ratios", "Information architecture and navigation structures", "Database query speeds", "User authentication flows"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is meant by the 'Visual Weight' of a layout element?", options: ["Its actual size file in kilobytes", "Its ability to draw the user's attention based on color, size, or contrast", "The depth of its shadows", "The font thickness in CSS classes"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What does the Mobile-First design strategy recommend?", options: ["Writing mobile apps before web codes", "Designing layouts for the smallest screens first before scaling up to desktop screens", "Optimizing only for Android devices", "Using only mobile frameworks"], correct_option_index: 1 },
    { internship_id: "int-uiux", question_text: "What is the primary objective of A/B Testing in UX product validation?", options: ["Comparing database performance across instances", "Comparing two versions of a design layout to evaluate which drives higher user conversions", "Testing code compilation in Next.js", "Validating SSL encryption certificates"], correct_option_index: 1 }
  ],
  "int-cloud": [
    { internship_id: "int-cloud", question_text: "What does SaaS stand for in cloud delivery service models?", options: ["System-as-a-Service", "Software as a Service", "Storage-as-a-Service", "Serverless-as-a-Service"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "Which cloud service model automatically adjusts active compute capacity based on live load demands?", options: ["Static Hosting", "Auto Scaling", "Virtual Private Network", "Content Delivery Network"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "Which primary Amazon Web Services (AWS) offering represents customizable, virtual machine compute instances?", options: ["S3", "EC2", "RDS", "Lambda"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "What is the core concept of Virtualization in modern cloud architectures?", options: ["Writing simulations of network adapters", "Running multiple virtual, isolated operating systems on a single physical host machine", "Streaming video layouts to mobile devices", "Encrypting keys on external hard drives"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "What is the safest strategy to ensure database high availability in production environments?", options: ["Taking daily snapshots manually", "Configuring multi-region real-time database replication", "Hiring more database admins", "Restricting access to admin logins only"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "What is the defining concept of Serverless Computing?", options: ["Running apps without database instances", "Executing backend code dynamically in microsecond containers where servers are managed entirely by the cloud host", "Deploying static HTML templates only", "Hosting software locally on PCs"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "Which standard TCP port is configured for secure SSH connection to a virtual Linux instance?", options: ["80", "21", "22", "443"], correct_option_index: 2 },
    { internship_id: "int-cloud", question_text: "What is the primary function of Identity and Access Management (IAM) in cloud networks?", options: ["To track domain names ip indices", "To manage user roles, permission policies, and secure API resource accesses", "To back up database tables", "To balance virtual network packet routers"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "Which storage type is optimal for unstructured media, files, and static templates (e.g. AWS S3)?", options: ["Block Storage", "Object Storage", "File Storage", "Relational Database Tables"], correct_option_index: 1 },
    { internship_id: "int-cloud", question_text: "What is the primary function of a Domain Name System (DNS)?", options: ["To scale cloud virtual machine sizes", "To translate human-readable domain names (like google.com) to machine-readable IP addresses", "To encrypt user password keys", "To backup database tables in parallel"], correct_option_index: 1 }
  ],
  "int-finance": [
    { internship_id: "int-finance", question_text: "What is the foundational equation representing balance sheet structures in accounting?", options: ["Assets = Liabilities - Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "Which financial document displays a company's total revenues and expenses over a specific duration?", options: ["Balance Sheet", "Income Statement", "Statement of Cash Flows", "General Ledger Book"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What does Liquidity represent when evaluating corporate financial metrics?", options: ["The total amount of debt a company holds", "How quickly and easily an asset can be converted into cash without value loss", "The tax rate applicable to corporate assets", "The volatility of stock market prices"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What is the accounting term for the systematic decrease in the recorded value of a tangible asset over its lifespan?", options: ["Amortization", "Depreciation", "Valuation Loss", "Write-Off"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What does the Return on Assets (ROA) metric measure?", options: ["The percentage of assets funded by liability debts", "How efficiently a corporation generates profits relative to its total assets", "The rate of cash flow generation", "The growth rate of investment capital"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What is the primary accounting purpose of maintaining a General Ledger?", options: ["To record employee payroll timesheets", "To keep a complete, chronological record of all financial transactions of a business", "To outline target marketing campaign budgets", "To compile corporate bylaws manuals"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What is the mathematical formula used to calculate a business's Net Working Capital?", options: ["Total Assets minus Total Liabilities", "Current Assets minus Current Liabilities", "Cash Balance minus Accounts Payable", "Revenue minus Operating Expenses"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What does the Double-Entry bookkeeping standard require?", options: ["All entries must be approved by two accounting specialists", "Every transaction must have a corresponding, balanced debit and credit entry", "Logging transactions twice in database systems", "Filing tax compliance reports twice annually"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "What is the primary function of a corporate Balance Sheet?", options: ["To track cash inflows and outflows monthly", "To show the financial position, assets, and liabilities of a business at a specific point in time", "To project future sales targets", "To record detailed payroll transactions"], correct_option_index: 1 },
    { internship_id: "int-finance", question_text: "In corporate investment analysis, what does NPV stand for?", options: ["Net Profit Value", "Net Present Value", "Normal Portfolio Valuation", "Net Performance Variable"], correct_option_index: 1 }
  ],
  "int-hr": [
    { internship_id: "int-hr", question_text: "What is the meaning of Onboarding in human resource management?", options: ["Firing employees for policy violations", "The process of integrating, welcoming, and training a new employee into the company", "Designing visual layouts for recruiting", "Setting up payroll bank accounts"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "Which HR metric measures the speed and efficiency of the corporate hiring process?", options: ["Attrition Rate", "Time-to-Hire", "Cost-per-Ad", "Training Return Rate"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What does Employee Turnover or Attrition represent in corporate management?", options: ["The rate at which employees are promoted", "The rate at which employees leave the organization and need replacement", "The total sales generated per employee", "The frequency of employee training cycles"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What is the primary focus of a Performance Appraisal system?", options: ["To structure employee health insurance packages", "To evaluate job performance, review achievements, and provide constructive feedback", "To log daily office attendance hours", "To draft new hiring job descriptions"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What are Soft Skills in HR candidate valuation criteria?", options: ["Knowledge of software programming languages", "Interpersonal attributes, communication skills, and emotional intelligence", "Speed of typing on keyboard interfaces", "Accounting and auditing calculations"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What is a Job Description (JD) primarily designed to do?", options: ["To calculate monthly tax withholdings", "To outline the core duties, responsibilities, reporting structure, and qualifications of a role", "To evaluate corporate performance metrics", "To store employee home address fields"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What components are managed under a corporate 'Compensation and Benefits' framework?", options: ["Only base salary calculations", "The combination of direct salary, bonuses, insurance, pensions, and perks", "Office desk and compute hardware setups", "Employee legal compliance audit records"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What is the defining feature of a 360-Degree Feedback appraisal system?", options: ["Using automated camera interfaces for feedback", "Gathering performance feedback from peers, subordinates, managers, and self-evaluation", "Giving feedback only to executives", "Conducting performance audits twice a month"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What is the main objective of maintaining HR Legal Compliance?", options: ["To increase company sales margins", "To ensure company operations adhere to labor standards, safety laws, and anti-bias policies", "To automate database backups", "To manage corporate social media profiles"], correct_option_index: 1 },
    { internship_id: "int-hr", question_text: "What is Succession Planning in corporate leadership development?", options: ["Scheduling daily business meetings", "Identifying and training high-potential employees to step into key leadership roles in the future", "Calculating retirement insurance packages", "Managing company tax audits in parallel"], correct_option_index: 1 }
  ],
  "int-entrepreneur": [
    { internship_id: "int-entrepreneur", question_text: "In startup validation methodologies, what does MVP stand for?", options: ["Most Valuable Partner", "Minimum Viable Product", "Market Volume Predictor", "Minimum Valuation Pricing"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What business modeling canvas template is standard for mapping out a startup's key activities, value propositions, and customer segments?", options: ["Spreadsheet Gantt Chart", "Business Model Canvas (BMC)", "Corporate Org Chart", "Balance Sheet Statement"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What does the startup term 'Pivot' represent?", options: ["Shutting down operations permanently due to funding lack", "A strategic change in business model, product design, or target market direction based on validation feedback", "Hiring a new chief executive", "Filing tax compliance paperwork"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What does Bootstrapping represent in startup financing classification?", options: ["Getting large venture capital checks early", "Funding and growing a company using personal savings and operational revenues without external investment", "Securing government research grants", "Borrowing bank loan capitals"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What is the primary visual function of a Startup Pitch Deck?", options: ["To record chronological ledger entries", "To present the business vision, product, market size, and model to get investor funding", "To display code guidelines to developers", "To map user design wireframe flows"], correct_option_index: 2 },
    { internship_id: "int-entrepreneur", question_text: "What does Customer Acquisition Cost (CAC) measure?", options: ["The sales price of the product to customers", "The total marketing and sales resources spent to acquire a single new customer", "The customer service cost per support query", "The pricing of server virtual hosting"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What is the Break-Even Point in startup financial projection audits?", options: ["The point where the startup runs out of investment capital", "The sales volume or revenue level where total business revenues equal total operational costs", "The target valuation of equity shares", "The tax rate applicable to corporate assets"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What is the Value Proposition of a startup business model?", options: ["The calculated value of all corporate assets", "The unique, compelling value, benefits, and problem-solving a business promises to deliver to its consumers", "The stock market valuation price", "The salary packages offered to employees"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What is the term for a private startup company that reaches a market valuation of $1 billion or more?", options: ["Decacorn", "Unicorn", "Blue Chip", "Venture Lead"], correct_option_index: 1 },
    { internship_id: "int-entrepreneur", question_text: "What is the primary goal of Market Segmentation in customer discovery models?", options: ["To write database SQL indexing scripts", "To divide a broad consumer target market into specific subgroups sharing similar needs or traits", "To scale virtual machine size in cloud environments", "To hire marketing specialists for ad campaigns"], correct_option_index: 1 }
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
  const cacheKey = "internships_all";
  const cached = getCachedData<Internship[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("getInternships query failed, falling back to mock data:", error);
        const list = getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
        const mapped = list.map(item => ({ ...item, duration: "120 Hrs" }));
        setCachedData(cacheKey, mapped, CACHE_TTL.long);
        return mapped;
      }

      // If on client-side and the loaded list is empty or has fewer tracks than defaults,
      // trigger the differential synchronizer to seed missing defaults.
      if (typeof window !== "undefined" && (!data || data.length < DEFAULT_INTERNSHIPS.length)) {
        console.log("Fewer internships found than defaults. Auto-synchronizing...");
        await seedDatabase();
        const { data: updatedData } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
        if (updatedData && updatedData.length > 0) {
          const mapped = updatedData.map(item => ({ ...item, duration: "120 Hrs" }));
          setCachedData(cacheKey, mapped, CACHE_TTL.long);
          return mapped;
        }
      }

      if (!data || data.length === 0) {
        const list = getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
        const mapped = list.map(item => ({ ...item, duration: "120 Hrs" }));
        setCachedData(cacheKey, mapped, CACHE_TTL.long);
        return mapped;
      }
      const mapped = data.map(item => ({ ...item, duration: "120 Hrs" }));
      setCachedData(cacheKey, mapped, CACHE_TTL.long);
      return mapped;
    } catch (err) {
      console.warn("getInternships failed, falling back to mock data:", err);
      const list = getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
      const mapped = list.map(item => ({ ...item, duration: "120 Hrs" }));
      setCachedData(cacheKey, mapped, CACHE_TTL.long);
      return mapped;
    }
  } else {
    if (typeof window !== "undefined") {
      const list = getMockStorage<Internship[]>("mock_internships", DEFAULT_INTERNSHIPS);
      if (list.length < DEFAULT_INTERNSHIPS.length) {
        console.log("Fewer mock internships found in local storage. Auto-synchronizing mock database...");
        
        // 1. Overwrite mock_internships
        localStorage.setItem("mock_internships", JSON.stringify(DEFAULT_INTERNSHIPS));

        // 2. Overwrite mock_questions
        const allMockQs: Question[] = [];
        for (const [internId, qList] of Object.entries(DEFAULT_QUESTIONS)) {
          qList.forEach((q, idx) => {
            allMockQs.push({
              ...q,
              id: `q-${internId}-${idx}`
            } as Question);
          });
        }
        localStorage.setItem("mock_questions", JSON.stringify(allMockQs));

        // 3. Overwrite mock_document_templates
        const defaults = await seedDefaultTemplatesFromFiles();
        localStorage.setItem("mock_document_templates", JSON.stringify(defaults));

        const mapped = DEFAULT_INTERNSHIPS.map(item => ({ ...item, duration: "120 Hrs" }));
        setCachedData(cacheKey, mapped, CACHE_TTL.long);
        return mapped;
      }
      const mapped = list.map(item => ({ ...item, duration: "120 Hrs" }));
      setCachedData(cacheKey, mapped, CACHE_TTL.long);
      return mapped;
    }
    const mapped = DEFAULT_INTERNSHIPS.map(item => ({ ...item, duration: "120 Hrs" }));
    setCachedData(cacheKey, mapped, CACHE_TTL.long);
    return mapped;
  }
}

export async function getInternshipById(id: string): Promise<Internship | null> {
  const cacheKey = `internship_${id}`;
  const cached = getCachedData<Internship>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("internships").select("*").eq("id", id).single();
      if (error) {
        console.warn("getInternshipById query failed, falling back to mock data:", error);
        const list = await getInternships();
        const found = list.find((i) => i.id === id) || null;
        if (found) setCachedData(cacheKey, found, CACHE_TTL.long);
        return found;
      }
      if (data) setCachedData(cacheKey, data, CACHE_TTL.long);
      return data;
    } catch (err) {
      console.warn("getInternshipById failed, falling back to mock data:", err);
      const list = await getInternships();
      const found = list.find((i) => i.id === id) || null;
      if (found) setCachedData(cacheKey, found, CACHE_TTL.long);
      return found;
    }
  } else {
    const list = await getInternships();
    const found = list.find((i) => i.id === id) || null;
    if (found) setCachedData(cacheKey, found, CACHE_TTL.long);
    return found;
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
  // Invalidate internship caches
  invalidateCacheKey("internships_");
  if (internship.id) {
    invalidateCacheKey(`internship_${internship.id}`);
  }

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
        
        // Auto-seed document templates for the new internship track
        try {
          await seedTemplatesForInternship(data.id);
        } catch (seedErr) {
          console.error("Auto-seeding templates failed:", seedErr);
        }
        
        return data;
      }
    } catch (err) {
      console.warn("saveInternship to Supabase failed, falling back to mock:", err);
      const isNew = !internship.id;
      const res = saveInternshipMock(internship);
      if (isNew) {
        seedTemplatesForInternship(res.id).catch(console.error);
      }
      return res;
    }
  } else {
    const isNew = !internship.id;
    const res = saveInternshipMock(internship);
    if (isNew) {
      seedTemplatesForInternship(res.id).catch(console.error);
    }
    return res;
  }
}

export async function deleteInternship(id: string): Promise<boolean> {
  // Invalidate internship caches
  invalidateCacheKey("internships_");
  invalidateCacheKey(`internship_${id}`);

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
  const cacheKey = `questions_${internshipId}`;
  const cached = getCachedData<Question[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("internship_id", internshipId);
      if (error) {
        console.warn("getQuestions query failed, falling back to mock data:", error);
        const fallback = getMockQuestionsFallback(internshipId);
        setCachedData(cacheKey, fallback, CACHE_TTL.medium);
        return fallback;
      }
      if (!data || data.length === 0) {
        const fallback = getMockQuestionsFallback(internshipId);
        setCachedData(cacheKey, fallback, CACHE_TTL.medium);
        return fallback;
      }
      const questionsList = data || [];
      setCachedData(cacheKey, questionsList, CACHE_TTL.medium);
      return questionsList;
    } catch (err) {
      console.warn("getQuestions failed, falling back to mock data:", err);
      const fallback = getMockQuestionsFallback(internshipId);
      setCachedData(cacheKey, fallback, CACHE_TTL.medium);
      return fallback;
    }
  } else {
    const fallback = getMockQuestionsFallback(internshipId);
    setCachedData(cacheKey, fallback, CACHE_TTL.medium);
    return fallback;
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
  // Invalidate questions cache
  invalidateCacheKey("questions_");

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
  // Invalidate questions cache
  invalidateCacheKey("questions_");

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
export async function generateReferenceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const prefix = `SI-${year}-`;
  let nextNumber = 1;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("reference_number")
        .not("reference_number", "is", null)
        .like("reference_number", `${prefix}%`);
      
      if (!error && data) {
        let maxNum = 0;
        for (const row of data) {
          const refNum = row.reference_number;
          if (refNum && refNum.startsWith(prefix)) {
            const suffixStr = refNum.substring(prefix.length);
            const num = parseInt(suffixStr, 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
        nextNumber = maxNum + 1;
      }
    } catch (err) {
      console.warn("Failed to fetch reference numbers from Supabase, falling back:", err);
    }
  }

  // Double check uniqueness in local storage mock if in browser / mock mode
  if (typeof window !== "undefined") {
    try {
      const list = getMockStorage<TestResult[]>("mock_test_results", []);
      let maxNum = 0;
      for (const res of list) {
        const refNum = res.reference_number;
        if (refNum && refNum.startsWith(prefix)) {
          const suffixStr = refNum.substring(prefix.length);
          const num = parseInt(suffixStr, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      nextNumber = Math.max(nextNumber, maxNum + 1);
    } catch (err) {
      console.warn("Failed to check uniqueness in mock storage:", err);
    }
  }

  let finalCertNumber = `${prefix}${String(nextNumber).padStart(6, "0")}`;
  let attempt = 1;
  while (true) {
    let exists = false;
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from("test_results")
        .select("id")
        .eq("reference_number", finalCertNumber)
        .maybeSingle();
      if (data) exists = true;
    }
    if (!exists && typeof window !== "undefined") {
      const list = getMockStorage<TestResult[]>("mock_test_results", []);
      if (list.some((r) => r.reference_number === finalCertNumber)) {
        exists = true;
      }
    }
    if (!exists) {
      break;
    }
    nextNumber++;
    finalCertNumber = `${prefix}${String(nextNumber).padStart(6, "0")}`;
    attempt++;
    if (attempt > 100) {
      const randomSuffix = String(Math.floor(100000 + Math.random() * 900000));
      finalCertNumber = `${prefix}${randomSuffix}`;
      break;
    }
  }

  return finalCertNumber;
}

// -------------------------------------------------------------
// TEST RESULTS & CERTIFICATE OPERATIONS
// -------------------------------------------------------------
export async function getTestResults(studentId?: string): Promise<TestResult[]> {
  const cacheKey = `test_results_${studentId || 'all'}`;
  const cached = getCachedData<TestResult[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("test_results").select("*, profiles(full_name), internships(title)");
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      const { data, error } = await query.order("completed_at", { ascending: false });
      if (error) {
        console.warn("getTestResults query failed, falling back to mock data:", error);
        const fallback = await getMockTestResultsFallback(studentId);
        setCachedData(cacheKey, fallback, CACHE_TTL.short);
        return fallback;
      }
      
      const mapped = (data || []).map((r: any) => ({
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
      setCachedData(cacheKey, mapped, CACHE_TTL.short);
      return mapped;
    } catch (err) {
      console.warn("getTestResults failed, falling back to mock data:", err);
      const fallback = await getMockTestResultsFallback(studentId);
      setCachedData(cacheKey, fallback, CACHE_TTL.short);
      return fallback;
    }
  } else {
    const fallback = await getMockTestResultsFallback(studentId);
    setCachedData(cacheKey, fallback, CACHE_TTL.short);
    return fallback;
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
  const cacheKey = `test_result_${id}`;
  const cached = getCachedData<TestResult>(cacheKey);
  if (cached) return cached;

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
        const found = list.find((r) => r.id === id) || null;
        if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
        return found;
      }
      
      const mapped = {
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
      setCachedData(cacheKey, mapped, CACHE_TTL.short);
      return mapped;
    } catch (err) {
      console.warn("getTestResultById failed, falling back to mock data:", err);
      const list = await getTestResults();
      const found = list.find((r) => r.id === id) || null;
      if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
      return found;
    }
  } else {
    const list = await getTestResults();
    const found = list.find((r) => r.id === id) || null;
    if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
    return found;
  }
}

export async function verifyCertificate(refNum: string): Promise<TestResult | null> {
  const cleanRef = refNum.trim();
  const cacheKey = `verify_${cleanRef.toUpperCase()}`;
  const cached = getCachedData<TestResult>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*, profiles(full_name), internships(title)")
        .ilike("reference_number", cleanRef)
        .maybeSingle();
      if (error) {
        console.warn("verifyCertificate query failed, falling back to mock:", error);
        const list = await getTestResults();
        const found = list.find((r) => r.reference_number?.toUpperCase() === cleanRef.toUpperCase()) || null;
        if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
        return found;
      }
      if (!data) {
        const list = await getTestResults();
        const found = list.find((r) => r.reference_number?.toUpperCase() === cleanRef.toUpperCase()) || null;
        if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
        return found;
      }
      const mapped = {
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
      setCachedData(cacheKey, mapped, CACHE_TTL.short);
      return mapped;
    } catch (err) {
      console.warn("verifyCertificate failed, falling back to mock:", err);
      const list = await getTestResults();
      const found = list.find((r) => r.reference_number?.toUpperCase() === cleanRef.toUpperCase()) || null;
      if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
      return found;
    }
  } else {
    const list = await getTestResults();
    const found = list.find((r) => r.reference_number?.toUpperCase() === cleanRef.toUpperCase()) || null;
    if (found) setCachedData(cacheKey, found, CACHE_TTL.short);
    return found;
  }
}

export async function saveTestResult(res: Omit<TestResult, "id">): Promise<TestResult> {
  // Invalidate test results caches
  invalidateCacheKey("test_results_");
  invalidateCacheKey("verify_");
  invalidateCacheKey("test_result_");

  const reference_number = res.passed && !res.reference_number ? await generateReferenceNumber() : res.reference_number;
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
  const cacheKey = `student_profile_${userId}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.warn("getStudentProfile query failed, falling back to mock data:", error);
        const res = getMockProfileFallback(userId);
        setCachedData(cacheKey, res, CACHE_TTL.short);
        return res;
      }
      setCachedData(cacheKey, data, CACHE_TTL.short);
      return data;
    } catch (err) {
      console.warn("getStudentProfile failed, falling back to mock data:", err);
      const res = getMockProfileFallback(userId);
      setCachedData(cacheKey, res, CACHE_TTL.short);
      return res;
    }
  } else {
    const res = getMockProfileFallback(userId);
    setCachedData(cacheKey, res, CACHE_TTL.short);
    return res;
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
        .select("*")
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
  invalidateCacheKey("student_profile_");
  const sanitizedData: any = {};
  for (const key in data) {
    if (typeof data[key] === "string") {
      sanitizedData[key] = sanitizeInput(data[key]);
    } else {
      sanitizedData[key] = data[key];
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: updatedData, error } = await supabase
        .from("profiles")
        .update({
          ...sanitizedData,
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
    const sanitizedData: any = {};
    for (const key in data) {
      if (typeof data[key] === "string") {
        sanitizedData[key] = sanitizeInput(data[key]);
      } else {
        sanitizedData[key] = data[key];
      }
    }
    const updated = {
      ...profiles[idx],
      ...sanitizedData,
      profile_completed: true
    };
    profiles[idx] = updated;
    localStorage.setItem("mock_profiles", JSON.stringify(profiles));
    return { success: true, data: updated };
  }
  return { success: false };
}

export async function deleteProfile(id: string): Promise<boolean> {
  invalidateCacheKey("student_profile_");
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("deleteProfile query failed, falling back to mock:", err);
      return deleteMockProfileFallback(id);
    }
  } else {
    return deleteMockProfileFallback(id);
  }
}

function deleteMockProfileFallback(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getMockStorage<any[]>("mock_profiles", []);
  const filtered = list.filter((p) => p.id !== id);
  setMockStorage("mock_profiles", filtered);
  
  // delete related test results
  const results = getMockStorage<any[]>("mock_test_results", []);
  const filteredResults = results.filter((r) => r.student_id !== id);
  setMockStorage("mock_test_results", filteredResults);
  
  return true;
}

// -------------------------------------------------------------
// DATABASE INITIALIZATION / SEEDING UTILITY
// -------------------------------------------------------------
export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Sync local storage mock data
    if (typeof window !== "undefined") {
      try {
        // 1. Reset mock_internships
        localStorage.setItem("mock_internships", JSON.stringify(DEFAULT_INTERNSHIPS));

        // 2. Reset mock_questions
        const allMockQs: Question[] = [];
        for (const [internId, qList] of Object.entries(DEFAULT_QUESTIONS)) {
          qList.forEach((q, idx) => {
            allMockQs.push({
              ...q,
              id: `q-${internId}-${idx}`
            } as Question);
          });
        }
        localStorage.setItem("mock_questions", JSON.stringify(allMockQs));

        // 3. Reset mock_document_templates
        const defaults = await seedDefaultTemplatesFromFiles();
        localStorage.setItem("mock_document_templates", JSON.stringify(defaults));

        return {
          success: true,
          message: "Mock local storage database successfully reset and synchronized with all 11 tracks, 110 questions, and templates!"
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Failed to sync mock local storage: ${err.message || err}`
        };
      }
    }
    return { success: false, message: "Supabase is not configured. Running in Mock local mode." };
  }

  const client = supabase;
  if (!client) {
    return { success: false, message: "Supabase is not configured." };
  }

  try {
    let seededInternshipsCount = 0;
    let seededQuestionsCount = 0;

    // Fetch all existing internships to check which ones are missing
    const { data: existingInts, error: fetchErr } = await client.from("internships").select("id, title");
    if (fetchErr) {
      throw new Error(`Failed to check existing tables: ${fetchErr.message}. Ensure schema.sql has been run on Supabase SQL Editor.`);
    }

    const existingTitles = new Set((existingInts || []).map((i) => i.title.toLowerCase()));

    // 2. Loop through all 11 default internships
    for (const intern of DEFAULT_INTERNSHIPS) {
      let trackId = "";
      const isExisting = existingTitles.has(intern.title.toLowerCase());

      if (!isExisting) {
        // Insert the missing track
        const { data: newTrack, error: insertErr } = await client
          .from("internships")
          .insert({
            title: intern.title,
            description: intern.description,
            requirements: intern.requirements,
            duration: intern.duration,
            category: intern.category
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        trackId = newTrack.id;
        seededInternshipsCount++;
      } else {
        // Find existing track's ID
        const existingTrack = existingInts.find((i) => i.title.toLowerCase() === intern.title.toLowerCase());
        trackId = existingTrack?.id || "";
      }

      if (trackId && DEFAULT_QUESTIONS[intern.id]) {
        // Check if questions already exist for this track
        const { data: existingQs, error: qFetchErr } = await client
          .from("questions")
          .select("id")
          .eq("internship_id", trackId)
          .limit(1);

        if (qFetchErr) throw qFetchErr;

        if (!existingQs || existingQs.length === 0) {
          // Seed questions
          const questionsToInsert = DEFAULT_QUESTIONS[intern.id].map((q) => ({
            internship_id: trackId,
            question_text: q.question_text,
            options: q.options,
            correct_option_index: q.correct_option_index,
          }));
          const { error: qErr } = await client.from("questions").insert(questionsToInsert);
          if (qErr) throw qErr;
          seededQuestionsCount += questionsToInsert.length;
        }
      }
    }

    // 3. Update document templates to the latest version as well!
    const defaults = await seedDefaultTemplatesFromFiles();
    await Promise.all(
      defaults.map(async (t) => {
        try {
          // Check if document template already exists by code
          const { data: existingTpl } = await client
            .from("document_templates")
            .select("id")
            .eq("code", t.code)
            .maybeSingle();

          if (!existingTpl) {
            await client.from("document_templates").insert({
              code: t.code,
              name: t.name,
              html_content: t.html_content,
              is_visible: t.is_visible
            });
          } else {
            // Update the HTML content to ensure certificate template changes are synced
            await client.from("document_templates").update({
              html_content: t.html_content
            }).eq("code", t.code);
          }
        } catch (tplErr) {
          console.error(`Failed to sync template ${t.code}:`, tplErr);
        }
      })
    );

    return {
      success: true,
      message: `Database synchronized successfully! Added ${seededInternshipsCount} new tracks, seeded ${seededQuestionsCount} questions, and updated all templates.`
    };
  } catch (err: any) {
    return { success: false, message: err.message || "An error occurred during database seeding." };
  }
}



// -------------------------------------------------------------
// HTML DOCUMENT TEMPLATES OPERATIONS
// -------------------------------------------------------------
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  const cacheKey = "document_templates_all";
  const cached = getCachedData<DocumentTemplate[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("code", { ascending: true });
        
      if (error) {
        console.warn("getDocumentTemplates failed, falling back to mock:", error);
        const res = await getMockDocumentTemplates();
        setCachedData(cacheKey, res, CACHE_TTL.long);
        return res;
      }
      
      if (!data || data.length === 0) {
        // Database is empty, let's seed default templates
        const seeded = await getMockDocumentTemplates();
        const client = supabase;
        if (!client) {
          setCachedData(cacheKey, seeded, CACHE_TTL.long);
          return seeded;
        }
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
        setCachedData(cacheKey, seeded, CACHE_TTL.long);
        return seeded;
      }
      
      const res = data || [];
      setCachedData(cacheKey, res, CACHE_TTL.long);
      return res;
    } catch (err) {
      console.warn("getDocumentTemplates failed, falling back to mock:", err);
      const res = await getMockDocumentTemplates();
      setCachedData(cacheKey, res, CACHE_TTL.long);
      return res;
    }
  } else {
    const res = await getMockDocumentTemplates();
    setCachedData(cacheKey, res, CACHE_TTL.long);
    return res;
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
  const codes = [
    "offer_letter",
    "certificate",
    "appreciation_certificate",
    "marksheet",
    "attendance_sheet",
    "consent_form",
    "daily_log_book",
    "feedback_form",
    "internship_report"
  ];
  
  const names: Record<string, string> = {
    offer_letter: "Offer Letter",
    certificate: "Internship Certificate",
    appreciation_certificate: "Appreciation Certificate",
    marksheet: "Marksheet",
    attendance_sheet: "Attendance Sheet",
    consent_form: "Consent Form",
    daily_log_book: "Daily Log Book",
    feedback_form: "Feedback Form",
    internship_report: "Internship Report"
  };

  const files: Record<string, string> = {
    offer_letter: "offer-letter.html",
    attendance_sheet: "attendance.html",
    internship_report: "report.html",
    certificate: "certificate.html",
    completion_letter: "completion-letter.html",
    assessment: "assessment.html"
  };
  
  const templates = await Promise.all(
    codes.map(async (code) => {
      let html = "";
      if (files[code]) {
        const fileName = files[code];
        if (typeof window === "undefined") {
          try {
            const fs = require("fs");
            const path = require("path");
            const filePath = path.join(process.cwd(), "public", "templates", "default", fileName);
            if (fs.existsSync(filePath)) {
              html = fs.readFileSync(filePath, "utf8");
            }
          } catch (fsErr) {
            console.warn(`Could not read default template file ${fileName} via fs:`, fsErr);
          }
        }
        
        if (!html) {
          try {
            const res = await fetch(`/templates/default/${fileName}`);
            if (res.ok) {
              html = await res.text();
            } else {
              throw new Error(`Fetch status ${res.status}`);
            }
          } catch (e) {
            console.warn(`Could not fetch template file for ${code}, using fallback:`, e);
            html = getFallbackTemplateHtml(code, names[code]);
          }
        }
      } else {
        html = getFallbackTemplateHtml(code, names[code]);
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

function getFallbackTemplateHtml(code: string, name: string): string {
  if (code === "appreciation_certificate") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Appreciation Certificate</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 50px; max-width: 850px; margin: 0 auto; border: 8px double #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; position: relative; }
    h1 { color: #1e3a8a; font-size: 28px; margin-bottom: 20px; text-transform: uppercase; }
    .subtitle { font-size: 16px; font-style: italic; color: #64748b; margin-bottom: 30px; }
    .name { font-size: 24px; font-weight: bold; color: #7c3aed; margin: 20px 0; border-bottom: 1px solid #e2e8f0; display: inline-block; padding-bottom: 5px; }
    .text { font-size: 14px; margin: 20px 0; color: #475569; }
    .footer { display: flex; justify-content: space-between; margin-top: 65px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 12px; color: #64748b; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>CERTIFICATE OF APPRECIATION</h1>
    <div class="subtitle">This certificate is proudly presented to</div>
    <div class="name">{{STUDENT_NAME}}</div>
    <div class="text">
      For outstanding performance and exceptional dedication during their tenure as a <strong>{{INTERNSHIP_TITLE}}</strong> intern. We highly appreciate their commitment, diligence, and professionalism.
    </div>
    <div class="footer">
      <div>Date: {{COMPLETION_DATE}}</div>
      <div>Verification ID: {{VERIFICATION_ID}}</div>
      <div>UG Intern Coordinator</div>
    </div>
    <button class="print-btn" onclick="window.print()">Print Certificate</button>
  </div>
</body>
</html>`;
  }

  if (code === "marksheet") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Evaluation Marksheet</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #7c3aed; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #f5f3ff; border-radius: 8px; border: 1px solid #ddd6fe; }
    .meta div { font-size: 13px; }
    .score-box { text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .score { font-size: 48px; font-weight: 800; color: #7c3aed; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>EVALUATION MARKSHEET</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{STUDENT_NAME}}</div>
      <div><strong>College Name:</strong> {{COLLEGE_NAME}}</div>
      <div><strong>Internship Track:</strong> {{INTERNSHIP_TITLE}}</div>
      <div><strong>Verification ID:</strong> {{VERIFICATION_ID}}</div>
      <div><strong>Date:</strong> {{COMPLETION_DATE}}</div>
    </div>
    <div class="score-box">
      <div class="score">{{PERCENTAGE}}%</div>
      <div style="font-size: 14px; font-weight: bold; color: #475569; margin-top: 8px;">Final Grade: {{GRADE}}</div>
      <div style="font-size: 12px; color: #059669; font-weight: bold; margin-top: 4px;">Assessment Result: PASSED</div>
    </div>
    <p style="font-size: 13px; text-align: center; color: #64748b;">This marksheet details the candidate's core competency score on the UG Intern MCQ Assessment Engine.</p>
    <button class="print-btn" onclick="window.print()">Print Marksheet</button>
  </div>
</body>
</html>`;
  }

  if (code === "attendance_sheet") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Attendance Sheet</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #e0f2fe; border-radius: 8px; border: 1px solid #bae6fd; }
    .meta div { font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f8fafc; border: 1px solid #cbd5e1; text-align: center; padding: 10px; font-size: 11px; color: #475569; }
    td { border: 1px solid #cbd5e1; padding: 12px 10px; font-size: 12px; text-align: center; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>INTERNSHIP ATTENDANCE RECORD</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{STUDENT_NAME}}</div>
      <div><strong>College Name:</strong> {{COLLEGE_NAME}}</div>
      <div><strong>Internship Track:</strong> {{INTERNSHIP_TITLE}}</div>
      <div><strong>Attendance Status:</strong> 100% Present</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Week</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Days Scheduled</th>
          <th>Days Present</th>
          <th>Approval Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>__/__/____</td><td>__/__/____</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>2</td><td>__/__/____</td><td>__/__/____</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>3</td><td>__/__/____</td><td>__/__/____</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>4</td><td>__/__/____</td><td>__/__/____</td><td>5</td><td>5</td><td>Approved</td></tr>
      </tbody>
    </table>
    <button class="print-btn" onclick="window.print()">Print Record</button>
  </div>
</body>
</html>`;
  }

  if (code === "consent_form") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Consent Form</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
    .meta div { font-size: 13px; }
    .content { margin-top: 24px; font-size: 14px; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 60px; }
    .sig-box { border-top: 1px dashed #94a3b8; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; color: #64748b; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>INTERNSHIP CONSENT FORM</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{STUDENT_NAME}}</div>
      <div><strong>College Name:</strong> {{COLLEGE_NAME}}</div>
      <div><strong>Roll Number:</strong> {{ROLL_NUMBER}}</div>
      <div><strong>Department/Stream:</strong> {{DEPARTMENT}}</div>
    </div>
    <div class="content">
      <p>I hereby express my consent to participate in the UG Intern Vocational Training and Internship program. I agree to abide by the guidelines, schedules, and code of conduct set forth by the platform and the project coordinators.</p>
      <p>I confirm that the details provided in my candidate profile are accurate. I understand that my certification is subject to completing the requirements and achieving a passing grade of 40% or above in the assessment portal.</p>
      <p style="margin-top: 16px;">Date: ________________________</p>
    </div>
    <div class="signature-area">
      <div class="sig-box">Candidate Signature</div>
      <div class="sig-box">College Coordinator / Dean</div>
    </div>
    <button class="print-btn" onclick="window.print()">Print Document</button>
  </div>
</body>
</html>`;
  }

  if (code === "daily_log_book") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Daily Log Book</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 900px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #faf5ff; border-radius: 8px; border: 1px solid #f3e8ff; }
    .meta div { font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f8fafc; border: 1px solid #cbd5e1; text-align: center; padding: 10px; font-size: 11px; color: #475569; }
    td { border: 1px solid #cbd5e1; padding: 16px 10px; font-size: 12px; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>DAILY ACTIVITY LOGBOOK</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{STUDENT_NAME}}</div>
      <div><strong>Department:</strong> {{DEPARTMENT}}</div>
      <div><strong>College Name:</strong> {{COLLEGE_NAME}}</div>
      <div><strong>Internship Track:</strong> {{INTERNSHIP_TITLE}}</div>
    </div>
    <p style="font-size: 13px; margin-bottom: 12px;">Please log your daily tasks, learning notes, and project work below:</p>
    <table>
      <thead>
        <tr>
          <th style="width: 80px;">Day</th>
          <th style="width: 120px;">Date</th>
          <th>Learning Outcomes &amp; Activities Performed</th>
          <th style="width: 100px;">Hours Logged</th>
          <th style="width: 120px;">Supervisor Init</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="text-align:center;">1</td><td></td><td>Setting up environment, configuring development workspace.</td><td>8</td><td></td></tr>
        <tr><td style="text-align:center;">2</td><td></td><td>Studying core project framework architectures and guidelines.</td><td>8</td><td></td></tr>
        <tr><td style="text-align:center;">3</td><td></td><td>Implementing database schemas, relationships, and queries.</td><td>8</td><td></td></tr>
        <tr><td style="text-align:center;">4</td><td></td><td>Creating responsive frontend pages, forms, and grid layouts.</td><td>8</td><td></td></tr>
        <tr><td style="text-align:center;">5</td><td></td><td>Integrating APIs and testing conceptual workflows.</td><td>8</td><td></td></tr>
      </tbody>
    </table>
    <button class="print-btn" onclick="window.print()">Print Logbook</button>
  </div>
</body>
</html>`;
  }

  if (code === "feedback_form") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Feedback Form</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #e11d48; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #fff1f2; border-radius: 8px; border: 1px solid #ffe4e6; }
    .meta div { font-size: 13px; }
    .section-title { font-weight: bold; margin-top: 20px; font-size: 14px; color: #e11d48; border-bottom: 1px solid #ffe4e6; padding-bottom: 4px; }
    .q-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .ratings { display: flex; gap: 8px; }
    .rating-bubble { border: 1px solid #cbd5e1; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; cursor: pointer; }
    .comment-box { border: 1px solid #cbd5e1; width: 100%; min-height: 80px; margin-top: 8px; border-radius: 6px; }
    .print-btn { display: block; margin: 20px auto 0 auto; padding: 10px 20px; background: #e11d48; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>INTERNSHIP EXPERIENCE FEEDBACK</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{STUDENT_NAME}}</div>
      <div><strong>College Name:</strong> {{COLLEGE_NAME}}</div>
      <div><strong>Internship Track:</strong> {{INTERNSHIP_TITLE}}</div>
    </div>
    <div class="section-title">Program Evaluation</div>
    <div class="q-row">
      <span>1. How relevant was the learning checklist/curriculum to your stream?</span>
      <div class="ratings"><div class="rating-bubble">1</div><div class="rating-bubble">2</div><div class="rating-bubble">3</div><div class="rating-bubble">4</div><div class="rating-bubble">5</div></div>
    </div>
    <div class="q-row">
      <span>2. How would you rate the assessment difficulty and integrity?</span>
      <div class="ratings"><div class="rating-bubble">1</div><div class="rating-bubble">2</div><div class="rating-bubble">3</div><div class="rating-bubble">4</div><div class="rating-bubble">5</div></div>
    </div>
    <div class="q-row">
      <span>3. Overall support and utility of the digital dashboards?</span>
      <div class="ratings"><div class="rating-bubble">1</div><div class="rating-bubble">2</div><div class="rating-bubble">3</div><div class="rating-bubble">4</div><div class="rating-bubble">5</div></div>
    </div>
    <div style="margin-top: 15px;">
      <span style="font-size: 13px; font-weight: bold;">General Comments / Recommendations:</span>
      <div class="comment-box"></div>
    </div>
    <button class="print-btn" onclick="window.print()">Print Feedback</button>
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 40px; background: #fafafa;"><div style="background: white; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 8px;"><h1>Internship ${name}</h1><hr/><p>Student Name: <strong>{{STUDENT_NAME}}</strong></p><p>College Name: <strong>{{COLLEGE_NAME}}</strong></p><p>Internship Track: <strong>{{INTERNSHIP_TITLE}}</strong></p><p>Grade: <strong>{{GRADE}}</strong></p><p>Verification ID: <strong>{{VERIFICATION_ID}}</strong></p></div></body></html>`;
}

export async function getDocumentTemplateByCode(code: string): Promise<DocumentTemplate | null> {
  const list = await getDocumentTemplates();
  return list.find((t) => t.code === code) || null;
}

export async function saveDocumentTemplate(
  code: string,
  htmlContent: string,
  isVisible: boolean,
  name?: string,
  internshipId?: string | null
): Promise<DocumentTemplate> {
  invalidateCacheKey("document_templates_all");
  const updatedTpl: any = {
    code,
    html_content: htmlContent,
    is_visible: isVisible,
    updated_at: new Date().toISOString()
  };
  if (name) {
    updatedTpl.name = name;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("document_templates").select("id");
      if (internshipId) {
        query = query.eq("code", code).eq("internship_id", internshipId);
      } else {
        query = query.eq("code", code).is("internship_id", null);
      }
      
      const { data: existingTpl } = await query.maybeSingle();

      if (existingTpl) {
        const { data, error } = await supabase
          .from("document_templates")
          .update(updatedTpl)
          .eq("id", existingTpl.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("document_templates")
          .insert({
            ...updatedTpl,
            internship_id: internshipId || null
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.warn("saveDocumentTemplate failed, falling back to mock:", err);
      return saveDocumentTemplateMock(code, htmlContent, isVisible, name, internshipId);
    }
  } else {
    return saveDocumentTemplateMock(code, htmlContent, isVisible, name, internshipId);
  }
}

function saveDocumentTemplateMock(
  code: string,
  htmlContent: string,
  isVisible: boolean,
  name?: string,
  internshipId?: string | null
): DocumentTemplate {
  const list = getMockStorage<DocumentTemplate[]>("mock_document_templates", []);
  const idx = list.findIndex(
    (t) => t.code === code && (internshipId ? t.internship_id === internshipId : !t.internship_id)
  );
  
  const templateName = name || (code === "offer_letter" ? "Offer Letter" : code === "certificate" ? "Internship Certificate" : code === "project_report" ? "Project Report" : code);
  
  const saved: DocumentTemplate = {
    id: idx !== -1 ? list[idx].id : `dt-${code}-${internshipId || 'global'}`,
    code,
    name: idx !== -1 ? (name || list[idx].name) : templateName,
    html_content: htmlContent,
    is_visible: isVisible,
    updated_at: new Date().toISOString(),
    internship_id: internshipId || null
  };

  if (idx !== -1) {
    list[idx] = saved;
  } else {
    list.push(saved);
  }
  setMockStorage("mock_document_templates", list);
  return saved;
}

// -------------------------------------------------------------
// PAYMENTS OPERATIONS
// -------------------------------------------------------------
export interface Payment {
  id: string;
  student_id: string;
  internship_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
}

export async function getPaidInternshipIds(userId: string): Promise<string[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("internship_id")
        .eq("student_id", userId)
        .eq("status", "completed");
      if (error) {
        console.warn("getPaidInternshipIds failed, falling back to mock:", error);
        return getMockPaidInternshipIds(userId);
      }
      return (data || []).map((p: any) => p.internship_id);
    } catch (err) {
      console.warn("getPaidInternshipIds failed, falling back to mock:", err);
      return getMockPaidInternshipIds(userId);
    }
  } else {
    return getMockPaidInternshipIds(userId);
  }
}

function getMockPaidInternshipIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  const list = getMockStorage<Payment[]>("mock_payments", []);
  return list
    .filter((p) => p.student_id === userId && p.status === "completed")
    .map((p) => p.internship_id);
}

export async function createPaymentRecord(
  userId: string,
  internshipId: string,
  orderId: string,
  amount: number
): Promise<Payment> {
  invalidateCacheKey("student_payments_");
  const paymentData: Omit<Payment, "id" | "created_at"> = {
    student_id: userId,
    internship_id: internshipId,
    amount,
    status: "pending",
    razorpay_order_id: orderId,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();
      if (error) {
        console.warn("createPaymentRecord failed, falling back to mock:", error);
        return createPaymentRecordMock(userId, internshipId, orderId, amount);
      }
      return data;
    } catch (err) {
      console.warn("createPaymentRecord failed, falling back to mock:", err);
      return createPaymentRecordMock(userId, internshipId, orderId, amount);
    }
  } else {
    return createPaymentRecordMock(userId, internshipId, orderId, amount);
  }
}

function createPaymentRecordMock(
  userId: string,
  internshipId: string,
  orderId: string,
  amount: number
): Payment {
  const list = getMockStorage<Payment[]>("mock_payments", []);
  const newPayment: Payment = {
    id: `pay-${Math.random().toString(36).substr(2, 9)}`,
    student_id: userId,
    internship_id: internshipId,
    amount,
    status: "pending",
    razorpay_order_id: orderId,
    created_at: new Date().toISOString(),
  };
  list.push(newPayment);
  setMockStorage("mock_payments", list);
  return newPayment;
}

export async function verifyAndCompletePayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  invalidateCacheKey("student_payments_");
  const nowStr = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "completed",
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          created_at: nowStr
        })
        .eq("razorpay_order_id", orderId);
      if (error) {
        console.warn("verifyAndCompletePayment failed, falling back to mock:", error);
        return verifyAndCompletePaymentMock(orderId, paymentId, signature);
      }
      return true;
    } catch (err) {
      console.warn("verifyAndCompletePayment failed, falling back to mock:", err);
      return verifyAndCompletePaymentMock(orderId, paymentId, signature);
    }
  } else {
    return verifyAndCompletePaymentMock(orderId, paymentId, signature);
  }
}

function verifyAndCompletePaymentMock(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (typeof window === "undefined") return true;
  const list = getMockStorage<Payment[]>("mock_payments", []);
  const idx = list.findIndex((p) => p.razorpay_order_id === orderId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: "completed",
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      created_at: new Date().toISOString()
    };
    setMockStorage("mock_payments", list);
    return true;
  }
  return false;
}

export async function getStudentPayments(userId: string): Promise<Payment[]> {
  const cacheKey = `student_payments_${userId}`;
  const cached = getCachedData<Payment[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("getStudentPayments failed, falling back to mock:", error);
        const res = getMockStudentPayments(userId);
        setCachedData(cacheKey, res, CACHE_TTL.short);
        return res;
      }
      const res = data || [];
      setCachedData(cacheKey, res, CACHE_TTL.short);
      return res;
    } catch (err) {
      console.warn("getStudentPayments failed, falling back to mock:", err);
      const res = getMockStudentPayments(userId);
      setCachedData(cacheKey, res, CACHE_TTL.short);
      return res;
    }
  } else {
    const res = getMockStudentPayments(userId);
    setCachedData(cacheKey, res, CACHE_TTL.short);
    return res;
  }
}

function getMockStudentPayments(userId: string): Payment[] {
  if (typeof window === "undefined") return [];
  const list = getMockStorage<Payment[]>("mock_payments", []);
  return list
    .filter((p) => p.student_id === userId && p.status === "completed")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// -------------------------------------------------------------
// DOCUMENT TEMPLATES CRUD (ADDITIONAL OPERATIONS)
// -------------------------------------------------------------
export async function deleteDocumentTemplate(code: string, internshipId?: string | null): Promise<boolean> {
  invalidateCacheKey("document_templates_all");
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("document_templates").delete().eq("code", code);
      if (internshipId) {
        query = query.eq("internship_id", internshipId);
      } else {
        query = query.is("internship_id", null);
      }
      const { error } = await query;
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("deleteDocumentTemplate failed, falling back to mock:", err);
      return deleteDocumentTemplateMock(code, internshipId);
    }
  } else {
    return deleteDocumentTemplateMock(code, internshipId);
  }
}

function deleteDocumentTemplateMock(code: string, internshipId?: string | null): boolean {
  const list = getMockStorage<DocumentTemplate[]>("mock_document_templates", []);
  const filtered = list.filter(
    (t) => !(t.code === code && (internshipId ? t.internship_id === internshipId : !t.internship_id))
  );
  if (filtered.length !== list.length) {
    setMockStorage("mock_document_templates", filtered);
    return true;
  }
  return false;
}

export async function seedTemplatesForInternship(internshipId: string): Promise<boolean> {
  const SEED_TEMPLATES = [
    { code: "offer_letter", name: "Offer Letter" },
    { code: "attendance_sheet", name: "Attendance Sheet" },
    { code: "internship_report", name: "Internship Report" },
    { code: "certificate", name: "Internship Certificate" },
    { code: "completion_letter", name: "Completion Letter" },
    { code: "assessment", name: "Assessment Form" }
  ];

  if (isSupabaseConfigured() && supabase) {
    try {
      const client = supabase;
      await Promise.all(
        SEED_TEMPLATES.map(async (tpl) => {
          const html = await getDefaultTemplateHtmlForSeeding(tpl.code);
          await client.from("document_templates").insert({
            code: tpl.code,
            name: tpl.name,
            html_content: html,
            is_visible: true,
            internship_id: internshipId
          });
        })
      );
      invalidateCacheKey("document_templates_all");
      return true;
    } catch (e) {
      console.error(`Failed to seed templates for internship ${internshipId} in Supabase:`, e);
      return false;
    }
  } else {
    try {
      const list = getMockStorage<DocumentTemplate[]>("mock_document_templates", []);
      for (const tpl of SEED_TEMPLATES) {
        const html = await getDefaultTemplateHtmlForSeeding(tpl.code);
        list.push({
          id: `dt-${tpl.code}-${internshipId}`,
          code: tpl.code,
          name: tpl.name,
          html_content: html,
          is_visible: true,
          updated_at: new Date().toISOString(),
          internship_id: internshipId
        });
      }
      setMockStorage("mock_document_templates", list);
      invalidateCacheKey("document_templates_all");
      return true;
    } catch (e) {
      console.error(`Failed to seed templates for internship ${internshipId} in mock:`, e);
      return false;
    }
  }
}

async function getDefaultTemplateHtmlForSeeding(code: string): Promise<string> {
  const rootDir = process.cwd();
  const fileMap: Record<string, string> = {
    offer_letter: "offer-letter.html",
    attendance_sheet: "attendance.html",
    internship_report: "report.html",
    certificate: "certificate.html",
    completion_letter: "completion-letter.html",
    assessment: "assessment.html"
  };
  const fileName = fileMap[code];
  if (!fileName) return "";

  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(rootDir, "public", "templates", "default", fileName);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8");
      }
    } catch (e) {
      console.warn(`Failed to read default template file ${fileName} via fs:`, e);
    }
  }

  try {
    const res = await fetch(`/templates/default/${fileName}`);
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    console.warn(`Failed to fetch default template ${fileName}:`, e);
  }

  return getFallbackTemplateHtml(code, code.replace(/_/g, " "));
}

// -------------------------------------------------------------
// PLATFORM SETTINGS OPERATIONS
// -------------------------------------------------------------
export interface PlatformSettings {
  assessment_fee: number;
  payments_enabled: boolean;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const defaultValue: PlatformSettings = { assessment_fee: 150, payments_enabled: true };
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "settings")
        .single();
      if (error || !data) {
        // If not found, try inserting default
        await supabase.from("platform_settings").insert({ key: "settings", value: defaultValue });
        return defaultValue;
      }
      return data.value;
    } catch (err) {
      console.warn("getPlatformSettings failed, using fallback:", err);
      return defaultValue;
    }
  } else {
    return getMockStorage<PlatformSettings>("mock_platform_settings", defaultValue);
  }
}

export async function savePlatformSettings(settings: PlatformSettings): Promise<PlatformSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .upsert({ key: "settings", value: settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data.value;
    } catch (err) {
      console.warn("savePlatformSettings failed, using fallback:", err);
      setMockStorage("mock_platform_settings", settings);
      return settings;
    }
  } else {
    setMockStorage("mock_platform_settings", settings);
    return settings;
  }
}

export interface University {
  name: string;
  colleges: string[];
}

export async function getUniversities(): Promise<University[]> {
  const defaultUniversities: University[] = [
    {
      name: "Delhi Technological University (DTU)",
      colleges: ["Main Campus", "East Campus", "Delhi School of Management"]
    },
    {
      name: "Veer Kunwar Singh University (VKSU)",
      colleges: ["H.D. Jain College", "Maharaja College", "S.B. College", "Jagdam College"]
    },
    {
      name: "Test University",
      colleges: ["Test College", "Mock Institute of Technology"]
    }
  ];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "universities")
        .maybeSingle();
      if (error || !data) {
        // If not found, try inserting default
        await supabase.from("platform_settings").insert({ key: "universities", value: defaultUniversities });
        return defaultUniversities;
      }
      return data.value as University[];
    } catch (err) {
      console.warn("getUniversities failed, using fallback:", err);
      return defaultUniversities;
    }
  } else {
    return getMockStorage<University[]>("mock_universities", defaultUniversities);
  }
}

export async function saveUniversities(universities: University[]): Promise<University[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .upsert({ key: "universities", value: universities, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data.value as University[];
    } catch (err) {
      console.warn("saveUniversities failed, using fallback:", err);
      setMockStorage("mock_universities", universities);
      return universities;
    }
  } else {
    setMockStorage("mock_universities", universities);
    return universities;
  }
}

export async function getAllPayments(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          student:profiles(full_name, email, phone_number)
        `)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.warn("getAllPayments query failed, falling back to mock data:", error);
        return getAllPaymentsMock();
      }
      return data || [];
    } catch (err) {
      console.warn("getAllPayments failed, falling back to mock data:", err);
      return getAllPaymentsMock();
    }
  } else {
    return getAllPaymentsMock();
  }
}

function getAllPaymentsMock(): any[] {
  if (typeof window === "undefined") return [];
  const list = getMockStorage<Payment[]>("mock_payments", []);
  const profiles = getMockStorage<any[]>("mock_profiles", []);
  return list
    .map((pay) => {
      const studentProfile = profiles.find((p) => p.id === pay.student_id);
      return {
        ...pay,
        student: studentProfile ? {
          full_name: studentProfile.full_name,
          email: studentProfile.email,
          phone_number: studentProfile.phone_number,
        } : null
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function sanitizeInput(val: string): string {
  if (typeof val !== "string") return val;
  return val.replace(/<[^>]*>/g, "").replace(/['"\\;%_]/g, "").trim();
}

export async function updateTestResult(id: string, updates: Partial<TestResult>): Promise<TestResult | null> {
  invalidateCacheKey("test_results_");
  invalidateCacheKey("verify_");
  // Fetch current record for audit comparison
  const oldResult = await getTestResultById(id);
  let reference_number = updates.reference_number;
  if (updates.passed && !reference_number) {
    if (oldResult && !oldResult.reference_number) {
      reference_number = await generateReferenceNumber();
    }
  }

  const finalUpdates = {
    ...updates,
    ...(updates.passed === false ? { reference_number: "" } : (reference_number ? { reference_number } : {}))
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .update(finalUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      // Audit logging
      const adminUser = await getCurrentUser();
      if (adminUser && oldResult) {
        const changedFields = Object.keys(finalUpdates) as (keyof TestResult)[];
        for (const field of changedFields) {
          const oldVal = (oldResult as any)[field];
          const newVal = (data as any)[field];
          if (oldVal !== newVal) {
            await supabase.from("result_change_history").insert({
              admin_id: adminUser.id,
              student_id: data.student_id,
              test_result_id: data.id,
              field_name: field,
              previous_value: oldVal !== undefined ? String(oldVal) : null,
              new_value: newVal !== undefined ? String(newVal) : null,
              changed_at: new Date().toISOString()
            });
          }
        }
      }
      return data;
    } catch (err) {
      console.warn("updateTestResult to Supabase failed, falling back to mock:", err);
      return await updateTestResultMock(id, finalUpdates);
    }
  } else {
    // In mock mode, just perform update without audit logging
    return await updateTestResultMock(id, finalUpdates);
  }
}

async function updateTestResultMock(id: string, updates: Partial<TestResult>): Promise<TestResult | null> {
  if (typeof window === "undefined") return null;
  const list = getMockStorage<TestResult[]>("mock_test_results", []);
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  let reference_number = updates.reference_number || list[idx].reference_number;
  if (updates.passed && !reference_number) {
    reference_number = await generateReferenceNumber();
  }

  const updated: TestResult = {
    ...list[idx],
    ...updates,
    reference_number: updates.passed === false ? "" : reference_number
  };
  list[idx] = updated;
  setMockStorage("mock_test_results", list);
  return updated;
}


// -------------------------------------------------------------
// ANNOUNCEMENTS OPERATIONS
// -------------------------------------------------------------
export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  type: "info" | "warning" | "success";
  active: boolean;
  created_at: string;
}

export async function getAnnouncements(onlyActive = false): Promise<Announcement[]> {
  const cacheKey = `announcements_${onlyActive ? 'active' : 'all'}`;
  const cached = getCachedData<Announcement[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("announcements").select("*");
      if (onlyActive) {
        query = query.eq("active", true);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) {
        console.warn("getAnnouncements query failed, falling back to mock:", error);
        const res = getAnnouncementsMock(onlyActive);
        setCachedData(cacheKey, res, CACHE_TTL.short);
        return res;
      }
      const res = data || [];
      setCachedData(cacheKey, res, CACHE_TTL.short);
      return res;
    } catch (err) {
      console.warn("getAnnouncements failed, falling back to mock:", err);
      const res = getAnnouncementsMock(onlyActive);
      setCachedData(cacheKey, res, CACHE_TTL.short);
      return res;
    }
  } else {
    const res = getAnnouncementsMock(onlyActive);
    setCachedData(cacheKey, res, CACHE_TTL.short);
    return res;
  }
}

function getAnnouncementsMock(onlyActive = false): Announcement[] {
  if (typeof window === "undefined") return [];
  const defaultMockAnnouncements: Announcement[] = [
    {
      id: "1",
      title: "Platform Maintenance Scheduled",
      description: "Scheduled maintenance on June 25th, 2026 from 2:00 AM to 6:00 AM IST. The platform may be temporarily unavailable.",
      type: "warning",
      priority: "high",
      created_at: "2026-06-18T00:00:00Z",
      active: true,
    },
    {
      id: "2",
      title: "New Internship Tracks Available",
      description: "We have added 5 new internship tracks including AI/ML, Cloud Computing, and DevOps. Enroll now!",
      type: "info",
      priority: "medium",
      created_at: "2026-06-15T00:00:00Z",
      active: true,
    },
    {
      id: "3",
      title: "Assessment System Upgrade Complete",
      description: "The assessment system has been upgraded with improved security and faster loading times.",
      type: "success",
      priority: "low",
      created_at: "2026-06-10T00:00:00Z",
      active: false,
    },
  ];
  const list = getMockStorage<Announcement[]>("mock_announcements", defaultMockAnnouncements);
  const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return onlyActive ? sorted.filter(a => a.active) : sorted;
}

export async function saveAnnouncement(ann: Omit<Announcement, "id" | "created_at"> & { id?: string; created_at?: string }): Promise<Announcement> {
  invalidateCacheKey("announcements_");
  if (isSupabaseConfigured() && supabase) {
    try {
      if (ann.id && isNaN(Number(ann.id)) && ann.id.length > 10) {
        // Assume UUID if it's not a number and longer than 10 chars
        const { data, error } = await supabase
          .from("announcements")
          .update({
            title: ann.title,
            description: ann.description,
            priority: ann.priority,
            type: ann.type,
            active: ann.active,
          })
          .eq("id", ann.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("announcements")
          .insert({
            title: ann.title,
            description: ann.description,
            priority: ann.priority || "medium",
            type: ann.type || "info",
            active: ann.active !== undefined ? ann.active : true,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.warn("saveAnnouncement failed, falling back to mock:", err);
      return saveAnnouncementMock(ann);
    }
  } else {
    return saveAnnouncementMock(ann);
  }
}

function saveAnnouncementMock(ann: Omit<Announcement, "id" | "created_at"> & { id?: string; created_at?: string }): Announcement {
  const list = getAnnouncementsMock(false);
  const id = ann.id && isNaN(Number(ann.id)) && ann.id.length > 10 ? ann.id : Date.now().toString();
  const saved: Announcement = {
    id,
    title: ann.title,
    description: ann.description,
    priority: ann.priority || "medium",
    type: ann.type || "info",
    active: ann.active !== undefined ? ann.active : true,
    created_at: ann.created_at || new Date().toISOString(),
  };
  const idx = list.findIndex(a => a.id === id);
  if (idx !== -1) {
    list[idx] = saved;
  } else {
    list.push(saved);
  }
  setMockStorage("mock_announcements", list);
  // Trigger custom storage event for sync
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
  return saved;
}

export async function deleteAnnouncementDb(id: string): Promise<boolean> {
  invalidateCacheKey("announcements_");
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("deleteAnnouncementDb failed, falling back to mock:", err);
      return deleteAnnouncementMock(id);
    }
  } else {
    return deleteAnnouncementMock(id);
  }
}

function deleteAnnouncementMock(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getAnnouncementsMock(false);
  const filtered = list.filter(a => a.id !== id);
  setMockStorage("mock_announcements", filtered);
  // Trigger custom storage event for sync
  window.dispatchEvent(new Event("storage"));
  return true;
}

export async function getReadAnnouncementIds(studentId: string): Promise<string[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("student_id", studentId);
      if (error) throw error;
      return data?.map(d => d.announcement_id) || [];
    } catch (err) {
      console.warn("getReadAnnouncementIds failed, falling back to mock:", err);
      return getReadAnnouncementIdsMock(studentId);
    }
  } else {
    return getReadAnnouncementIdsMock(studentId);
  }
}

function getReadAnnouncementIdsMock(studentId: string): string[] {
  if (typeof window === "undefined") return [];
  const reads = getMockStorage<{ announcement_id: string; student_id: string }[]>("mock_announcement_reads", []);
  return reads.filter(r => r.student_id === studentId).map(r => r.announcement_id);
}

export async function markAnnouncementAsRead(announcementId: string, studentId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from("announcement_reads")
        .upsert({ announcement_id: announcementId, student_id: studentId }, { onConflict: "announcement_id,student_id" });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("markAnnouncementAsRead failed, falling back to mock:", err);
      return markAnnouncementAsReadMock(announcementId, studentId);
    }
  } else {
    return markAnnouncementAsReadMock(announcementId, studentId);
  }
}

function markAnnouncementAsReadMock(announcementId: string, studentId: string): boolean {
  if (typeof window === "undefined") return false;
  const reads = getMockStorage<{ announcement_id: string; student_id: string }[]>("mock_announcement_reads", []);
  const exists = reads.some(r => r.announcement_id === announcementId && r.student_id === studentId);
  if (!exists) {
    reads.push({ announcement_id: announcementId, student_id: studentId });
    setMockStorage("mock_announcement_reads", reads);
    // Trigger custom storage event for sync
    window.dispatchEvent(new Event("storage"));
  }
  return true;
}

// -------------------------------------------------------------
// SUPPORT TICKETS OPERATIONS
// -------------------------------------------------------------
export async function getSupportTickets(studentId?: string): Promise<SupportTicket[]> {
  const cacheKey = `support_tickets_${studentId || 'all'}`;
  const cached = getCachedData<SupportTicket[]>(cacheKey);
  if (cached) return cached;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("support_tickets").select("*, profiles(full_name)");
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) {
        console.warn("getSupportTickets query failed, falling back to mock:", error);
        const fallback = getSupportTicketsMock(studentId);
        setCachedData(cacheKey, fallback, CACHE_TTL.short);
        return fallback;
      }
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        student_id: t.student_id,
        subject: t.subject,
        description: t.description,
        category: t.category,
        status: t.status,
        admin_reply: t.admin_reply,
        created_at: t.created_at,
        updated_at: t.updated_at,
        student_name: t.profiles?.full_name || "Unknown Student"
      }));
      setCachedData(cacheKey, mapped, CACHE_TTL.short);
      return mapped;
    } catch (err) {
      console.warn("getSupportTickets failed, falling back to mock:", err);
      const fallback = getSupportTicketsMock(studentId);
      setCachedData(cacheKey, fallback, CACHE_TTL.short);
      return fallback;
    }
  } else {
    const fallback = getSupportTicketsMock(studentId);
    setCachedData(cacheKey, fallback, CACHE_TTL.short);
    return fallback;
  }
}

function getSupportTicketsMock(studentId?: string): SupportTicket[] {
  if (typeof window === "undefined") return [];
  const list = getMockStorage<SupportTicket[]>("mock_support_tickets", []);
  const profiles = getMockStorage<any[]>("mock_profiles", []);
  const mapped = list.map((t) => {
    const p = profiles.find((prof) => prof.id === t.student_id);
    return {
      ...t,
      student_name: p?.full_name || "Student User"
    };
  });
  if (studentId) {
    return mapped.filter((t) => t.student_id === studentId);
  }
  return mapped;
}

export async function createSupportTicket(ticket: Omit<SupportTicket, "id" | "status" | "created_at" | "updated_at">): Promise<SupportTicket> {
  invalidateCacheKey("support_tickets_");
  const newTicket = {
    ...ticket,
    status: "open" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert(newTicket)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("createSupportTicket failed, falling back to mock:", err);
      return createSupportTicketMock(newTicket);
    }
  } else {
    return createSupportTicketMock(newTicket);
  }
}

function createSupportTicketMock(ticket: any): SupportTicket {
  if (typeof window === "undefined") return ticket;
  const list = getMockStorage<any[]>("mock_support_tickets", []);
  const created = {
    ...ticket,
    id: Math.random().toString(36).substring(2, 15)
  };
  list.push(created);
  setMockStorage("mock_support_tickets", list);
  window.dispatchEvent(new Event("storage"));
  return created;
}

export async function updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
  invalidateCacheKey("support_tickets_");
  const finalUpdates = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .update(finalUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("updateSupportTicket failed, falling back to mock:", err);
      return updateSupportTicketMock(id, finalUpdates);
    }
  } else {
    return updateSupportTicketMock(id, finalUpdates);
  }
}

function updateSupportTicketMock(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
  if (typeof window === "undefined") return null;
  const list = getMockStorage<any[]>("mock_support_tickets", []);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated = {
    ...list[idx],
    ...updates
  };
  list[idx] = updated;
  setMockStorage("mock_support_tickets", list);
  window.dispatchEvent(new Event("storage"));
  return updated;
}



