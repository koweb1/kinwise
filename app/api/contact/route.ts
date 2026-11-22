import { NextResponse } from "next/server";
import { BUDGET_OPTIONS, CONTACT_EMAIL, SERVICE_OPTIONS, serviceLabel } from "@/lib/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A small per-address limit. On serverless hosting each instance keeps its own count,
// so treat it as a speed bump, not a wall.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isLimited(ip)) {
    return fail("Too many messages. Please try again in a few minutes.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  if (typeof body !== "object" || body === null) return fail("Invalid request.", 400);

  const data = body as Record<string, unknown>;

  // Spam traps: a filled hidden field, or a form submitted in under 2.5 seconds.
  // Bots get a fake success so they learn nothing.
  if (typeof data.website === "string" && data.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }
  const elapsed = Number(data.elapsed);
  if (Number.isFinite(elapsed) && elapsed < 2500) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof data.name === "string" ? data.name.replace(/[\r\n]+/g, " ").trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const budget = typeof data.budget === "string" ? data.budget.trim() : "";
  const services = Array.isArray(data.services) ? data.services : [];

  if (name.length < 2 || name.length > 100) return fail("Please enter your name.", 400);
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return fail("Please enter a valid email address.", 400);
  }
  if (message.length < 10 || message.length > 3000) {
    return fail("Please tell me a little more about your project.", 400);
  }

  const validIds = SERVICE_OPTIONS.map((option) => option.id as string);
  const validServices = services.filter(
    (service): service is string => typeof service === "string" && validIds.includes(service)
  );
  if (validServices.length === 0 || validServices.length > validIds.length) {
    return fail("Please choose at least one service.", 400);
  }

  // The budget is optional and only counts for a single service
  const budgetIsValid = (BUDGET_OPTIONS as readonly string[]).includes(budget);
  const finalBudget = validServices.length === 1 && budgetIsValid ? budget : "";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return fail("The message could not be sent right now.", 500);
  }

  const to = process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Kinwise Portfolio <onboarding@resend.dev>";
  const serviceList = validServices.map(serviceLabel).join(", ");

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Services: ${serviceList}`,
    finalBudget ? `Budget: ${finalBudget}` : null,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px">New project enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Services:</strong> ${escapeHtml(serviceList)}</p>
      ${finalBudget ? `<p><strong>Budget:</strong> ${escapeHtml(finalBudget)}</p>` : ""}
      <p style="margin-top:16px"><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New project enquiry from ${name}`,
        text,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Resend error", response.status, await response.text());
      return fail("The message could not be sent right now.", 502);
    }
  } catch (error) {
    console.error("Resend request failed", error);
    return fail("The message could not be sent right now.", 502);
  }

  return NextResponse.json({ ok: true });
}