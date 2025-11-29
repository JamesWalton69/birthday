/* ============================================================
   GLOBAL VARIABLES
============================================================ */
const sections = [
    "welcome-section",
    "candle-section",
    "main-photo-section",
    "gallery-section",
    "letter-section"
];

let currentSection = 0;
let personData = {};
let letterText = "";
let index = 0;
let typingSpeed = 35;

const imageList = [
    "front.jpg",
    "pic1.jpg","pic2.jpg","pic3.jpg","pic4.jpg","pic5.jpg",
    "pic6.jpg","pic7.jpg","pic8.jpg","pic9.jpg"
];

/* ============================================================
   SECTION SWITCHER
============================================================ */
function showSection(num) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sections[num]).classList.add("active");
    currentSection = num;
}

/* ============================================================
   DYNAMIC DATA LOADING
============================================================ */
async function loadPersonInfo() {
    try {
        const res = await fetch("assets/data.txt");
        const text = await res.text();
        let lines = text.split("\n");

        lines.forEach(line => {
            let [key, val] = line.split("=");
            if (!key || !val) return;
            personData[key.trim().toLowerCase()] = val.trim();
        });

        document.getElementById("person-name").textContent =
            personData["name"] || "Friend";

        document.getElementById("person-relationship").textContent =
            personData["what belongs to me"]?.toUpperCase() ||
            personData["relationship"] ||
            "Friend";

        if (personData["dob"]) {
            let age = calcAge(personData["dob"]);
            document.getElementById("person-age").textContent = `Age: ${age}`;
        }

    } catch (err) {
        console.log("Error loading data.txt", err);
        document.getElementById("person-name").textContent = "Friend";
        document.getElementById("person-relationship").textContent = "Friend";
        document.getElementById("person-age").textContent = "Age: —";
    }
}

function calcAge(d) {
    let birth = new Date(d);
    let today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    let m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    return age;
}

/* ============================================================
   LOAD LETTER
============================================================ */
async function loadLetter() {
    try {
        const res = await fetch("assets/letter.txt");
        letterText = await res.text();
    } catch (err) {
        console.log("Error loading letter.txt", err);
        letterText = "Happy Birthday!";
    }
}
/* ============================================================
   LOAD IMAGES INTO APPLE CAROUSEL
============================================================ */
async function loadImages() {
    const carousel = document.getElementById("carousel");

    imageList.forEach((imgName) => {
        const item = document.createElement("div");
        item.className = "carousel-item small";

        item.innerHTML = `
            <img src="assets/${imgName}" draggable="false">
        `;

        carousel.appendChild(item);
    });

    document.getElementById("main-photo").src = "assets/front.jpg";

    setupCarouselScaling();
    autoScrollCarousel();
}

/* ============================================================
   APPLE CAROUSEL SCALING
============================================================ */
function setupCarouselScaling() {
    const container = document.querySelector(".carousel-container");
    const items = document.querySelectorAll(".carousel-item");

    function update() {
        const center = container.scrollLeft + container.offsetWidth / 2;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const dist = Math.abs(itemCenter - window.innerWidth / 2);

            if (dist < 140) {
                item.classList.add("active");
                item.classList.remove("medium", "small");
            } else if (dist < 300) {
                item.classList.add("medium");
                item.classList.remove("active", "small");
            } else {
                item.classList.add("small");
                item.classList.remove("active", "medium");
            }
        });

        requestAnimationFrame(update);
    }

    update();
}

/* ============================================================
   AUTO-SCROLL (slow, smooth, aesthetic)
============================================================ */
function autoScrollCarousel() {
    const container = document.querySelector(".carousel-container");

    let direction = 1;
    setInterval(() => {
        container.scrollLeft += direction * 1.2;

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5)
            direction = -1;

        if (container.scrollLeft <= 5)
            direction = 1;

    }, 16); // 60fps
}
/* ============================================================
   CANDLE BLOW LOGIC
============================================================ */
const flame = document.getElementById("flame");

function blowCandle() {
    if (flame.classList.contains("blown")) return;

    flame.classList.add("blown");

    setTimeout(() => showSection(2), 800);
}

flame.addEventListener("click", blowCandle);
flame.addEventListener("mouseover", blowCandle);

/* ============================================================
   BUTTON NAVIGATION
============================================================ */
document.getElementById("start-btn").addEventListener("click", () => {
    showSection(1);
});

document.getElementById("go-gallery").addEventListener("click", () => {
    showSection(3);
});

/* ============================================================
   OPEN LETTER
============================================================ */
document.getElementById("open-letter").addEventListener("click", () => {
    showSection(4);

    setTimeout(() => {
        document.getElementById("envelope").classList.add("open");

        setTimeout(() => {
            document.getElementById("letter").classList.remove("hidden");
            startTyping();
            startMusic();
            launchConfetti();
        }, 800);

    }, 600);
});

/* ============================================================
   TYPING EFFECT + FLOATING HEARTS
============================================================ */
function startTyping() {
    const output = document.getElementById("typed-letter");
    const cursor = document.getElementById("cursor");

    output.textContent = "";
    index = 0;

    function type() {
        if (index < letterText.length) {
            output.textContent += letterText[index];
            index++;

            if (Math.random() < 0.1) spawnHearts();

            let delay = typingSpeed;
            if (letterText[index - 1] === ".") delay = 250;
            if (letterText[index - 1] === ",") delay = 120;

            setTimeout(type, delay);
        } else {
            cursor.style.display = "none";
            startFireworks();
        }
    }

    type();
}

/* FLOATING HEARTS */
function spawnHearts() {
    const h = document.createElement("div");
    h.textContent = "💛";
    h.style.position = "fixed";
    h.style.left = Math.random() * window.innerWidth + "px";
    h.style.top = window.innerHeight + "px";
    h.style.fontSize = (Math.random() * 20 + 20) + "px";
    h.style.opacity = 0.7;
    h.style.pointerEvents = "none";
    h.style.transition = "transform 3s linear, opacity 3s linear";
    document.body.appendChild(h);

    setTimeout(() => {
        h.style.transform = `translateY(-${window.innerHeight + 200}px)`;
        h.style.opacity = 0;
    }, 50);

    setTimeout(() => h.remove(), 3000);
}
/* ============================================================
   GOLD PARTICLE BACKGROUND
============================================================ */
const canvas = document.getElementById("gold-particles");
const ctx = canvas.getContext("2d");
let w, h;
let particles = [];

function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
    const count = 120;
    particles = [];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.5 + 0.3,
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${p.a})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
    });

    requestAnimationFrame(drawParticles);
}

createParticles();
drawParticles();

/* ============================================================
   CONFETTI (when envelope opens)
============================================================ */
function launchConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 6,
            startVelocity: 30,
            spread: 360,
            colors: ["#FFD700", "#FFF6C5", "#FDE68A"],
            origin: { x: Math.random(), y: Math.random() * 0.3 }
        });

        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

/* ============================================================
   FIREWORKS (after typing)
============================================================ */
function startFireworks() {
    const fwCanvas = document.createElement("canvas");
    fwCanvas.style.position = "fixed";
    fwCanvas.style.top = 0;
    fwCanvas.style.left = 0;
    fwCanvas.style.width = "100vw";
    fwCanvas.style.height = "100vh";
    fwCanvas.style.pointerEvents = "none";
    fwCanvas.style.zIndex = 99999;
    document.body.appendChild(fwCanvas);

    const fctx = fwCanvas.getContext("2d");
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;

    let fwParticles = [];

    function explode(x, y) {
        for (let i = 0; i < 60; i++) {
            fwParticles.push({
                x, y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                r: Math.random() * 3 + 1,
                life: 60
            });
        }
    }

    function render() {
        fctx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

        fwParticles.forEach((p, i) => {
            fctx.beginPath();
            fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            fctx.fillStyle = `rgba(255,215,0,${p.life / 60})`;
            fctx.fill();

            p.x += p.dx;
            p.y += p.dy;
            p.life--;

            if (p.life <= 0) fwParticles.splice(i, 1);
        });

        requestAnimationFrame(render);
    }

    setInterval(() => {
        explode(
            Math.random() * fwCanvas.width,
            Math.random() * fwCanvas.height * 0.6
        );
    }, 700);

    render();
}
/* ============================================================
   MUSIC
============================================================ */
function startMusic() {
    const music = document.getElementById("birthday-music");
    music.volume = 0;

    music.play().catch(()=>{});

    let vol = 0;
    const fade = setInterval(() => {
        vol += 0.02;
        music.volume = Math.min(vol, 0.7);
        if (vol >= 0.7) clearInterval(fade);
    }, 200);
}

/* ============================================================
   MUSIC CONTROLS
============================================================ */
const music = document.getElementById("birthday-music");
const toggleBtn = document.getElementById("music-toggle");
const musicControls = document.getElementById("music-controls");

toggleBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        toggleBtn.textContent = "⏸";
    } else {
        music.pause();
        toggleBtn.textContent = "⏵";
    }
});

// Show controls once in gallery
document.getElementById("go-gallery").addEventListener("click", () => {
    musicControls.classList.remove("hidden");
});

/* ============================================================
   GOLD EQUALIZER (audio reactive)
============================================================ */
const eq = document.getElementById("equalizer");
const bars = document.querySelectorAll(".equalizer .bar");

const audioCtx = new AudioContext();
const src = audioCtx.createMediaElementSource(music);
const analyser = audioCtx.createAnalyser();

src.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

let dataArray = new Uint8Array(analyser.frequencyBinCount);

function animateEQ() {
    requestAnimationFrame(animateEQ);
    analyser.getByteFrequencyData(dataArray);

    let bass = dataArray[1] + dataArray[2];

    bars.forEach((bar, i) => {
        const height = Math.max(8, bass/3 - i*3);
        bar.style.height = height + "px";
    });
}

music.addEventListener("play", () => {
    eq.classList.remove("hidden");
    audioCtx.resume();
    animateEQ();
});


/* ============================================================
   KEYBOARD NAVIGATION
============================================================ */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" && currentSection < sections.length - 1)
        showSection(currentSection + 1);

    if (e.key === "ArrowLeft" && currentSection > 0)
        showSection(currentSection - 1);
});

/* ============================================================
   INIT (LOAD EVERYTHING)
============================================================ */
async function init() {
    await loadPersonInfo();
    await loadLetter();
    await loadImages();
}
init();

/* ============================================================
   FLOATING ROSE PETALS
============================================================ */
function spawnPetals() {
    const container = document.getElementById("petals-container");

    setInterval(() => {
        const petal = document.createElement("div");
        petal.classList.add("petal");

        petal.style.left = Math.random() * window.innerWidth + "px";
        petal.style.animationDuration = (6 + Math.random() * 6) + "s";

        container.appendChild(petal);

        setTimeout(() => petal.remove(), 12000);
    }, 500);
}

spawnPetals();

/* ============================================================
   MOUSE HEART TRAIL
============================================================ */
document.addEventListener("mousemove", e => {
    const heart = document.createElement("div");
    heart.textContent = "❤️";
    heart.style.position = "fixed";
    heart.style.left = e.clientX + "px";
    heart.style.top = e.clientY + "px";
    heart.style.fontSize = "18px";
    heart.style.opacity = 1;
    heart.style.transition = "all 0.9s ease-out";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = 9999;

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.style.transform = "translateY(-20px)";
        heart.style.opacity = 0;
    }, 50);

    setTimeout(() => heart.remove(), 900);
});
/* ============================================================
   STAR CONSTELLATION BACKGROUND
============================================================ */
const stars = document.getElementById("stars-bg");
const sctx = stars.getContext("2d");

function resizeStars() {
    stars.width = window.innerWidth;
    stars.height = window.innerHeight;
}
resizeStars();
window.addEventListener("resize", resizeStars);

let starArray = [];
for (let i = 0; i < 140; i++) {
    starArray.push({
        x: Math.random() * stars.width,
        y: Math.random() * stars.height,
        r: Math.random() * 1.8 + 0.5,
        a: Math.random() * 0.5 + 0.3
    });
}

function drawStars() {
    sctx.clearRect(0, 0, stars.width, stars.height);

    starArray.forEach(s => {
        sctx.beginPath();
        sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(255,255,255,${s.a})`;
        sctx.fill();

        s.a += (Math.random() - 0.5) * 0.03;
        if (s.a < 0.2) s.a = 0.2;
        if (s.a > 0.8) s.a = 0.8;
    });

    requestAnimationFrame(drawStars);
}

drawStars();
