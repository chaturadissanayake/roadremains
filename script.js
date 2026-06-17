// --- GLOBAL STATE ---
// Read global achievements on boot to prevent loss across sessions
let globalAchievements = [];
try {
    const storedAchs = localStorage.getItem('plv_achievements');
    if (storedAchs) globalAchievements = JSON.parse(storedAchs);
} catch(e) {}

window.gameState = {
    lang: 'en',
    screen: 'screen-loading',
    character: null,
    week: 6,
    gauges: { ct: 50, ih: 50, vp: 50 },
    flags: {
        // ── Core state ──────────────────────────────────────────
        visitedLocs: [],
        completedLocs: [], // scenes that fully resolved,  these are truly locked
        achievements: globalAchievements,
        endingReached: null,          // 'bad' | 'neutral' | 'good' | 'secret'
        secretEndingReached: false,

        // ── Uncle Sirisena messages ──────────────────────────────
        uncleMsgWeek6Delivered: false,
        uncleMsgWeek5Delivered: false,
        uncleMsgWeek4Delivered: false,
        uncleMsgWeek3Delivered: false,
        uncleMsgWeek2Delivered: false,
        uncleMsgWeek1Delivered: false,
        sharedFakeMessage_w6: false,
        sharedFakeVoicenote_w5: false,
        sharedFake4amMessage: false,  // Week 4 screenshot
        sharedFakeCandidateList: false,
        sharedFakeBallotFold: false,
        sharedAnyFakeMessage: false,
        uncleVisited: false,

        // ── Registration ─────────────────────────────────────────
        registrationStarted: false,
        registrationComplete: false,
        registrationDeadlineMissed: false,
        gremaOfficeVisited: false,
        verifiedAtBoardCount: 0,      // primary counter; also aliased as verifiedCount
        verifiedCount: 0,             // keep both,  some scenes use one or the other

        // ── Secrets & hidden content ─────────────────────────────
        foundRoadFile: false,
        found1977Receipt: false,
        foundOldManifesto: false,
        manifestoComparisonDone: false,
        foundSergeantTransferThread: false,
        heardAbout2016Road: false,
        foundSandyaNote: false,
        sandyaOnRegister: false,

        // ── Skeptics Cafe ─────────────────────────────────────────
        skepticsCafeUnlocked: false,
        joinedCafe: false,

        // ── Civic actions ─────────────────────────────────────────
        readCurrentManifesto: false,
        reportedIllegalPosters: false,
        reportedVoterIntimidation: false,
        verifiedBallotFold: false,
        willFoldInThirds: false,

        // ── Kamala wrong assumption ───────────────────────────────
        kamala_wrongAssumption_pollingStation: false,

        // ── Polling station helpers (Week 0) ─────────────────────
        helpedElderlyWoman: false,
        helpedNICYoungMan: false,
        helpedLostCouple: false,

        // ── Voting outcome ────────────────────────────────────────
        votedSuccessfully: false,
        ballotSpoiled: false,
        ballotWillBeSpoiled: false,

        // ── Clue delivery flags ───────────────────────────────────
        clue_roadFile_delivered: false,
        clue_manifesto_delivered: false,
        clue_cafe_delivered: false,

        // ── Character-specific counters ───────────────────────────
        karunasena_dismissedCount: 0,
        kamala_assumptionsCorrected: 0,
        kumaran_transferStepsComplete: 0,

        // ── Legacy flags (kept for compatibility) ─────────────────
        sharedFakeMessage: false,
        cameFromUncle: false,
        ignored: false,
        attendedHall: false,
        dismissedMessages: 0,
    },
    dialogue: { active: false, currentLine: 0, lines: [], choices: null },
    history: [],
    currentLoc: null
};

const CHAR_KEY = { Karunasena: 'k', Kamala: 'ka', Kumaran: 'ku' };

// Maps character ID → display key for CONTENT lookups
// safeCharId from promptCharacterConfirm will always be 'Karunasena', 'Kamala', or 'Kumaran'
const CHAR_GAUGES = {
    Karunasena: { ct: 60, ih: 70, vp: 50 },
    Kamala:     { ct: 75, ih: 65, vp: 65 },
    Kumaran:    { ct: 50, ih: 75, vp: 40 }
};

const ACHIEVEMENTS = {
    // ─── YOU STARTED. BRAVE ───────────────────────────────────────
    'big_mistake': {
        title: 'Big Mistake',
        desc: 'Started the game.',
        category: 'You Started. Brave.',
        hidden: false,
        notificationType: 'popup'
    },
    'democracy_they_said': {
        title: 'Democracy, They Said',
        desc: 'Selected a character and began your first playthrough.',
        category: 'You Started. Brave.',
        hidden: false,
        notificationType: 'silent'
    },
    // ─── YOU ARE LEARNING. SLOWLY ────────────────────────────────
    'read_the_fine_print': {
        title: 'Read the Fine Print',
        desc: 'Read Mahinda Bandara\'s manifesto. The whole thing.',
        category: 'You Are Learning.',
        hidden: false,
        notificationType: 'silent'
    },
    'actually_read_the_fine_print': {
        title: 'Actually Read the Fine Print',
        desc: 'Found and compared the 2010 manifesto to the current one. The road section was 94% identical.',
        category: 'You Are Learning.',
        hidden: false,
        notificationType: 'silent'
    },
    'the_algorithm_would_hate_you': {
        title: 'The Algorithm Would Hate You',
        desc: 'Verified a message at the Elections Commission board instead of sharing it immediately.',
        category: 'You Are Learning.',
        hidden: false,
        notificationType: 'silent'
    },
    'professional_skeptic': {
        title: 'Professional Skeptic',
        desc: 'Verified three or more messages in a single playthrough. Unlocked something.',
        category: 'You Are Learning.',
        hidden: false,
        notificationType: 'silent'
    },
    'nandadasa_approved': {
        title: 'Nandadasa Approved',
        desc: 'Asked Nandadasa Mahaththaya before acting on information. He was right. He is always right.',
        category: 'You Are Learning.',
        hidden: false,
        notificationType: 'silent'
    },
    // ─── YOU FOUND THINGS (4 are hidden until found) ─────────────
    'thirty_years_in_the_same_room': {
        title: 'Thirty Years in the Same Room',
        desc: 'Found the Road File. You know why the road is not fixed. It is not the reason you expected.',
        category: 'You Found Things.',
        hidden: true,
        notificationType: 'silent'
    },
    'pol_roti_and_politics': {
        title: 'Pol Roti and Politics',
        desc: 'Found the 1977 receipt behind Mudalali\'s counter. Political loyalty has stranger origins than you think.',
        category: 'You Found Things.',
        hidden: false,
        notificationType: 'silent'
    },
    'sandya_made_it': {
        title: 'Sandya Made It',
        desc: 'Followed Sandya\'s handwritten note from Week 3 to Week 0. Her name is on the register.',
        category: 'You Found Things.',
        hidden: false,
        notificationType: 'silent'
    },
    'somebody_had_to_ask': {
        title: 'Somebody Had to Ask',
        desc: 'Found the thread about Sergeant Wickramasinghe\'s 2016 transfer request. He still will not explain why.',
        category: 'You Found Things.',
        hidden: true,
        notificationType: 'silent'
    },
    'you_found_the_cafe': {
        title: 'You Found the Cafe',
        desc: 'Found the Skeptics Cafe. It does not have a sign. Nandadasa was invited once. He did not reply.',
        category: 'You Found Things.',
        hidden: true,
        notificationType: 'silent'
    },
    // ─── YOU HELPED PEOPLE ────────────────────────────────────────
    'not_your_job': {
        title: 'Not Your Job',
        desc: 'Helped the elderly woman find her name on the voter register. It was not your job. You did it anyway.',
        category: 'You Helped People.',
        hidden: false,
        notificationType: 'silent'
    },
    'at_least_someone_asked': {
        title: 'At Least Someone Asked',
        desc: 'Helped all three people in the polling station queue in a single playthrough. They noticed.',
        category: 'You Helped People.',
        hidden: false,
        notificationType: 'popup'
    },
    'it_spreads_both_ways': {
        title: 'It Spreads Both Ways',
        desc: 'Shared accurate, verified information through Uncle Sirisena\'s WhatsApp chain. It works in both directions.',
        category: 'You Helped People.',
        hidden: false,
        notificationType: 'silent'
    },
    // ─── YOU MADE THINGS WORSE ───────────────────────────────────
    '847_members': {
        title: '847 Members',
        desc: 'Shared a false message through Uncle Sirisena\'s WhatsApp group. 847 people received it.',
        category: 'You Made Things Worse.',
        hidden: false,
        notificationType: 'silent'
    },
    'you_were_so_confident': {
        title: 'You Were So Confident',
        desc: 'Acted on Mahinda Bandara\'s voting instructions without checking an official source. The fold was wrong.',
        category: 'You Made Things Worse.',
        hidden: false,
        notificationType: 'silent'
    },
    'the_4am_people': {
        title: 'The 4am People',
        desc: 'Shared the fake voting time message. Twenty-three people came at 4am. Nandadasa has heard about it.',
        category: 'You Made Things Worse.',
        hidden: false,
        notificationType: 'silent'
    },
    'blanket_policy': {
        title: 'Blanket Policy',
        desc: 'Ignored every single message Uncle Sirisena sent. Including the one that was true.',
        category: 'You Made Things Worse.',
        hidden: false,
        notificationType: 'silent'
    },
    // ─── YOU MISSED THINGS ────────────────────────────────────────
    'the_door_was_right_there': {
        title: 'The Door Was Right There',
        desc: 'Missed the voter registration deadline. The door to the Grama Sevaka Office was open every week.',
        category: 'You Missed Things.',
        hidden: false,
        notificationType: 'silent'
    },
    'the_road_remains': {
        title: 'The Road Remains',
        desc: 'Reached any ending. The road is still not fixed.',
        category: 'You Missed Things.',
        hidden: false,
        notificationType: 'silent'
    },
    // ─── YOU PLAYED WELL ─────────────────────────────────────────
    'information_health_100': {
        title: 'Information Health: 100',
        desc: 'Reached Week 0 with perfect Information Health. You verified everything. You trusted no one blindly. You trusted no one not at all.',
        category: 'You Played Well.',
        hidden: false,
        notificationType: 'silent'
    },
    'the_unbroken_chain': {
        title: 'The Unbroken Chain',
        desc: 'Found the secret ending. Aunty Soma\'s 1983 card. The road is still not fixed. She comes anyway.',
        category: 'You Played Well.',
        hidden: true,
        notificationType: 'popup'
    },
    'you_finished_an_education_game': {
        title: 'You Finished an Education Game',
        desc: 'Reached any ending. Voluntarily. Most people do not.',
        category: 'You Played Well.',
        hidden: false,
        notificationType: 'popup'
    },
    'three_perspectives': {
        title: 'Three Perspectives',
        desc: 'Completed at least one full playthrough with each of the three characters. You have seen Alupotha from every angle it has.',
        category: 'You Played Well.',
        hidden: false,
        notificationType: 'popup'
    },
    // ─── CHARACTER-SPECIFIC ───────────────────────────────────────
    'uncles_nephew': {
        title: 'Uncle\'s Nephew',
        desc: 'As Karunasena, dismissed more than 5 of Uncle Sirisena\'s messages. The family WhatsApp group still has 847 members.',
        category: 'Character',
        hidden: false,
        notificationType: 'silent'
    },
    'she_was_mostly_right': {
        title: 'She Was Mostly Right',
        desc: 'As Kamala, identified and corrected all of her false assumptions in a single playthrough.',
        category: 'Character',
        hidden: false,
        notificationType: 'silent'
    },
    'every_step_cost_more': {
        title: 'Every Step Cost More',
        desc: 'As Kumaran, completed every step of the district transfer process. The bilingual form. All of it.',
        category: 'Character',
        hidden: false,
        notificationType: 'silent'
    }
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
    _kbFocusedIndex = 0;
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
    if (id === 'screen-game') scaleMap();
}

// =============================================================================
// MAP SCALING,  Scales the 1920x1080 inner canvas to fit the viewport container.
// Uses transform: translate + scale so pixel coordinates from map-data.json
// remain accurate at any screen size. Called on load and on every resize.
// =============================================================================
function scaleMap() {
    // scaleGame() already scales the full 1920×1080 canvas to fit the viewport.
    // map-inner-wrap sits inside that canvas at native size; no further scaling needed.
    // The map container clips any overflow from the top bar eating into the 1080px height.
    const inner = document.getElementById('map-inner-wrap');
    if (!inner) return;
    inner.style.transform = 'translate(0px, 0px) scale(1)';
}

function scaleGame() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    const offsetX = (window.innerWidth  - 1920 * scale) / 2;
    const offsetY = (window.innerHeight - 1080 * scale) / 2;
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
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

    scaleGame();
    scaleMap();
    window.addEventListener('resize', () => { scaleGame(); scaleMap(); });

    // Modal Overlays (Backdrop click disabled for game stability,  use Escape or UI Close buttons)
    /* document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', (e) => {
            if(e.target === m) m.classList.remove('active');
        });
    }); */

    renderStaticText();
    checkContinueBtn();
    updateSettings(); // Initialize audio levels to match UI sliders
});

// --- I18N & CONTENT ---
const CONTENT = {
    en: {
        'title': 'Road Remains',
        'loading.tagline': 'An election is coming. Alupotha is not ready. Neither are you.',
        'loading.begin': 'Press anywhere to begin',
        'menu.subtitle': 'Alupotha is waiting.',
        'menu.play': 'Play',
        'menu.settings': 'Settings',
        'menu.about': 'About',
        'menu.credits': 'Credits',
        'menu.achievements': 'Achievements',
        'settings.music': 'Music Volume',
        'settings.sfx': 'Sound Effects',
        'ui.close': 'Close',
        'ui.back': 'Back to Menu',
        'char.header': 'Who are you?',
        'char.subheader': 'Choose carefully. You will carry their story.',
        'char.k.name': 'Karunasena', 'char.k.role': '19 years old · First-time voter · Arrived in Alupotha from Kurunegala last week', 'char.k.desc': "He is living with his uncle while attending a vocational training programme. He is not particularly political. He has opinions, but he is not sure yet where they come from. The WhatsApp group is not optional,  Uncle Sirisena is family.", 'char.k.btn': 'Play as Karunasena',
        'char.ka.name': 'Kamala', 'char.ka.role': '34 years old · School teacher · Has lived in Alupotha for eight years', 'char.ka.desc': 'She has voted in the last two elections and filled in her ballot the way she always had,  assuming she was doing it correctly. She was mostly right. Mostly. She knows almost everyone in Alupotha and most of them know her, which makes things easier. And occasionally more complicated.', 'char.ka.btn': 'Play as Kamala',
        'char.ku.name': 'Kumaran', 'char.ku.role': '28 years old · Migrant worker · Moved to Alupotha from the Northern Province two years ago', 'char.ku.desc': 'He came for work. He stayed for reasons that accumulated over two years and are now harder to name. His voter registration is in his home district. It needs to be transferred. The process involves more steps than it should, and some of those steps are in a language that is not his first. His story is harder. It is also more complete.', 'char.ku.btn': 'Play as Kumaran',
        'opening.btn': 'Enter Alupotha', 'opening.skip': 'Click anywhere to skip',
        'gauge.ct': 'Civic Trust', 'gauge.ih': 'Information Health', 'gauge.vp': 'Voter Participation', 'game.week': 'WEEK',
        'loc1.name': 'Grama Sevaka Office', 'loc2.name': "Uncle Sirisena's House", 'loc3.name': 'Elections Commission Notice Board', 'loc4.name': "Mudalali Perera's Boutique", 'loc5.name': 'Community Hall', 'loc6.name': 'Police Station', 'loc7.name': 'Skeptics Cafe', 'loc8.name': "Mahinda Bandara's Campaign Tent",
        'cons.heading': 'What happened.', 'cons.btn': 'Return to Alupotha',
        'menu.newgame': 'New Game', 'menu.continue': 'Continue',
        'settings.textsize': 'Text Size', 'settings.standard': 'Standard', 'settings.large': 'Large', 'settings.xlarge': 'Extra Large', 'settings.motion': 'Reduce Motion', 'settings.changelang': 'Change Language',
        'about.text': 'Road Remains is a civic education game set in the fictional Sri Lankan village of Alupotha, six weeks before an election. You play as a resident navigating voter registration, misinformation, and the quiet pressure of a community making up its mind. The game does not tell you who to vote for. That part is entirely yours. All characters, candidates, and political parties depicted are fictional.',
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
const htmlEl = document.getElementById('root-html');
if (lang === 'si') { htmlEl.lang = 'si'; htmlEl.dir = 'ltr'; }
else if (lang === 'ta') { htmlEl.lang = 'ta'; htmlEl.dir = 'ltr'; }
else { htmlEl.lang = 'en'; htmlEl.dir = 'ltr'; }
    applyLanguage();
    showScreen('screen-mainmenu');
}

function applyLanguage(reRender = true) {
    document.documentElement.lang = window.gameState.lang;
    document.body.className = document.body.className.replace(/lang-\w+/, '').trim();
    document.body.classList.add(`lang-${window.gameState.lang}`);
    if(reRender) renderStaticText();
}

function updateSettings(playSfxTest = false) {
    const size = document.getElementById('setting-textsize').value;
    document.body.classList.remove('text-large', 'text-xlarge');
    if (size === 'large') document.body.classList.add('text-large');
    if (size === 'xlarge') document.body.classList.add('text-xlarge');

    const motion = document.getElementById('setting-motion').checked;
    if (motion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');

    // Music volume
    const musicSlider = document.getElementById('setting-music');
    if (musicSlider) {
        const vol = parseInt(musicSlider.value) / 100;
        const musicEl = document.getElementById('bgm-player');
        if (musicEl) musicEl.volume = vol;
        const valEl = document.getElementById('val-music');
        if (valEl) valEl.textContent = musicSlider.value;
    }

    // SFX volume
    const sfxSlider = document.getElementById('setting-sfx');
    if (sfxSlider) {
        const vol = parseInt(sfxSlider.value) / 100;
        const sfxEl = document.getElementById('sfx-player');
        if (sfxEl) sfxEl.volume = vol;
        const valEl = document.getElementById('val-sfx');
        if (valEl) valEl.textContent = sfxSlider.value;
        
        if (playSfxTest && sfxEl) {
            playAudio('sfx', 'sfx_whatsapp_notification.wav');
        }
    }
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ── Cinematic Credits ────────────────────────────────────────────
(function() {
    let _creditsRaf = null;   // active requestAnimationFrame handle
    let _creditsPos = 0;      // current translateY in px (starts at +viewH, scrolls negative)

window.openCredits = function() {
    const screen = document.getElementById('screen-credits');
    const inner  = document.getElementById('credits-scroll-inner');
    if (!screen || !inner) return;

    // 1. Kill any running animation from a previous open
    if (_creditsRaf) {
        cancelAnimationFrame(_creditsRaf);
        _creditsRaf = null;
    }

    // 2. Show the screen,  must happen before measuring
    showScreen('screen-credits');

    // 3. Wait two frames so the screen is rendered and measurable
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const viewH  = 1080; // fixed canvas height
            const totalH = inner.scrollHeight; // padding: 324px top+bottom baked in

            // Start position: begin on-screen immediately so there's no waiting
            _creditsPos = 0;
            inner.style.transform = 'translateY(' + _creditsPos + 'px)';

            // End position: last card has scrolled fully off the top
            const endPos = -totalH;

            // Pace: 60px/s feels like proper game credits
            const pxPerMs = 60 / 1000;

            // Start animating much faster (100ms instead of 800ms)
            setTimeout(function() {
                let last = null;

                function tick(ts) {
                    if (!last) last = ts;
                    const delta = ts - last;
                    last = ts;

                    _creditsPos -= pxPerMs * delta;
                    inner.style.transform = 'translateY(' + _creditsPos + 'px)';

                    // Stop when the last card has cleared the top
                    if (_creditsPos > endPos) {
                        _creditsRaf = requestAnimationFrame(tick);
                    } else {
                        _creditsRaf = null;
                        
                        // Auto-close credits and return to menu after a short pause
                        setTimeout(closeCredits, 2500);
                    }
                }

                _creditsRaf = requestAnimationFrame(tick);
            }, 800);
        });
    });
};

window.closeCredits = function() {
    // Stop the scroll loop immediately so it freezes in place during fade-out
    if (_creditsRaf) {
        cancelAnimationFrame(_creditsRaf);
        _creditsRaf = null;
    }

    const prev = window.gameState._creditsReturnScreen || 'screen-mainmenu';
    window.gameState._creditsReturnScreen = null;
    showScreen(prev);

    // Delay resetting the position until the screen has completely faded out (600ms)
    setTimeout(() => {
        const inner = document.getElementById('credits-scroll-inner');
        if (inner) inner.style.transform = 'translateY(0)';
    }, 600);
};
})();

function toggleGaugeInfo(key) {
    ['ct','ih','vp'].forEach(k => {
        const tip = document.getElementById(`tooltip-${k}`);
        if (!tip) return;
        if (k === key) {
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

    if (earned.length === 0) {
        // Show 4 mystery locked dots,  never dump the full locked list
        const lockedCount = Math.min(Object.keys(ACHIEVEMENTS).length, 4);
        list.innerHTML = Array(lockedCount).fill(0).map(() =>
            `<div class="pause-ach-item">
                <div class="pause-ach-dot locked" aria-hidden="true">◇</div>
                <div><div class="pause-ach-name">???</div></div>
            </div>`
        ).join('');
        return;
    }

    // Only render EARNED achievements in the compact pause panel.
    // The full list (earned + locked) belongs on the dedicated Achievements screen.
    list.innerHTML = earned.map(id => {
        const ach = ACHIEVEMENTS[id];
        if (!ach) return '';
        const icon = ach.notificationType === 'popup' ? '◆' : '◈';
        return `
            <div class="pause-ach-item earned">
                <div class="pause-ach-dot" aria-hidden="true">${icon}</div>
                <div>
                    <div class="pause-ach-name">${ach.title}</div>
                    <div class="pause-ach-desc">${ach.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

function exitToMainMenu() {
    document.getElementById('overlay-pause').classList.remove('active');
    closeDialoguePanel(); // Ensure dialogue is closed if leaving mid-conversation
    // Only save mid-game progress,  never save after an ending (would resurrect a wiped save)
    if (!window.gameState.flags.endingReached) {
        saveGame();
    }
    window.showScreen('screen-mainmenu');
}

// ── Ending Screen ────────────────────────────────────────────────
// Call this when the game reaches a true ending (not a mid-game consequence).
// endingKey: 'bad' | 'neutral' | 'good' | 'secret'
// bodyText: the narrative paragraph to display
function showEnding(endingKey, bodyText) {
    const ENDING_LABELS = {
        bad:     'Bad Ending',
        neutral: 'Neutral Ending',
        good:    'Good Ending',
        secret:  'Secret Ending'
    };
    const ENDING_TITLES = {
        bad:     'The Road Remains',
        neutral: 'The Road Remains',
        good:    'The Road Remains',
        secret:  'The Unbroken Chain'
    };

    // Populate text
    document.getElementById('ending-label').textContent  = ENDING_LABELS[endingKey] || 'Ending';
    document.getElementById('ending-title').textContent  = ENDING_TITLES[endingKey] || 'The Road Remains';
    document.getElementById('ending-body').textContent   = bodyText || '';

    // Show final gauges with animated bars
    const g = window.gameState.gauges;
    ['ct','ih','vp'].forEach(key => {
        const val = Math.max(0, Math.min(100, Math.round(g[key])));
        document.getElementById('ending-val-' + key).textContent = val;
        const bar = document.getElementById('ending-bar-' + key);
        if (bar) {
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = val + '%'; }, 200);
        }
    });

    // Switch phase
    document.getElementById('cons-phase-choice').style.display  = 'none';
    document.getElementById('cons-phase-ending').style.display  = 'flex';
    document.getElementById('cons-phase-ending').style.flexDirection = 'column';

    // Show the consequence screen as the ending screen
    window.showScreen('screen-consequence');
    window.gameState.flags.endingReached = endingKey;
    saveGame();
}

// --- GAME FLOW ---
function selectCharacter(charId) {
    // Normalise: always store as capitalised (Karunasena / Kamala / Kumaran)
    const safeId = (charId === 'kumaran') ? 'Kumaran' : charId;
    window.gameState.character = safeId;
    window.gameState.gauges = { ...(CHAR_GAUGES[safeId] || { ct: 50, ih: 50, vp: 50 }) };
    // Fire first-play achievements
    unlockAchievement('big_mistake');
    // 'democracy_they_said' only fires on the very first ever playthrough
    try {
        if (!localStorage.getItem('plv_ever_played')) {
            localStorage.setItem('plv_ever_played', '1');
            unlockAchievement('democracy_they_said');
        }
    } catch(e) { /* localStorage unavailable */ }
    // saveGame() is already called inside unlockAchievement(),  no need to repeat here
    showScreen('screen-opening');
    startOpeningSequence();
}

const OPENING_LINES = {
    'Karunasena': [
        "Six weeks until election day.",
        "Alupotha is not a city. It is not a village. It is the kind of place most Sri Lankans either come from or pass through.",
        "There is a kovil on one side of the main road and a temple on the other. One traffic light. A bus that comes when it comes. Coconut trees everywhere, including in places where coconut trees probably should not be.",
        "An election is coming.",
        "You are Karunasena. You arrived last week. You do not know where anything is yet. Uncle Sirisena has already texted you three times.",
        "Welcome to Alupotha."
    ],
    'Kamala': [
        "Six weeks until election day.",
        "Alupotha is not a city. It is not a village. It is the kind of place most Sri Lankans either come from or pass through.",
        "There is a kovil on one side of the main road and a temple on the other. One traffic light. A bus that comes when it comes. Coconut trees everywhere, including in places where coconut trees probably should not be.",
        "An election is coming.",
        "You are Kamala. You have lived here for eight years. You know this town and it knows you. The last two elections, you voted. You think you did it correctly.",
        "Welcome to Alupotha."
    ],
    'Kumaran': [
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
        Karunasena: 'First time. Get it right.',
        Kamala: 'She thought she already knew.',
        Kumaran: 'Every form is a small obstacle.'
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
    // Do NOT call checkMapUnlocks() here,  it sets the objective bar text.
    // That text should only appear after the prologue ends (_afterPrologueReady handles this).
    scaleMap();

    // Mark prologue active,  hides objective bar and week-advance UI until map is shown
    document.getElementById('screen-game').classList.add('prologue-active');
    // Hide objective bar explicitly during prologue
    const objBar = document.getElementById('objective-bar');
    if (objBar) objBar.style.opacity = '0';

    // Load and show the prologue scene, then enter the map
    fetch('scenes/prologue.json')
        .then(r => r.ok ? r.json() : Promise.reject('prologue not found'))
        .then(sceneData => {
            // Override on_complete so after prologue it goes to the game map, not character select
            sceneData.on_complete = { goto: 'screen_map' };
            const charBgMap = {
                'Karunasena': 'bg_prologue_k',
                'Kamala': 'bg_prologue_ka',
                'Kumaran': 'bg_prologue_ku'
            };
            sceneData.background = charBgMap[window.gameState.character];
            renderDialogue(sceneData);
        })
        .catch(() => {
            // Prologue file missing,  continue silently to the map
            console.warn('[PLV] prologue.json not found,  skipping intro scene.');
            _afterPrologueReady();
        });
}

function _afterPrologueReady() {
    // Called when prologue ends (or is skipped),  reveal objective bar and unblock map UI
    document.getElementById('screen-game').classList.remove('prologue-active');
    const objBar = document.getElementById('objective-bar');
    if (objBar) {
        objBar.style.transition = 'opacity 800ms ease';
        objBar.style.opacity = '1';
    }
    checkMapUnlocks(); // Re-evaluate so objective text is fresh for Week 6
}

function unlockAchievement(id) {
    if (!Array.isArray(window.gameState.flags.achievements)) {
        window.gameState.flags.achievements = [];
    }
    if (window.gameState.flags.achievements.includes(id)) return;
    window.gameState.flags.achievements.push(id);
    
    // Persist globally outside of standard volatile save file
    try {
        localStorage.setItem('plv_achievements', JSON.stringify(window.gameState.flags.achievements));
    } catch(e) {}

    saveGame();

    const a = ACHIEVEMENTS[id];
    if (!a) return;

    // Only show a popup for achievements marked 'popup'; silent ones are discovered on the Achievements screen
    const showPopup = a.notificationType === 'popup';

    if (showPopup) {
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
        (document.getElementById('game-canvas') || document.body).appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('visible'));
        });
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 600);
        }, 4500);
    }
    // Always update achievements screen counter if it's open
    _updateAchievementCounter();
}

function _updateAchievementCounter() {
    const el = document.getElementById('ach-counter');
    if (!el) return;
    const earned = (window.gameState.flags.achievements || []).length;
    const total = Object.keys(ACHIEVEMENTS).length;
    el.textContent = `${earned} / ${total} Unlocked`;
}

function showAchievementsScreen() {
    renderAchievementsScreen();
    showScreen('screen-achievements');
}

function renderAchievementsScreen() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    const earned = window.gameState.flags.achievements || [];

    // Group achievements by category
    const categories = {};
    Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
        const cat = ach.category || 'Other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ id, ...ach, isEarned: earned.includes(id) });
    });

    let html = '';
    Object.entries(categories).forEach(([cat, achs]) => {
        html += `<div class="ach-category-header">${cat}</div>`;
        achs.forEach(ach => {
            const isHiddenLocked = ach.hidden && !ach.isEarned;
            html += `
                <div class="ach-tile ${ach.isEarned ? 'earned' : ''} ${isHiddenLocked ? 'hidden-tile' : ''}">
                    <div class="ach-tile-dot"></div>
                    <div class="ach-tile-body">
                        <div class="ach-tile-name">${isHiddenLocked ? '???' : ach.title}</div>
                        <div class="ach-tile-desc">${ach.isEarned ? ach.desc : (isHiddenLocked ? '' : '—')}</div>
                    </div>
                </div>
            `;
        });
    });

    grid.innerHTML = html;
    _updateAchievementCounter();
}

function showWeekBanner(week, isDeadline = false) {
    const existing = document.getElementById('week-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.id = 'week-banner';
    banner.innerHTML = isDeadline
        ? `<strong>Week ${week}</strong>Voter registration closes this week. If you are not registered, you cannot vote.`
        : week === 0
            ? `<strong>Election Day.</strong>The polling station is open. Go and vote.`
            : `<strong>Week ${week}</strong>${week === 1 ? '1 week' : week + ' weeks'} until the election.`;
    document.getElementById('screen-game').appendChild(banner);
    setTimeout(() => banner.classList.add('visible'), 30);
    setTimeout(() => { banner.classList.remove('visible'); setTimeout(() => banner.remove(), 400); }, 4000);
}

function checkMapUnlocks() {
    // Skeptics Cafe,  hidden until verifiedCount >= 3
    const cafe = document.querySelector('[data-loc="loc7"]');
    if (cafe) {
        const shouldShow = window.gameState.flags.skepticsCafeUnlocked
            || (window.gameState.flags.verifiedCount >= 3);
        if (shouldShow) {
            cafe.classList.add('unlocked');
            if (!window.gameState.flags.skepticsCafeUnlocked) {
                // First time unlocking,  fire the discovery achievement
                unlockAchievement('you_found_the_cafe');
            }
            window.gameState.flags.skepticsCafeUnlocked = true; // persist the unlock
        } else {
            cafe.classList.remove('unlocked');
        }
    }
    // Community Hall (loc5),  always visible but has no active content currently
    // Polling station (loc9) locked until week 0,  handled in advanceWeek()

    const week = window.gameState.week;
    const flags = window.gameState.flags;
    const char = window.gameState.character;
    const visited = flags.visitedLocs || [];
    const completed = flags.completedLocs || [];
    const isVisited = (pathMatch) => visited.some(p => p.includes(pathMatch)) || completed.some(p => p.includes(pathMatch));

    // Dynamic state checks since JSONs don't explicitly set "Resolved" boolean flags
    const w6UncleDone = isVisited('uncle_house_entry') || isVisited('uncle_house_shared') || isVisited('uncle_house_ignore') || isVisited('uncle_house_verify') || isVisited('ec_board_w6');
    const w5UncleDone = isVisited('uncle_house_w5_shared') || isVisited('uncle_house_w5_verify') || isVisited('ec_board_w5');
    const w4UncleDone = isVisited('uncle_house_w4_shared') || isVisited('ec_board_w4');

    // Glitch Fix: Determine if the week is complete so we can stop map pulses
    let weekComplete = false;
    if (week === 6) {
        const w6GramaDone = flags.registrationStarted || isVisited('grama_office_w6_Kamala') || isVisited('grama_office_w6_kumaran') || isVisited('grama_office_w6') || isVisited('week6/grama_office');
        weekComplete = (char === 'Karunasena') ? (w6UncleDone && w6GramaDone) : w6GramaDone;
    } else if (week === 5) {
        const w5MainDone = isVisited('ec_board_w5') || isVisited('police_w5'); // Boutique is optional,  not a completion trigger
        weekComplete = (char === 'Karunasena') ? (w5UncleDone && w5MainDone) : w5MainDone;
    } else if (week === 4) {
        const w4GramaDone = flags.registrationComplete || flags.registrationDeadlineMissed;
        weekComplete = (char === 'Karunasena') ? (w4UncleDone && w4GramaDone) : w4GramaDone;
    } else if (week === 3) {
        weekComplete = isVisited('ec_board_w3'); // EC board (candidate list) is mandatory; cafe is optional bonus
    } else if (week === 2) {
        weekComplete = isVisited('campaign_tent') || flags.readCurrentManifesto;
    } else if (week === 1) {
        const w1MainDone = flags.verifiedBallotFold || isVisited('police_w1') || isVisited('grama_office_w1');
        const w1UncleDone = isVisited('uncle_house_w1_shared') || w1MainDone;
        weekComplete = (char === 'Karunasena') ? (w1UncleDone && w1MainDone) : w1MainDone;
    }

    const OBJECTIVES = {
        6: (() => {
            // For Karunasena: uncle must be resolved first, then grama
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek6Delivered) return "Visit Uncle Sirisena's house. He sent you something.";
                if (!w6UncleDone) return "You have a message from Uncle Sirisena. Decide what to do with it.";
                if (!flags.registrationStarted && !flags.registrationComplete && !isVisited('grama_office_w6')) return "Head to the Grama Sevaka Office to check your voter registration.";
                return "You are registered. Explore Alupotha if you like, or advance to the next week.";
            }
            // Kamala / Kumaran
            if (!flags.registrationStarted && !flags.registrationComplete) return "Head to the Grama Sevaka Office to check your voter registration.";
            return "You have checked your registration. Explore Alupotha or advance to the next week.";
        })(),
        5: (char === 'Karunasena' && !flags.uncleMsgWeek5Delivered)
            ? "A voice note is circulating. Uncle Sirisena has it."
            : (char === 'Karunasena' && !w5UncleDone)
                ? "The voice note is unchecked. Visit the EC board to verify the claim."
                : "Explore Alupotha. Check the EC board or Police Station.",
        4: (() => {
            if (!flags.registrationComplete && !flags.registrationDeadlineMissed) return "Voter registration closes this week. Go to the Grama Sevaka Office.";
            if (char === 'Karunasena' && !flags.uncleMsgWeek4Delivered) return "A suspicious screenshot is circulating. Visit Uncle Sirisena.";
            if (char === 'Karunasena' && !w4UncleDone) return "You have a screenshot from Uncle Sirisena. Check the EC board before deciding.";
            if (!isVisited('ec_board_w4')) return "A suspicious screenshot is circulating. Verify it at the EC notice board.";
            return "You have investigated the screenshot. Explore or advance to the next week.";
        })(),
        3: flags.verifiedAtBoardCount >= 2
            ? "You have seen the candidate list. Explore what else is happening."
            : "The official candidate list has been posted. Check the EC notice board.",
        2: flags.readCurrentManifesto
            ? "You have read the manifesto. Explore further or advance to the next week." // Note: weekComplete=true overrides this anyway
            : "Mahinda Bandara's campaign tent is open. Read the manifesto.",
        1: flags.verifiedBallotFold
            ? "You are ready. Election day is tomorrow."
            : "There is a message about how to fold your ballot. Verify it first.",
        0: "Election day. Go to the polling station."
    };

    const guidanceText = document.getElementById('objective-text');
    if (guidanceText) {
        // Glitch Fix: Override objective text if the week is completely done
        if (weekComplete && week > 0) {
            guidanceText.textContent = "You have completed your tasks. Advance to the next week.";
        } else {
            guidanceText.textContent = OBJECTIVES[week] || "Continue exploring Alupotha.";
        }
    }

    // Character-aware pulse logic
    let pulseTarget = null;
    
    // Glitch Fix: Only pulse map locations if the week is NOT yet complete
    if (!weekComplete) {
        if (week === 6) {
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek6Delivered) pulseTarget = 'loc2';
                else if (!w6UncleDone) pulseTarget = 'loc2';
                else if (!flags.registrationStarted) pulseTarget = 'loc1';
                else pulseTarget = 'loc3';
            } else {
                if (!flags.registrationStarted && !flags.registrationComplete && !isVisited('grama_office')) pulseTarget = 'loc1';
                // No else: after registration, weekComplete=true so no pulse needed
            }
        } else if (week === 5) {
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek5Delivered) pulseTarget = 'loc2';
                else if (!w5UncleDone) pulseTarget = 'loc3'; // loc2 is inactive after delivery; player must verify at EC board
                else pulseTarget = 'loc3';
            } else {
                pulseTarget = 'loc3';
            }
        } else if (week === 4) {
            if (!flags.registrationComplete && !flags.registrationDeadlineMissed) pulseTarget = 'loc1';
            else if (char === 'Karunasena' && !w4UncleDone) pulseTarget = 'loc3'; // loc2 is inactive after delivery; player must verify at EC board
            else pulseTarget = 'loc3';
        } else if (week === 3) {
            if (char === 'Kumaran' && flags.kumaran_transferStepsComplete === 2 && !flags.registrationComplete) pulseTarget = 'loc1';
            else pulseTarget = 'loc3';
        } else if (week === 2) {
            if (!flags.readCurrentManifesto) pulseTarget = 'loc8';
            // No else: once manifesto is read, weekComplete=true and this block won't run anyway
        } else if (week === 1) {
            if (!flags.verifiedBallotFold) pulseTarget = 'loc6';
            // No else: verifiedBallotFold=true means weekComplete=true; this block won't run
        }
    }

    // Always pulse polling station on week 0
    if (week === 0) {
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
    const flags = window.gameState.flags;
    const char = window.gameState.character;
    const visited = flags.visitedLocs || [];
    const completed = flags.completedLocs || [];
    
    // WEEK 0 FIX: Step completely out of the way. 
    // Let polling_vote_valid.json route to ending_good.json natively.
    if (week === 0) return; 
    
    const isVisited = (pathMatch) => visited.some(p => p.includes(pathMatch)) || completed.some(p => p.includes(pathMatch));
    
    const w6UncleDone = isVisited('uncle_house_entry') || isVisited('uncle_house_shared') || isVisited('uncle_house_ignore') || isVisited('uncle_house_verify') || isVisited('ec_board_w6');
    const w5UncleDone = isVisited('uncle_house_w5_shared') || isVisited('uncle_house_w5_verify') || isVisited('ec_board_w5');
    const w4UncleDone = isVisited('uncle_house_w4_shared') || isVisited('ec_board_w4');
    
    let weekComplete = false;
    
    if (week === 6) {
        const w6GramaDone = flags.registrationStarted || isVisited('grama_office_w6_Kamala') || isVisited('grama_office_w6_kumaran') || isVisited('grama_office_w6') || isVisited('week6/grama_office');
        weekComplete = (char === 'Karunasena') ? (w6UncleDone && w6GramaDone) : w6GramaDone;
    } else if (week === 5) {
        const w5MainDone = isVisited('ec_board_w5') || isVisited('police_w5'); // Boutique is optional
        weekComplete = (char === 'Karunasena') ? (w5UncleDone && w5MainDone) : w5MainDone;
    } else if (week === 4) {
        const w4GramaDone = flags.registrationComplete || flags.registrationDeadlineMissed;
        weekComplete = (char === 'Karunasena') ? (w4UncleDone && w4GramaDone) : w4GramaDone;
    } else if (week === 3) {
        weekComplete = isVisited('ec_board_w3'); // EC board is mandatory
    } else if (week === 2) {
        weekComplete = isVisited('campaign_tent') || flags.readCurrentManifesto;
    } else if (week === 1) {
        const w1MainDone = flags.verifiedBallotFold || isVisited('police_w1') || isVisited('grama_office_w1');
        const w1UncleDone = isVisited('uncle_house_w1_shared') || w1MainDone;
        weekComplete = (char === 'Karunasena') ? (w1UncleDone && w1MainDone) : w1MainDone;
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
        position: absolute; bottom: 0; left: 0; right: 0;
        z-index: 18;
    `;
    const isElectionDay = (nextWeek === 0);
    const eyebrow  = isElectionDay ? 'Election Day' : `Week ${currentWeek} Complete`;
    const headline = isElectionDay
        ? 'The polling station is now open.'
        : `${nextWeek} week${nextWeek === 1 ? '' : 's'} until election day.`;
    const advanceLbl = isElectionDay ? 'Go to Polling Station' : `Continue to Week ${nextWeek}`;
    const stayLbl = isElectionDay ? 'Not yet' : 'Stay &amp; Explore';
    banner.innerHTML = `
        <div class="week-banner-left">
            <div class="week-banner-eyebrow">${eyebrow}</div>
            <div class="week-banner-headline">${headline}</div>
        </div>
        <div class="week-banner-actions">
            <button class="week-banner-stay" onclick="dismissWeekBanner()">${stayLbl}</button>
            <button class="week-banner-advance" onclick="advanceWeek()">${advanceLbl}</button>
        </div>
    `;
    document.getElementById('screen-game').appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('visible')));
}

function dismissWeekBanner() {
    const banner = document.getElementById('next-week-banner');
    if (banner) {
        banner.style.transition = 'opacity 300ms';
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.remove();
            checkMapUnlocks(); // Re-evaluate pulse state after banner is dismissed
        }, 300);
    }
}

function advanceWeek() {
    // Safety re-check: only allow advance if the current week is genuinely complete
    // This prevents the banner from advancing the week if it appeared prematurely
    const _safetyWeek = window.gameState.week;
    const _flags = window.gameState.flags;
    const _char = window.gameState.character;
    const _visited = _flags.visitedLocs || [];
    const _completed = _flags.completedLocs || [];
    const _isV = (m) => _visited.some(p => p.includes(m)) || _completed.some(p => p.includes(m));
    let _canAdvance = false;
    if (_safetyWeek === 6) { const d = _flags.registrationStarted || _isV('grama_office_w6_Kamala') || _isV('grama_office_w6_kumaran') || _isV('grama_office_w6') || _isV('week6/grama_office'); _canAdvance = (_char === 'Karunasena') ? ((_isV('uncle_house_entry') || _isV('uncle_house_shared') || _isV('uncle_house_ignore') || _isV('uncle_house_verify') || _isV('ec_board_w6')) && d) : d; }
    else if (_safetyWeek === 5) { const d = _isV('ec_board_w5') || _isV('police_w5'); _canAdvance = (_char === 'Karunasena') ? ((_isV('uncle_house_w5_shared') || _isV('uncle_house_w5_verify') || _isV('ec_board_w5')) && d) : d; }
    else if (_safetyWeek === 4) { const d = _flags.registrationComplete || _flags.registrationDeadlineMissed; _canAdvance = (_char === 'Karunasena') ? ((_isV('uncle_house_w4_shared') || _isV('ec_board_w4')) && d) : d; }
    else if (_safetyWeek === 3) { _canAdvance = _isV('ec_board_w3'); } // Must match checkWeekCompletion,  cafe alone is not enough
    else if (_safetyWeek === 2) { _canAdvance = _isV('campaign_tent') || _flags.readCurrentManifesto; }
    else if (_safetyWeek === 1) { const d = _flags.verifiedBallotFold || _isV('police_w1') || _isV('grama_office_w1'); _canAdvance = (_char === 'Karunasena') ? ((_isV('uncle_house_w1_shared') || d) && d) : d; }
    else { _canAdvance = true; } // week 0 or unknown
    if (!_canAdvance) { console.warn('[PLV] advanceWeek blocked,  week not yet complete.'); return; }

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
        if (ps9) {
            ps9.classList.add('polling-unlocked');
            ps9.style.opacity = '1';
            ps9.style.pointerEvents = 'auto';
        }
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
            if (char === 'Kamala') targetSceneId = 'w6_grama_office_Kamala';
            else if (char === 'Kumaran') targetSceneId = 'w6_grama_office_kumaran';
            else targetSceneId = 'w6_grama_office';
        }
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek6Delivered ? 'w6_uncle_ignore' : 'w6_uncle_entry';
        else if (locId === 'loc3') targetSceneId = 'w6_ec_board_verify';
        else if (locId === 'loc4') targetSceneId = 'w6_boutique_optional';
    }
    else if (week === 5) {
        if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek5Delivered ? null : 'w5_uncle_voicenote';
        else if (locId === 'loc3') targetSceneId = 'w5_ec_board_verify';
        else if (locId === 'loc4') targetSceneId = 'w5_boutique';
        else if (locId === 'loc6') targetSceneId = 'w5_police_optional';
    }
    else if (week === 4) {
        if (locId === 'loc1') {
            if (char === 'Kumaran' && flags.kumaran_transferStepsComplete === 1) targetSceneId = 'w4_kumaran_transfer_step2';
            else targetSceneId = flags.registrationDeadlineMissed ? 'w4_registration_deadline_missed' : 'w4_grama_office';
        }
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek4Delivered ? null : 'w4_uncle_screenshot';
        else if (locId === 'loc3') targetSceneId = 'w4_ec_board_verify';
        else if (locId === 'loc6') targetSceneId = 'w4_police';
    }
    else if (week === 3) {
        if (locId === 'loc1') targetSceneId = (char === 'Kumaran' && flags.kumaran_transferStepsComplete === 2) ? 'w3_kumaran_transfer_step3' : 'w3_grama_office';
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek3Delivered ? null : 'w3_uncle_videoclip';
        else if (locId === 'loc3') targetSceneId = 'w3_ec_board_candidates';
        else if (locId === 'loc4') targetSceneId = 'w3_boutique';
        else if (locId === 'loc6') targetSceneId = 'w3_police';
        else if (locId === 'loc7') targetSceneId = 'w3_skeptics_cafe';
        // loc8 (Campaign Tent) has no content in Week 3,  return null so openLocation shows the fallback narration
        // else if (locId === 'loc8') targetSceneId = 'w3_map'; 
    }
    else if (week === 2) {
        if (locId === 'loc3') targetSceneId = 'w2_ec_board';
        else if (locId === 'loc4') targetSceneId = 'w2_boutique';
        else if (locId === 'loc6') targetSceneId = 'w2_police';
        else if (locId === 'loc8') targetSceneId = 'w2_campaign_tent_entry';
        // loc1, loc2, loc5 intentionally return null,  fallback narration handles them
    }
    else if (week === 1) {
        if (locId === 'loc1') targetSceneId = 'w1_grama_final';
        else if (locId === 'loc2') targetSceneId = flags.uncleMsgWeek1Delivered ? null : 'w1_uncle_ballotfold';
        else if (locId === 'loc3') targetSceneId = 'w1_ec_board';
        else if (locId === 'loc6') targetSceneId = 'w1_police_ballotfold_verify';
        else if (locId === 'loc8') targetSceneId = 'w1_campaign_tent_readonly';
    }
    else if (week === 0) {
        if (locId === 'loc9') targetSceneId = (char === 'Kumaran') ? 'w0_kumaran_polling' : 'w0_polling_arrival';
    }

    if (!targetSceneId) return null;
    return _sceneIdToPath(targetSceneId);
}

function openLocation(locId) {
    window.gameState.currentLoc = locId;

    // Community Hall (loc5) has no active scenes in any week currently
    if (locId === 'loc5') {
        renderDialogue({
            lines: [
                { type: "narration", text: "The Community Hall is quiet. There is a notice on the door about an event next week, but nothing is happening here today." }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    // Kovil and Temple are decorative,  give atmospheric flavour instead of dead silence
    if (locId === 'loc_kovil') {
        renderDialogue({
            lines: [
                { type: "narration", text: "The kovil is peaceful. Incense smoke drifts past the entrance. Whatever you came here for, it is not here." }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    if (locId === 'loc_temple') {
        renderDialogue({
            lines: [
                { type: "narration", text: "The temple is peaceful. Leaves rustle in the courtyard. Whatever you came here for, it is not here." }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    if (locId === 'loc_bar') {
        renderDialogue({
            lines: [
                { type: "narration", text: "The bar is quiet this time of day. A ceiling fan turns slowly overhead. Someone has left a newspaper on the counter. It is three days old. There is a handwritten sign near the door: 'No election talk. Owner's orders.'" }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }

    if (locId === 'loc_boarding') {
        if (window.gameState.character !== 'Kumaran') {
            renderDialogue({
                lines: [
                    { type: "narration", text: "This is a boarding house. You have no reason to go in." }
                ],
                on_complete: { goto: "screen_map" }
            });
            return;
        }
        renderDialogue({
            lines: [
                { type: "narration", text: "This is where you stay. A small room at the end of the corridor. The landlady has left a note on the door about the water being cut off tomorrow morning. There is a form on your desk you have not filled in yet." }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    
    const path = getScenePath(locId);
    
    // Only block re-entry if the scene fully completed,  not just visited
    if (!Array.isArray(window.gameState.flags.completedLocs)) {
        window.gameState.flags.completedLocs = [];
    }
    const isFullyCompleted = path && window.gameState.flags.completedLocs.includes(path);
    
    // Intercept map returns and fully-completed scenes before attempting to fetch
    if (!path || path.endsWith('_map') || path === 'screen_map' || isFullyCompleted) {
        let fallbackText = "Nothing new is happening here right now. You should check elsewhere.";
        if (locId === 'loc2') fallbackText = "Uncle Sirisena is not answering the door right now. He is probably busy on WhatsApp.";
        
        renderDialogue({
            lines: [
                { type: "narration", text: fallbackText }
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

    // Block re-entry only if scene fully completed (not just visited,  interrupted visits allow re-entry)
    if (!Array.isArray(window.gameState.flags.completedLocs)) {
        window.gameState.flags.completedLocs = [];
    }
    if (window.gameState.flags.completedLocs.includes(scenePath)) {
        renderDialogue({
            lines: [
                { type: "narration", text: "Nothing new is happening here right now. You should check elsewhere.", advance: "choice" },
                { type: "choice", prompt: " ", choices: [{ label: "Return to Map", goto: "screen_map" }] }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
    // If only visited (not completed), remove from visitedLocs so it can be fetched fresh
    const vIdx = window.gameState.flags.visitedLocs.indexOf(scenePath);
    if (vIdx !== -1) window.gameState.flags.visitedLocs.splice(vIdx, 1);

    try {
        const response = await fetch(scenePath);
        if (!response.ok) throw new Error(`Scene not found: ${scenePath}`);
        const sceneData = await response.json();
        // Only mark as visited AFTER confirming the scene loaded successfully
        window.gameState.flags.visitedLocs.push(scenePath);
        window.gameState._pendingScenePath = scenePath; // track for completedLocs
        renderDialogue(sceneData);
    } catch (error) {
            console.warn('[PLV] Scene load failed:', error.message);
            // Still mark as visited so week-completion checks pass even if the JSON file is missing
            if (!window.gameState.flags.visitedLocs.includes(scenePath)) {
                window.gameState.flags.visitedLocs.push(scenePath);
            }
            if (!window.gameState.flags.completedLocs.includes(scenePath)) {
                window.gameState.flags.completedLocs.push(scenePath);
            }
            saveGame();
            checkWeekCompletion();
            checkMapUnlocks();

            // CRITICAL FIX: If Week 0 polling JSON is missing, force the ending instead of getting stuck
            if (window.gameState.week === 0 && (scenePath.includes('polling') || scenePath.includes('w0'))) {
                triggerEnding();
                return;
            }

            // Friendly fallback,  not an error message, just a quiet dead end
            renderDialogue({
                lines: [
                    {
                        type: "narration",
                        text: "Nothing seems to be happening here right now. Alupotha is a small town,  there is only so much to see in a day."
                    }
                ],
                on_complete: { goto: "screen_map" }
            });
        }
} // closes openScenePath

// =============================================================================
// DIALOGUE ENGINE v2,  Aligned to Master Scene File schema
// Every scene JSON uses: lines[], on_complete{goto|conditional|week_set}
// Line types: dialogue, narration, whatsapp, voicenote, screenshot, notice,
//             document, comparison, video, choice, stats
// =============================================================================

// =============================================================================
// ASSET REGISTRY,  All asset paths in one place.
// When artwork is created, place the file at the path listed here.
// The game engine reads these constants,  nothing else needs to change.
// File naming convention from production spec (Complete_Production_File_Structure_v2.txt)
// =============================================================================

// ─── PLAYABLE CHARACTER PORTRAITS ────────────────────────────────────────────
// Format: PNG with transparency, 450×660px, transparent background
// States: neutral, talking, happy, worried, surprised
// NOTE: Production file used 'Atakatus'/'Imali' as internal names.
//       Canonical GDD v2.0 names are Karunasena/Kamala/Kumaran,  use these.
const CHARACTER_PORTRAITS = {
    'Karunasena': {
        neutral:   'assets/characters/char_Karunasena_neutral.png',
        talking:   'assets/characters/char_Karunasena_talking.png',
        happy:     'assets/characters/char_Karunasena_happy.png',
        worried:   'assets/characters/char_Karunasena_worried.png',
        surprised: 'assets/characters/char_Karunasena_surprised.png',
    },
    'Kamala': {
        neutral:   'assets/characters/char_Kamala_neutral.png',
        talking:   'assets/characters/char_Kamala_talking.png',
        happy:     'assets/characters/char_Kamala_happy.png',
        worried:   'assets/characters/char_Kamala_worried.png',
        surprised: 'assets/characters/char_Kamala_surprised.png',
    },
    'Kumaran': {
        neutral:   'assets/characters/char_kumaran_neutral.png',
        talking:   'assets/characters/char_kumaran_talking.png',
        happy:     'assets/characters/char_kumaran_happy.png',
        worried:   'assets/characters/char_kumaran_worried.png',
        surprised: 'assets/characters/char_kumaran_surprised.png',
    }
};

// ─── NPC PORTRAITS ───────────────────────────────────────────────────────────
// Format: PNG with transparency
// Naming: npc_{character}_{state}.png → stored in assets/npcs/
// These keys are used in scene JSON files as: "portrait": "npc_uncle_enthusiastic"
const NPC_PORTRAITS = {
    // Aunty Soma,  prologue + endings
    'npc_soma_neutral':          'assets/npcs/npc_soma_neutral.png',
    'npc_soma_talking':          'assets/npcs/npc_soma_talking.png',
    'npc_soma_warm':             'assets/npcs/npc_soma_warm.png',
    // Uncle Sirisena,  Uncle's House, WhatsApp messages
    'npc_uncle_neutral':         'assets/npcs/npc_uncle_neutral.png',
    'npc_uncle_talking':         'assets/npcs/npc_uncle_talking.png',
    'npc_uncle_enthusiastic':    'assets/npcs/npc_uncle_enthusiastic.png',
    // Nandadasa Mahaththaya,  Grama Sevaka Office
    'npc_nandadasa_neutral':     'assets/npcs/npc_nandadasa_neutral.png',
    'npc_nandadasa_talking':     'assets/npcs/npc_nandadasa_talking.png',
    'npc_nandadasa_annoyed':     'assets/npcs/npc_nandadasa_annoyed.png',
    // Sergeant Wickramasinghe,  Police Station
    'npc_sergeant_neutral':      'assets/npcs/npc_sergeant_neutral.png',
    'npc_sergeant_talking':      'assets/npcs/npc_sergeant_talking.png',
    'npc_sergeant_amused':       'assets/npcs/npc_sergeant_amused.png',
    // Mudalali Perera,  Boutique
    'npc_mudalali_neutral':      'assets/npcs/npc_mudalali_neutral.png',
    'npc_mudalali_talking':      'assets/npcs/npc_mudalali_talking.png',
    'npc_mudalali_loud':         'assets/npcs/npc_mudalali_loud.png',
    // Mahinda Bandara,  Campaign Tent
    'npc_mahinda_neutral':       'assets/npcs/npc_mahinda_neutral.png',
    'npc_mahinda_talking':       'assets/npcs/npc_mahinda_talking.png',
    'npc_mahinda_evasive':       'assets/npcs/npc_mahinda_evasive.png',
    // Elderly Woman,  Polling Station queue (Week 0)
    'npc_elderly_neutral':       'assets/npcs/npc_elderly_neutral.png',
    'npc_elderly_confused':      'assets/npcs/npc_elderly_confused.png',
    'npc_elderly_relieved':      'assets/npcs/npc_elderly_relieved.png',
};

// ─── BACKGROUND SCENES ───────────────────────────────────────────────────────
// Format: JPEG, 1920×1080px
// These are already used in LOC_BGS and BG_MAP below,  listed here for reference
const BACKGROUND_assets = {
    'bg_loading':         'assets/backgrounds/bg_loading.webp',
    'bg_language':        'assets/backgrounds/bg_language.webp',
    'bg_main_menu':       'assets/backgrounds/bg_main_menu.png',   // PNG,  uses transparency layer
    'bg_char_select':     'assets/backgrounds/bg_char_select.webp',
    'bg_opening':         'assets/backgrounds/bg_opening.webp',
    'bg_consequence':     'assets/backgrounds/bg_consequence.webp',
    'bg_uncle_house':     'assets/backgrounds/bg_uncle_house.webp',
    'bg_grama_office':    'assets/backgrounds/bg_grama_office.webp',
    'bg_boutique':        'assets/backgrounds/bg_boutique.webp',
    'bg_police':          'assets/backgrounds/bg_police.webp',
    'bg_campaign_tent':   'assets/backgrounds/bg_campaign_tent.webp',
    'bg_ec_board':        'assets/backgrounds/bg_ec_board.webp',
    'bg_polling_station': 'assets/backgrounds/bg_polling_station.webp',
    'bg_skeptics_cafe':   'assets/backgrounds/bg_skeptics_cafe.webp',
    'bg_ending_positive': 'assets/backgrounds/bg_ending_positive.webp',
    'bg_ending_negative': 'assets/backgrounds/bg_ending_negative.webp',
    'bg_ending_neutral':  'assets/backgrounds/bg_ending_neutral.webp',
    'bg_kovil':           'assets/backgrounds/bg_kovil.webp',
    'bg_temple':          'assets/backgrounds/bg_temple.webp',
    'bg_prologue_k':      'assets/backgrounds/bg_prologue_k.webp',
    'bg_prologue_ka':     'assets/backgrounds/bg_prologue_ka.webp',
    'bg_prologue_ku':     'assets/backgrounds/bg_prologue_ku.webp',
};

// ─── MAP LOCATION assets ─────────────────────────────────────────────────────
// Format: PNG with transparency (mix-blend-mode: multiply removes white bg)
// Currently stored in assets/ root,  subfolder assets/map/ is the canonical target
// Update the HTML SVG hrefs when you move them to assets/map/
const MAP_assets = {
    // Decorative landmarks (non-clickable)
    'map_kovil':          'assets/map_icon_kovil.jpeg',         // → rename to .png when ready
    'map_temple':         'assets/map_icon_temple.jpeg',        // → rename to .png when ready
    // Interactive location markers,  loc IDs match map SVG data-loc attributes
    'loc1_grama':         'assets/map_marker_gramasevaka.jpeg', // → assets/map/map_grama_office.png
    'loc2_uncle':         'assets/map_marker_uncle.jpeg',       // → assets/map/map_uncle_house.png
    'loc3_ecboard':       'assets/map_marker_noticeboard.jpeg', // → assets/map/map_ec_board.png
    'loc4_boutique':      'assets/map_marker_mudalali.jpeg',    // → assets/map/map_boutique.png
    'loc5_hall':          'assets/map_marker_hall.jpeg',        // → assets/map/map_community_hall.png
    'loc6_police':        'assets/map_marker_police.jpeg',      // → assets/map/map_police.png
    'loc7_cafe':          'assets/map_marker_cafe.jpeg',        // → assets/map/map_skeptics_cafe.png (missing)
    'loc8_tent':          'assets/map_marker_tent.jpeg',        // → assets/map/map_campaign_tent.png
    'loc9_polling':       'assets/map_marker_polling.jpeg',     // → assets/map/map_polling_station.png
};

// ─── UI ELEMENT assets ───────────────────────────────────────────────────────
// Format: PNG (whatsapp elements), SVG (icons)
// Stored in assets/ui/
// Used in: WhatsApp message cards, dialogue panel decorations, gauge icons
const UI_assets = {
    // WhatsApp message card chrome
    'whatsapp_bubble':    'assets/ui/whatsapp_bubble.png',       // WhatsApp UI frame
    'phone_frame':        'assets/ui/phone_frame.png',           // Phone outer frame
    'voice_waveform':     'assets/ui/voice_waveform.png',        // Voice note waveform graphic
    'video_play_still':   'assets/ui/video_play_still.png',      // Video clip placeholder still
    // Elections Commission visual elements
    'ec_stamp':           'assets/ui/ec_stamp.png',              // Official EC stamp
    'ec_logo_real':       'assets/ui/ec_logo_real.png',          // Correct EC logo (Week 6 board)
    'ec_logo_fake':       'assets/ui/ec_logo_fake.png',          // Subtly wrong EC logo (Week 4)
    // HUD gauge icons
    'icon_ct':            'assets/ui/icon_ct.svg',               // Civic Trust gauge icon
    'icon_ih':            'assets/ui/icon_ih.svg',               // Information Health gauge icon
    'icon_vp':            'assets/ui/icon_vp.svg',               // Voter Participation gauge icon
    // Achievements
    'achievement_locked': 'assets/ui/achievement_locked.svg',    // Hidden achievement tile
    // Sandya's handwritten note texture
    'sandya_note':        'assets/ui/sandya_note.png',           // EC board note background
};

// ─── PROP DOCUMENT assets ────────────────────────────────────────────────────
// Format: PNG, rendered as full-width document cards inside the dialogue panel
// Stored in assets/props/
// Used in: scene JSONs as { type: "document", image: "manifesto_2025" }
const PROP_assets = {
    'manifesto_2025':          'assets/props/manifesto_2025.png',        // Mahinda current manifesto
    'manifesto_2010':          'assets/props/manifesto_2010.png',        // 2010 manifesto (secret)
    'manifesto_comparison':    'assets/props/manifesto_comparison.png',  // Side-by-side comparison
    'ec_notice_registration':  'assets/props/ec_notice_registration.png',// Week 6 EC board notice
    'ec_notice_candidates':    'assets/props/ec_notice_candidates.png',  // Week 3 candidate list
    'ec_notice_correction':    'assets/props/ec_notice_correction.png',  // Correction after fake shared
    'receipt_1977':            'assets/props/receipt_1977.png',          // Mudalali's 1977 receipt (secret)
    'road_file_folder':        'assets/props/road_file_folder.png',      // Road File folder (secret)
    'voter_card_1983':         'assets/props/voter_card_1983.png',       // Aunty Soma's card (secret ending)
};

// ─── AUDIO assets ────────────────────────────────────────────────────────────
// Ambient: OGG (compressed, loopable)   SFX: WAV (short, uncompressed)
// Stored in assets/audio/
// The audioMap in openDialoguePanel() maps bg names → ambient files automatically
const AUDIO_assets = {
    // Ambient background loops,  auto-play when entering each location
    'ambient_uncle_house':    'assets/audio/ambient_uncle_house.ogg',
    'ambient_grama_office':   'assets/audio/ambient_grama_office.ogg',
    'ambient_boutique':       'assets/audio/ambient_boutique.ogg',
    'ambient_police':         'assets/audio/ambient_police.ogg',
    'ambient_tent':           'assets/audio/ambient_tent.ogg',
    'ambient_ec_board':       'assets/audio/ambient_ec_board.ogg',
    'ambient_polling':        'assets/audio/ambient_polling.ogg',
    // Sound effects,  triggered by game events
    'sfx_whatsapp':           'assets/audio/sfx_whatsapp_notification.wav',  // Uncle message arrives
    'sfx_advance':            'assets/audio/sfx_dialogue_advance.wav',       // Dialogue click
    'sfx_gauge_up':           'assets/audio/sfx_gauge_up.wav',               // Positive gauge change
    'sfx_gauge_down':         'assets/audio/sfx_gauge_down.wav',             // Negative gauge change
    'sfx_achievement':        'assets/audio/sfx_achievement.wav',            // Achievement unlocked
    'sfx_week_transition':    'assets/audio/sfx_week_transition.wav',        // Week advance card
};

const LOC_BGS = {
    'loc1': 'assets/backgrounds/bg_grama_office.webp',
    'loc2': 'assets/backgrounds/bg_uncle_house.webp',
    'loc3': 'assets/backgrounds/bg_ec_board.webp',
    'loc4': 'assets/backgrounds/bg_boutique.webp',
    'loc5': 'assets/backgrounds/bg_community_hall.webp', // PLACEHOLDER,  create bg_community_hall.webp for Aunty Soma / Community Hall scene
    'loc6': 'assets/backgrounds/bg_police.webp',
    'loc7': 'assets/backgrounds/bg_skeptics_cafe.webp',
    'loc8': 'assets/backgrounds/bg_campaign_tent.webp',
    'loc9': 'assets/backgrounds/bg_polling_station.webp',
    'loc_kovil': 'assets/backgrounds/bg_kovil.webp',
    'loc_temple': 'assets/backgrounds/bg_temple.webp'
};

const BG_MAP = {
    'bg_uncle_house':    'assets/backgrounds/bg_uncle_house.webp',
    'bg_grama_office':   'assets/backgrounds/bg_grama_office.webp',
    'bg_ec_board':       'assets/backgrounds/bg_ec_board.webp',
    'bg_boutique':       'assets/backgrounds/bg_boutique.webp',
    'bg_police':         'assets/backgrounds/bg_police.webp',
    'bg_campaign_tent':  'assets/backgrounds/bg_campaign_tent.webp',
    'bg_skeptics_cafe':  'assets/backgrounds/bg_skeptics_cafe.webp',
    'bg_polling_station':'assets/backgrounds/bg_polling_station.webp',
    'bg_main_menu':      'assets/backgrounds/bg_main_menu.webp',
    'bg_town_map':       'assets/backgrounds/bg_town_map.webp',
    /* Master Scene File uses these keys,  map to the positive/negative files */
    'bg_ending_good':    'assets/backgrounds/bg_ending_positive.webp',
    'bg_ending_bad':     'assets/backgrounds/bg_ending_negative.webp',
    /* Legacy aliases kept for backward compat */
    'bg_ending_positive':'assets/backgrounds/bg_ending_positive.webp',
    'bg_ending_negative':'assets/backgrounds/bg_ending_negative.webp',
    'bg_ending_neutral': 'assets/backgrounds/bg_ending_neutral.webp',
    'bg_kovil':          'assets/backgrounds/bg_kovil.webp',
    'bg_temple':         'assets/backgrounds/bg_temple.webp',
    'bg_prologue_k':     'assets/backgrounds/bg_prologue_k.webp',
    'bg_prologue_ka':    'assets/backgrounds/bg_prologue_ka.webp',
    'bg_prologue_ku':    'assets/backgrounds/bg_prologue_ku.webp'
};

// --- PANEL OPEN / CLOSE ---

function openDialoguePanel() {
    document.getElementById('dialogue-scene-wrapper').classList.add('active');
    document.getElementById('dialogue-panel').classList.add('open');
    // Show the explicit back-to-map button whenever we enter a location
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.add('visible');
    const bgLayer = document.getElementById('location-bg-layer');
    // Prefer scene-declared background; fall back to location map
    const sceneBg = window.gameState.dialogue._sceneBg;
    const bgUrl = (sceneBg && BG_MAP[sceneBg])
        || (window.gameState.currentLoc && LOC_BGS[window.gameState.currentLoc] ? LOC_BGS[window.gameState.currentLoc] : null);
    document.getElementById('objective-bar').style.opacity = '0';
    if (bgUrl) {
        bgLayer.style.backgroundImage = `url('${bgUrl}')`;
        
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
    // If prologue was active, reveal the objective bar now
    if (document.getElementById('screen-game')?.classList.contains('prologue-active')) {
        _afterPrologueReady();
    }
    document.getElementById('dialogue-scene-wrapper').classList.remove('active');
    document.getElementById('dialogue-panel').classList.remove('open');
    // Hide the back button when we return to the map
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.remove('visible');
    document.getElementById('objective-bar').style.opacity = '1';
    stopBGM();
    // Now that the panel is gone, safely check if the week's goal is complete
    if (window.gameState.screen === 'screen-game') {
        checkWeekCompletion();
        checkMapUnlocks(); // Re-run AFTER week completion check so pulse clears immediately
        
        // Show gauge tutorial ONLY after prologue conversation ends (Week 6 starts)
        if (window.gameState.week === 6 && !window.gameState.flags.gaugesTutorialSeen) {
            setTimeout(() => showGaugeTutorial(), 800);
        }
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
    player.src = `assets/audio/${fileName}`;
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

function _setNpcPortrait(portraitKey, speakerName, flip) {
    const cont = document.getElementById('dialogue-portrait-container');
    const pcCont = document.getElementById('dialogue-pc-portrait-container');
    const nameEl = document.getElementById('dialogue-npc-name');
    
    const isPCSpeaking = (speakerName === window.gameState.character);

    if (portraitKey) {
        const src = (NPC_PORTRAITS && NPC_PORTRAITS[portraitKey])
            ? NPC_PORTRAITS[portraitKey]
            : `assets/npcs/${portraitKey}.png`;
        const flipClass = flip ? ' npc-flipped' : '';
        cont.innerHTML = `<img src="${src}" data-initials="${(speakerName||'NPC').substring(0,2).toUpperCase()}" onerror="imgFallback(this)" alt="${speakerName || 'NPC'}" class="npc-portrait-img${flipClass}">`;
    } else if (!isPCSpeaking) {
        cont.innerHTML = '';
    }

    const pcImg = pcCont ? pcCont.querySelector('img') : null;
    const npcImg = cont ? cont.querySelector('img') : null;

    if (isPCSpeaking) {
        if (pcImg) pcImg.classList.remove('portrait-inactive');
        if (npcImg) npcImg.classList.add('portrait-inactive');
    } else {
        if (pcImg) pcImg.classList.add('portrait-inactive');
        if (npcImg) npcImg.classList.remove('portrait-inactive');
    }

    if (nameEl) nameEl.textContent = speakerName || '';
}

function _setPcPortrait(emotion) {
    const state = window.gameState;
    const cont = document.getElementById('dialogue-pc-portrait-container');
    if (cont && state.character) {
        const em = emotion || state.flags.latestEmotion || 'neutral';
        // Use CHARACTER_PORTRAITS registry,  falls back to path construction if not found
        const charPortraits = CHARACTER_PORTRAITS && CHARACTER_PORTRAITS[state.character];
        const src = (charPortraits && charPortraits[em])
            ? charPortraits[em]
            : `assets/characters/char_${state.character.toLowerCase()}_${em}.png`;
        cont.innerHTML = `<img src="${src}" data-initials="PC" onerror="imgFallback(this)" alt="Player character" class="pc-portrait-img">`;
        if (em !== 'neutral') state.flags.latestEmotion = em;
    }
}

// ─── PROP/DOCUMENT RENDERER ──────────────────────────────────────────────────
// Called by advanceDialogue() when line.type === 'document' or 'notice'
function _renderPropLine(line) {
    const textEl = document.getElementById('dialogue-text');
    const imageKey = line.image || line.prop;
    const src = (PROP_assets && PROP_assets[imageKey])
        ? PROP_assets[imageKey]
        : (imageKey ? `assets/props/${imageKey}.png` : null);

    let html = '';
    if (src) {
        html += `<div class="prop-document-card">
            <img src="${src}" alt="${line.alt || imageKey || 'Document'}" class="prop-document-img" onerror="this.style.display='none'">
        </div>`;
    }
    if (line.caption) {
        html += `<p class="prop-caption">${line.caption}</p>`;
    }
    if (line.text) {
        html += `<p>${line.text}</p>`;
    }
    textEl.innerHTML = html;
}

// ─── UI ASSET RESOLVER ───────────────────────────────────────────────────────
// Resolves a UI asset key to its path,  used in WhatsApp card rendering
function _getUIAsset(key) {
    return (UI_assets && UI_assets[key]) ? UI_assets[key] : `assets/ui/${key}.png`;
}

// --- CONDITION EVALUATOR ---
// Safely evaluates condition strings from the scene JSON.
// Only has access to gameState.flags and gameState.gauges,  no eval of arbitrary code.

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
        _scenePath: state._pendingScenePath || null, // path that loaded this scene
        _waiting: false   // true when a choice line is displayed and awaiting player pick
    };
    state._pendingScenePath = null; // clear after use

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

    // If a choice is displayed, clicking elsewhere does nothing,  player must pick.
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
            const _pcEmotion = (line.speaker === window.gameState.character) ? (line.emotion || 'talking') : 'neutral';
            _setPcPortrait(_pcEmotion);
            _setNpcPortrait(line.portrait_state || null, line.speaker || '', line.npc_flip || false);
            document.getElementById('dialogue-panel').classList.remove('panel-expanded');
            textEl.innerHTML = line.text || '';
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
            // Always show continue button,  player taps to proceed to the next line (which may be a choice)
            contBtn.style.display = 'block';
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
            _setNpcPortrait(line.portrait_state || null, line.speaker || '', line.npc_flip || false);
            document.getElementById('dialogue-panel').classList.add('panel-expanded');
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
            // Unknown type,  render text if present, continue.
            textEl.innerHTML = line.text || '';
            contBtn.style.display = 'block';
            break;
        }
    }
}

function _checkAutoAchievements() {
    const state = window.gameState;
    const vc = state.flags.verifiedCount || 0;
    const vabc = state.flags.verifiedAtBoardCount || 0;
    if ((vc >= 1 || vabc >= 1) && !state.flags._ach_alg_fired) {
        state.flags._ach_alg_fired = true;
        unlockAchievement('the_algorithm_would_hate_you');
    }
    if ((vc >= 3 || vabc >= 3) && !state.flags._ach_skeptic_fired) {
        state.flags._ach_skeptic_fired = true;
        unlockAchievement('professional_skeptic');
    }
    if (state.flags.helpedElderlyWoman && state.flags.helpedNICYoungMan && state.flags.helpedLostCouple && !state.flags._ach_helpers_fired) {
        state.flags._ach_helpers_fired = true;
        unlockAchievement('at_least_someone_asked');
    }
    if (state.gauges.ih >= 100 && !state.flags._ach_ih100_fired) {
        state.flags._ach_ih100_fired = true;
        unlockAchievement('information_health_100');
    }
    if (state.flags.sharedVerifiedInfo && !state.flags._ach_spreads_fired) {
        state.flags._ach_spreads_fired = true;
        unlockAchievement('it_spreads_both_ways');
    }
    if (state.flags.foundSandyaNote && state.flags.sandyaOnRegister && !state.flags._ach_sandya_fired) {
        state.flags._ach_sandya_fired = true;
        unlockAchievement('sandya_made_it');
    }
    if (state.flags.foundRoadFile && !state.flags._ach_roadfile_fired) {
        state.flags._ach_roadfile_fired = true;
        unlockAchievement('thirty_years_in_the_same_room');
    }
    if (state.flags.found1977Receipt && !state.flags._ach_receipt_fired) {
        state.flags._ach_receipt_fired = true;
        unlockAchievement('pol_roti_and_politics');
    }
    if (state.flags.foundSergeantTransferThread && !state.flags._ach_sergeant_fired) {
        state.flags._ach_sergeant_fired = true;
        unlockAchievement('somebody_had_to_ask');
    }
    if (state.flags.askedNandadasa && !state.flags._ach_nandadasa_fired) {
        state.flags._ach_nandadasa_fired = true;
        unlockAchievement('nandadasa_approved');
    }
    if (state.flags.manifestoComparisonDone && !state.flags._ach_manifesto_fired) {
        state.flags._ach_manifesto_fired = true;
        unlockAchievement('actually_read_the_fine_print');
    }
    if (state.flags.readCurrentManifesto && !state.flags._ach_readmanifesto_fired) {
        state.flags._ach_readmanifesto_fired = true;
        unlockAchievement('read_the_fine_print');
    }
    if (state.flags.helpedElderlyWoman && !state.flags._ach_elderly_fired) {
        state.flags._ach_elderly_fired = true;
        unlockAchievement('not_your_job');
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
    // Auto-detect verified information sharing (for achievement)
    if (opt.flags_set && opt.flags_set.includes('sharedVerifiedInfo')) {
        state.flags.sharedVerifiedInfo = true;
    }
    if (opt.label && (opt.label.includes('verify') || opt.label.includes('Verify')) && !opt.flags_set?.includes('sharedFakeMessage')) {
        state.flags.sharedVerifiedInfo = true;
    }

    // 3. Increment counter flags
    const increments = opt.flags_increment || {};
    for (const [k, v] of Object.entries(increments)) {
        state.flags[k] = (state.flags[k] || 0) + v;
    }

    // 4. Unlock achievement
    if (opt.achievement) unlockAchievement(opt.achievement);

    // 4b. Auto-achievements
    _checkAutoAchievements();

    // 5. Curiosity perk achievement
    

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
        _pendingGoto = opt.goto || 'RESOLVE_ON_COMPLETE';
        showConsequence(opt.consequence_text || '', gaugeDeltas, prevGauges);
        return;
    }

    state.history.push({ loc: state.currentLoc, choice: opt.label || opt.text, effect: gaugeDeltas });
    updateGauges(false);

    // Sync verifiedCount with verifiedAtBoardCount
    if (state.flags.verifiedAtBoardCount > (state.flags.verifiedCount || 0)) {
        state.flags.verifiedCount = state.flags.verifiedAtBoardCount;
    }

    saveGame();
    checkMapUnlocks();

    // 8. Navigate
    if (opt.goto) {
        _navigateGoto(opt.goto);
    } else if (state.dialogue.on_complete) {
        _resolveOnComplete(state.dialogue.on_complete);
    } else {
        closeDialoguePanel();
    }
}

// Stores the pending goto when a consequence screen is shown mid-choice.
let _pendingGoto = null;

// Called by returnToGame(),  if a goto was stored, navigate there.
function _resumeAfterConsequence() {
    if (_pendingGoto) {
        const target = _pendingGoto;
        _pendingGoto = null;
        if (target === 'RESOLVE_ON_COMPLETE') {
            _resolveOnComplete(window.gameState.dialogue.on_complete);
        } else {
            _navigateGoto(target);
        }
    }
}

function _resolveOnComplete(onComplete) {
    // Mark the scene that just finished as fully completed
    const d = window.gameState.dialogue;
    const currentPath = d ? d._scenePath : null;
    
    if (currentPath) {
        if (!Array.isArray(window.gameState.flags.completedLocs)) {
            window.gameState.flags.completedLocs = [];
        }
        if (!window.gameState.flags.completedLocs.includes(currentPath)) {
            window.gameState.flags.completedLocs.push(currentPath);
        }
    }
    
    closeDialoguePanel();
    _checkAutoAchievements();
    updateGauges(false);
    saveGame();
    checkMapUnlocks();

    if (!onComplete) return;

    if (typeof onComplete === 'string') {
        _navigateGoto(onComplete);
        return;
    }

    let newWeek = null;
    if (onComplete.week_set !== undefined) {
        newWeek = onComplete.week_set;
        window.gameState.week = newWeek;
        showWeekBanner(newWeek);
    }

    // If week became 0, immediately unlock polling station
    if (newWeek === 0 || window.gameState.week === 0) {
        const ps = document.querySelector('[data-loc="loc9"]');
        if (ps) ps.classList.add('unlocked-loc');
        const ps9 = document.getElementById('loc9-node');
        if (ps9) {
            ps9.classList.add('polling-unlocked');
            ps9.style.opacity = '1';
            ps9.style.pointerEvents = 'auto';
        }
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
        const panel = document.getElementById('dialogue-panel');
        if (panel && panel.classList.contains('open')) {
            closeDialoguePanel();
        }
        showScreen('screen-game');
        return; 
    }

    // Special action strings
    if (target === 'screen_character_select') { showScreen('screen-character'); return; }
    if (target === 'triggerEnding')            { triggerEnding(); return; }
    if (target === 'checkWeekCompletion')      { checkWeekCompletion(); return; }

    // INTERCEPT: Safely handle routing to main menu or final ending screen
    const hasEndingCompleted = window.gameState.flags.completedLocs &&
        window.gameState.flags.completedLocs.some(p => p.includes('ending_good') || p.includes('ending_bad') || p.includes('ending_neutral') || p.includes('ending_secret'));
    
    if (target === 'screen_main_menu') {
        // Only trigger ending if it has not already been shown this session
        if (!window.gameState.flags.endingReached && (window.gameState.week === 0 || hasEndingCompleted)) {
            triggerEnding();
        } else {
            showScreen('screen-mainmenu');
        }
        return;
    }

    // Scene IDs from the Master File are dot-prefixed week folders:
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
    // Direct map lookup,  no wN_ prefix required, works for prologue, endings, and all weeks.
    const SCENE_ID_MAP = {
        // Prologue
        'prologue':                        'scenes/prologue.json',

        // Week 6,  each scene has its own file
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
        'w6_grama_office_Kamala':          'scenes/week6/grama_office_w6_Kamala.json',
        'w6_Kamala_wrong_assumption':      'scenes/week6/grama_office_Kamala_wrong.json',
        'w6_Kamala_assumption_corrected':  'scenes/week6/grama_office_Kamala_corrected.json',
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
        'w0_kumaran_polling':              'scenes/week0/kumaran_polling_w0.json',
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
    // Legacy schema,  migrate scene JSON to new format when possible
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
    // checkWeekCompletion() is handled by closeDialoguePanel(),  do not call here
}

function showConsequence(text, deltas, prev) {
    // RESET TO PHASE 1 UI (In case the player came from a previous ending)
    document.getElementById('cons-phase-choice').style.display = 'flex';
    document.getElementById('cons-phase-ending').style.display = 'none';
    
    const badgesCont = document.getElementById('cons-changes');
    badgesCont.innerHTML = '';
    
    for(const [k, v] of Object.entries(deltas)) {
        if(v === 0) continue;
        const cls = v > 0 ? 'pos' : 'neg';
        const label = document.querySelector(`[data-i18n="gauge.${k}"]`)
            ? document.querySelector(`[data-i18n="gauge.${k}"]`).textContent
            : k.toUpperCase();
        badgesCont.innerHTML += `<div class="cons-badge ${cls}">${label} ${v > 0 ? '+'+v : v}</div>`;
    }
    
    document.getElementById('cons-text').textContent = text;
    updateGauges(true);
    // Use overlay approach,  do NOT call showScreen() which hides screen-game.
    // Consequence screen sits on top as a fixed overlay instead.
    const consScreen = document.getElementById('screen-consequence');
    consScreen.classList.add('active');
    consScreen.removeAttribute('aria-hidden');
    consScreen.style.zIndex = '200'; // Ensure it sits above everything
}

function returnToGame() {
    showScreen('screen-game');
    // Always ensure dialogue wrapper is fully closed when returning from consequence screen
    const wrapper = document.getElementById('dialogue-scene-wrapper');
    const panel   = document.getElementById('dialogue-panel');
    const backBtn = document.getElementById('location-back-btn');
    if (wrapper) wrapper.classList.remove('active');
    if (panel)   panel.classList.remove('open');
    if (backBtn) backBtn.classList.remove('visible');
    // Restore objective bar visibility
    const objBar = document.getElementById('objective-bar');
    if (objBar) objBar.style.opacity = '1';
    // Close the consequence overlay properly
    const consScreen = document.getElementById('screen-consequence');
    if (consScreen) {
        consScreen.classList.remove('active');
        consScreen.setAttribute('aria-hidden', 'true');
    }
    _resumeAfterConsequence();
    updateGauges();
    checkMapUnlocks();
    setTimeout(() => checkWeekCompletion(), 100);
}

function triggerEnding() {
    const g = window.gameState.gauges;
    const flags = window.gameState.flags;
    
    let endingType = 'neutral';
    let endingTitle = 'The Election Has Passed.';
    let endingText = '';
    
    const allAbove75 = g.ct >= 75 && g.ih >= 75 && g.vp >= 75;
    const allAbove60 = g.ct >= 60 && g.ih >= 60 && g.vp >= 60;
    const anyBelow30 = g.ct < 30 || g.ih < 30 || g.vp < 30;
    const badVote = flags.ballotSpoiled; // Unregistered alone does not force bad ending per spec
    
    // Secret ending: all advanced evidence collected AND all gauges ≥ 75
    const secretCondition = allAbove75 &&
        flags.manifestoComparisonDone &&
        flags.foundRoadFile &&
        flags.helpedElderlyWoman &&
        flags.helpedYoungMan &&
        flags.helpedCouple;

    if (secretCondition) {
        endingType = 'secret';
        endingTitle = 'The Unbroken Chain.';
        endingText = `Aunty Soma shows you a voter registration card from 1983. Her name. Her photo. A different address, a different decade. "Every election," she says, "they find a reason why someone should not vote." The road is still not fixed. You already knew about the road file. The manifesto from 2010 is in your bag. You came anyway. So did she.`;
    } else if (allAbove60 && !badVote) {
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
        if (endingType === 'secret') {
            consBg.style.backgroundImage = "url('assets/backgrounds/bg_ending_secret.webp')";
        } else if (endingType === 'good') {
            consBg.style.backgroundImage = "url('assets/backgrounds/bg_ending_positive.webp')";
        } else if (endingType === 'bad') {
            consBg.style.backgroundImage = "url('assets/backgrounds/bg_ending_negative.webp')";
        } else {
            consBg.style.backgroundImage = "url('assets/backgrounds/bg_ending_neutral.webp')";
        }
    }
    
    // Populate the Phase 2 Ending screen text
    const ENDING_LABELS_MAP = { bad: 'Bad Ending', neutral: 'Neutral Ending', good: 'Good Ending', secret: 'Secret Ending' };
    document.getElementById('ending-title').textContent = endingTitle;
    document.getElementById('ending-body').textContent = endingText;
    document.getElementById('ending-label').textContent = ENDING_LABELS_MAP[endingType] || 'The Election Has Passed';
    
    // Animate final gauges
    ['ct','ih','vp'].forEach(key => {
        const val = Math.max(0, Math.min(100, Math.round(g[key])));
        const valEl = document.getElementById('ending-val-' + key);
        if (valEl) valEl.textContent = val;
        const bar = document.getElementById('ending-bar-' + key);
        if (bar) {
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = val + '%'; }, 200);
        }
    });

    // Switch consequence UI to Phase 2
    document.getElementById('cons-phase-choice').style.display = 'none';
    document.getElementById('cons-phase-ending').style.display = 'flex';
    document.getElementById('cons-phase-ending').style.flexDirection = 'column';

updateGauges(true);
    window.showScreen('screen-consequence');
    // Ensure consequence overlay z-index doesn't persist over main menu
    document.getElementById('screen-consequence').style.zIndex = '';

    // Fire end-of-game achievements
    unlockAchievement('the_road_remains');
    unlockAchievement('you_finished_an_education_game');
    if (endingType === 'secret') {
        unlockAchievement('the_unbroken_chain');
    }
    if (window.gameState.flags.registrationDeadlineMissed) {
        unlockAchievement('the_door_was_right_there');
    }
    // Character-specific ending achievements
    const _char = window.gameState.character;
    const _flags = window.gameState.flags;
    if (_char === 'Karunasena' && (_flags.karunasena_dismissedCount || 0) > 5) {
        unlockAchievement('uncles_nephew');
    }
    if (_char === 'Kamala' && (_flags.kamala_assumptionsCorrected || 0) >= 1) {
        unlockAchievement('she_was_mostly_right');
    }
    if (_char === 'Kumaran' && (_flags.kumaran_transferStepsComplete || 0) >= 3) {
        unlockAchievement('every_step_cost_more');
    }
    // Blanket policy: all uncle messages delivered but ALL were dismissed/ignored
    const allUncleDelivered = _flags.uncleMsgWeek6Delivered && _flags.uncleMsgWeek5Delivered && _flags.uncleMsgWeek4Delivered;
    const allUncleIgnored = !_flags.uncleVisited && (_flags.karunasena_dismissedCount || 0) === 0 && !_flags.sharedAnyFakeMessage;
    if (_char === 'Karunasena' && allUncleDelivered && allUncleIgnored) {
        unlockAchievement('blanket_policy');
    }
    // Fake message achievements
    if (_flags.sharedFake4amMessage) unlockAchievement('the_4am_people');
    if (_flags.sharedFakeMessage_w6 || _flags.sharedFakeVoicenote_w5 || _flags.sharedFake4amMessage || _flags.sharedFakeCandidateList) {
        unlockAchievement('847_members');
    }
    if (_flags.sharedFakeBallotFold || _flags.ballotWillBeSpoiled) {
        unlockAchievement('you_were_so_confident');
    }

    
    
    // Track completed characters for 'three_perspectives' achievement (cross-playthrough)
    try {
        const completedChars = JSON.parse(localStorage.getItem('plv_completed_chars') || '[]');
        const currentChar = window.gameState.character;
        if (currentChar && !completedChars.includes(currentChar)) {
            completedChars.push(currentChar);
            localStorage.setItem('plv_completed_chars', JSON.stringify(completedChars));
        }
        if (completedChars.length >= 3) {
            unlockAchievement('three_perspectives');
        }
    } catch(e) { /* localStorage unavailable */ }

    // Mark ending reached,  loadGame() and exitToMainMenu() both check this flag
    window.gameState.flags.endingReached = endingType;

    // WIPE SAVE SO THE PLAYER ISN'T STUCK IN A LOOP
    try {
        localStorage.removeItem('plv_save');
    } catch(e) {}
}

// =============================================================
// GAUGE TUTORIAL,  shown once on first game entry
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
                Every decision you make in Alupotha moves them,  sometimes visibly, sometimes not.
            </p>
            <div class="tutorial-gauges">
                <div class="tg-item">
                    <div class="tg-icon" style="color:var(--gold)">♦</div>
                    <div>
                        <div class="tg-name" style="color:var(--gold)">Civic Trust</div>
                        <div class="tg-desc">Does the community believe the election is worth participating in? Spread misinformation and it falls. Verify before you share and it rises. This is a <em>community</em> score,  not just yours.</div>
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
            <button class="tut-btn" onclick="dismissGaugeTutorial()">Understood,  Enter Alupotha</button>
        </div>
    `;
    (document.getElementById('game-canvas') || document.body).appendChild(overlay);
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
    try {
        window.gameState = JSON.parse(s);
    } catch(e) {
        console.error("Save file corrupted");
        return;
    }

    // Ensure completedLocs exists (may be missing in saves created before this fix)
    if (!window.gameState.flags) window.gameState.flags = {};
    if (!Array.isArray(window.gameState.flags.completedLocs)) {
        window.gameState.flags.completedLocs = [];
    }
    if (!Array.isArray(window.gameState.flags.visitedLocs)) {
        window.gameState.flags.visitedLocs = [];
    }

    // Merge global achievements so they aren't lost if the save is old
    try {
        const storedAchs = localStorage.getItem('plv_achievements');
        if (storedAchs) {
            const parsedAchs = JSON.parse(storedAchs);
            const combined = new Set([...(window.gameState.flags.achievements || []), ...parsedAchs]);
            window.gameState.flags.achievements = Array.from(combined);
        }
    } catch(e) {}

    // If the game was saved while a dialogue was active, the last visited scene
    // path may have been pushed before the dialogue completed. Remove it so the
    // player can re-enter that scene on Continue rather than hitting "Nothing here."
    if (window.gameState.dialogue && window.gameState.dialogue.active) {
        const locs = window.gameState.flags.visitedLocs;
        if (Array.isArray(locs) && locs.length > 0) {
            locs.pop(); // Remove the scene that was interrupted
        }
        window.gameState.dialogue.active = false; // Reset dialogue state
    }

    // If the game was already completed, wipe the stale save and return to menu cleanly
    if (window.gameState.flags.endingReached) {
        try { localStorage.removeItem('plv_save'); } catch(e) {}
        checkContinueBtn();
        showScreen('screen-mainmenu');
        return;
    }

    applyLanguage(true);
    updateGauges(false);
    checkMapUnlocks();
    scaleMap();
    
    document.getElementById('week-val').textContent = window.gameState.week || 6;
    showScreen('screen-game');
    // Restore week completion banner if the player saved after completing a week's tasks
    setTimeout(() => checkWeekCompletion(), 300);

    // Restore polling station unlock if saved at week 0
    if (window.gameState.week === 0) {
        const ps9 = document.getElementById('loc9-node');
        if (ps9) { ps9.style.opacity = '1'; ps9.style.pointerEvents = 'auto'; }
    }
}

function checkContinueBtn() {
    const save = localStorage.getItem('plv_save');
    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-newgame');
    const subtitleEl = document.getElementById('menu-subtitle');
    
    if (save) {
        let saveData;
        try { saveData = JSON.parse(save); } catch(e) { localStorage.removeItem('plv_save'); checkContinueBtn(); return; }
        if (btnContinue) btnContinue.style.display = 'block';
        if (btnNewGame) btnNewGame.classList.remove('primary'); 
        
        // Personalize the subtitle if a character is active
        if (subtitleEl && saveData.character) {
            const safeChar = saveData.character.charAt(0).toUpperCase() + saveData.character.slice(1).toLowerCase();
            const charName = t(`char.${CHAR_KEY[safeChar] || 'k'}.name`);
            subtitleEl.textContent = `${charName}, Alupotha is waiting for you.`;
        }
    } else {
        if (btnContinue) btnContinue.style.display = 'none';
        if (btnNewGame) btnNewGame.classList.add('primary');
        
        // Revert to default text if no save exists
        if (subtitleEl) subtitleEl.textContent = t('menu.subtitle');
    }
}

function checkNewGame() {
    if (localStorage.getItem('plv_save')) {
        openModal('modal-overwrite'); // Warn user before destroying save
    } else {
        startNewGame(); // Safe to proceed immediately, ensures clean state
    }
}

function startNewGame() {
    // Keep meta progress (achievements)
    let earnedAchievements = [];
    try {
        const storedAchs = localStorage.getItem('plv_achievements');
        if (storedAchs) earnedAchievements = JSON.parse(storedAchs);
    } catch(e) {}
    
    // Wipe local storage save
    localStorage.removeItem('plv_save');

    // Build default flags object (complete, matches initial state)
    const defaultFlags = {
        visitedLocs: [],
        completedLocs: [],
        achievements: earnedAchievements,
        endingReached: null,
        secretEndingReached: false,
        uncleMsgWeek6Delivered: false,
        uncleMsgWeek5Delivered: false,
        uncleMsgWeek4Delivered: false,
        uncleMsgWeek3Delivered: false,
        uncleMsgWeek2Delivered: false,
        uncleMsgWeek1Delivered: false,
        sharedFakeMessage_w6: false,
        sharedFakeVoicenote_w5: false,
        sharedFake4amMessage: false,
        sharedFakeCandidateList: false,
        sharedFakeBallotFold: false,
        sharedAnyFakeMessage: false,
        uncleVisited: false,
        registrationStarted: false,
        registrationComplete: false,
        registrationDeadlineMissed: false,
        gremaOfficeVisited: false,
        verifiedAtBoardCount: 0,
        verifiedCount: 0,
        foundRoadFile: false,
        found1977Receipt: false,
        foundOldManifesto: false,
        manifestoComparisonDone: false,
        foundSergeantTransferThread: false,
        heardAbout2016Road: false,
        foundSandyaNote: false,
        sandyaOnRegister: false,
        skepticsCafeUnlocked: false,
        joinedCafe: false,
        readCurrentManifesto: false,
        reportedIllegalPosters: false,
        reportedVoterIntimidation: false,
        verifiedBallotFold: false,
        willFoldInThirds: false,
        kamala_wrongAssumption_pollingStation: false,
        helpedElderlyWoman: false,
        helpedNICYoungMan: false,
        helpedLostCouple: false,
        votedSuccessfully: false,
        ballotSpoiled: false,
        ballotWillBeSpoiled: false,
        clue_roadFile_delivered: false,
        clue_manifesto_delivered: false,
        clue_cafe_delivered: false,
        karunasena_dismissedCount: 0,
        kamala_assumptionsCorrected: 0,
        kumaran_transferStepsComplete: 0,
        sharedFakeMessage: false,
        cameFromUncle: false,
        ignored: false,
        attendedHall: false,
        dismissedMessages: 0,
        gaugesTutorialSeen: false,
        _ach_alg_fired: false,
        _ach_skeptic_fired: false,
        _ach_helpers_fired: false,
        _ach_ih100_fired: false,
        _ach_spreads_fired: false,
        _ach_sandya_fired: false,
        _ach_roadfile_fired: false,
        _ach_receipt_fired: false,
        _ach_sergeant_fired: false,
        _ach_nandadasa_fired: false,
        _ach_manifesto_fired: false,
        _ach_readmanifesto_fired: false,
        _ach_elderly_fired: false,
        sharedVerifiedInfo: false
    };

    window.gameState = {
        lang: window.gameState.lang || 'en',
        screen: 'screen-character',
        character: null,
        week: 6,
        gauges: { ct: 50, ih: 50, vp: 50 },
        flags: defaultFlags,
        dialogue: { active: false, currentLine: 0, lines: [], choices: null },
        history: [],
        currentLoc: null
    };
    
    closeModal('modal-overwrite');
    showScreen('screen-character');
    checkContinueBtn();
}

// =============================================================================
// KEYBOARD NAVIGATION SYSTEM
// Supports: Arrow keys/Tab for menu focus, Enter/Space to select,
//           Escape to pause, 1-9 for dialogue choices, WASD for future use.
// Compatible with itch.io and Steam (no conflicts with browser shortcuts).
// =============================================================================
let _kbFocusedIndex = 0;

function _getActiveFocusableButtons() {
    // Get all visible, non-disabled buttons in the currently active screen or modal
    const activeModal = document.querySelector('.modal-overlay.active');
    const activeScreen = document.querySelector('.screen.active');
    const pauseOverlay = document.getElementById('overlay-pause');
    const dialoguePanel = document.getElementById('dialogue-panel');
    let container = activeScreen;

    if (activeModal) {
        container = activeModal;
    } else if (pauseOverlay && pauseOverlay.classList.contains('active')) {
        container = pauseOverlay;
    } else if (dialoguePanel && dialoguePanel.classList.contains('open')) {
        container = dialoguePanel;
    }
    if (!container) return [];

    return Array.from(container.querySelectorAll(
        'button:not([disabled]), [role="button"]:not([disabled])'
    )).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    });
}

function _kbNavigate(direction) {
    const buttons = _getActiveFocusableButtons();
    if (!buttons.length) return;
    _kbFocusedIndex = (_kbFocusedIndex + direction + buttons.length) % buttons.length;
    buttons[_kbFocusedIndex].focus();
}

document.addEventListener('keydown', (e) => {
    const screen = window.gameState.screen;
    const pauseActive = document.getElementById('overlay-pause')?.classList.contains('active');
    const dialogueOpen = document.getElementById('dialogue-panel')?.classList.contains('open');
    const tutorialOpen = !!document.getElementById('gauge-tutorial');

    // --- Prevent default for game keys (stops page scroll etc.) ---
    const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Escape'];
    if (gameKeys.includes(e.key)) {
        // Only prevent default if we're in game context, not a text input
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'SELECT' &&
            document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }

    // --- ESCAPE: Universal Back / Close / Pause ---
    if (e.key === 'Escape') {
        // 1. Close any active Modals first (Settings, About, Controls, Confirm)
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }
        // 2. Close Credits if they are rolling
        const creditsScreen = document.getElementById('screen-credits');
        if (creditsScreen && creditsScreen.classList.contains('active')) {
            closeCredits();
            return;
        }
        // 3. Handle Special Overlays
        if (screen === 'screen-opening') { skipOpening(); return; }
        if (tutorialOpen) { dismissGaugeTutorial(); return; }
        
        // 4. Navigate Back to Main Menu from Sub-screens
        if (screen === 'screen-character' || screen === 'screen-achievements') {
            showScreen('screen-mainmenu');
            return;
        }
        
        // 5. Standard Game Interactions
        if (pauseActive) { togglePause(); return; }
        if (dialogueOpen) { closeDialoguePanel(); return; }
        if (screen === 'screen-game') { togglePause(); return; }
        return;
    }

    // --- ARROW KEYS: Navigate menu buttons ---
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Tab') {
        if (!e.shiftKey) _kbNavigate(1);
        return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        _kbNavigate(-1);
        return;
    }

    // --- ENTER / SPACE: Activate focused button or advance dialogue ---
    if (e.key === 'Enter' || e.key === ' ') {
        // If a button is focused, click it
        const focused = document.activeElement;
        if (focused && (focused.tagName === 'BUTTON' || focused.getAttribute('role') === 'button')) {
            focused.click();
            return;
        }
        // Otherwise, advance dialogue
        if (dialogueOpen && !window.gameState.dialogue._waiting) {
            advanceDialogue();
        }
        return;
    }

    // --- NUMBER KEYS 1-9: Select dialogue choices ---
    if (dialogueOpen && window.gameState.dialogue._waiting) {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1) {
            const options = document.querySelectorAll('#dialogue-options button');
            if (options[num - 1]) {
                options[num - 1].click();
            }
        }
        return;
    }
});

// Reset focus index when screen changes - handled inside showScreen() at line 331
// No wrapper needed; showScreen already resets _kbFocusedIndex on every call.

// Keyboard focus styles handled in style.css cleanly

// Open Character Confirmation Modal
// Character trait/perk data for the confirmation modal
const CHAR_CONFIRM_DATA = {
    Karunasena: {
        perk: 'Curiosity',
        perkDesc: 'Can ask why something works the way it does and receive a deeper explanation.',
        dis: 'Exposure',
        disDesc: 'Uncle Sirisena is family. Ignoring his messages carries a social cost.'
    },
    Kamala: {
        perk: 'Network',
        perkDesc: 'Queues move faster. Characters share information more readily with her.',
        dis: 'Assumption',
        disDesc: 'She believes she already knows things,  but has some of them subtly wrong.'
    },
    Kumaran: {
        perk: 'Persistence',
        perkDesc: 'Every completed step earns more. He unlocks content others cannot reach.',
        dis: 'Distance',
        disDesc: 'Fewer informal information sources. Accurate information is harder to find.'
    }
};

window.promptCharacterConfirm = function(charId) {
    // Always use capitalised Kumaran,  no lowercase alias needed
    const safeCharId = (charId === 'kumaran') ? 'Kumaran' : charId;

    // Game-feel: flash the clicked card before the modal opens
    const key = { Karunasena: 'k', Kamala: 'ka', Kumaran: 'ku' }[safeCharId];
    document.querySelectorAll('.clickable-card').forEach(card => {
        const nameEl = card.querySelector('[data-i18n]');
        if (nameEl && nameEl.getAttribute('data-i18n') === `char.${key}.name`) {
            card.classList.add('card-selected');
            setTimeout(() => card.classList.remove('card-selected'), 500);
        }
    });

    // Name
    document.getElementById('confirm-char-name').textContent = safeCharId;

    // Traits block
    const data = CHAR_CONFIRM_DATA[safeCharId] || {};
    const traitsEl = document.getElementById('confirm-traits');
    if (traitsEl && data.perk) {
        traitsEl.innerHTML = `
            <div class="char-confirm-trait perk">
                <div class="char-confirm-trait-label">Perk</div>
                <div class="char-confirm-trait-text"><strong>${data.perk}:</strong> ${data.perkDesc}</div>
            </div>
            <div class="char-confirm-trait dis">
                <div class="char-confirm-trait-label">Challenge</div>
                <div class="char-confirm-trait-text"><strong>${data.dis}:</strong> ${data.disDesc}</div>
            </div>
        `;
    }

    // Starting gauges block
    const gauges = CHAR_GAUGES[safeCharId] || { ct: 50, ih: 50, vp: 50 };
    const gaugesEl = document.getElementById('confirm-gauges');
    if (gaugesEl) {
        gaugesEl.innerHTML = `
            <div class="mini-gauge ct">
                <span>Civic Trust</span>
                <div class="mini-bar"><div class="mini-fill" style="width:${gauges.ct}%"></div></div>
                <span>${gauges.ct}</span>
            </div>
            <div class="mini-gauge ih">
                <span>Info Health</span>
                <div class="mini-bar"><div class="mini-fill" style="width:${gauges.ih}%"></div></div>
                <span>${gauges.ih}</span>
            </div>
            <div class="mini-gauge vp">
                <span>Voter Participation</span>
                <div class="mini-bar"><div class="mini-fill" style="width:${gauges.vp}%"></div></div>
                <span>${gauges.vp}</span>
            </div>
        `;
    }

    // Wire the confirm button
    document.getElementById('confirm-char-btn').onclick = function() {
        closeModal('modal-char-confirm');
        selectCharacter(safeCharId);
    };

    openModal('modal-char-confirm');
};