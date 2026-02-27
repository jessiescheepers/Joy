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

const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 signups per IP per hour

async function isRateLimited(
  supabase: ReturnType<typeof getSupabase>,
  ip: string
): Promise<boolean> {
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);

  if (error) {
    // If rate-limit check fails, allow the request (fail open)
    console.error("Rate limit check error:", error);
    return false;
  }

  return (count ?? 0) >= RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const resend = getResend();
  try {
    // Get IP from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") ?? "unknown";

    // Check rate limit
    if (await isRateLimited(supabase, ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

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
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const geo = await geoRes.json();
        city = geo.city || null;
        country = geo.country_name || null;
      }
    } catch {
      // Geolocation is best-effort; continue without it
    }

    // Insert into Supabase
    const { error: dbError } = await supabase.from("waitlist").insert({
      name: "",
      email: email.trim().toLowerCase(),
      newsletter_optin: false,
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
          <div style="font-family: Georgia, serif; color: #1E1E1E; width: 100%; max-width: 600px; line-height: 1.8; padding: 20px;">
            <p style="margin: 0 0 20px 0;">Hi,</p>
            <p style="margin: 0 0 20px 0;">Thanks for signing up to Joy's waitlist. You'll be among the first to know when we launch in April.</p>
            <p style="margin: 0 0 20px 0;"><strong>Meet our first feature, Sort.</strong><br/>It's one place for your work and life where you can share what's on your plate, make sense of it, and build a day that works for you - without adding more noise.</p>
            <p style="margin: 0 0 20px 0;">We're building this carefully and intentionally. If you have questions, ideas, or thoughts along the way, you're always welcome to reach out at <a href="mailto:hello@feeljoy.ai" style="color: #272682;">hello@feeljoy.ai</a>. We read everything and value what you think.</p>
            <p style="margin: 0 0 20px 0;">We'll be in touch soon.</p>
            <p style="margin: 0 0 30px 0;">Calvin & Jessie<br/>Co-founders</p>
            <a href="https://feeljoy.ai" style="display: inline-block;">
              <img src="https://feeljoy.ai/images/joy-logo.png" alt="Joy" width="80" style="width: 80px; height: auto;" />
            </a>
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
