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
        visitedLocs: [],
        completedLocs: [],
        achievements: globalAchievements,
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
    },
    dialogue: { active: false, currentLine: 0, lines: [], choices: null },
    history: [],
    currentLoc: null
};

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

    if (!window.gameState.flags) window.gameState.flags = {};
    if (!Array.isArray(window.gameState.flags.completedLocs)) {
        window.gameState.flags.completedLocs = [];
    }
    if (!Array.isArray(window.gameState.flags.visitedLocs)) {
        window.gameState.flags.visitedLocs = [];
    }

    try {
        const storedAchs = localStorage.getItem('plv_achievements');
        if (storedAchs) {
            const parsedAchs = JSON.parse(storedAchs);
            const combined = new Set([...(window.gameState.flags.achievements || []), ...parsedAchs]);
            window.gameState.flags.achievements = Array.from(combined);
        }
    } catch(e) {}

    if (window.gameState.dialogue && window.gameState.dialogue.active) {
        const locs = window.gameState.flags.visitedLocs;
        if (Array.isArray(locs) && locs.length > 0) {
            locs.pop();
        }
        window.gameState.dialogue.active = false;
    }

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
    setTimeout(() => checkWeekCompletion(), 300);

    if (window.gameState.week === 0) {
        const ps9 = document.getElementById('loc9-node');
        if (ps9) { ps9.style.opacity = '1'; ps9.style.pointerEvents = 'auto'; }
    }
}