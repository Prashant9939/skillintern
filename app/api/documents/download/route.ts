import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { loadTemplate, getSlugFromTitle } from '@/lib/templates/template-loader';
import { renderTemplate } from '@/lib/templates/template-renderer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateType = searchParams.get('templateType');
    const studentId = searchParams.get('studentId');
    const internshipId = searchParams.get('internshipId');
    const bypassCache = searchParams.get('bypassCache') === 'true' || searchParams.get('force') === 'true';

    if (!templateType || !studentId || !internshipId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }



    let profile: any = null;
    let internship: any = null;
    let testResult: any = null;
    let payments: any[] = [];

    // 1. Fetch data
    if (isSupabaseConfigured() && supabase) {
      // Fetch profile
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      profile = pData;

      // Fetch internship
      const { data: iData } = await supabase.from('internships').select('*').eq('id', internshipId).single();
      internship = iData;

      // Fetch test result
      const { data: tData } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', studentId)
        .eq('internship_id', internshipId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      testResult = tData;

      // Fetch payments
      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'completed');
      payments = payData || [];
    } else {
      // Mock mode: retrieve mock data
      profile = {
        full_name: 'John Doe',
        roll_number: 'SI-10023',
        college_name: 'Tech University',
        university_name: 'State University',
        degree: 'Bachelor of Technology',
        department_stream: 'Computer Science',
        semester: '6th Semester',
      };
      internship = {
        id: internshipId,
        title: internshipId.includes('python') ? 'Python Programming' : internshipId.includes('data') ? 'Data Science' : 'Web Development',
        duration: '4 Weeks',
      };
      testResult = {
        score: 8,
        total_questions: 10,
        percentage: 80,
        reference_number: 'SI-MOCK-VERIFY-1234',
        completed_at: new Date().toISOString(),
      };
      payments = [
        {
          internship_id: internshipId,
          status: 'completed',
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }
    if (!internship) {
      return NextResponse.json({ success: false, error: 'Internship not found' }, { status: 404 });
    }

    // Gating authorization checks
    const cleanType = templateType.trim().toLowerCase();
    const isPaid = payments.some(
      (p: any) => p.internship_id === internshipId && p.status === 'completed'
    );
    const isPassed = testResult?.passed === true || (testResult?.percentage && testResult.percentage >= 40);

    if (['offer_letter', 'receipt', 'payment_receipt'].includes(cleanType)) {
      if (!isPaid) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Complete payment to unlock this document' }, { status: 403 });
      }
    } else if (
      ['certificate', 'internship_certificate', 'appreciation_certificate', 'marksheet', 'assessment_marksheet', 'project_report', 'internship_report', 'attendance_sheet', 'attendance_record'].includes(cleanType)
    ) {
      if (!isPassed) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Pass the assessment to unlock this document' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid document template type' }, { status: 400 });
    }

    // 2. Format Variables
    const internshipTitle = internship.title || 'Internship';
    const pct = testResult?.percentage || (testResult?.score && testResult?.total_questions ? Math.round((testResult.score / testResult.total_questions) * 100) : 0) || 0;
    
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';

    const scoreFormatted = `${pct}%`;
    const verificationId = testResult?.reference_number || testResult?.id || 'SI-MOCK-ID';

    const payment = payments.find(
      (p: any) => p.internship_id === internshipId && p.status === 'completed'
    );

    let joiningDate = new Date();
    if (payment) {
      joiningDate = new Date(payment.created_at);
    } else if (testResult?.completed_at) {
      joiningDate = new Date(testResult.completed_at);
      joiningDate.setDate(joiningDate.getDate() - 28);
    } else {
      joiningDate.setDate(joiningDate.getDate() - 28);
    }

    const completionDate = new Date(joiningDate.getTime() + 28 * 24 * 60 * 60 * 1000);

    const formattedJoiningDate = joiningDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedCompletionDate = completionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const renderData = {
      studentName: profile.full_name,
      collegeName: profile.college_name || 'N/A',
      universityName: profile.university_name || 'N/A',
      course: profile.department_stream || profile.degree || 'N/A',
      semester: profile.semester || 'N/A',
      rollNumber: profile.roll_number || 'N/A',
      internshipName: internshipTitle,
      internshipTitle: internshipTitle,
      score: scoreFormatted,
      grade: grade,
      startDate: formattedJoiningDate,
      joiningDate: formattedJoiningDate,
      endDate: formattedCompletionDate,
      completionDate: formattedCompletionDate,
      certificateId: verificationId,
      verificationId: verificationId,
      duration: internship.duration || '120 Hrs',
      issueDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    // 3. Cache Check and HTML/PDF Generation
    const format = searchParams.get('format') || 'pdf';
    const cacheDir = path.join(process.cwd(), 'pdf_cache');
    
    // Ensure cache directory exists
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Failed to create cache directory:', dirError);
    }

    const htmlCacheFilePath = path.join(cacheDir, `${templateType}_${studentId}_${internshipId}.html`);
    const pdfCacheFilePath = path.join(cacheDir, `${templateType}_${studentId}_${internshipId}.pdf`);

    if (format === 'html') {
      // Load, Render and Cache HTML
      const slug = getSlugFromTitle(internshipTitle);
      const templateHtml = await loadTemplate(templateType, slug, internshipId);
      let finalHtml = renderTemplate(templateHtml, renderData);

      // Inject base tag for relative images to load through host server origin in Puppeteer
      const { origin } = new URL(req.url);
      if (finalHtml.includes('<head>')) {
        finalHtml = finalHtml.replace('<head>', `<head><base href="${origin}/" />`);
      } else {
        finalHtml = `<base href="${origin}/" />` + finalHtml;
      }

      // Cache HTML to disk
      try {
        fs.writeFileSync(htmlCacheFilePath, finalHtml, 'utf-8');
      } catch (htmlCacheError) {
        console.error('Failed to cache HTML:', htmlCacheError);
      }

      return new Response(finalHtml, {
        headers: { 
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${templateType}_${studentId}.html"`
        },
      });
    }

    // Else: format === 'pdf'
    let pdfBuffer: Buffer | null = null;
    let fromCache = false;

    // Check if PDF cache already exists
    if (!bypassCache && fs.existsSync(pdfCacheFilePath)) {
      try {
        pdfBuffer = fs.readFileSync(pdfCacheFilePath);
        fromCache = true;
      } catch (cacheError) {
        console.error('Failed to read from PDF cache:', cacheError);
      }
    }

    if (!fromCache) {
      let finalHtml = '';
      
      // Try to read from HTML cache first
      if (!bypassCache && fs.existsSync(htmlCacheFilePath)) {
        try {
          finalHtml = fs.readFileSync(htmlCacheFilePath, 'utf-8');
        } catch (htmlReadError) {
          console.error('Failed to read HTML cache:', htmlReadError);
        }
      }

      // If HTML cache was not found or failed to read, regenerate it
      if (!finalHtml) {
        const slug = getSlugFromTitle(internshipTitle);
        const templateHtml = await loadTemplate(templateType, slug, internshipId);
        finalHtml = renderTemplate(templateHtml, renderData);

        const { origin } = new URL(req.url);
        if (finalHtml.includes('<head>')) {
          finalHtml = finalHtml.replace('<head>', `<head><base href="${origin}/" />`);
        } else {
          finalHtml = `<base href="${origin}/" />` + finalHtml;
        }

        // Cache the newly generated HTML for future use
        try {
          fs.writeFileSync(htmlCacheFilePath, finalHtml, 'utf-8');
        } catch (htmlCacheError) {
          console.error('Failed to cache HTML:', htmlCacheError);
        }
      }

      // Generate PDF using Puppeteer from finalHtml
      let browser: any = null;
      try {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        });
        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        const generatedPdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0mm',
            bottom: '0mm',
            left: '0mm',
            right: '0mm',
          },
        });
        pdfBuffer = Buffer.from(generatedPdf);

        // Write PDF to cache
        try {
          fs.writeFileSync(pdfCacheFilePath, pdfBuffer);
        } catch (writeError) {
          console.error('Failed to write PDF to cache:', writeError);
        }
      } catch (pdfError: any) {
        console.error('Puppeteer generation failed, returning HTML fallback instead:', pdfError);
        return new Response(finalHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    // Return the generated or cached PDF
    const dispositionParam = searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';
    return new Response(new Uint8Array(pdfBuffer!), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionParam}; filename="${templateType}_${studentId}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error in download api route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
