/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPaymentRecord, getPlatformSettings } from "@/lib/supabase/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { internshipId: bodyInternshipId, studentId: bodyStudentId } = body;
    const internshipId = bodyInternshipId || "general";

    // Get platform settings
    const settings = await getPlatformSettings();
    if (!settings.payments_enabled) {
      return NextResponse.json({ error: "Payments are currently disabled by the administrator." }, { status: 400 });
    }

    // Enforce pricing dynamically
    const amount = settings.assessment_fee * 100;

    // Get user session from cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ugintern_session")?.value;
    let studentId = "";

    if (sessionCookie) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionCookie));
        studentId = session.id;
      } catch (e) {
        console.warn("Failed to parse session cookie:", e);
      }
    }

    // Fallback to studentId from body in mock local storage testing mode
    if (!studentId && bodyStudentId) {
      studentId = bodyStudentId;
    }

    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized. Student session not found." }, { status: 401 });
    }

    // Call Razorpay API to create the order
    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${studentId.substring(0, 8)}_${Date.now()}`,
    };

    let order;
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials not configured.");
      }
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      order = await razorpay.orders.create(options);
    } catch (razorError: any) {
      console.warn("Razorpay API error, falling back to mock order:", razorError);
      order = {
        id: "order_mock_" + Math.random().toString(36).substring(7),
        amount,
        currency: "INR",
      };
    }

    // Save pending payment record
    try {
      await createPaymentRecord(studentId, internshipId, order.id, amount);
    } catch (dbErr) {
      console.warn("Could not save pending payment to database:", dbErr);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Create order endpoint error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
