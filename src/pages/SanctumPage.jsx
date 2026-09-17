import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppUI } from '../contexts/AppUIContext';
import {
  FaFlask,
  FaGavel,
  FaGem,
  FaSkull,
  FaSearch,
  FaHammer,
  FaPaintBrush,
  FaCheck,
  FaCoins,
  FaFire,
  FaArrowRight,
  FaUndo,
  FaEye,
  FaLock,
  FaUnlock,
  FaDatabase,
  FaProjectDiagram,
  FaRobot,
  FaBrain,
  FaBolt,
  FaGlobe,
  FaBook,
  FaCalculator,
  FaDice,
  FaBalanceScale,
  FaShieldAlt,
  FaUserGraduate,
  FaExclamationCircle,
  FaTimesCircle,
  FaCheckCircle,
  FaFolderOpen,
  FaTrophy,
  FaScroll,
  FaLightbulb,
  FaUserSecret,
  FaBoxOpen,
  FaAtom,
  FaCube,
  FaFeatherAlt
} from 'react-icons/fa';
import './SanctumPage.css';

// ── THE 8 CORE CURRICULUM DOMAINS ─────────────────────────────────────────────
const PROJECT_DOMAINS = [
  { id: 'ds', nameEn: 'Data Science', nameAr: 'علوم البيانات', icon: <FaDatabase />, color: '#38bdf8' },
  { id: 'dsa', nameEn: 'Data Structures', nameAr: 'هياكل البيانات', icon: <FaProjectDiagram />, color: '#818cf8' },
  { id: 'ml', nameEn: 'Machine Learning', nameAr: 'تعلم الآلة', icon: <FaRobot />, color: '#4ade80' },
  { id: 'dl', nameEn: 'Deep Learning', nameAr: 'التعلم العميق', icon: <FaBrain />, color: '#ec4899' },
  { id: 'ai', nameEn: 'AI', nameAr: 'الذكاء الاصطناعي', icon: <FaBolt />, color: '#a855f7' },
  { id: 'net', nameEn: 'Networking', nameAr: 'الشبكات والإنترنت', icon: <FaGlobe />, color: '#06b6d4' },
  { id: 'eng', nameEn: 'English Skills', nameAr: 'مهارات الإنجليزية', icon: <FaBook />, color: '#f59e0b' },
  { id: 'math', nameEn: 'Mathematics Skills', nameAr: 'مهارات الرياضيات', icon: <FaCalculator />, color: '#f97316' },
];

// ── PRESET DATA FOR CHAMBER 1: ALCHEMICAL CRUCIBLE (8 PROJECT DOMAINS) ────────
const CRUCIBLE_RECIPES = [
  {
    id: 'ds_ml',
    domainA: {
      field: 'Data Science',
      fieldAr: 'علوم البيانات',
      concept: 'Feature Pipelines & Distribution Scaling',
      conceptAr: 'مسارات معالجة البيانات وتوزيع الخصائص',
      icon: <FaDatabase />,
      color: '#38bdf8'
    },
    domainB: {
      field: 'Machine Learning',
      fieldAr: 'تعلم الآلة',
      concept: 'Gradient Descent & Loss Optimization',
      conceptAr: 'الانحدار التدريجي وتقليل دوال الخسارة',
      icon: <FaRobot />,
      color: '#4ade80'
    },
    analogies: [
      {
        id: 'dml1',
        labelA: 'Variance vs Bias Tradeoff',
        labelAAr: 'الموازنة بين التباين والانحياز (Bias-Variance)',
        labelB: 'Overfitting vs Underfitting Boundary',
        labelBAr: 'حدود فرط التخصيص وضعف المطابقة'
      },
      {
        id: 'dml2',
        labelA: 'Train / Test Stratified Split',
        labelAAr: 'تقسيم البيانات الطبقي (تدريب واختبار)',
        labelB: 'Cross-Validation Out-of-Sample Score',
        labelBAr: 'التحقق المتقاطع لتقييم العينات الجديدة'
      },
      {
        id: 'dml3',
        labelA: 'StandardScaler & Log Transform Normalization',
        labelAAr: 'معايرة القيم بالتحويل اللوغاريتمي والمعياري',
        labelB: 'Gradient Descent Convergence Stability',
        labelBAr: 'استقرار تقارب خوارزمية الانحدار التدريجي'
      }
    ],
    takeawayEn:
      'Data Science data transformations are the exact mathematical prerequisites that allow Machine Learning optimization algorithms to converge without vanishing or exploding gradients.',
    takeawayAr:
      'معالجة وتحويل البيانات في علوم البيانات هي المتطلب الرياضي المباشر الذي يسمح لخوارزميات تعلم الآلة بالتقارب والتعلم بكفاءة عالية دون تشوه في التدرجات.'
  },
  {
    id: 'dsa_net',
    domainA: {
      field: 'Data Structures',
      fieldAr: 'هياكل البيانات',
      concept: 'Hash Table & Collision Resolution',
      conceptAr: 'جداول التجزئة وتفادي التصادم',
      icon: <FaProjectDiagram />,
      color: '#818cf8'
    },
    domainB: {
      field: 'Networking',
      fieldAr: 'الشبكات والإنترنت',
      concept: 'Packet Routing & NAT Port Mapping',
      conceptAr: 'توجيه الحزم وعناوين NAT',
      icon: <FaGlobe />,
      color: '#06b6d4'
    },
    analogies: [
      {
        id: 'dn1',
        labelA: 'Hash Key Hashing to Bucket Index',
        labelAAr: 'تحويل المفتاح إلى مؤشر الحاوية بالتجزئة',
        labelB: 'Public IP + Port Translation Table',
        labelBAr: 'جدول تحويل المنافذ وعناوين IP العامة'
      },
      {
        id: 'dn2',
        labelA: 'Bucket Chaining / Open Addressing',
        labelAAr: 'حل التصادم بالسلاسل أو السبر المفتوح',
        labelB: 'Packet Collision & Backoff Retransmission',
        labelBAr: 'تصادم الحزم وإعادة الإرسال بعد مهلة'
      },
      {
        id: 'dn3',
        labelA: 'Constant Average Lookup Time O(1)',
        labelAAr: 'زمن البحث اللحظي في المتوسط O(1)',
        labelB: 'Direct Subnet Fast-Path Forwarding',
        labelBAr: 'التمرير السريع المباشر في الشبكة الفرعية'
      }
    ],
    takeawayEn:
      'Both Data Structures and Networking convert massive, unbounded identifier spaces into fast deterministic endpoints using dynamic lookup tables while engineering resilient collision buffers.',
    takeawayAr:
      'كلا المجالين (هياكل البيانات والشبكات) يقومان بتحويل مساحات العناوين الضخمة إلى نقاط وصول حتمية وسريعة عبر جداول البحث، مع إدارة مرنة لاحتواء التصادمات.'
  },
  {
    id: 'ml_math',
    domainA: {
      field: 'Machine Learning',
      fieldAr: 'تعلم الآلة',
      concept: 'Principal Component Analysis (PCA)',
      conceptAr: 'تحليل المكونات الرئيسية (PCA)',
      icon: <FaRobot />,
      color: '#4ade80'
    },
    domainB: {
      field: 'Mathematics Skills',
      fieldAr: 'مهارات الرياضيات',
      concept: 'Eigenvectors & Orthogonal Projections',
      conceptAr: 'المتجهات الذاتية والإسقاط المتعامد',
      icon: <FaCalculator />,
      color: '#f97316'
    },
    analogies: [
      {
        id: 'mm1',
        labelA: 'Maximizing Feature Variance',
        labelAAr: 'تعظيم تباين الخصائص للحفاظ على المعلومات',
        labelB: 'Principal Eigenvector with Max Eigenvalue',
        labelBAr: 'المتجه الذاتي الأساسي ذو القيمة الذاتية العظمى'
      },
      {
        id: 'mm2',
        labelA: 'Dropping Redundant Collinear Features',
        labelAAr: 'حذف الخصائص الزائدة وتخفيض الأبعاد',
        labelB: 'Projection onto Lower-Rank Subspaces',
        labelBAr: 'الإسقاط الهندسي على فضاءات فرعية أقل رتبة'
      },
      {
        id: 'mm3',
        labelA: 'Uncorrelated Latent Components',
        labelAAr: 'مركبات كامنة غير مترابطة إحصائياً',
        labelB: 'Orthogonal Basis Vectors (Dot Product = 0)',
        labelBAr: 'متجهات أساس متعامدة (حاصل الضرب النقطي = 0)'
      }
    ],
    takeawayEn:
      'Unsupervised dimensionality reduction in Machine Learning is geometrically identical to rotating coordinate systems onto linear algebra eigenvectors.',
    takeawayAr:
      'تخفيض الأبعاد في تعلم الآلة هو تطبيق هندسي متطابق تماماً مع تدوير المحاور الإحداثية نحو المتجهات الذاتية في الجبر الخطي.'
  },
  {
    id: 'dl_ai',
    domainA: {
      field: 'Deep Learning',
      fieldAr: 'التعلم العميق',
      concept: 'Transformer Multi-Head Self-Attention',
      conceptAr: 'آلية الانتباه الذاتي في المحولات',
      icon: <FaBrain />,
      color: '#ec4899'
    },
    domainB: {
      field: 'AI',
      fieldAr: 'الذكاء الاصطناعي',
      concept: 'Heuristic Knowledge Graph Reasoning',
      conceptAr: 'الاستدلال في الرسوم البيانية المعرفية',
      icon: <FaBolt />,
      color: '#a855f7'
    },
    analogies: [
      {
        id: 'da1',
        labelA: 'Query-Key Dot Product Matrix (QKᵀ)',
        labelAAr: 'مصفوفة حاصل ضرب الاستعلام والمفتاح QKᵀ',
        labelB: 'Semantic Edge Weights Between Entities',
        labelBAr: 'أوزان الروابط الدلالية بين الكيانات المعرفية'
      },
      {
        id: 'da2',
        labelA: 'Softmax Distribution Over Token Context',
        labelAAr: 'توزيع سوفت ماكس على سياق الكلمات',
        labelB: 'Probabilistic Search Beam Node Filtering',
        labelBAr: 'تصفية عقد البحث الاحتمالي بحزمة الاستدلال'
      },
      {
        id: 'da3',
        labelA: 'Weighted Value Vector Aggregation (V)',
        labelAAr: 'تجميع متجهات القيم الموزونة (V)',
        labelB: 'Contextual Multi-Hop Graph State Synthesis',
        labelBAr: 'تخليق الحالة المعرفية عبر مسارات متعددة'
      }
    ],
    takeawayEn:
      'Multi-head attention in Deep Learning is fundamentally a continuous, differentiable knowledge graph traversal executed in parallel high-dimensional vector space.',
    takeawayAr:
      'آلية الانتباه في التعلم العميق هي في جوهرها استكشاف تفاضلي مستمر للرسوم البيانية المعرفية يتم بالتوازي في فضاء متجهات عالي الأبعاد.'
  },
  {
    id: 'ds_eng',
    domainA: {
      field: 'Data Science',
      fieldAr: 'علوم البيانات',
      concept: 'Feature Cleaning & Categorical Encoding',
      conceptAr: 'تنظيف البيانات والترميز الفئوي',
      icon: <FaDatabase />,
      color: '#38bdf8'
    },
    domainB: {
      field: 'English Skills',
      fieldAr: 'مهارات الإنجليزية',
      concept: 'Discourse Markers & Semantic Cohesion',
      conceptAr: 'روابط الخطاب والاتساق الدلالي',
      icon: <FaBook />,
      color: '#f59e0b'
    },
    analogies: [
      {
        id: 'de1',
        labelA: 'One-Hot & Ordinal Encoding Mappings',
        labelAAr: 'ترميز القيم الفئوية والترتيبية',
        labelB: 'Parts of Speech & Morphological Parsing',
        labelBAr: 'أقسام الكلام والتحليل الصرفي للكلمات'
      },
      {
        id: 'de2',
        labelA: 'Conditional Feature Interactions (IF/ELSE)',
        labelAAr: 'تفاعلات الخصائص الشرطية بين المتغيرات',
        labelB: 'Adversative Connectors (However, In Contrast)',
        labelBAr: 'روابط الاستدراك والتعارض (However, In Contrast)'
      },
      {
        id: 'de3',
        labelA: 'Data Imputation & Outlier Normalization',
        labelAAr: 'معالجة القيم المفقودة وتسوية الشواذ',
        labelB: 'Contextual Disambiguation of Polysemy',
        labelBAr: 'إزالة الغموض وتوضيح المعنى متعدد الدلالات'
      }
    ],
    takeawayEn:
      'Data preprocessing pipelines and English prose composition operate under identical cognitive grammars: unformatted raw tokens must be normalized and syntactically bonded to enable reliable reasoning.',
    takeawayAr:
      'معالجة البيانات وصياغة اللغة الإنجليزية تتبعان نفس القواعد المنطقية: المدخلات الأولية تتطلب المعايرة والربط الهيكلي السليم لإنتاج استنتاجات دقيقة.'
  }
];

// ── PRESET DATA FOR CHAMBER 2: COURT OF LOGIC (8 PROJECT DOMAINS) ─────────────
const COURT_TRIALS = [
  {
    id: 'trial_dsa',
    titleEn: 'The Fallacy of the Absolute Sort',
    titleAr: 'مغالطة الترتيب المطلق',
    topicEn: 'Data Structures',
    topicAr: 'هياكل البيانات',
    opponentStatementEn:
      '“Gentlemen of the jury, the prosecution claims MergeSort is necessary. Utter nonsense! QuickSort has a time complexity of O(N log N) in all possible universes, meaning it is strictly and universally superior under every distribution of input data!”',
    opponentStatementAr:
      '«أيها الحضور، يدعي الادعاء أن خوارزمية MergeSort ضرورية. هذا هراء خالص! خوارزمية QuickSort تعقيدها الزمني هو O(N log N) في جميع الحالات والأكوان، مما يجعلها متفوقة بصورة مطلقة وعالمية تحت أي توزيع لبيانات المدخلات!»',
    flawedSegmentEn: 'QuickSort has a time complexity of O(N log N) in all possible universes',
    flawedSegmentAr: 'تعقيدها الزمني هو O(N log N) في جميع الحالات والأكوان',
    pressResponseEn:
      'Professor Vane clears his throat: “Hmph! Even if the pivot is poor, cache locality makes it practically unbeatable! Why are you questioning my foundational premise?”',
    pressResponseAr:
      'يتنحنح البروفيسور فين بغرور: «همف! حتى لو كان عنصر الارتكاز غير مثالي، فإن سرعة الذاكرة المخبأة تجعلها لا تقهر! لمَ تشكك في مسلماتي البديهية؟»',
    evidenceOptions: [
      {
        id: 'ev_dsa_rev',
        titleEn: 'Pathological Reverse-Sorted Input (O(N²))',
        titleAr: 'حالة المدخلات المعكوسة الكارثية O(N²)',
        isCorrect: true,
        rebuttalEn:
          'When input is sorted and naive pivot selection is used, QuickSort degrades catastrophically to O(N²), making MergeSort or Introsort essential!',
        rebuttalAr:
          'عندما تكون المصفوفة مرتبة مسبقاً مع اختيار بدائي لعنصر الارتكاز، ينهار أداء QuickSort إلى O(N²)، مما يجعل خوارزمية MergeSort ضرورية جداً!'
      },
      {
        id: 'ev_dsa_ram',
        titleEn: 'RAM Hardware Clock Frequency',
        titleAr: 'تردد ساعة ذاكرة الوصول العشوائي',
        isCorrect: false,
        rebuttalEn: 'Clock speed is irrelevant to the asymptotic Big-O growth model.',
        rebuttalAr: 'سرعة الساعة لا علاقة لها بالتحليل التقاربي لمفهوم Big-O.'
      }
    ]
  },
  {
    id: 'trial_ds_math',
    titleEn: 'The Post Hoc Causation Illusion',
    titleAr: 'وهم السببية الزائفة',
    topicEn: 'Data Science & Mathematics Skills',
    topicAr: 'علوم البيانات ومهارات الرياضيات',
    opponentStatementEn:
      '“The dataset is undeniable! As ice cream sales spike across the province, shark attacks simultaneously surge by 400%! Therefore, banning dairy frozen desserts is the only scientific method to secure coastal safety!”',
    opponentStatementAr:
      '«البيانات لا تقبل الشك! مع ارتفاع مبيعات المثلجات على الشواطئ، تتصاعد هجمات أسماك القرش بنسبة 400% في نفس التوقيت! وعليه، فإن حظر بيع المثلجات هو الحل العلمي الوحيد لإنقاذ السباحين!»',
    flawedSegmentEn: 'banning dairy frozen desserts is the only scientific method to secure coastal safety',
    flawedSegmentAr: 'حظر بيع المثلجات هو الحل العلمي الوحيد لإنقاذ السباحين',
    pressResponseEn:
      'Professor Vane adjusts his monocle: “The Pearson correlation coefficient is r = 0.94! The math speaks for itself, young scholar!”',
    pressResponseAr:
      'يعدل البروفيسور نظارته: «معامل ارتباط بيرسون يبلغ 0.94! الأرقام الرياضية تتحدث عن نفسها يا فتى!»',
    evidenceOptions: [
      {
        id: 'ev_confounder',
        titleEn: 'Confounding Variable: Summer Ambient Temperature',
        titleAr: 'المتغير المربك: درجة حرارة الصيف وموسم السباحة',
        isCorrect: true,
        rebuttalEn:
          'High summer temperatures independently cause both increased ice cream sales and more people swimming in the ocean! Correlation does NOT equal causation!',
        rebuttalAr:
          'حرارة الصيف المرتفعة هي المتغير الخفي الذي يرفع مبيعات المثلجات ويزيد أعداد السابحين في البحر في آنٍ واحد! الارتباط الإحصائي لا يعني السببية إطلاقاً!'
      },
      {
        id: 'ev_pvalue',
        titleEn: 'P-Value Threshold of 0.05',
        titleAr: 'عتبة الدلالة الإحصائية P-Value',
        isCorrect: false,
        rebuttalEn: 'Statistical significance alone does not account for omitted variable bias.',
        rebuttalAr: 'الدلالة الإحصائية وحدها لا تحل مشكلة تحيز المتغيرات المحذوفة.'
      }
    ]
  },
  {
    id: 'trial_dl_ml',
    titleEn: 'The Infinite Epoch Overfitting Myth',
    titleAr: 'خرافة التدريب اللانهائي وتصفير الخسارة',
    topicEn: 'Machine Learning & Deep Learning',
    topicAr: 'تعلم الآلة والتعلم العميق',
    opponentStatementEn:
      '“If we continuously train our deep neural network for 500,000 epochs until training loss drops to zero, it mathematically guarantees 100% flawless real-world generalization on all future unseen test data!”',
    opponentStatementAr:
      '«إذا استمر تدريب شبكتنا العصبية العميقة لنصف مليون دورة حتى تصبح دالة الخسارة صفراً تاماً، فإن ذلك يضمن رياضياً تعميماً خالياً من أي خطأ بنسبة 100% على جميع بيانات الاختبار المستقبلية!»',
    flawedSegmentEn: 'training loss drops to zero, it mathematically guarantees 100% flawless real-world generalization',
    flawedSegmentAr: 'تصبح دالة الخسارة صفراً تاماً، فإن ذلك يضمن رياضياً تعميماً خالياً من أي خطأ',
    pressResponseEn:
      'Professor Vane smiles smugly: “Zero training error is the holy grail of optimization! How could a model with zero loss ever be wrong?”',
    pressResponseAr:
      'يبتسم البروفيسور بغرور: «الخطأ الصفري هو الغاية القصوى للتحسين الرياضي! كيف لنموذج بخسارة صفرية أن يخطئ؟»',
    evidenceOptions: [
      {
        id: 'ev_overfit',
        titleEn: 'Catastrophic Overfitting & Validation Loss Explosion',
        titleAr: 'فرط التخصيص الحاد وانفجار دالة خسارة التحقق (Validation Loss)',
        isCorrect: true,
        rebuttalEn:
          'Driving training loss to absolute zero causes the network to memorize noise rather than underlying patterns, destroying test generalization!',
        rebuttalAr:
          'تصفير دالة الخسارة في التدريب يجعل النموذج يحفظ الضوضاء بدلاً من تعلم الأنماط، مما يؤدي لانهيار التعميم والدقة على البيانات الحقيقية!'
      },
      {
        id: 'ev_lr',
        titleEn: 'Learning Rate Annealing Schedule',
        titleAr: 'جدول خفض معدل التعلم تدريجياً',
        isCorrect: false,
        rebuttalEn: 'Learning rate schedules control convergence speed, not the divergence of test generalization.',
        rebuttalAr: 'معدل التعلم يتحكم بسرعة التقارب ولا يمنع حفظ الضوضاء بمفرده.'
      }
    ]
  },
  {
    id: 'trial_net',
    titleEn: 'The Unconditional UDP Superiority Myth',
    titleAr: 'أسطورة تفوق بروتوكول UDP في كل الحالات',
    topicEn: 'Networking',
    topicAr: 'الشبكات والإنترنت',
    opponentStatementEn:
      '“UDP packets are strictly superior for mission-critical banking wire transfers because eliminating handshake overhead ensures transactions complete instantly with zero data corruption on modern fiber optic lines!”',
    opponentStatementAr:
      '«بروتوكول UDP يتفوق بشكل مطلق في التحويلات المصرفية البنكية الحساسة، لأن إلغاء عبء المصافحة يضمن إتمام المعاملات فورياً ودون أي تلف في البيانات عبر الألياف الضوئية الحديثة!»',
    flawedSegmentEn: 'UDP packets are strictly superior for mission-critical banking wire transfers',
    flawedSegmentAr: 'بروتوكول UDP يتفوق بشكل مطلق في التحويلات المصرفية البنكية الحساسة',
    pressResponseEn:
      'Professor Vane insists: “Speed is paramount in high-frequency finance! Why introduce latency with cumbersome ACKs and connection handshakes?”',
    pressResponseAr:
      'يصر البروفيسور: «السرعة هي الأهم في المعاملات المالية! لمَ نهدر الوقت في إشعارات الاستلام والمصافحة البطيئة؟»',
    evidenceOptions: [
      {
        id: 'ev_udp_loss',
        titleEn: 'Connectionless Unreliable Delivery with No ACK or Packet Ordering',
        titleAr: 'انعدام إقرار الاستلام والترتيب في UDP (Connectionless Unreliable)',
        isCorrect: true,
        rebuttalEn:
          'UDP provides zero packet ordering, delivery guarantees, or retransmission! Bank transactions require TCP stateful handshakes to prevent catastrophic duplicate or dropped transfers.',
        rebuttalAr:
          'بروتوكول UDP لا يقدم أي ضمان لوصول الحزم أو ترتيبها أو إعادة إرسالها! المعاملات المالية تتطلب بروتوكول TCP لضمان عدم ضياع أو تكرار أي حوالة بنكية.'
      },
      {
        id: 'ev_mtu',
        titleEn: 'Ethernet Maximum Transmission Unit (MTU = 1500)',
        titleAr: 'الحد الأقصى لحجم وحدة الإرسال (MTU = 1500)',
        isCorrect: false,
        rebuttalEn: 'MTU limits payload frame size but does not guarantee delivery reliability.',
        rebuttalAr: 'حجم MTU يحدد سعة الإطار ولا يعوض غياب موثوقية التسليم.'
      }
    ]
  },
  {
    id: 'trial_eng_ai',
    titleEn: 'The Literal Machine Translation Fallacy',
    titleAr: 'فخ الترجمة الآلية الحرفية للأمثال',
    topicEn: 'English Skills & AI',
    topicAr: 'مهارات الإنجليزية والذكاء الاصطناعي',
    opponentStatementEn:
      '“An AI translation engine should always translate English idioms like ‘Bite the bullet’ word-for-word, because literal lexical precision preserves the purest linguistic meaning across languages!”',
    opponentStatementAr:
      '«محرك الذكاء الاصطناعي يجب أن يترجم الأمثال والتعابير الإنجليزية مثل ‘Bite the bullet’ ترجمة حرفية كلمة بكلمة، لأن الدقة اللفظية الحرفية تحفظ أنقى معاني اللغة عبر الثقافات!»',
    flawedSegmentEn: 'always translate English idioms ... word-for-word, because literal lexical precision preserves the purest linguistic meaning',
    flawedSegmentAr: 'يترجم الأمثال والتعابير الإنجليزية ... ترجمة حرفية كلمة بكلمة، لأن الدقة اللفظية الحرفية تحفظ أنقى معاني اللغة',
    pressResponseEn:
      'Professor Vane scoffs: “Dictionaries define words! If you alter the vocabulary, you are corrupting the original author’s intent!”',
    pressResponseAr:
      'يسخر البروفيسور: «المعاجم تعرف الكلمات بدقة! وإذا غيرت الألفاظ فأنت تشوه قصد الكاتب الأصلي!»',
    evidenceOptions: [
      {
        id: 'ev_idiom',
        titleEn: 'Figurative Pragmatics & Non-Compositional Semantics',
        titleAr: 'الدلالة المجازية الاصطلاحية (Figurative Pragmatics)',
        isCorrect: true,
        rebuttalEn:
          'Idioms have non-compositional meaning: ‘Bite the bullet’ means facing an inevitable hardship with courage, not chewing on physical ammunition! Word-for-word translation creates absurd hallucinations.',
        rebuttalAr:
          'الأمثال الإنجليزية معانيها مجازية غير قابلة للتفكيك الحرفي: ‘Bite the bullet’ تعني تجرع الصبر ومواجهة الشدائد بشجاعة، والترجمة الحرفية تولد هلوسة لغوية مضحكة!'
      },
      {
        id: 'ev_phonics',
        titleEn: 'Phonetic Consonant Clusters',
        titleAr: 'العناقيد الصوتية الساكنة في النطق',
        isCorrect: false,
        rebuttalEn: 'Phonetics governs pronunciation, not contextual semantic comprehension.',
        rebuttalAr: 'علم الأصوات يعنى بطريقة النطق وليس باستيعاب الدلالات البلاغية.'
      }
    ]
  }
];

// ── PRESET DATA FOR CHAMBER 3: DIGITAL STRATA (8 PROJECT DOMAINS) ─────────────
const STRATA_LAYERS = [
  {
    depthId: 'surface',
    depthMeters: '10m',
    nameEn: 'Surface Sands',
    nameAr: 'الرمال السطحية',
    decayRate: 'Fresh Recall (92%)',
    decayRateAr: 'تذكر حديث (92%)',
    domainTagEn: 'Networking & Data Structures',
    domainTagAr: 'الشبكات وهياكل البيانات',
    rockTheme: 'sand',
    fossil: {
      id: 'fos_net_dsa',
      eraEn: 'Transport Protocol Stratum',
      eraAr: 'طبقة بروتوكولات النقل',
      subjectEn: 'Networking · TCP Handshake Mechanism',
      subjectAr: 'الشبكات والإنترنت · آلية مصافحة TCP',
      inscriptionEn:
        '“In computer networks, the [____] protocol operates at the Transport Layer to guarantee reliable, in-order byte streams using sequence numbers and a 3-way handshake.”',
      inscriptionAr:
        '«في شبكات الحاسوب، يعمل بروتوكول [____] في طبقة النقل لضمان تسليم حزم البيانات بالترتيب وبموثوقية تامة عبر أرقام التسلسل والمصافحة الثلاثية.»',
      missingKeyword: 'TCP',
      options: ['TCP', 'UDP', 'DNS', 'BGP'],
      restoredSummaryEn: 'TCP guarantees ordered, lossless stream transmission through SYN-ACK handshakes and sliding window flow control.',
      restoredSummaryAr: 'بروتوكول TCP يضمن تسليماً مرتباً خالياً من الفقدان للحزم عبر مصافحة SYN-ACK والتحكم بالتدفق النافذي.'
    }
  },
  {
    depthId: 'sediment',
    depthMeters: '45m',
    nameEn: 'Clay Sediment',
    nameAr: 'رواسب الصلصال',
    decayRate: 'Fading Decay (58%)',
    decayRateAr: 'تراجع متوسط (58%)',
    domainTagEn: 'Deep Learning & AI',
    domainTagAr: 'التعلم العميق والذكاء الاصطناعي',
    rockTheme: 'clay',
    fossil: {
      id: 'fos_dl_ai',
      eraEn: 'Neural Optimization Stratum',
      eraAr: 'طبقة التحسين والشبكات العصبية',
      subjectEn: 'Deep Learning · Neural Backpropagation',
      subjectAr: 'التعلم العميق · الانتشار الخلفي للشبكات',
      inscriptionEn:
        '“During gradient descent in deep neural architectures, backpropagation applies the mathematical [____] rule to compute partial derivatives of loss across successive layers.”',
      inscriptionAr:
        '«أثناء النزول التدريجي في البنى العصبية العميقة، تطبق خوارزمية الانتشار الخلفي قاعدة [____] في التفاضل لحساب المشتقات الجزئية لدالة الخسارة عبر الطبقات المتعاقبة.»',
      missingKeyword: 'CHAIN',
      options: ['CHAIN', 'PRODUCT', 'POWER', 'QUOTIENT'],
      restoredSummaryEn: 'The Chain Rule enables continuous error gradient propagation backward through multi-layer computational graphs.',
      restoredSummaryAr: 'قاعدة السلسلة (Chain Rule) هي الأساس الرياضي لتدفق تدرج الخطأ عكسياً عبر طبقات الشبكة العصبية المعقدة.'
    }
  },
  {
    depthId: 'bedrock',
    depthMeters: '90m',
    nameEn: 'Obsidian Bedrock',
    nameAr: 'صخور البازلت والأوبسيديان',
    decayRate: 'Petrified Memory (24%)',
    decayRateAr: 'ذاكرة متحجرة (24%)',
    domainTagEn: 'Data Science & Mathematics Skills',
    domainTagAr: 'علوم البيانات ومهارات الرياضيات',
    rockTheme: 'bedrock',
    fossil: {
      id: 'fos_ds_math',
      eraEn: 'Linear Algebra Stratum',
      eraAr: 'طبقة الجبر الخطي والتحليل الإحصائي',
      subjectEn: 'Data Science · Principal Components & Matrices',
      subjectAr: 'علوم البيانات · المصفوفات والمكونات الرئيسية',
      inscriptionEn:
        '“In linear algebra and PCA dimensionality reduction, an [____]vector defines an invariant axis that maintains its spatial direction when multiplied by a matrix, scaling only by its scalar factor.”',
      inscriptionAr:
        '«في الجبر الخطي وتخفيض الأبعاد (PCA)، يحدد المتجه [____] محوراً ثابتاً يحافظ على اتجاهه الفضائي عند ضربه بالمصفوفة، ويتغير فقط بمقدار مقياس عددي.»',
      missingKeyword: 'EIGEN',
      options: ['EIGEN', 'UNIT', 'NULL', 'ORTHO'],
      restoredSummaryEn: 'Eigenvectors formulate the orthogonal principal axes of maximum variance in multi-dimensional data science models.',
      restoredSummaryAr: 'المتجهات الذاتية تشكل المحاور المتعامدة الأساسية للتباين الأعظمي في نماذج علوم البيانات متعددة الأبعاد.'
    }
  }
];

// ── PRESET DATA FOR CHAMBER 4: MIDNIGHT BLACK MARKET ─────────────────────────
const CURSED_CONTRACTS = [
  {
    id: 'berserker',
    titleEn: "Berserker's Blood Oath",
    titleAr: 'ميثاق البرسيركر (الهائج)',
    domainCoverageEn: 'All 8 Curriculum Domains',
    domainCoverageAr: 'جميع مسارات المنهج الثمانية',
    riskLevel: 'Extreme / قاسي',
    color: '#ef4444',
    icon: <FaFire />,
    multiplier: '3.0x XP',
    penaltyEn: 'A single wrong quiz answer docks 300 XP immediately.',
    penaltyAr: 'أي إجابة خاطئة في الاختبار تخصم 300 نقطة خبرة فوراً!',
    rewardEn: 'Triple XP on every completed task & flashcard across all 8 domains.',
    rewardAr: 'ثلاثة أضعاف نقاط الخبرة على كل مهمة وبطاقة تنجزها في المناهج الثمانية.'
  },
  {
    id: 'blind_chrono',
    titleEn: 'The Blindfolded Chronomancer',
    titleAr: 'تحدي المؤقت الأعمى',
    domainCoverageEn: 'Data Structures, AI & Mathematics',
    domainCoverageAr: 'هياكل البيانات، الذكاء الاصطناعي والرياضيات',
    riskLevel: 'High / مرتفع',
    color: '#a855f7',
    icon: <FaEye />,
    multiplier: 'Mythic Badge',
    penaltyEn: 'All clocks, progress bars, and timers are hidden until you submit.',
    penaltyAr: 'يتم إخفاء جميع الساعات وأشرطة التقدم حتى تنهي الجلسة بنفسك.',
    rewardEn: 'Stop within ±60 seconds of 45:00 to unlock Chronos Relic + 350 XP.',
    rewardAr: 'أوقف الجلسة بتقديرك الذهني بدقة ±60 ثانية لتنال وسام سيد الوقت و350 XP.'
  },
  {
    id: 'scholar_stake',
    titleEn: "The High Roller's Wager",
    titleAr: 'رهان الباحث الكبير',
    domainCoverageEn: 'Data Science, ML & Deep Learning',
    domainCoverageAr: 'علوم البيانات، تعلم الآلة والتعلم العميق',
    riskLevel: 'Calculated / تكتيكي',
    color: '#f59e0b',
    icon: <FaCoins />,
    multiplier: '+500 XP Return',
    penaltyEn: 'Deposit 200 XP into escrow. Forfeited if weekly goal fails.',
    penaltyAr: 'احجز 200 نقطة خبرة كرهان مبدئي، وتفقدها إن لم تنجز هدف الأسبوع.',
    rewardEn: 'Receive 500 clean XP back upon 100% weekly roadmap completion.',
    rewardAr: 'استعد رهانك مع مكافأة 500 XP نقية فور إتمام مهام الأسبوع.'
  }
];

export default function SanctumPage() {
  const { isArabic } = useLanguage();
  const { theme } = useAppUI();
  const [activeChamber, setActiveChamber] = useState('crucible'); // crucible | courtroom | strata | blackMarket

  // ── STATS & PROGRESS TRACKER ────────────────────────────────────────────────
  const [sanctumScore, setSanctumScore] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('app_sanctum_score')) || {
        transmutations: 0,
        courtVictories: 0,
        fossilsRestored: 0,
        contractsSealed: 0
      };
    } catch {
      return { transmutations: 0, courtVictories: 0, fossilsRestored: 0, contractsSealed: 0 };
    }
  });

  const updateSanctumStat = useCallback((key) => {
    setSanctumScore((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try {
        localStorage.setItem('app_sanctum_score', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const grantXP = useCallback((amount) => {
    window.dispatchEvent(
      new CustomEvent('rpg-xp-gained', {
        detail: { amount, source: 'sanctum' }
      })
    );
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // CHAMBER 1: ALCHEMICAL CRUCIBLE STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [recipeIndex, setRecipeIndex] = useState(0);
  const activeRecipe = CRUCIBLE_RECIPES[recipeIndex];
  const [userMatches, setUserMatches] = useState({});
  const [isTransmuted, setIsTransmuted] = useState(false);
  const [isBoiling, setIsBoiling] = useState(false);
  const [hasClaimedCrucibleXP, setHasClaimedCrucibleXP] = useState(false);

  const matchedCount = useMemo(() => {
    return Object.keys(userMatches).length;
  }, [userMatches]);

  const handleMatchAnalogy = (analogyId) => {
    if (isTransmuted) return;
    setUserMatches((prev) => {
      const next = { ...prev };
      if (next[analogyId]) {
        delete next[analogyId];
      } else {
        next[analogyId] = true;
      }
      return next;
    });
  };

  const handleTransmute = () => {
    if (matchedCount < activeRecipe.analogies.length) return;
    setIsBoiling(true);
    setTimeout(() => {
      setIsBoiling(false);
      setIsTransmuted(true);
      if (!hasClaimedCrucibleXP) {
        grantXP(150);
        updateSanctumStat('transmutations');
        setHasClaimedCrucibleXP(true);
      }
    }, 1200);
  };

  const handleResetFlask = () => {
    setUserMatches({});
    setIsTransmuted(false);
    setHasClaimedCrucibleXP(false);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // CHAMBER 2: COURT OF LOGIC STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [trialIndex, setTrialIndex] = useState(0);
  const currentTrial = COURT_TRIALS[trialIndex];
  const [credibilityBar, setCredibilityBar] = useState(50);
  const [opponentState, setOpponentState] = useState('confident');
  const [pressClueVisible, setPressClueVisible] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [objectionTriggered, setObjectionTriggered] = useState(false);
  const [courtVerdict, setCourtVerdict] = useState(null);

  const handlePress = () => {
    setPressClueVisible(true);
    setOpponentState('rattled');
    setCredibilityBar((prev) => Math.min(85, prev + 15));
  };

  const handlePresentEvidence = () => {
    if (!selectedEvidence) return;
    setObjectionTriggered(true);

    setTimeout(() => {
      setObjectionTriggered(false);
      if (selectedEvidence.isCorrect) {
        setCredibilityBar(100);
        setOpponentState('defeated');
        setCourtVerdict('win');
        grantXP(200);
        updateSanctumStat('courtVictories');
      } else {
        setCredibilityBar((prev) => Math.max(15, prev - 25));
        setOpponentState('confident');
        setCourtVerdict('wrong_evidence');
      }
    }, 1100);
  };

  const handleNextTrial = () => {
    setTrialIndex((prev) => (prev + 1) % COURT_TRIALS.length);
    setCredibilityBar(50);
    setOpponentState('confident');
    setPressClueVisible(false);
    setSelectedEvidence(null);
    setCourtVerdict(null);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // CHAMBER 3: DIGITAL STRATA STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [selectedDepth, setSelectedDepth] = useState('surface');
  const activeLayer = useMemo(() => {
    return STRATA_LAYERS.find((l) => l.depthId === selectedDepth) || STRATA_LAYERS[0];
  }, [selectedDepth]);

  const [activeTool, setActiveTool] = useState('chisel');
  const [rockTiles, setRockTiles] = useState(() => Array(9).fill('intact'));
  const [scanActive, setScanActive] = useState(false);
  const [chosenOption, setChosenOption] = useState('');
  const [fossilRestored, setFossilRestored] = useState(false);

  useEffect(() => {
    setRockTiles(Array(9).fill('intact'));
    setScanActive(false);
    setChosenOption('');
    setFossilRestored(false);
  }, [selectedDepth]);

  const handleTileClick = (index) => {
    if (fossilRestored) return;
    if (activeTool === 'scanner') {
      setScanActive(true);
      return;
    }
    if (activeTool === 'chisel') {
      setRockTiles((prev) => {
        const next = [...prev];
        if (next[index] === 'intact') next[index] = 'cracked';
        else if (next[index] === 'cracked') next[index] = 'cleared';
        return next;
      });
    }
    if (activeTool === 'brush') {
      setRockTiles((prev) => {
        const next = [...prev];
        if (next[index] === 'cracked') next[index] = 'cleared';
        return next;
      });
    }
  };

  const clearedTilesCount = rockTiles.filter((t) => t === 'cleared').length;
  const isFossilExposed = clearedTilesCount >= 5;

  const handleRestoreFossil = () => {
    if (chosenOption === activeLayer.fossil.missingKeyword) {
      setFossilRestored(true);
      grantXP(180);
      updateSanctumStat('fossilsRestored');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // CHAMBER 4: MIDNIGHT BLACK MARKET STATE
  // ════════════════════════════════════════════════════════════════════════════
  const [hasPaidBribe, setHasPaidBribe] = useState(() => {
    return localStorage.getItem('app_sanctum_bribe_paid') === 'true';
  });
  const [activePact, setActivePact] = useState(() => {
    return localStorage.getItem('app_sanctum_active_pact') || null;
  });
  const [sealAnimation, setSealAnimation] = useState(false);

  const handlePayBribe = () => {
    setHasPaidBribe(true);
    localStorage.setItem('app_sanctum_bribe_paid', 'true');
  };

  const handleSealPact = (pactId) => {
    setSealAnimation(pactId);
    setTimeout(() => {
      setSealAnimation(false);
      setActivePact(pactId);
      localStorage.setItem('app_sanctum_active_pact', pactId);
      grantXP(100);
      updateSanctumStat('contractsSealed');
    }, 900);
  };

  const handleCancelPact = () => {
    setActivePact(null);
    localStorage.removeItem('app_sanctum_active_pact');
  };

  return (
    <div
      className={`sanctum-page ${isArabic ? 'is-rtl' : ''} ${theme === 'light' ? 'light-mode' : ''}`}
      data-theme={theme}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* ── OBJECTION FULL-SCREEN DRAMATIC FLASH OVERLAY ── */}
      {objectionTriggered && (
        <div className="objection-flash-overlay">
          <div className="objection-speed-lines" />
          <div className="objection-burst-text">
            {isArabic ? 'اعتراض!' : 'OBJECTION!'}
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <header className="sanctum-header">
        <div className="sanctum-title-row">
          <div className="sanctum-badge">
            <FaSkull className="sanctum-badge-icon" />
            <span>{isArabic ? 'منطقة محظورة · المستوى 4' : 'Forbidden Sector · Tier IV'}</span>
          </div>
          <div className="sanctum-tally">
            <span className="tally-item" title="Transmutations">
              <FaFlask style={{ color: '#38bdf8', marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} /> {sanctumScore.transmutations}
            </span>
            <span className="tally-item" title="Court Battles">
              <FaGavel style={{ color: '#ec4899', marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} /> {sanctumScore.courtVictories}
            </span>
            <span className="tally-item" title="Fossils Restored">
              <FaHammer style={{ color: '#f59e0b', marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} /> {sanctumScore.fossilsRestored}
            </span>
            <span className="tally-item" title="Pacts Sealed">
              <FaDice style={{ color: '#ef4444', marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} /> {sanctumScore.contractsSealed}
            </span>
          </div>
        </div>

        <h1 className="sanctum-main-title">
          {isArabic ? 'الملاذ المحظور' : 'The Forbidden Sanctum'}
        </h1>
        <p className="sanctum-subtitle">
          {isArabic
            ? 'ميادين التجارب المعرفية الاستثنائية للمناهج الثمانية — دمج، مناظرة، تنقيب، ومواثيق سرية تدفع بحدود التعلم إلى أقصى طاقته.'
            : 'Experimental cognitive proving grounds for the 8 core tracks — fusion, debate, excavation, and high-stakes contracts.'}
        </p>

        {/* ── 8 OFFICIAL CURRICULUM DOMAINS BAR ── */}
        <div className="sanctum-domains-bar" aria-label="Curriculum Domains">
          <span className="domains-bar-label">
            {isArabic ? 'المسارات الثمانية المعتمدة:' : 'Active Sanctum Disciplines:'}
          </span>
          <div className="domains-pills-wrap">
            {PROJECT_DOMAINS.map((d) => (
              <span key={d.id} className="domain-pill" style={{ '--pill-color': d.color }}>
                <span className="pill-icon">{d.icon}</span>
                <span className="pill-name">{isArabic ? d.nameAr : d.nameEn}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── PORTAL NAVIGATION TABS ── */}
        <nav className="sanctum-portal-tabs" aria-label="Sanctum Chambers">
          <button
            type="button"
            className={`portal-tab ${activeChamber === 'crucible' ? 'active' : ''}`}
            onClick={() => setActiveChamber('crucible')}
          >
            <FaFlask className="portal-tab-icon" />
            <span className="portal-tab-text">
              {isArabic ? 'مختبر الكيمياء' : 'Alchemical Crucible'}
            </span>
          </button>

          <button
            type="button"
            className={`portal-tab ${activeChamber === 'courtroom' ? 'active' : ''}`}
            onClick={() => setActiveChamber('courtroom')}
          >
            <FaGavel className="portal-tab-icon" />
            <span className="portal-tab-text">
              {isArabic ? 'محكمة المنطق' : 'Court of Logic'}
            </span>
          </button>

          <button
            type="button"
            className={`portal-tab ${activeChamber === 'strata' ? 'active' : ''}`}
            onClick={() => setActiveChamber('strata')}
          >
            <FaGem className="portal-tab-icon" />
            <span className="portal-tab-text">
              {isArabic ? 'حفريات الذاكرة' : 'Digital Strata'}
            </span>
          </button>

          <button
            type="button"
            className={`portal-tab ${activeChamber === 'blackMarket' ? 'active' : ''}`}
            onClick={() => setActiveChamber('blackMarket')}
          >
            <FaSkull className="portal-tab-icon" />
            <span className="portal-tab-text">
              {isArabic ? 'السوق السوداء' : 'Midnight Market'}
            </span>
          </button>
        </nav>
      </header>

      {/* ── CHAMBER 1: ALCHEMICAL CRUCIBLE (CONCEPT FUSION LAB) ─────────────── */}
      {activeChamber === 'crucible' && (
        <section className="sanctum-chamber fade-in">
          <div className="chamber-intro-bar">
            <div>
              <h2 className="chamber-title">
                <FaFlask style={{ color: '#38bdf8', marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                {isArabic ? 'مختبر الكيمياء العصبية' : 'The Alchemical Crucible'}
              </h2>
              <p className="chamber-desc">
                {isArabic
                  ? 'ادمج مفهومين من مسارات المشروع الثمانية لاكتشاف التناظر الهيكلي وتخليق اختصار ذهني عميق.'
                  : 'Fuse concepts across the 8 curriculum domains to discover structural symmetries and synthesize cognitive shortcuts.'}
              </p>
            </div>
            <div className="recipe-switcher">
              <span className="recipe-label">{isArabic ? 'الوصفة التخليقية:' : 'Formula:'}</span>
              <select
                className="sanctum-select"
                value={recipeIndex}
                onChange={(e) => {
                  setRecipeIndex(Number(e.target.value));
                  handleResetFlask();
                }}
              >
                {CRUCIBLE_RECIPES.map((r, i) => (
                  <option key={r.id} value={i}>
                    {isArabic
                      ? `${r.domainA.fieldAr} × ${r.domainB.fieldAr}`
                      : `${r.domainA.field} × ${r.domainB.field}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="crucible-arena-layout">
            {/* Left/Top: Domain A and Domain B Containers */}
            <div className="crucible-vessels-row">
              <div className="crucible-vessel-card" style={{ borderColor: activeRecipe.domainA.color }}>
                <span className="vessel-icon" style={{ color: activeRecipe.domainA.color }}>{activeRecipe.domainA.icon}</span>
                <span className="vessel-tag">{isArabic ? activeRecipe.domainA.fieldAr : activeRecipe.domainA.field}</span>
                <h3 className="vessel-concept" style={{ color: activeRecipe.domainA.color }}>
                  {isArabic ? activeRecipe.domainA.conceptAr : activeRecipe.domainA.concept}
                </h3>
              </div>

              <div className="crucible-fusion-core">
                <div className={`alembic-flask ${isBoiling ? 'boiling' : ''} ${isTransmuted ? 'transmuted' : ''}`}>
                  <div className="flask-liquid" />
                  <div className="flask-bubble b1" />
                  <div className="flask-bubble b2" />
                  <div className="flask-bubble b3" />
                  <div className="flask-center-core"><FaBolt style={{ color: '#fef08a' }} /></div>
                </div>
                <button
                  type="button"
                  className="transmute-action-btn"
                  disabled={matchedCount < activeRecipe.analogies.length || isTransmuted}
                  onClick={handleTransmute}
                >
                  {isTransmuted
                    ? (isArabic ? 'تم التخليق بنجاح!' : 'Synthesis Complete!')
                    : (isArabic ? `تحويل ودمج (${matchedCount}/${activeRecipe.analogies.length})` : `Transmute (${matchedCount}/${activeRecipe.analogies.length})`)}
                </button>
              </div>

              <div className="crucible-vessel-card" style={{ borderColor: activeRecipe.domainB.color }}>
                <span className="vessel-icon" style={{ color: activeRecipe.domainB.color }}>{activeRecipe.domainB.icon}</span>
                <span className="vessel-tag">{isArabic ? activeRecipe.domainB.fieldAr : activeRecipe.domainB.field}</span>
                <h3 className="vessel-concept" style={{ color: activeRecipe.domainB.color }}>
                  {isArabic ? activeRecipe.domainB.conceptAr : activeRecipe.domainB.concept}
                </h3>
              </div>
            </div>

            {/* Middle: Blueprint Analogy Connector */}
            <div className="analogy-blueprint-section">
              <div className="blueprint-header">
                <h4><FaProjectDiagram style={{ color: '#38bdf8', marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} /> {isArabic ? 'مخطط التناظر الهيكلي (انقر لتوصيل الروابط الوظيفية بين المسارين)' : 'Structural Analogy Blueprint (Click to bridge functional joints)'}</h4>
                <button type="button" className="blueprint-reset-btn" onClick={handleResetFlask}>
                  <FaUndo /> {isArabic ? 'إعادة الضبط' : 'Reset Joints'}
                </button>
              </div>

              <div className="analogy-joints-list">
                {activeRecipe.analogies.map((joint) => {
                  const isLinked = !!userMatches[joint.id];
                  return (
                    <div
                      key={joint.id}
                      className={`analogy-joint-card ${isLinked ? 'linked' : ''}`}
                      onClick={() => handleMatchAnalogy(joint.id)}
                    >
                      <div className="joint-side side-a">
                        <span className="joint-tag">{isArabic ? activeRecipe.domainA.fieldAr : activeRecipe.domainA.field}</span>
                        <p className="joint-text">{isArabic ? joint.labelAAr : joint.labelA}</p>
                      </div>

                      <div className="joint-bridge-connector">
                        <span className="bridge-wire" />
                        <span className="bridge-plug">{isLinked ? <FaCheck /> : '↔'}</span>
                      </div>

                      <div className="joint-side side-b">
                        <span className="joint-tag">{isArabic ? activeRecipe.domainB.fieldAr : activeRecipe.domainB.field}</span>
                        <p className="joint-text">{isArabic ? joint.labelBAr : joint.labelB}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output: Synthesized Master Artifact */}
            {isTransmuted && (
              <div className="synthesized-artifact-card scale-in">
                <div className="artifact-glow-ring" />
                <div className="artifact-header">
                  <span className="artifact-badge"><FaGem style={{ marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} /> {isArabic ? 'تحفة حجر الفلاسفة المعرفي' : 'Philosopher Stone Codex'}</span>
                  <span className="artifact-xp-badge">+150 XP</span>
                </div>
                <h3 className="artifact-title">
                  {isArabic
                    ? `جسر الربط: ${activeRecipe.domainA.conceptAr} ↔ ${activeRecipe.domainB.conceptAr}`
                    : `Cognitive Synthesis: ${activeRecipe.domainA.concept} ↔ ${activeRecipe.domainB.concept}`}
                </h3>
                <p className="artifact-takeaway">
                  {isArabic ? activeRecipe.takeawayAr : activeRecipe.takeawayEn}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CHAMBER 2: THE COURT OF LOGIC (PHOENIX WRIGHT DEBATE DUEL) ──────── */}
      {activeChamber === 'courtroom' && (
        <section className="sanctum-chamber fade-in">
          <div className="chamber-intro-bar">
            <div>
              <h2 className="chamber-title">
                <FaGavel style={{ color: '#ec4899', marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                {isArabic ? 'قاعة المناظرة ومحكمة المنطق' : 'The Court of Logic'}
              </h2>
              <p className="chamber-desc">
                {isArabic
                  ? 'قف في منصة القضاء، واكتشف المغالطات الخفية في مسارات البرمجة والذكاء الاصطناعي لتدحض حجج البروفيسور المغرور.'
                  : 'Take the stand, expose logical contradictions across the 8 curriculum domains, and shatter the arrogant professor’s claims.'}
              </p>
            </div>
            <div className="trial-switcher">
              <span className="recipe-label">{isArabic ? 'القضية:' : 'Case:'}</span>
              <select
                className="sanctum-select"
                value={trialIndex}
                onChange={(e) => {
                  setTrialIndex(Number(e.target.value));
                  setCredibilityBar(50);
                  setOpponentState('confident');
                  setPressClueVisible(false);
                  setSelectedEvidence(null);
                  setCourtVerdict(null);
                }}
              >
                {COURT_TRIALS.map((t, i) => (
                  <option key={t.id} value={i}>
                    {isArabic ? `${t.topicAr} · ${t.titleAr}` : `${t.topicEn} · ${t.titleEn}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="courtroom-layout">
            {/* Credibility Tug-of-War Gauge */}
            <div className="credibility-meter-wrapper">
              <div className="meter-labels">
                <span className="label-user">
                  <FaShieldAlt style={{ marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} />
                  {isArabic ? 'مصداقيتك' : 'Your Credibility'}: {credibilityBar}%
                </span>
                <span className="label-opponent">
                  <FaBalanceScale style={{ marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} />
                  {isArabic ? 'مصداقية الخصم' : 'Sophist Credibility'}: {100 - credibilityBar}%
                </span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${credibilityBar}%` }} />
              </div>
            </div>

            {/* Stage: Opponent Box vs User Evidence Box */}
            <div className="court-stage-grid">
              {/* Opponent Stand */}
              <div className={`opponent-stand-card state-${opponentState}`}>
                <div className="opponent-avatar-box">
                  <div className="opponent-portrait">
                    {opponentState === 'defeated' ? (
                      <FaSkull style={{ color: '#ef4444' }} />
                    ) : opponentState === 'rattled' ? (
                      <FaExclamationCircle style={{ color: '#f59e0b' }} />
                    ) : (
                      <FaUserGraduate style={{ color: '#818cf8' }} />
                    )}
                  </div>
                  <div className="opponent-meta">
                    <h4 className="opponent-name">
                      {isArabic ? 'البروفيسور فين (زعيم السفسطة)' : 'Professor Vane (Arch-Sophist)'}
                    </h4>
                    <span className="opponent-mood-pill">
                      {opponentState === 'defeated'
                        ? (isArabic ? 'منهزم ومعترف بخطئه' : 'Defeated & Conceded')
                        : opponentState === 'rattled'
                        ? (isArabic ? 'متوتر ويتصبب عرقاً' : 'Sweating & Shaken')
                        : (isArabic ? 'واثق ومغرور' : 'Smug & Confident')}
                    </span>
                    <span className="opponent-domain-tag">
                      {isArabic ? currentTrial.topicAr : currentTrial.topicEn}
                    </span>
                  </div>
                </div>

                <div className="opponent-testimony-box">
                  <span className="testimony-tag">{isArabic ? 'شهادة الخصم:' : 'Testimony:'}</span>
                  <blockquote className="testimony-quote">
                    {isArabic ? currentTrial.opponentStatementAr : currentTrial.opponentStatementEn}
                  </blockquote>
                </div>

                {pressClueVisible && (
                  <div className="press-clue-bubble fade-in">
                    <strong><FaSearch style={{ marginRight: isArabic ? '0' : '4px', marginLeft: isArabic ? '4px' : '0' }} /> {isArabic ? 'ثغرة في الاستجواب:' : 'Cross-Examination Clue:'}</strong>{' '}
                    {isArabic ? currentTrial.pressResponseAr : currentTrial.pressResponseEn}
                  </div>
                )}

                <div className="court-action-buttons">
                  <button type="button" className="court-btn press-btn" onClick={handlePress}>
                    <FaSearch /> {isArabic ? 'استجواب وتدقيق (Press)' : 'Press Testimony'}
                  </button>
                </div>
              </div>

              {/* Evidence Locker Stand */}
              <div className="evidence-stand-card">
                <div className="evidence-header">
                  <h4><FaFolderOpen style={{ color: '#38bdf8', marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} /> {isArabic ? 'حقيبة الأدلة والبراهين' : 'Evidence Vault'}</h4>
                  <span className="evidence-hint">
                    {isArabic ? 'اختر الدليل القاطع لمواجهته' : 'Select contradictory proof'}
                  </span>
                </div>

                <div className="evidence-options-list">
                  {currentTrial.evidenceOptions.map((ev) => {
                    const isSelected = selectedEvidence?.id === ev.id;
                    return (
                      <div
                        key={ev.id}
                        className={`evidence-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedEvidence(ev)}
                      >
                        <div className="evidence-radio">{isSelected && <FaCheck />}</div>
                        <div className="evidence-info">
                          <h5 className="evidence-name">{isArabic ? ev.titleAr : ev.titleEn}</h5>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="objection-trigger-row">
                  <button
                    type="button"
                    className="objection-slam-btn"
                    disabled={!selectedEvidence || courtVerdict === 'win'}
                    onClick={handlePresentEvidence}
                  >
                    <FaBolt style={{ marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                    {isArabic ? 'اعتراض! (OBJECTION!)' : 'OBJECTION!'}
                  </button>
                </div>

                {/* Verdict Box */}
                {courtVerdict === 'win' && (
                  <div className="verdict-banner win scale-in">
                    <h4><FaTrophy style={{ color: '#10b981', marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} /> {isArabic ? 'تم تحطيم المغالطة!' : 'Contradiction Shattered!'}</h4>
                    <p>{isArabic ? selectedEvidence.rebuttalAr : selectedEvidence.rebuttalEn}</p>
                    <div className="verdict-footer">
                      <span className="verdict-xp">+200 XP Honor</span>
                      <button type="button" className="verdict-next-btn" onClick={handleNextTrial}>
                        {isArabic ? 'المناظرة التالية' : 'Next Trial'} <FaArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {courtVerdict === 'wrong_evidence' && (
                  <div className="verdict-banner loss fade-in">
                    <h4><FaTimesCircle style={{ color: '#ef4444', marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} /> {isArabic ? 'اعتراض مرفوض!' : 'Objection Overruled!'}</h4>
                    <p>{isArabic ? selectedEvidence.rebuttalAr : selectedEvidence.rebuttalEn}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CHAMBER 3: DIGITAL STRATA (MEMORY ARCHAEOLOGY) ──────────────────── */}
      {activeChamber === 'strata' && (
        <section className="sanctum-chamber fade-in">
          <div className="chamber-intro-bar">
            <div>
              <h2 className="chamber-title">
                <FaHammer style={{ color: '#f59e0b', marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                {isArabic ? 'طبقات الأرض الرقمية: حفريات المعرفة' : 'The Digital Strata: Memory Archaeology'}
              </h2>
              <p className="chamber-desc">
                {isArabic
                  ? 'المعلومات التي لم تراجعها في المناهج الثمانية تدفن تحت طبقات الأرض وتتحجر؛ نقّب عنها ورمّم نقوشها قبل أن تندثر.'
                  : 'Unreviewed concepts from the 8 curriculum tracks sink and petrify into geological strata. Excavate and reconstruct ancient inscriptions.'}
              </p>
            </div>
          </div>

          <div className="strata-grid-layout">
            {/* Depth Level Selector Sidebar */}
            <div className="strata-depth-column">
              <span className="depth-column-title">
                {isArabic ? 'اختر طبقة العمق:' : 'Select Stratum Depth:'}
              </span>
              {STRATA_LAYERS.map((layer) => {
                const isActive = selectedDepth === layer.depthId;
                return (
                  <button
                    key={layer.depthId}
                    type="button"
                    className={`strata-depth-tab theme-${layer.rockTheme} ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDepth(layer.depthId)}
                  >
                    <span className="depth-meters">{layer.depthMeters}</span>
                    <div className="depth-meta">
                      <span className="depth-name">{isArabic ? layer.nameAr : layer.nameEn}</span>
                      <span className="depth-domain-tag">{isArabic ? layer.domainTagAr : layer.domainTagEn}</span>
                      <span className="depth-decay">{isArabic ? layer.decayRateAr : layer.decayRate}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Excavation Digging Canvas */}
            <div className="strata-excavation-stage">
              {/* Tool Bar */}
              <div className="excavation-tools-bar">
                <span className="tools-label">{isArabic ? 'أداة التنقيب:' : 'Active Tool:'}</span>
                <button
                  type="button"
                  className={`tool-btn ${activeTool === 'scanner' ? 'active' : ''}`}
                  onClick={() => setActiveTool('scanner')}
                >
                  <FaSearch /> {isArabic ? 'الماسح الصوتي' : 'Sonic Scanner'}
                </button>
                <button
                  type="button"
                  className={`tool-btn ${activeTool === 'chisel' ? 'active' : ''}`}
                  onClick={() => setActiveTool('chisel')}
                >
                  <FaHammer /> {isArabic ? 'المعول والمطرقة' : 'Chisel & Mallet'}
                </button>
                <button
                  type="button"
                  className={`tool-btn ${activeTool === 'brush' ? 'active' : ''}`}
                  onClick={() => setActiveTool('brush')}
                >
                  <FaPaintBrush /> {isArabic ? 'فرشاة الترميم' : 'Restoration Brush'}
                </button>
              </div>

              {/* Rock Grid Field */}
              <div className={`rock-grid-canvas theme-${activeLayer.rockTheme} ${scanActive ? 'scanning' : ''}`}>
                {rockTiles.map((state, idx) => (
                  <div
                    key={idx}
                    className={`rock-tile state-${state} ${scanActive ? 'revealing' : ''}`}
                    onClick={() => handleTileClick(idx)}
                  >
                    {state === 'intact' && <FaCube className="tile-texture" style={{ color: '#64748b' }} />}
                    {state === 'cracked' && <FaFire className="tile-texture cracked" style={{ color: '#ef4444' }} />}
                    {state === 'cleared' && <FaGem className="tile-texture cleared" style={{ color: '#10b981' }} />}
                  </div>
                ))}
              </div>

              {/* Inscription Restoration Console */}
              {isFossilExposed ? (
                <div className="inscription-console fade-in">
                  <div className="inscription-header">
                    <span className="inscription-era">
                      <FaScroll style={{ marginRight: isArabic ? '0' : '5px', marginLeft: isArabic ? '5px' : '0' }} />
                      {isArabic ? activeLayer.fossil.eraAr : activeLayer.fossil.eraEn}
                    </span>
                    <span className="inscription-subject">
                      {isArabic ? activeLayer.fossil.subjectAr : activeLayer.fossil.subjectEn}
                    </span>
                  </div>

                  <blockquote className="inscription-text">
                    {isArabic ? activeLayer.fossil.inscriptionAr : activeLayer.fossil.inscriptionEn}
                  </blockquote>

                  {!fossilRestored ? (
                    <div className="inscription-puzzle-row">
                      <span className="puzzle-label">
                        {isArabic ? 'اختر الكلمة المتحجرة المفقودة:' : 'Select missing petrified keyword:'}
                      </span>
                      <div className="puzzle-options-chips">
                        {activeLayer.fossil.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`puzzle-chip ${chosenOption === opt ? 'selected' : ''}`}
                            onClick={() => setChosenOption(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="restore-submit-btn"
                        disabled={!chosenOption}
                        onClick={handleRestoreFossil}
                      >
                        <FaCheck /> {isArabic ? 'ترميم المخطوطة' : 'Reconstruct & Enshrine'}
                      </button>
                    </div>
                  ) : (
                    <div className="fossil-restored-card scale-in">
                      <div className="restored-check-icon">
                        <FaTrophy style={{ fontSize: '2.5rem', color: '#f59e0b' }} />
                      </div>
                      <h4>{isArabic ? 'تم ترميم الأثر بنجاح وتخليده في المتحف!' : 'Fossil Restored & Enshrined in Museum!'}</h4>
                      <p>{isArabic ? activeLayer.fossil.restoredSummaryAr : activeLayer.fossil.restoredSummaryEn}</p>
                      <span className="restored-xp-badge">+180 XP Memory Restored</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="dig-instructions-hint">
                  <p>
                    <FaLightbulb style={{ color: '#f59e0b', marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} />
                    {isArabic
                      ? 'استخدم المعول والفرشاة لتفتيت بلاطات الصخور وكشف النقش الأثري المغمور.'
                      : 'Use the chisel and brush to break rock tiles and uncover the buried inscription.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CHAMBER 4: MIDNIGHT BLACK MARKET (CURSED PACTS & GAMBLING) ──────── */}
      {activeChamber === 'blackMarket' && (
        <section className="sanctum-chamber fade-in">
          <div className="chamber-intro-bar">
            <div>
              <h2 className="chamber-title">
                <FaDice style={{ color: '#ef4444', marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                {isArabic ? 'السوق السوداء ومواثيق الظل' : 'The Midnight Black Market'}
              </h2>
              <p className="chamber-desc">
                {isArabic
                  ? 'ملاذ سري مشبوه لعقد مواثيق ملعونة للمناهج الثمانية، رهانات الموت، وشراء بضائع الحظر الرقمي.'
                  : 'A secretive underground bazaar for signing high-stakes cursed contracts across the 8 curriculum tracks.'}
              </p>
            </div>
          </div>

          <div className="black-market-layout">
            {/* Broker Header Card */}
            <div className="broker-banner-card">
              <div className="broker-silhouette">
                <FaUserSecret style={{ color: '#a855f7', fontSize: '3.5rem' }} />
              </div>
              <div className="broker-details">
                <h3 className="broker-title">
                  {isArabic ? 'وسيط الشفرات المقنع (The Cipher Broker)' : 'The Cipher Broker'}
                </h3>
                <p className="broker-quote">
                  {isArabic
                    ? '«المعرفة في علوم البيانات وهياكلها مقامرة يا باحث. هل تجرؤ على المراهنة بكبريائك لنيل قوى ومضاعفات مضاعفة؟»'
                    : '“Knowledge across Data Science, AI, and Networking is a high-stakes gamble, scholar. Dare to stake your pride for astronomical power?”'}
                </p>
              </div>

              {!hasPaidBribe && (
                <div className="bribe-enforcer-box">
                  <span className="bribe-tag">
                    <FaLock /> {isArabic ? 'حظر التجوال النهاري نشط' : 'Daylight Enforcer Lockdown'}
                  </span>
                  <button type="button" className="bribe-pay-btn" onClick={handlePayBribe}>
                    <FaCoins /> {isArabic ? 'دفع 50 عملة كرشوة للدخول' : 'Bribe Enforcer (50 Coins)'}
                  </button>
                </div>
              )}

              {hasPaidBribe && (
                <div className="bribe-cleared-pill">
                  <FaUnlock /> {isArabic ? 'تصريح الظل مفعّل' : 'Shadow Clearance Granted'}
                </div>
              )}
            </div>

            {/* Active Pact Status */}
            {activePact && (
              <div className="active-contract-banner scale-in">
                <div className="contract-status-left">
                  <span className="contract-active-pulsar" />
                  <div>
                    <h4>
                      {isArabic ? 'ميثاق ملعون نشط حالياً:' : 'Active Cursed Contract:'}{' '}
                      <span className="contract-id-tag">{activePact.toUpperCase()}</span>
                    </h4>
                    <p>
                      {isArabic
                        ? 'المضاعف مفعّل في جلساتك عبر المناهج الثمانية. احذر من أي خطأ حتى لا يطبق العقاب الجزائي!'
                        : 'XP multiplier is active on your 8-domain study sessions. Maintain 100% accuracy to evade penalties.'}
                    </p>
                  </div>
                </div>
                <button type="button" className="cancel-pact-btn" onClick={handleCancelPact}>
                  {isArabic ? 'فسخ العقد' : 'Revoke Pact'}
                </button>
              </div>
            )}

            {/* Contracts Cards Grid */}
            <div className="cursed-contracts-grid">
              {CURSED_CONTRACTS.map((contract) => {
                const isSelected = activePact === contract.id;
                const isSealing = sealAnimation === contract.id;
                return (
                  <div
                    key={contract.id}
                    className={`contract-card ${isSelected ? 'active-sealed' : ''} ${isSealing ? 'sealing' : ''}`}
                    style={{ '--contract-accent': contract.color }}
                  >
                    <div className="contract-card-header">
                      <span className="contract-icon" style={{ color: contract.color }}>
                        {contract.icon}
                      </span>
                      <span className="contract-risk">{contract.riskLevel}</span>
                    </div>

                    <h4 className="contract-card-title">
                      {isArabic ? contract.titleAr : contract.titleEn}
                    </h4>

                    <span className="contract-domain-coverage">
                      {isArabic ? contract.domainCoverageAr : contract.domainCoverageEn}
                    </span>

                    <div className="contract-multiplier-badge">{contract.multiplier}</div>

                    <div className="contract-terms-box">
                      <div className="term-item reward">
                        <strong>
                          <FaCheckCircle style={{ color: '#22c55e', marginRight: isArabic ? '0' : '4px', marginLeft: isArabic ? '4px' : '0' }} />
                          {isArabic ? 'المكافأة:' : 'Reward:'}
                        </strong>{' '}
                        {isArabic ? contract.rewardAr : contract.rewardEn}
                      </div>
                      <div className="term-item penalty">
                        <strong>
                          <FaTimesCircle style={{ color: '#ef4444', marginRight: isArabic ? '0' : '4px', marginLeft: isArabic ? '4px' : '0' }} />
                          {isArabic ? 'اللعنة / العقاب:' : 'Curse / Penalty:'}
                        </strong>{' '}
                        {isArabic ? contract.penaltyAr : contract.penaltyEn}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="seal-contract-btn"
                      disabled={isSelected || isSealing}
                      onClick={() => handleSealPact(contract.id)}
                    >
                      {isSealing ? (
                        <span>
                          <FaFeatherAlt style={{ marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} />
                          {isArabic ? 'جارٍ ختم العقد بالدم...' : 'Sealing Contract...'}
                        </span>
                      ) : isSelected ? (
                        <span>
                          <FaCheck style={{ marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} />
                          {isArabic ? 'الميثاق مختوم' : 'Pact Sealed'}
                        </span>
                      ) : (
                        <span>
                          <FaSkull style={{ marginRight: isArabic ? '0' : '6px', marginLeft: isArabic ? '6px' : '0' }} />
                          {isArabic ? 'توقيع وختم العقد' : 'Sign & Seal Contract'}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Contraband Goods Shelf */}
            <div className="contraband-goods-section">
              <h4 className="contraband-heading">
                <FaBoxOpen style={{ color: '#f59e0b', marginRight: isArabic ? '0' : '8px', marginLeft: isArabic ? '8px' : '0' }} />
                {isArabic ? 'بضائع السوق السوداء المهربة' : 'Contraband Black Market Goods'}
              </h4>
              <div className="contraband-items-grid">
                <div className="contraband-item-card">
                  <div className="contraband-item-icon">
                    <FaFlask style={{ color: '#38bdf8' }} />
                  </div>
                  <div className="contraband-item-info">
                    <h5>{isArabic ? 'إكسير التدفق الذي لا يلين' : 'Elixir of Relentless Flow'}</h5>
                    <p>
                      {isArabic
                        ? 'يجمد مؤشر الإرهاق الذهني والتعب المعرفي لمدة 60 دقيقة كاملة في أي مسار تدرسه.'
                        : 'Freezes cognitive fatigue buildup for 60 uninterrupted minutes across any study track.'}
                    </p>
                  </div>
                  <button type="button" className="buy-contraband-btn" onClick={() => grantXP(50)}>
                    <FaCoins /> 120 {isArabic ? 'عملة' : 'Coins'}
                  </button>
                </div>

                <div className="contraband-item-card">
                  <div className="contraband-item-icon">
                    <FaAtom style={{ color: '#a855f7' }} />
                  </div>
                  <div className="contraband-item-info">
                    <h5>{isArabic ? 'هولوغرام السايبربانك المظلم' : 'Shadow Cyberpunk Aura'}</h5>
                    <p>
                      {isArabic
                        ? 'هالة محيطية داكنة نيون حصرية لحواف الشاشة تزيد من تركيزك.'
                        : 'Exclusive dark-neon ambient border pulse to elevate visual immersion.'}
                    </p>
                  </div>
                  <button type="button" className="buy-contraband-btn" onClick={() => grantXP(50)}>
                    <FaCoins /> 250 {isArabic ? 'عملة' : 'Coins'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
