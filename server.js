const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const workspace = path.resolve(root, "..", "..");
const envPath = path.join(workspace, ".env.local");

loadEnv(envPath);

const port = Number(process.env.PORT || 4173);
const apiKey = process.env.OPENAI_API_KEY;

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { resolve({}); }
    });
  });
}

async function callOpenAI(action, payload) {
  if (!apiKey) return null;
  const instructions = [
    "You are a senior Chinese career consultant.",
    "Help users build strong resumes and portfolio decks from job descriptions.",
    "Be concrete, evidence-seeking, and honest about missing data.",
    "Return compact JSON only."
  ].join(" ");
  const schemaHint = {
    "analyze-jd": "Return {keywords:string[], capabilities:string[], gaps:string[], slides:string[]}.",
    "match-keywords": "Return {direction:string, platforms:[{name:string, searches:string[], reason:string}], mustHave:string[], niceHave:string[], excludes:string[], validationRule:string}. Convert vague career intent into platform-specific job-search keyword packs for Boss Zhipin, Liepin, and LinkedIn. Include validation rules for checking whether returned JDs match the intent.",
    "generate-questions": "Return {questions:[{title:string, body:string}]} with 6-10 specific questions.",
    "polish-resume": "Return {resume:string} in Markdown. Preserve facts; mark missing metrics as XX instead of inventing.",
    "make-deck": "Return {slides:[{page:number,title:string,body:string,notes:string,approved:false}]} for a 10-14 page portfolio PPT."
  }[action];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: `${instructions}\n${schemaHint}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`
    })
  });
  if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((c) => c.text).join("\n") || "{}";
  return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
}

async function fetchUrlText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 CareerStudioPro/1.0",
      "Accept": "text/html,text/plain"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 8000);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (url.pathname === "/api/status") {
    return send(res, 200, { ai: Boolean(apiKey) });
  }

  if (url.pathname === "/api/ai" && req.method === "POST") {
    const body = await readBody(req);
    try {
      const result = await callOpenAI(body.action, body.payload);
      return send(res, 200, result || { fallback: true });
    } catch (error) {
      return send(res, 503, { error: "AI unavailable", detail: error.message });
    }
  }

  if (url.pathname === "/api/fetch-jd" && req.method === "POST") {
    const body = await readBody(req);
    const urls = Array.isArray(body.urls) ? body.urls.slice(0, 8) : [];
    const results = [];
    for (const target of urls) {
      try {
        results.push({ url: target, text: await fetchUrlText(target) });
      } catch (error) {
        results.push({ url: target, error: `无法读取：${error.message}。请复制 JD 原文粘贴。` });
      }
    }
    return send(res, 200, { results });
  }

  const filePath = path.join(root, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!filePath.startsWith(root)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(filePath, (error, data) => {
    if (error) return send(res, 404, "Not found", "text/plain");
    const ext = path.extname(filePath);
    const type = ext === ".css" ? "text/css; charset=utf-8" : ext === ".js" ? "application/javascript; charset=utf-8" : "text/html; charset=utf-8";
    send(res, 200, data, type);
  });
});

server.listen(port, () => {
  console.log(`Career Studio Pro running at http://localhost:${port}`);
  console.log(apiKey ? "AI enabled" : "AI disabled: add OPENAI_API_KEY to .env.local");
});
