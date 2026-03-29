import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(userId: string): string {
  const oauth2 = createOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    prompt: "consent",
    state: Buffer.from(userId).toString("base64url"),
  });
}

export async function exchangeCode(code: string) {
  const oauth2 = createOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  return tokens;
}

export async function getGmailEmail(accessToken: string, refreshToken?: string | null): Promise<string> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2 });
  const profile = await gmail.users.getProfile({ userId: "me" });
  return profile.data.emailAddress || "";
}

const SEARCH_QUERIES = [
  "from:nbo.co.om debited",
  "subject:(payment receipt) OR subject:(transaction alert) OR subject:(debit alert)",
  "from:talabat OR from:amazon",
  "subject:(your payment) OR subject:(payment confirmation)",
  "subject:(purchase confirmation) OR subject:(order confirmed)",
];

async function fetchEmailsForQuery(
  gmail: ReturnType<typeof google.gmail>,
  query: string,
  maxResults = 50
): Promise<Array<{ id: string; subject: string; from: string; body: string; date: string }>> {
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  const results = [];

  for (const msg of messages) {
    if (!msg.id) continue;
    try {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = detail.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const dateHeader = headers.find((h) => h.name === "Date")?.value || "";

      const body = extractBody(detail.data.payload);

      results.push({ id: msg.id, subject, from, body: body.substring(0, 2000), date: dateHeader });
    } catch {
      // skip unreadable messages
    }
  }
  return results;
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" || part.mimeType === "text/html") {
        const text = extractBody(part);
        if (text) return text;
      }
    }
    // fallback: try any part
    for (const part of payload.parts) {
      const text = extractBody(part);
      if (text) return text;
    }
  }
  return "";
}

export interface ExtractedTransaction {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  emailId: string;
}

export async function extractTransactionsFromGmail(
  accessToken: string,
  refreshToken?: string | null
): Promise<ExtractedTransaction[]> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  // Fetch emails from all queries, deduplicate by id
  const emailMap = new Map<string, { id: string; subject: string; from: string; body: string; date: string }>();
  for (const query of SEARCH_QUERIES) {
    try {
      const emails = await fetchEmailsForQuery(gmail, query, 30);
      for (const e of emails) emailMap.set(e.id, e);
    } catch {
      // continue with next query
    }
  }

  if (emailMap.size === 0) return [];

  const emailsArray = Array.from(emailMap.values());

  // Build prompt for Claude
  const emailSnippets = emailsArray
    .map(
      (e, i) =>
        `EMAIL_${i + 1} [id:${e.id}]:\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nBody:\n${e.body}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are a financial transaction extractor. For each email provided, extract bank debit/purchase transactions.

Rules:
- Skip internal bank transfers (A/C to A/C)
- Skip OTP, security, and promotional emails
- Skip credited/incoming transactions
- Normalize merchant names: remove branch codes, excess whitespace, trailing dots, bank codes
- If currency is unclear, default to OMR
- Categories: Food & Dining, Groceries, Shopping, Fuel, Utilities & Bills, Subscriptions & Tech, Entertainment, Transport, Hotels, Personal Care & Health, Other

Return ONLY a valid JSON array. No markdown, no explanation.
Each object: {"emailId":"EMAIL_ID","merchant":"Name","amount":0.000,"currency":"OMR","date":"YYYY-MM-DD","category":"Category"}`;

  const userPrompt = `Extract all debit/purchase transactions from these emails:\n\n${emailSnippets}\n\nReturn a JSON array only.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  let rawText = content.text.trim();
  // Strip any accidental markdown fences
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
  }

  let parsed: any[];
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((t) => t.emailId && t.merchant && t.amount != null && t.date)
    .map((t) => ({
      emailId: t.emailId,
      merchant: String(t.merchant),
      amount: parseFloat(t.amount),
      currency: String(t.currency || "OMR"),
      date: String(t.date),
      category: String(t.category || "Other"),
    }));
}
