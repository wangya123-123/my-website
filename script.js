const toast = document.querySelector(".toast");
const searchForm = document.querySelector(".search-box");
const searchInput = document.querySelector("#searchInput");
const resultHint = document.querySelector("#resultHint");
const cards = [...document.querySelectorAll(".result-card")];
const sampleForm = document.querySelector(".sample-form");
const imageInput = document.querySelector("#textbookImage");
const sampleGoal = document.querySelector("#sampleGoal");
const sampleImage = document.querySelector("#sampleImage");
const sampleStatus = document.querySelector("#sampleStatus");
const emptySample = document.querySelector("#emptySample");
const fileName = document.querySelector("#fileName");
let toastTimer;

if (window.location.protocol === "file:") {
  window.location.replace("http://127.0.0.1:4173/");
}

function apiUrl(path) {
  const isLocalHost = ["127.0.0.1", "localhost", ""].includes(window.location.hostname);
  const isLocalPreview = isLocalHost && window.location.port && window.location.port !== "4173";

  if (window.location.protocol === "file:" || isLocalPreview) {
    return `http://127.0.0.1:4173${path}`;
  }

  return path;
}

function isStaticPagesHost() {
  return window.location.hostname.endsWith(".github.io");
}

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortenText(value, fallback, maxLength = 24) {
  const text = String(value || "").trim() || fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function makeStaticAnalysisImage(goal, filename) {
  const safeGoal = escapeSvgText(shortenText(goal, "省份 / 年级 / 科目待补充", 28));
  const safeFile = escapeSvgText(shortenText(filename, "已上传教材图片", 30));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280">
      <defs>
        <linearGradient id="top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563eb"/>
          <stop offset="1" stop-color="#10b981"/>
        </linearGradient>
        <style>
          text { font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif; fill: #122033; }
          .muted { fill: #5f6f86; }
          .white { fill: #ffffff; }
          .title { font-size: 54px; font-weight: 800; }
          .h2 { font-size: 31px; font-weight: 800; }
          .body { font-size: 25px; font-weight: 600; }
          .small { font-size: 22px; }
        </style>
      </defs>
      <rect width="1024" height="1280" rx="36" fill="#f8fbff"/>
      <rect x="48" y="48" width="928" height="210" rx="30" fill="url(#top)"/>
      <text x="92" y="132" class="white title">教材复习分析样板</text>
      <text x="94" y="188" class="white body">拍照上传后，生成考点、重点和复习路径</text>
      <text x="94" y="230" class="white small">教材：${safeFile}</text>

      <rect x="48" y="294" width="928" height="116" rx="24" fill="#ffffff" stroke="#d9e4f3"/>
      <text x="86" y="348" class="h2">识别信息</text>
      <text x="86" y="388" class="small muted">目标：${safeGoal}</text>

      <rect x="48" y="446" width="448" height="206" rx="24" fill="#ffffff" stroke="#d9e4f3"/>
      <text x="86" y="504" class="h2">历年题型方向</text>
      <text x="86" y="555" class="small">选择题 / 填空题：基础概念高频</text>
      <text x="86" y="598" class="small">综合题：方法迁移与步骤表达</text>

      <rect x="528" y="446" width="448" height="206" rx="24" fill="#ffffff" stroke="#d9e4f3"/>
      <text x="566" y="504" class="h2">常考框架</text>
      <text x="566" y="555" class="small">章节知识点串联</text>
      <text x="566" y="598" class="small">基础题 -> 变式题 -> 综合题</text>

      <rect x="48" y="688" width="928" height="210" rx="24" fill="#ffffff" stroke="#d9e4f3"/>
      <text x="86" y="748" class="h2">重点难点</text>
      <text x="86" y="802" class="small">重点：核心定义、公式使用、典型题模板</text>
      <text x="86" y="850" class="small">难点：条件提取、跨章节综合、易错步骤</text>

      <rect x="48" y="934" width="928" height="194" rx="24" fill="#eef7ff" stroke="#c9def8"/>
      <text x="86" y="992" class="h2">复习指标</text>
      <text x="86" y="1046" class="small">7天：补基础概念和例题</text>
      <text x="86" y="1092" class="small">14天：刷高频题型并整理错题</text>

      <rect x="48" y="1162" width="928" height="70" rx="22" fill="#122033"/>
      <text x="86" y="1208" class="white small">公开网页为静态演示版；接入后端后可调用小鸡聚合生成真实分析图。</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function runSearch(query) {
  const keyword = query.trim().toLowerCase();
  let matched = 0;

  cards.forEach((card) => {
    const text = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
    const visible = !keyword || text.includes(keyword);
    card.hidden = !visible;
    if (visible) matched += 1;
  });

  if (resultHint) {
    resultHint.textContent = keyword
      ? `找到 ${matched} 个相关入口。`
      : "先试试搜索，或直接点下面的入口。";
  }

  document.querySelector("#results")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(searchInput?.value || "");
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.getAttribute("data-query") || "";
    if (searchInput) searchInput.value = query;
    runSearch(query);
  });
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.getAttribute("data-toast") || "已打开");
  });
});

imageInput?.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (fileName) {
    fileName.textContent = file ? file.name : "支持 JPG、PNG、WEBP、GIF，10MB 以内";
  }
});

sampleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = imageInput?.files?.[0];
  const submitButton = sampleForm.querySelector("button[type='submit']");

  if (!file) {
    showToast("请先上传一张课本图片");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast("图片不能超过 10MB");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("goal", sampleGoal?.value || "");

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "正在生成...";
  }
  if (sampleStatus) sampleStatus.textContent = "正在分析教材版本、题型框架和复习路径，请稍等。";
  if (emptySample) emptySample.hidden = false;
  if (sampleImage) sampleImage.hidden = true;

  try {
    if (isStaticPagesHost()) {
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      if (sampleImage) {
        sampleImage.src = makeStaticAnalysisImage(sampleGoal?.value || "", file.name);
        sampleImage.hidden = false;
      }
      if (emptySample) emptySample.hidden = true;
      if (sampleStatus) {
        sampleStatus.textContent = "已生成公开演示样板。真实 AI 分析需要单独部署后端接口，不能把密钥放在静态网页里。";
      }
      showToast("已生成分析样板");
      return;
    }

    const response = await fetch(apiUrl("/api/textbook-sample"), {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "生成失败，请稍后再试");
    }

    if (!data.imageUrl) {
      throw new Error("接口没有返回图片地址");
    }

    if (sampleImage) {
      sampleImage.src = data.imageUrl;
      sampleImage.hidden = false;
    }
    if (emptySample) emptySample.hidden = true;
    if (sampleStatus) sampleStatus.textContent = "复习分析样板已生成，可以给用户预览。";
    if (data.demo && sampleStatus) {
      sampleStatus.textContent = "当前为本地演示样板。配置 XIAOJI_API_KEY 后会调用小鸡聚合真实生成。";
    }
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "生成失败，请稍后再试";
    const message =
      rawMessage === "Failed to fetch"
        ? "没有连接到本地后端服务。请先启动 server.py，并用 http://127.0.0.1:4173/ 打开页面。"
        : rawMessage;
    if (sampleStatus) sampleStatus.textContent = message;
    showToast(message);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "生成分析样板";
    }
  }
});

document.querySelector(".lead-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("已模拟提交，正式上线时可接入微信、表单或APP下载链接");
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
