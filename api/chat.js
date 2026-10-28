// Vercel Edge Function: secure proxy to the Anthropic API (key stays on the server).
export const config = { runtime: "edge" };

const SYSTEM = {
  assistant: "You are Nova, a friendly, accurate and concise AI assistant. Use Markdown formatting.",
  tutor: "You are Nova, a patient study tutor. Explain step by step, use simple examples, and end with a short check-your-understanding question. Use Markdown.",
  coder: "You are Nova, an expert senior software engineer. Give correct, clean code in fenced code blocks with brief explanations.",
  writer: "You are Nova, a writing coach. Improve clarity, tone and structure, and explain your edits briefly. Use Markdown.",
};

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return new Response("Missing ANTHROPIC_API_KEY", { status: 500 });

  let body;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

  const { messages, mode } = body;
  const valid =
    Array.isArray(messages) && messages.length > 0 && messages.length <= 20 &&
    messages.every(m => ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" && m.content.length > 0 && m.content.length <= 8000);
  if (!valid) return new Response("Invalid messages", { status: 400 });

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1500,
      system: SYSTEM[mode] || SYSTEM.assistant,
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status });

  // Convert Anthropic SSE events into a plain text stream.
  const enc = new TextEncoder(), dec = new TextDecoder();
  let buf = "";
  const stream = upstream.body.pipeThrough(new TransformStream({
    transform(chunk, ctrl) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(line.slice(5));
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta")
            ctrl.enqueue(enc.encode(ev.delta.text));
        } catch {}
      }
    },
  }));

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
