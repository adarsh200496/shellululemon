// ============================
// 0) CONFIG YOU WILL EDIT
// ============================

// Gate Q/A (case-insensitive, trims spaces)
const GATE_QUESTION = "Which Labubu Variant Did I Get You?";
const GATE_ANSWER   = "happiness"; // lower-case

// Your background music file
const MUSIC_SRC = "assets/music/song.mp3";

// Add your timeline moments here (10–20 recommended)
// Tip: name photos 01.jpg, 02.jpg ...
const moments = [
  // Example entries — replace with yours:
  { date: "Apr 11, 2024", caption: "Sneak peak at our first actual date!", img: "assets/photos/01.jpg" },
  { date: "Apr 30, 2024", caption: "Here's to trying out more weird food in our future!", img: "assets/photos/02.jpg" },
  { date: "May 4, 2024", caption: "Wishing you a life full of friends, sunshine, and the shore!", img: "assets/photos/03.jpg" },
  { date: "Jun 8, 2024", caption: "Our first corporate outing together!", img: "assets/photos/04.jpg" },
  { date: "Jun 22, 2024", caption: "Looking forward to many, many cute candids together!", img: "assets/photos/05.jpg" },
  { date: "Sep 8, 2024", caption: "Let's try and not be SALTY in life!", img: "assets/photos/06.jpg" },
  { date: "Oct 16, 2024", caption: "Super-exciting and creative Groupon together!", img: "assets/photos/07.jpg" },
  { date: "Oct 20, 2024", caption: "First overnight trip of ours to Yosemite!", img: "assets/photos/08.jpg" },
  { date: "Jan 16, 2025", caption: "One of many fancy-schmancy dates of ours!", img: "assets/photos/09.jpg" },
  { date: "Jun 1, 2025", caption: "Praying for a lifetime of you not getting seasick!", img: "assets/photos/10.jpg" },
  { date: "Dec 26, 2025", caption: "No one has looked cuter than us in our onesies!", img: "assets/photos/11.jpg" },
  { date: "Jan 10, 2026", caption: "Finally, here's to seeing you again super-duper soon!", img: "assets/photos/12.jpg" },
  // End card (no image)
  {
    type: "end",
    title: "Happy Valentine's Day, Shellu!",
    caption: "Looking forward to making some great memories in the future!"
  }
];

// ============================
// 1) DOM HOOKS
// ============================
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const gateInput = document.getElementById("gateInput");
const gateError = document.getElementById("gateError");
const timelineEl = document.getElementById("timeline");
const dotsEl = document.getElementById("timelineDots");
const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");

// Set gate question text
document.querySelector(".gate-question").textContent = GATE_QUESTION;

// ============================
// 2) BASIC "SEMI-PRIVATE" GATE
// ============================
// Note: This is client-side only; it keeps casual visitors out but is not server-grade security.
const STORAGE_KEY = "valentine_unlocked_v1";

function setUnlocked() {
  localStorage.setItem(STORAGE_KEY, "1");
  gate.style.display = "none";
}

function isUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

gateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ans = (gateInput.value || "").trim().toLowerCase();
  if (ans === GATE_ANSWER) {
    gateError.textContent = "";
    setUnlocked();

    // Try to start music politely (autoplay requires user gesture; this submit counts as one)
    const saved = localStorage.getItem("music_on_v1");
    if (saved === "1") await playMusic();
  } else {
    gateError.textContent = "Nope 😄 Try again.";
    gateInput.focus();
    gateInput.select();
  }
});

// Show gate unless unlocked
if (isUnlocked()) gate.style.display = "none";
else gateInput.focus();

// ============================
// 3) BUILD TIMELINE (one moment per screen)
// ============================
function buildTimeline() {
  // dots
  dotsEl.innerHTML = "";
  for (let i = 0; i < moments.length; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    dotsEl.appendChild(d);
  }
  
  // moments sections
  timelineEl.innerHTML = "";
  moments.forEach((m, idx) => {
    const section = document.createElement("section");
    section.className = "section";
    section.dataset.index = String(idx);
  
    const wrap = document.createElement("div");
    wrap.className = "moment";
  
    const card = document.createElement("div");
    card.className = "card";
  
    if (m.type === "end") {
      card.classList.add("end-card");
      card.innerHTML = `
        <div class="end-inner">
          <div class="end-title">${escapeHtml(m.title)}</div>
          <div class="end-text">${escapeHtml(m.caption)}</div>
          <div class="end-heart">❤️</div>
        </div>
      `;
    } else {
      const img = document.createElement("img");
      img.className = "photo";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = m.img;
      img.alt = `Memory ${idx + 1}`;
  
      const caption = document.createElement("div");
      caption.className = "caption";
      caption.innerHTML = `
        <h2 class="date">${escapeHtml(m.date)}</h2>
        <p class="text">${escapeHtml(m.caption)}</p>
      `;
  
      card.appendChild(img);
      card.appendChild(caption);
    }
  
    wrap.appendChild(card);
    section.appendChild(wrap);
    timelineEl.appendChild(section);
  });
}  

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

buildTimeline();

// ============================
// 4) REVEAL ON SCROLL (premium smooth)
// ============================
const dots = () => Array.from(document.querySelectorAll(".dot"));
const momentsEls = () => Array.from(document.querySelectorAll(".moment"));

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("reveal");
      // Activate corresponding dot
      const idx = Number(e.target.closest(".section")?.dataset.index || 0);
      dots().forEach((d, i) => d.classList.toggle("active", i === idx));
    }
  }
}, {
  threshold: 0.40,
});

momentsEls().forEach(el => io.observe(el));

// ============================
// 5) MUSIC TOGGLE (remembers preference)
// ============================
bgm.src = MUSIC_SRC;

async function playMusic(){
  try {
    await bgm.play();
    musicLabel.textContent = "On";
    localStorage.setItem("music_on_v1", "1");
  } catch (e) {
    // Autoplay restrictions — user can toggle manually
    musicLabel.textContent = "Off";
    localStorage.setItem("music_on_v1", "0");
  }
}
function pauseMusic(){
  bgm.pause();
  musicLabel.textContent = "Off";
  localStorage.setItem("music_on_v1", "0");
}

musicToggle.addEventListener("click", async () => {
  if (bgm.paused) await playMusic();
  else pauseMusic();
});

// Restore music preference (only actually plays after a user gesture)
if (localStorage.getItem("music_on_v1") === "1") {
  musicLabel.textContent = "On";
} else {
  musicLabel.textContent = "Off";
}

// ============================
// 6) SUBTLE FLOATING HEARTS (canvas)
// ============================
const canvas = document.getElementById("heartsCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas(){
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const hearts = [];
const HEARTS_MAX = 24;

function rand(min, max){ return Math.random() * (max - min) + min; }

function spawnHeart(){
  const size = rand(8, 16);
  hearts.push({
    x: rand(0, window.innerWidth),
    y: window.innerHeight + rand(20, 200),
    vy: rand(0.25, 0.65),
    vx: rand(-0.15, 0.15),
    a: rand(0.10, 0.22),
    s: size,
    r: rand(-0.6, 0.6),
    vr: rand(-0.003, 0.003),
  });
  if (hearts.length > HEARTS_MAX) hearts.shift();
}

function drawHeart(x, y, s, rot, alpha){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  // A soft blush tone
  ctx.fillStyle = "rgba(181,83,106,1)";
  ctx.beginPath();
  const t = s;
  ctx.moveTo(0, t/4);
  ctx.bezierCurveTo(0, -t/2, -t, -t/2, -t, t/6);
  ctx.bezierCurveTo(-t, t, 0, t*1.15, 0, t*1.5);
  ctx.bezierCurveTo(0, t*1.15, t, t, t, t/6);
  ctx.bezierCurveTo(t, -t/2, 0, -t/2, 0, t/4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

let last = 0;
function tick(ts){
  const dt = Math.min(32, ts - last);
  last = ts;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Keep it subtle: spawn slowly
  if (Math.random() < 0.08) spawnHeart();

  for (const h of hearts) {
    h.x += h.vx * dt;
    h.y -= h.vy * dt;
    h.r += h.vr * dt;

    // fade out near top
    const fade = Math.max(0, Math.min(1, (h.y / window.innerHeight)));
    const alpha = h.a * fade;

    drawHeart(h.x, h.y, h.s, h.r, alpha);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
