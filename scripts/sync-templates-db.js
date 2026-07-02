const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not configured in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const templatesToSync = [
  { code: 'offer_letter', file: 'offer_letter.html', name: 'Offer Letter' },
  { code: 'attendance_sheet', file: 'attendance_sheet.html', name: 'Attendance Sheet' },
  { code: 'internship_report', file: 'project_report.html', name: 'Project Report' },
  { code: 'certificate', file: 'certificate.html', name: 'Internship Certificate' },
];

async function syncTemplates() {
  for (const tpl of templatesToSync) {
    const filePath = path.join(__dirname, '..', 'public', 'templates', 'default', tpl.file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${tpl.code}: file not found at ${filePath}`);
      continue;
    }

    const htmlContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Read ${tpl.code} template from disk (${htmlContent.length} bytes)`);

    try {
      // Check if template exists in the DB
      const { data: existing, error: selectErr } = await supabase
        .from('document_templates')
        .select('id, name')
        .eq('code', tpl.code);

      if (selectErr) {
        throw selectErr;
      }

      if (existing && existing.length > 0) {
        console.log(`Template for ${tpl.code} already exists (${existing.length} matching rows found). Updating...`);
        // Update all matching templates
        for (const row of existing) {
          const { error: updateErr } = await supabase
            .from('document_templates')
            .update({
              html_content: htmlContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', row.id);

          if (updateErr) {
            console.error(`Failed to update row ${row.id} for ${tpl.code}:`, updateErr.message);
          } else {
            console.log(`Successfully updated row ${row.id} for ${tpl.code} template!`);
          }
        }
      } else {
        console.log(`Template for ${tpl.code} does not exist in DB. Inserting...`);
        const { error: insertErr } = await supabase
          .from('document_templates')
          .insert({
            code: tpl.code,
            name: tpl.name,
            html_content: htmlContent,
            is_visible: true
          });

        if (insertErr) {
          console.error(`Failed to insert ${tpl.code} template:`, insertErr.message);
        } else {
          console.log(`Successfully inserted new ${tpl.code} template!`);
        }
      }
    } catch (err) {
      console.error(`Error processing template ${tpl.code}:`, err.message || err);
    }
  }

  console.log('Sync finished!');
}

syncTemplates();
