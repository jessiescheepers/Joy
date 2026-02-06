import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 signups per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const resend = getResend();
  try {
    // Get IP from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") ?? "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, newsletter } = await request.json();

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Geolocation lookup (non-blocking failure)
    let city: string | null = null;
    let country: string | null = null;

    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, {
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const geo = await geoRes.json();
        city = geo.city || null;
        country = geo.country || null;
      }
    } catch {
      // Geolocation is best-effort; continue without it
    }

    // Insert into Supabase
    const { error: dbError } = await supabase.from("waitlist").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      newsletter_optin: Boolean(newsletter),
      city,
      country,
      ip,
    });

    if (dbError) {
      // Duplicate email check (Postgres unique constraint code)
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist" },
          { status: 409 }
        );
      }
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email via Resend
    try {
      await resend.emails.send({
        from: "Joy <hello@mail.feeljoy.ai>",
        to: email.trim().toLowerCase(),
        subject: "You're on Joy's waitlist",
        html: `
          <div style="font-family: Georgia, serif; color: #1E1E1E; max-width: 560px; line-height: 1.7;">
            <p>Hi,</p>
            <p>Thanks for signing up to Joy's waitlist. You'll be among the first to know when we launch in April.</p>
            <p><strong>Meet our first feature, Sort.</strong><br/>It's one place for your work and life where you can share what's on your plate, make sense of it, and build a day that works for you - without adding more noise.</p>
            <p>We're building this carefully and intentionally. If you have questions, ideas, or thoughts along the way, you're always welcome to reach out at <a href="mailto:hello@feeljoy.ai" style="color: #272682;">hello@feeljoy.ai</a>. We read everything and value what you think.</p>
            <p>We'll be in touch soon.</p>
            <p>Calvin & Jessie<br/>Co-founders, <a href="https://feeljoy.ai" style="color: #272682;">Joy</a></p>
          </div>
        `,
      });
    } catch (emailError) {
      // Log but don't fail the signup if email fails
      console.error("Resend email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
