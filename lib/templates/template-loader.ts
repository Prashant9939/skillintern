import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export function getSlugFromTitle(title: string): string {
  if (!title) return 'default';
  const clean = title.toLowerCase().trim();
  if (clean.includes('python')) return 'python';
  if (clean.includes('data science') || clean.includes('datasci')) return 'data-science';
  if (clean.includes('web dev') || clean.includes('web-dev') || clean.includes('web development')) return 'web-development';
  return clean.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

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
  const templatePath = path.join(rootDir, 'public', 'templates', 'internships', internshipSlug, `${cleanCode}.html`);
  const defaultPath = path.join(rootDir, 'public', 'templates', 'default', `${cleanCode}.html`);

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
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Document</title>
  <style>
    body { font-family: sans-serif; padding: 40px; }
    .card { padding: 40px; border: 1px solid #ccc; max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Document: ${code}</h1>
    <p>Student Name: <strong>{{studentName}}</strong></p>
    <p>Internship Name: <strong>{{internshipName}}</strong></p>
  </div>
</body>
</html>`;
}
