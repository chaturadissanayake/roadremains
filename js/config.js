const CHAR_KEY = { Karunasena: 'k', Kamala: 'ka', Kumaran: 'ku' };

const CHAR_GAUGES = {
    Karunasena: { ct: 60, ih: 70, vp: 50 },
    Kamala:     { ct: 75, ih: 65, vp: 65 },
    Kumaran:    { ct: 50, ih: 75, vp: 40 }
};

const ACHIEVEMENTS = {
    'big_mistake': { title: 'Big Mistake', desc: 'Started the game.', category: 'You Started. Brave.', hidden: false, notificationType: 'popup' },
    'democracy_they_said': { title: 'Democracy, They Said', desc: 'Selected a character and began your first playthrough.', category: 'You Started. Brave.', hidden: false, notificationType: 'silent' },
    'read_the_fine_print': { title: 'Read the Fine Print', desc: 'Read Mahinda Bandara\'s manifesto. The whole thing.', category: 'You Are Learning.', hidden: false, notificationType: 'silent' },
    'actually_read_the_fine_print': { title: 'Actually Read the Fine Print', desc: 'Found and compared the 2010 manifesto to the current one. The road section was 94% identical.', category: 'You Are Learning.', hidden: false, notificationType: 'silent' },
    'the_algorithm_would_hate_you': { title: 'The Algorithm Would Hate You', desc: 'Verified a message at the Elections Commission board instead of sharing it immediately.', category: 'You Are Learning.', hidden: false, notificationType: 'silent' },
    'professional_skeptic': { title: 'Professional Skeptic', desc: 'Verified three or more messages in a single playthrough. Unlocked something.', category: 'You Are Learning.', hidden: false, notificationType: 'silent' },
    'nandadasa_approved': { title: 'Nandadasa Approved', desc: 'Asked Nandadasa Mahaththaya before acting on information. He was right. He is always right.', category: 'You Are Learning.', hidden: false, notificationType: 'silent' },
    'thirty_years_in_the_same_room': { title: 'Thirty Years in the Same Room', desc: 'Found the Road File. You know why the road is not fixed. It is not the reason you expected.', category: 'You Found Things.', hidden: true, notificationType: 'silent' },
    'pol_roti_and_politics': { title: 'Pol Roti and Politics', desc: 'Found the 1977 receipt behind Mudalali\'s counter. Political loyalty has stranger origins than you think.', category: 'You Found Things.', hidden: false, notificationType: 'silent' },
    'sandya_made_it': { title: 'Sandya Made It', desc: 'Followed Sandya\'s handwritten note from Week 3 to Week 0. Her name is on the register.', category: 'You Found Things.', hidden: false, notificationType: 'silent' },
    'somebody_had_to_ask': { title: 'Somebody Had to Ask', desc: 'Found the thread about Sergeant Wickramasinghe\'s 2016 transfer request. He still will not explain why.', category: 'You Found Things.', hidden: true, notificationType: 'silent' },
    'you_found_the_cafe': { title: 'You Found the Cafe', desc: 'Found the Skeptics Cafe. It does not have a sign. Nandadasa was invited once. He did not reply.', category: 'You Found Things.', hidden: true, notificationType: 'silent' },
    'not_your_job': { title: 'Not Your Job', desc: 'Helped the elderly woman find her name on the voter register. It was not your job. You did it anyway.', category: 'You Helped People.', hidden: false, notificationType: 'silent' },
    'at_least_someone_asked': { title: 'At Least Someone Asked', desc: 'Helped all three people in the polling station queue in a single playthrough. They noticed.', category: 'You Helped People.', hidden: false, notificationType: 'popup' },
    'it_spreads_both_ways': { title: 'It Spreads Both Ways', desc: 'Shared accurate, verified information through Uncle Sirisena\'s WhatsApp chain. It works in both directions.', category: 'You Helped People.', hidden: false, notificationType: 'silent' },
    '847_members': { title: '847 Members', desc: 'Shared a false message through Uncle Sirisena\'s WhatsApp group. 847 people received it.', category: 'You Made Things Worse.', hidden: false, notificationType: 'silent' },
    'you_were_so_confident': { title: 'You Were So Confident', desc: 'Acted on Mahinda Bandara\'s voting instructions without checking an official source. The fold was wrong.', category: 'You Made Things Worse.', hidden: false, notificationType: 'silent' },
    'the_4am_people': { title: 'The 4am People', desc: 'Shared the fake voting time message. Twenty-three people came at 4am. Nandadasa has heard about it.', category: 'You Made Things Worse.', hidden: false, notificationType: 'silent' },
    'blanket_policy': { title: 'Blanket Policy', desc: 'Ignored every single message Uncle Sirisena sent. Including the one that was true.', category: 'You Made Things Worse.', hidden: false, notificationType: 'silent' },
    'the_door_was_right_there': { title: 'The Door Was Right There', desc: 'Missed the voter registration deadline. The door to the Grama Sevaka Office was open every week.', category: 'You Missed Things.', hidden: false, notificationType: 'silent' },
    'the_road_remains': { title: 'The Road Remains', desc: 'Reached any ending. The road is still not fixed.', category: 'You Missed Things.', hidden: false, notificationType: 'silent' },
    'information_health_100': { title: 'Information Health: 100', desc: 'Reached Week 0 with perfect Information Health. You verified everything. You trusted no one blindly. You trusted no one not at all.', category: 'You Played Well.', hidden: false, notificationType: 'silent' },
    'the_unbroken_chain': { title: 'The Unbroken Chain', desc: 'Found the secret ending. Aunty Soma\'s 1983 card. The road is still not fixed. She comes anyway.', category: 'You Played Well.', hidden: true, notificationType: 'popup' },
    'you_finished_an_education_game': { title: 'You Finished an Education Game', desc: 'Reached any ending. Voluntarily. Most people do not.', category: 'You Played Well.', hidden: false, notificationType: 'popup' },
    'three_perspectives': { title: 'Three Perspectives', desc: 'Completed at least one full playthrough with each of the three characters. You have seen Alupotha from every angle it has.', category: 'You Played Well.', hidden: false, notificationType: 'popup' },
    'uncles_nephew': { title: 'Uncle\'s Nephew', desc: 'As Karunasena, dismissed more than 5 of Uncle Sirisena\'s messages. The family WhatsApp group still has 847 members.', category: 'Character', hidden: false, notificationType: 'silent' },
    'she_was_mostly_right': { title: 'She Was Mostly Right', desc: 'As Kamala, identified and corrected all of her false assumptions in a single playthrough.', category: 'Character', hidden: false, notificationType: 'silent' },
    'every_step_cost_more': { title: 'Every Step Cost More', desc: 'As Kumaran, completed every step of the district transfer process. The bilingual form. All of it.', category: 'Character', hidden: false, notificationType: 'silent' }
};

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

const NPC_PORTRAITS = {
    'npc_soma_neutral':          'assets/npcs/npc_soma_neutral.png',
    'npc_soma_talking':          'assets/npcs/npc_soma_talking.png',
    'npc_soma_warm':             'assets/npcs/npc_soma_warm.png',
    'npc_uncle_neutral':         'assets/npcs/npc_uncle_neutral.png',
    'npc_uncle_talking':         'assets/npcs/npc_uncle_talking.png',
    'npc_uncle_enthusiastic':    'assets/npcs/npc_uncle_enthusiastic.png',
    'npc_nandadasa_neutral':     'assets/npcs/npc_nandadasa_neutral.png',
    'npc_nandadasa_talking':     'assets/npcs/npc_nandadasa_talking.png',
    'npc_nandadasa_annoyed':     'assets/npcs/npc_nandadasa_annoyed.png',
    'npc_sergeant_neutral':      'assets/npcs/npc_sergeant_neutral.png',
    'npc_sergeant_talking':      'assets/npcs/npc_sergeant_talking.png',
    'npc_sergeant_amused':       'assets/npcs/npc_sergeant_amused.png',
    'npc_mudalali_neutral':      'assets/npcs/npc_mudalali_neutral.png',
    'npc_mudalali_talking':      'assets/npcs/npc_mudalali_talking.png',
    'npc_mudalali_loud':         'assets/npcs/npc_mudalali_loud.png',
    'npc_mahinda_neutral':       'assets/npcs/npc_mahinda_neutral.png',
    'npc_mahinda_talking':       'assets/npcs/npc_mahinda_talking.png',
    'npc_mahinda_evasive':       'assets/npcs/npc_mahinda_evasive.png',
    'npc_elderly_neutral':       'assets/npcs/npc_elderly_neutral.png',
    'npc_elderly_confused':      'assets/npcs/npc_elderly_confused.png',
    'npc_elderly_relieved':      'assets/npcs/npc_elderly_relieved.png',
};

const BACKGROUND_assets = {
    'bg_loading':         'assets/backgrounds/bg_loading.webp',
    'bg_language':        'assets/backgrounds/bg_language.webp',
    'bg_main_menu':       'assets/backgrounds/bg_main_menu.webp',
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

const MAP_assets = {
    'map_kovil':          'assets/map_icon_kovil.jpeg',
    'map_temple':         'assets/map_icon_temple.jpeg',
    'loc1_grama':         'assets/map_marker_gramasevaka.jpeg',
    'loc2_uncle':         'assets/map_marker_uncle.jpeg',
    'loc3_ecboard':       'assets/map_marker_noticeboard.jpeg',
    'loc4_boutique':      'assets/map_marker_mudalali.jpeg',
    'loc5_hall':          'assets/map_marker_hall.jpeg',
    'loc6_police':        'assets/map_marker_police.jpeg',
    'loc7_cafe':          'assets/map_marker_cafe.jpeg',
    'loc8_tent':          'assets/map_marker_tent.jpeg',
    'loc9_polling':       'assets/map_marker_polling.jpeg',
};

const UI_assets = {
    'whatsapp_bubble':    'assets/ui/whatsapp_bubble.png',
    'phone_frame':        'assets/ui/phone_frame.png',
    'voice_waveform':     'assets/ui/voice_waveform.png',
    'video_play_still':   'assets/ui/video_play_still.png',
    'ec_stamp':           'assets/ui/ec_stamp.png',
    'ec_logo_real':       'assets/ui/ec_logo_real.png',
    'ec_logo_fake':       'assets/ui/ec_logo_fake.png',
    'icon_ct':            'assets/ui/icon_ct.svg',
    'icon_ih':            'assets/ui/icon_ih.svg',
    'icon_vp':            'assets/ui/icon_vp.svg',
    'achievement_locked': 'assets/ui/achievement_locked.svg',
    'sandya_note':        'assets/ui/sandya_note.png',
};

const PROP_assets = {
    'manifesto_2025':          'assets/props/manifesto_2025.png',
    'manifesto_2010':          'assets/props/manifesto_2010.png',
    'manifesto_comparison':    'assets/props/manifesto_comparison.png',
    'ec_notice_registration':  'assets/props/ec_notice_registration.png',
    'ec_notice_candidates':    'assets/props/ec_notice_candidates.png',
    'ec_notice_correction':    'assets/props/ec_notice_correction.png',
    'receipt_1977':            'assets/props/receipt_1977.png',
    'road_file_folder':        'assets/props/road_file_folder.png',
    'voter_card_1983':         'assets/props/voter_card_1983.png',
};

const AUDIO_assets = {
    'bgm_mainmenu':           'assets/audio/sfx_loading_start.wav',
    'bgm_game':               'assets/audio/bgm_game.wav',
    'bgm_credits':            'assets/audio/bgm_credits.wav',
    'ambient_uncle_house':    'assets/audio/ambient_uncle_house.wav',
    'ambient_grama_office':   'assets/audio/ambient_grama_office.wav',
    'ambient_boutique':       'assets/audio/ambient_boutique.wav',
    'ambient_police':         'assets/audio/ambient_police.wav',
    'ambient_tent':           'assets/audio/ambient_tent.wav',
    'ambient_ec_board':       'assets/audio/ambient_ec_board.wav',
    'ambient_polling':        'assets/audio/ambient_polling.wav',
    'sfx_whatsapp':           'assets/audio/sfx_whatsapp_notification.wav',
    'sfx_advance':            'assets/audio/sfx_dialogue_advance.wav',
    'sfx_gauge_up':           'assets/audio/sfx_gauge_up.wav',
    'sfx_gauge_down':         'assets/audio/sfx_gauge_down.wav',
    'sfx_achievement':        'assets/audio/sfx_achievement.wav',
    'sfx_week_transition':    'assets/audio/sfx_week_transition.wav',
    'sfx_click_negative':     'assets/audio/sfx_click_negative.wav',
    'sfx_hover':              'assets/audio/sfx_hover.wav',
    'sfx_click':              'assets/audio/sfx_click.wav',
    'sfx_slider_tick':        'assets/audio/sfx_slider_tick.wav',
    'sfx_pause':              'assets/audio/sfx_pause.wav',
    'sfx_consequence_hit':    'assets/audio/sfx_consequence_hit.wav',
    'sfx_hold_start':         'assets/audio/sfx_hold_start.wav',
    'sfx_hold_release':       'assets/audio/sfx_hold_release.wav',
    'sfx_map_unlock':         'assets/audio/sfx_map_unlock.wav',
    'sfx_paper_crinkle':      'assets/audio/sfx_paper_crinkle.wav',
    'sfx_curiosity_click':    'assets/audio/sfx_curiosity_click.wav'
};

const LOC_BGS = {
    'loc1': 'assets/backgrounds/bg_grama_office.webp',
    'loc2': 'assets/backgrounds/bg_uncle_house.webp',
    'loc3': 'assets/backgrounds/bg_ec_board.webp',
    'loc4': 'assets/backgrounds/bg_boutique.webp',
    'loc5': 'assets/backgrounds/bg_community_hall.webp',
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
    'bg_ending_good':    'assets/backgrounds/bg_ending_positive.webp',
    'bg_ending_bad':     'assets/backgrounds/bg_ending_negative.webp',
    'bg_ending_positive':'assets/backgrounds/bg_ending_positive.webp',
    'bg_ending_negative':'assets/backgrounds/bg_ending_negative.webp',
    'bg_ending_neutral': 'assets/backgrounds/bg_ending_neutral.webp',
    'bg_kovil':          'assets/backgrounds/bg_kovil.webp',
    'bg_temple':         'assets/backgrounds/bg_temple.webp',
    'bg_prologue_k':     'assets/backgrounds/bg_prologue_k.webp',
    'bg_prologue_ka':    'assets/backgrounds/bg_prologue_ka.webp',
    'bg_prologue_ku':    'assets/backgrounds/bg_prologue_ku.webp'
};

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