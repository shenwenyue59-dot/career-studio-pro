const STORAGE_KEY = "career-studio-pro-v1";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let lastDeck = state.lastDeck || [];
let lastKeywordPlan = state.lastKeywordPlan || null;

const directionLibrary = [
  {
    signals: ["ai", "大模型", "智能", "agent", "gpt"],
    roles: ["AI 产品经理", "AI 产品设计师", "AIGC 产品经理", "智能化产品经理", "AI 应用产品经理"],
    skills: ["AI 应用", "大模型", "智能问答", "Agent", "提示词", "模型评估", "人机协同"],
    exclude: ["算法工程师", "数据标注", "电话销售", "售前销售"]
  },
  {
    signals: ["设计", "体验", "ux", "交互", "作品集", "figma"],
    roles: ["产品设计师", "交互设计师", "UX 设计师", "体验设计师", "服务设计师"],
    skills: ["用户研究", "交互设计", "信息架构", "可用性测试", "设计系统", "Figma"],
    exclude: ["平面设计", "美工", "视觉外包", "电商详情页"]
  },
  {
    signals: ["数据", "分析", "增长", "指标", "bi"],
    roles: ["数据产品经理", "增长产品经理", "商业分析产品经理", "数据分析师", "BI 产品经理"],
    skills: ["指标体系", "数据分析", "数据可视化", "A/B 测试", "漏斗分析", "SQL"],
    exclude: ["数据录入", "数据标注", "客服运营"]
  },
  {
    signals: ["b端", "saas", "企业", "平台", "后台", "crm"],
    roles: ["B 端产品经理", "SaaS 产品经理", "企业服务产品经理", "平台产品经理", "业务中台产品经理"],
    skills: ["复杂业务流程", "权限角色", "配置平台", "SaaS", "企业服务", "跨团队协作"],
    exclude: ["门店销售", "招商", "渠道销售"]
  },
  {
    signals: ["内容", "社区", "运营", "新媒体"],
    roles: ["内容产品经理", "社区产品经理", "用户运营", "内容运营", "增长运营"],
    skills: ["内容策略", "用户增长", "社区机制", "活动策划", "留存", "转化"],
    exclude: ["电话销售", "地推", "客服"]
  }
];

const defaultQuestions = [
  ["业务场景", "这个项目服务谁？他们原来遇到的具体问题是什么？问题有多严重？"],
  ["你的角色", "你是负责人、核心执行者还是协作者？你具体负责哪些决策？"],
  ["行动过程", "你做了哪些研究、分析、设计、推动或协调动作？为什么这样做？"],
  ["结果指标", "有没有效率、转化、收入、留存、满意度、成本、规模等数字？没有数字也可以写定性反馈。"],
  ["复杂度", "项目中最难的限制是什么？比如时间、资源、组织协同、技术约束、合规或业务冲突。"],
  ["可展示素材", "作品集中能展示哪些材料？流程图、信息架构、关键页面、实验数据、上线结果、复盘都可以。"]
];

const example = {
  directionIntent: "我想做 AI 产品里更偏用户体验和数据分析的工作，希望能结合 B 端复杂业务，不想做纯视觉，也不想做销售型售前。",
  workPreference: "AI 应用、B 端、数据分析、用户体验",
  avoidPreference: "纯视觉、销售、售前、数据标注",
  candidateBackground: "8 年产品设计，做过 SaaS、数据平台和 AI 工具",
  desiredSeniority: "高级 / Lead",
  validationJdText: "负责 AI 数据分析产品的用户研究、交互设计、数据可视化和体验优化；与产品、算法、工程团队协作推动方案落地；有 B 端 SaaS 设计经验优先。",
  targetRole: "高级产品设计师",
  targetCity: "上海",
  targetIndustry: "AI SaaS",
  targetLevel: "5-8 年",
  jdText: "岗位职责：负责 AI 数据分析产品的用户研究、交互设计和体验优化；与产品、算法、工程团队协作推动方案落地；建设设计系统并提升跨产品一致性。任职要求：5 年以上 B 端或 SaaS 设计经验，熟悉复杂业务流程、数据可视化、可用性测试，具备项目 owner 意识，有 AI 产品经验优先。",
  candidateProfile: "8 年产品设计经验，做过 B 端数据平台和 AI 工具，希望投高级产品设计师。",
  rawExperience: "负责企业数据工作台改版。做了用户访谈、流程梳理、原型和设计系统。上线后客户配置时间下降，运营反馈更好。",
  rawProjects: "AI Insight Console：给运营团队看的 AI 洞察控制台。我负责从调研到交互方案，做了问答、指标解释、异常追踪。结果是试点团队每周节省分析时间。",
  resumeDraft: "陈亦然\n高级产品设计师\n8 年 B 端产品设计经验，做过数据平台、AI 工具和设计系统。\nNorthstar Cloud 高级产品设计师 2022-至今\n负责企业数据工作台改版，做用户访谈、原型、设计系统。",
  portfolioGoal: "申请高级产品设计师，希望突出复杂业务理解、AI 产品经验、跨团队推动和数据化结果。",
  portfolioProjects: "项目 1：AI Insight Console。背景：运营团队需要快速解释指标异常。我的角色：Lead Designer。过程：访谈运营、拆解分析流程、设计问答和异常追踪。结果：试点团队分析时间下降。素材：信息架构、关键界面、流程对比、用户反馈。"
};

function save() {
  const data = collectInputs();
  data.lastDeck = lastDeck;
  data.lastKeywordPlan = lastKeywordPlan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  $("#saveAll").textContent = "已保存";
  setTimeout(() => ($("#saveAll").textContent = "保存"), 1000);
}

function collectInputs() {
  const data = {};
  $$("input, textarea, select").forEach((el) => {
    if (el.id) data[el.id] = el.value;
  });
  return data;
}

function restore() {
  Object.entries(state).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (el && typeof value === "string") el.value = value;
  });
  if (lastDeck.length) renderSlides(lastDeck);
  if (lastKeywordPlan) renderKeywordPlan(lastKeywordPlan);
  updateFinalResume();
  checkAiStatus();
}

async function api(action, payload) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });
    if (!response.ok) throw new Error("AI service unavailable");
    return await response.json();
  } catch {
    return null;
  }
}

async function checkAiStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();
    if (data.ai) {
      $("#aiStatus").textContent = "AI 已连接";
      $("#aiStatus").classList.add("is-ai");
    }
  } catch {
    $("#aiStatus").textContent = "规则模式";
  }
}

function words(text) {
  return (text || "").match(/[A-Za-z0-9+#.]+|[\u4e00-\u9fa5]{2,}/g) || [];
}

function keywordStats(text) {
  const stop = new Set(["岗位职责", "任职要求", "负责", "优先", "经验", "能力", "项目", "产品", "团队"]);
  const count = new Map();
  words(text).forEach((word) => {
    if (word.length < 2 || stop.has(word)) return;
    count.set(word, (count.get(word) || 0) + 1);
  });
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
}

function renderJdAnalysis(data) {
  const keywordList = data.keywords || keywordStats($("#jdText").value).map(([word]) => word);
  $("#jdInsights").innerHTML = [
    ["关键词", keywordList.length, "需要自然覆盖在摘要、技能和经历中"],
    ["能力组", (data.capabilities || []).length || 4, "用来判断你的经历是否匹配"],
    ["证据缺口", (data.gaps || []).length || 6, "这些信息会决定简历是否有说服力"],
    ["作品集页数", (data.slides || []).length || 10, "建议一套核心作品集控制在 10-14 页"]
  ].map(([label, value, note]) => `<div class="metric-card"><strong>${value}</strong><span>${label}<br>${note}</span></div>`).join("");

  const capabilities = data.capabilities || inferCapabilities($("#jdText").value);
  const gaps = data.gaps || inferGaps(keywordList);
  $("#jdAdvisor").innerHTML = `
    <h4>这个岗位看重什么</h4>
    <ul>${capabilities.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h4>为了做出好简历，你需要输入什么</h4>
    <ul>${gaps.map((item) => `<li>${item}</li>`).join("")}</ul>
    <div class="tag-row">${keywordList.slice(0, 12).map((item) => `<span class="tag">${item}</span>`).join("")}</div>
  `;
}

function inferCapabilities(text) {
  const pool = [];
  if (/AI|算法|智能|大模型/i.test(text)) pool.push("AI 产品理解：你要能说明模型能力如何转化为用户可用的功能。");
  if (/B端|SaaS|企业|平台|后台/.test(text)) pool.push("复杂业务设计：需要展示流程梳理、权限角色、配置效率或跨系统协同。");
  if (/数据|指标|可视化|分析/.test(text)) pool.push("数据化表达：作品集里要展示指标定义、洞察路径和决策依据。");
  if (/设计系统|组件|规范/.test(text)) pool.push("规模化能力：说明你如何沉淀规范、提升一致性和交付效率。");
  if (/协作|推动|跨团队|工程|产品/.test(text)) pool.push("落地推动：强调你如何和产品、研发、业务沟通取舍并推进上线。");
  return pool.length ? pool : ["岗位需要你证明：专业技能、业务理解、可落地成果和与目标岗位一致的项目证据。"];
}

function inferGaps(keywords) {
  return [
    `围绕 ${keywords.slice(0, 3).join("、") || "目标岗位关键词"}，各准备 1 个真实项目证据。`,
    "每段经历补充量化结果：提升、下降、规模、周期、人数、收入、成本、满意度任选其一。",
    "写清楚你的职责边界：你主导了什么，协作了什么，最终拍板或推动了什么。",
    "补充项目限制条件：时间、资源、技术、组织协同或业务冲突会让案例更有可信度。",
    "准备作品集素材：问题定义、流程图、方案前后对比、关键界面、上线反馈和复盘。"
  ];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function localKeywordMatch() {
  const intent = normalizeText([
    $("#directionIntent").value,
    $("#workPreference").value,
    $("#avoidPreference").value,
    $("#candidateBackground").value,
    $("#desiredSeniority").value
  ].join(" "));
  const scored = directionLibrary
    .map((item) => ({
      ...item,
      score: item.signals.reduce((sum, signal) => sum + (intent.includes(signal) ? 1 : 0), 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const selected = scored.length ? scored.slice(0, 3) : directionLibrary.slice(0, 2);
  const roles = unique(selected.flatMap((item) => item.roles)).slice(0, 10);
  const skills = unique(selected.flatMap((item) => item.skills)).slice(0, 14);
  const excludes = unique([
    ...selected.flatMap((item) => item.exclude),
    ...($("#avoidPreference").value.split(/[,，、\s]+/).filter((item) => item.length > 1))
  ]).slice(0, 12);
  const mustHave = skills.slice(0, 7);
  const niceHave = unique(["用户研究", "业务流程", "数据指标", "跨团队协作", "项目 owner", "上线结果", "设计系统", "增长"]).filter((item) => !mustHave.includes(item)).slice(0, 6);
  return {
    direction: roles.slice(0, 3).join(" / ") || "目标岗位方向",
    platforms: [
      {
        name: "Boss 直聘",
        searches: buildSearches(roles, skills, "boss"),
        reason: "Boss 更适合用短词和岗位名组合，先扩大样本，再通过 JD 内容筛掉跑偏岗位。"
      },
      {
        name: "猎聘",
        searches: buildSearches(roles, skills, "liepin"),
        reason: "猎聘中高端岗位更多，建议加入级别、行业和 owner/负责人类词。"
      },
      {
        name: "LinkedIn",
        searches: buildSearches(roles, skills, "linkedin"),
        reason: "LinkedIn 更适合中英文混搜，英文职能词能召回外企和国际团队岗位。"
      }
    ],
    mustHave,
    niceHave,
    excludes,
    validationRule: "随机打开前 20 个结果，至少 12 个 JD 命中 3 个以上核心词，且跑偏词少于 2 个，才算搜索词有效。"
  };
}

function buildSearches(roles, skills, platform) {
  const leadRole = roles[0] || "产品经理";
  const secondRole = roles[1] || leadRole;
  const leadSkill = skills[0] || "SaaS";
  const secondSkill = skills[1] || "数据分析";
  if (platform === "linkedin") {
    return unique([
      `${leadRole} ${leadSkill}`,
      `${secondRole} ${secondSkill}`,
      `Product Designer AI SaaS`,
      `Product Manager AI Data`
    ]).slice(0, 5);
  }
  if (platform === "liepin") {
    return unique([
      `${leadRole} ${leadSkill}`,
      `${secondRole} 负责人`,
      `${leadSkill} ${secondSkill} 高级`,
      `${leadRole} owner`
    ]).slice(0, 5);
  }
  return unique([
    `${leadRole}`,
    `${leadRole} ${leadSkill}`,
    `${secondRole} ${secondSkill}`,
    `${leadSkill} ${secondSkill}`
  ]).slice(0, 5);
}

function renderKeywordPlan(plan) {
  lastKeywordPlan = plan;
  $("#keywordOutput").innerHTML = `
    <div class="keyword-pack">
      <h4>推荐方向</h4>
      <code>${escapeHtml(plan.direction || "请先输入方向描述")}</code>
    </div>
    ${(plan.platforms || []).map((platform) => `
      <div class="keyword-pack">
        <h4>${escapeHtml(platform.name)}</h4>
        ${(platform.searches || []).map((item) => `<code>${escapeHtml(item)}</code>`).join("")}
        <p class="muted">${escapeHtml(platform.reason || "")}</p>
      </div>
    `).join("")}
    <div class="keyword-pack">
      <h4>命中标准</h4>
      <div class="tag-row">${(plan.mustHave || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
      <p class="muted">${escapeHtml(plan.validationRule || "")}</p>
    </div>
    <div class="keyword-pack">
      <h4>排除词</h4>
      <div class="tag-row">${(plan.excludes || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `;
}

async function matchDirection() {
  const ai = await api("match-keywords", collectInputs());
  renderKeywordPlan(ai && !ai.fallback ? ai : localKeywordMatch());
  save();
}

function validateKeywordResults() {
  const plan = lastKeywordPlan || localKeywordMatch();
  const jd = $("#validationJdText").value || $("#jdText").value;
  const text = normalizeText(jd);
  const must = plan.mustHave || [];
  const nice = plan.niceHave || [];
  const excludes = plan.excludes || [];
  const hitMust = must.filter((item) => text.includes(normalizeText(item)));
  const hitNice = nice.filter((item) => text.includes(normalizeText(item)));
  const hitBad = excludes.filter((item) => text.includes(normalizeText(item)));
  const score = Math.max(0, Math.min(100, Math.round((hitMust.length / Math.max(must.length, 1)) * 75 + (hitNice.length / Math.max(nice.length, 1)) * 25 - hitBad.length * 12)));
  const verdict = score >= 70 && hitBad.length <= 1 ? "搜索词基本有效" : score >= 45 ? "方向接近，但需要调词" : "结果明显跑偏";
  const advice = [];
  if (hitMust.length < Math.ceil(must.length * 0.45)) advice.push("核心词命中不足：把岗位名和 1-2 个核心能力一起搜索，例如“岗位名 + AI 应用 / 数据分析 / SaaS”。");
  if (hitBad.length) advice.push(`出现跑偏词：${hitBad.join("、")}。建议在平台筛选时避开这些岗位，或增加更具体的行业/职能词。`);
  if (score >= 70) advice.push("可以保留这组关键词，并开始批量收集 JD；下一步建议粘贴 5-8 条 JD 做岗位画像。");
  $("#keywordValidation").innerHTML = `
    <h4>${verdict}</h4>
    <div class="scorebar" style="--score:${score}%"><span></span></div>
    <p class="muted">匹配分：${score}/100。核心命中 ${hitMust.length}/${must.length}，辅助命中 ${hitNice.length}/${nice.length}，跑偏信号 ${hitBad.length} 个。</p>
    <h4>已命中的核心词</h4>
    <div class="tag-row">${hitMust.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || "<span class=\"muted\">暂无</span>"}</div>
    <h4>调整建议</h4>
    <ul>${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
  `;
}

async function analyzeJd() {
  const payload = collectInputs();
  const ai = await api("analyze-jd", payload);
  renderJdAnalysis(ai || {});
}

async function fetchUrls() {
  const urls = $("#jdUrls").value.split(/\n+/).map((url) => url.trim()).filter(Boolean);
  if (!urls.length) return;
  try {
    const response = await fetch("/api/fetch-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls })
    });
    const data = await response.json();
    const joined = data.results.map((item) => `【${item.url}】\n${item.text || item.error}`).join("\n\n");
    $("#jdText").value = [$("#jdText").value, joined].filter(Boolean).join("\n\n");
  } catch {
    $("#jdText").value += "\n\n链接读取失败。请复制网页中的 JD 原文粘贴到这里。";
  }
}

async function generateQuestions() {
  const ai = await api("generate-questions", collectInputs());
  const questions = ai?.questions?.length ? ai.questions : defaultQuestions.map(([title, body]) => ({ title, body }));
  $("#questionList").innerHTML = questions.map((q, index) => `
    <div class="question">
      <strong>${index + 1}. ${q.title}</strong>
      <span class="muted">${q.body}</span>
      <textarea placeholder="把答案写在这里，后续会进入简历和作品集素材库。"></textarea>
    </div>
  `).join("");
}

async function polishResume() {
  const ai = await api("polish-resume", collectInputs());
  const text = ai?.resume || localPolish();
  $("#resumeOutput").innerHTML = markdownLite(text);
  $("#resumeDraft").value = text;
  updateFinalResume();
}

function localPolish() {
  const role = $("#targetRole").value || "目标岗位";
  const profile = $("#candidateProfile").value || "具备相关经验";
  const exp = $("#rawExperience").value || $("#resumeDraft").value || "请补充具体经历。";
  const keywords = keywordStats($("#jdText").value).map(([word]) => word).slice(0, 8).join("、");
  return `# ${role} 简历草稿

## 专业摘要
${profile}。建议进一步补充岗位相关关键词：${keywords || "业务场景、核心技能、成果指标"}。摘要应控制在 3-4 行，突出年限、领域、代表项目和可量化结果。

## 核心经历
- 主导/参与：${exp}
- 建议改写为：围绕目标岗位需求，说明你在项目中的职责边界、关键动作、跨团队协作方式和最终业务影响。
- 需要补充：具体数字、用户规模、上线周期、效率变化、收入/成本影响或用户反馈。

## 关键词
${keywords || "请先分析 JD 获取关键词"}`;
}

function markdownLite(text) {
  return text
    .split(/\n+/)
    .map((line) => {
      if (line.startsWith("# ")) return `<h4>${line.slice(2)}</h4>`;
      if (line.startsWith("## ")) return `<h4>${line.slice(3)}</h4>`;
      if (line.startsWith("- ")) return `<ul><li>${line.slice(2)}</li></ul>`;
      return `<p>${line}</p>`;
    })
    .join("")
    .replaceAll("</ul><ul>", "");
}

async function makeDeck() {
  const ai = await api("make-deck", collectInputs());
  lastDeck = ai?.slides?.length ? ai.slides : localDeck();
  renderSlides(lastDeck);
  save();
}

function localDeck() {
  return [
    ["封面", "姓名、目标岗位、一句话专业定位。好封面要让面试官 5 秒内知道你适合什么岗位。"],
    ["个人定位", "3 个核心标签：行业经验、方法能力、代表结果。避免堆技能名词。"],
    ["项目目录", "选择 2-3 个最匹配 JD 的项目，按岗位需求排序。"],
    ["项目背景", "说明业务场景、目标用户、原始问题和成功标准。"],
    ["问题定义", "展示你如何发现真正问题，而不是直接跳到界面。"],
    ["研究与洞察", "放访谈、数据、竞品或流程分析，证明方案不是拍脑袋。"],
    ["方案演进", "展示 2-3 个关键取舍，让你的判断力被看见。"],
    ["关键界面", "用少量高质量页面讲清核心流程，不堆截图。"],
    ["结果指标", "写上线结果、试点反馈、效率变化或业务影响。"],
    ["复盘", "讲你学到了什么，下一步会如何迭代。"]
  ].map(([title, body], index) => ({ page: index + 1, title, body, approved: false }));
}

function renderSlides(slides) {
  $("#slidePlan").innerHTML = slides.map((slide, index) => `
    <div class="slide-card ${slide.approved ? "is-approved" : ""}" data-slide="${index}">
      <strong>第 ${index + 1} 页：${slide.title}</strong>
      <span class="muted">${slide.body}</span>
      <textarea rows="4">${slide.notes || ""}</textarea>
      <div class="slide-actions">
        <button data-approve type="button">${slide.approved ? "已确认" : "确认本页"}</button>
        <button data-rework type="button">需要重写</button>
      </div>
    </div>
  `).join("");
}

function exportDeck() {
  if (!lastDeck.length) makeDeck();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Portfolio Deck Draft</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;color:#162033}.slide{page-break-after:always;min-height:720px;padding:56px;border-bottom:1px solid #ddd}.kicker{color:#1457d9;font-weight:700}.title{font-size:42px;margin:18px 0}.body{font-size:22px;line-height:1.55;max-width:900px}.note{margin-top:36px;color:#66758a;font-size:16px}@media print{.slide{height:100vh}}</style></head><body>${lastDeck.map((s, i) => `<section class="slide"><div class="kicker">Page ${i + 1}</div><h1 class="title">${s.title}</h1><div class="body">${s.body}</div><div class="note">${s.notes || ""}</div></section>`).join("")}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio-deck-draft.html";
  a.click();
  URL.revokeObjectURL(url);
}

function updateFinalResume() {
  const text = $("#resumeDraft").value || $("#resumeOutput").textContent || localPolish();
  $("#finalResume").innerHTML = markdownLite(text).replaceAll("<h4>", "<h2>").replaceAll("</h4>", "</h2>");
}

$$(".nav__item").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".nav__item").forEach((item) => item.classList.remove("is-active"));
    $$(".view").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    $(`[data-panel="${button.dataset.view}"]`).classList.add("is-active");
    $("#viewTitle").textContent = button.textContent;
    updateFinalResume();
  });
});

$("#matchDirection").addEventListener("click", matchDirection);
$("#validateKeywords").addEventListener("click", validateKeywordResults);
$("#analyzeJd").addEventListener("click", analyzeJd);
$("#fetchUrls").addEventListener("click", fetchUrls);
$("#generateQuestions").addEventListener("click", generateQuestions);
$("#polishResume").addEventListener("click", polishResume);
$("#makeDeck").addEventListener("click", makeDeck);
$("#exportDeck").addEventListener("click", exportDeck);
$("#printPage").addEventListener("click", () => window.print());
$("#saveAll").addEventListener("click", save);
$("#loadExample").addEventListener("click", () => {
  Object.entries(example).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (el) el.value = value;
  });
  matchDirection();
  analyzeJd();
  generateQuestions();
  makeDeck();
});

$("#slidePlan").addEventListener("click", (event) => {
  const card = event.target.closest("[data-slide]");
  if (!card) return;
  const index = Number(card.dataset.slide);
  lastDeck[index].notes = card.querySelector("textarea").value;
  if (event.target.matches("[data-approve]")) lastDeck[index].approved = true;
  if (event.target.matches("[data-rework]")) lastDeck[index].approved = false;
  renderSlides(lastDeck);
  save();
});

document.addEventListener("input", () => {
  updateFinalResume();
});

restore();
