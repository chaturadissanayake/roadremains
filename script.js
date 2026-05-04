// --- GLOBAL STATE ---
window.gameState = {
    lang: 'en',
    screen: 'screen-loading',
    character: null,
    week: 6,
    gauges: { ct: 50, ih: 50, vp: 50 },
    flags: {
        sharedFakeMessage: false,
        registrationStarted: false,
        cameFromUncle: false,
        ignored: false,
        skepticsCafeUnlocked: false,
        uncleVisited: false,
        verifiedCount: 0,
        attendedHall: false,
        joinedCafe: false,
        dismissedMessages: 0,
        visitedLocs: [],
        achievements: [],
        registrationComplete: false,
        registrationDeadlineMissed: false,
        readCurrentManifesto: false,
        foundOldManifesto: false,
        sharedFake4amMessage: false,
        sharedFakeCandidateList: false,
        reportedIllegalPosters: false,
        verifiedBallotFold: false,
        ballotWillBeSpoiled: false,
        ballotSpoiled: false,
        votedSuccessfully: false,
        kumaran_transferStepsComplete: 0,
        foundSandyaNote: false
    },
    dialogue: { active: false, currentLine: 0, lines: [], choices: null },
    history: [],
    currentLoc: null
};

const CHAR_KEY = { Atakatus: 'k', Imali: 'ka', kumaran: 'ku' };

const CHAR_GAUGES = {
    Atakatus: { ct: 60, ih: 70, vp: 50 },
    Imali:     { ct: 75, ih: 65, vp: 65 },
    kumaran:    { ct: 50, ih: 75, vp: 40 }
};

const ACHIEVEMENTS = {
    // Core discoveries
    'first_verify':         { title: 'Source Checked',           desc: 'Checked the Elections Commission Notice Board for the first time.' },
    'curiosity_perk':       { title: 'Why Does It Work?',        desc: 'Used Atakatus\'s Curiosity perk.' },
    'skeptics_found':       { title: 'You Found Us',             desc: 'Discovered the Skeptics Cafe.' },
    'manifesto_read':       { title: 'Actually Read It',         desc: 'Read Mahinda Bandara\'s current manifesto in full.' },
    'pol_roti':             { title: 'Pol Roti Accepted',        desc: 'Accepted Uncle Sirisena\'s pol roti.' },
    'road_file':            { title: 'The File Exists',          desc: 'Found the Road Repair Request in the Grama Sevaka Office.' },
    // Secrets — per GDD Section on secret content
    'manifesto_compare':    { title: 'Actually Read the Fine Print', desc: 'Found the 2010 manifesto box and compared it to the current one. The road section was 94% identical.' },
    'receipt_1977':         { title: 'Pol Roti and Politics',    desc: 'Clicked the wall behind Mudalali\'s counter and found the 1977 receipt.' },
    'sandya_found':         { title: 'Sandya Made It',           desc: 'Followed Sandya\'s handwritten note from Week 3 all the way to the voter register on Election Day.' },
    'not_your_job':         { title: 'Not Your Job',             desc: 'Helped the elderly woman find her name on the voter register at the polling station.' },
    'had_to_ask':           { title: 'Somebody Had to Ask',      desc: 'Asked Sergeant Wickramasinghe about 2016 — after hearing about it from Mudalali Perera first.' },
    // Misinformation flags (these unlock silently, used for endings)
    'never_shared':         { title: 'Clean Hands',              desc: 'Completed the game without sharing a single piece of unverified information.' },
    'verified_all':         { title: 'The Board Never Lied',     desc: 'Verified every message at the Elections Commission board before taking action.' }
};

// --- UTILITIES ---
function imgFallback(img) {
    img.onerror = null;
    const initials = img.getAttribute('data-initials') || '?';
    const div = document.createElement('div');
    div.className = 'fallback-circle';
    div.textContent = initials;
    img.parentNode.replaceChild(div, img);
}

// --- SCREEN SYSTEM ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
    });
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');
    target.removeAttribute('aria-hidden'); // Fixed invalid ARIA value
    window.gameState.screen = id;
    
    if (id === 'screen-mainmenu') checkContinueBtn();
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen('screen-loading');
    
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isLoadingReady = false;

    if (!reduceMotion) {
        setTimeout(() => {
            document.getElementById('loading-logo').classList.add('animate-fadeUp');
        }, 100);
        setTimeout(() => {
            document.getElementById('loading-tagline').classList.add('animate-fadeUp');
        }, 1500);
        setTimeout(() => {
            document.getElementById('loading-prompt').classList.add('animate-breathe');
            isLoadingReady = true;
        }, 3000);
    } else {
        document.getElementById('loading-logo').style.opacity = 1;
        document.getElementById('loading-tagline').style.opacity = 1;
        document.getElementById('loading-prompt').style.opacity = 1;
        isLoadingReady = true;
    }

    document.getElementById('screen-loading').addEventListener('click', () => {
        if (isLoadingReady) showScreen('screen-language');
    });

    // Map Interactivity
    document.querySelectorAll('.map-location').forEach(g => {
        g.addEventListener('click', () => openLocation(g.dataset.loc));
    });

    // Modal Overlays
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', (e) => {
            if(e.target === m) m.classList.remove('active');
        });
    });

    renderStaticText();
    checkContinueBtn();
});

// --- I18N & CONTENT ---
const CONTENT = {
    en: {
        'title': 'Tale of Alupota.',
        'loading.tagline': 'An election is coming. Alupotha is not ready. Neither are you.',
        'loading.begin': 'Press anywhere to begin',
        'menu.subtitle': 'Alupotha is waiting.',
        'menu.newgame': 'New Game',
        'menu.continue': 'Continue',
        'menu.settings': 'Settings',
        'menu.about': 'About',
        'ui.close': 'Close',
        'ui.back': 'Back to Menu',
        'char.header': 'Who are you?',
        'char.subheader': 'Choose carefully. You will carry their story.',
        'char.k.name': 'Atakatus', 'char.k.role': '19 years old · First-time voter · Arrived in Alupotha from Kurunegala last week', 'char.k.desc': "He is living with his uncle while attending a vocational training programme. He is not particularly political. He has opinions, but he is not sure yet where they come from. The WhatsApp group is not optional — Uncle Sirisena is family.", 'char.k.btn': 'Play as Atakatus',
        'char.ka.name': 'Imali', 'char.ka.role': '34 years old · School teacher · Has lived in Alupotha for eight years', 'char.ka.desc': 'She has voted in the last two elections and filled in her ballot the way she always had — assuming she was doing it correctly. She was mostly right. Mostly. She knows almost everyone in Alupotha and most of them know her, which makes things easier. And occasionally more complicated.', 'char.ka.btn': 'Play as Imali',
        'char.ku.name': 'Kumaran', 'char.ku.role': '28 years old · Migrant worker · Moved to Alupotha from the Northern Province two years ago', 'char.ku.desc': 'He came for work. He stayed for reasons that accumulated over two years and are now harder to name. His voter registration is in his home district. It needs to be transferred. The process involves more steps than it should, and some of those steps are in a language that is not his first. His story is harder. It is also more complete.', 'char.ku.btn': 'Play as Kumaran',
        'opening.btn': 'Enter Alupotha', 'opening.skip': 'Click anywhere to skip',
        'gauge.ct': 'Civic Trust', 'gauge.ih': 'Info Health', 'gauge.vp': 'Voter Part.', 'game.week': 'WEEK',
        'loc1.name': 'Grama Sevaka Office', 'loc2.name': "Uncle Sirisena's House", 'loc3.name': 'Elections Commission Notice Board', 'loc4.name': "Mudalali Perera's Boutique", 'loc5.name': 'Community Hall', 'loc6.name': 'Police Station', 'loc7.name': 'Skeptics Cafe', 'loc8.name': "Mahinda Bandara's Campaign Tent",
        'cons.heading': 'What happened.', 'cons.btn': 'Return to Alupotha',
        'settings.textsize': 'Text Size', 'settings.standard': 'Standard', 'settings.large': 'Large', 'settings.xlarge': 'Extra Large', 'settings.motion': 'Reduce Motion', 'settings.changelang': 'Change Language',
        'about.text': 'Tale of Alupota is a civic education project developed to improve voter education and counter election-related misinformation in Sri Lanka. It was developed with support from LIRNEasia and is available free of charge in English, Sinhala, and Tamil. The game does not tell you who to vote for. That part is entirely yours. All characters, candidates, and political parties depicted are fictional. The Elections Commission of Sri Lanka is referenced as a public institution, but no real officials are depicted. Electoral law accuracy: All voter registration procedures, electoral rules, and ballot instructions depicted reflect Sri Lankan law and Elections Commission guidelines as of 2024. If procedures have changed, please verify at the Elections Commission of Sri Lanka official website.',
        'npc.nandadasa': 'Nandadasa Mahaththaya', 'npc.uncle': 'Uncle Sirisena', 'npc.board': 'Notice Board', 'npc.mudalali': 'Mudalali Perera', 'npc.hall': 'Announcer', 'npc.police': 'Sgt. Wickramasinghe', 'npc.cafe': 'Cafe Owner', 'npc.mahinda': 'Mahinda Bandara'
    },
    si: {
        'loading.tagline': 'මැතිවරණයක් පැමිණෙමින් පවතී. අළුපොත සූදානම් නොවේ. ඔබද සූදානම් නොවේ.',
        'menu.subtitle': 'අළුපොත බලා සිටී.', 'menu.newgame': 'නව ක්‍රීඩාව', 'menu.continue': 'ඉදිරියට යන්න',
        'char.k.name': 'කරුණාසේන', 'char.ka.name': 'කමලා', 'char.ku.name': 'කුමරන්'
    },
    ta: {
        'loading.tagline': 'தேர்தல் வருகிறது. அலுபோத்த தயாராக இல்லை. நீங்களும் இல்லை.',
        'menu.subtitle': 'அலுபோத்த காத்திருக்கிறது.', 'menu.newgame': 'புதிய விளையாட்டு', 'menu.continue': 'தொடர்க',
        'char.k.name': 'கருணசேன', 'char.ka.name': 'கமலா', 'char.ku.name': 'குமரன்'
    }
};

function t(key) {
    return (CONTENT[window.gameState.lang] && CONTENT[window.gameState.lang][key]) ?? CONTENT['en'][key] ?? key;
}

function renderStaticText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

function selectLanguage(lang) {
    window.gameState.lang = lang;
    applyLanguage();
    showScreen('screen-mainmenu');
}

function applyLanguage(reRender = true) {
    document.documentElement.lang = window.gameState.lang;
    document.body.className = document.body.className.replace(/lang-\w+/, '').trim();
    document.body.classList.add(`lang-${window.gameState.lang}`);
    if(reRender) renderStaticText();
}

function updateSettings() {
    const size = document.getElementById('setting-textsize').value;
    document.body.classList.remove('text-large', 'text-xlarge');
    if(size === 'large') document.body.classList.add('text-large');
    if(size === 'xlarge') document.body.classList.add('text-xlarge');

    const motion = document.getElementById('setting-motion').checked;
    if(motion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function toggleGaugeInfo(key) {
    ['ct','ih','vp'].forEach(k => {
        const tip = document.getElementById(`tooltip-${k}`);
        if (!tip) return;
        if (k === key) {
            const willShow = !tip.classList.contains('visible');
            if (willShow) {
                // Position tooltip directly below its info button
                const btn = document.querySelector(`button[onclick="toggleGaugeInfo('${k}')"]`);
                if (btn) {
                    const r = btn.getBoundingClientRect();
                    // Clamp so it never runs off the right edge
                    tip.style.left = Math.min(r.left, window.innerWidth - 258) + 'px';
                }
            }
            tip.classList.toggle('visible');
        } else {
            tip.classList.remove('visible');
        }
    });
}

// Close tooltips when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('gauge-info-btn')) {
        document.querySelectorAll('.gauge-tooltip-panel').forEach(t => t.classList.remove('visible'));
    }
});

function togglePause() {
    const pauseMenu = document.getElementById('overlay-pause');
    if (pauseMenu.classList.contains('active')) {
        pauseMenu.classList.remove('active');
    } else {
        pauseMenu.classList.add('active');
        _renderPauseAchievements();
    }
}

function _renderPauseAchievements() {
    const list = document.getElementById('pause-ach-list');
    if (!list) return;
    const earned = window.gameState.flags.achievements || [];
    const allIds = Object.keys(ACHIEVEMENTS);

    if (earned.length === 0) {
        list.innerHTML = '<div class="pause-ach-empty">No achievements yet. Keep exploring.</div>';
        return;
    }

    list.innerHTML = allIds.map(id => {
        const ach = ACHIEVEMENTS[id];
        const isEarned = earned.includes(id);
        return `
            <div class="pause-ach-item ${isEarned ? 'earned' : ''}">
                <div class="pause-ach-dot ${isEarned ? '' : 'locked'}"></div>
                <div>
                    <div class="pause-ach-name">${isEarned ? ach.title : '???'}</div>
                    ${isEarned ? `<div class="pause-ach-desc">${ach.desc}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function exitToMainMenu() {
    document.getElementById('overlay-pause').classList.remove('active');
    closeDialoguePanel(); // Ensure dialogue is closed if leaving mid-conversation
    saveGame(); // Save progress before leaving
    showScreen('screen-mainmenu');
}

// --- GAME FLOW ---
function selectCharacter(charId) {
    window.gameState.character = charId;
    window.gameState.gauges = { ...CHAR_GAUGES[charId] };
    saveGame();
    showScreen('screen-opening');
    startOpeningSequence();
}

const OPENING_LINES = {
    'Atakatus': [
        "Six weeks until election day.",
        "Alupotha is not a city. It is not a village. It is the kind of place most Sri Lankans either come from or pass through.",
        "There is a kovil on one side of the main road and a temple on the other. One traffic light. A bus that comes when it comes. Coconut trees everywhere, including in places where coconut trees probably should not be.",
        "An election is coming.",
        "You are Atakatus. You arrived last week. You do not know where anything is yet. Uncle Sirisena has already texted you three times.",
        "Welcome to Alupotha."
    ],
    'Imali': [
        "Six weeks until election day.",
        "Alupotha is not a city. It is not a village. It is the kind of place most Sri Lankans either come from or pass through.",
        "There is a kovil on one side of the main road and a temple on the other. One traffic light. A bus that comes when it comes. Coconut trees everywhere, including in places where coconut trees probably should not be.",
        "An election is coming.",
        "You are Imali. You have lived here for eight years. You know this town and it knows you. The last two elections, you voted. You think you did it correctly.",
        "Welcome to Alupotha."
    ],
    'kumaran': [
        "Six weeks until election day.",
        "Alupotha is not a city. It is not a village. It is the kind of place most Sri Lankans either come from or pass through.",
        "There is a kovil on one side of the main road and a temple on the other. One traffic light. A bus that comes when it comes. Coconut trees everywhere, including in places where coconut trees probably should not be.",
        "An election is coming.",
        "You are Kumaran. You came for work, two years ago. Your voter registration is in Jaffna. The elections office here has a form for this. The form is only in Sinhala.",
        "Welcome to Alupotha."
    ]
};

let openingInterval;
let fadeOutTimeout;
let linesData = [];
let currentLineIdx = 0;

function startOpeningSequence() {
    const container = document.getElementById('opening-lines');
    const btn = document.getElementById('opening-next');
    
    container.innerHTML = '';
    btn.style.display = 'none';

    // Build lines: first line is the character name in a special style
    const charName = t(`char.${CHAR_KEY[window.gameState.character]}.name`);
    const subtitles = {
        Atakatus: 'First time. Get it right.',
        Imali: 'She thought she already knew.',
        kumaran: 'Every form is a small obstacle.'
    };
    const introLine = charName + '. ' + (subtitles[window.gameState.character] || '');
    
    // Prepend the intro as the first narrative line
    const rawLines = OPENING_LINES[window.gameState.character];
    linesData = [{ text: introLine, isIntro: true }, ...rawLines.map(l => ({ text: l, isIntro: false }))];
    currentLineIdx = 0;
    
    // Setup hold-to-skip
    setupHoldToSkip();
    
    if (document.body.classList.contains('reduce-motion')) {
        skipOpening();
        return;
    }
    showNextLine();
}

function setupHoldToSkip() {
    const screen = document.getElementById('screen-opening');
    const fill = document.getElementById('skip-hold-fill');
    const prompt = document.getElementById('skip-prompt-el');
    let holdTimer = null;
    let holding = false;
    let startTime = null;
    const HOLD_DURATION = 1500;

    function startHold(e) {
        if (document.getElementById('opening-next').style.display === 'inline-block') return;
        holding = true;
        startTime = Date.now();
        fill.style.transition = `width ${HOLD_DURATION}ms linear`;
        fill.style.width = '100%';
        if (prompt) prompt.style.color = 'rgba(255,255,255,0.6)';
        holdTimer = setTimeout(() => {
            if (holding) skipOpening();
        }, HOLD_DURATION);
    }

    function endHold(e) {
        holding = false;
        clearTimeout(holdTimer);
        fill.style.transition = 'width 300ms ease';
        fill.style.width = '0%';
        if (prompt) prompt.style.color = 'rgba(255,255,255,0.25)';
    }

    screen.addEventListener('mousedown', startHold);
    screen.addEventListener('mouseup', endHold);
    screen.addEventListener('mouseleave', endHold);
    screen.addEventListener('touchstart', startHold, { passive: true });
    screen.addEventListener('touchend', endHold);
}

function showNextLine() {
    const container = document.getElementById('opening-lines');
    container.innerHTML = '';
    
    if (currentLineIdx >= linesData.length) {
        const btn = document.getElementById('opening-next');
        btn.style.display = 'block';
        const skipPrompt = document.getElementById('skip-prompt-el');
        if (skipPrompt) skipPrompt.style.display = 'none';
        return;
    }

    const lineData = linesData[currentLineIdx];
    const lineText = typeof lineData === 'string' ? lineData : lineData.text;
    const isIntro = typeof lineData === 'object' && lineData.isIntro;

    const div = document.createElement('div');
    div.className = isIntro ? 'opening-line character-intro' : 'opening-line';
    div.innerHTML = lineText;
    container.appendChild(div);
    
    setTimeout(() => div.classList.add('visible'), 80);
    
    const displayTime = isIntro
        ? 4000
        : Math.max(3500, lineText.length * 65);
    
    openingInterval = setTimeout(() => {
        div.classList.remove('visible');
        fadeOutTimeout = setTimeout(() => {
            currentLineIdx++;
            showNextLine();
        }, 1000);
    }, displayTime);
}

function skipOpening() {
    clearTimeout(openingInterval);
    clearTimeout(fadeOutTimeout);
    const container = document.getElementById('opening-lines');
    container.innerHTML = '';
    const btn = document.getElementById('opening-next');
    btn.style.display = 'block';
    const skipPrompt = document.getElementById('skip-prompt-el');
    if (skipPrompt) skipPrompt.style.display = 'none';
    const fill = document.getElementById('skip-hold-fill');
    if (fill) { fill.style.transition = 'none'; fill.style.width = '0%'; }
}

function startGame() {
    // Show prologue first (Aunty Soma intro), then enter the game map.
    showScreen('screen-game');
    document.getElementById('week-val').textContent = window.gameState.week;
    updateGauges();
    checkMapUnlocks();

    // Show gauge tutorial on first play
    if (!window.gameState.flags.gaugesTutorialSeen) {
        setTimeout(() => showGaugeTutorial(), 900);
    }

    // Load and show the prologue scene, then enter the map
    fetch('scenes/prologue.json')
        .then(r => r.ok ? r.json() : Promise.reject('prologue not found'))
        .then(sceneData => {
            // Override on_complete so after prologue it goes to the game map, not character select
            sceneData.on_complete = { goto: 'screen_map' };
            renderDialogue(sceneData);
        })
        .catch(() => {
            // Prologue file missing — continue silently to the map
            console.warn('[PLV] prologue.json not found — skipping intro scene.');
        });
}

function unlockAchievement(id) {
    // Ensure achievements array exists (defensive — it is pre-initialised in gameState)
    if (!Array.isArray(window.gameState.flags.achievements)) {
        window.gameState.flags.achievements = [];
    }
    if (window.gameState.flags.achievements.includes(id)) return;
    window.gameState.flags.achievements.push(id);
    saveGame();
    const a = ACHIEVEMENTS[id];
    if (!a) return;
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <div class="ach-icon" aria-hidden="true">UNLOCKED</div>
        <div class="ach-body">
            <div class="ach-title">${a.title}</div>
            <div class="ach-desc">${a.desc}</div>
        </div>`;
    document.body.appendChild(toast);
    // Trigger entrance on next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('visible'));
    });
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 600);
    }, 4500);
}

function showWeekBanner(week, isDeadline = false) {
    const existing = document.getElementById('week-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.id = 'week-banner';
    banner.innerHTML = isDeadline
        ? `<strong>Week ${week}</strong> — Voter registration closes this week. If you are not registered, you cannot vote.`
        : `<strong>Week ${week}</strong> — ${week === 1 ? '1 week' : week + ' weeks'} until the election.`;
    document.getElementById('screen-game').appendChild(banner);
    setTimeout(() => banner.classList.add('visible'), 30);
    setTimeout(() => { banner.classList.remove('visible'); setTimeout(() => banner.remove(), 400); }, 4000);
}

function checkMapUnlocks() {
    // Skeptics Cafe — hidden until verifiedCount >= 3
    const cafe = document.querySelector('[data-loc="loc7"]');
    if (cafe) {
        const shouldShow = window.gameState.flags.skepticsCafeUnlocked
            || (window.gameState.flags.verifiedCount >= 3);
        if (shouldShow) {
            cafe.classList.add('unlocked');
            window.gameState.flags.skepticsCafeUnlocked = true; // persist the unlock
        } else {
            cafe.classList.remove('unlocked');
        }
    }
    // Community Hall (loc5) — always visible but has no active content currently
    // Polling station (loc9) locked until week 0 — handled in advanceWeek()

    const week = window.gameState.week;
    const flags = window.gameState.flags;
    const char = window.gameState.character;
    const visited = flags.visitedLocs || [];
    const isVisited = (pathMatch) => visited.some(p => p.includes(pathMatch));

    // Dynamic state checks since JSONs don't explicitly set "Resolved" boolean flags
    const w6UncleDone = isVisited('uncle_house_shared') || isVisited('uncle_house_ignore') || isVisited('ec_board_w6');
    const w5UncleDone = isVisited('uncle_house_w5_shared') || isVisited('uncle_house_w5_verify') || isVisited('ec_board_w5');

    const OBJECTIVES = {
        6: flags.registrationStarted || flags.registrationComplete || isVisited('grama_office_w6_Imali') || isVisited('grama_office_w6_kumaran')
            ? "You have checked your registration. Explore Alupotha."
            : (char === 'Atakatus' && !flags.uncleMsgWeek6Delivered)
                ? "Visit Uncle Sirisena's house. He sent you something."
                : (char === 'Atakatus' && !w6UncleDone)
                    ? "You have a message waiting. Reply to Uncle Sirisena."
                    : "Head to the Grama Sevaka Office to start your voter registration.",
        5: (char === 'Atakatus' && !flags.uncleMsgWeek5Delivered)
            ? "A voice note is circulating. Uncle Sirisena has it."
            : (char === 'Atakatus' && !w5UncleDone)
                ? "The voice note is unchecked. Visit the EC board to verify the claim."
                : "Explore Alupotha. Check the EC board or Police Station.",
        4: (!flags.registrationComplete && !flags.registrationDeadlineMissed)
            ? "Voter registration closes this week. Go to the Grama Sevaka Office."
            : (char === 'Atakatus' && !flags.uncleMsgWeek4Delivered)
                ? "A suspicious screenshot is circulating. Visit Uncle Sirisena."
                : "A suspicious screenshot is circulating. Check the EC board before acting.",
        3: flags.verifiedAtBoardCount >= 2
            ? "You have seen the candidate list. Explore what else is happening."
            : "The official candidate list has been posted. Check the EC notice board.",
        2: flags.readCurrentManifesto
            ? "You have read the manifesto. Compare it with what people are saying."
            : "Mahinda Bandara's campaign tent is open. Read the manifesto.",
        1: flags.verifiedBallotFold
            ? "You are ready. Election day is tomorrow."
            : "There is a message about how to fold your ballot. Verify it first.",
        0: "Election day. Go to the polling station."
    };

    const guidanceText = document.getElementById('objective-text');
    if (guidanceText) {
        guidanceText.textContent = OBJECTIVES[week] || "Continue exploring Alupotha.";
    }

    // Character-aware pulse logic
    let pulseTarget = null;
    if (week === 6) {
        if (char === 'Atakatus') {
            if (!flags.uncleMsgWeek6Delivered) pulseTarget = 'loc2';
            else if (!w6UncleDone) pulseTarget = 'loc2';
            else if (!flags.registrationStarted) pulseTarget = 'loc1';
            else pulseTarget = 'loc3';
        } else {
            if (!flags.registrationStarted && !flags.registrationComplete && !isVisited('grama_office')) pulseTarget = 'loc1';
            else pulseTarget = 'loc4';
        }
    } else if (week === 5) {
        if (char === 'Atakatus') {
            if (!flags.uncleMsgWeek5Delivered) pulseTarget = 'loc2';
            else if (!w5UncleDone) pulseTarget = 'loc2';
            else pulseTarget = 'loc3';
        } else {
            pulseTarget = 'loc3';
        }
    } else if (week === 4) {
        if (!flags.registrationComplete && !flags.registrationDeadlineMissed) pulseTarget = 'loc1';
        else if (char === 'Atakatus' && !flags.uncleMsgWeek4Delivered) pulseTarget = 'loc2';
        else pulseTarget = 'loc3';
    } else if (week === 3) {
        if (char === 'kumaran' && flags.kumaran_transferStepsComplete === 2 && !flags.registrationComplete) pulseTarget = 'loc1';
        else pulseTarget = 'loc3';
    } else if (week === 2) {
        if (!flags.readCurrentManifesto) pulseTarget = 'loc8';
        else pulseTarget = 'loc3';
    } else if (week === 1) {
        if (!flags.verifiedBallotFold) pulseTarget = 'loc6';
        else pulseTarget = 'loc1';
    } else if (week === 0) {
        pulseTarget = 'loc9';
    }

    document.querySelectorAll('.map-location').forEach(g => {
        g.classList.remove('pulse-active');
        if (pulseTarget && g.dataset.loc === pulseTarget) {
            g.classList.add('pulse-active');
        }
    });
}

function checkWeekCompletion() {
    const week = window.gameState.week;
    if (week === 0) return; // election day, no advance needed
    
    const flags = window.gameState.flags;
    const visited = flags.visitedLocs || [];
    const isVisited = (pathMatch) => visited.some(p => p.includes(pathMatch));
    
    let weekComplete = false;
    
    if (week === 6) {
        weekComplete = flags.registrationStarted || isVisited('grama_office_w6_Imali') || isVisited('grama_office_w6_kumaran') || isVisited('uncle_house_shared') || isVisited('uncle_house_ignore') || isVisited('ec_board_w6');
    } else if (week === 5) {
        weekComplete = isVisited('uncle_house_w5_shared') || isVisited('uncle_house_w5_verify') || isVisited('ec_board_w5') || isVisited('police_w5') || isVisited('boutique_w5');
    } else if (week === 4) {
        weekComplete = flags.registrationComplete || flags.registrationDeadlineMissed || isVisited('uncle_house_w4_shared') || isVisited('ec_board_w4');
    } else if (week === 3) {
        weekComplete = isVisited('ec_board_w3') || isVisited('skeptics_cafe');
    } else if (week === 2) {
        weekComplete = isVisited('campaign_tent') || flags.readCurrentManifesto;
    } else if (week === 1) {
        weekComplete = flags.verifiedBallotFold || isVisited('police_w1') || isVisited('grama_office_w1') || isVisited('uncle_house_w1_shared');
    }

    if (weekComplete) {
        showNextWeekPrompt(week);
    }
}

function showNextWeekPrompt(currentWeek) {
    const existingBanner = document.getElementById('next-week-banner');
    if (existingBanner) return; // already showing

    // Never appear while a dialogue or consequence panel is open
    const dialogueOpen = document.getElementById('dialogue-panel').classList.contains('open');
    const consequenceActive = document.getElementById('screen-consequence').classList.contains('active');
    if (dialogueOpen || consequenceActive) return;

    const nextWeek = currentWeek - 1;
    const banner = document.createElement('div');
    banner.id = 'next-week-banner';
    // z-index 18 = below top-bar (20), objective-bar (25), and all dialogue layers (29-30)
    banner.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0;
        z-index: 18;
    `;
    const isElectionDay = (nextWeek === 0);
    const eyebrow  = isElectionDay ? 'Election Day' : `Week ${currentWeek} Complete`;
    const headline = isElectionDay
        ? 'The polling station is now open.'
        : `${nextWeek} week${nextWeek === 1 ? '' : 's'} until election day.`;
    const advanceLbl = isElectionDay ? 'Go to Polling Station →' : `Continue to Week ${nextWeek} →`;
    banner.innerHTML = `
        <div class="week-banner-left">
            <div class="week-banner-eyebrow">${eyebrow}</div>
            <div class="week-banner-headline">${headline}</div>
        </div>
        <div class="week-banner-actions">
            <button class="week-banner-stay" onclick="dismissWeekBanner()">Stay &amp; Explore</button>
            <button class="week-banner-advance" onclick="advanceWeek()">${advanceLbl}</button>
        </div>
    `;
    document.getElementById('screen-game').appendChild(banner);
}

function dismissWeekBanner() {
    const banner = document.getElementById('next-week-banner');
    if (banner) {
        banner.style.transition = 'opacity 300ms';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    }
}

function advanceWeek() {
    const banner = document.getElementById('next-week-banner');
    if (banner) banner.remove();
    const newWeek = window.gameState.week - 1;
    window.gameState.week = newWeek;
    document.getElementById('week-val').textContent = newWeek;
    showWeekBanner(newWeek, newWeek === 4);
    saveGame();
    checkMapUnlocks();
    // Unlock polling station on week 0
    if (newWeek === 0) {
        const ps = document.querySelector('[data-loc="loc9"]');
        if (ps) ps.classList.add('unlocked-loc');
        const ps9 = document.getElementById('loc9-node');
        if (ps9) { ps9.style.opacity = '1'; ps9.style.pointerEvents = 'auto'; }
    }
}

// Keep this function signature but gut the old auto-advance logic
function checkWeekAdvance() {
    // Old location-count-based advance removed. 
    // Week now advances via checkWeekCompletion() + advanceWeek().
}

// --- DYNAMIC JSON SCENE ROUTER ---
function getScenePath(locId) {
    const flags = window.gameState.flags;
    const week = window.gameState.week;
    const char = window.gameState.character;
    
    let targetSceneId = null;

    if (week === 6) {
        if (locId === 'loc1') {
            if (char === 'Imali') targetSceneId = 'w6_grama_office_Imali';
            else if (char === 'kumaran') targetSceneId = 'w6_grama_office_kumaran';
            else targetSceneId = 'w6_grama_office';
        }
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek6Delivered ? 'w6_uncle_ignore' : 'w6_uncle_entry';
        else if (locId === 'loc3') targetSceneId = 'w6_ec_board_verify';
        else if (locId === 'loc4') targetSceneId = 'w6_boutique_optional';
    }
    else if (week === 5) {
        if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek5Delivered ? 'w5_map' : 'w5_uncle_voicenote';
        else if (locId === 'loc3') targetSceneId = 'w5_ec_board_verify';
        else if (locId === 'loc4') targetSceneId = 'w5_boutique';
        else if (locId === 'loc6') targetSceneId = 'w5_police_optional';
    }
    else if (week === 4) {
        if (locId === 'loc1') {
            if (char === 'kumaran' && flags.kumaran_transferStepsComplete === 1) targetSceneId = 'w4_kumaran_transfer_step2';
            else targetSceneId = flags.registrationDeadlineMissed ? 'w4_registration_deadline_missed' : 'w4_grama_office';
        }
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek4Delivered ? 'w4_map' : 'w4_uncle_screenshot';
        else if (locId === 'loc3') targetSceneId = 'w4_ec_board_verify';
        else if (locId === 'loc6') targetSceneId = 'w4_police';
    }
    else if (week === 3) {
        if (locId === 'loc1') targetSceneId = (char === 'kumaran' && flags.kumaran_transferStepsComplete === 2) ? 'w3_kumaran_transfer_step3' : 'w3_grama_office';
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek3Delivered ? 'w3_map' : 'w3_uncle_videoclip';
        else if (locId === 'loc3') targetSceneId = 'w3_ec_board_candidates';
        else if (locId === 'loc4') targetSceneId = 'w3_boutique';
        else if (locId === 'loc6') targetSceneId = 'w3_police';
        else if (locId === 'loc7') targetSceneId = 'w3_skeptics_cafe';
        else if (locId === 'loc8') targetSceneId = 'w3_map'; 
    }
    else if (week === 2) {
        if (locId === 'loc3') targetSceneId = 'w2_ec_board';
        else if (locId === 'loc4') targetSceneId = 'w2_boutique';
        else if (locId === 'loc6') targetSceneId = 'w2_police';
        else if (locId === 'loc8') targetSceneId = 'w2_campaign_tent_entry';
    }
    else if (week === 1) {
        if (locId === 'loc1') targetSceneId = 'w1_grama_final';
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek1Delivered ? 'w1_map' : 'w1_uncle_ballotfold';
        else if (locId === 'loc3') targetSceneId = 'w1_ec_board';
        else if (locId === 'loc6') targetSceneId = 'w1_police_ballotfold_verify';
        else if (locId === 'loc8') targetSceneId = 'w1_campaign_tent_readonly';
    }
    else if (week === 0) {
        if (locId === 'loc9') targetSceneId = 'w0_polling_arrival';
    }

    if (!targetSceneId) return null;
    return _sceneIdToPath(targetSceneId);
}

function openLocation(locId) {
    window.gameState.currentLoc = locId;
    const path = getScenePath(locId);
    
    // Intercept map returns before attempting to fetch
    if (!path || path.endsWith('_map') || path === 'screen_map') {
        renderDialogue({
            lines: [
                { type: "narration", text: "Nothing new is happening here right now. You should check elsewhere.", advance: "choice" },
                { type: "choice", prompt: " ", choices: [{ label: "Return to Map", goto: "screen_map" }] }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    openScenePath(path);
}

async function openScenePath(scenePath) {
    if (!scenePath) return;

    if (!Array.isArray(window.gameState.flags.visitedLocs)) {
        window.gameState.flags.visitedLocs = [];
    }
    if (!window.gameState.flags.visitedLocs.includes(scenePath)) {
        window.gameState.flags.visitedLocs.push(scenePath);
    }

    try {
        const response = await fetch(scenePath);
        if (!response.ok) throw new Error(`Scene not found: ${scenePath}`);
        const sceneData = await response.json();
        renderDialogue(sceneData);
    } catch (error) {
        console.warn('[PLV] Scene load failed:', error.message);
        // Friendly fallback — not an error message, just a quiet dead end
        renderDialogue({
            lines: [
                {
                    type: "narration",
                    text: "Nothing seems to be happening here right now. Alupotha is a small town — there is only so much to see in a day.",
                    advance: "click"
                }
            ],
            on_complete: { goto: "screen_map" }
        });
    }
}

// =============================================================================
// DIALOGUE ENGINE v2 — Aligned to Master Scene File schema
// Every scene JSON uses: lines[], on_complete{goto|conditional|week_set}
// Line types: dialogue, narration, whatsapp, voicenote, screenshot, notice,
//             document, comparison, video, choice, stats
// =============================================================================

const LOC_BGS = {
    'loc1': 'Assets/backgrounds/bg_grama_office.jpeg',
    'loc2': 'Assets/backgrounds/bg_uncle_house.jpeg',
    'loc3': 'Assets/backgrounds/bg_ec_board.jpeg',
    'loc4': 'Assets/backgrounds/bg_boutique.jpeg',
    'loc5': 'Assets/backgrounds/bg_main_menu.jpeg',
    'loc6': 'Assets/backgrounds/bg_police.jpeg',
    'loc7': 'Assets/backgrounds/bg_skeptics_cafe.jpeg',
    'loc8': 'Assets/backgrounds/bg_campaign_tent.jpeg',
    'loc9': 'Assets/backgrounds/bg_polling_station.jpeg'
};

const BG_MAP = {
    'bg_uncle_house':    'Assets/backgrounds/bg_uncle_house.jpeg',
    'bg_grama_office':   'Assets/backgrounds/bg_grama_office.jpeg',
    'bg_ec_board':       'Assets/backgrounds/bg_ec_board.jpeg',
    'bg_boutique':       'Assets/backgrounds/bg_boutique.jpeg',
    'bg_police':         'Assets/backgrounds/bg_police.jpeg',
    'bg_campaign_tent':  'Assets/backgrounds/bg_campaign_tent.jpeg',
    'bg_skeptics_cafe':  'Assets/backgrounds/bg_skeptics_cafe.jpeg',
    'bg_polling_station':'Assets/backgrounds/bg_polling_station.jpeg',
    'bg_main_menu':      'Assets/backgrounds/bg_main_menu.jpeg',
    'bg_town_map':       'Assets/backgrounds/bg_town_map.jpeg',
    /* Master Scene File uses these keys — map to the positive/negative files */
    'bg_ending_good':    'Assets/backgrounds/bg_ending_positive.jpeg',
    'bg_ending_bad':     'Assets/backgrounds/bg_ending_negative.jpeg',
    /* Legacy aliases kept for backward compat */
    'bg_ending_positive':'Assets/backgrounds/bg_ending_positive.jpeg',
    'bg_ending_negative':'Assets/backgrounds/bg_ending_negative.jpeg',
    'bg_ending_neutral': 'Assets/backgrounds/bg_ending_neutral.jpeg'
};

// --- PANEL OPEN / CLOSE ---

function openDialoguePanel() {
    document.getElementById('dialogue-overlay').classList.add('open');
    document.getElementById('dialogue-panel').classList.add('open');
    // Show the explicit back-to-map button whenever we enter a location
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.add('visible');
    const bgLayer = document.getElementById('location-bg-layer');
    // Prefer scene-declared background; fall back to location map
    const sceneBg = window.gameState.dialogue._sceneBg;
    const bgUrl = (sceneBg && BG_MAP[sceneBg])
        || (window.gameState.currentLoc && LOC_BGS[window.gameState.currentLoc] ? LOC_BGS[window.gameState.currentLoc] : null);
    if (bgUrl) {
        bgLayer.style.backgroundImage = `url('${bgUrl}')`;
        bgLayer.classList.add('active');
        
        // Map background to ambient audio file
        const bgName = bgUrl.split('/').pop().split('.')[0]; 
        const audioMap = {
            'bg_grama_office': 'ambient_grama_office.ogg',
            'bg_uncle_house': 'ambient_uncle_house.ogg',
            'bg_boutique': 'ambient_boutique.ogg',
            'bg_police': 'ambient_police.ogg',
            'bg_campaign_tent': 'ambient_tent.ogg',
            'bg_ec_board': 'ambient_ec_board.ogg',
            'bg_polling_station': 'ambient_polling.ogg'
        };
        if (audioMap[bgName]) {
            playAudio('bgm', audioMap[bgName]);
        }
    }
}

function closeDialoguePanel() {
    document.getElementById('dialogue-overlay').classList.remove('open');
    document.getElementById('dialogue-panel').classList.remove('open');
    document.getElementById('location-bg-layer').classList.remove('active');
    // Hide the back button when we return to the map
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.remove('visible');
    stopBGM();
    // Now that the panel is gone, safely check if the week's goal is complete
    if (window.gameState.screen === 'screen-game') {
        checkWeekCompletion();
    }
}

// --- AUDIO SYSTEM ---
function playAudio(type, fileName) {
    const player = document.getElementById(type === 'bgm' ? 'bgm-player' : 'sfx-player');
    if (!player) return;
    if (player.src.includes(fileName)) {
        if (player.paused) player.play().catch(e => console.warn('Audio blocked:', e));
        return;
    }
    player.src = `Assets/audio/${fileName}`;
    player.play().catch(e => console.warn('Audio play blocked:', e));
}

function stopBGM() {
    const player = document.getElementById('bgm-player');
    if (player) {
        player.pause();
        player.currentTime = 0;
    }
}

// --- PORTRAIT HELPERS ---

function _setNpcPortrait(portraitKey, speakerName) {
    const cont = document.getElementById('dialogue-portrait-container');
    const nameEl = document.getElementById('dialogue-npc-name');
    if (portraitKey) {
        const src = `Assets/npcs/${portraitKey}.png`;
        cont.innerHTML = `<img src="${src}" data-initials="${(speakerName||'NPC').substring(0,2).toUpperCase()}" onerror="imgFallback(this)" alt="${speakerName || 'NPC'}">`;
    } else {
        cont.innerHTML = '';
    }
    if (nameEl) nameEl.textContent = speakerName || '';
}

function _setPcPortrait(emotion) {
    const state = window.gameState;
    const cont = document.getElementById('dialogue-pc-portrait-container');
    if (cont && state.character) {
        const em = emotion || state.flags.latestEmotion || 'neutral';
        cont.innerHTML = `<img src="Assets/characters/char_${state.character}_${em}.png" data-initials="PC" onerror="imgFallback(this)" alt="Player character">`;
    }
}

// --- CONDITION EVALUATOR ---
// Safely evaluates condition strings from the scene JSON.
// Only has access to gameState.flags and gameState.gauges — no eval of arbitrary code.

function _evalCondition(condStr) {
    if (!condStr) return true;
    try {
        const flags = window.gameState.flags;
        const gauges = window.gameState.gauges;
        // eslint-disable-next-line no-new-func
        return (new Function('flags', 'gauges', `return !!(${condStr});`))(flags, gauges);
    } catch (e) {
        console.warn('[PLV] Condition eval failed:', condStr, e);
        return false;
    }
}

// --- SCENE ENTRY POINT ---
// Called by openScenePath() after the JSON is fetched.
// Replaces the old renderDialogue().

function renderDialogue(sceneDef) {
    const state = window.gameState;

    // Apply any flags that should be set the moment this scene loads
    if (sceneDef.flags_set_on_enter && Array.isArray(sceneDef.flags_set_on_enter)) {
        sceneDef.flags_set_on_enter.forEach(flag => { state.flags[flag] = true; });
        saveGame();
    }

    // Filter lines by condition (character_only, condition strings)
    const allLines = (sceneDef.lines || []).filter(line => {
        if (line.character_only && line.character_only !== state.character) return false;
        if (line.condition && !_evalCondition(line.condition)) return false;
        return true;
    });

    // Store full scene state
    state.dialogue = {
        active: true,
        currentLine: 0,
        lines: allLines,
        on_complete: sceneDef.on_complete || null,
        _sceneBg: sceneDef.background || null,
        _waiting: false   // true when a choice line is displayed and awaiting player pick
    };

    // Clear options panel immediately
    const optsCont = document.getElementById('dialogue-options');
    optsCont.innerHTML = '';
    optsCont.style.display = 'none';
    document.getElementById('dialogue-continue').style.display = 'none';
    document.getElementById('dialogue-text').innerHTML = '';
    document.getElementById('dialogue-npc-name').textContent = '';
    document.getElementById('dialogue-portrait-container').innerHTML = '';

    _setPcPortrait('neutral');
    openDialoguePanel();
    advanceDialogue();
}

// --- LINE RENDERER ---
// Reads the current line from state, renders it, increments pointer.

function advanceDialogue() {
    const d = window.gameState.dialogue;

    // If a choice is displayed, clicking elsewhere does nothing — player must pick.
    if (d._waiting) return;

    if (d.currentLine >= d.lines.length) {
        // All lines done. Resolve on_complete.
        _resolveOnComplete(d.on_complete);
        return;
    }

    const line = d.lines[d.currentLine];
    d.currentLine++;

    _renderLine(line);
}

function _renderLine(line) {
    const textEl   = document.getElementById('dialogue-text');
    const contBtn  = document.getElementById('dialogue-continue');
    const optsEl   = document.getElementById('dialogue-options');

    // Reset
    contBtn.style.display = 'none';
    optsEl.style.display  = 'none';
    optsEl.innerHTML = '';
    textEl.className = 'dialogue-text'; // reset type classes

    switch (line.type) {

        case 'dialogue': {
            textEl.classList.add('line-dialogue');
            _setNpcPortrait(line.portrait_state || null, line.speaker || '');
            _setPcPortrait('neutral');
            textEl.innerHTML = `<span class="speaker-name">${line.speaker || ''}</span><br>${line.text || ''}`;
            contBtn.style.display = 'block';
            break;
        }

        case 'narration': {
            textEl.classList.add('line-narration');
            // Narration: no NPC portrait, player portrait shows thinking
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            _setPcPortrait('neutral');
            textEl.innerHTML = `<em>${line.text || ''}</em>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'whatsapp': {
            textEl.classList.add('line-media');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            textEl.innerHTML = `
                <div class="media-card whatsapp-card">
                    <div class="media-card-header">
                        <span class="media-platform">WhatsApp</span>
                        <span class="media-group">${c.group || ''} · ${c.member_count || ''} members</span>
                    </div>
                    <div class="media-card-sender">${c.sender || ''} <span class="media-time">${c.time || ''}</span></div>
                    ${c.forwarded_count ? `<div class="media-forwarded">⟳ Forwarded ${c.forwarded_count} times</div>` : ''}
                    <div class="media-card-body">${c.message || ''}</div>
                </div>`;
            // If advance is "choice", the NEXT line must be a choice line — fall through
            if (line.advance === 'choice') {
                contBtn.style.display = 'block';
            } else {
                contBtn.style.display = 'block';
            }
            break;
        }

        case 'voicenote': {
            textEl.classList.add('line-media');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            textEl.innerHTML = `
                <div class="media-card voicenote-card">
                    <div class="media-card-header">
                        <span class="media-platform">WhatsApp Voice Note</span>
                        <span class="media-group">${c.group || ''} · ${c.member_count || ''} members</span>
                    </div>
                    <div class="media-card-sender">${c.sender || ''} <span class="media-time">${c.time || ''}</span></div>
                    ${c.forwarded_count ? `<div class="media-forwarded">⟳ Forwarded ${c.forwarded_count} times</div>` : ''}
                    <div class="media-voicenote-bar">
                        <div class="voicenote-icon">🎤</div>
                        <div class="voicenote-waveform"></div>
                        <div class="voicenote-duration">${c.duration || '0:00'}</div>
                    </div>
                    <div class="media-transcript"><em>"${c.transcript || ''}"</em></div>
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'screenshot': {
            textEl.classList.add('line-media');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            const cues = (c.visual_cues || []).map(cue => `<li>${cue}</li>`).join('');
            textEl.innerHTML = `
                <div class="media-card screenshot-card">
                    <div class="media-card-header">
                        <span class="media-platform">Screenshot</span>
                        <span class="media-group">${c.group || ''}</span>
                    </div>
                    <div class="media-card-sender">${c.sender || ''} <span class="media-time">${c.time || ''}</span></div>
                    ${c.forwarded_count ? `<div class="media-forwarded">⟳ Forwarded ${c.forwarded_count} times</div>` : ''}
                    ${c.caption ? `<div class="media-caption"><strong>${c.caption}</strong></div>` : ''}
                    <div class="screenshot-description">${c.image_description || ''}</div>
                    ${cues ? `<ul class="screenshot-cues">${cues}</ul>` : ''}
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'notice': {
            textEl.classList.add('line-document');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            textEl.innerHTML = `
                <div class="document-card notice-card">
                    <div class="notice-header">${c.header || ''}</div>
                    <div class="notice-title">${c.title || ''}</div>
                    <div class="notice-body">${(c.body || '').replace(/\n/g, '<br>')}</div>
                    ${c.footer ? `<div class="notice-footer">${c.footer}</div>` : ''}
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'document': {
            textEl.classList.add('line-document');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            const sections = (c.sections || []).map(s =>
                `<div class="doc-section"><div class="doc-section-heading">${s.heading}</div><div class="doc-section-text">${s.text}</div></div>`
            ).join('');
            textEl.innerHTML = `
                <div class="document-card">
                    <div class="doc-title">${c.title || ''}</div>
                    ${c.subtitle ? `<div class="doc-subtitle">${c.subtitle}</div>` : ''}
                    <div class="doc-sections">${sections}</div>
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'comparison': {
            textEl.classList.add('line-document');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            textEl.innerHTML = `
                <div class="document-card comparison-card">
                    <div class="doc-title">${c.title || ''}</div>
                    <div class="comparison-grid">
                        <div class="comparison-col">
                            <div class="comparison-label">${c.left_label || ''}</div>
                            <div class="comparison-text">${c.left_text || ''}</div>
                        </div>
                        <div class="comparison-col">
                            <div class="comparison-label">${c.right_label || ''}</div>
                            <div class="comparison-text">${c.right_text || ''}</div>
                        </div>
                    </div>
                    ${c.difference_note ? `<div class="comparison-note">${c.difference_note}</div>` : ''}
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'video': {
            textEl.classList.add('line-media');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const c = line.card || {};
            textEl.innerHTML = `
                <div class="media-card video-card">
                    <div class="media-card-header">
                        <span class="media-platform">Video Clip</span>
                    </div>
                    <div class="video-still">
                        <div class="video-play-icon">▶</div>
                        <div class="video-description">${c.description || ''}</div>
                    </div>
                    ${c.caption ? `<div class="media-caption">${c.caption}</div>` : ''}
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'stats': {
            textEl.classList.add('line-stats');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            const g = window.gameState.gauges;
            const f = window.gameState.flags;
            
            // Calculate aggregated flag that was previously missing
            const sharedFake = f.sharedFakeMessage || f.sharedFake4amMessage || f.sharedFakeCandidateList;
            
            textEl.innerHTML = `
                <div class="stats-card">
                    <div class="stats-title">Your Alupotha</div>
                    <div class="stats-row"><span>Civic Trust</span><span class="stats-val">${g.ct}</span></div>
                    <div class="stats-row"><span>Information Health</span><span class="stats-val">${g.ih}</span></div>
                    <div class="stats-row"><span>Voter Participation</span><span class="stats-val">${g.vp}</span></div>
                    <div class="stats-row"><span>Misinformation Shared</span><span class="stats-val">${sharedFake ? 'Yes' : 'No'}</span></div>
                    <div class="stats-row"><span>Registration Complete</span><span class="stats-val">${f.registrationComplete ? 'Yes' : 'No'}</span></div>
                    <div class="stats-row"><span>Ballot Correctly Cast</span><span class="stats-val">${f.votedSuccessfully ? 'Yes' : 'No'}</span></div>
                </div>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'choice': {
            // Choice lines display a prompt and render option buttons.
            // Engine halts until player selects.
            textEl.classList.add('line-choice');
            _setNpcPortrait(line.portrait_state || null, line.speaker || '');
            textEl.innerHTML = `<span class="choice-prompt">${line.prompt || line.text || ''}</span>`;

            const choices = line.choices || [];
            optsEl.innerHTML = '';
            choices.forEach(opt => {
                // Filter choice-level conditions
                if (opt.condition && !_evalCondition(opt.condition)) return;
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                let labelText = opt.label || opt.text || '';
                if (opt.perk === 'curiosity') {
                    btn.classList.add('curiosity-option');
                }
                btn.textContent = labelText;
                btn.addEventListener('click', () => _applySceneChoice(opt));
                optsEl.appendChild(btn);
            });

            optsEl.style.display = 'flex';
            contBtn.style.display = 'none';
            window.gameState.dialogue._waiting = true;
            break;
        }

        default: {
            // Unknown type — render text if present, continue.
            textEl.innerHTML = line.text || '';
            contBtn.style.display = 'block';
            break;
        }
    }
}

// --- CHOICE APPLICATION ---
// Handles a player's selection from a "choice" line.
// Maps Master File schema fields: goto, flags_set, flags_increment, gauges, achievement.

function _applySceneChoice(opt) {
    const state = window.gameState;
    state.dialogue._waiting = false;

    // 1. Apply gauge deltas
    const gaugeDeltas = opt.gauges || {};
    const prevGauges = { ...state.gauges };
    for (const [k, v] of Object.entries(gaugeDeltas)) {
        state.gauges[k] = Math.max(0, Math.min(100, state.gauges[k] + v));
    }

    // 2. Set boolean flags
    (opt.flags_set || []).forEach(flagKey => {
        state.flags[flagKey] = true;
    });

    // 3. Increment counter flags
    const increments = opt.flags_increment || {};
    for (const [k, v] of Object.entries(increments)) {
        state.flags[k] = (state.flags[k] || 0) + v;
    }

    // 4. Unlock achievement
    if (opt.achievement) unlockAchievement(opt.achievement);

    // 5. Curiosity perk achievement
    if (opt.perk === 'curiosity') unlockAchievement('curiosity_perk');

    // 6. Update emotion for player portrait
    if (gaugeDeltas.ih > 0)  state.flags.latestEmotion = 'happy';
    else if (gaugeDeltas.ct < 0) state.flags.latestEmotion = 'worried';
    else state.flags.latestEmotion = 'neutral';

    // 7. Show consequence screen if gauges changed
    const hasConsequence = Object.values(gaugeDeltas).some(v => v !== 0);
    if (hasConsequence) {
        state.history.push({ loc: state.currentLoc, choice: opt.label || opt.text, effect: gaugeDeltas });
        updateGauges(true);
        saveGame();
        checkMapUnlocks();
        // Show consequence screen, then route to goto after player dismisses
        _pendingGoto = opt.goto || null;
        showConsequence(opt.consequence_text || '', gaugeDeltas, prevGauges);
        return;
    }

    state.history.push({ loc: state.currentLoc, choice: opt.label || opt.text, effect: gaugeDeltas });
    updateGauges(false);
    saveGame();
    checkMapUnlocks();
    // Week completion checked when dialogue fully closes, not mid-scene

    // 8. Navigate
    _navigateGoto(opt.goto);
}

// Stores the pending goto when a consequence screen is shown mid-choice.
let _pendingGoto = null;

// Called by returnToGame() — if a goto was stored, navigate there.
function _resumeAfterConsequence() {
    if (_pendingGoto) {
        const target = _pendingGoto;
        _pendingGoto = null;
        _navigateGoto(target);
    }
}

// --- ON_COMPLETE RESOLVER ---
// Handles the three on_complete shapes from the Master File:
//   { goto: "scene_id" }
//   { goto: "scene_id", week_set: 5 }
//   { conditional: [ { condition: "...", goto: "..." }, ..., { default: true, goto: "..." } ] }

function _resolveOnComplete(onComplete) {
    closeDialoguePanel();
    updateGauges(false);
    saveGame();
    checkMapUnlocks();
    // Note: checkWeekCompletion is NOT called here.
    // Week advancement is triggered only by player action via advanceWeek().

    if (!onComplete) return;

    if (onComplete.week_set !== undefined) {
        window.gameState.week = onComplete.week_set;
        showWeekBanner(onComplete.week_set);
    }

    if (onComplete.goto) {
        _navigateGoto(onComplete.goto);
        return;
    }

    if (onComplete.conditional) {
        for (const branch of onComplete.conditional) {
            if (branch.default || _evalCondition(branch.condition)) {
                _navigateGoto(branch.goto);
                return;
            }
        }
        return;
    }
}

// --- NAVIGATION ROUTER ---
// Central router for goto values. Handles scene IDs, screen names, and special actions.

function _navigateGoto(target) {
    if (!target) return;

    // Gracefully handle returning to map state
    if (target.endsWith('_map') || target === 'screen_map') { 
        closeDialoguePanel(); 
        showScreen('screen-game');
        checkMapUnlocks();
        return; 
    }

    // Special action strings
    if (target === 'screen_character_select') { showScreen('screen-character'); return; }
    if (target === 'screen_main_menu')         { showScreen('screen-mainmenu'); return; }
    if (target === 'triggerEnding')            { triggerEnding(); return; }
    if (target === 'checkWeekCompletion')      { checkWeekCompletion(); return; }

    // Ending scene IDs
    if (['ending_good', 'ending_bad', 'ending_neutral', 'ending_secret'].includes(target)) {
        openScenePath(`scenes/week0/${target}.json`);
        return;
    }

    // Scene IDs from the Master File are dot-prefixed week folders:
    // "w6_uncle_entry" → "scenes/week6/uncle_house_entry.json" (via getScenePathById)
    // OR a direct file path already built by getScenePath()
    if (target.startsWith('scenes/')) {
        openScenePath(target);
        return;
    }

    // Resolve scene ID to file path
    const path = _sceneIdToPath(target);
    if (path) {
        openScenePath(path);
    } else {
        console.warn('[PLV] Unknown goto target:', target);
        closeDialoguePanel();
    }
}

// --- SCENE ID → FILE PATH RESOLVER ---
// Maps Master File scene IDs (e.g. "w6_uncle_entry") to the correct JSON file path.
// The Master File uses wN_ prefixes. The folder structure uses weekN/ folders.
// This function handles the translation so scene authors only write scene IDs,
// not full paths.

function _sceneIdToPath(sceneId) {
    if (!sceneId) return null;
    // Direct map lookup — no wN_ prefix required, works for prologue, endings, and all weeks.
    const SCENE_ID_MAP = {
        // Prologue
        'prologue':                        'scenes/prologue.json',

        // Week 6 — each scene has its own file
        'w6_uncle_entry':                  'scenes/week6/uncle_house_entry.json',
        'w6_uncle_shared':                 'scenes/week6/uncle_house_shared.json',
        'w6_uncle_asksource':              'scenes/week6/uncle_house_verify.json',
        'w6_uncle_ignore':                 'scenes/week6/uncle_house_ignore.json',
        'w6_ec_board_verify':              'scenes/week6/ec_board_w6.json',
        'w6_ec_correct_uncle':             'scenes/week6/ec_board_correct_uncle.json',
        'w6_ec_post_correct':              'scenes/week6/ec_board_post_correct.json',
        'w6_grama_office':                 'scenes/week6/grama_office_w6.json',
        'w6_grama_curiosity':              'scenes/week6/grama_office_curiosity.json',
        'w6_grama_registration_started':   'scenes/week6/grama_office_reg_started.json',
        'w6_grama_office_Imali':          'scenes/week6/grama_office_w6_Imali.json',
        'w6_Imali_wrong_assumption':      'scenes/week6/grama_office_Imali_wrong.json',
        'w6_Imali_assumption_corrected':  'scenes/week6/grama_office_Imali_corrected.json',
        'w6_grama_office_kumaran':         'scenes/week6/grama_office_w6_kumaran.json',
        'w6_boutique_optional':            'scenes/week6/boutique_w6.json',
        'w6_boutique_listen':              'scenes/week6/boutique_w6_listen.json',
        'w6_boutique_critical':            'scenes/week6/boutique_w6_critical.json',
        'w6_transition':                   'scenes/week6/week6_transition.json',

        // Week 5
        'w5_uncle_voicenote':              'scenes/week5/uncle_house_w5.json',
        'w5_uncle_voicenote_shared':       'scenes/week5/uncle_house_w5_shared.json',
        'w5_uncle_voicenote_skeptic':      'scenes/week5/uncle_house_w5_verify.json',
        'w5_ec_board_verify':              'scenes/week5/ec_board_w5.json',
        'w5_boutique':                     'scenes/week5/boutique_w5.json',
        'w5_police_optional':              'scenes/week5/police_w5.json',
        'w5_police_intimidation_info':     'scenes/week5/police_w5_intimidation.json',
        'w5_transition':                   'scenes/week5/week5_transition.json',

        // Week 4
        'w4_uncle_screenshot':             'scenes/week4/uncle_house_w4.json',
        'w4_uncle_screenshot_shared':      'scenes/week4/uncle_house_w4_shared.json',
        'w4_ec_board_verify':              'scenes/week4/ec_board_w4.json',
        'w4_grama_office':                 'scenes/week4/grama_office_w4.json',
        'w4_registration_complete':        'scenes/week4/grama_office_w4_complete.json',
        'w4_registration_last_chance':     'scenes/week4/grama_office_w4_lastchance.json',
        'w4_registration_deadline_missed': 'scenes/week4/grama_office_w4_missed.json',
        'w4_police':                       'scenes/week4/police_w4.json',
        'w4_police_report_posters':        'scenes/week4/police_w4_posters.json',
        'w4_kumaran_transfer_step2':       'scenes/week4/kumaran_transfer_w4.json',
        'w4_transition':                   'scenes/week4/week4_transition.json',

        // Week 3
        'w3_ec_board_candidates':          'scenes/week3/ec_board_w3.json',
        'w3_ec_board_sandya_note':         'scenes/week3/ec_board_w3_sandya.json',
        'w3_uncle_videoclip':              'scenes/week3/uncle_house_w3.json',
        'w3_uncle_videoclip_shared':       'scenes/week3/uncle_house_w3_shared.json',
        'w3_uncle_videoclip_compare':      'scenes/week3/uncle_house_w3_compare.json',
        'w3_grama_office':                 'scenes/week3/grama_office_w3.json',
        'w3_grama_roadfile':               'scenes/week3/grama_office_w3_roadfile.json',
        'w3_nandadasa_dialogue':           'scenes/week3/grama_office_w3_nandadasa.json',
        'w3_police':                       'scenes/week3/police_w3.json',
        'w3_police_voter_intimidation':    'scenes/week3/police_w3_intimidation.json',
        'w3_police_sergeant_transfer':     'scenes/week3/police_w3_transfer.json',
        'w3_boutique':                     'scenes/week3/boutique_w3.json',
        'w3_boutique_1977_receipt':        'scenes/week3/boutique_w3_receipt.json',
        'w3_skeptics_cafe_unlock':         'scenes/week3/skeptics_cafe_w3_unlock.json',
        'w3_skeptics_cafe':                'scenes/week3/skeptics_cafe_w3.json',
        'w3_kumaran_transfer_step3':       'scenes/week3/kumaran_transfer_w3.json',
        'w3_transition':                   'scenes/week3/week3_transition.json',

        // Week 2
        'w2_campaign_tent_entry':          'scenes/week2/campaign_tent_w2.json',
        'w2_campaign_tent_manifesto':      'scenes/week2/campaign_tent_manifesto.json',
        'w2_campaign_tent_oldbox':         'scenes/week2/campaign_tent_oldbox.json',
        'w2_police':                       'scenes/week2/police_w2.json',
        'w2_ec_board':                     'scenes/week2/ec_board_w2.json',
        'w2_boutique':                     'scenes/week2/boutique_w2.json',
        'w2_transition':                   'scenes/week2/week2_transition.json',

        // Week 1
        'w1_uncle_ballotfold':             'scenes/week1/uncle_house_w1.json',
        'w1_uncle_ballotfold_believed':    'scenes/week1/uncle_house_w1_believed.json',
        'w1_uncle_ballotfold_shared':      'scenes/week1/uncle_house_w1_shared.json',
        'w1_police_ballotfold_verify':     'scenes/week1/police_w1.json',
        'w1_ec_board':                     'scenes/week1/ec_board_w1.json',
        'w1_grama_final':                  'scenes/week1/grama_office_w1.json',
        'w1_campaign_tent_readonly':       'scenes/week1/campaign_tent_w1.json',
        'w1_transition':                   'scenes/week1/week1_transition.json',

        // Week 0 / Election Day / Endings
        'w0_town_map_narration':           'scenes/week0/map_w0_transition.json',
        'w0_polling_arrival':              'scenes/week0/polling_arrival.json',
        'w0_polling_elderly':              'scenes/week0/polling_elderly.json',
        'w0_polling_elderly_helped':       'scenes/week0/polling_elderly_helped.json',
        'w0_polling_youngman':             'scenes/week0/polling_youngman.json',
        'w0_polling_youngman_helped':      'scenes/week0/polling_youngman_helped.json',
        'w0_polling_couple':               'scenes/week0/polling_couple.json',
        'w0_polling_couple_helped':        'scenes/week0/polling_couple_helped.json',
        'w0_check_sandya':                 'scenes/week0/polling_register_check.json',
        'w0_casting_ballot':               'scenes/week0/polling_vote_valid.json',
        'w0_ballot_valid':                 'scenes/week0/polling_vote_valid_confirmed.json',
        'w0_ballot_spoiled':               'scenes/week0/polling_vote_spoiled.json',
        'ending_good':                     'scenes/week0/ending_good.json',
        'ending_bad':                      'scenes/week0/ending_bad.json',
        'ending_neutral':                  'scenes/week0/ending_neutral.json',
        'ending_secret':                   'scenes/week0/ending_secret.json',
    };

    return SCENE_ID_MAP[sceneId] || null;
}

// Bind click events to advance dialogue (replaces old inline bindings)
document.addEventListener('DOMContentLoaded', () => {
    const textEl = document.getElementById('dialogue-text');
    const contBtn = document.getElementById('dialogue-continue');
    if (textEl) textEl.addEventListener('click', advanceDialogue);
    if (contBtn) contBtn.addEventListener('click', advanceDialogue);
});

// --- LEGACY BRIDGE ---
// applyChoice() was called by old inline scene JSONs that used the old schema.
// Kept here so any scene files not yet migrated do not throw a reference error.
// Logs a warning so you can identify and migrate them.
function applyChoice(choice) {
    console.warn('[PLV] applyChoice() called — this scene uses the OLD schema. Migrate to "choices" array with goto/flags_set/gauges fields.', choice);
    const deltas = choice.effect || {};
    const prev = { ...window.gameState.gauges };
    for (const [k, v] of Object.entries(deltas)) {
        window.gameState.gauges[k] = Math.max(0, Math.min(100, window.gameState.gauges[k] + v));
    }
    if (choice.flag) {
        if (typeof choice.flag === 'object') Object.assign(window.gameState.flags, choice.flag);
        else window.gameState.flags[choice.flag] = true;
    }
    updateGauges(true);
    saveGame();
    checkMapUnlocks();
    if (choice.redirect) {
        const target = choice.redirect;
        setTimeout(() => {
            if (target.startsWith('loc')) openLocation(target);
            else openScenePath(target);
        }, 300);
    } else if (choice.consequence) {
        showConsequence(choice.consequence, deltas, prev);
    }
    checkWeekCompletion();
}

function showConsequence(text, deltas, prev) {
    const badgesCont = document.getElementById('cons-changes');
    badgesCont.innerHTML = '';
    
    for(const [k, v] of Object.entries(deltas)) {
        if(v === 0) continue;
        const sign = v > 0 ? '↑' : '↓';
        const cls = v > 0 ? 'pos' : 'neg';
        const label = document.querySelector(`[data-i18n="gauge.${k}"]`) ? document.querySelector(`[data-i18n="gauge.${k}"]`).textContent : k.toUpperCase();
        badgesCont.innerHTML += `<div class="cons-badge ${cls}">${sign} ${label} ${v > 0 ? '+'+v : v}</div>`;
    }
    
    document.getElementById('cons-text').textContent = text;
    updateGauges(true);
    showScreen('screen-consequence');
}

function returnToGame() {
    showScreen('screen-game');
    _resumeAfterConsequence();
    updateGauges();
    checkMapUnlocks();
    checkWeekCompletion();
}

function triggerEnding() {
    const g = window.gameState.gauges;
    const flags = window.gameState.flags;
    
    let endingType = 'neutral';
    let endingTitle = 'The Election Has Passed.';
    let endingText = '';
    
    const allAbove60 = g.ct > 60 && g.ih > 60 && g.vp > 60;
    const anyBelow30 = g.ct < 30 || g.ih < 30 || g.vp < 30;
    const badVote = flags.ballotSpoiled || !flags.registrationComplete; // Fixed invalid flag reference
    
    if (allAbove60 && !badVote) {
        endingType = 'good';
        endingTitle = 'Alupotha Voted.';
        endingText = `You walk out of the polling station. The street is quieter than it was this morning. Aunty Soma is waiting outside. She does not say anything for a moment. Then: "Did you vote?" You say yes. She nods once. "Good." The road is still not fixed. But you came.`;
    } else if (anyBelow30 || badVote) {
        endingType = 'bad';
        endingTitle = 'Something Was Lost.';
        endingText = `The election happened. Turnout in Alupotha was lower than expected. Some people came at 4am and went home. Some people filled in their ballots wrong. Some people never made it to the register. These are separate problems with a shared cause. The information that moved through this town in the last six weeks was not all true. Some of it you helped move.`;
    } else {
        endingTitle = 'You Tried. Most People Do.';
        endingText = `The election happened. You voted. Some things went right. Some things went wrong. The road is still not fixed. Mahinda Bandara is giving an interview. Uncle Sirisena has already started analysing the results. The WhatsApp group is very active. This is Alupotha.`;
    }

    // Show ending screen
    const consScreen = document.getElementById('screen-consequence');
    const consBg = document.getElementById('bg-consequence');
    
    // Swap background image based on outcome
    if (consBg) {
        if (endingType === 'good') {
            consBg.style.backgroundImage = "url('Assets/backgrounds/bg_ending_positive.jpeg')";
        } else if (endingType === 'bad') {
            consBg.style.backgroundImage = "url('Assets/backgrounds/bg_ending_negative.jpeg')";
        } else {
            consBg.style.backgroundImage = "url('Assets/backgrounds/bg_ending_neutral.jpeg')"; // neutral fallback
        }
    }
    
    document.getElementById('cons-text').textContent = endingText;
    
    const badgesCont = document.getElementById('cons-changes');
    badgesCont.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem;">
            <div style="font-size:1.4rem;font-family:var(--font-title,serif);margin-bottom:0.5rem;">${endingTitle}</div>
            <div style="font-size:0.85rem;color:var(--text-muted);">Final scores</div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:1rem;">
            <div class="cons-badge ${g.ct > 60 ? 'pos' : 'neg'}">Civic Trust: ${g.ct}</div>
            <div class="cons-badge ${g.ih > 60 ? 'pos' : 'neg'}">Info Health: ${g.ih}</div>
            <div class="cons-badge ${g.vp > 60 ? 'pos' : 'neg'}">Voter Part.: ${g.vp}</div>
        </div>
    `;
    
    updateGauges(true);
    showScreen('screen-consequence');
    
    // Replace return button with "Play Again"
    const returnBtn = document.querySelector('#screen-consequence button');
    if (returnBtn) {
        returnBtn.textContent = 'Play Again';
        returnBtn.onclick = () => {
            localStorage.removeItem('plv_save');
            location.reload();
        };
    }
    
    saveGame();
}

// =============================================================
// GAUGE TUTORIAL — shown once on first game entry
// =============================================================
function showGaugeTutorial() {
    // Remove any existing instance first
    const existing = document.getElementById('gauge-tutorial');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gauge-tutorial';
    overlay.innerHTML = `
        <div class="gauge-tutorial-inner">
            <h2>How your choices are measured</h2>
            <p class="gauge-tutorial-subtitle">
                Three gauges run at the top of the screen at all times.
                Every decision you make in Alupotha moves them — sometimes visibly, sometimes not.
            </p>
            <div class="tutorial-gauges">
                <div class="tg-item">
                    <div class="tg-icon" style="color:var(--gold)">♦</div>
                    <div>
                        <div class="tg-name" style="color:var(--gold)">Civic Trust</div>
                        <div class="tg-desc">Does the community believe the election is worth participating in? Spread misinformation and it falls. Verify before you share and it rises. This is a <em>community</em> score — not just yours.</div>
                    </div>
                </div>
                <div class="tg-item">
                    <div class="tg-icon" style="color:var(--green)">✦</div>
                    <div>
                        <div class="tg-name" style="color:var(--green)">Information Health</div>
                        <div class="tg-desc">How accurate is your personal understanding of the electoral process? Accept false information and it falls. Check the Elections Commission board and it rises.</div>
                    </div>
                </div>
                <div class="tg-item">
                    <div class="tg-icon" style="color:var(--red)">▲</div>
                    <div>
                        <div class="tg-name" style="color:var(--red)">Voter Participation</div>
                        <div class="tg-desc">How many eligible people in Alupotha will actually vote? Helping others navigate the process raises this permanently. Some drops cannot be recovered.</div>
                    </div>
                </div>
            </div>
            <button class="tut-btn" onclick="dismissGaugeTutorial()">Understood — Enter Alupotha</button>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));
}

function dismissGaugeTutorial() {
    const overlay = document.getElementById('gauge-tutorial');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 400);
    }
    window.gameState.flags.gaugesTutorialSeen = true;
    saveGame();
}

function updateGauges(animate = true) {
    ['ct', 'ih', 'vp'].forEach(key => {
        const val = window.gameState.gauges[key];
        const fill = document.getElementById(`fill-${key}`);
        
        if (!fill) return; // Prevent crashes if UI isn't loaded yet
        
        if(!animate) {
            fill.style.transition = 'none';
            void fill.offsetWidth; // Force reflow so transition removal applies immediately
        }
        
        fill.style.width = `${val}%`;
        
        // Ensure static dataviz colors are consistently mapped to specific stats
        let colorVar = 'var(--text-muted)';
        if (key === 'ct') colorVar = 'var(--gold)';
        if (key === 'ih') colorVar = 'var(--green)';
        if (key === 'vp') colorVar = 'var(--red)';
        
        fill.style.backgroundColor = colorVar;
        
        document.getElementById(`aria-${key}`).setAttribute('aria-valuenow', val);
        document.getElementById(`val-${key}`).textContent = val;
        
        if(!animate) setTimeout(() => fill.style.transition = '', 50);
    });
}

// --- SAVE / LOAD ---
function saveGame() {
    localStorage.setItem('plv_save', JSON.stringify(window.gameState));
}

function loadGame() {
    const s = localStorage.getItem('plv_save');
    if (!s) return;
    window.gameState = JSON.parse(s);
    applyLanguage(true);
    updateGauges(false);
    checkMapUnlocks();
    
    document.getElementById('week-val').textContent = window.gameState.week || 6;
    showScreen('screen-game');
}

function checkContinueBtn() {
    const btn = document.getElementById('btn-continue');
    if (!btn) return;
    btn.disabled = !localStorage.getItem('plv_save');
}