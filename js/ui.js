let _kbFocusedIndex = 0;
let openingInterval;
let fadeOutTimeout;
let linesData = [];
let currentLineIdx = 0;

function imgFallback(img) {
    img.onerror = null;
    const initials = img.getAttribute('data-initials') || '?';
    const div = document.createElement('div');
    div.className = 'fallback-circle';
    div.textContent = initials;
    img.parentNode.replaceChild(div, img);
}

function showScreen(id) {
    _kbFocusedIndex = 0;
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
    });
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');
    target.removeAttribute('aria-hidden');
    window.gameState.screen = id;
    
    if (id === 'screen-mainmenu') checkContinueBtn();
    if (id === 'screen-game') scaleMap();
}

function scaleMap() {
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
        if (isLoadingReady) {
            playMusic('bgm_mainmenu');
            showScreen('screen-language');
        }
    });

    document.querySelectorAll('.map-location').forEach(g => {
        g.addEventListener('click', () => openLocation(g.dataset.loc));
    });

    let _lastHoveredBtn = null;
    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('button:not([disabled]), [role="button"]:not([disabled])');
        if (!btn || btn === _lastHoveredBtn) return;
        _lastHoveredBtn = btn;
        playAudio('sfx', 'sfx_hover.wav');
    });

    scaleGame();
    scaleMap();
    window.addEventListener('resize', () => { scaleGame(); scaleMap(); });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, [role="button"]');
        if (!btn) return;
        if (btn.disabled) return;
        if (btn.classList.contains('locked-card') || btn.classList.contains('coming-soon') || btn.hasAttribute('data-locked')) return;
        playAudio('sfx', 'sfx_click.wav');
    }, true);

    renderStaticText();
    checkContinueBtn();
    updateSettings();
});

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
    const motionEl = document.getElementById('setting-motion');
    if (motionEl) {
        if (motionEl.checked) document.body.classList.add('reduce-motion');
        else document.body.classList.remove('reduce-motion');
    }

    const brightEl = document.getElementById('setting-brightness');
    if (brightEl) {
        const bVal = parseInt(brightEl.value);
        const actualBrightness = 50 + bVal;
        document.getElementById('game-canvas').style.filter = `brightness(${actualBrightness}%)`;
        const valB = document.getElementById('val-brightness');
        if (valB) valB.textContent = bVal;
    }

    const masterSlider = document.getElementById('setting-master');
    const muteToggle = document.getElementById('setting-mute');
    const masterVol = masterSlider ? parseInt(masterSlider.value) / 100 : 1;
    const isMuted = muteToggle ? muteToggle.checked : false;
    
    if (masterSlider) {
        const valM = document.getElementById('val-master');
        if (valM) valM.textContent = masterSlider.value;
    }

    const musicSlider = document.getElementById('setting-music');
    if (musicSlider) {
        const vol = (parseInt(musicSlider.value) / 100) * masterVol;
        const musicEl = document.getElementById('bgm-player');
        if (musicEl) musicEl.volume = isMuted ? 0 : vol;
        const valEl = document.getElementById('val-music');
        if (valEl) valEl.textContent = musicSlider.value;
        if (!playSfxTest) playAudio('sfx', 'sfx_slider_tick.wav');
    }

    const sfxSlider = document.getElementById('setting-sfx');
    if (sfxSlider) {
        const vol = (parseInt(sfxSlider.value) / 100) * masterVol;
        const sfxEl = document.getElementById('sfx-player');
        if (sfxEl) sfxEl.volume = isMuted ? 0 : vol;

        const valEl = document.getElementById('val-sfx');
        if (valEl) valEl.textContent = sfxSlider.value;
        
        if (playSfxTest && !isMuted) {
            playAudio('sfx', 'sfx_whatsapp_notification.wav');
        }
    }

    const langBtn = document.getElementById('btn-lang-display');
    if (langBtn) {
        const langMap = { en: 'ENGLISH', si: 'සිංහල', ta: 'தமிழ்' };
        langBtn.textContent = langMap[window.gameState.lang] || 'ENGLISH';
    }
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

(function() {
    let _creditsRaf = null;
    let _creditsPos = 0;

    window.openCredits = function() {
        const screen = document.getElementById('screen-credits');
        const inner  = document.getElementById('credits-scroll-inner');
        if (!screen || !inner) return;

        if (_creditsRaf) {
            cancelAnimationFrame(_creditsRaf);
            _creditsRaf = null;
        }

        pushCreditsMusic();
        showScreen('screen-credits');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const viewH  = 1080;
                const totalH = inner.scrollHeight;

                _creditsPos = 0;
                inner.style.transform = 'translateY(' + _creditsPos + 'px)';

                const endPos = -totalH;
                const pxPerMs = 60 / 1000;

                setTimeout(function() {
                    let last = null;

                    function tick(ts) {
                        if (!last) last = ts;
                        const delta = ts - last;
                        last = ts;

                        _creditsPos -= pxPerMs * delta;
                        inner.style.transform = 'translateY(' + _creditsPos + 'px)';

                        if (_creditsPos > endPos) {
                            _creditsRaf = requestAnimationFrame(tick);
                        } else {
                            _creditsRaf = null;
                            setTimeout(closeCredits, 2500);
                        }
                    }

                    _creditsRaf = requestAnimationFrame(tick);
                }, 800);
            });
        });
    };

    window.closeCredits = function() {
        if (_creditsRaf) {
            cancelAnimationFrame(_creditsRaf);
            _creditsRaf = null;
        }

        popCreditsMusic();
        const prev = window.gameState._creditsReturnScreen || 'screen-mainmenu';
        window.gameState._creditsReturnScreen = null;
        showScreen(prev);

        setTimeout(() => {
            const inner = document.getElementById('credits-scroll-inner');
            if (inner) inner.style.transform = 'translateY(0)';
        }, 600);
    };
})();

(function() {
    let _currentTrack = null;
    let _preCreditTrack = null;
    let _fadeInterval = null;
    const FADE_STEPS = 10;
    const FADE_DURATION = 150;

    function _getTargetVol() {
        const slider = document.getElementById('setting-music');
        return slider ? parseInt(slider.value) / 100 : 0.6;
    }

    function _fadeOut(player, onComplete) {
        if (_fadeInterval) clearInterval(_fadeInterval);
        const startVol = player.volume;
        const step = startVol / FADE_STEPS;
        _fadeInterval = setInterval(() => {
            if (player.volume > step) {
                player.volume = Math.max(0, player.volume - step);
            } else {
                player.volume = 0;
                player.pause();
                clearInterval(_fadeInterval);
                _fadeInterval = null;
                if (onComplete) onComplete();
            }
        }, FADE_DURATION / FADE_STEPS);
    }

    function _fadeIn(player) {
        if (_fadeInterval) clearInterval(_fadeInterval);
        const target = _getTargetVol();
        player.volume = 0;
        _fadeInterval = setInterval(() => {
            if (player.volume < target - target / FADE_STEPS) {
                player.volume = Math.min(target, player.volume + target / FADE_STEPS);
            } else {
                player.volume = target;
                clearInterval(_fadeInterval);
                _fadeInterval = null;
            }
        }, FADE_DURATION / FADE_STEPS);
    }

    window.playMusic = function(key) {
        const src = AUDIO_assets[key];
        if (!src) return;
        const player = document.getElementById('bgm-player');
        if (!player) return;
        if (_currentTrack === key && !player.paused) return;
        _currentTrack = key;
        if (!player.paused) {
            _fadeOut(player, () => {
                player.src = src;
                player.loop = true;
                player.play().catch(() => {});
                _fadeIn(player);
            });
        } else {
            player.src = src;
            player.loop = true;
            player.play().catch(() => {});
            _fadeIn(player);
        }
    };

    window.stopMusic = function() {
        const player = document.getElementById('bgm-player');
        if (!player) return;
        _fadeOut(player, () => { _currentTrack = null; });
    };

    window.pushCreditsMusic = function() {
        _preCreditTrack = _currentTrack;
        window.playMusic('bgm_credits');
    };

    window.popCreditsMusic = function() {
        if (_preCreditTrack) {
            window.playMusic(_preCreditTrack);
            _preCreditTrack = null;
        } else {
            window.stopMusic();
        }
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
        playAudio('sfx', 'sfx_pause.wav');
    }
}

function exitToMainMenu() {
    document.getElementById('overlay-pause').classList.remove('active');
    closeDialoguePanel();
    if (!window.gameState.flags.endingReached) {
        saveGame();
    }
    playMusic('bgm_mainmenu');
    window.showScreen('screen-mainmenu');
}

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

    document.getElementById('ending-label').textContent  = ENDING_LABELS[endingKey] || 'Ending';
    document.getElementById('ending-title').textContent  = ENDING_TITLES[endingKey] || 'The Road Remains';
    document.getElementById('ending-body').textContent   = bodyText || '';

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

    document.getElementById('cons-phase-choice').style.display  = 'none';
    document.getElementById('cons-phase-ending').style.display  = 'flex';
    document.getElementById('cons-phase-ending').style.flexDirection = 'column';

    window.showScreen('screen-consequence');
    window.gameState.flags.endingReached = endingKey;
    saveGame();
}

function selectCharacter(charId) {
    const safeId = (charId === 'kumaran') ? 'Kumaran' : charId;
    window.gameState.character = safeId;
    window.gameState.gauges = { ...(CHAR_GAUGES[safeId] || { ct: 50, ih: 50, vp: 50 }) };
    unlockAchievement('big_mistake');
    try {
        if (!localStorage.getItem('plv_ever_played')) {
            localStorage.setItem('plv_ever_played', '1');
            unlockAchievement('democracy_they_said');
        }
    } catch(e) {}
    showScreen('screen-opening');
    startOpeningSequence();
}

function startOpeningSequence() {
    const container = document.getElementById('opening-lines');
    const btn = document.getElementById('opening-next');
    const ctx = document.getElementById('opening-context');
    
    container.innerHTML = '';
    btn.style.display = 'none';
    if (ctx) ctx.style.display = 'none';

    const charName = t(`char.${CHAR_KEY[window.gameState.character]}.name`);
    const subtitles = {
        Karunasena: 'First time. Get it right.',
        Kamala: 'She thought she already knew.',
        Kumaran: 'Every form is a small obstacle.'
    };
    const introLine = charName + '. ' + (subtitles[window.gameState.character] || '');
    
    const rawLines = OPENING_LINES[window.gameState.character];
    linesData = [{ text: introLine, isIntro: true }, ...rawLines.map(l => ({ text: l, isIntro: false }))];
    currentLineIdx = 0;
    
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
        playAudio('sfx', 'sfx_hold_start.wav');
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
        playAudio('sfx', 'sfx_hold_release.wav');
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
        const ctx = document.getElementById('opening-context');
        if (ctx) ctx.style.display = 'block';
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
    const ctx = document.getElementById('opening-context');
    if (ctx) ctx.style.display = 'block';
    const skipPrompt = document.getElementById('skip-prompt-el');
    if (skipPrompt) skipPrompt.style.display = 'none';
    const fill = document.getElementById('skip-hold-fill');
    if (fill) { fill.style.transition = 'none'; fill.style.width = '0%'; }
}

function startGame() {
    playMusic('bgm_game');
    showScreen('screen-game');
    document.getElementById('week-val').textContent = window.gameState.week;
    updateGauges();
    scaleMap();

    document.getElementById('screen-game').classList.add('prologue-active');
    const objBar = document.getElementById('objective-bar');
    if (objBar) objBar.style.opacity = '0';

    fetch('scenes/prologue.json')
        .then(r => r.ok ? r.json() : Promise.reject('prologue not found'))
        .then(sceneData => {
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
            console.warn('[PLV] prologue.json not found,  skipping intro scene.');
            _afterPrologueReady();
        });
}

function _afterPrologueReady() {
    document.getElementById('screen-game').classList.remove('prologue-active');
    const objBar = document.getElementById('objective-bar');
    if (objBar) {
        objBar.style.transition = 'opacity 800ms ease';
        objBar.style.opacity = '1';
    }
    checkMapUnlocks();
}

function unlockAchievement(id) {
    if (!Array.isArray(window.gameState.flags.achievements)) {
        window.gameState.flags.achievements = [];
    }
    if (window.gameState.flags.achievements.includes(id)) return;
    window.gameState.flags.achievements.push(id);
    
    try {
        localStorage.setItem('plv_achievements', JSON.stringify(window.gameState.flags.achievements));
    } catch(e) {}

    saveGame();

    const a = ACHIEVEMENTS[id];
    if (!a) return;

    const showPopup = a.notificationType === 'popup';

    if (showPopup) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <div class="toast-side-label" aria-hidden="true">UNLOCKED</div>
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

    const categories = {};
    Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
        const cat = ach.hidden ? 'Secrets' : (ach.category || 'Other');
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ id, ...ach, isEarned: earned.includes(id) });
    });

    let html = '';
    Object.entries(categories).forEach(([cat, achs]) => {
        if (cat !== 'Secrets') {
            html += `<div class="ach-category-header">${cat}</div>`;
        }
        achs.forEach(ach => {
            const isHiddenLocked = ach.hidden && !ach.isEarned;
            const isLocked = !ach.isEarned;
            
            const title = isHiddenLocked ? '???' : ach.title;
            const desc = isHiddenLocked ? 'Continue playing to uncover this secret.' : (isLocked ? '—' : ach.desc);
            const icon = ach.isEarned ? '❖' : (isHiddenLocked ? '?' : '🔒');
            const dateText = ach.isEarned ? `Unlocked` : 'Locked';
            
            if (isHiddenLocked) {
                html += `
                    <div class="ach-card locked hidden" style="justify-content: center; padding: 24px;">
                        <div class="ach-icon-frame" style="margin: 0 auto; border-color: rgba(255,255,255,0.1);">
                            <div class="ach-icon" style="color: rgba(255,255,255,0.2);">?</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="ach-card ${ach.isEarned ? 'earned' : 'locked'}">
                        <div class="ach-icon-frame">
                            <div class="ach-icon">${icon}</div>
                        </div>
                        <div class="ach-text-block">
                            <div class="ach-name">${title}</div>
                            <div class="ach-desc">${desc}</div>
                            <div class="ach-date">${dateText}</div>
                        </div>
                    </div>
                `;
            }
        });
    });

    grid.innerHTML = html;
    _updateAchievementCounter();
}

function showWeekBanner(week, isDeadline = false) {
    const existing = document.getElementById('week-banner');
    if (existing) existing.remove();
    
    const char = window.gameState.character || 'Karunasena';
    
    const bgMap = {
        'Karunasena': 'assets/backgrounds/bg_prologue_k.webp',
        'Kamala': 'assets/backgrounds/bg_prologue_ka.webp',
        'Kumaran': 'assets/backgrounds/bg_prologue_ku.webp'
    };
    const bgImg = bgMap[char] || bgMap['Karunasena'];
    
    const narrativeData = {
        'Karunasena': [
            "ELECTION DAY\nThe polling station is open. Time to make a choice.",
            "1 WEEK UNTIL THE ELECTION\nThe tension is palpable.",
            "2 WEEKS UNTIL THE ELECTION\nThe campaign is at its peak.",
            "3 WEEKS UNTIL THE ELECTION\nThe candidate list is out.",
            "4 WEEKS UNTIL THE ELECTION\nRegistration closes soon.",
            "5 WEEKS UNTIL THE ELECTION\nRumors are spreading.",
            "6 WEEKS UNTIL THE ELECTION\nFirst time. Get it right."
        ],
        'Kamala': [
            "ELECTION DAY\nTime to see if the town listened.",
            "1 WEEK UNTIL THE ELECTION\nShe thought she already knew.",
            "2 WEEKS UNTIL THE ELECTION\nThe manifesto is being debated.",
            "3 WEEKS UNTIL THE ELECTION\nThe faces are on the board.",
            "4 WEEKS UNTIL THE ELECTION\nThe deadline is looming.",
            "5 WEEKS UNTIL THE ELECTION\nWhispers in the market.",
            "6 WEEKS UNTIL THE ELECTION\nShe thought she already knew."
        ],
        'Kumaran': [
            "ELECTION DAY\nYour voice matters too.",
            "1 WEEK UNTIL THE ELECTION\nThe final stretch.",
            "2 WEEKS UNTIL THE ELECTION\nTrying to understand the promises.",
            "3 WEEKS UNTIL THE ELECTION\nChecking the lists.",
            "4 WEEKS UNTIL THE ELECTION\nEvery form is a small obstacle.",
            "5 WEEKS UNTIL THE ELECTION\nThe town feels different.",
            "6 WEEKS UNTIL THE ELECTION\nEvery form is a small obstacle."
        ]
    };
    
    const textArr = narrativeData[char] || narrativeData['Karunasena'];
    const storyText = textArr[week] || `${week} WEEKS UNTIL THE ELECTION\nTime passes.`;
    const parts = storyText.split('\n');
    const headline = parts[0];
    const subtext = parts[1] || "";

    const banner = document.createElement('div');
    banner.id = 'week-banner';
    banner.style.cssText = `
        position: absolute; inset: 0; z-index: 9999;
        background: #000 url('${bgImg}') center/cover no-repeat;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 800ms ease;
    `;
    
    banner.innerHTML = `
        <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.75);"></div>
        <div style="position: relative; z-index: 2; text-align: center; color: #fff; padding: 0 20px;">
            <h1 style="font-family: var(--font-title); font-size: 3rem; font-weight: 400; letter-spacing: 0.1em; margin-bottom: 1.5rem; text-shadow: 0 4px 12px rgba(0,0,0,0.8);">${headline}</h1>
            <p style="font-family: var(--font-body); font-size: 1.25rem; font-weight: 300; opacity: 0.8; letter-spacing: 0.05em; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">${subtext}</p>
            ${isDeadline ? `<p style="margin-top: 3rem; font-size: 0.8rem; color: var(--red-light); text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">Voter registration closes this week</p>` : ''}
        </div>
    `;
    document.getElementById('screen-game').appendChild(banner);
    
    void banner.offsetWidth;
    banner.style.opacity = '1';
    
    setTimeout(() => { 
        banner.style.opacity = '0'; 
        setTimeout(() => banner.remove(), 800); 
    }, 4500);
}

function checkMapUnlocks() {
    const cafe = document.querySelector('[data-loc="loc7"]');
    if (cafe) {
        const shouldShow = window.gameState.flags.skepticsCafeUnlocked
            || (window.gameState.flags.verifiedCount >= 3);
        if (shouldShow) {
            cafe.classList.add('unlocked');
            if (!window.gameState.flags.skepticsCafeUnlocked) {
                unlockAchievement('you_found_the_cafe');
                playAudio('sfx', 'sfx_map_unlock.wav');
            }
            window.gameState.flags.skepticsCafeUnlocked = true;
        } else {
            cafe.classList.remove('unlocked');
        }
    }

    const week = window.gameState.week;
    const flags = window.gameState.flags;
    const char = window.gameState.character;
    const visited = flags.visitedLocs || [];
    const completed = flags.completedLocs || [];
    const isVisited = (pathMatch) => visited.some(p => p.includes(pathMatch)) || completed.some(p => p.includes(pathMatch));

    const w6UncleDone = isVisited('uncle_house_entry') || isVisited('uncle_house_shared') || isVisited('uncle_house_ignore') || isVisited('uncle_house_verify') || isVisited('ec_board_w6');
    const w5UncleDone = isVisited('uncle_house_w5_shared') || isVisited('uncle_house_w5_verify') || isVisited('ec_board_w5');
    const w4UncleDone = isVisited('uncle_house_w4_shared') || isVisited('ec_board_w4');

    let weekComplete = false;
    if (week === 6) {
        const w6GramaDone = flags.registrationStarted || isVisited('grama_office_w6_Kamala') || isVisited('grama_office_w6_kumaran') || isVisited('grama_office_w6') || isVisited('week6/grama_office');
        weekComplete = (char === 'Karunasena') ? (w6UncleDone && w6GramaDone) : w6GramaDone;
    } else if (week === 5) {
        const w5MainDone = isVisited('ec_board_w5') || isVisited('police_w5');
        weekComplete = (char === 'Karunasena') ? (w5UncleDone && w5MainDone) : w5MainDone;
    } else if (week === 4) {
        const w4GramaDone = flags.registrationComplete || flags.registrationDeadlineMissed;
        weekComplete = (char === 'Karunasena') ? (w4UncleDone && w4GramaDone) : w4GramaDone;
    } else if (week === 3) {
        weekComplete = isVisited('ec_board_w3');
    } else if (week === 2) {
        weekComplete = isVisited('campaign_tent') || flags.readCurrentManifesto;
    } else if (week === 1) {
        const w1MainDone = flags.verifiedBallotFold || isVisited('police_w1') || isVisited('grama_office_w1');
        const w1UncleDone = isVisited('uncle_house_w1_shared') || w1MainDone;
        weekComplete = (char === 'Karunasena') ? (w1UncleDone && w1MainDone) : w1MainDone;
    }

    const OBJECTIVES = {
        6: (() => {
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek6Delivered) return "Visit Uncle Sirisena's house. He sent you something.";
                if (!w6UncleDone) return "You have a message from Uncle Sirisena. Decide what to do with it.";
                if (!flags.registrationStarted && !flags.registrationComplete && !isVisited('grama_office_w6')) return "Head to the Grama Sevaka Office to check your voter registration.";
                return "You are registered. Explore Alupotha if you like, or advance to the next week.";
            }
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
            ? "You have read the manifesto. Explore further or advance to the next week."
            : "Mahinda Bandara's campaign tent is open. Read the manifesto.",
        1: flags.verifiedBallotFold
            ? "You are ready. Election day is tomorrow."
            : "There is a message about how to fold your ballot. Verify it first.",
        0: "Election day. Go to the polling station."
    };

    const guidanceText = document.getElementById('objective-text');
    if (guidanceText) {
        if (weekComplete && week > 0) {
            guidanceText.textContent = "You have completed your tasks. Advance to the next week.";
        } else {
            guidanceText.textContent = OBJECTIVES[week] || "Continue exploring Alupotha.";
        }
    }

    let pulseTarget = null;
    
    if (!weekComplete) {
        if (week === 6) {
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek6Delivered) pulseTarget = 'loc2';
                else if (!w6UncleDone) pulseTarget = 'loc2';
                else if (!flags.registrationStarted) pulseTarget = 'loc1';
                else pulseTarget = 'loc3';
            } else {
                if (!flags.registrationStarted && !flags.registrationComplete && !isVisited('grama_office')) pulseTarget = 'loc1';
            }
        } else if (week === 5) {
            if (char === 'Karunasena') {
                if (!flags.uncleMsgWeek5Delivered) pulseTarget = 'loc2';
                else if (!w5UncleDone) pulseTarget = 'loc3';
                else pulseTarget = 'loc3';
            } else {
                pulseTarget = 'loc3';
            }
        } else if (week === 4) {
            if (!flags.registrationComplete && !flags.registrationDeadlineMissed) pulseTarget = 'loc1';
            else if (char === 'Karunasena' && !w4UncleDone) pulseTarget = 'loc3';
            else pulseTarget = 'loc3';
        } else if (week === 3) {
            if (char === 'Kumaran' && flags.kumaran_transferStepsComplete === 2 && !flags.registrationComplete) pulseTarget = 'loc1';
            else pulseTarget = 'loc3';
        } else if (week === 2) {
            if (!flags.readCurrentManifesto) pulseTarget = 'loc8';
        } else if (week === 1) {
            if (!flags.verifiedBallotFold) pulseTarget = 'loc6';
        }
    }

    if (week === 0) {
        pulseTarget = 'loc9';
    }

    document.querySelectorAll('.map-location').forEach(g => {
        g.classList.remove('pulse-active');
        g.classList.remove('map-visited');
        g.style.filter = '';
        
        const locId = g.dataset.loc;
        const scenePath = getScenePath(locId);
        const isCompleted = scenePath && completed.includes(scenePath);

        if (isCompleted && locId !== 'loc9' && locId !== 'loc_kovil' && locId !== 'loc_temple') {
            g.classList.add('map-visited');
            g.style.filter = 'brightness(0.6) grayscale(0.5)';
        }

        if (pulseTarget && locId === pulseTarget) {
            g.classList.add('pulse-active');
            g.style.filter = '';
        }
    });
}

function checkWeekCompletion() {
    const week = window.gameState.week;
    const flags = window.gameState.flags;
    const char = window.gameState.character;
    const visited = flags.visitedLocs || [];
    const completed = flags.completedLocs || [];
    
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
        const w5MainDone = isVisited('ec_board_w5') || isVisited('police_w5');
        weekComplete = (char === 'Karunasena') ? (w5UncleDone && w5MainDone) : w5MainDone;
    } else if (week === 4) {
        const w4GramaDone = flags.registrationComplete || flags.registrationDeadlineMissed;
        weekComplete = (char === 'Karunasena') ? (w4UncleDone && w4GramaDone) : w4GramaDone;
    } else if (week === 3) {
        weekComplete = isVisited('ec_board_w3');
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
    if (existingBanner) return;

    const dialogueOpen = document.getElementById('dialogue-panel').classList.contains('open');
    const consequenceActive = document.getElementById('screen-consequence').classList.contains('active');
    if (dialogueOpen || consequenceActive) return;

    const nextWeek = currentWeek - 1;
    const banner = document.createElement('div');
    banner.id = 'next-week-banner';
    
    const isElectionDay = (nextWeek === 0);
    const headline = isElectionDay
        ? 'The polling station is now open.'
        : `${nextWeek} week${nextWeek === 1 ? '' : 's'} until election day.`;
    const advanceLbl = isElectionDay ? 'Go to Polling Station' : `Continue to Week ${nextWeek}`;
    const stayLbl = isElectionDay ? 'Not yet' : 'Stay & Explore';
    
    banner.innerHTML = `
        <div class="week-banner-headline">${headline}</div>
        <div class="week-banner-actions">
            <button class="week-banner-stay" onclick="dismissWeekBanner()">${stayLbl}</button>
            <button class="week-banner-advance" onclick="advanceWeek()">${advanceLbl}</button>
        </div>
    `;
    document.getElementById('screen-game').appendChild(banner);
    
    requestAnimationFrame(() => requestAnimationFrame(() => {
        banner.classList.add('visible');
    }));
}

function dismissWeekBanner() {
    const banner = document.getElementById('next-week-banner');
    if (banner) {
        banner.style.transition = 'opacity 300ms';
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.remove();
            checkMapUnlocks();
        }, 300);
    }
}

function advanceWeek() {
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
    else if (_safetyWeek === 3) { _canAdvance = _isV('ec_board_w3'); }
    else if (_safetyWeek === 2) { _canAdvance = _isV('campaign_tent') || _flags.readCurrentManifesto; }
    else if (_safetyWeek === 1) { const d = _flags.verifiedBallotFold || _isV('police_w1') || _isV('grama_office_w1'); _canAdvance = (_char === 'Karunasena') ? ((_isV('uncle_house_w1_shared') || d) && d) : d; }
    else { _canAdvance = true; }
    if (!_canAdvance) { console.warn('[PLV] advanceWeek blocked,  week not yet complete.'); return; }

    const banner = document.getElementById('next-week-banner');
    if (banner) banner.remove();
    const newWeek = window.gameState.week - 1;
    window.gameState.week = newWeek;
    document.getElementById('week-val').textContent = newWeek;
    showWeekBanner(newWeek, newWeek === 4);
    playAudio('sfx', 'sfx_week_transition.wav');
    saveGame();
    checkMapUnlocks();
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

function checkWeekAdvance() {
}

function showConsequence(text, deltas, prev) {
    document.getElementById('cons-phase-choice').style.display = 'flex';
    document.getElementById('cons-phase-ending').style.display = 'none';
    
    const badgesCont = document.getElementById('cons-changes');
    badgesCont.innerHTML = '';
    
    for(const [k, v] of Object.entries(deltas)) {
        if(v === 0) continue;
        const label = document.querySelector(`[data-i18n="gauge.${k}"]`)
            ? document.querySelector(`[data-i18n="gauge.${k}"]`).textContent
            : k.toUpperCase();
        badgesCont.innerHTML += `<div class="cons-badge gauge-badge-${k}">${label} ${v > 0 ? '+'+v : v}</div>`;
    }
    
    const eyebrow = document.querySelector('.cons-eyebrow');
    if (eyebrow) eyebrow.textContent = "Consequence";

    document.getElementById('cons-text').textContent = text || "You made a choice.";
    updateGauges(true);
    const consScreen = document.getElementById('screen-consequence');
    consScreen.classList.add('active');
    consScreen.removeAttribute('aria-hidden');
    consScreen.style.zIndex = '200';
    playAudio('sfx', 'sfx_consequence_hit.wav');
}

function returnToGame() {
    showScreen('screen-game');
    const wrapper = document.getElementById('dialogue-scene-wrapper');
    const panel   = document.getElementById('dialogue-panel');
    const backBtn = document.getElementById('location-back-btn');
    if (wrapper) wrapper.classList.remove('active');
    if (panel)   panel.classList.remove('open');
    if (backBtn) backBtn.classList.remove('visible');
    const objBar = document.getElementById('objective-bar');
    if (objBar) objBar.style.opacity = '1';
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
    const badVote = flags.ballotSpoiled;
    
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

    const consScreen = document.getElementById('screen-consequence');
    const consBg = document.getElementById('bg-consequence');
    
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
    
    const ENDING_LABELS_MAP = { bad: 'Bad Ending', neutral: 'Neutral Ending', good: 'Good Ending', secret: 'Secret Ending' };
    document.getElementById('ending-title').textContent = endingTitle;
    document.getElementById('ending-body').textContent = endingText;
    document.getElementById('ending-label').textContent = ENDING_LABELS_MAP[endingType] || 'The Election Has Passed';
    
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

    document.getElementById('cons-phase-choice').style.display  = 'none';
    document.getElementById('cons-phase-ending').style.display  = 'flex';
    document.getElementById('cons-phase-ending').style.flexDirection = 'column';

    updateGauges(true);
    window.showScreen('screen-consequence');
    document.getElementById('screen-consequence').style.zIndex = '';

    unlockAchievement('the_road_remains');
    unlockAchievement('you_finished_an_education_game');
    if (endingType === 'secret') {
        unlockAchievement('the_unbroken_chain');
    }
    if (window.gameState.flags.registrationDeadlineMissed) {
        unlockAchievement('the_door_was_right_there');
    }
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
    const allUncleDelivered = _flags.uncleMsgWeek6Delivered && _flags.uncleMsgWeek5Delivered && _flags.uncleMsgWeek4Delivered;
    const allUncleIgnored = !_flags.uncleVisited && (_flags.karunasena_dismissedCount || 0) === 0 && !_flags.sharedAnyFakeMessage;
    if (_char === 'Karunasena' && allUncleDelivered && allUncleIgnored) {
        unlockAchievement('blanket_policy');
    }
    if (_flags.sharedFake4amMessage) unlockAchievement('the_4am_people');
    if (_flags.sharedFakeMessage_w6 || _flags.sharedFakeVoicenote_w5 || _flags.sharedFake4amMessage || _flags.sharedFakeCandidateList) {
        unlockAchievement('847_members');
    }
    if (_flags.sharedFakeBallotFold || _flags.ballotWillBeSpoiled) {
        unlockAchievement('you_were_so_confident');
    }

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
    } catch(e) {}

    window.gameState.flags.endingReached = endingType;

    try {
        localStorage.removeItem('plv_save');
    } catch(e) {}
}

function showGaugeTutorial() {
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
        
        if (!fill) return;
        
        if(!animate) {
            fill.style.transition = 'none';
            void fill.offsetWidth;
        }
        
        fill.style.width = `${val}%`;
        
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
        
        if (subtitleEl && saveData.character) {
            const safeChar = saveData.character.charAt(0).toUpperCase() + saveData.character.slice(1).toLowerCase();
            const charName = t(`char.${CHAR_KEY[safeChar] || 'k'}.name`);
            subtitleEl.textContent = `${charName}, Alupotha is waiting for you.`;
        }
    } else {
        if (btnContinue) btnContinue.style.display = 'none';
        if (btnNewGame) btnNewGame.classList.add('primary');
        
        if (subtitleEl) subtitleEl.textContent = t('menu.subtitle');
    }
}

function checkNewGame() {
    if (localStorage.getItem('plv_save')) {
        openModal('modal-overwrite');
    } else {
        startNewGame();
    }
}

function startNewGame() {
    let earnedAchievements = [];
    try {
        const storedAchs = localStorage.getItem('plv_achievements');
        if (storedAchs) earnedAchievements = JSON.parse(storedAchs);
    } catch(e) {}
    
    localStorage.removeItem('plv_save');

    const defaultFlags = {
        visitedLocs: [], completedLocs: [], achievements: earnedAchievements,
        endingReached: null, secretEndingReached: false,
        uncleMsgWeek6Delivered: false, uncleMsgWeek5Delivered: false, uncleMsgWeek4Delivered: false,
        uncleMsgWeek3Delivered: false, uncleMsgWeek2Delivered: false, uncleMsgWeek1Delivered: false,
        sharedFakeMessage_w6: false, sharedFakeVoicenote_w5: false, sharedFake4amMessage: false,
        sharedFakeCandidateList: false, sharedFakeBallotFold: false, sharedAnyFakeMessage: false,
        uncleVisited: false, registrationStarted: false, registrationComplete: false,
        registrationDeadlineMissed: false, gremaOfficeVisited: false,
        verifiedAtBoardCount: 0, verifiedCount: 0,
        foundRoadFile: false, found1977Receipt: false, foundOldManifesto: false,
        manifestoComparisonDone: false, foundSergeantTransferThread: false,
        heardAbout2016Road: false, foundSandyaNote: false, sandyaOnRegister: false,
        skepticsCafeUnlocked: false, joinedCafe: false, readCurrentManifesto: false,
        reportedIllegalPosters: false, reportedVoterIntimidation: false,
        verifiedBallotFold: false, willFoldInThirds: false,
        kamala_wrongAssumption_pollingStation: false, helpedElderlyWoman: false,
        helpedNICYoungMan: false, helpedLostCouple: false, votedSuccessfully: false,
        ballotSpoiled: false, ballotWillBeSpoiled: false, clue_roadFile_delivered: false,
        clue_manifesto_delivered: false, clue_cafe_delivered: false, karunasena_dismissedCount: 0,
        kamala_assumptionsCorrected: 0, kumaran_transferStepsComplete: 0, sharedFakeMessage: false,
        cameFromUncle: false, ignored: false, attendedHall: false, dismissedMessages: 0,
        gaugesTutorialSeen: false, _ach_alg_fired: false, _ach_skeptic_fired: false,
        _ach_helpers_fired: false, _ach_ih100_fired: false, _ach_spreads_fired: false,
        _ach_sandya_fired: false, _ach_roadfile_fired: false, _ach_receipt_fired: false,
        _ach_sergeant_fired: false, _ach_nandadasa_fired: false, _ach_manifesto_fired: false,
        _ach_readmanifesto_fired: false, _ach_elderly_fired: false, sharedVerifiedInfo: false
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

function _getActiveFocusableButtons() {
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

    const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Escape'];
    if (gameKeys.includes(e.key)) {
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'SELECT' &&
            document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }

    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }
        const creditsScreen = document.getElementById('screen-credits');
        if (creditsScreen && creditsScreen.classList.contains('active')) {
            closeCredits();
            return;
        }
        if (screen === 'screen-opening') { skipOpening(); return; }
        if (tutorialOpen) { dismissGaugeTutorial(); return; }
        
        if (screen === 'screen-character' || screen === 'screen-achievements') {
            showScreen('screen-mainmenu');
            return;
        }
        
        if (pauseActive) { togglePause(); return; }
        if (dialogueOpen) { closeDialoguePanel(); return; }
        if (screen === 'screen-game') { togglePause(); return; }
        return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Tab') {
        if (!e.shiftKey) _kbNavigate(1);
        return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        _kbNavigate(-1);
        return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && (focused.tagName === 'BUTTON' || focused.getAttribute('role') === 'button')) {
            focused.click();
            return;
        }
        if (dialogueOpen && !window.gameState.dialogue._waiting) {
            advanceDialogue();
        }
        return;
    }

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

window.promptCharacterConfirm = function(charId) {
    const safeCharId = (charId === 'kumaran') ? 'Kumaran' : charId;

    const key = { Karunasena: 'k', Kamala: 'ka', Kumaran: 'ku' }[safeCharId];
    document.querySelectorAll('.clickable-card').forEach(card => {
        const nameEl = card.querySelector('[data-i18n]');
        if (nameEl && nameEl.getAttribute('data-i18n') === `char.${key}.name`) {
            card.classList.add('card-selected');
            setTimeout(() => card.classList.remove('card-selected'), 500);
        }
    });

    document.getElementById('confirm-char-name').textContent = safeCharId;

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

    document.getElementById('confirm-char-btn').onclick = function() {
        closeModal('modal-char-confirm');
        selectCharacter(safeCharId);
    };

    openModal('modal-char-confirm');
};