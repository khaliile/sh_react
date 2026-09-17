// src/data/bossCombatQuestions.js
// Diverse offline question pool for Boss Combat AI Critical Strike Trial.
// Ensures questions never repeat back-to-back if offline or fallback is used.

export const BOSS_COMBAT_QUESTIONS = {
  ar: [
    {
      id: 'ml_linreg',
      boss_taunt: "أتظن أن بإمكانك التغلب على سطوتي؟ أجب عن هذا السؤال إن كنت تجرؤ!",
      question: "ما هي الوظيفة الأساسية لخوارزمية الانحدار الخطي (Linear Regression) في تعلم الآلة؟",
      options: [
        "التنبؤ بقيمة عددية مستمرة بناءً على علاقة خطية",
        "تصنيف الصور إلى فئات غير مرتبطة",
        "ضغط الملفات الصوتية دون فقدان البيانات",
        "تشفير كلمات المرور في قواعد البيانات"
      ],
      correct_index: 0,
      explanation: "الانحدار الخطي يُستخدم لنمذجة العلاقة بين المتغيرات المستقلة والتابعة للتنبؤ بقيم مستمرة."
    },
    {
      id: 'ml_overfit',
      boss_taunt: "قوتي تفوق إدراكك! هل تستطيع ضبط أسلوبك قبل أن تفرط في التدريب وتسقط؟",
      question: "ما هي التقنية المستخدمة بشكل رئيسي لتقليل فرط التخصيص (Overfitting) في النماذج العصبية؟",
      options: [
        "إسقاط العقد عشوائياً (Dropout) والتنظيم (Regularization)",
        "حذف جميع بيانات الاختبار قبل التدريب",
        "زيادة معدل التعلم (Learning Rate) إلى أقصى حد",
        "مضاعفة عدد الطبقات المخفية دون إضافة بيانات جديدة"
      ],
      correct_index: 0,
      explanation: "تساعد تقنيات مثل Dropout وتنعيم الأوزان (L1/L2 Regularization) على منع النموذج من حفظ بيانات التدريب والتعميم بشكل أفضل."
    },
    {
      id: 'algo_binary_search',
      boss_taunt: "سرعتك بطيئة جداً! هل تعرف كيف تبحث في الظلال بلمح البصر؟",
      question: "ما هو التعقيد الزمني لأسوأ حالة لخوارزمية البحث الثنائي (Binary Search) في مصفوفة مرتبة؟",
      options: [
        "O(log n)",
        "O(n)",
        "O(n²)",
        "O(1)"
      ],
      correct_index: 0,
      explanation: "البحث الثنائي يُقسّم نطاق البحث إلى النصف في كل خطوة، مما يعطيه تعقيداً زمنياً قدره O(log n)."
    },
    {
      id: 'sql_join',
      boss_taunt: "بياناتك مشتتة وفوضوية أمامي! أتقن دمج الجداول أولاً!",
      question: "أي أنواع الـ JOIN في SQL يُرجع جميع السجلات من الجدول الأيسر حتى لو لم تتطابق مع الجدول الأيمن؟",
      options: [
        "LEFT JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "RIGHT JOIN ONLY"
      ],
      correct_index: 0,
      explanation: "الـ LEFT JOIN يحتفظ بجميع صفوف الجدول الأيسر ويملأ القيم غير المتطابقة من الجدول الأيمن بـ NULL."
    },
    {
      id: 'ds_stack',
      boss_taunt: "سأكدس عليك الهجمات! أي بنية بيانات تتحكم في هذا النظام؟",
      question: "ما هو المبدأ الأساسي الذي تعمل به بنية البيانات 'المكدس' (Stack)؟",
      options: [
        "الوارد أخيراً يخرج أولاً (LIFO)",
        "الوارد أولاً يخرج أولاً (FIFO)",
        "الوصول العشوائي المطلق (Random Access)",
        "الترتيب حسب الأولوية القصوى دائماً"
      ],
      correct_index: 0,
      explanation: "المكدس (Stack) يتبع مبدأ Last In, First Out (LIFO) بحيث يكون آخر عنصر تم إدخاله هو أول عنصر يخرج."
    },
    {
      id: 'python_tuples',
      boss_taunt: "هل كودك صلب لا يتغير أم أنه قابل للتعديل بسهولة؟ أثبت معرفتك بالبايثون!",
      question: "ما هو الفارق الجوهري بين القائمة (List) والصف (Tuple) في لغة Python؟",
      options: [
        "القائمة قابلة للتعديل (Mutable) بينما الصف غير قابل للتعديل (Immutable)",
        "الصف يقبل أرقاماً فقط بينما القائمة تقبل نصوصاً فقط",
        "القائمة أسرع بكثير في استهلاك الذاكرة من الصف دائماً",
        "لا يمكن تكرار العناصر داخل الصف إطلاقاً"
      ],
      correct_index: 0,
      explanation: "الـ Tuples في بايثون غير قابلة للتغيير (Immutable) بعد إنشائها، بينما الـ Lists قابلة للإضافة والتعديل والحذف."
    },
    {
      id: 'dl_transformer',
      boss_taunt: "انتباهك مشتت وضعيف! ما هي الآلية التي أحدثت ثورة في معالجة اللغات الطبيعية؟",
      question: "ما هي الآلية الأساسية في معمارية المحولات (Transformer) التي تمكنها من وزن أهمية الكلمات المختلفة في الجملة؟",
      options: [
        "آلية الانتباه الذاتي (Self-Attention Mechanism)",
        "التغذية الراجعة المتكررة (Recurrent Loops)",
        "التجميع الأقصى المكاني (Max Pooling 2D)",
        "الضغط البايتي المتسلسل (Byte Pair Compression)"
      ],
      correct_index: 0,
      explanation: "تعتمد بنية Transformer على Self-Attention لحساب علاقات الترابط بين كافة كلمات النص بالتوازي."
    },
    {
      id: 'db_acid',
      boss_taunt: "معاملاتك محكوم عليها بالفشل! ما هي الخاصية التي تضمن عدم تنفيذ المعاملة جزئياً؟",
      question: "في قواعد البيانات العلائقية، ما الذي تشير إليه خاصية الذرية (Atomicity) ضمن خصائص ACID؟",
      options: [
        "إما أن تكتمل جميع خطوات المعاملة بنجاح أو تُلغى بالكامل",
        "تشفير البيانات بمستوى ذري غير قابل للاختراق",
        "تنفيذ المعاملات في خيط معالجة واحد فقط دون توازي",
        "حفظ البيانات على القرص الصلب فوراً بدون ذاكرة مؤقتة"
      ],
      correct_index: 0,
      explanation: "خاصية الذرية (Atomicity) تضمن مبدأ 'الكل أو لا شيء'؛ إذا فشلت خطوة واحدة تتراجع المعاملة كاملة."
    },
    {
      id: 'math_bayes',
      boss_taunt: "احتمالات نجاتك تتضاءل! أجب عن هذا التحدي الرياضي!",
      question: "ماذا تحسب مبرهنة بايز (Bayes' Theorem) في نظرية الاحتمالات؟",
      options: [
        "الاحتمال الشرطي لحدوث حدث بناءً على معرفة مسبقة بظروف ذات صلة",
        "مجموع القيم العشوائية غير المتصلة في توزيع متماثل",
        "الانحراف المعياري لعينات مستقلة تماماً",
        "الاحتمال التراكمي لرمي نرد متطابق 100 مرة"
      ],
      correct_index: 0,
      explanation: "مبرهنة بايز تحسب الاحتمال الشرطي P(A|B) عبر دمج الاحتمال المسبق بالأدلة الملاحظة."
    },
    {
      id: 'algo_hashmap',
      boss_taunt: "هل تستطيع الوصول إلى الإجابة بزمن قياسي مثل جدول التجزئة؟",
      question: "ما هو متوسط التعقيد الزمني (Average Time Complexity) للبحث عن قيمة بواسطة المفتاح في جدول التجزئة (Hash Table)؟",
      options: [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n log n)"
      ],
      correct_index: 0,
      explanation: "في الحالة المتوسطة، يوفر جدول التجزئة وصولاً وبحثاً في زمن ثابت O(1) بفضل دالة التجزئة."
    }
  ],
  en: [
    {
      id: 'ml_linreg',
      boss_taunt: "You dare challenge my domain? Answer this question correctly or fall!",
      question: "What is the primary objective of Linear Regression in Machine Learning?",
      options: [
        "Predicting a continuous numerical value based on linear relationships",
        "Classifying images into discrete categories",
        "Compressing audio files without data loss",
        "Encrypting database passwords securely"
      ],
      correct_index: 0,
      explanation: "Linear Regression is primarily used to model relationships and predict continuous numeric values."
    },
    {
      id: 'ml_overfit',
      boss_taunt: "Your model is weak and overfitted to trivial patterns! Can you generalize?",
      question: "Which technique is most commonly used to mitigate overfitting in Deep Neural Networks?",
      options: [
        "Dropout and Weight Regularization (L1/L2)",
        "Deleting testing data before model training",
        "Increasing the learning rate to an extreme level",
        "Doubling the hidden layers without new training data"
      ],
      correct_index: 0,
      explanation: "Techniques like Dropout and weight regularization prevent neural networks from co-adapting and memorizing noise."
    },
    {
      id: 'algo_binary_search',
      boss_taunt: "You move too slowly! Can you divide and conquer in the dark?",
      question: "What is the worst-case time complexity of Binary Search on a sorted array?",
      options: [
        "O(log n)",
        "O(n)",
        "O(n²)",
        "O(1)"
      ],
      correct_index: 0,
      explanation: "Binary Search halves the search interval in every iteration, achieving O(log n) worst-case time complexity."
    },
    {
      id: 'sql_join',
      boss_taunt: "Your queries are fragmented! Show me how you join records under pressure!",
      question: "Which SQL JOIN returns all rows from the left table even when there are no matches in the right table?",
      options: [
        "LEFT JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "FULL JOIN ONLY"
      ],
      correct_index: 0,
      explanation: "A LEFT JOIN preserves every row from the left table and fills missing values from the right table with NULL."
    },
    {
      id: 'ds_stack',
      boss_taunt: "I will stack attacks until you collapse! Which data structure rules this order?",
      question: "Which operational principle governs the behavior of a standard Stack data structure?",
      options: [
        "Last-In, First-Out (LIFO)",
        "First-In, First-Out (FIFO)",
        "Pure Random Direct Access",
        "Dynamic Heap Allocation Priority"
      ],
      correct_index: 0,
      explanation: "A Stack strictly operates on a Last-In, First-Out (LIFO) basis."
    },
    {
      id: 'python_tuples',
      boss_taunt: "Is your understanding mutable or immutable? Face this Python trial!",
      question: "What is the key difference between a Python List and a Python Tuple?",
      options: [
        "Lists are mutable while Tuples are immutable",
        "Tuples can only hold numbers while Lists only hold strings",
        "Lists consume significantly less memory than Tuples",
        "Tuples do not support duplicate elements"
      ],
      correct_index: 0,
      explanation: "In Python, Tuples are immutable and cannot be altered after creation, whereas Lists are mutable."
    },
    {
      id: 'dl_transformer',
      boss_taunt: "Can your attention span withstand the weight of my presence?",
      question: "Which core mechanism enables the Transformer architecture to score relationships between words across a full sequence?",
      options: [
        "Self-Attention Mechanism",
        "Recurrent Feedback Loops",
        "Max Pooling 2D Layers",
        "Byte Pair Encoding Compression"
      ],
      correct_index: 0,
      explanation: "The Transformer relies on Multi-Head Self-Attention to compute dependencies between all tokens simultaneously."
    },
    {
      id: 'db_acid',
      boss_taunt: "All transactions crumble before me! What guarantees that an operation never partially executes?",
      question: "In database systems, what does the Atomicity property in ACID stand for?",
      options: [
        "An all-or-nothing execution: transactions either complete entirely or rollback completely",
        "Hardware-level atomic encryption preventing unauthorized access",
        "Single-threaded serial execution without parallelism",
        "Writing directly to non-volatile disk without cache"
      ],
      correct_index: 0,
      explanation: "Atomicity guarantees that all steps in a transaction succeed together, or the database reverts to its prior state."
    },
    {
      id: 'math_bayes',
      boss_taunt: "Calculate the probability of your defeat! Prove your mathematical prowess!",
      question: "What does Bayes' Theorem allow us to compute in probability theory?",
      options: [
        "The conditional probability of an event given prior knowledge of related conditions",
        "The summation of discontinuous random variables in symmetric bounds",
        "The exact standard deviation of completely independent trials",
        "The cumulative probability of identical dice rolls"
      ],
      correct_index: 0,
      explanation: "Bayes' Theorem determines posterior conditional probability P(A|B) using likelihood, prior probability, and evidence."
    },
    {
      id: 'algo_hashmap',
      boss_taunt: "Can you retrieve your answer in constant time before I strike?",
      question: "What is the average-case time complexity of searching for a value by key in a Hash Table?",
      options: [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n log n)"
      ],
      correct_index: 0,
      explanation: "With a well-distributed hash function, a Hash Table achieves O(1) constant average lookup time."
    }
  ]
};

/**
 * Pick a random non-repeating combat question from the question pool.
 * Shuffles the options so the correct answer is not always in position 0!
 */
export function getRandomCombatQuestion(isAr = false) {
  const langKey = isAr ? 'ar' : 'en';
  const pool = BOSS_COMBAT_QUESTIONS[langKey] || BOSS_COMBAT_QUESTIONS.en;
  
  // Read recent history from localStorage to avoid consecutive repeats
  let used = [];
  try {
    used = JSON.parse(localStorage.getItem('boss_trial_recent_q_ids') || '[]');
  } catch {}

  let available = pool.filter(q => !used.includes(q.id));
  if (available.length === 0) {
    // Reset pool if all used
    available = pool;
    used = [];
  }

  const chosen = available[Math.floor(Math.random() * available.length)] || pool[0];

  // Record into recent history (keep max 6)
  try {
    const updatedUsed = [...used.filter(id => id !== chosen.id), chosen.id].slice(-6);
    localStorage.setItem('boss_trial_recent_q_ids', JSON.stringify(updatedUsed));
  } catch {}

  // Shuffle options so correct answer position varies randomly between A, B, C, D
  const originalOptions = [...chosen.options];
  const correctOptionText = originalOptions[chosen.correct_index];
  
  const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  return {
    ...chosen,
    options: shuffledOptions,
    correct_index: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}
