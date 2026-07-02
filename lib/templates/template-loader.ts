import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { BRANDING } from '@/config/branding';

export function getSlugFromTitle(title: string): string {
  if (!title) return 'default';
  const clean = title.toLowerCase().trim();
  if (clean.includes('python')) return 'python';
  if (clean.includes('data science') || clean.includes('datasci')) return 'data-science';
  if (clean.includes('web dev') || clean.includes('web-dev') || clean.includes('web development')) return 'web-development';
  return clean.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const REPORT_TEMPLATE_MAPPING: Record<string, string> = {
  "int-datasci": "internship_data_science.html",
  "data science": "internship_data_science.html",
  "data-science": "internship_data_science.html",

  "int-python": "internship_python.html",
  "python programming": "internship_python.html",
  "python development": "internship_python.html",

  "int-web-dev": "internship_web_development.html",
  "web development": "internship_web_development.html",
  "web dev": "internship_web_development.html",
  "web-development": "internship_web_development.html",

  "int-java": "internship_java.html",
  "java development": "internship_java.html",
  "java-development": "internship_java.html",

  "int-ai": "internship_artificial_intelligence.html",
  "artificial intelligence": "internship_artificial_intelligence.html",
  "artificial-intelligence": "internship_artificial_intelligence.html",

  "int-ml": "internship_machine_learning.html",
  "machine learning": "internship_machine_learning.html",
  "machine-learning": "internship_machine_learning.html",

  "int-cybersec": "internship_cyber_security.html",
  "cyber security": "internship_cyber_security.html",
  "cyber-security": "internship_cyber_security.html",

  "int-cloud": "internship_cloud_computing.html",
  "cloud computing": "internship_cloud_computing.html",
  "cloud-computing": "internship_cloud_computing.html",

  "int-uiux": "internship_ui_ux.html",
  "ui/ux design": "internship_ui_ux.html",
  "ui/ux product design": "internship_ui_ux.html",
  "ui-ux": "internship_ui_ux.html",

  "int-digimark": "internship_digital_marketing.html",
  "digital marketing": "internship_digital_marketing.html",
  "digital-marketing": "internship_digital_marketing.html",

  "int-hr": "internship_hr.html",
  "human resources (hr)": "internship_hr.html",
  "human resources": "internship_hr.html",

  "int-bizanalytics": "internship_business_analytics.html",
  "business analytics": "internship_business_analytics.html",
  "business-analytics": "internship_business_analytics.html",

  "int-political": "internship_political_and_governance.html",
  "political and governance": "internship_political_and_governance.html",
  "political-and-governance": "internship_political_and_governance.html",

  "int-tourism": "internship_tourism.html",
  "tourism": "internship_tourism.html",
  "tourism & hospitality": "internship_tourism.html",
  "tourism-and-hospitality": "internship_tourism.html",

  "int-skill-dev": "internship_skill_development.html",
  "entrepreneurship skill development": "internship_skill_development.html",
  "entrepreneurship-skill-development": "internship_skill_development.html",

  "int-teacher-training": "internship_teacher_trainning.html",
  "teacher training": "internship_teacher_trainning.html",
  "teacher-training": "internship_teacher_trainning.html"
};

/**
 * Loads a document template.
 * Order of lookup:
 * 1. Supabase database document_templates matching the code and internshipId.
 * 2. Supabase database document_templates matching the code (global default).
 * 3. Local filesystem at templates/internships/{internshipSlug}/{templateType}.html
 * 4. Local filesystem at templates/default/{templateType}.html
 * 5. Simple HTML fallback string.
 */
export async function loadTemplate(
  templateType: string,
  internshipSlug: string,
  internshipId?: string
): Promise<string> {
  const cleanCode = templateType.trim().toLowerCase();

  // 1. Try to load customized template from Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      // Look up internship-specific template
      if (internshipId) {
        const { data, error } = await supabase
          .from('document_templates')
          .select('html_content')
          .eq('code', cleanCode)
          .eq('internship_id', internshipId)
          .eq('is_visible', true)
          .maybeSingle();

        if (data && data.html_content) {
          return data.html_content;
        }
      }

      // Look up global default template in Supabase
      const { data, error } = await supabase
        .from('document_templates')
        .select('html_content')
        .eq('code', cleanCode)
        .is('internship_id', null)
        .eq('is_visible', true)
        .maybeSingle();

      if (data && data.html_content) {
        return data.html_content;
      }
    } catch (err) {
      console.warn(`Supabase template fetch failed for ${cleanCode}, falling back to disk:`, err);
    }
  }

  // 2. Fall back to local filesystem templates
  const rootDir = process.cwd();
  
  let targetFile = `${cleanCode}.html`;
  if (cleanCode === 'project_report' || cleanCode === 'internship_report') {
    const key = (internshipId || '').toLowerCase().trim();
    const slugKey = internshipSlug.toLowerCase().replace(/-/g, ' ');
    const mapped = REPORT_TEMPLATE_MAPPING[key] || REPORT_TEMPLATE_MAPPING[slugKey] || REPORT_TEMPLATE_MAPPING[internshipSlug.toLowerCase()];
    
    if (mapped) {
      const mappedPath = path.join(rootDir, 'public', 'templates', 'default', mapped);
      if (fs.existsSync(mappedPath)) {
        targetFile = mapped;
      } else {
        const fallbackDefaultPath = path.join(rootDir, 'public', 'templates', 'default', 'internship_default.html');
        if (fs.existsSync(fallbackDefaultPath)) {
          targetFile = 'internship_default.html';
        }
      }
    } else {
      const fallbackDefaultPath = path.join(rootDir, 'public', 'templates', 'default', 'internship_default.html');
      if (fs.existsSync(fallbackDefaultPath)) {
        targetFile = 'internship_default.html';
      }
    }
  }

  const templatePath = path.join(rootDir, 'public', 'templates', 'internships', internshipSlug, targetFile);
  const defaultPath = path.join(rootDir, 'public', 'templates', 'default', targetFile);

  try {
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
  } catch (e) {
    console.warn(`Failed to read local internship template from ${templatePath}:`, e);
  }

  try {
    if (fs.existsSync(defaultPath)) {
      return fs.readFileSync(defaultPath, 'utf8');
    }
  } catch (e) {
    console.warn(`Failed to read local default template from ${defaultPath}:`, e);
  }

  // 3. Absolute fallback
  return getFallbackTemplateHtml(cleanCode);
}

function getFallbackTemplateHtml(code: string): string {
  const cleanCode = code.trim().toLowerCase();

  // 1. Internship Offer Letter
  if (cleanCode === 'offer_letter') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Internship Offer Letter</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .letter-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,.02); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .brand-name { font-size: 24px; font-weight: 850; color: #4f46e5; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    .meta-date { font-size: 13px; color: #64748b; text-align: right; }
    .title { font-size: 20px; font-weight: bold; text-align: center; text-transform: uppercase; color: #0f172a; margin-bottom: 30px; letter-spacing: 0.5px; }
    .salutation { font-size: 14px; font-weight: bold; margin-bottom: 15px; }
    .body-text { font-size: 13.5px; color: #334155; text-align: justify; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px; }
    .info-table td { padding: 10px; border: 1px solid #e2e8f0; }
    .info-table td.label { font-weight: bold; background: #f8fafc; color: #475569; width: 180px; }
    .footer-signatures { display: flex; justify-content: space-between; margin-top: 50px; }
    .sig-box { text-align: center; font-size: 12px; color: #64748b; width: 220px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
    .verification-info { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="letter-box">
    <div class="header">
      <div>
        <div class="brand-name">${BRANDING.name}</div>
        <div class="brand-sub">${BRANDING.legal.companyName}</div>
      </div>
      <div class="meta-date">
        Date: {{issueDate}}<br/>
        Ref: {{verificationId}}
      </div>
    </div>
    
    <div class="title">Internship Offer Letter</div>
    
    <div class="salutation">Dear {{studentName}},</div>
    
    <div class="body-text">
      We are pleased to offer you an internship position as a <strong>{{internshipName}}</strong> intern on the ${BRANDING.name} platform. Your selection has been approved based on your academic profile and credentials.
    </div>

    <div class="body-text">
      Please review the key details of your internship program outlined below:
    </div>

    <table class="info-table">
      <tr>
        <td class="label">Internship Track</td>
        <td>{{internshipName}}</td>
      </tr>
      <tr>
        <td class="label">Commencement Date</td>
        <td>{{startDate}}</td>
      </tr>
      <tr>
        <td class="label">Completion Date</td>
        <td>{{endDate}}</td>
      </tr>
      <tr>
        <td class="label">Structured Duration</td>
        <td>{{duration}} (Self-Paced)</td>
      </tr>
      <tr>
        <td class="label">College/Institution</td>
        <td>{{collegeName}}</td>
      </tr>
    </table>

    <div class="body-text">
      During this internship, you will be expected to review syllabus materials, complete real-world coding or design checkpoints, and attempt proctored evaluations. Upon scoring above the passing threshold, you will unlock your verified digital credentials.
    </div>

    <div class="footer-signatures">
      <div class="sig-box">Candidate Acceptance Signature</div>
      <div class="sig-box">
        <strong>Authorized Signatory</strong><br/>
        ${BRANDING.name} Internship Bureau
      </div>
    </div>

    <div class="verification-info">
      This letter is digitally signed and generated upon enrollment validation. Verification ID: {{verificationId}}
    </div>
  </div>
</body>
</html>`;
  }

  // 2. Payment Receipt
  if (cleanCode === 'receipt' || cleanCode === 'payment_receipt') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,.02); }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .header-table td { vertical-align: top; }
    .company-details { text-align: right; font-size: 13px; color: #64748b; line-height: 1.5; }
    .company-name { font-size: 20px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
    .invoice-title { font-size: 26px; font-weight: 850; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; }
    .meta-details { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    .meta-details td { padding: 10px; border: 1px solid #e2e8f0; }
    .meta-details td.label { font-weight: bold; background: #f8fafc; color: #475569; width: 150px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; padding: 12px; font-size: 12px; font-weight: bold; color: #475569; }
    .items-table td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .items-table tr.total-row td { font-weight: bold; background: #f5f3ff; border-top: 2px solid #ddd6fe; color: #4f46e5; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <table class="header-table">
      <tr>
        <td>
          <div class="invoice-title">Payment Receipt</div>
          <div style="font-size:13px;color:#64748b;margin-top:5px;">Receipt ID: {{verificationId}}</div>
        </td>
        <td class="company-details">
          <div class="company-name">${BRANDING.name}</div>
          <div>${BRANDING.legal.companyName}</div>
          <div>Email: ${BRANDING.emails.support}</div>
        </td>
      </tr>
    </table>

    <table class="meta-details">
      <tr>
        <td class="label">Candidate Name</td>
        <td>{{studentName}}</td>
        <td class="label">Date</td>
        <td>{{issueDate}}</td>
      </tr>
      <tr>
        <td class="label">Roll Number</td>
        <td>{{rollNumber}}</td>
        <td class="label">College</td>
        <td>{{collegeName}}</td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center;width:60px;">Qty</th>
          <th style="text-align:right;width:100px;">Rate</th>
          <th style="text-align:right;width:100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${BRANDING.name} Assessment Fee</strong><br/>
            <span style="font-size:11px;color:#64748b;">Track: {{internshipName}}</span>
          </td>
          <td style="text-align:center;">1</td>
          <td style="text-align:right;">₹1,999.00</td>
          <td style="text-align:right;">₹1,999.00</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align:right;">Total Amount Paid:</td>
          <td style="text-align:right;">₹1,999.00</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Computer-generated receipt verified under Razorpay Payment Gateway.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // 3. Attendance Record
  if (cleanCode === 'attendance_sheet' || cleanCode === 'attendance_record') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Internship Attendance Record</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 22px; text-align: center; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; }
    .meta div { font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f8fafc; border: 1px solid #cbd5e1; text-align: center; padding: 10px; font-size: 11px; color: #475569; }
    td { border: 1px solid #cbd5e1; padding: 12px 10px; font-size: 12px; text-align: center; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>INTERNSHIP ATTENDANCE RECORD</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{studentName}}</div>
      <div><strong>College Name:</strong> {{collegeName}}</div>
      <div><strong>Internship Track:</strong> {{internshipName}}</div>
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
        <tr><td>Week 1</td><td>{{startDate}}</td><td>-</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>Week 2</td><td>-</td><td>-</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>Week 3</td><td>-</td><td>-</td><td>5</td><td>5</td><td>Approved</td></tr>
        <tr><td>Week 4</td><td>-</td><td>{{endDate}}</td><td>5</td><td>5</td><td>Approved</td></tr>
      </tbody>
    </table>
    <div class="footer">
      <p>This attendance log is generated and verified by the mentor panel. Reference ID: {{verificationId}}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // 4. Assessment Marksheet
  if (cleanCode === 'marksheet' || cleanCode === 'assessment_marksheet') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Evaluation Marksheet</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .card { background: white; padding: 40px; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 22px; text-align: center; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #faf5ff; border-radius: 8px; border: 1px solid #e9d5ff; }
    .meta div { font-size: 13px; }
    .score-box { text-align: center; margin: 30px 0; padding: 25px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .score { font-size: 48px; font-weight: 800; color: #4f46e5; }
    .grade { font-size: 15px; font-weight: bold; color: #475569; margin-top: 8px; }
    .passed-badge { display: inline-block; font-size: 12px; color: #059669; font-weight: bold; background: #d1fae5; border-radius: 6px; padding: 4px 10px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>EVALUATION MARKSHEET</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{studentName}}</div>
      <div><strong>College Name:</strong> {{collegeName}}</div>
      <div><strong>Internship Track:</strong> {{internshipName}}</div>
      <div><strong>Verification ID:</strong> {{verificationId}}</div>
      <div><strong>Date:</strong> {{issueDate}}</div>
    </div>
    <div class="score-box">
      <div class="score">{{score}}</div>
      <div class="grade">Final Grade: {{grade}}</div>
      <div class="passed-badge">ASSESSMENT RESULT: PASSED</div>
    </div>
    <p style="font-size: 12px; text-align: center; color: #64748b;">This marksheet details the candidate's core competency score on the ${BRANDING.name} MCQ Assessment Engine.</p>
    <div class="footer">
      <p>Digitally audited and signed on {{issueDate}}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // 5. Internship Report
  if (cleanCode === 'internship_report' || cleanCode === 'project_report') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Internship Project & Activity Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    h1 { color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 22px; text-align: center; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; }
    .meta div { font-size: 13px; }
    .section-title { font-size: 14px; font-weight: bold; color: #059669; margin-top: 25px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .text-content { font-size: 12.5px; color: #475569; text-align: justify; margin-bottom: 12px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>INTERNSHIP PROJECT & ACTIVITY REPORT</h1>
    <div class="meta">
      <div><strong>Student Name:</strong> {{studentName}}</div>
      <div><strong>College Name:</strong> {{collegeName}}</div>
      <div><strong>Internship Track:</strong> {{internshipName}}</div>
      <div><strong>Approval Status:</strong> Approved &amp; Evaluated</div>
    </div>
    
    <div class="section-title">1. Executive Summary</div>
    <div class="text-content">
      This report confirms that candidate <strong>{{studentName}}</strong> has successfully completed the curriculum and project validations required for the <strong>{{internshipName}}</strong> track. Over the duration of {{duration}}, the candidate demonstrated competency in industry-aligned challenges.
    </div>

    <div class="section-title">2. Curriculum Coverage &amp; Assessments</div>
    <div class="text-content">
      The candidate reviewed reference guidelines, designed systems, and completed timed MCQ assessments covering core engineering and architecture concepts. The assessments proctored via the ${BRANDING.name} platform registered a score of <strong>{{score}}</strong>, equivalent to a Final Grade of <strong>{{grade}}</strong>.
    </div>

    <div class="section-title">3. Project Submission and Acceptance</div>
    <div class="text-content">
      All required deliverables, checklist reviews, and case study submissions associated with this track were submitted by the candidate. The evaluation board verified the submissions for structural compliance, originality, and conceptual completeness.
    </div>

    <div class="footer">
      <p>Issued by ${BRANDING.name} Board. Reference ID: {{verificationId}}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // 6. Internship Certificate
  if (cleanCode === 'certificate' || cleanCode === 'internship_certificate') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Internship Certificate</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background-color: #ffffff; margin: 0; }
    .cert-frame { max-width: 850px; margin: auto; padding: 50px; border: 15px double #4f46e5; border-radius: 8px; background: #fff; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,.05); position: relative; }
    .header { font-size: 26px; font-weight: 850; color: #4f46e5; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
    .sub { font-size: 16px; font-style: italic; color: #64748b; margin-bottom: 30px; }
    .recipient { font-size: 26px; font-weight: bold; color: #0f172a; margin: 20px 0; border-bottom: 2px solid #4f46e5; display: inline-block; padding-bottom: 5px; }
    .body { font-size: 14.5px; color: #334155; margin: 20px auto; max-width: 600px; text-align: center; }
    .grade-text { font-weight: bold; color: #4f46e5; }
    .footer-meta { display: flex; justify-content: space-between; margin-top: 70px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .sig-line { width: 180px; text-align: center; font-weight: bold; color: #0f172a; }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="header">Certificate of Completion</div>
    <div class="sub">This is proudly awarded to</div>
    <div class="recipient">{{studentName}}</div>
    <div class="body">
      for successfully completing the proctored vocational simulated internship program in 
      <strong>{{internshipName}}</strong>.
    </div>
    <div class="body">
      The candidate participated in active learning tracks, fulfilled the curriculum checks, and cleared the final evaluations on the ${BRANDING.name} platform with a passing grade of <span class="grade-text">{{grade}}</span>.
    </div>

    <div class="footer-meta">
      <div>
        <strong>Date of Issue:</strong> {{issueDate}}<br/>
        <strong>Verification ID:</strong> {{verificationId}}
      </div>
      <div class="sig-line">
        ${BRANDING.name} Coordinator
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  // Fallback for others
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Document</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
    .card { padding: 40px; border: 1px solid #ccc; max-width: 600px; margin: 0 auto; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Document: ${code}</h1>
    <p>Student Name: <strong>{{studentName}}</strong></p>
    <p>Internship Name: <strong>{{internshipName}}</strong></p>
    <p>Date: <strong>{{issueDate}}</strong></p>
    <p>Verification ID: <strong>{{verificationId}}</strong></p>
  </div>
</body>
</html>`;
}
