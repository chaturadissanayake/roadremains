let _pendingGoto = null;

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
    }
    else if (week === 2) {
        if (locId === 'loc3') targetSceneId = 'w2_ec_board';
        else if (locId === 'loc4') targetSceneId = 'w2_boutique';
        else if (locId === 'loc6') targetSceneId = 'w2_police';
        else if (locId === 'loc8') targetSceneId = 'w2_campaign_tent_entry';
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

    if (locId === 'loc5') {
        renderDialogue({
            lines: [
                { type: "narration", text: "The Community Hall is quiet. There is a notice on the door about an event next week, but nothing is happening here today." }
            ],
            on_complete: { goto: "screen_map" }
        });
        return;
    }
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
    
    if (!Array.isArray(window.gameState.flags.completedLocs)) {
        window.gameState.flags.completedLocs = [];
    }
    const isFullyCompleted = path && window.gameState.flags.completedLocs.includes(path);
    
    if (!path || path.endsWith('_map') || path === 'screen_map' || isFullyCompleted) {
        playAudio('sfx', 'sfx_click_negative.wav');
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
    const vIdx = window.gameState.flags.visitedLocs.indexOf(scenePath);
    if (vIdx !== -1) window.gameState.flags.visitedLocs.splice(vIdx, 1);

    try {
        const response = await fetch(scenePath);
        if (!response.ok) throw new Error(`Scene not found: ${scenePath}`);
        const sceneData = await response.json();
        window.gameState.flags.visitedLocs.push(scenePath);
        window.gameState._pendingScenePath = scenePath;
        renderDialogue(sceneData);
    } catch (error) {
        console.warn('[PLV] Scene load failed:', error.message);
        if (!window.gameState.flags.visitedLocs.includes(scenePath)) {
            window.gameState.flags.visitedLocs.push(scenePath);
        }
        if (!window.gameState.flags.completedLocs.includes(scenePath)) {
            window.gameState.flags.completedLocs.push(scenePath);
        }
        saveGame();
        checkWeekCompletion();
        checkMapUnlocks();

        if (window.gameState.week === 0 && (scenePath.includes('polling') || scenePath.includes('w0'))) {
            triggerEnding();
            return;
        }

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
}

function openDialoguePanel() {
    document.getElementById('dialogue-scene-wrapper').classList.add('active');
    document.getElementById('dialogue-panel').classList.add('open');
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.add('visible');
    const bgLayer = document.getElementById('location-bg-layer');
    const sceneBg = window.gameState.dialogue._sceneBg;
    const bgUrl = (sceneBg && BG_MAP[sceneBg])
        || (window.gameState.currentLoc && LOC_BGS[window.gameState.currentLoc] ? LOC_BGS[window.gameState.currentLoc] : null);
    document.getElementById('objective-bar').style.opacity = '0';
    
    if (bgUrl) {
        bgLayer.style.backgroundImage = `url('${bgUrl}')`;
        const bgName = bgUrl.split('/').pop().split('.')[0]; 
        const audioMap = {
            'bg_grama_office': 'ambient_grama_office',
            'bg_uncle_house': 'ambient_uncle_house',
            'bg_boutique': 'ambient_boutique',
            'bg_police': 'ambient_police',
            'bg_campaign_tent': 'ambient_tent',
            'bg_ec_board': 'ambient_ec_board',
            'bg_polling_station': 'ambient_polling'
        };
        if (audioMap[bgName] && window.playMusic) {
            window.playMusic(audioMap[bgName]);
        }
    }
}

function closeDialoguePanel() {
    if (document.getElementById('screen-game')?.classList.contains('prologue-active')) {
        _afterPrologueReady();
    }
    document.getElementById('dialogue-scene-wrapper').classList.remove('active');
    document.getElementById('dialogue-panel').classList.remove('open');
    const backBtn = document.getElementById('location-back-btn');
    if (backBtn) backBtn.classList.remove('visible');
    document.getElementById('objective-bar').style.opacity = '1';
    
    if (window.gameState.screen === 'screen-game') {
        if (window.playMusic) window.playMusic('bgm_game');
        checkWeekCompletion();
        checkMapUnlocks(); 
        
        if (window.gameState.week === 6 && !window.gameState.flags.gaugesTutorialSeen) {
            setTimeout(() => showGaugeTutorial(), 800);
        }
    }
}

window._lastSfxTime = 0;

function playAudio(type, fileName) {
    if (type === 'bgm') {
        const player = document.getElementById('bgm-player');
        if (!player) return;
        if (player.src.includes(fileName)) {
            if (player.paused) player.play().catch(() => {});
            return;
        }
        player.src = `assets/audio/${fileName}`;
        player.play().catch(() => {});
    } else {
        const now = Date.now();
        if (now - window._lastSfxTime < 100) return;
        window._lastSfxTime = now;

        const player = document.getElementById('sfx-player');
        if (!player) return;

        const sfxSlider = document.getElementById('setting-sfx');
                player.volume = sfxSlider ? parseInt(sfxSlider.value) / 100 : 0.45;
                
                player.src = `assets/audio/${fileName}`;
        player.play().catch(() => {});
    }
}

function stopBGM() {
    const player = document.getElementById('bgm-player');
    if (player) {
        player.pause();
        player.currentTime = 0;
    }
}

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
        const charPortraits = CHARACTER_PORTRAITS && CHARACTER_PORTRAITS[state.character];
        const src = (charPortraits && charPortraits[em])
            ? charPortraits[em]
            : `assets/characters/char_${state.character.toLowerCase()}_${em}.png`;
        cont.innerHTML = `<img src="${src}" data-initials="PC" onerror="imgFallback(this)" alt="Player character" class="pc-portrait-img">`;
        if (em !== 'neutral') state.flags.latestEmotion = em;
    }
}

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

function _getUIAsset(key) {
    return (UI_assets && UI_assets[key]) ? UI_assets[key] : `assets/ui/${key}.png`;
}

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

function renderDialogue(sceneDef) {
    const state = window.gameState;

    if (sceneDef.flags_set_on_enter && Array.isArray(sceneDef.flags_set_on_enter)) {
        sceneDef.flags_set_on_enter.forEach(flag => { state.flags[flag] = true; });
        saveGame();
    }

    const allLines = (sceneDef.lines || []).filter(line => {
        if (line.character_only && line.character_only !== state.character) return false;
        if (line.condition && !_evalCondition(line.condition)) return false;
        return true;
    });

    state.dialogue = {
        active: true,
        currentLine: 0,
        lines: allLines,
        on_complete: sceneDef.on_complete || null,
        _sceneBg: sceneDef.background || null,
        _scenePath: state._pendingScenePath || null,
        _waiting: false,
        _choiceLocked: false
    };
    state._pendingScenePath = null;

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

function advanceDialogue() {
    const d = window.gameState.dialogue;

    if (d._waiting) return;
    playAudio('sfx', 'sfx_dialogue_advance.wav');

    if (d.currentLine >= d.lines.length) {
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

    contBtn.style.display = 'none';
    optsEl.style.display  = 'none';
    optsEl.innerHTML = '';
    textEl.className = 'dialogue-text';

    switch (line.type) {

        case 'dialogue': {
            textEl.classList.add('line-dialogue');
            const _pcEmotion = (line.speaker === window.gameState.character) ? (line.emotion || 'talking') : 'neutral';
            _setPcPortrait(_pcEmotion);
            _setNpcPortrait(line.portrait_state || null, line.speaker || '', line.npc_flip || false);
            document.getElementById('dialogue-panel').classList.remove('panel-expanded');
            
            const speakerLower = (line.speaker || '').toLowerCase();
            let nameColor = 'var(--gold)';
            if (speakerLower.includes('police') || speakerLower.includes('sergeant') || speakerLower.includes('officer')) nameColor = 'var(--slate)';
            if (speakerLower.includes('mahinda') || speakerLower.includes('candidate')) nameColor = 'var(--garnet)';
            document.getElementById('dialogue-npc-name').style.color = nameColor;

            textEl.innerHTML = line.text || '';
            contBtn.style.display = 'block';
            break;
        }

        case 'narration': {
            textEl.classList.add('line-narration');
            document.getElementById('dialogue-portrait-container').innerHTML = '';
            document.getElementById('dialogue-npc-name').textContent = '';
            _setPcPortrait('neutral');
            textEl.innerHTML = `<em>${line.text || ''}</em>`;
            contBtn.style.display = 'block';
            break;
        }

        case 'whatsapp': {
            textEl.classList.add('line-media');
            playAudio('sfx', 'sfx_whatsapp_notification.wav');
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
            contBtn.style.display = 'block';
            break;
        }

        case 'voicenote': {
            textEl.classList.add('line-media');
            playAudio('sfx', 'sfx_whatsapp_notification.wav');
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
            playAudio('sfx', 'sfx_paper_crinkle.wav');
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
            playAudio('sfx', 'sfx_paper_crinkle.wav');
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
            textEl.classList.add('line-choice');
            _setNpcPortrait(line.portrait_state || null, line.speaker || '', line.npc_flip || false);
            document.getElementById('dialogue-panel').classList.add('panel-expanded');
            textEl.innerHTML = `<span class="choice-prompt">${line.prompt || line.text || ''}</span>`;

            const choices = line.choices || [];
            optsEl.innerHTML = '';
            choices.forEach(opt => {
                if (opt.condition && !_evalCondition(opt.condition)) return;
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                let labelText = opt.label || opt.text || '';
                if (opt.perk === 'curiosity') {
                    btn.classList.add('curiosity-option');
                }
                btn.textContent = labelText;
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('curiosity-option')) {
                        playAudio('sfx', 'sfx_curiosity_click.wav');
                    }
                    _applySceneChoice(opt);
                });
                optsEl.appendChild(btn);
            });

            optsEl.style.display = 'flex';
            contBtn.style.display = 'none';
            window.gameState.dialogue._waiting = true;
            break;
        }

        default: {
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

function _applySceneChoice(opt) {
    const state = window.gameState;
    if (state.dialogue._choiceLocked) return;
    state.dialogue._choiceLocked = true;
    state.dialogue._waiting = false;

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });

    const gaugeDeltas = opt.gauges || {};
    const prevGauges = { ...state.gauges };
    for (const [k, v] of Object.entries(gaugeDeltas)) {
        state.gauges[k] = Math.max(0, Math.min(100, state.gauges[k] + v));
    }

    (opt.flags_set || []).forEach(flagKey => {
        state.flags[flagKey] = true;
    });
    if (opt.flags_set && opt.flags_set.includes('sharedVerifiedInfo')) {
        state.flags.sharedVerifiedInfo = true;
    }
    if (opt.label && (opt.label.includes('verify') || opt.label.includes('Verify')) && !opt.flags_set?.includes('sharedFakeMessage')) {
        state.flags.sharedVerifiedInfo = true;
    }

    const increments = opt.flags_increment || {};
    for (const [k, v] of Object.entries(increments)) {
        state.flags[k] = (state.flags[k] || 0) + v;
    }

    if (opt.achievement) unlockAchievement(opt.achievement);

    _checkAutoAchievements();

    if (gaugeDeltas.ih > 0)  state.flags.latestEmotion = 'happy';
    else if (gaugeDeltas.ct < 0) state.flags.latestEmotion = 'worried';
    else state.flags.latestEmotion = 'neutral';

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

    if (state.flags.verifiedAtBoardCount > (state.flags.verifiedCount || 0)) {
        state.flags.verifiedCount = state.flags.verifiedAtBoardCount;
    }

    saveGame();
    checkMapUnlocks();

    if (opt.goto) {
        _navigateGoto(opt.goto);
    } else if (state.dialogue.on_complete) {
        _resolveOnComplete(state.dialogue.on_complete);
    } else {
        closeDialoguePanel();
    }
}

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

function _navigateGoto(target) {
    if (!target) return;

    if (target.endsWith('_map') || target === 'screen_map') {
        const panel = document.getElementById('dialogue-panel');
        if (panel && panel.classList.contains('open')) {
            closeDialoguePanel();
        }
        showScreen('screen-game');
        return; 
    }

    if (target === 'screen_character_select') { showScreen('screen-character'); return; }
    if (target === 'triggerEnding')            { triggerEnding(); return; }
    if (target === 'checkWeekCompletion')      { checkWeekCompletion(); return; }

    const hasEndingCompleted = window.gameState.flags.completedLocs &&
        window.gameState.flags.completedLocs.some(p => p.includes('ending_good') || p.includes('ending_bad') || p.includes('ending_neutral') || p.includes('ending_secret'));
    
    if (target === 'screen_main_menu') {
        if (!window.gameState.flags.endingReached && (window.gameState.week === 0 || hasEndingCompleted)) {
            triggerEnding();
        } else {
            showScreen('screen-mainmenu');
        }
        return;
    }

    if (target.startsWith('scenes/')) {
        openScenePath(target);
        return;
    }

    const path = _sceneIdToPath(target);
    if (path) {
        openScenePath(path);
    } else {
        console.warn('[PLV] Unknown goto target:', target);
        closeDialoguePanel();
    }
}

function _sceneIdToPath(sceneId) {
    if (!sceneId) return null;
    const SCENE_ID_MAP = {
        'prologue':                        'scenes/prologue.json',
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
        'w5_uncle_voicenote':              'scenes/week5/uncle_house_w5.json',
        'w5_uncle_voicenote_shared':       'scenes/week5/uncle_house_w5_shared.json',
        'w5_uncle_voicenote_skeptic':      'scenes/week5/uncle_house_w5_verify.json',
        'w5_ec_board_verify':              'scenes/week5/ec_board_w5.json',
        'w5_boutique':                     'scenes/week5/boutique_w5.json',
        'w5_police_optional':              'scenes/week5/police_w5.json',
        'w5_police_intimidation_info':     'scenes/week5/police_w5_intimidation.json',
        'w5_transition':                   'scenes/week5/week5_transition.json',
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
        'w2_campaign_tent_entry':          'scenes/week2/campaign_tent_w2.json',
        'w2_campaign_tent_manifesto':      'scenes/week2/campaign_tent_manifesto.json',
        'w2_campaign_tent_oldbox':         'scenes/week2/campaign_tent_oldbox.json',
        'w2_police':                       'scenes/week2/police_w2.json',
        'w2_ec_board':                     'scenes/week2/ec_board_w2.json',
        'w2_boutique':                     'scenes/week2/boutique_w2.json',
        'w2_transition':                   'scenes/week2/week2_transition.json',
        'w1_uncle_ballotfold':             'scenes/week1/uncle_house_w1.json',
        'w1_uncle_ballotfold_believed':    'scenes/week1/uncle_house_w1_believed.json',
        'w1_uncle_ballotfold_shared':      'scenes/week1/uncle_house_w1_shared.json',
        'w1_police_ballotfold_verify':     'scenes/week1/police_w1.json',
        'w1_ec_board':                     'scenes/week1/ec_board_w1.json',
        'w1_grama_final':                  'scenes/week1/grama_office_w1.json',
        'w1_campaign_tent_readonly':       'scenes/week1/campaign_tent_w1.json',
        'w1_transition':                   'scenes/week1/week1_transition.json',
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

document.addEventListener('DOMContentLoaded', () => {
    const textEl = document.getElementById('dialogue-text');
    const contBtn = document.getElementById('dialogue-continue');
    if (textEl) textEl.addEventListener('click', advanceDialogue);
    if (contBtn) contBtn.addEventListener('click', advanceDialogue);
});

function applyChoice(choice) {
    const deltas = choice.effect || {};
    const prev = { ...window.gameState.gauges };
    for (const [k, v] of Object.entries(deltas)) {
        window.gameState.gauges[k] = Math.max(0, Math.min(100, window.gameState.gauges[k] + v));
    }
    const totalDelta = Object.values(deltas).reduce((sum, v) => sum + v, 0);
    if (totalDelta > 0) playAudio('sfx', 'sfx_gauge_up.wav');
    else if (totalDelta < 0) playAudio('sfx', 'sfx_gauge_down.wav');
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
}