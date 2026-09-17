/**
 * feynmanTribunalTopics.js
 * Comprehensive library of 100+ Feynman Tribunal topics across 8 disciplines.
 * Each entry includes Arabic & English titles, categories, and plain-language Feynman explanations.
 */

export const TOPIC_CATEGORIES = [
  { id: 'all', en: 'All Topics', ar: 'كل المواضيع', icon: 'Sparkles' },
  { id: 'cs_ai', en: 'CS & AI', ar: 'البرمجة والذكاء الاصطناعي', icon: 'Code' },
  { id: 'physics_space', en: 'Physics & Space', ar: 'الفيزياء والكون', icon: 'Atom' },
  { id: 'math_logic', en: 'Math & Logic', ar: 'الرياضيات والمنطق', icon: 'Binary' },
  { id: 'biology_medicine', en: 'Biology & Life', ar: 'الأحياء والطب', icon: 'Dna' },
  { id: 'psychology_neuro', en: 'Mind & Brain', ar: 'العقل والأعصاب', icon: 'Brain' },
  { id: 'engineering_tech', en: 'Tech & Devices', ar: 'التكنولوجيا والأجهزة', icon: 'Cpu' },
  { id: 'economics_systems', en: 'Economics & Games', ar: 'الاقتصاد ونظرية الألعاب', icon: 'TrendingUp' },
  { id: 'philosophy_thinking', en: 'Mental Models', ar: 'الفلسفة ونماذج التفكير', icon: 'Compass' },
];

export const FEYNMAN_TOPICS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. COMPUTER SCIENCE & ARTIFICIAL INTELLIGENCE (15 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'recursion',
    category: 'cs_ai',
    en: 'Recursion in Programming',
    ar: 'العودية (Recursion) في البرمجة',
    sampleEn: 'Recursion is when a function solves a problem by calling a smaller copy of itself until it reaches a simple stopping rule, like Russian nesting dolls opening one by one until the tiny solid doll inside.',
    sampleAr: 'العودية تعني قيام الدالة باستدعاء نفسها لحل أجزاء أصغر من المشكلة حتى تصل لشرط توقف بسيط، تماماً كدمى الماتريوشكا الروسية المتداخلة التي تفتحها واحدة تلو الأخرى حتى تصل للدمية الصغيرة الصلبة.'
  },
  {
    id: 'neural_networks',
    category: 'cs_ai',
    en: 'Artificial Neural Networks',
    ar: 'الشبكات العصبية الاصطناعية',
    sampleEn: 'A neural network is like a giant board of dimmer switches. When it makes a wrong guess on an image, it nudges thousands of switches slightly until the correct light turns on.',
    sampleAr: 'الشبكة العصبية تشبه لوحة ضخمة مليئة بمفاتيح التحكم في درجة الإضاءة. كلما أخطأت في تخمين صورة، نقوم بلف المفاتيح قليلاً حتى يضيء المصباح الصحيح في النهاية.'
  },
  {
    id: 'binary_search',
    category: 'cs_ai',
    en: 'Binary Search Algorithm',
    ar: 'خوارزمية البحث الثنائي (Binary Search)',
    sampleEn: 'Binary search is like finding a name in a dictionary by opening directly to the middle: if your word comes after, you throw away the entire first half and repeat.',
    sampleAr: 'البحث الثنائي يشبه فتح القاموس من المنتصف بالضبط؛ إن كانت الكلمة تقع بعد المنتصف، تهمل النصف الأول بالكامل وتكرر العملية في النصف المتبقي لتقسم العمل للنصف في كل خطوة.'
  },
  {
    id: 'blockchain',
    category: 'cs_ai',
    en: 'Blockchain Technology',
    ar: 'سلسلة الكتل (Blockchain)',
    sampleEn: 'Blockchain is a shared notebook that everyone in the room has a photo of. If anyone tries to erase or forge a page, everyone else checks their copy and rejects the fake.',
    sampleAr: 'البلوك تشين دفتر حسابات مشترك يمتلك كل شخص في الغرفة نسخة مصورة ومطابقة منه. إذا حاول أي شخص تزوير سطر، يقارن الجميع دفاترهم ويكتشفون التزوير فوراً.'
  },
  {
    id: 'public_key_crypto',
    category: 'cs_ai',
    en: 'Public-Key Cryptography',
    ar: 'التشفير بالمفتاح العام والخاص',
    sampleEn: 'It is like sending someone an open padlock. Anyone can snap it shut to lock their message in a box, but only the person holding the private secret key can unlock it.',
    sampleAr: 'يشبه إعطاء قفل مفتوح لأي شخص في العالم؛ يستطيع أي إنسان وضع رسالته في صندوق وإغلاق القفل، لكن صاحب المفتاح السري وحده هو القادر على فتحه.'
  },
  {
    id: 'deadlock',
    category: 'cs_ai',
    en: 'Deadlock in Operating Systems',
    ar: 'الجمود المميت (Deadlock) في أنظمة التشغيل',
    sampleEn: 'Deadlock is when two people meet in a narrow corridor: person A waits for person B to take a step, while person B waits for person A, leaving both completely frozen forever.',
    sampleAr: 'الجمود المميت يشبه شخصين يلتقيان في ممر ضيق جداً؛ الأول يرفض التحرك حتى يفسح الثاني له الطريق، والثاني ينتظر الأول، فيبقى الاثنان متجمدين إلى الأبد.'
  },
  {
    id: 'garbage_collection',
    category: 'cs_ai',
    en: 'Garbage Collection in Memory',
    ar: 'جامع المهملات (Garbage Collection) في الذاكرة',
    sampleEn: 'Garbage collection is an automatic cleaning robot in computer memory that scans for variables you abandoned and reclaims their space so the system never runs out of room.',
    sampleAr: 'جامع المهملات روبوت نظافة يتجول في ذاكرة الحاسوب باستمرار؛ يفحص البيانات والمتغيرات التي لم يعد البرنامج يشير إليها، ويفرغ مكانها تلقائياً كي لا تختنق الذاكرة.'
  },
  {
    id: 'api',
    category: 'cs_ai',
    en: 'Application Programming Interfaces (APIs)',
    ar: 'واجهات برمجة التطبيقات (APIs)',
    sampleEn: 'An API is like a restaurant waiter: you look at the menu, tell the waiter your order, the waiter carries it to the kitchen, and returns with your food without you ever seeing the stove.',
    sampleAr: 'الـ API يشبه نادل المطعم تماماً؛ تنظر إلى قائمة الطعام وتخبر النادل بطلبك، فيأخذه إلى المطبخ ويعود بالوجبة الجاهزة دون أن تحتاج للدخول إلى المطبخ أو معرفة كيف طُبخت.'
  },
  {
    id: 'dns',
    category: 'cs_ai',
    en: 'Domain Name System (DNS)',
    ar: 'نظام أسماء النطاقات (DNS)',
    sampleEn: 'DNS is the phonebook of the internet. Instead of forcing your brain to remember numbers like 142.250.190.46, you type "google.com" and DNS looks up the digital phone number for you.',
    sampleAr: 'نظام DNS هو دليل هواتف الإنترنت؛ فبدلاً من حفظ أرقام IP المعقدة مثل 142.250.190.46، تكتب "google.com" فيقوم DNS بالبحث عن الرقم الرقمي الحقيقي وتوصيلك فوراً.'
  },
  {
    id: 'cache_memory',
    category: 'cs_ai',
    en: 'Cache Memory',
    ar: 'الذاكرة المؤقتة (Cache)',
    sampleEn: 'A cache is like keeping the books you read every day on top of your desk instead of walking to the basement library every single time you need to look up a paragraph.',
    sampleAr: 'الذاكرة المؤقتة مثل وضع الكتب التي تراجعها باستمرار فوق طاولة مكتبك مباشرة، بدلاً من النزول إلى قبو المكتبة العامة في كل مرة تريد فيها قراءة سطر واحد.'
  },
  {
    id: 'transformer_attention',
    category: 'cs_ai',
    en: 'Self-Attention in Transformers',
    ar: 'آلية الانتباه الذاتي في نماذج الذكاء الاصطناعي (Self-Attention)',
    sampleEn: 'Self-attention is like reading a sentence and drawing colorful highlighter lines between related words—like connecting "it" back to "the dog" so the AI understands who barked.',
    sampleAr: 'الانتباه الذاتي يشبه قراءة فقرة ورسم خطوط تظليل ملونة بين الكلمات المترابطة؛ مثل ربط الضمير "هو" بالاسم "القط" ليفهم الذكاء الاصطناعي من الذي قفز فوق الطاولة بدقة.'
  },
  {
    id: 'overfitting',
    category: 'cs_ai',
    en: 'Overfitting in Machine Learning',
    ar: 'فرط التخصيص (Overfitting) في تعلم الآلة',
    sampleEn: 'Overfitting is like a student who memorizes every single question and punctuation mark from past exam papers, but gets completely flustered when numbers change on the real test.',
    sampleAr: 'فرط التخصيص يشبه طالباً بصم وحفظ أسئلة الامتحانات السابقة بحروفها وعلامات ترقيمها، لكنه يعجز تماماً عن حل أي مسألة جديدة في الامتحان الحقيقي لأن الأرقام تغيرت.'
  },
  {
    id: 'git_vcs',
    category: 'cs_ai',
    en: 'Git Version Control',
    ar: 'نظام إدارة النسخ (Git)',
    sampleEn: 'Git is a magical time machine for your code that takes a snapshot before every risky move, allowing you to rewind time or test alternate realities in parallel branches.',
    sampleAr: 'جيت آلة زمن سحرية لأكوادك؛ تلتقط لقطة حفظ قبل كل تعديل جريء، وتتيح لك الرجوع بالزمن للوراء أو فتح مسارات متوازية لتجربة أفكار جديدة دون إفساد المشروع.'
  },
  {
    id: 'docker_containers',
    category: 'cs_ai',
    en: 'Docker & Software Containers',
    ar: 'حاويات البرمجيات (Docker)',
    sampleEn: 'A container is like shipping an entire furnished micro-apartment with its own plumbing and power, so the software works identically whether hosted in Paris, Tokyo, or your laptop.',
    sampleAr: 'الحاوية تشبه شحن شقة مصغرة مفروشة بالكامل مع توصيلات الكهرباء والمياه الخاصة بها؛ فتعمل البرمجية بنفس الطريقة تماماً سواء نُقلت إلى باريس أو طوكيو أو حاسوبك الشخصي.'
  },
  {
    id: 'np_complete',
    category: 'cs_ai',
    en: 'P vs NP & NP-Completeness',
    ar: 'معضلة P مقابل NP ومسائل التعقيد الحسابي',
    sampleEn: 'P is problems easy to solve (like multiplying numbers); NP is problems easy to verify once someone hands you the solution (like checking a solved Sudoku puzzle).',
    sampleAr: 'مسائل P هي ما يسهل حسابه وإيجاد حله بسرعة كضرب الأرقام، بينما مسائل NP هي ما يصعب حله لكن يسهل التحقق من صحته بمجرد أن يعطيك شخص الإجابة مثل فحص لغز سودوكو مكتمل.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PHYSICS & SPACE (15 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'superposition',
    category: 'physics_space',
    en: 'Quantum Superposition',
    ar: 'التراكب الكمومي (Quantum Superposition)',
    sampleEn: 'Before you observe a quantum particle, it exists across all possible states simultaneously, like a rapidly spinning coin on a table that is both heads and tails until it drops.',
    sampleAr: 'قبل أن ترصد الجسيم الكمومي وتنظر إليه، يتواجد في جميع الحالات الممكنة معاً، مثل قطعة نقود تدور بسرعة هائلة على الطاولة فتكون ملكاً وكتابة في نفس اللحظة حتى تسقط.'
  },
  {
    id: 'black_holes',
    category: 'physics_space',
    en: 'Black Holes & Event Horizon',
    ar: 'الثقوب السوداء وأفق الحدث',
    sampleEn: 'A black hole packs so much matter into a tiny point that gravity creates a cosmic waterfall; once you cross the event horizon, the current flows faster than light, making escape impossible.',
    sampleAr: 'الثقب الأسود يضغط كمية هائلة من المادة في نقطة متناهية الصغر حتى تصبح الجاذبية كشلال كوني هادر؛ بمجرد تجاوزك حافة أفق الحدث يجري الشلال أسرع من الضوء فلا نجاة لأي شيء.'
  },
  {
    id: 'general_relativity',
    category: 'physics_space',
    en: "Einstein's General Relativity",
    ar: 'النسبية العامة لآينشتاين وتحدب الزمكان',
    sampleEn: 'Spacetime is a stretched rubber trampoline. Heavy bowling balls like the Sun bend the fabric down, causing smaller marbles like the Earth to roll in curved orbits around them.',
    sampleAr: 'الزمكان يشبه ترامبولين مطاطي مشدود. تضع عليه كرة بولينغ ثقيلة كالشمس فتخلق انحناءً عميقاً في القماش، مما يجبر الكرات الصغيرة كالأرض على التدحرج في مدارات دائرية حولها.'
  },
  {
    id: 'entropy',
    category: 'physics_space',
    en: 'Entropy & Second Law of Thermodynamics',
    ar: 'الإنتروبيا (Entropy) والقانون الثاني للديناميكا الحرارية',
    sampleEn: 'Entropy measures disorder. It is easy for a neat glass mug to shatter on the kitchen floor into hundreds of random shards, but impossible for shards to jump back into a perfect cup.',
    sampleAr: 'الإنتروبيا مقياس العشوائية في الكون. من السهل جداً أن يسقط كوب زجاجي أنيق على الأرض ويتفتت لمئات الشظايا العشوائية، لكن يستحيل للشظايا أن تقفز تلقائياً لتلتحم كوباً سليماً.'
  },
  {
    id: 'dark_matter',
    category: 'physics_space',
    en: 'Dark Matter',
    ar: 'المادة المظلمة (Dark Matter)',
    sampleEn: 'Dark matter is invisible cosmic glue. Galaxies spin so fast that their stars should fly apart into deep space; something massive is holding them together, yet emits zero light.',
    sampleAr: 'المادة المظلمة هي الغراء الكوني الخفي؛ تدور المجرات بسرعة جنونية تجعل نجومها مرشحة للتطاير في الفضاء السحيق، ومع ذلك هناك كتلة هائلة تمسكها بإحكام رغم أنها لا تصدر أي ضوء.'
  },
  {
    id: 'wave_particle_duality',
    category: 'physics_space',
    en: 'Wave-Particle Duality',
    ar: 'ازدواجية الموجة والجسيم',
    sampleEn: 'Light and electrons behave like ocean waves creating ripples when travelling through space, but land like tiny hard BB pellets whenever they strike a sensor or detector.',
    sampleAr: 'يسلك الضوء والإلكترونات سلوك أمواج المحيط التي تتداخل وتتموج أثناء سفرها في الفضاء، لكنها تصطدم بأجهزة القياس كحبات رصاص صغيرة ومركزة في نقطة محددة.'
  },
  {
    id: 'schrodinger_cat',
    category: 'physics_space',
    en: "Schrödinger's Cat Paradox",
    ar: 'مفارقة قطة شرودنجر',
    sampleEn: 'It is a thought experiment showing the absurdity of quantum rules in the everyday world: a cat trapped with a random poison trigger is mathematically both alive and dead until someone opens the lid.',
    sampleAr: 'تجربة فكرية تكشف غرابة قوانين الكم إذا طبقناها على عالمنا الواقعي؛ قطة في صندوق مغلق مربوطة بمفتاح عشوائي للسم، فتكون حسابياً حية وميتة معاً حتى يرفع أحدنا الغطاء.'
  },
  {
    id: 'time_dilation',
    category: 'physics_space',
    en: 'Special Relativity & Time Dilation',
    ar: 'تمدد الزمن في النسبية الخاصة',
    sampleEn: 'The faster you travel through physical space relative to a stationary observer, the slower your personal clock ticks through time compared to theirs.',
    sampleAr: 'كلما زادت سرعتك في الحركة عبر المكان مقارنة بمراقب ساكن، كلما دقت عقارب ساعتك الشخصية ببطء أكبر مقارنة بساعته، لأن سرعة الضوء ثابتة لا تتغير.'
  },
  {
    id: 'gravitational_waves',
    category: 'physics_space',
    en: 'Gravitational Waves',
    ar: 'موجات الجاذبية (Gravitational Waves)',
    sampleEn: 'When two giant black holes collide billions of light-years away, they rattle spacetime like a stone dropped in a pond, sending tiny ripples that stretch Earth by less than a proton.',
    sampleAr: 'عندما يصطدم ثقبان أسودان عملاقان على بعد مليارات السنين الضوئية، يهتز نسيج الزمكان كحجر أُلقي في بركة ماء، مرسلاً تموجات خافتة جداً تمدد الأرض وتنكمش بأقل من قُطر البروتون.'
  },
  {
    id: 'quantum_tunneling',
    category: 'physics_space',
    en: 'Quantum Tunneling',
    ar: 'النفق الكمومي (Quantum Tunneling)',
    sampleEn: 'Imagine rolling a tennis ball against a brick wall: in classical physics it always bounces back, but in quantum physics there is a tiny chance it simply appears on the other side.',
    sampleAr: 'تخيل رمي كرة تنس نحو جدار خرساني؛ في الفيزياء الكلاسيكية سترتد دائماً، لكن في عالم الكم هناك فرصة حقيقية لأن تختفي الكرة من أمام الجدار وتظهر فجأة على الجانب الآخر.'
  },
  {
    id: 'nuclear_fusion',
    category: 'physics_space',
    en: 'Nuclear Fusion in Stars',
    ar: 'الاندماج النووي في قلب النجوم',
    sampleEn: 'Nuclear fusion is forcing two lightweight hydrogen atoms together under immense heat until they weld into a helium atom, releasing the blinding radiant energy that powers our Sun.',
    sampleAr: 'الاندماج النووي هو ضغط ذرتي هيدروجين خفيفتين تحت درجات حرارة وضغط مهولين حتى تلتحما لتشكيل ذرة هيليوم واحدة، محررة طاقة جبارة هي ذاتها التي تضيء شمسنا منذ مليارات السنين.'
  },
  {
    id: 'doppler_effect',
    category: 'physics_space',
    en: 'The Doppler Effect',
    ar: 'تأثير دوبلر (Doppler Effect)',
    sampleEn: 'As an ambulance speeds toward you, it squishes its sound waves together making the siren high-pitched; as it zooms away, the sound waves stretch out, dropping the pitch.',
    sampleAr: 'عندما تقترب منك سيارة إسعاف مسرعة، تنضغط موجات الصوت الصادرة منها ليصبح صفيرها حاد النبرة، وبمجرد أن تتجاوزك وتبتعد، تتمدد الموجات فيصبح الصوت أغلظ وأعمق.'
  },
  {
    id: 'fermi_paradox',
    category: 'physics_space',
    en: 'The Fermi Paradox',
    ar: 'مفارقة فيرمي: أين الكائنات الفضائية؟',
    sampleEn: 'The universe contains trillions of ancient stars and hospitable planets that had billions of years head-start, so if intelligent life evolves naturally, where is everybody?',
    sampleAr: 'يحتوي الكون على ترليونات النجوم القديمة والكواكب الصالحة للحياة والتي سبقتنا بمليارات السنين؛ فإذا كان تطور الذكاء حتمياً، فلماذا يسود الصمت التام ولا نرى أحداً منهم؟'
  },
  {
    id: 'casimir_effect',
    category: 'physics_space',
    en: 'The Casimir Effect & Vacuum Energy',
    ar: 'تأثير كازيمير وطاقة الفراغ الكمومي',
    sampleEn: 'Empty space is not completely empty; particles constantly pop into and out of existence, pushing two mirror-flat metal plates together when placed microscopic distances apart.',
    sampleAr: 'الفراغ التام في الكون ليس خالياً على الإطلاق؛ بل تموج فيه جسيمات كمومية تظهر وتختفي باستمرار، وتضغط صفيحتين معدنيتين متقاربتين جداً نحو بعضهما بقوة حقيقية قابلة للقياس.'
  },
  {
    id: 'hawking_radiation',
    category: 'physics_space',
    en: 'Hawking Radiation',
    ar: 'إشعاع هوكينغ وتبخر الثقوب السوداء',
    sampleEn: 'At the boundary of a black hole, particle pairs spontaneously pop into existence. If one falls in while the other escapes into space, the black hole slowly leaks energy and evaporates.',
    sampleAr: 'عند حافة الثقب الأسود تتولد أزواج جسيمات من طاقة الفراغ؛ إذا ابتلع الثقب أحدهما وهرب الآخر للفضاء، يفقد الثقب الأسود جزءاً من كتلته تدريجياً حتى يتبخر بمرور الدهور.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. MATHEMATICS & LOGIC (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'bayes_theorem',
    category: 'math_logic',
    en: "Bayes' Theorem",
    ar: 'مبرهنة بايز في الاحتمالات (Bayes’ Theorem)',
    sampleEn: 'Bayes’ Theorem tells you how to rationally update your belief in a hypothesis as soon as you observe brand new evidence, avoiding jumping to emotional conclusions.',
    sampleAr: 'مبرهنة بايز تخبرك كيف تعدل وتحدث قناعتك باحتمال حدوث أمر ما بمجرد ظهور أدلة جديدة، وتمنعك من القفز لاستنتاجات متسرعة دون وزن المعطيات السابقة بدقة.'
  },
  {
    id: 'monty_hall',
    category: 'math_logic',
    en: 'The Monty Hall Problem',
    ar: 'معضلة مونتي هول (The Monty Hall Problem)',
    sampleEn: 'Behind one of three doors is a sports car, and two have goats. After you pick, the host opens a goat door: switching doors actually doubles your winning odds from 1/3 to 2/3.',
    sampleAr: 'خلف أحد الأبواب الثلاثة سيارة فارهة وخلف البابين الآخرين ماعز. بعد اختيارك يفتح المقدم باباً فيه ماعز؛ تغييرك لاختيارك للباب المتبقي يضاعف فرص فوزك من الثلث إلى الثلثين.'
  },
  {
    id: 'fibonacci_golden_ratio',
    category: 'math_logic',
    en: 'Fibonacci Sequence & Golden Ratio',
    ar: 'متتالية فيبوناتشي والنسبة الذهبية',
    sampleEn: 'Add each number to the one before it (1, 1, 2, 3, 5, 8...) to generate a spiral pattern that plants, sunflower seeds, and galaxies use to pack maximum space without wasting room.',
    sampleAr: 'اجمع كل رقم مع الرقم الذي يسبقه (1، 1، 2، 3، 5، 8...) لتولد نمطاً حلزونياً ساحراً تستخدمه بذور دوار الشمس وقواقع البحر والمجرات لرص مساحاتها بأعلى كفاءة طبيعية.'
  },
  {
    id: 'godel_incompleteness',
    category: 'math_logic',
    en: "Gödel's Incompleteness Theorems",
    ar: 'مبرهنات غودل بعدم الاكتمال',
    sampleEn: 'Gödel proved that no mathematical rulebook can ever be both 100% complete and free of contradictions; there will always be true statements that mathematics cannot prove.',
    sampleAr: 'أثبت غودل أنه لا يمكن لأي نظام رياضي قائم على بديهيات أن يكون مكتملاً وخالياً من التناقض في آن واحد؛ ستوجد دائماً حقائق رياضية صحيحة يستحيل إثباتها بالمعادلات الداخلية للنظام.'
  },
  {
    id: 'central_limit_theorem',
    category: 'math_logic',
    en: 'The Central Limit Theorem',
    ar: 'مبرهنة النهاية المركزية (Central Limit Theorem)',
    sampleEn: 'No matter how chaotic or irregular your original data distribution is, when you take enough random sample averages, they always form a smooth bell-shaped curve.',
    sampleAr: 'مهما كانت بياناتك الأصلية عشوائية أو غير منتظمة، بمجرد أن تأخذ عينات عشوائية متكررة وتحسب متوسطاتها، ستتجمع النتائج دائماً في شكل منحنى الجرس المتناسق (التوزيع الطبيعي).'
  },
  {
    id: 'primes_and_rsa',
    category: 'math_logic',
    en: 'Prime Numbers in Modern Cryptography',
    ar: 'الأعداد الأولية وتشفير RSA العالمي',
    sampleEn: 'It is trivially easy for a computer to multiply two 300-digit prime numbers together, but it would take all the supercomputers on Earth thousands of years to crack them back apart.',
    sampleAr: 'من السهل جداً لأي حاسوب ضرب عددين أوليين يتكون كل منهما من 300 خانة، لكن تفكيك الناتج والرجوع إلى العددين الأصليين يستغرق من أسرع حواسيب العالم آلاف السنين.'
  },
  {
    id: 'birthday_paradox',
    category: 'math_logic',
    en: 'The Birthday Paradox',
    ar: 'مفارقة أعياد الميلاد (Birthday Paradox)',
    sampleEn: 'In a room of just 23 people, there is a greater than 50% chance that two share the exact same birthday, because we are comparing every possible pair of people, not just matching against you.',
    sampleAr: 'في غرفة تضم 23 شخصاً فقط، هناك احتمال يتجاوز 50% أن يتشارك اثنان نفس يوم الميلاد بالضبط، لأننا نقارن كل الأزواج المحتملة مع بعضها وليس مقارنة الجميع بك وحدك.'
  },
  {
    id: 'fractals',
    category: 'math_logic',
    en: 'Fractals & Infinite Complexity',
    ar: 'الفركتلات والكسيريات (Fractals)',
    sampleEn: 'A fractal is a geometric shape that repeats its own pattern at every scale: zoom in on a Romanesco broccoli or a coastline, and the tiny pieces mirror the shape of the whole.',
    sampleAr: 'الكسيرية شكل هندسي يعيد إنتاج نمطه الذاتي عند كل مستويات التكبير؛ انظر لفرع شجرة أو نبتة البروكلي أو ساحل بحري وسترى أن الأجزاء الدقيقة تطابق الصورة الكلية تماماً.'
  },
  {
    id: 'infinite_hotel',
    category: 'math_logic',
    en: "Hilbert's Hotel of Infinity",
    ar: 'فندق هيلبرت اللانهائي (Hilbert’s Hotel)',
    sampleEn: 'A hotel with infinitely many rooms is 100% full, yet can easily accommodate a new guest by simply shifting room 1 to 2, 2 to 3, and freeing up room 1 instantly.',
    sampleAr: 'فندق يحتوي على عدد لا نهائي من الغرف وهو ممتلئ بالكامل، ومع ذلك يستطيع استقبال نزيل جديد بسهولة عبر نقل النزيل رقم 1 إلى الغرفة 2، ورقم 2 إلى 3، لتفرغ الغرفة 1 فوراً.'
  },
  {
    id: 'pigeonhole_principle',
    category: 'math_logic',
    en: 'The Pigeonhole Principle',
    ar: 'مبدأ برج الحمام (Pigeonhole Principle)',
    sampleEn: 'If you have 10 pigeons but only 9 nesting boxes, at least one box must contain more than one pigeon; simple logic that powers deep mathematical proofs.',
    sampleAr: 'إذا كان لديك 10 حمامات و9 أقفاص فقط، فلا بد حتماً أن يحتوي قفص واحد على الأقل على أكثر من حمامة؛ بديهية بسيطة ولكنها تشكل أساساً لبراهين رياضية وحسابية عميقة.'
  },
  {
    id: 'game_of_life',
    category: 'math_logic',
    en: "Conway's Game of Life",
    ar: 'لعبة الحياة لكونواي والانبثاق الذاتي',
    sampleEn: 'Four simple rules on a grid of black and white squares simulate life, giving rise to self-replicating gliders and complex evolving computer processors out of pure simplicity.',
    sampleAr: 'أربع قواعد حسابية بسيطة جداً مطبقة على مربعات سوداء وبيضاء تولد كائنات ذاتية الحركة ومعالجات برمجية معقدة، موضحة كيف ينبثق التعقيد المذهل من أبسط القواعد.'
  },
  {
    id: 'curse_of_dimensionality',
    category: 'math_logic',
    en: 'Curse of Dimensionality',
    ar: 'لعنة الأبعاد في معالجة البيانات',
    sampleEn: 'In high dimensions, empty space grows so mind-bogglingly fast that all data points become isolated from each other in the corners, breaking simple distance measurements.',
    sampleAr: 'عندما تزيد عدد المتغيرات والأبعاد في البيانات، يزداد الفراغ الشاغر بسرعة هائلة لدرجة أن جميع النقاط تصبح معزولة في أطراف الفضاء الرياضي مما يعطل مقاييس المسافة المعتادة.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BIOLOGY & MEDICINE (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'crispr',
    category: 'biology_medicine',
    en: 'CRISPR-Cas9 Gene Editing',
    ar: 'تقنية التعديل الجيني كريسبر (CRISPR-Cas9)',
    sampleEn: 'CRISPR works like a biological "Find and Replace" tool in a text document: a molecular guide navigates to a faulty genetic sentence, and enzyme scissors snip it out to insert the fix.',
    sampleAr: 'كريسبر تشبه أداة "البحث والاستبدال" في مستند وورد؛ دليل جزيئي يتعرف على الجملة الجينية المعطوبة في الحمض النووي، ومقص إنزيمي يقصها بدقة متناهية ليستبدلها بالرمز السليم.'
  },
  {
    id: 'photosynthesis',
    category: 'biology_medicine',
    en: 'Photosynthesis',
    ar: 'التمثيل الضوئي (البناء الضوئي)',
    sampleEn: 'Plants are solar-powered sugar factories that capture light beams from the sun and combine them with water from the ground and carbon dioxide from the air to bake energy-rich glucose.',
    sampleAr: 'النباتات مصانع سكر تعمل بالطاقة الشمسية؛ تلتقط فوتونات الضوء وتدمجها مع قطرات الماء من الجذور وغاز ثاني أكسيد الكربون من الهواء لتصنع سكر الجلوكوز وتطلق الأكسجين.'
  },
  {
    id: 'natural_selection',
    category: 'biology_medicine',
    en: 'Evolution by Natural Selection',
    ar: 'التطور بالانتخاب الطبيعي (Natural Selection)',
    sampleEn: 'In any environment with scarce food, organisms born with lucky random physical mutations survive longer, produce more offspring, and pass down those advantageous traits over generations.',
    sampleAr: 'في بيئة ذات موارد شحيحة، الكائنات التي تولد بطفرات عشوائية تمنحها ميزة (كفراء أدكن أو بصر أحد) تنجو لفترة أطول وتتكاثر وتنقل صفاتها الناجحة للأجيال التالية.'
  },
  {
    id: 'mrna_vaccines',
    category: 'biology_medicine',
    en: 'mRNA Vaccine Technology',
    ar: 'لقاحات الحمض النووي الريبوزي المرسال (mRNA)',
    sampleEn: 'An mRNA vaccine sends your cells a disposable blueprint recipe to build the harmless outer coat spikes of a virus, allowing your immune system to practice target-shooting without ever catching the disease.',
    sampleAr: 'يرسل لقاح mRNA إلى خلاياك وصفة مؤقتة لصنع الغلاف الخارجي غير الضار للفيروس، مما يمنح جهازك المناعي فرصة التدرب على الرماية والقضاء على العدو قبل وصول الفيروس الحقيقي.'
  },
  {
    id: 'mitochondria_atp',
    category: 'biology_medicine',
    en: 'Mitochondria & ATP Energy Currency',
    ar: 'الميتوكوندريا وعملة الطاقة الخلوية (ATP)',
    sampleEn: 'Mitochondria are the miniature rechargeable power plants of your cells that convert sandwich calories into tiny molecules called ATP—the universal spending currency for muscle movement and thoughts.',
    sampleAr: 'الميتوكوندريا هي محطات التوليد الخلوية المصغرة داخل جسمك؛ تحرق جزيئات الطعام وتحولها إلى عملة طاقة كيميائية تسمى ATP تنفقها خلاياك للركض والتفكير والتنفس.'
  },
  {
    id: 'epigenetics',
    category: 'biology_medicine',
    en: 'Epigenetics',
    ar: 'علم التخلق (Epigenetics): ما وراء الجينات',
    sampleEn: 'Your DNA is the written sheet music of an orchestra, but epigenetics is the conductor holding bookmarks and highlighter pens—turning volume up or down based on your diet and stress without altering the ink.',
    sampleAr: 'حمضك النووي هو النوتة الموسيقية المكتوبة، لكن علم التخلق هو قائد الأوركسترا؛ يقرر متى يعلو صوت الآلات ومتى يخفت بتأثير نمط حياتك وطعامك وتوترك، دون تغيير حرف واحد في النوتة.'
  },
  {
    id: 'immune_antibodies',
    category: 'biology_medicine',
    en: 'Antibodies & Immune Memory',
    ar: 'الأجسام المضادة والذاكرة المناعية',
    sampleEn: 'Antibodies are precision-engineered molecular handcuffs shaped to lock onto specific trespassers, tagging them with bright chemical flags so scavenger white blood cells devour them.',
    sampleAr: 'الأجسام المضادة قيود جزيئية مصممة بأشكال متطابقة مع بصمة الغزاة فقط؛ تمسك بالجراثيم وتلصق عليها إشارات تحذيرية لتأتي خلايا الدم البيضاء وتلتهمها فوراً.'
  },
  {
    id: 'action_potential',
    category: 'biology_medicine',
    en: 'Neural Action Potentials',
    ar: 'جهد الفعل العصبي (Action Potential)',
    sampleEn: 'When you touch a hot stove, sodium gates blast open across nerve cells, generating a rapid microscopic electrical spark that rushes up your arm at 100 meters per second to alert your brain.',
    sampleAr: 'عندما تلمس جسماً ساخناً، تفتح بوابات الصوديوم في خلاياك العصبية فجأة مولدة شرارة كهربائية كيميائية خاطفة تسري في ذراعك بسرعة 100 متر في الثانية لتحذر عقلك.'
  },
  {
    id: 'telomeres',
    category: 'biology_medicine',
    en: 'Telomeres & Biological Aging',
    ar: 'التيلوميرات وساعة الشيخوخة البيولوجية',
    sampleEn: 'Telomeres are the protective plastic tips at the ends of shoelaces for your chromosomes. Every time a cell divides, the tips wear shorter until the cell can no longer divide safely.',
    sampleAr: 'التيلوميرات هي الأغطية البلاستيكية الواقية الموجودة في أطراف أربطة الأحذية ولكن لكروموسوماتك؛ تتآكل وتقصر مع كل انقسام خلوي حتى تتوقف الخلية عن الانقسام وتبدأ الشيخوخة.'
  },
  {
    id: 'microbiome',
    category: 'biology_medicine',
    en: 'The Human Gut Microbiome',
    ar: 'الميكروبيوم المعوي وصحة العقل والجسد',
    sampleEn: 'Trillions of microscopic bacteria live in your gut like an energetic chemical factory, breaking down complex fiber, producing serotonin, and training your immune cells every second.',
    sampleAr: 'تعيش في أمعائك ترليونات البكتيريا الصديقة كمدينة صناعية تعج بالحياة؛ تهضم الألياف المعقدة وتصنع هرمونات السعادة كالسيروتونين وتدرب جهازك المناعي على مدار الساعة.'
  },
  {
    id: 'circadian_rhythm',
    category: 'biology_medicine',
    en: 'Circadian Biological Clocks',
    ar: 'الساعة البيولوجية اليومية (Circadian Rhythm)',
    sampleEn: 'Your master biological clock sits right behind your eyes; when blue morning light strikes your retina, it shuts down sleep melatonin and pumps cortisol to fire up your metabolic engine.',
    sampleAr: 'ساعتك البيولوجية المركزية تقع خلف عينيك مباشرة؛ بمجرد أن يلتقط ضوء الصباح الأزرق شبكيتي عينيك، يوقف فوراً إفراز هرمون النوم ميلاتونين ويطلق الكورتيزول لتستيقظ بنشاط.'
  },
  {
    id: 'antibiotic_resistance',
    category: 'biology_medicine',
    en: 'Antibiotic Resistance',
    ar: 'مقاومة البكتيريا للمضادات الحيوية',
    sampleEn: 'Taking half your antibiotic dose kills the weak bacteria but leaves the toughest survivors alive to reproduce and pass down resistance shields to the next generation of superbugs.',
    sampleAr: 'التوقف عن تناول المضاد الحيوي في منتصف الجرعة يقضي على البكتيريا الضعيفة فقط ويترك أشرسها على قيد الحياة لتتكاثر وتنقل دروع المناعة لسلالات بكتيرية خارقة جديدة.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PSYCHOLOGY & NEUROSCIENCE (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'neuroplasticity',
    category: 'psychology_neuro',
    en: 'Neuroplasticity',
    ar: 'المرونة العصبية (Neuroplasticity)',
    sampleEn: 'Your brain is like soft modeling clay, not hard computer chips: whenever you practice a new skill, neurons carve deep biological highways to make that task faster next time.',
    sampleAr: 'دماغك ليس شريحة حاسوب صلبة، بل كتلة صلصال ذكية؛ كلما مارست مهارة جديدة كالعزف أو البرمجة، تفتح الخلايا العصبية مسارات سريعة جديدة لتجعل المهمة أسهل في المرة القادمة.'
  },
  {
    id: 'cognitive_dissonance',
    category: 'psychology_neuro',
    en: 'Cognitive Dissonance',
    ar: 'التنافر المعرفي (Cognitive Dissonance)',
    sampleEn: 'The mental discomfort of holding two conflicting beliefs at once: when actions contradict values, the mind often invents irrational excuses rather than admitting an uncomfortable mistake.',
    sampleAr: 'الانزعاج النفسي الحاد الذي تشعر به عندما تتناقض أفعالك مع قناعاتك؛ مثل المدخن الذي يعلم ضرر التدخين، فيلجأ عقله لاختلاق أعذار وهمية بدلاً من الاعتراف بالخطأ.'
  },
  {
    id: 'dopamine_loop',
    category: 'psychology_neuro',
    en: 'Dopamine & The Anticipation Loop',
    ar: 'الدوبامين وحلقة الترقب والمكافأة',
    sampleEn: 'Dopamine is not the chemical of pleasure, but the chemical of anticipation: it spikes hardest right before you pull the slot machine handle or check a notification ping on your phone.',
    sampleAr: 'الدوبامين ليس هرمون المتعة بحد ذاتها، بل هرمون الترقب والانتظار؛ يفرز بأعلى معدلاته في اللحظة التي تسبق سحب ذراع القمار أو قبل فتح إشعار الهاتف الجديد مباشرة.'
  },
  {
    id: 'flow_state',
    category: 'psychology_neuro',
    en: 'The Flow State (Deep Immersion)',
    ar: 'حالة التدفق الذهني والاندماج الكامل (Flow State)',
    sampleEn: 'Flow occurs when task difficulty perfectly matches your highest skill level, causing self-consciousness to evaporate and time to seemingly stand still while you create.',
    sampleAr: 'تحدث حالة التدفق عندما تتطابق صعوبة التحدي تماماً مع ذروة مهاراتك؛ فيتلاشى الشعور بالذات والوقت ويندمج عقلك كلياً في الإبداع والإنتاج.'
  },
  {
    id: 'placebo_effect',
    category: 'psychology_neuro',
    en: 'The Placebo Effect',
    ar: 'تأثير الدواء الوهمي (Placebo Effect)',
    sampleEn: 'If your brain genuinely believes a harmless sugar pill is a potent painkiller, it releases real internal endorphins that biochemically diminish physical suffering.',
    sampleAr: 'إذا صدق عقلك بصدق أن حبة السكر الخالية من الدواء هي مسكن قوي، فإنه يصدر إشارات عصبية فورية لإفراز مسكنات أفيونية طبيعية داخل جسمك تخفف الألم الحقيقي بالفعل.'
  },
  {
    id: 'working_memory_limits',
    category: 'psychology_neuro',
    en: "Working Memory & Miller's Law (7±2)",
    ar: 'حدود الذاكرة العاملة وقانون ميلر (7±2)',
    sampleEn: 'Your conscious working memory is like a tiny desktop that can only hold about 4 to 7 items at once before older thoughts fall off the edge unless written down.',
    sampleAr: 'ذاكرتك العاملة الواعية تشبه طاولة مكتب صغيرة جداً لا تتسع لأكثر من 4 إلى 7 أفكار في اللحظة الواحدة؛ فإذا حاولت إضافة فكرة جديدة تسقط الأفكار السابقة ما لم تدونها.'
  },
  {
    id: 'dunning_kruger',
    category: 'psychology_neuro',
    en: 'The Dunning-Kruger Effect',
    ar: 'تأثير دانينغ-كروجر: وهم المعرفة',
    sampleEn: 'Beginners with shallow knowledge often possess immense unearned confidence because they do not yet know enough to realize how vast and intricate the subject truly is.',
    sampleAr: 'المبتدئون في مجال ما يمتلكون ثقة عمياء ومفرطة لأن معلوماتهم البسيطة لا تؤهلهم حتى لإدراك مدى اتساع وتعقيد العلم الحقيقي، بينما يشكك الخبراء في قدراتهم.'
  },
  {
    id: 'confirmation_bias',
    category: 'psychology_neuro',
    en: 'Confirmation Bias',
    ar: 'الانحياز التأكيدي (Confirmation Bias)',
    sampleEn: 'Our natural tendency to enthusiastically collect evidence that validates our pre-existing opinions while quietly ignoring or explaining away solid contradictory proof.',
    sampleAr: 'الميل البشري الطبيعي للبحث عن الأدلة التي تدعم قناعاتنا المسبقة والاحتفاء بها، مع تجاهل أو تسخيف أي حقائق دامغة تعارض ما نؤمن به بالفعل.'
  },
  {
    id: 'spacing_effect',
    category: 'psychology_neuro',
    en: 'The Spacing Effect & Spaced Repetition',
    ar: 'أثر المباعدة والتكرار المتباعد في الحفظ',
    sampleEn: 'Studying a concept 20 minutes a day for a week embeds it permanently into long-term synapses, whereas cramming for 3 straight hours the night before dissolves within days.',
    sampleAr: 'مراجعة المفهوم لمدة 20 دقيقة موزعة على أسبوع تثبته في الذاكرة طويلة المدى للأبد، بينما حشو الدماغ لمدة 3 ساعات متواصلة ليلة الامتحان يتبخر بعد أيام قليلة.'
  },
  {
    id: 'hebbian_learning',
    category: 'psychology_neuro',
    en: "Hebbian Theory: Neurons That Fire Together Wire Together",
    ar: 'قاعدة هيب العصبية: الخلايا التي تنشط معاً تترابط معاً',
    sampleEn: 'When two neurons activate at the exact same moment, the synaptic bridge between them thickens, creating habits and automatic memories that trigger without thinking.',
    sampleAr: 'عندما تُطلق خليتان عصبيتان إشاراتهما في نفس اللحظة مراراً وتكراراً، يقوى الجسر الكيميائي بينهما لتتحول تلك الاستجابة إلى عادة ذهنية أو مهارة تلقائية لا تتطلب تفكيراً.'
  },
  {
    id: 'hedonic_treadmill',
    category: 'psychology_neuro',
    en: 'The Hedonic Treadmill',
    ar: 'مطحنة اللذة (Hedonic Treadmill)',
    sampleEn: 'Whether you win the lottery or buy a dream sports car, your happiness quickly returns to your default baseline as your expectations adapt to the new normal.',
    sampleAr: 'سواء ربحت جائزة اليانصيب الكبرى أو اشتريت أحدث سيارة، سرعان ما تعود مشاعرك إلى مستوى سعادتك الأساسي المعتاد لأن النفس البشرية تتأقلم سريعاً مع الوضع الجديد.'
  },
  {
    id: 'sleep_memory_consolidation',
    category: 'psychology_neuro',
    en: 'Sleep & Memory Consolidation',
    ar: 'النوم وتثبيت الذكريات في الدماغ',
    sampleEn: 'During deep sleep, your hippocampus replays the day’s learning on fast-forward, transferring fragile daily memories into the sturdy neocortex vault for lifetime storage.',
    sampleAr: 'أثناء النوم العميق، يعيد الحصين في دماغك شريط ذكريات اليوم بسرعة مضاعفة، ناقلاً المعلومات الهشة إلى القشرة الدماغية الصلبة ليحفظها كذكريات دائمة.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. EVERYDAY TECHNOLOGY & ENGINEERING (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'touchscreens',
    category: 'engineering_tech',
    en: 'Capacitive Touchscreens',
    ar: 'شاشات اللمس السعوية في الهواتف',
    sampleEn: 'Your phone screen carries an invisible grid of tiny electrostatic charges. Because your finger naturally conducts electricity, touching the glass alters the local field and pinpoints coordinates.',
    sampleAr: 'تحمل شاشة هاتفك شبكة غير مرئية من الشحنات الكهربائية الساكنة؛ ولأن إصبعك موصل طبيعي للكهرباء، فإن لمس الزجاج يسحب جزءاً من الشحنة فيحدد المعالج مكان إصبعك فوراً.'
  },
  {
    id: 'gps',
    category: 'engineering_tech',
    en: 'GPS Satellite Triangulation',
    ar: 'نظام تحديد المواقع (GPS) وحساب المثلثات',
    sampleEn: 'At least four satellites orbiting Earth broadcast atomic clock timestamps; by measuring the microsecond delay it took each radio wave to reach you, your receiver calculates your exact spot.',
    sampleAr: 'تبث أربعة أقمار صناعية تدور في الفضاء إشارات زمنية دقيقة بساعات ذرية؛ ومن خلال حساب التأخير بجزء من المليون من الثانية الذي استغرقته الإشارة للوصول لهاتفك، يحدد موقعك بالضبط.'
  },
  {
    id: 'microwave_ovens',
    category: 'engineering_tech',
    en: 'Microwave Ovens',
    ar: 'أفران الميكروويف وتسخين الطعام',
    sampleEn: 'Microwaves blast radio waves specifically tuned to vibrate water molecules in food millions of times per second, generating friction heat from the inside out.',
    sampleAr: 'تطلق أفران الميكروويف موجات كهرومغناطيسية مضبوطة على تردد يجعل جزيئات الماء داخل الطعام تهتز ملايين المرات في الثانية، فينتج احتكاك يولد حرارة تطهو الطعام بسرعة.'
  },
  {
    id: 'noise_cancelling',
    category: 'engineering_tech',
    en: 'Active Noise Cancellation (ANC)',
    ar: 'عزل الضوضاء النشط (ANC) في السماعات',
    sampleEn: 'Microphones on the headphone listen to ambient airplane engine roar and instantly play the exact inverted mirror audio wave into your ear, cancelling the peaks and troughs to zero.',
    sampleAr: 'تلتقط ميكروفونات السماعة صوت هدير محرك الطائرة الخارجي وتصنع فوراً موجة صوتية معاكسة تماماً (مقلوبة القمة والقاع) لتلتقيا في أذنك وتلغي كل منهما الأخرى ليحل الصمت.'
  },
  {
    id: 'fiber_optics',
    category: 'engineering_tech',
    en: 'Fiber Optics & Total Internal Reflection',
    ar: 'الألياف الضوئية والانعكاس الكلي الداخلي',
    sampleEn: 'Fiber optic cables bounce laser pulses through ultra-pure glass strands at shallow angles, trapping the light inside like a mirrored hall so internet signals cross oceans at light speed.',
    sampleAr: 'تنقل كابلات الألياف الضوئية نبضات الليزر عبر خيوط زجاجية فائقة النقاء بزوايا حادة تجعل الضوء يرتد داخلياً كقاعة مرايا مغلقة ليعبر قيعان المحيطات بسرعة الضوء دون تسرب.'
  },
  {
    id: 'jet_engine',
    category: 'engineering_tech',
    en: 'Jet Engines (Turbofans)',
    ar: 'المحركات النفاثة في الطائرات (Jet Engines)',
    sampleEn: 'A jet engine sucks in massive volumes of air, compresses it into a blast furnace, sprays fuel to ignite an explosive blowtorch, and shoots the exhaust out the back to rocket the plane forward.',
    sampleAr: 'يسحب المحرك النفاث كميات ضخمة من الهواء، ويضغطها في غرف احتراق، ثم يرش الوقود ليشعل لهباً هادراً يندفع من الخلف فيدفع الطائرة للأمام وفق قانون الفعل ورد الفعل.'
  },
  {
    id: 'refrigerator_cycle',
    category: 'engineering_tech',
    en: 'The Refrigeration Cycle',
    ar: 'دورة التبريد في الثلاجات والمكيفات',
    sampleEn: 'A refrigerator doesn’t create coldness; it uses a compressed fluid to absorb heat from inside the crisper drawers and dump that warmth through coils outside into the kitchen.',
    sampleAr: 'الثلاجة لا تصنع البرودة من العدم، بل تدير سائلاً يتبخر داخلها ليمتص كل الحرارة من أطعمتك، ثم يضغطه المحرك ليطرد تلك الحرارة في هواء المطبخ عبر الأنابيب الخلفية.'
  },
  {
    id: 'lithium_batteries',
    category: 'engineering_tech',
    en: 'Lithium-Ion Batteries',
    ar: 'بطاريات الليثيوم أيون وشحن الأجهزة',
    sampleEn: 'Charging your phone forces tiny lithium ions to march through a chemical separator to store up on one electrode; unplugging allows them to flow back, generating current for your screen.',
    sampleAr: 'شحن هاتفك يجبر أيونات الليثيوم الصغيرة على العبور عبر حاجز كيميائي والتكدس في قطب البطارية؛ وبمجرد الاستخدام تعود الأيونات لمكانها مطلقة تياراً كهربائياً يشغل شاشتك.'
  },
  {
    id: 'led_lighting',
    category: 'engineering_tech',
    en: 'LED Lighting',
    ar: 'إضاءة الليد (LED): أشباه الموصلات المضيئة',
    sampleEn: 'Instead of burning a hot metal wire like antique light bulbs, an LED forces electrons to drop across a microscopic semiconductor gap, releasing cold photons directly as pure light.',
    sampleAr: 'بدلاً من تسخين سلك معدني لدرجة التوهج كالمصابيح القديمة، يجبر مصباح الليد الإلكترونات على القفز عبر فجوة في مادة شبه موصلة فتحرر طاقتها مباشرة كفوتونات ضوئية باردة وموفرة.'
  },
  {
    id: 'rfid_nfc',
    category: 'engineering_tech',
    en: 'RFID & NFC Contactless Payments',
    ar: 'تقنية الدفع اللاتلامسي (NFC و RFID)',
    sampleEn: 'The microchip in your credit card has no battery: when brought near a payment terminal, magnetic induction wirelessly powers the chip for a split second to exchange security tokens.',
    sampleAr: 'الشريحة داخل بطاقتك البنكية لا تحتوي على بطارية؛ فعند تقريبها من جهاز الدفع، يولد المجال المغناطيسي تياراً لاسلكياً يشغل الشريحة لجزء من الثانية لترسل رمز الدفع المشفر.'
  },
  {
    id: 'pid_controllers',
    category: 'engineering_tech',
    en: 'PID Controllers in Automation',
    ar: 'متحكمات PID في الأنظمة الذاتية',
    sampleEn: 'Like steering a car on cruise control: it looks at where you are, where you want to be, how fast you are getting there, and accumulated drift to make silky-smooth steering adjustments.',
    sampleAr: 'مثل تثبيت سرعة السيارة في المنحدرات؛ يقارن المتحكم بين سرعتك الحالية والمطلوبة، وسرعة اقترابك منها، والانحرافات السابقة، ليدوس البنزين برقة متناهية دون اهتزاز.'
  },
  {
    id: 'solar_photovoltaics',
    category: 'engineering_tech',
    en: 'Photovoltaic Solar Panels',
    ar: 'الخلايا الشمسية الكهروضوئية (Solar PV)',
    sampleEn: 'Sunlight photons knock electrons loose from silicon atoms in the panel, creating a directed flow of electricity that charges batteries and powers cities without any moving parts.',
    sampleAr: 'تصطدم فوتونات ضوء الشمس بذرات السيليكون المعالجة في اللوح فتقذف الإلكترونات وتجبرها على السير في اتجاه محدد، مولدة تياراً كهربائياً نظيفاً دون أي أجزاء ميكانيكية متحركة.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. ECONOMICS & GAME THEORY (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'opportunity_cost',
    category: 'economics_systems',
    en: 'Opportunity Cost',
    ar: 'تكلفة الفرصة البديلة (Opportunity Cost)',
    sampleEn: 'The true price of any choice is the value of the next best alternative you sacrificed: spending 2 hours playing a video game didn’t just cost zero dollars, it cost the 2 hours of sleep you lost.',
    sampleAr: 'التكلفة الحقيقية لأي قرار تتخذه هي قيمة البديل الأفضل الذي ضحيت به؛ فقضاء ساعتين في ألعاب الفيديو لا يكلفك صفراً من المال، بل كلفك ساعتين من المذاكرة أو النوم التي خسرتها للأبد.'
  },
  {
    id: 'prisoners_dilemma',
    category: 'economics_systems',
    en: "The Prisoner's Dilemma",
    ar: 'معضلة السجينين في نظرية الألعاب',
    sampleEn: 'Two isolated suspects can both stay silent and receive minor sentences; but individual self-interest tempts each to betray the other, leading both to the worst collective prison term.',
    sampleAr: 'مشتبه بهما معزولان؛ إن صمتا معاً خرجا بعقوبة طفيفة، لكن المصلحة الفردية تدفع كل منهما لخيانة رفيقه خوفاً وطمعاً، فيقع الاثنان في أسوأ عقوبة سجن ممكنة.'
  },
  {
    id: 'inflation',
    category: 'economics_systems',
    en: 'Inflation & Purchasing Power',
    ar: 'التضخم وفقدان القوة الشرائية',
    sampleEn: 'When the supply of money grows faster than the actual goods available on store shelves, each individual dollar buys a smaller slice of bread, making prices climb.',
    sampleAr: 'عندما تزداد كمية الأموال المطبوعة في السوق بسرعة أكبر من السلع الحقيقية المنتجة على الأرفف، تفقد كل ورقة نقدية قيمتها وتشتري كمية أقل من الخبز، فترتفع الأسعار.'
  },
  {
    id: 'sunk_cost_fallacy',
    category: 'economics_systems',
    en: 'The Sunk Cost Fallacy',
    ar: 'مغالطة التكلفة الغارقة (Sunk Cost Fallacy)',
    sampleEn: 'Continuing to watch a terrible movie or pour money into a broken car simply because you already paid for it, ignoring that the past investment is gone forever.',
    sampleAr: 'الإصرار على إكمال مشاهدة فيلم ممل أو إصلاح سيارة هالكة فقط لأنك دفعت المال مسبقاً، متجاهلاً أن ما دفعته ذهب ولن يعود وأن استمرارك يضيع وقتك ومستقبلك أيضاً.'
  },
  {
    id: 'tragedy_of_commons',
    category: 'economics_systems',
    en: 'Tragedy of the Commons',
    ar: 'مأساة المشاع (Tragedy of the Commons)',
    sampleEn: 'When a pasture is shared freely by all herders, each person adds extra cows for private profit until the shared grass is completely stripped bare and everyone starves.',
    sampleAr: 'عندما يكون مرعى الأغنام ملكاً عاماً ومجانياً للجميع، يسعى كل راعٍ لإضافة المزيد من مواشيه لزيادة أرباحه الفردية، حتى يُباد العشب المشترك تماماً وتجوع مواشي الجميع.'
  },
  {
    id: 'comparative_advantage',
    category: 'economics_systems',
    en: 'Comparative Advantage & Global Trade',
    ar: 'الميزة النسبية والتجارة العالمية',
    sampleEn: 'Even if country A is faster at producing both wine and cloth than country B, both become far richer if each focuses strictly on what they produce with lowest relative sacrifice.',
    sampleAr: 'حتى لو كانت دولة ما أسرع في إنتاج القمح والسيارات معاً من جارتها، فإن الطرفين يصبحان أكثر ثراءً إذا تخصص كل بلد في السلعة التي ينتجها بأقل تضحية نسبية وتبادلا الفائض.'
  },
  {
    id: 'nash_equilibrium',
    category: 'economics_systems',
    en: 'Nash Equilibrium',
    ar: 'توازن ناش في اتخاذ القرار (Nash Equilibrium)',
    sampleEn: 'A state in a strategic game where no player has any incentive to change their current tactic unilaterally because doing so would leave them worse off given everyone else’s choices.',
    sampleAr: 'حالة استقرار في لعبة استراتيجية يصل فيها كل طرف إلى قرار لا يمكنه تغييره منفرداً دون أن تتضرر مصلحته الشخصية، طالما أن بقية اللاعبين متمسكون بقراراتهم.'
  },
  {
    id: 'supply_and_demand',
    category: 'economics_systems',
    en: 'Supply and Demand Dynamics',
    ar: 'قانون العرض والطلب',
    sampleEn: 'An invisible auction: if everyone suddenly wants umbrellas during a downpour but stores only have ten in stock, prices surge until buyers match the available inventory.',
    sampleAr: 'مزاد غير مرئي؛ إذا اندفعت عاصفة فجأة وأراد الجميع شراء مظلات بينما لا يملك التاجر سوى عشر منها، ترتفع الأسعار تلقائياً حتى تتوازن رغبة المشترين مع المعروض.'
  },
  {
    id: 'compound_interest',
    category: 'economics_systems',
    en: 'Compound Interest & Exponential Growth',
    ar: 'الفائدة المركبة والنمو الأسي',
    sampleEn: 'A snowball rolling down a snowy mountain: in early turns it picks up barely a handful, but as the accumulated bulk grows, every single turn adds tons of fresh snow exponentially.',
    sampleAr: 'كرة ثلج تتدحرج من قمة جبل شاهق؛ في البداية تجمع حفنة ثلج صغيرة، ولكن مع تضخم حجمها، تصبح كل دورة جديدة قادرة على امتصاص أطنان من الثلج بنمو أسي مذهل.'
  },
  {
    id: 'moral_hazard',
    category: 'economics_systems',
    en: 'Moral Hazard',
    ar: 'الخطر الأخلاقي (Moral Hazard)',
    sampleEn: 'People take reckless risks when they know someone else will absorb the loss: like driving carelessly because an insurance company promised to cover every fender bender.',
    sampleAr: 'ميل الإنسان للإقدام على تصرفات متهورة وغير محسوبة عندما يعلم أن شخصاً آخر سيتحمل الخسارة؛ كالقيادة بسرعة جنونية لأن شركة التأمين ستصلح السيارة مجاناً.'
  },
  {
    id: 'cobra_effect',
    category: 'economics_systems',
    en: 'The Cobra Effect (Perverse Incentives)',
    ar: 'تأثير الكوبرا: الحوافز العكسية',
    sampleEn: 'When the British offered cash bounties for dead venomous cobras in India, citizens began breeding cobras at home to sell them—making the wild snake population explode.',
    sampleAr: 'عندما رصد المستعمرون مكافأة مالية لكل ثعبان كوبرا ميت للقضاء عليها في الهند، بدأ السكان في تربية الكوبرا في منازلهم لقتلها وبيعها، مما ضاعف أعداد الثعابين بدلاً من تقليلها.'
  },
  {
    id: 'network_effects',
    category: 'economics_systems',
    en: 'Network Effects',
    ar: 'أثر الشبكة (Network Effects)',
    sampleEn: 'The first telephone on Earth was completely worthless because it had nobody to ring; as more people bought phones, the value of everyone’s existing phone multiplied.',
    sampleAr: 'أول هاتف صُنع في العالم كان بلا أي قيمة لأنه لم يكن هناك أحد للاتصال به؛ ومع شراء كل شخص جديد لهاتف، تضاعفت قيمة فائدة هواتف كل المشتركين السابقين في الشبكة.'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. PHILOSOPHY & MENTAL MODELS (12 topics)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'feynman_technique',
    category: 'philosophy_thinking',
    en: 'The Feynman Technique',
    ar: 'تقنية فاينمان للتعلم العميق',
    sampleEn: 'Pick any topic, teach it to a bright 10-year-old in plain words without jargon. Whenever you stumble or use fancy academic words, return to source material to plug your gaps.',
    sampleAr: 'اختر أي مفهوم معقد واشرحه لطفل في العاشرة من عمره بكلمات واضحة وتشبيهات بسيطة؛ وكلما تعثرت أو لجأت لمصطلح أكاديمي غامض، ارجع لمصدر التعلم لتسد الفجوة في فهمك.'
  },
  {
    id: 'ockhams_razor',
    category: 'philosophy_thinking',
    en: "Ockham's Razor",
    ar: 'شفرة أوكام (Occam’s Razor)',
    sampleEn: 'When multiple explanations fit the evidence, the one requiring the fewest assumptions and unseen conspiracies is usually the true one.',
    sampleAr: 'عندما يتنافس تفسيران لتوضيح حدث ما، فإن التفسير الذي يتطلب أقل عدد من الافتراضات والتفاصيل المعقدة وغير المرئية هو الأقرب للصواب والمنطق.'
  },
  {
    id: 'first_principles',
    category: 'philosophy_thinking',
    en: 'First Principles Thinking',
    ar: 'التفكير من المبادئ الأولى (First Principles)',
    sampleEn: 'Boil a complex problem down to its most fundamental, indisputable physical truths and build new solutions up from scratch, instead of reasoning by copying what others do.',
    sampleAr: 'تجريد المشكلة المعقدة من كل الآراء السائدة حتى تصل إلى حقائقها الفيزيائية الأساسية التي لا تقبل الشك، ثم البناء من الصفر بدلاً من مجرد تقليد الآخرين.'
  },
  {
    id: 'platos_cave',
    category: 'philosophy_thinking',
    en: "Plato's Allegory of the Cave",
    ar: 'رمزية الكهف لأفلاطون',
    sampleEn: 'Prisoners chained inside a dark cave mistake flickering shadows on the wall for reality, until one escapes outside into the blinding sunlight and discovers the real world.',
    sampleAr: 'سجناء مقيدون داخل كهف مظلم منذ طفولتهم يظنون أن الظلال المتحركة على الجدار هي الحقيقة الكاملة، حتى يتحرر أحدهم ويخرج للشمس الساطعة ليكتشف العالم الحقيقي.'
  },
  {
    id: 'ship_of_theseus',
    category: 'philosophy_thinking',
    en: 'The Ship of Theseus Paradox',
    ar: 'مفارقة سفينة ثيسيوس والهوية',
    sampleEn: 'If a wooden ship has every plank gradually replaced over decades of voyage, is it still the same original ship? What if someone builds a ship from the discarded old planks?',
    sampleAr: 'إذا استبدلت ألواح سفينة خشبية لوحاً تلو الآخر عبر عقود من الإبحار، فهل تظل هي نفس السفينة الأصلية؟ وماذا لو جمع شخص الألواح القديمة وصنع منها سفينة أخرى، أيهما الأصل؟'
  },
  {
    id: 'trolley_problem',
    category: 'philosophy_thinking',
    en: 'The Trolley Problem',
    ar: 'معضلة الترام الأخلاقية (The Trolley Problem)',
    sampleEn: 'A runaway train is barreling toward five workers; you can pull a lever to divert it onto a side track where it will kill only one. Do you act to maximize net lives saved?',
    sampleAr: 'قطار منطلق نحو خمسة عمال على السكة؛ يمكنك سحب مقبض لتحويله إلى مسار جانبي يقتل فيه عاملاً واحداً فقط. هل تتدخل بإرادتك لإنقاذ الأغلبية أم ترفض القتل المباشر؟'
  },
  {
    id: 'hanlons_razor',
    category: 'philosophy_thinking',
    en: "Hanlon's Razor",
    ar: 'شفرة هانلون (Hanlon’s Razor)',
    sampleEn: 'Never attribute to malice that which is adequately explained by stupidity or human error: most interpersonal friction stems from simple misunderstandings, not evil plots.',
    sampleAr: 'لا تعزُ أبداً إلى سوء النوايا والمؤامرات ما يمكن تفسيره بالسهو أو قلة المعرفة؛ فأغلب أخطاء البشر ناتجة عن سوء الفهم البسيط وليس عن تخطيط شرير مسبق.'
  },
  {
    id: 'second_order_thinking',
    category: 'philosophy_thinking',
    en: 'Second-Order Thinking',
    ar: 'التفكير من الدرجة الثانية (Second-Order Thinking)',
    sampleEn: 'First-order thinking asks: "What immediate reward will this action bring?" Second-order thinking asks: "And then what happens after that, and what are the ripple effects?"',
    sampleAr: 'التفكير من الدرجة الأولى يسأل: "ما الفائدة الفورية لهذا القرار؟" أما التفكير من الدرجة الثانية فيسأل: "وماذا سيحدث بعد ذلك؟ وما هي الآثار الجانبية المترتبة على المدى الطويل؟"'
  },
  {
    id: 'inversion_mental_model',
    category: 'philosophy_thinking',
    en: 'Inversion Principle (Carl Jacobi)',
    ar: 'مبدأ القلب والعكس (Inversion Thinking)',
    sampleEn: 'Instead of trying to figure out how to be extraordinarily successful, turn the problem upside down: figure out all the ways to fail completely, and strictly avoid them.',
    sampleAr: 'بدلاً من البحث المعقد عن أسرار النجاح المجهولة، اقلب السؤال رأساً على عقب: حدد كل السلوكيات التي تضمن فشلك المؤكد في الحياة، وتجنبها بصرامة.'
  },
  {
    id: 'map_not_territory',
    category: 'philosophy_thinking',
    en: 'The Map is Not the Territory',
    ar: 'الخريطة ليست هي الواقع (The Map is Not the Territory)',
    sampleEn: 'Our models, theories, and words are simplified paper maps of reality; mistaking the mental model for the actual chaotic terrain leads to dangerous blind spots.',
    sampleAr: 'نظرياتنا وكلماتنا ومخططاتنا هي مجرد خرائط مبسطة للعالم؛ واعتقادك بأن الخريطة هي الواقع الفعلي بذاته يوقعك في فخاخ وأخطاء جسيمة لأن الواقع أعقد بكثير.'
  },
  {
    id: 'chestertons_fence',
    category: 'philosophy_thinking',
    en: "Chesterton's Fence",
    ar: 'سياج تشسترتون (Chesterton’s Fence)',
    sampleEn: 'Never tear down an old fence across a road until you discover why it was erected in the first place: reforms without understanding original purpose invite disaster.',
    sampleAr: 'إياك أن تهدم سياجاً قديماً يقف في منتصف طريق حتى تعرف تماماً لماذا بنته الأجيال السابقة في هذا الموضع؛ فتغيير النظم دون فهم علتها الأصلية يقود لكوارث غير متوقعة.'
  },
  {
    id: 'survivorship_bias',
    category: 'philosophy_thinking',
    en: 'Survivorship Bias',
    ar: 'انحياز النجاة (Survivorship Bias)',
    sampleEn: 'During WW2, the military planned to armor areas of returning bombers riddled with bullet holes. Mathematician Abraham Wald realized: armor the unhit areas, because planes hit there never returned.',
    sampleAr: 'في الحرب العالمية، أراد الجيش تدريع أجزاء الطائرات العائدة المليئة بالرصاص، لكن عالم الرياضيات فطن إلى العكس: درعوا الأماكن النظيفة، لأن الطائرات التي أصيبت فيها تحطمت ولم تعد أصلاً.'
  }
];

/**
 * Returns all topics
 */
export function getAllFeynmanTopics() {
  return FEYNMAN_TOPICS;
}

/**
 * Filters topics by category
 */
export function getTopicsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return FEYNMAN_TOPICS;
  return FEYNMAN_TOPICS.filter(t => t.category === categoryId);
}

/**
 * Picks a random topic from the entire library
 */
export function getRandomFeynmanTopic() {
  const idx = Math.floor(Math.random() * FEYNMAN_TOPICS.length);
  return FEYNMAN_TOPICS[idx];
}

/**
 * Search topics by query (matches in Arabic & English)
 */
export function searchFeynmanTopics(query) {
  if (!query || !query.trim()) return FEYNMAN_TOPICS;
  const q = query.trim().toLowerCase();
  return FEYNMAN_TOPICS.filter(t =>
    t.en.toLowerCase().includes(q) ||
    t.ar.toLowerCase().includes(q) ||
    t.sampleEn.toLowerCase().includes(q) ||
    t.sampleAr.toLowerCase().includes(q)
  );
}
