/* ==========================================================
   ROMANTIC WEBPAGE — script.js
   Flow:
   Main Q → (Yes) → Success → Surprise Q → (Yes) → Password
                                          → (No → No) → Password
   Password correct → Love Letter
========================================================== */


/* ----------------------------------------------------------
   DOM REFERENCES
---------------------------------------------------------- */

const bear         = document.getElementById("bear");
const question     = document.getElementById("question");
const yesBtn       = document.getElementById("yesBtn");
const noBtn        = document.getElementById("noBtn");
const mainButtons  = document.getElementById("mainButtons");

const screenMain      = document.getElementById("screen-main");
const screenSuccess   = document.getElementById("screen-success");
const screenSurpriseQ = document.getElementById("screen-surprise-q");
const screenPassword  = document.getElementById("screen-password");
const screenLetter    = document.getElementById("screen-letter");

const surpriseYesBtn  = document.getElementById("surpriseYesBtn");
const surpriseNoBtn   = document.getElementById("surpriseNoBtn");
const surpriseQ       = document.getElementById("surpriseQuestion");

const passwordInput   = document.getElementById("passwordInput");
const unlockBtn       = document.getElementById("unlockBtn");
const clueBubble      = document.getElementById("clueBubble");
const clueText        = document.getElementById("clueText");
const attemptsMsg     = document.getElementById("attemptsMsg");

const loveMsg         = document.getElementById("loveMsg");
const heartsContainer = document.getElementById("hearts-container");


/* ----------------------------------------------------------
   ASSETS
---------------------------------------------------------- */

const stickers = [
    "cathug.webp","cathug.webp","cathug.webp","cathug.webp",
    "cathug.webp","cathug.webp","cathug.webp"
];

const tiredSticker = "catsad.gif";

const messages = [
    "Really...? 😢",
    "Please...? 🥹",
    "I'll be really sad... 😭",
    "Think again? 🥺",
    "Pretty please? ❤️",
    "Okay then... Catch me first! 🤭"
];

const yesTexts = [
    "Yes ❤️","YES ❤️","YES PLEASE ❤️",
    "PLEASE SAY YES ❤️","JUST SAY YES ❤️",
    "I'M BEGGING 🥺❤️","YESSS ❤️"
];

const hearts = ["❤️","💖","💕","💗","💞","💘"];

const passwordClues = [
    "Hint: it's a term of endearment 💕",
    "Hint: think of what you call someone you love... 🥺",
    "Hint: starts with 'm' and ends with 'a' 🤫",
    "Last try! Hint: m _ v _ _ a 💌"
];

const CORRECT_PASSWORD = "my vava";


/* ----------------------------------------------------------
   STATE
---------------------------------------------------------- */

let clickCount   = 0;
let yesScale     = 1;
let escaping     = false;
let tired        = false;
let surrendered  = false;
let heartInterval = null;
let escapeTimer   = null;
let passwordAttempts = 0;
const MAX_ATTEMPTS   = 4;
let surpriseNoPressCount = 0;


/* ==========================================================
   SCREEN TRANSITIONS
========================================================== */

/**
 * Transition from one screen to another with a smooth
 * opacity + scale crossfade.
 * @param {HTMLElement} fromScreen
 * @param {HTMLElement} toScreen
 * @param {number} [delay=0] — extra ms before showing toScreen
 */
function transitionTo(fromScreen, toScreen, delay = 0) {
    fromScreen.classList.remove("active");
    fromScreen.classList.add("exit");

    setTimeout(() => {
        fromScreen.classList.remove("exit");
        toScreen.classList.add("active");
    }, 700 + delay);
}

/** Quick helper: fade out a screen, then run callback. */
function fadeOutScreen(screen, cb, duration = 700) {
    screen.style.transition = `opacity ${duration}ms ease`;
    screen.style.opacity = "0";
    setTimeout(() => {
        screen.style.opacity = "";
        screen.style.transition = "";
        cb();
    }, duration);
}


/* ==========================================================
   MAIN QUESTION — NO BUTTON LOGIC
========================================================== */

noBtn.addEventListener("click", () => {

    /* After surrender, both buttons lead to success */
    if (surrendered) {
        showSuccess();
        return;
    }

    if (tired || clickCount >= messages.length) return;

    /* Fade message & update */
    question.classList.add("fade-out");

    setTimeout(() => {
        question.textContent = messages[clickCount];
        question.classList.remove("fade-out");
    }, 300);

    bear.src = stickers[Math.min(clickCount + 1, stickers.length - 1)];

    /* Grow Yes button */
    yesScale += 0.15;
    yesBtn.style.cssText += `--btn-scale:${yesScale};transform:scale(${yesScale});`;

    yesBtn.classList.add("pop");
    setTimeout(() => yesBtn.classList.remove("pop"), 300);

    yesBtn.textContent = yesTexts[Math.min(clickCount + 1, yesTexts.length - 1)];

    clickCount++;

    /* On the LAST no-message, start escaping after a short dramatic pause */
    if (clickCount === messages.length) {
        setTimeout(startEscaping, 50);
    }
});


/* ==========================================================
   ESCAPING PHASE
========================================================== */

function startEscaping() {
    escaping = true;

    /* Detach the No button from the flow so Yes button
       can expand freely without overlap */
    const rect = noBtn.getBoundingClientRect();
    noBtn.style.position   = "fixed";
    noBtn.style.left       = rect.left + "px";
    noBtn.style.top        = rect.top  + "px";

    /* Apply glide transition BEFORE the first move so every jump
       (including the immediate one below) animates smoothly instead
       of teleporting. 200ms is quick enough to feel playful and hard
       to catch, but visible enough to read as movement. */
    noBtn.style.transition = "left 200ms cubic-bezier(0.25,0.46,0.45,0.94),"
                           + "top  200ms cubic-bezier(0.25,0.46,0.45,0.94)";

    /* Immediately escape — the cursor is almost certainly still over
       the button after the last click, so we cannot rely on mouseover
       to trigger the first move. A short delay lets the browser paint
       the fixed position before we change it so the transition plays. */
    setTimeout(teleportButton, 80);

    /* Stop escaping after 10 seconds then begin surrender sequence */
    escapeTimer = setTimeout(startSurrender, 10000);
}

/* Glide to a new random position whenever the cursor enters the button */
noBtn.addEventListener("mouseover", teleportButton);

/* Touch support */
noBtn.addEventListener("touchstart", teleportButton, { passive: true });

/* Move the No button to a completely random spot inside the viewport.
   Uses offsetWidth/Height (more reliable than getBoundingClientRect
   when the button has not moved yet) so it always stays fully on screen. */
function teleportButton() {
    if (!escaping) return;

    const w = noBtn.offsetWidth  || 120;
    const h = noBtn.offsetHeight || 52;
    const x = Math.random() * (window.innerWidth  - w - 20) + 10;
    const y = Math.random() * (window.innerHeight - h - 20) + 10;

    noBtn.style.left = x + "px";
    noBtn.style.top  = y + "px";
}


/* ==========================================================
   SURRENDER SEQUENCE
========================================================== */

const surrenderMessages = [
    "Okay okay... 😮‍💨",
    "You got me ❤️",
    "You win ❤️😊..HEHHEHEHE 😙"
];

function startSurrender() {
    escaping = false;
    clearTimeout(escapeTimer);
    tired = true;

    bear.src = tiredSticker;

    /* Hide both buttons smoothly.
       Override the glide transition on noBtn so that only opacity
       animates here — not any in-flight left/top movement. */
    yesBtn.style.transition = "opacity 0.4s ease";
    noBtn.style.transition  = "opacity 0.4s ease, left 0ms, top 0ms";
    yesBtn.style.opacity    = "0";
    noBtn.style.opacity     = "0";

    /* Return No button to normal flow so it can be hidden cleanly */
    setTimeout(() => {
        noBtn.style.position   = "relative";
        noBtn.style.left       = "";
        noBtn.style.top        = "";
        noBtn.style.transition = "";
        noBtn.style.opacity    = "";
        yesBtn.style.opacity   = "";

        /* Hide button row entirely */
        mainButtons.style.visibility = "hidden";
        mainButtons.style.opacity    = "0";

        /* Show surrender messages one by one */
        showSurrenderMessage(0);

    }, 450);
}

function showSurrenderMessage(index) {
    if (index >= surrenderMessages.length) {
        /* All messages shown → reveal surrender buttons */
        setTimeout(showSurrenderButtons, 800);
        return;
    }

    question.classList.add("fade-out");

    setTimeout(() => {
        question.textContent = surrenderMessages[index];
        question.classList.remove("fade-out");

        setTimeout(() => {
            showSurrenderMessage(index + 1);
        }, 1100);

    }, 350);
}

function showSurrenderButtons() {
    surrendered = true;

    /* Reset Yes button size and make both buttons look the same */
    yesBtn.style.transform  = "";
    yesBtn.style.cssText    = "";
    yesBtn.textContent      = "Yes ❤️";
    noBtn.textContent       = "Yes ❤️🤭";

    /* Apply surrender styling (both pink, same size) */
    yesBtn.classList.add("surrender-btn");
    noBtn.classList.add("surrender-btn");

    /* Reset No button position completely */
    noBtn.style.position = "relative";
    noBtn.style.left     = "";
    noBtn.style.top      = "";

    /* Fade the button row back in */
    mainButtons.style.visibility = "visible";
    mainButtons.style.opacity    = "0";
    mainButtons.style.transition = "opacity 0.6s ease";

    /* Remove any inline scale from Yes, then re-show */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            mainButtons.style.opacity = "1";
        });
    });

    /* Both buttons now go to success */
    noBtn.onclick = showSuccess;
}


/* ==========================================================
   YES BUTTON — main question
========================================================== */

yesBtn.addEventListener("click", () => {
    if (!tired && !surrendered) showSuccess();
    else if (surrendered) showSuccess();
});


/* ==========================================================
   SUCCESS SCREEN
========================================================== */

const loveMessage = "I Love You So Much ❤️, My Nikhita";

function showSuccess() {
    if (heartInterval) return; /* Prevent double-fire */

    transitionTo(screenMain, screenSuccess);

    setTimeout(() => {
        typeLoveMessage();
        heartInterval = setInterval(createHeart, 250);

        /* After 15–20 s, move to Surprise question */
        setTimeout(showSurpriseQuestion, 10000);

    }, 800);
}


/* ---------- typewriter ---------- */

function typeLoveMessage() {
    loveMsg.textContent = "";
    let i = 0;
    const t = setInterval(() => {
        loveMsg.textContent += loveMessage.charAt(i++);
        if (i >= loveMessage.length) clearInterval(t);
    }, 90);
}


/* ==========================================================
   SURPRISE QUESTION SCREEN
========================================================== */

function showSurpriseQuestion() {
    clearInterval(heartInterval);
    heartInterval = null;
    transitionTo(screenSuccess, screenSurpriseQ);
}

surpriseYesBtn.addEventListener("click", () => {
    transitionTo(screenSurpriseQ, screenPassword);
    setTimeout(resetPasswordScreen, 800);
});

surpriseNoBtn.addEventListener("click", () => {
    surpriseNoPressCount++;

    if (surpriseNoPressCount === 1) {
        /* First No → ask again */
        surpriseQ.classList.add("fade-out");
        setTimeout(() => {
            surpriseQ.textContent = "Are you sure? 🥺";
            surpriseQ.classList.remove("fade-out");
        }, 350);

    } else {
        /* Second No → tease and go to password anyway */
        surpriseQ.classList.add("fade-out");
        setTimeout(() => {
            surpriseQ.textContent = "I'll give you the surprise challenge anyway 🤭❤️";
            surpriseQ.classList.remove("fade-out");

            /* Hide buttons while the message shows */
            surpriseYesBtn.style.opacity = "0";
            surpriseNoBtn.style.opacity  = "0";

            setTimeout(() => {
                transitionTo(screenSurpriseQ, screenPassword);
                setTimeout(resetPasswordScreen, 800);
            }, 1800);

        }, 350);
    }
});


/* ==========================================================
   PASSWORD SCREEN
========================================================== */

function resetPasswordScreen() {
    passwordInput.value  = "";
    passwordInput.className = "";
    clueBubble.classList.add("hidden");
    attemptsMsg.textContent = "";
    passwordAttempts = 0;
}

unlockBtn.addEventListener("click", checkPassword);
passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
});

function checkPassword() {
    const guess = passwordInput.value.trim().toLowerCase();

    if (guess === CORRECT_PASSWORD) {
        /* ✅ Correct */
        passwordInput.classList.add("correct");
        clueBubble.classList.add("hidden");
        attemptsMsg.textContent = "✨ Correct! Opening your surprise...";

        setTimeout(() => {
            transitionTo(screenPassword, screenLetter);
        }, 1200);

    } else {
        /* ❌ Wrong */
        passwordAttempts++;
        passwordInput.value = "";

        /* Shake animation */
        passwordInput.classList.remove("shake");
        void passwordInput.offsetWidth; /* reflow to restart */
        passwordInput.classList.add("shake");

        if (passwordAttempts < MAX_ATTEMPTS) {
            /* Show clue */
            clueText.textContent = passwordClues[passwordAttempts - 1];
            clueBubble.classList.remove("hidden");

            const remaining = MAX_ATTEMPTS - passwordAttempts;
            attemptsMsg.textContent =
                `${remaining} attempt${remaining !== 1 ? "s" : ""} left 🥺`;

        } else {
            /* Last attempt — show final clue & lock */
            clueText.textContent = passwordClues[passwordAttempts - 1] || "Hint: m-o-m-m-y 💌";
            clueBubble.classList.remove("hidden");
            attemptsMsg.textContent = "One more try... you've got this! 💕";

            /* Re-enable after showing the final clue */
            unlockBtn.disabled = true;
            setTimeout(() => {
                unlockBtn.disabled      = false;
                passwordAttempts        = MAX_ATTEMPTS - 1; /* Allow one more */
                attemptsMsg.textContent = "Last chance! 🌸";
            }, 1500);
        }
    }
}


/* ==========================================================
   FLOATING HEARTS
========================================================== */

function createHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left     = Math.random() * window.innerWidth + "px";
    heart.style.top      = window.innerHeight + "px";
    heart.style.fontSize = (20 + Math.random() * 28) + "px";
    heart.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 5200);
}
