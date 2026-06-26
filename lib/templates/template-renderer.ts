import fs from 'fs';
import path from 'path';

/**
 * Renders a document template by injecting shared layout elements (header, footer, styles)
 * and replacing variables (both camelCase and UPPERCASE_SNAKE_CASE).
 */
export function renderTemplate(htmlContent: string, data: Record<string, any>): string {
  let rendered = htmlContent;

  // 1. Load shared elements from disk
  const rootDir = process.cwd();
  const sharedDir = path.join(rootDir, 'public', 'templates', 'shared');
  
  let styles = '';
  let header = '';
  let footer = '';

  try {
    const stylesPath = path.join(sharedDir, 'styles.css');
    if (fs.existsSync(stylesPath)) {
      styles = fs.readFileSync(stylesPath, 'utf8');
    }
  } catch (e) {
    console.warn('Failed to read shared styles.css:', e);
  }

  try {
    const headerPath = path.join(sharedDir, 'header.html');
    if (fs.existsSync(headerPath)) {
      header = fs.readFileSync(headerPath, 'utf8');
    }
  } catch (e) {
    console.warn('Failed to read shared header.html:', e);
  }

  try {
    const footerPath = path.join(sharedDir, 'footer.html');
    if (fs.existsSync(footerPath)) {
      footer = fs.readFileSync(footerPath, 'utf8');
    }
  } catch (e) {
    console.warn('Failed to read shared footer.html:', e);
  }

  // 2. Inject shared elements
  // Replace {{header}} and {{footer}}
  rendered = rendered.replace(/\{\{\s*header\s*\}\}/g, header);
  rendered = rendered.replace(/\{\{\s*footer\s*\}\}/g, footer);

  // Inject styles: replace {{styles}} if present, otherwise inject into <head> or prepend
  const styleTag = `<style>\n${styles}\n</style>`;
  if (rendered.includes('{{styles}}')) {
    rendered = rendered.replace(/\{\{\s*styles\s*\}\}/g, styleTag);
  } else if (rendered.includes('</head>')) {
    rendered = rendered.replace('</head>', `${styleTag}\n</head>`);
  } else {
    // Fallback: prepend to the document
    rendered = styleTag + '\n' + rendered;
  }

  // 3. Replace dynamic placeholders
  // We want to support mapping all variations of standard keys.
  // For each key in the data object, we will replace:
  // - {{key}}
  // - {{KEY_UPPERCASE}}
  // - {{KEY_SNAKE_CASE}}
  // - also mapped variations
  
  // Expand data to include variation cases for robustness
  const expandedData: Record<string, string> = {};
  
  // Helper to convert camelCase to UPPER_SNAKE_CASE
  const toSnakeCase = (str: string) => 
    str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toUpperCase();

  Object.entries(data).forEach(([key, value]) => {
    const stringVal = value === null || value === undefined ? '' : String(value);
    
    // Set standard camelCase
    expandedData[key] = stringVal;
    
    // Set lowercase
    expandedData[key.toLowerCase()] = stringVal;
    
    // Set uppercase snake_case
    const snake = toSnakeCase(key);
    expandedData[snake] = stringVal;
    
    // Set simple uppercase
    expandedData[key.toUpperCase()] = stringVal;

    // Mapping specific synonyms for extra compatibility
    if (key === 'studentName') {
      expandedData['STUDENT_NAME'] = stringVal;
      expandedData['student_name'] = stringVal;
    }
    if (key === 'collegeName') {
      expandedData['COLLEGE_NAME'] = stringVal;
      expandedData['college_name'] = stringVal;
    }
    if (key === 'universityName') {
      expandedData['UNIVERSITY_NAME'] = stringVal;
      expandedData['university_name'] = stringVal;
    }
    if (key === 'internshipName' || key === 'internshipTitle') {
      expandedData['INTERNSHIP_NAME'] = stringVal;
      expandedData['INTERNSHIP_TITLE'] = stringVal;
      expandedData['internship_name'] = stringVal;
      expandedData['internship_title'] = stringVal;
    }
    if (key === 'startDate' || key === 'joiningDate') {
      expandedData['START_DATE'] = stringVal;
      expandedData['JOINING_DATE'] = stringVal;
      expandedData['start_date'] = stringVal;
      expandedData['joining_date'] = stringVal;
    }
    if (key === 'endDate' || key === 'completionDate') {
      expandedData['END_DATE'] = stringVal;
      expandedData['COMPLETION_DATE'] = stringVal;
      expandedData['end_date'] = stringVal;
      expandedData['completion_date'] = stringVal;
    }
    if (key === 'certificateId' || key === 'verificationId') {
      expandedData['CERTIFICATE_ID'] = stringVal;
      expandedData['VERIFICATION_ID'] = stringVal;
      expandedData['certificate_id'] = stringVal;
      expandedData['verification_id'] = stringVal;
    }
    if (key === 'rollNumber' || key === 'roll_number') {
      expandedData['ROLL_NUMBER'] = stringVal;
      expandedData['roll_number'] = stringVal;
    }
  });

  // Now replace all place holders in the form of {{placeholder}}
  // We scan the document for any {{...}} matching keys in expandedData
  rendered = rendered.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, p1) => {
    const cleanKey = p1.trim();
    
    // First try exact key match
    if (expandedData[cleanKey] !== undefined) {
      return expandedData[cleanKey];
    }
    
    // Try case-insensitive lookup
    const lowerKey = cleanKey.toLowerCase();
    if (expandedData[lowerKey] !== undefined) {
      return expandedData[lowerKey];
    }
    
    // Check if key is a snake_case version of something
    const upperKey = cleanKey.toUpperCase();
    if (expandedData[upperKey] !== undefined) {
      return expandedData[upperKey];
    }

    // Return the placeholder as is if not matched, or empty string? Let's leave it as is or return empty.
    // Standard template engines usually return empty string for missing variables to avoid displaying curly brackets.
    return '';
  });

  return rendered;
}
