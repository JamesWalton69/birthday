/* ============================================================
   GLOBALS
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
   SECTION SWITCHING
============================================================ */
function showSection(num) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sections[num]).classList.add("active");
    currentSection = num;
}

/* ============================================================
   LOAD PERSON INFO
============================================================ */
async function loadPersonInfo() {
    try {
        const res = await fetch("assets/data.txt");
        const text = await res.text();
        let lines = text.split("\n");

        lines.forEach(line => {
            let [key, val] = line.split("=");
            if (key && val)
                personData[key.trim().toLowerCase()] = val.trim();
        });

        document.getElementById("person-name").textContent =
            personData["name"] || "Someone Special";

        document.getElementById("person-relationship").textContent =
            personData["relationship"] || "Loved One";

        if (personData["dob"]) {
            let age = calcAge(personData["dob"]);
            document.getElementById("person-age").textContent = `Age: ${age}`;
        }

    } catch (err) {
        console.log("Error loading data:", err);
    }
}

function calcAge(d) {
    let birth = new Date(d);
    let now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    let m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
}

/* ============================================================
   LOAD LETTER
============================================================ */
async function loadLetter() {
    try {
        const res = await fetch("assets/letter.txt");
        letterText = await res.text();
    } catch {
        letterText = "Happy Birthday! ❤️";
    }
}

/* ============================================================
   LOAD IMAGES (VERTICAL GALLERY)
============================================================ */
async function loadImages() {
    const carousel = document.getElementById("carousel");

    imageList.forEach(imgName => {
        const item = document.createElement("div");
        item.className = "carousel-item small";

        item.innerHTML = `
            <img src="assets/${imgName}" draggable="false">
        `;
        carousel.appendChild(item);
    });

    document.getElementById("main-photo").src = "assets/front.jpg";

    setupVerticalScaling();
    autoCenterOnStop();
}

/* ============================================================
   VERTICAL CAROUSEL SCALING
============================================================ */
function setupVerticalScaling() {
    const container = document.querySelector(".carousel-container");
    const items = document.querySelectorAll(".carousel-item");

    function update() {
        const center = container.scrollTop + container.clientHeight / 2;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const dist = Math.abs(itemCenter - window.innerHeight / 2);

            if (dist < 120) {
                item.classList.add("active");
                item.classList.remove("medium", "small");
            } else if (dist < 250) {
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
   AUTO CENTER ON SCROLL STOP
============================================================ */
function autoCenterOnStop() {
    const container = document.querySelector(".carousel-container");
    let timeout;

    container.addEventListener("scroll", () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const items = [...document.querySelectorAll(".carousel-item")];
            let closest = null;
            let minDist = Infinity;

            const centerY = window.innerHeight / 2;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const dist = Math.abs(itemCenter - centerY);

                if (dist < minDist) {
                    minDist = dist;
                    closest = item;
                }
            });

            if (closest) {
                closest.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        }, 200);
    });
}
/* ============================================================
   AUTO SCROLL GALLERY (Slow, Cinematic)
============================================================ */

let autoScrollEnabled = true;

/* ============================================================
   UNIVERSAL AUTO SCROLL (Laptop + Mobile + Touch)
============================================================ */
function autoScrollGallery() {
    const container = document.querySelector(".carousel-container");
    let autoScroll = true;
    let manualTimeout;

    function step() {
        if (autoScroll) {
            container.scrollTop += 0.6;
        }
        requestAnimationFrame(step);
    }
    step();

    function pause() {
        autoScroll = false;
        clearTimeout(manualTimeout);

        manualTimeout = setTimeout(() => {
            autoScroll = true;
        }, 2000);
    }

    // laptop mouse wheel / touchpad
    container.addEventListener("wheel", pause, { passive: true });

    // laptop mouse drag
    container.addEventListener("mousedown", pause);
    container.addEventListener("mousemove", (e) => {
        if (e.buttons === 1) pause();
    });
    container.addEventListener("mouseup", pause);

    // mobile touch drag
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchmove", pause, { passive: true });
    container.addEventListener("touchend", pause);
}

autoScrollGallery();
/* ============================================================
   PARALLAX TILT BASED ON SCROLL DIRECTION
============================================================ */
function setupParallaxTilt() {
    const container = document.querySelector(".carousel-container");
    let lastY = container.scrollTop;

    container.addEventListener("scroll", () => {
        const items = document.querySelectorAll(".carousel-item");
        const dir = container.scrollTop - lastY > 0 ? "down" : "up";

        items.forEach(item => {
            item.classList.remove("tilt-left", "tilt-right");
            if (dir === "down") item.classList.add("tilt-right");
            else item.classList.add("tilt-left");
        });

        lastY = container.scrollTop;

        // Remove tilt when user stops scrolling
        clearTimeout(window._tiltTimeout);
        window._tiltTimeout = setTimeout(() => {
            items.forEach(item => item.classList.remove("tilt-left", "tilt-right"));
        }, 300);
    });
}

setTimeout(setupParallaxTilt, 1200);


/* ============================================================
   CANDLE
============================================================ */
const flame = document.getElementById("flame");

function blowCandle() {
    if (flame.classList.contains("blown")) return;
    flame.classList.add("blown");

    setTimeout(() => showSection(2), 700);
}

flame.addEventListener("mouseover", blowCandle);
flame.addEventListener("click", blowCandle);

/* ============================================================
   BUTTON NAVIGATION
============================================================ */
document.getElementById("start-btn").addEventListener("click", () => {
    showSection(1);
});

document.getElementById("go-gallery").addEventListener("click", () => {
    showSection(3);
    startMusic();
    musicControls.classList.remove("hidden");
});

/* ============================================================
   ENVELOPE OPEN
============================================================ */
document.getElementById("open-letter").addEventListener("click", () => {
    showSection(4);

    setTimeout(() => {
        document.getElementById("envelope").classList.add("open");

        setTimeout(() => {
            document.getElementById("letter").classList.remove("hidden");
            startTyping();
            launchConfetti();
        }, 900);

    }, 500);
});

/* ============================================================
   TYPING EFFECT
============================================================ */
function startTyping() {
    const output = document.getElementById("typed-letter");
    const cursor = document.getElementById("cursor");

    output.textContent = "";
    index = 0;

    function type() {
        if (index < letterText.length) {
            output.textContent += letterText[index];
            output.scrollTop = output.scrollHeight;  // auto scroll
            index++;

            let delay = typingSpeed;
            if (letterText[index - 1] === ".") delay = 260;
            if (letterText[index - 1] === ",") delay = 140;

            setTimeout(type, delay);
        } else {
            cursor.style.display = "none";
            startFireworks();
        }
    }

    type();
}

/* ============================================================
   ROSE PETALS
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
   MUSIC
============================================================ */
const music = document.getElementById("birthday-music");
const toggleBtn = document.getElementById("music-toggle");
const musicControls = document.getElementById("music-controls");

function startMusic() {
    music.volume = 0;
    music.play().catch(()=>{});

    let vol = 0;
    const fade = setInterval(() => {
        vol += 0.02;
        music.volume = Math.min(vol, 0.7);
        if (vol >= 0.7) clearInterval(fade);
    }, 200);
}

toggleBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        toggleBtn.textContent = "⏸";
    } else {
        music.pause();
        toggleBtn.textContent = "⏵";
    }
});

/* ============================================================
   EQUALIZER (audio analyzer)
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
   CONFETTI
============================================================ */
function launchConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 8,
            startVelocity: 30,
            spread: 360,
            colors: ["#FFD700", "#FFF4B0", "#FDDA77"],
            origin: { x: Math.random(), y: Math.random() * 0.3 }
        });

        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

/* ============================================================
   FIREWORKS
============================================================ */
function startFireworks() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 999999;

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    function explode(x, y) {
        for (let i = 0; i < 55; i++) {
            particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                r: Math.random() * 3 + 1,
                life: 60
            });
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,215,0,${p.life/60})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;
            p.life--;

            if (p.life <= 0) particles.splice(i, 1);
        });

        requestAnimationFrame(render);
    }

    setInterval(() => {
        explode(
            Math.random() * canvas.width,
            Math.random() * canvas.height * 0.6
        );
    }, 700);

    render();
}

/* ============================================================
   STAR CONSTELLATIONS
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

/* ============================================================
   MOONLIGHT BACKGROUND - STATIC
============================================================ */




/* ============================================================
   GOLD PARTICLES
============================================================ */
const goldCanvas = document.getElementById("gold-particles");
const gctx = goldCanvas.getContext("2d");
let gw, gh;
let gParticles = [];

function resizeGold() {
    gw = goldCanvas.width = window.innerWidth;
    gh = goldCanvas.height = window.innerHeight;
}
resizeGold();
window.addEventListener("resize", resizeGold);

function createGoldParticles() {
    const count = 60;
    gParticles = [];

    for (let i = 0; i < count; i++) {
        gParticles.push({
            x: Math.random() * gw,
            y: Math.random() * gh,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            a: Math.random() * 0.5 + 0.3
        });
    }
}

function drawGold() {
    gctx.clearRect(0, 0, gw, gh);

    gParticles.forEach(p => {
        gctx.beginPath();
        gctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        gctx.fillStyle = `rgba(255,215,0,${p.a})`;
        gctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = gw;
        if (p.x > gw) p.x = 0;
        if (p.y < 0) p.y = gh;
        if (p.y > gh) p.y = 0;
    });

    requestAnimationFrame(drawGold);
}

createGoldParticles();
drawGold();

/* ============================================================
   INIT
============================================================ */
async function init() {
    await loadPersonInfo();
    await loadLetter();
    await loadImages();
}
init();
/* ============================================================
   HEART MOUSE TRAIL
============================================================ */
document.addEventListener("mousemove", (e) => {
    const h = document.createElement("div");
    h.className = "heart";
    h.style.left = e.clientX + "px";
    h.style.top = e.clientY + "px";

    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1300);
});
/* ============================================================
   SCROLL FADE (CINEMATIC)
============================================================ */
function setupScrollFade() {
    const items = document.querySelectorAll(".carousel-item");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
                entry.target.classList.add("visible");
                entry.target.classList.remove("fading");
            } else if (entry.isIntersecting) {
                entry.target.classList.add("fading");
                entry.target.classList.remove("visible");
            } else {
                entry.target.classList.remove("visible", "fading");
            }
        });
    }, {
        root: document.querySelector(".carousel-container"),
        threshold: [0, 0.55, 1]
    });

    items.forEach(item => observer.observe(item));
}

setTimeout(setupScrollFade, 800); // run after images load
/* ============================================================
   BOKEH PARTICLES (Dreamy Background)
============================================================ */
const bokeh = document.getElementById("bokeh-bg");
if (bokeh) {
    const bctx = bokeh.getContext("2d");
    bokeh.width = window.innerWidth;
    bokeh.height = window.innerHeight;

    let bParticles = [];
    for (let i = 0; i < 35; i++) {
        bParticles.push({
            x: Math.random() * bokeh.width,
            y: Math.random() * bokeh.height,
            r: Math.random() * 8 + 4,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.35 + 0.15
        });
    }

    function drawBokeh() {
        bctx.clearRect(0, 0, bokeh.width, bokeh.height);
        bParticles.forEach(p => {
            bctx.beginPath();
            bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            bctx.fillStyle = `rgba(255, 230, 180, ${p.a})`;
            bctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < -20) p.x = bokeh.width + 20;
            if (p.x > bokeh.width + 20) p.x = -20;
            if (p.y < -20) p.y = bokeh.height + 20;
            if (p.y > bokeh.height + 20) p.y = -20;
        });
        requestAnimationFrame(drawBokeh);
    }

    drawBokeh();
}
/* ============================================================
   HOLD TO SCROLL THE GALLERY
============================================================ */

/* ============================================================
   GALLERY SCROLL BUTTON (WORKING VERSION)
============================================================ */

(function () {
    const btn = document.getElementById("scroll-gallery");
    const container = document.querySelector("#gallery-section .carousel-container");

    let scrollInterval = null;

    function startScrolling() {
        stopScrolling();
        scrollInterval = setInterval(() => {
            container.scrollTop += 3; // speed
        }, 10);
    }

    function stopScrolling() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }

    btn.addEventListener("mousedown", startScrolling);
    btn.addEventListener("mouseup", stopScrolling);
    btn.addEventListener("mouseleave", stopScrolling);

    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startScrolling();
    });

    btn.addEventListener("touchend", stopScrolling);
})();


