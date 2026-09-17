// ─── Inventory & Character Collectibles Data ──────────────────────────────
// Extracted from useInventoryStorage.js to decouple static game data from hook logic.

export const CONSUMABLE_ITEMS = [
  {
    id: 'gomu_power',
    name: "Gomu Gomu Power Pill",
    emoji: '🍖',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    cost: 360,
    type: 'buff',
    durationMs: 2 * 60 * 60 * 1000,
    description: "Luffy's secret meat boost — doubles all XP earned for 2 hours. GOMU GOMU NO STUDY!",
  },
  {
    id: 'domain_expansion',
    name: 'Unlimited Void Elixir',
    emoji: '🤞',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    cost: 750,
    type: 'buff',
    durationMs: 3 * 60 * 60 * 1000,
    description: "Gojo's Domain Expansion — unlocks infinite focus and 2× XP for 3 uninterrupted hours.",
  },
  {
    id: 'senzu_bean',
    name: 'Senzu Bean',
    emoji: '🫘',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    cost: 270,
    type: 'pet_buff',
    description: "Karin Tower divine bean — instantly restores your Focus Familiar to 100% full health and joy!",
  },
  {
    id: 'bankai_surge',
    name: 'Bankai Surge',
    emoji: '⚔️',
    series: 'Bleach',
    seriesColor: '#6366f1',
    cost: 600,
    type: 'buff',
    durationMs: 3 * 60 * 60 * 1000,
    description: "Ichigo releases his Bankai — 3 hours of 2× XP as the Shinigami spirit empowers your mind.",
  },
  {
    id: 'shadow_clone',
    name: 'Shadow Clone Focus Scroll',
    emoji: '🌀',
    series: 'Naruto',
    seriesColor: '#f97316',
    cost: 480,
    type: 'instant_minutes',
    minutes: 45,
    description: "Naruto summons 100 shadow clones to speed-read — auto-credits +45 deep study minutes!",
  },
  {
    id: 'titan_serum',
    name: 'Titan Serum',
    emoji: '💉',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    cost: 450,
    type: 'instant_damage',
    damage: 500,
    description: "Inject the power of the titans — instantly obliterates 500 HP from the Procrastination Demon.",
  },
  {
    id: 'sun_breathing',
    name: 'Sun Breathing Elixir',
    emoji: '☀️',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    cost: 510,
    type: 'instant_damage',
    damage: 600,
    description: "Tanjiro channels Hinokami Kagura — unleashes a flaming 600 HP critical strike on the boss.",
  },
  {
    id: 'shadow_arise',
    name: 'Shadow Monarch Arise',
    emoji: '👑',
    series: 'Solo Leveling',
    seriesColor: '#3b82f6',
    cost: 660,
    type: 'buff',
    durationMs: 4 * 60 * 60 * 1000,
    description: "Sung Jinwoo commands his shadow army — 4 hours of 2× XP and unbreakable resolve.",
  },
  {
    id: 'nen_amplifier',
    name: 'Nen Amplifier',
    emoji: '✨',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    cost: 540,
    type: 'instant_minutes',
    minutes: 45,
    description: "Gon channels his Nen aura into a time warp — auto-credits +45 deep focus study minutes.",
  },
  {
    id: 'nakama_shield',
    name: 'Nakama Bond Shield',
    emoji: '🛡️',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    cost: 600,
    type: 'shield',
    description: "The power of friendship protects your streak. One shield = one missed day forgiven. NEVER give up!",
  },
  {
    id: 'soul_feast',
    name: "Soul Reaper's Feast",
    emoji: '🍜',
    series: 'Bleach',
    seriesColor: '#6366f1',
    cost: 240,
    type: 'pet_buff',
    description: "A hearty Soul Society meal — restores your Focus Familiar to 100% Happiness and Energy instantly.",
  },
];

// ─── Complete Multi-Anime Character Face Avatars Roster ──────────────────────
export const ANIME_CHARACTERS = [
  // ══════════════════════════════════════════════════
  // ONE PIECE (15 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Future Pirate King · Gear 5 Sun God',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🏴‍☠️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "If you don't take risks, you can't create a future!",
    desc: 'Captain of the Straw Hats. Infinite willpower and unstoppable focus momentum.'
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    title: 'King of Hell · 3-Sword Master',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🗡️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Nothing happened.",
    desc: 'Grandmaster swordsman. Hard training, razor-sharp discipline, and zero excuses.'
  },
  {
    id: 'law',
    name: 'Trafalgar D. Law',
    title: 'Surgeon of Death · Ope Ope',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🩺',
    rarity: 'Legendary',
    cost: 4500,
    quote: "The weak do not have the right to choose how they die.",
    desc: 'Heart Pirates Captain. Deconstructs complicated topics with surgical precision.'
  },
  {
    id: 'ace',
    name: 'Portgas D. Ace',
    title: 'Flame Emperor · 2nd Commander',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🔥',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Thank you for loving me!",
    desc: 'Whitebeard Commander. Ignites an unquenchable passion for mastering difficult challenges.'
  },
  {
    id: 'shanks',
    name: 'Red-Haired Shanks',
    title: 'Four Emperors · Conqueror Haki',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '⚔️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I've come to put an end to this war.",
    desc: 'Legendary Yonko. Supreme composure and master of Conqueror\'s Haki focus.'
  },
  {
    id: 'whitebeard',
    name: 'Edward Newgate',
    title: 'Strongest Man · Gura Gura no Mi',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🌊',
    rarity: 'Mythic',
    cost: 9000,
    quote: "One Piece does exist!",
    desc: 'The Great Pirate Whitebeard. Shakes the foundations of ignorance with earth-shattering power.'
  },
  {
    id: 'kaido',
    name: 'Kaido',
    title: 'King of Beasts · Azure Dragon',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🐉',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Only Haki can transcend all!",
    desc: 'The strongest creature alive. Unmatched physical durability and overwhelming problem-conquering force.'
  },
  {
    id: 'yamato',
    name: 'Yamato',
    title: 'Scion of the Oni · Oden\'s Will',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🪓',
    rarity: 'Legendary',
    cost: 4500,
    quote: "I will live freely as myself!",
    desc: 'Wielder of Takeru and Okuchi no Makami. Unyielding loyalty and fearless determination.'
  },
  {
    id: 'sanji',
    name: 'Vinsmoke Sanji',
    title: 'Black Leg · Ifrit Jambe',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🍳',
    rarity: 'Epic',
    cost: 3150,
    quote: "Cooking is a gift from the gods. Spices are a gift from the devil.",
    desc: 'Master Chef and fighting powerhouse. Recharges mental stamina with gourmet focus routines.'
  },
  {
    id: 'nami',
    name: 'Nami',
    title: 'Cat Burglar · Master Navigator',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🗺️',
    rarity: 'Rare',
    cost: 1800,
    quote: "What good is treasure if I am alone?",
    desc: 'Genius navigator. Maps out daily study roadmaps with flawless route optimization.'
  },
  {
    id: 'robin',
    name: 'Nico Robin',
    title: 'Devil Child · Archaeologist',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '📖',
    rarity: 'Rare',
    cost: 0,
    quote: "I want to live! Take me with you!",
    desc: 'Brilliant scholar. Reads through hundreds of pages of documentation effortlessly.'
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    title: 'Doctor of the Straw Hats · Monster Point',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🩺',
    rarity: 'Rare',
    cost: 1800,
    quote: "I will cure every sickness in the world!",
    desc: 'Cute genius doctor. Formulates potions to heal study fatigue and boost brain wellness.'
  },
  {
    id: 'usopp',
    name: 'God Usopp',
    title: 'King of Snipers · Sogeking',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🎯',
    rarity: 'Rare',
    cost: 1800,
    quote: "There comes a time when a man has to stand and fight!",
    desc: 'Master sniper. Never misses a daily goal deadline with pinpoint accuracy.'
  },
  {
    id: 'brook',
    name: 'Soul King Brook',
    title: 'Musician of the Straw Hats · Revive Fruit',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🎻',
    rarity: 'Rare',
    cost: 1800,
    quote: "Yohohoho! May I see your notes?",
    desc: 'Soul King. Fills your study environment with uplifting melody and cheerful vibes.'
  },
  {
    id: 'franky',
    name: 'Cyborg Franky',
    title: 'Master Shipwright · SUPER!',
    series: 'One Piece',
    seriesColor: '#f59e0b',
    emoji: '🤖',
    rarity: 'Rare',
    cost: 1800,
    quote: "SUPER! Today is going to be an awesome day!",
    desc: 'Genius engineer. Builds reliable, bulletproof study habits that last forever.'
  },

  // ══════════════════════════════════════════════════
  // NARUTO & SHIPPUDEN (9 Characters)
  // ═══════════════════════════════════════════════
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Seventh Hokage · Kurama Sage Mode',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '🍥',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I never go back on my word. That's my nindo: my ninja way!",
    desc: 'Child of Prophecy. Boundless energy, unshakeable perseverance, and unstoppable drive.'
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'Shadow Hokage · Rinnegan & EMS',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '⚡',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I will walk my own path and surpass all limits.",
    desc: 'Avenger of the Uchiha. Cold intellect, surgical execution, and mastery of lightning-fast revision.'
  },
  {
    id: 'itachi',
    name: 'Itachi Uchiha',
    title: 'Uchiha Prodigy · Tsukuyomi & Susanoo',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '👁️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Knowledge and awareness are vague, and perhaps better called illusions.",
    desc: 'Tactical genius. Sees through exam questions in microseconds using Tsukuyomi clarity.'
  },
  {
    id: 'madara',
    name: 'Madara Uchiha',
    title: 'Ghost of the Uchiha · Perfect Susanoo',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '☄️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Wake up to reality. Nothing ever goes as planned in this world.",
    desc: 'Legendary clan founder. Drops meteors on hard subject curricula with overwhelming mastery.'
  },
  {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'Sixth Hokage · Copy Ninja of the Sharingan',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '📖',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Those who break the rules are scum, but those who abandon their friends are worse.",
    desc: 'Master of 1,000 jutsu. Effortlessly copies and adapts study techniques across every subject.'
  },
  {
    id: 'minato',
    name: 'Minato Namikaze',
    title: 'Fourth Hokage · Yellow Flash of the Leaf',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '⚡',
    rarity: 'Legendary',
    cost: 4500,
    quote: "True strength is born from the desire to protect what matters.",
    desc: 'Flying Thunder God master. Teleports through study flashcards and tasks at lightning speed.'
  },
  {
    id: 'pain',
    name: 'Pain / Nagato',
    title: 'Leader of Akatsuki · Deva Path Almighty Push',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '🌀',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Know pain. Feel pain. Accept pain. Know peace.",
    desc: 'Wielder of the Rinnegan. Pushes away procrastination with Almighty Push focus.'
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    title: 'Toad Sage · Legendary Sannin',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '🐸',
    rarity: 'Epic',
    cost: 3150,
    quote: "A shinobi's life is not measured by how they lived, but what they managed to accomplish.",
    desc: 'Author and master mentor. Teaches wisdom, perseverance, and profound philosophical insights.'
  },
  {
    id: 'gaara',
    name: 'Gaara',
    title: 'Fifth Kazekage · Sand God Defense',
    series: 'Naruto',
    seriesColor: '#f97316',
    emoji: '🏺',
    rarity: 'Epic',
    cost: 3150,
    quote: "Peace created by deception is not true peace.",
    desc: 'Kazekage of the Sand. Creates an impenetrable shield against mental burnout and distractions.'
  },

  // ══════════════════════════════════════════════════
  // JUJUTSU KAISEN (8 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'gojo',
    name: 'Satoru Gojo',
    title: 'The Strongest Sorcerer · Six Eyes & Limitless',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🤞',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Throughout heaven and earth, I alone am the honored one.",
    desc: 'Unchallenged strongest. Limitless brain bandwidth and infinite precision on difficult concepts.'
  },
  {
    id: 'sukuna',
    name: 'Ryomen Sukuna',
    title: 'King of Curses · Malevolent Shrine',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '👺',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Stand proud. You are strong.",
    desc: 'Calamity of the Golden Age. Dismantles complex math proofs and data science algorithms instantly.'
  },
  {
    id: 'toji',
    name: 'Toji Fushiguro',
    title: 'Sorcerer Killer · Heavenly Restriction',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🗡️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Good for you. I'm just here to do a job.",
    desc: 'Zero cursed energy, 100% pure superhuman physical and mental execution prowess.'
  },
  {
    id: 'itadori',
    name: 'Yuji Itadori',
    title: 'Vessel of Sukuna · Black Flash Master',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🥊',
    rarity: 'Legendary',
    cost: 4500,
    quote: "I don't want to regret the way I lived!",
    desc: 'Natural martial prodigy. Lands consecutive Black Flash breakthroughs on every study target.'
  },
  {
    id: 'megumi',
    name: 'Megumi Fushiguro',
    title: 'Ten Shadows Master · Chimera Shadow Garden',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🐺',
    rarity: 'Epic',
    cost: 3150,
    quote: "I want to help people who are good and kind.",
    desc: 'Summons shadows of divine clarity to assist during long study problem sets.'
  },
  {
    id: 'nanami',
    name: 'Kento Nanami',
    title: 'Grade 1 Sorcerer · 7:3 Ratio Technique',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '👔',
    rarity: 'Epic',
    cost: 3150,
    quote: "Overtime is starting. Let's finish this efficiently.",
    desc: 'The ultimate professional. Cuts tasks cleanly at the 7:3 critical point for peak productivity.'
  },
  {
    id: 'geto',
    name: 'Suguru Geto',
    title: 'Special Grade Sorcerer · Curse Manipulation',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🐉',
    rarity: 'Epic',
    cost: 3150,
    quote: "We sorcerers are the guardians of the world.",
    desc: 'Charismatic philosopher. Absorbs and systematizes vast libraries of knowledge into memory.'
  },
  {
    id: 'nobara',
    name: 'Nobara Kugisaki',
    title: 'Straw Doll Sorcerer · Resonance Master',
    series: 'Jujutsu Kaisen',
    seriesColor: '#8b5cf6',
    emoji: '🔨',
    rarity: 'Rare',
    cost: 1800,
    quote: "I love myself when I'm pretty and dressed up, and when I'm being strong!",
    desc: 'Fierce and stylish. Strikes through tough test problems with needle-sharp confidence.'
  },

  // ══════════════════════════════════════════════════
  // BLEACH (12 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    title: 'Substitute Soul Reaper · Bankai Tensa Zangetsu',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '☀️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Bankai: Tensa Zangetsu!",
    desc: 'Wielder of Zangetsu. Activates unstoppable Bankai energy during the toughest study sessions.'
  },
  {
    id: 'aizen',
    name: 'Sosuke Aizen',
    title: 'Hueco Mundo Mastermind · Kyoka Suigetsu',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '👓',
    rarity: 'Mythic',
    cost: 9000,
    quote: "No one stands on the top from the beginning. Not you, not me.",
    desc: 'Grand schemer. Orchestrates flawless study masterplans where everything unfolds to plan.'
  },
  {
    id: 'byakuya',
    name: 'Byakuya Kuchiki',
    title: 'Squad 6 Captain · Senbonzakura Kageyoshi',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🌸',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Scatter, Senbonzakura Kageyoshi.",
    desc: 'Aristocratic noble captain. Ice-cold elegance and absolute zero distraction tolerance.'
  },
  {
    id: 'toshiro',
    name: 'Toshiro Hitsugaya',
    title: 'Squad 10 Captain · Daiguren Hyorinmaru',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '❄️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Sit upon the frozen heavens, Hyorinmaru!",
    desc: 'Prodigy captain. Freezes wandering thoughts and maintains chilling focus under pressure.'
  },
  {
    id: 'kenpachi',
    name: 'Kenpachi Zaraki',
    title: 'Squad 11 Captain · The Ultimate Beast',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '👹',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Drink, Nozarashi!",
    desc: 'Unstoppable powerhouse. Obliterates difficult exam problems with pure passion.'
  },
  {
    id: 'ulquiorra',
    name: 'Ulquiorra Cifer',
    title: '4th Espada · Murciélago & Segunda Etapa',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🦇',
    rarity: 'Legendary',
    cost: 4500,
    quote: "What is a heart? If I rip open your chest, will I find it there?",
    desc: 'Aspect of Emptiness. Silences internal noise to create a state of perfect Zen concentration.'
  },
  {
    id: 'grimmjow',
    name: 'Grimmjow Jaegerjaquez',
    title: '6th Espada · Pantera King of Predators',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🐆',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Grind, Pantera! I don't give a damn about who you are!",
    desc: 'Fierce blue-haired Espada. Attacks difficult problems with relentless ferocious speed.'
  },
  {
    id: 'shunsui',
    name: 'Shunsui Kyoraku',
    title: 'Head Captain · Katen Kyokotsu Karamatsu Shinju',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🍶',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Throw away your pride and do whatever it takes to win.",
    desc: 'Laid-back master of games and shadows. Master of tactical calm and deceptive power.'
  },
  {
    id: 'gin',
    name: 'Gin Ichimaru',
    title: 'Former 3rd Squad Captain · Kamishini no Yari',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🐍',
    rarity: 'Epic',
    cost: 3150,
    quote: "Shoot to kill, Shinso.",
    desc: 'Enigmatic viper. Solves high-speed problems with instantaneous extension accuracy.'
  },
  {
    id: 'rukia',
    name: 'Rukia Kuchiki',
    title: 'Squad 13 Captain · Hakka no Togame White Moon',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '🌙',
    rarity: 'Epic',
    cost: 3150,
    quote: "Even if no one believes in you, stick out your chest!",
    desc: 'Hakka no Togame master. Supportive companion who clarifies complex ideas with cute drawings.'
  },
  {
    id: 'urahara',
    name: 'Kisuke Urahara',
    title: 'Shopkeeper · Ex-Squad 12 Captain Benihime',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '👒',
    rarity: 'Epic',
    cost: 3150,
    quote: "There is nothing, but nothing I cannot do.",
    desc: 'Scientific mastermind. Unlocks secret study shortcuts and creative breakthroughs.'
  },
  {
    id: 'yoruichi',
    name: 'Yoruichi Shihoin',
    title: 'Flash Goddess · Shunko Master',
    series: 'Bleach',
    seriesColor: '#6366f1',
    emoji: '⚡',
    rarity: 'Epic',
    cost: 3150,
    quote: "A heart without doubt holds tremendous power.",
    desc: 'Flash Goddess. Maximizes speed-reading, quick flashcard recall, and rapid review sprints.'
  },

  // ══════════════════════════════════════════════════
  // ATTACK ON TITAN (9 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'levi',
    name: 'Captain Levi',
    title: 'Humanity\'s Strongest Soldier · Scout Special Ops',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '⚡',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Give up on your excuses and do the work.",
    desc: 'Special Operations Captain. Demands 100% perfection, clean notes, and zero procrastination.'
  },
  {
    id: 'eren',
    name: 'Eren Yeager',
    title: 'Attack & Founding Titan · The Harbinger of Freedom',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🦁',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Tatakae. Tatakae. If you don't fight, you can't win!",
    desc: 'Pushes forward through mental fatigue until every curriculum milestone is conquered.'
  },
  {
    id: 'mikasa',
    name: 'Mikasa Ackerman',
    title: 'Cadet Corps Prodigy · Scout Regiment Elite',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🩸',
    rarity: 'Legendary',
    cost: 4500,
    quote: "This world is cruel, but it is also very beautiful.",
    desc: 'Top graduate. Unwavering loyalty and unmatched execution speed in high-stakes tasks.'
  },
  {
    id: 'erwin',
    name: 'Commander Erwin Smith',
    title: '13th Commander · "Shinzou wo Sasageyo!"',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🛡️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "My soldiers, rage! My soldiers, scream! My soldiers, fight!",
    desc: 'Inspirational supreme commander. Leads daring study blitzes with fearless determination.'
  },
  {
    id: 'armin',
    name: 'Armin Arlert',
    title: '15th Commander · Colossal Titan & Strategist',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🧠',
    rarity: 'Epic',
    cost: 3150,
    quote: "To transcend monsters, you must be willing to abandon your limitations.",
    desc: 'Master strategist. Analyzes complex concepts and engineers intuitive memory frameworks.'
  },
  {
    id: 'reiner',
    name: 'Reiner Braun',
    title: 'Armored Titan · Vice Commander',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🛡️',
    rarity: 'Epic',
    cost: 3150,
    quote: "I have to fulfill my duty to the very end.",
    desc: 'The Armored Shield. Withstands heavy exam pressure without cracking.'
  },
  {
    id: 'annie',
    name: 'Annie Leonhart',
    title: 'Female Titan · Martial Arts Master',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '💎',
    rarity: 'Epic',
    cost: 3150,
    quote: "I just want to go home.",
    desc: 'Crystal-hard defense and lightning counter-attacks on complex questions.'
  },
  {
    id: 'hange',
    name: 'Hange Zoe',
    title: '14th Commander · Titan Researcher',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🔬',
    rarity: 'Rare',
    cost: 1800,
    quote: "Even in hell, knowledge is our greatest ally!",
    desc: 'Passionate researcher. Makes deep learning and problem exploration exhilaratingly fun.'
  },
  {
    id: 'sasha',
    name: 'Sasha Braus',
    title: 'Potato Girl · Scout Sharpshooter',
    series: 'Attack on Titan',
    seriesColor: '#ef4444',
    emoji: '🥔',
    rarity: 'Rare',
    cost: 1800,
    quote: "I thought you were going to share the snack!",
    desc: 'Enthusiastic scout. Keeps your energy and spirits high with timely snack breaks.'
  },

  // ══════════════════════════════════════════════════
  // DEMON SLAYER (8 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'tanjiro',
    name: 'Tanjiro Kamado',
    title: 'Sun Breathing Master · Hinokami Kagura',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🌊',
    rarity: 'Mythic',
    cost: 9000,
    quote: "No matter how many people you may lose, you have to go on living.",
    desc: 'Kind-hearted swordsman. Possesses crystal-clear focus and pure dedication.'
  },
  {
    id: 'rengoku',
    name: 'Kyojuro Rengoku',
    title: 'Flame Hashira · Ninth Form Purgatory',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🔥',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Set your heart ablaze! Go beyond your limits!",
    desc: 'The Flame Hashira. Blazes through difficult chapters with fiery enthusiasm and pride.'
  },
  {
    id: 'giyu',
    name: 'Giyu Tomioka',
    title: 'Water Hashira · Eleventh Form Dead Calm',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🌊',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Do not cry. Despair will not solve anything.",
    desc: 'Eleventh Form Dead Calm. Silences all outside noise for supreme meditation focus.'
  },
  {
    id: 'muzan',
    name: 'Muzan Kibutsuji',
    title: 'Demon King · Progenitor of All Demons',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🩸',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I am a living natural disaster.",
    desc: 'Perfectionist demon lord. Demands absolute mastery and zero room for error.'
  },
  {
    id: 'nezuko',
    name: 'Nezuko Kamado',
    title: 'Demon Princess · Exploding Blood',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🌸',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Mmh mmh!",
    desc: 'Awakened demon girl. Boosts inner vitality and protects your study streak with fierce love.'
  },
  {
    id: 'zenitsu',
    name: 'Zenitsu Agatsuma',
    title: 'Thunder Breathing · God Speed Sixfold',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '⚡',
    rarity: 'Epic',
    cost: 3150,
    quote: "If you can only do one thing, hone it to perfection!",
    desc: 'Unconscious master. Once asleep or in the zone, solves problems at lightning speed.'
  },
  {
    id: 'inosuke',
    name: 'Inosuke Hashibira',
    title: 'Beast Breathing · Lord of the Mountains',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🐗',
    rarity: 'Epic',
    cost: 3150,
    quote: "Comin' through! Pig Assault!",
    desc: 'Wild mountain boy. Charges directly into challenging problem sets headfirst with zero hesitation.'
  },
  {
    id: 'shinobu',
    name: 'Shinobu Kocho',
    title: 'Insect Hashira · Dance of the Bee Sting',
    series: 'Demon Slayer',
    seriesColor: '#06b6d4',
    emoji: '🦋',
    rarity: 'Epic',
    cost: 3150,
    quote: "Moshi mosh! Are you doing your homework?",
    desc: 'Pharmacist and swordswoman. Injects precision insights and remedies into confusing concepts.'
  },

  // ══════════════════════════════════════════════════
  // HUNTER X HUNTER (10 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'killua',
    name: 'Killua Zoldyck',
    title: 'Zoldyck Heir · Godspeed Lightning',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '⚡',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Godspeed! Lightning never strikes twice, but I do.",
    desc: 'Transmuter assassin. Lightning-fast mental processing and cool composure under pressure.'
  },
  {
    id: 'chrollo',
    name: 'Chrollo Lucilfer',
    title: 'Phantom Troupe Head · Skill Hunter',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '✝️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "The calendar loses a precious component. The remaining gather to conquer.",
    desc: 'Spider Leader. Absorbs and adapts any knowledge into his personal grimoire.'
  },
  {
    id: 'netero',
    name: 'Isaac Netero',
    title: '12th Chairman · 100-Type Guanyin',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🙏',
    rarity: 'Mythic',
    cost: 9000,
    quote: "A prayer comes from the heart.",
    desc: 'Martial arts grandmaster. Demonstrates the ultimate power of 10,000 hours of daily practice.'
  },
  {
    id: 'meruem',
    name: 'Meruem',
    title: 'Chimera Ant King · Absolute Light',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '👑',
    rarity: 'Mythic',
    cost: 9000,
    quote: "In the hands of an incompetent, power brings nothing but ruin.",
    desc: 'Peak of biological evolution. Calculates mathematical patterns and strategies effortlessly.'
  },
  {
    id: 'gon',
    name: 'Gon Freecss',
    title: 'Enhancer Hunter · Jajanken Master',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🌿',
    rarity: 'Legendary',
    cost: 4500,
    quote: "First comes rock! Jan... ken... guu!",
    desc: 'Pure-hearted Nen hunter. Unlimited optimism and persistent grit that never backs down.'
  },
  {
    id: 'kurapika',
    name: 'Kurapika',
    title: 'Emperor Time · Judgment Chain',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🔗',
    rarity: 'Legendary',
    cost: 4500,
    quote: "I do not fear difficulty; I fear only losing my dedication.",
    desc: 'Scarlet Eyes activated. Unlocks 100% capacity across all subject categories simultaneously.'
  },
  {
    id: 'hisoka',
    name: 'Hisoka Morow',
    title: 'Magician · Bungee Gum Master',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🃏',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Bungee Gum possesses the properties of both rubber and gum!",
    desc: 'Enigmatic magician. Unorthodox problem solving and thrilling study battles.'
  },
  {
    id: 'pitou',
    name: 'Neferpitou',
    title: 'Royal Guard · Terpsichora & Doctor Blythe',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🐱',
    rarity: 'Legendary',
    cost: 4500,
    quote: "I think I am quite strong, nya!",
    desc: 'Feline Royal Guard. Enormous En aura senses every detail of learning material.'
  },
  {
    id: 'feitan',
    name: 'Feitan Portor',
    title: 'Phantom Troupe #2 · Rising Sun Pain Packer',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '🗡️',
    rarity: 'Epic',
    cost: 3150,
    quote: "Welcome to the torture chamber.",
    desc: 'Converts study friction and difficulty directly into scorching motivation heat.'
  },
  {
    id: 'leorio',
    name: 'Leorio Paradinight',
    title: 'Future Doctor · Medical Scholar',
    series: 'Hunter x Hunter',
    seriesColor: '#10b981',
    emoji: '💼',
    rarity: 'Rare',
    cost: 1800,
    quote: "I'm going to become a great doctor!",
    desc: 'Medical student and loyal friend. Balances heavy exam prep with heart and courage.'
  },

  // ══════════════════════════════════════════════════
  // DRAGON BALL (6 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'goku',
    name: 'Son Goku',
    title: 'Earth\'s Greatest Hero · Mastered Ultra Instinct',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '🐉',
    rarity: 'Mythic',
    cost: 9000,
    quote: "Power comes in response to a need, not a desire.",
    desc: 'Ultra Instinct. Reflexive, effortless high-level problem solving without second-guessing.'
  },
  {
    id: 'vegeta',
    name: 'Prince Vegeta',
    title: 'Prince of All Saiyans · Ultra Ego',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '👑',
    rarity: 'Mythic',
    cost: 9000,
    quote: "There is only one certainty in life. A strong man stands above and conquers all!",
    desc: 'Saiyan Pride. Channeling intense competitive drive to be the top student in every field.'
  },
  {
    id: 'gohan',
    name: 'Son Gohan',
    title: 'Beast Gohan · Scholar & Warrior',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '⚡',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I cannot forgive what you have done. It's over!",
    desc: 'The scholar warrior. Unlocks explosive hidden potential when the pressure is highest.'
  },
  {
    id: 'trunks',
    name: 'Future Trunks',
    title: 'Hope of the Future · Super Saiyan Swordmaster',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '🗡️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "You're about to find out what it's like to fight a real Super Saiyan!",
    desc: 'Time traveler. Cuts through massive workloads cleanly before they can cause a crisis.'
  },
  {
    id: 'frieza',
    name: 'Emperor Frieza',
    title: 'Universal Tyrant · Golden & Black Frieza',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '😈',
    rarity: 'Legendary',
    cost: 4500,
    quote: "Before you begin your pathetic struggle to survive, I should warn you.",
    desc: 'Emperor of Galactic Ambition. Demands flawless calculation and supreme results.'
  },
  {
    id: 'piccolo',
    name: 'Orange Piccolo',
    title: 'Namekian Guardian · Special Beam Cannon',
    series: 'Dragon Ball',
    seriesColor: '#facc15',
    emoji: '🥋',
    rarity: 'Epic',
    cost: 3150,
    quote: "Even with the energy of the gods, you can't defeat raw wisdom.",
    desc: 'Wise mentor. Meditates in peace and delivers penetrating insights with Special Beam focus.'
  },

  // ══════════════════════════════════════════════════
  // SOLO LEVELING (2 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'jinwoo',
    name: 'Sung Jin-Woo',
    title: 'Shadow Monarch · "Arise"',
    series: 'Solo Leveling',
    seriesColor: '#3b82f6',
    emoji: '👑',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I am the player who levels up alone. Arise.",
    desc: 'Shadow Monarch. Levels up stats continuously through daily daily quest discipline.'
  },
  {
    id: 'cha_hae_in',
    name: 'Cha Hae-In',
    title: 'Sword Saint · S-Rank Hunter',
    series: 'Solo Leveling',
    seriesColor: '#3b82f6',
    emoji: '🗡️',
    rarity: 'Legendary',
    cost: 4500,
    quote: "I will fight with everything I have to clear this dungeon.",
    desc: 'S-Rank Sword Saint. Moves with dancer grace and pinpoints knowledge targets instantly.'
  },

  // ══════════════════════════════════════════════════
  // DEATH NOTE (2 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'l',
    name: 'L Lawliet',
    title: 'World\'s Greatest Detective · Pure Intellect',
    series: 'Death Note',
    seriesColor: '#94a3b8',
    emoji: '🍰',
    rarity: 'Mythic',
    cost: 9000,
    quote: "There is no heaven or hell. No matter what you do, everyone goes to the same place.",
    desc: 'Master detective. Consumes sweet treats while solving 200-IQ mathematical anomalies.'
  },
  {
    id: 'light',
    name: 'Light Yagami',
    title: 'Top Student of Japan · Kira',
    series: 'Death Note',
    seriesColor: '#94a3b8',
    emoji: '📓',
    rarity: 'Mythic',
    cost: 9000,
    quote: "I'll take a potato chip... and eat it!",
    desc: 'Rank #1 academic genius in Japan. Aces every test with meticulously planned time blocks.'
  },

  // ══════════════════════════════════════════════════
  // FULLMETAL ALCHEMIST (3 Characters)
  // ══════════════════════════════════════════════════
  {
    id: 'edward',
    name: 'Edward Elric',
    title: 'Fullmetal Alchemist · Equivalent Exchange',
    series: 'Fullmetal Alchemist',
    seriesColor: '#ea580c',
    emoji: '⚙️',
    rarity: 'Mythic',
    cost: 9000,
    quote: "There's no such thing as a painless lesson. They simply don't exist.",
    desc: 'State Alchemist prodigy. Masters the scientific law of Equivalent Exchange for guaranteed study results.'
  },
  {
    id: 'mustang',
    name: 'Roy Mustang',
    title: 'Flame Alchemist · State Alchemist Colonel',
    series: 'Fullmetal Alchemist',
    seriesColor: '#ea580c',
    emoji: '🔥',
    rarity: 'Legendary',
    cost: 4500,
    quote: "The world is not perfect. But it's there for us, doing the best it can.",
    desc: 'Flame Alchemist. Snaps fingers to incinerate procrastination and ignite mental stamina.'
  },
  {
    id: 'alphonse',
    name: 'Alphonse Elric',
    title: 'Armored Soul · Scholar of Alchemy',
    series: 'Fullmetal Alchemist',
    seriesColor: '#ea580c',
    emoji: '🛡️',
    rarity: 'Epic',
    cost: 3150,
    quote: "Humankind cannot gain anything without first giving something in return.",
    desc: 'Gentle armored soul. Boundless endurance that never requires sleep to keep studying.'
  },
];

export const ANIME_COLLECTIBLES = ANIME_CHARACTERS;

export const RARITY_ORDER = ['Mythic', 'Legendary', 'Epic', 'Rare'];
export const RARITY_COLORS = {
  Mythic:    { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', text: '#78350f', glow: '#f59e0b', color: '#fbbf24', border: '#f59e0b', label: '✦ MYTHIC' },
  Legendary: { bg: 'linear-gradient(135deg, #c084fc, #a855f7)', text: '#fff',    glow: '#a855f7', color: '#c084fc', border: '#a855f7', label: '★ LEGENDARY' },
  Epic:      { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', text: '#fff',    glow: '#6366f1', color: '#818cf8', border: '#6366f1', label: '◆ EPIC' },
  Rare:      { bg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', text: '#fff',    glow: '#38bdf8', color: '#38bdf8', border: '#0284c7', label: '◇ RARE' },
};

export const SERIES_LIST = [
  'One Piece',
  'Naruto',
  'Jujutsu Kaisen',
  'Bleach',
  'Attack on Titan',
  'Demon Slayer',
  'Hunter x Hunter',
  'Dragon Ball',
  'Solo Leveling',
  'Death Note',
  'Fullmetal Alchemist',
];
