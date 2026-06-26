const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const templatesDir = path.join(rootDir, 'templates');

// Folders to create
const folders = [
  'templates',
  'templates/shared',
  'templates/default',
  'templates/internships',
  'templates/internships/python',
  'templates/internships/data-science',
  'templates/internships/web-development'
];

folders.forEach(folder => {
  const dirPath = path.join(rootDir, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${folder}`);
  }
});

// Shared files
const sharedStyles = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1E293B;
  background-color: #FFFFFF;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}
.document-container {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}
.certificate-container {
  padding: 50px;
  max-width: 900px;
  margin: 0 auto;
  border: 10px double #7C3AED;
  border-radius: 16px;
  text-align: center;
  background-color: #FAFAF9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.title-heavy {
  font-family: 'Cinzel', 'Georgia', serif;
  color: #1E3A8A;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}
th, td {
  border: 1px solid #E2E8F0;
  padding: 10px;
  text-align: left;
  font-size: 13px;
}
th {
  background-color: #F8FAFC;
  font-weight: bold;
  color: #475569;
}
.text-center { text-align: center; }
`;

const sharedHeader = `
<div class="shared-header" style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 15px;">
  <div style="font-size: 26px; font-weight: 900; color: #4F46E5; letter-spacing: -0.5px;">UG Intern</div>
  <div style="font-size: 11px; color: #7C3AED; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px;">Vocational Skill Development Partner</div>
</div>
`;

const sharedFooter = `
<div class="shared-footer" style="text-align: center; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 11px; color: #94A3B8;">
  <p>Need help? Contact us: <strong>prashantshiwam@gmail.com</strong></p>
  <p>© UG Intern | Empowering Students, Shaping Future</p>
</div>
`;

fs.writeFileSync(path.join(templatesDir, 'shared', 'styles.css'), sharedStyles.trim());
fs.writeFileSync(path.join(templatesDir, 'shared', 'header.html'), sharedHeader.trim());
fs.writeFileSync(path.join(templatesDir, 'shared', 'footer.html'), sharedFooter.trim());

// Standard template templates for dynamic generations
const createTemplatesForSlug = (slug, name, reportChapters) => {
  // Offer Letter
  const offerLetter = `<!DOCTYPE html>
<html>
<head>
  <title>Offer Letter - ${name}</title>
</head>
<body>
  <div class="document-container">
    {{header}}
    <div style="margin-top: 30px;">
      <h2 style="color: #1E293B; font-size: 22px; font-weight: 800; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">Internship Offer Letter</h2>
      <p style="margin-top: 20px;">Dear <strong>{{studentName}}</strong>,</p>
      <p>We are pleased to offer you the position of <strong>{{internshipName}} Intern</strong> with <strong>{{companyName}}</strong>. We were very impressed by your qualifications and assessment performance.</p>
      
      <h3 style="margin-top: 20px; font-size: 15px;">Internship Terms:</h3>
      <table style="width: 100%; margin-top: 10px;">
        <tr><td style="font-weight: bold; width: 180px;">Internship Title</td><td>{{internshipName}}</td></tr>
        <tr><td style="font-weight: bold;">College Name</td><td>{{collegeName}}</td></tr>
        <tr><td style="font-weight: bold;">University Name</td><td>{{universityName}}</td></tr>
        <tr><td style="font-weight: bold;">Course / Semester</td><td>{{course}} (${semester = '{{semester}}'})</td></tr>
        <tr><td style="font-weight: bold;">Start Date</td><td>{{startDate}}</td></tr>
        <tr><td style="font-weight: bold;">End Date</td><td>{{endDate}}</td></tr>
      </table>

      <p style="margin-top: 20px;">Your internship duties will focus on real-world projects, mentor instruction, and active validation checkpoints. Upon successful completion of all checkpoints, you will receive your verified skill credentials and project certificate.</p>
      
      <p style="margin-top: 20px;">Welcome to the program!</p>
      <p style="margin-top: 30px;">Best regards,<br/><strong>UG Intern Team</strong></p>
    </div>
    {{footer}}
  </div>
</body>
</html>`;

  // Certificate
  const certificate = `<!DOCTYPE html>
<html>
<head>
  <title>${name} Certificate</title>
</head>
<body>
  <div class="certificate-container">
    <h1 class="title-heavy">CERTIFICATE OF COMPLETION</h1>
    <p style="font-size: 16px; font-style: italic; color: #475569; margin-bottom: 30px;">This is proudly presented to</p>
    <p style="font-size: 26px; font-weight: 900; color: #7C3AED; margin: 15px 0; border-bottom: 1px solid #E2E8F0; display: inline-block; padding-bottom: 5px;">{{studentName}}</p>
    
    <p style="font-size: 15px; color: #475569; margin: 20px auto; max-width: 600px;">
      from <strong>{{collegeName}}</strong> (<strong>{{universityName}}</strong>) for successfully completing the 
      <strong>{{internshipName}}</strong> vocational program. The candidate demonstrated exceptional diligence, 
      mentorship compliance, and skill proficiency.
    </p>

    <div style="display: flex; justify-content: space-around; margin-top: 40px; border-top: 1px solid #CBD5E1; padding-top: 15px; font-size: 12px; color: #64748B;">
      <div>
        <strong>Duration:</strong> {{startDate}} to {{endDate}}
      </div>
      <div>
        <strong>Verification ID:</strong> {{certificateId}}
      </div>
      <div>
        <strong>Issue Date:</strong> {{issueDate}}
      </div>
    </div>
  </div>
</body>
</html>`;

  // Attendance
  const attendance = `<!DOCTYPE html>
<html>
<head>
  <title>Attendance Record - ${name}</title>
</head>
<body>
  <div class="document-container">
    {{header}}
    <h2 style="color: #1E293B; font-size: 20px; font-weight: 800; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">Internship Attendance Record</h2>
    
    <table style="margin-top: 15px;">
      <tr><td style="font-weight: bold; width: 150px;">Student Name</td><td>{{studentName}}</td></tr>
      <tr><td style="font-weight: bold;">Internship Track</td><td>{{internshipName}}</td></tr>
      <tr><td style="font-weight: bold;">Duration</td><td>{{startDate}} to {{endDate}}</td></tr>
    </table>

    <h3 style="margin-top: 25px; font-size: 15px; color: #475569;">Attendance Log Checkpoints:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          <th>Checkpoint Week</th>
          <th>Dates Included</th>
          <th>Required Hours</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {{attendanceRows}}
      </tbody>
    </table>
    {{footer}}
  </div>
</body>
</html>`;

  // Report
  const report = `<!DOCTYPE html>
<html>
<head>
  <title>Internship Report - ${name}</title>
</head>
<body>
  <div class="document-container">
    {{header}}
    <h2 style="color: #1E293B; font-size: 20px; font-weight: 800; text-align: center; text-transform: uppercase;">Internship Project Report</h2>
    <p style="text-align: center; color: #64748B; font-size: 14px;">Track: <strong>{{internshipName}}</strong></p>

    <div style="margin-top: 30px; padding: 20px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
      <p><strong>Candidate Details:</strong></p>
      <p>Name: {{studentName}}</p>
      <p>College: {{collegeName}}</p>
      <p>Duration: {{startDate}} - {{endDate}}</p>
    </div>

    <div style="margin-top: 30px;">
      ${reportChapters}
    </div>
    {{footer}}
  </div>
</body>
</html>`;

  // Completion Letter
  const completionLetter = `<!DOCTYPE html>
<html>
<head>
  <title>Completion Letter - ${name}</title>
</head>
<body>
  <div class="document-container">
    {{header}}
    <div style="margin-top: 30px;">
      <h2 style="color: #1E293B; font-size: 22px; font-weight: 800; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">Internship Completion Letter</h2>
      <p style="margin-top: 20px; font-size: 13px; color: #64748B;">Date: {{issueDate}}</p>
      <p style="margin-top: 20px;">Dear <strong>{{studentName}}</strong>,</p>
      <p>This is to confirm that you have successfully completed your vocational training program on <strong>{{internshipName}}</strong> with <strong>{{companyName}}</strong>.</p>
      <p>Your program began on <strong>{{startDate}}</strong> and concluded on <strong>{{endDate}}</strong>, during which you dedicated a minimum of 120 Hours to training modules, quizzes, and project evaluations.</p>
      <p>We commend your performance, active participation, and technical skills shown during the evaluation checkpoints. We wish you the absolute best in all your future academic and professional endeavors.</p>
      <p style="margin-top: 30px;">Sincerely,<br/><strong>UG Intern Coordinator</strong></p>
    </div>
    {{footer}}
  </div>
</body>
</html>`;

  // Assessment
  const assessment = `<!DOCTYPE html>
<html>
<head>
  <title>Assessment Result - ${name}</title>
</head>
<body>
  <div class="document-container">
    {{header}}
    <h2 style="color: #1E293B; font-size: 20px; font-weight: 800; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; text-align: center;">Internship Evaluation Marksheet</h2>
    
    <table style="margin-top: 20px;">
      <tr><td style="font-weight: bold; width: 150px;">Student Name</td><td>{{studentName}}</td></tr>
      <tr><td style="font-weight: bold;">College / University</td><td>{{collegeName}} / {{universityName}}</td></tr>
      <tr><td style="font-weight: bold;">Internship Track</td><td>{{internshipName}}</td></tr>
      <tr><td style="font-weight: bold;">Completion Date</td><td>{{endDate}}</td></tr>
    </table>

    <div style="text-align: center; margin: 30px 0; padding: 25px; background: #F5F3FF; border-radius: 12px; border: 1px solid #DDD6FE;">
      <div style="font-size: 40px; font-weight: 900; color: #7C3AED;">{{score}}%</div>
      <div style="font-size: 14px; font-weight: bold; color: #475569; margin-top: 8px;">Final Grade: {{grade}}</div>
      <div style="font-size: 13px; color: #10B981; font-weight: bold; margin-top: 4px;">Assessment Result: PASSED</div>
    </div>

    <p style="font-size: 13px; color: #64748B; text-align: center;">This marksheet details the candidate's core competency score on the UG Intern MCQ Assessment Engine.</p>
    {{footer}}
  </div>
</body>
</html>`;

  return { offerLetter, certificate, attendance, report, completionLetter, assessment };
};

// Python template
const pythonReport = `
<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 1: Introduction to Python Development</h3>
<p>Overview of the Python programming language, setup of the environment (Anaconda, VS Code), and execution of basic scripts.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 2: Variables, Operators, and Data Types</h3>
<p>Practical implementation of lists, dictionaries, tuples, and sets. Control structures including loops, conditionals, and logical flows.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 3: Functions, Modules, and OOP</h3>
<p>Structuring clean, modular code using parameters, scopes, packages, and Object-Oriented Programming (OOP) concepts like Classes and Inheritance.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 4: Project Development & Automation</h3>
<p>Creation of a practical automation scripts and API connection layouts to execute database CRUD and text parser routines.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 5: Conclusion & Recommendations</h3>
<p>Evaluation of code performance checkpoints, best practices, and code delivery summaries.</p>
`;

const pythonTemplates = createTemplatesForSlug('python', 'Python Programming', pythonReport);

// Data Science template
const dsReport = `
<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 1: Introduction to Data Science</h3>
<p>Introduction to data analysis frameworks, Python analytical libraries (NumPy, Pandas), and data ingestion strategies.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 2: Data Collection & Preparation</h3>
<p>Importing data records, handling missing values, standardizing columns, and structural cleaning of datasets.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 3: Exploratory Data Analysis (EDA)</h3>
<p>Conducting statistical summaries and creating visualizations (Histograms, Scatter Plots, Correlation matrices) using Matplotlib and Seaborn.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 4: Machine Learning Modeling</h3>
<p>Building, training, and validating Linear Regression and K-Means clustering algorithms to evaluate model metrics.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 5: Results & Decision Support</h3>
<p>Summarizing analytical findings, model prediction parameters, and data-driven recommendations.</p>
`;

const dsTemplates = createTemplatesForSlug('data-science', 'Data Science', dsReport);

// Web Development template
const webReport = `
<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 1: Core Layouts & HTML5/CSS3</h3>
<p>Designing modern, responsive structures using semantic elements, grid systems, flexbox alignment, and media queries.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 2: ES6+ JavaScript & Dom Manipulation</h3>
<p>Creating dynamic page elements, handling events, calling external REST APIs, and storing persistent parameters.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 3: React & Component Architectures</h3>
<p>Building reusable visual components using standard React Hooks (useState, useEffect, useContext) for interface control.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 4: Next.js App Router & Server Components</h3>
<p>Building optimized pages, setting up API routes, and connecting to database layers via client SDK interfaces.</p>

<h3 style="font-size: 16px; color: #1E3A8A; margin-top: 20px;">Chapter 5: Deployment & Validation</h3>
<p>Deploying code builds to staging platforms (Vercel), executing lighthouse speed checks, and security audits.</p>
`;

const webTemplates = createTemplatesForSlug('web-development', 'Web Development', webReport);

const writeTemplatesToDisk = (slug, templates) => {
  const dir = path.join(templatesDir, 'internships', slug);
  fs.writeFileSync(path.join(dir, 'offer-letter.html'), templates.offerLetter.trim());
  fs.writeFileSync(path.join(dir, 'certificate.html'), templates.certificate.trim());
  fs.writeFileSync(path.join(dir, 'attendance.html'), templates.attendance.trim());
  fs.writeFileSync(path.join(dir, 'report.html'), templates.report.trim());
  fs.writeFileSync(path.join(dir, 'completion-letter.html'), templates.completionLetter.trim());
  fs.writeFileSync(path.join(dir, 'assessment.html'), templates.assessment.trim());
};

writeTemplatesToDisk('python', pythonTemplates);
writeTemplatesToDisk('data-science', dsTemplates);
writeTemplatesToDisk('web-development', webTemplates);

// Write Default fallback files
const defaultTemplates = createTemplatesForSlug('default', 'Default Internship', pythonReport);
const defaultDir = path.join(templatesDir, 'default');
fs.writeFileSync(path.join(defaultDir, 'offer-letter.html'), defaultTemplates.offerLetter.trim());
fs.writeFileSync(path.join(defaultDir, 'certificate.html'), defaultTemplates.certificate.trim());
fs.writeFileSync(path.join(defaultDir, 'attendance.html'), defaultTemplates.attendance.trim());
fs.writeFileSync(path.join(defaultDir, 'report.html'), defaultTemplates.report.trim());
fs.writeFileSync(path.join(defaultDir, 'completion-letter.html'), defaultTemplates.completionLetter.trim());
fs.writeFileSync(path.join(defaultDir, 'assessment.html'), defaultTemplates.assessment.trim());

console.log('Successfully generated all directory templates on disk.');
