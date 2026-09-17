/**
 * feynmanJudgeReplies.js
 * Comprehensive library of 105+ unique, handcrafted, in-character AI judge critiques.
 * 35 replies per judge = 105 total diverse dialogue examples across Arabic and English.
 */

export const JUDGE_REPLIES_BANK = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. THE SKEPTIC PROFESSOR (35 distinct critique variations)
  // Logic Inquisitor • Scrutinizes causality, circular logic, axioms, fallacies
  // ═══════════════════════════════════════════════════════════════════════════
  skeptic_professor: [
    {
      id: 'sp_01',
      textAr: (concept) => `بصفتي أكاديمياً، قمت بتمحيص فرضيتك حول "${concept}". تسلسلك الأولي جيد، ولكن انتبه لعدم القفز إلى النتيجة دون إثبات الرابط السببي بين الخطوات. عرّف المفاهيم الأساسية بدقة أكبر وتجنب الاستدلال الدائري!`,
      textEn: (concept) => `As an academic, I scrutinized your explanation of "${concept}". Your initial thesis is coherent, but you made a subtle leap without proving the causal link between your core premises. Avoid circular definitions and tighten your foundational axioms!`,
      scores: { logic: 82, simplicity: 85, practicality: 78 }
    },
    {
      id: 'sp_02',
      textAr: (concept) => `فرضيّتك حول "${concept}" تبدو متماسكة ظاهرياً، غير أنك تفترض ثبات الشروط المحيطة دون برهان تجريبي صلب. أين الدليل المستقل الذي يثبت أن هذه الخطوة تنتج عن سابقتها حتماً؟`,
      textEn: (concept) => `Your argument regarding "${concept}" holds surface appeal, but relies on an unverified inductive leap. Where is the empirical proof connecting your premise to this broad conclusion?`,
      scores: { logic: 75, simplicity: 88, practicality: 72 }
    },
    {
      id: 'sp_03',
      textAr: (concept) => `لقد عرّفت "${concept}" باستخدام نفس المعنى الذي تحاول إثباته! هذا استدلال دائري صريح يرفضه منطق أرسطو. فكك المفهوم إلى بديهيات أولية غير قابلة للشك قبل استخلاص النتائج.`,
      textEn: (concept) => `You defined "${concept}" using the very concept you set out to prove! That is classic circular reasoning. Break it down to irreducible axioms before deriving your claims.`,
      scores: { logic: 68, simplicity: 80, practicality: 74 }
    },
    {
      id: 'sp_04',
      textAr: (concept) => `شرحك لـ "${concept}" يخلط بين التزامن العشوائي والعلة الحتمية. مجرد حدوث أمرين معاً لا يعني أن الأول تسبب في الثاني. أعد صياغة الأساس المنطقي ببرهان قاطع.`,
      textEn: (concept) => `Your breakdown of "${concept}" conflates correlation with causation. Two events happening together does not prove a causal mechanism. Present rigorous deductive proof.`,
      scores: { logic: 74, simplicity: 86, practicality: 79 }
    },
    {
      id: 'sp_05',
      textAr: (concept) => `حاولت تبسيط "${concept}"، لكنك أسقطت الشروط الحدية الأساسية التي بدونها تنهار النظرية بالكامل. التبسيط لا يعني تشويه الحقيقة العلمية وإخفاء التعقيد الضروري!`,
      textEn: (concept) => `In simplifying "${concept}", you discarded the essential boundary conditions that keep the theory valid. Oversimplification that distorts core mechanics is a logical hazard!`,
      scores: { logic: 70, simplicity: 92, practicality: 76 }
    },
    {
      id: 'sp_06',
      textAr: (concept) => `أنت تفترض أن ما ينطبق على الأجزاء الصغيرة في "${concept}" ينطبق بالضرورة على النظام ككل. هذه مغالطة تركيب واضحة؛ النظم الكبيرة تمتلك خصائص انبثاقية مستقلة لا يمكن اختزالها.`,
      textEn: (concept) => `You assume what holds for isolated components in "${concept}" automatically holds for the whole system. That is the fallacy of composition; complex systems have emergent properties!`,
      scores: { logic: 72, simplicity: 84, practicality: 80 }
    },
    {
      id: 'sp_07',
      textAr: (concept) => `بنيت مرافعتك حول "${concept}" على فرضية مسبقة لم يتم التحقق منها في مطلع حديثك. إذا كان الأساس هشاً، فإن كل صرحك الاستدلالي سيتهاوى أمام أول مناقشة علمية جادة.`,
      textEn: (concept) => `Your thesis on "${concept}" rests on an unexamined premise at the very start. When the cornerstone is fragile, the entire theoretical edifice crumbles under scrutiny.`,
      scores: { logic: 76, simplicity: 82, practicality: 75 }
    },
    {
      id: 'sp_08',
      textAr: (concept) => `طرح واعد لـ "${concept}"، لكنك تتجاهل الحالات المعاكسة التي تناقض تعميمك. الباحث الصارم يبحث دائماً عن براهين دحض الفرضية قبل الاحتفاء بصحتها الظاهرية.`,
      textEn: (concept) => `A promising take on "${concept}", yet you ignore counter-examples that challenge your generalization. A true rationalist seeks to falsify their own theory before celebrating it!`,
      scores: { logic: 78, simplicity: 85, practicality: 81 }
    },
    {
      id: 'sp_09',
      textAr: (concept) => `استخدامك للتشبيهات في شرح "${concept}" ذكي، لكن التشبيه وسيلة إيضاح وليس دليلاً برهانياً. لا تعتمد على المجاز لإثبات حقائق مادية تتطلب قياسات ومعادلات دقيقة.`,
      textEn: (concept) => `Your analogies for "${concept}" are clever, but analogies are pedagogical tools, not rigorous proofs. Never mistake a poetic metaphor for empirical verification!`,
      scores: { logic: 80, simplicity: 94, practicality: 77 }
    },
    {
      id: 'sp_10',
      textAr: (concept) => `أحييك على شجاعة مرافعتك في "${concept}"، غير أن تسلسلك المنطقي قفز فجأة من الملاحظة الأولية إلى القانون الكلي دون المرور باختبار الآلية السببية الوسيطة. أين الرابط؟`,
      textEn: (concept) => `I commend your courage on "${concept}", yet your logic leaps straight from raw observation to a universal law without establishing the intermediate mechanism. Where is the link?`,
      scores: { logic: 77, simplicity: 87, practicality: 79 }
    },
    {
      id: 'sp_11',
      textAr: (concept) => `في فحصي لشرح "${concept}"، وجدت أنك تفترض وجود غاية واعية توجه المسار. تجنب التفسيرات الغائية؛ فالظواهر العلمية تحكمها قوانين آلية صلبة لا رغبات ذاتية.`,
      textEn: (concept) => `Examining your explanation of "${concept}", you subtly invoke teleological purpose. Avoid attributing intent to blind physical laws; nature follows rigid mathematical mechanics.`,
      scores: { logic: 73, simplicity: 83, practicality: 76 }
    },
    {
      id: 'sp_12',
      textAr: (concept) => `استدلال محكم نسبياً لمفهوم "${concept}". مع ذلك، أنصحك بإعادة تدقيق تعريفات المتغيرات المستقلة؛ فالوضوح المفاهيمي الصارم هو خط الدفاع الأول ضد المغالطات الخفية.`,
      textEn: (concept) => `A commendable line of reasoning for "${concept}". However, tighten your definitions of independent variables; rigorous conceptual clarity is your shield against subtle fallacies.`,
      scores: { logic: 88, simplicity: 86, practicality: 82 }
    },
    {
      id: 'sp_13',
      textAr: (concept) => `لقد استخدمت لغة قاطعة في مسألة لا تزال محل جدل علمي حول "${concept}". التواضع المعرفي يقتضي الإقرار بالاحتمالات وهوامش الخطأ بدلاً من إطلاق أحكام مطلقة.`,
      textEn: (concept) => `You adopted dogmatic certainty regarding "${concept}" where scientific consensus is still nuanced. Epistemic humility demands acknowledging margins of error and competing paradigms.`,
      scores: { logic: 75, simplicity: 85, practicality: 79 }
    },
    {
      id: 'sp_14',
      textAr: (concept) => `سياقك المنطقي حول "${concept}" يستند إلى مغالطة الاحتكام إلى الشيوع: مجرد إجماع الناس على فكرة لا يجعلها صحيحة علمياً. أين الحجة العقلية المستقلة؟`,
      textEn: (concept) => `Your argument for "${concept}" borders on an ad populum fallacy: common intuition is not empirical validation. Where is the deductive foundation independent of public consensus?`,
      scores: { logic: 71, simplicity: 82, practicality: 74 }
    },
    {
      id: 'sp_15',
      textAr: (concept) => `لقد اختزلت التفاعل المعقد في "${concept}" إلى علاقة خطية وحيدة الاتجاه، متجاهلاً حلقات التغذية الراجعة السلبية والإيجابية التي تغير مسار النظام جذرياً.`,
      textEn: (concept) => `You reduced the multidimensional dynamic of "${concept}" to a simplistic linear chain, omitting feedback loops that radically shift system equilibrium under perturbation.`,
      scores: { logic: 79, simplicity: 88, practicality: 83 }
    },
    {
      id: 'sp_16',
      textAr: (concept) => `برهانك على "${concept}" يعاني من مغالطة السؤال الملغوم؛ لقد ضمنت استنتاجك في صيغة طرح المشكلة ذاتها! حرر فرضيتك من التحيزات المسبقة ودع الأدلة تتحدث وحدها.`,
      textEn: (concept) => `Your defense of "${concept}" begs the question; you smuggled your conclusion into the very formulation of the problem! Strip away preconceptions and let neutral evidence testify.`,
      scores: { logic: 69, simplicity: 79, practicality: 75 }
    },
    {
      id: 'sp_17',
      textAr: (concept) => `استدلال واثق لمفهوم "${concept}"، لكنك تتجاهل تأثير حجم العينة وإمكانية الانحياز الانتقائي. هل تم اختبار هذه النتيجة عبر شروط متناقضة للتأكد من عموميتها؟`,
      textEn: (concept) => `A confident dissection of "${concept}", but you ignore sample bias and selection effects. Has this mechanism been validated across conflicting environments to test universality?`,
      scores: { logic: 81, simplicity: 86, practicality: 80 }
    },
    {
      id: 'sp_18',
      textAr: (concept) => `الوضوح المنطقي هو سيد الموقف في "${concept}". شرحك منظم بصورة لائقة، غير أن النقلة بين المبدأ النظري والتطبيق الفعلي تحتوي على قفزة غير مبررة تتطلب جسراً رياضياً دقيقاً.`,
      textEn: (concept) => `Logical clarity reigns supreme in "${concept}". Your structure is orderly, yet the bridge between theoretical axiom and practical deduction requires much tighter mathematical grounding.`,
      scores: { logic: 84, simplicity: 88, practicality: 81 }
    },
    {
      id: 'sp_19',
      textAr: (concept) => `شرح متوازن لـ "${concept}"، ولكن انتبه لمغالطة المنحدر الزلق؛ افترضت أن وقوع الخطوة الأولى سيقود حتماً لسلسلة كوارث متتالية دون إثبات حتمية كل انتقال.`,
      textEn: (concept) => `A balanced discourse on "${concept}", but beware the slippery slope fallacy; you assumed event A inevitably triggers a catastrophic cascade without proving intermediate probabilities.`,
      scores: { logic: 76, simplicity: 85, practicality: 78 }
    },
    {
      id: 'sp_20',
      textAr: (concept) => `لقد أحسنت في تجريد "${concept}" إلى عناصره الأولية. هذا عمل أكاديمي رصين يستحق التقدير، ولا ينقصه سوى تدقيق طفيف في شروط الثبات الحراري والبيئي.`,
      textEn: (concept) => `Splendid reduction of "${concept}" to first principles. This is academic scholarship of a high order, needing only minor refinement regarding ambient boundary constraints.`,
      scores: { logic: 93, simplicity: 90, practicality: 85 }
    },
    {
      id: 'sp_21',
      textAr: (concept) => `أنت تتعامل مع احتمالات وقوع "${concept}" وكأنها أحداث مستقلة، بينما تظهر الأدلة وجود ترابط ارتباطي وثيق بين المتغيرات يغير حساب الاحتمال الشرطي جذرياً!`,
      textEn: (concept) => `You treat the probabilities governing "${concept}" as mutually independent events, ignoring stochastic covariance that completely alters conditional likelihoods!`,
      scores: { logic: 73, simplicity: 81, practicality: 77 }
    },
    {
      id: 'sp_22',
      textAr: (concept) => `فرضيّتك حول "${concept}" تبدو مقنعة للوهلة الأولى، لكنك استخدمت قياساً تمثيلياً معيباً لا تتطابق فيه الخصائص الجوهرية للطرفين المقارنين. حدد حدود التشبيه بدقة.`,
      textEn: (concept) => `Your thesis on "${concept}" persuades at first glance, but relies on a faulty analogy where fundamental properties diverge. Explicitly delineate where the metaphor breaks!`,
      scores: { logic: 75, simplicity: 87, practicality: 76 }
    },
    {
      id: 'sp_23',
      textAr: (concept) => `تسلسلك لمفهوم "${concept}" جيد في المجمل، لكن انتبه لعدم تبني مغالطة الإحراج الزائف؛ فالحلول ليست محصورة بين نقيضين مطلقين، بل يوجد طيف واسع من البدائل الممكنة.`,
      textEn: (concept) => `Your overview of "${concept}" is solid, but avoid false dilemmas; reality rarely presents a binary between two extremes, but rather a rich continuum of plausible intermediate states.`,
      scores: { logic: 80, simplicity: 84, practicality: 82 }
    },
    {
      id: 'sp_24',
      textAr: (concept) => `لقد قدمت دفاعاً منطقياً قوياً عن "${concept}" يبرهن على فهمك الحقيقي للمصادر الأصلية. فقط احرص على تمييز الفرضية النظرية عن الحقيقة المثبتة مخبرياً.`,
      textEn: (concept) => `A formidable logical defense of "${concept}", demonstrating genuine comprehension of foundational literature. Maintain clear distinction between hypothesis and confirmed empiricism.`,
      scores: { logic: 91, simplicity: 89, practicality: 86 }
    },
    {
      id: 'sp_25',
      textAr: (concept) => `تفسيرك لـ "${concept}" يغفل مبدأ شفرة أوكام؛ لقد أضفت افتراضات غيبية معقدة بينما يوجد تفسير فيزيائي أبسط يفسر نفس الملاحظات بكفاءة أعلى.`,
      textEn: (concept) => `Your interpretation of "${concept}" violates Occam's Razor; you multiplied unnecessary entities when a parsimonious physical model accounts for identical observations.`,
      scores: { logic: 72, simplicity: 83, practicality: 79 }
    },
    {
      id: 'sp_26',
      textAr: (concept) => `أحيي فيك هذا الترتيب الاستقرائي لمفهوم "${concept}". مع ذلك، يجب أن تحذر من فخ التأكيد؛ هل فحصت الأدلة التي قد تناقض نظريتك بنفس الحماس الذي فحصت به مؤيداتها؟`,
      textEn: (concept) => `I commend your inductive structure on "${concept}". However, beware confirmation bias; did you scrutinize anomalies with the same fervor you celebrated supporting data?`,
      scores: { logic: 82, simplicity: 85, practicality: 80 }
    },
    {
      id: 'sp_27',
      textAr: (concept) => `مرافعة ذكية في "${concept}"، لكنك افترضت التناظر التام في حين أن الأنظمة الفيزيائية الحقيقية تتسم غالباً بكسر التناظر التلقائي عند مستويات الطاقة الحرجة.`,
      textEn: (concept) => `An ingenious argument for "${concept}", but you presupposed perfect symmetry where physical systems routinely exhibit spontaneous symmetry breaking at critical thresholds.`,
      scores: { logic: 85, simplicity: 86, practicality: 84 }
    },
    {
      id: 'sp_28',
      textAr: (concept) => `شرحك لـ "${concept}" متسق منطقياً مع نفسه، لكن الاتساق الداخلي وحده لا يكفي؛ يجب أن يتطابق النموذج مع القياسات التجريبية المستقلة في الواقع الخارجي.`,
      textEn: (concept) => `Your formulation of "${concept}" is internally consistent, but internal coherence is insufficient without external correspondence to objective empirical measurement.`,
      scores: { logic: 83, simplicity: 88, practicality: 82 }
    },
    {
      id: 'sp_29',
      textAr: (concept) => `لقد استخدمت حجة السلطة المعرفية في شرح "${concept}" بدلاً من تفكيك الآلية ذاتها. العلم لا يعترف بالأسماء الرنانة، بل بالبراهين التي يمكن لأي طالب تكرارها والتحقق منها.`,
      textEn: (concept) => `You appealed to authority in explaining "${concept}" rather than exposing the mechanism. Science honors no pedigree; it answers solely to reproducible experimental proof.`,
      scores: { logic: 74, simplicity: 80, practicality: 76 }
    },
    {
      id: 'sp_30',
      textAr: (concept) => `تحليل عميق لـ "${concept}" يكشف عن دراسة وافية. نقدك للفرضيات السابقة سليم، وإعادة بنائك للمفهوم من المبادئ الأولى تفي بالمعايير الأكاديمية الصارمة للمحكمة.`,
      textEn: (concept) => `A profound dissection of "${concept}" demonstrating scholarly diligence. Your deconstruction of prior assumptions meets our highest tribunal standards for logical rigor.`,
      scores: { logic: 95, simplicity: 91, practicality: 88 }
    },
    {
      id: 'sp_31',
      textAr: (concept) => `أرى أنك تفترض خطية السبب والنتيجة في "${concept}"، بينما الديناميكا غير الخطية تثبت أن التغيرات الطفيفة جداً قد تولد نتائج غير متوقعة نهائياً بفعل الفوضى الحتمية.`,
      textEn: (concept) => `You assume linear causality in "${concept}", whereas nonlinear dynamics prove infinitesimal perturbations can produce vastly divergent trajectories via deterministic chaos.`,
      scores: { logic: 78, simplicity: 84, practicality: 81 }
    },
    {
      id: 'sp_32',
      textAr: (concept) => `لقد قفزت من حقيقة جزئية في "${concept}" إلى تعميم شمولي. تذكر دائماً: البجعة السوداء الواحدة تكفي لدحض فرضية أن كل البجع أبيض، فاحذر التعميمات الفضفاضة.`,
      textEn: (concept) => `You extrapolated a universal claim for "${concept}" from localized data. Remember: a single black swan falsifies the axiom that all swans are white; avoid sweeping generalizations.`,
      scores: { logic: 76, simplicity: 83, practicality: 77 }
    },
    {
      id: 'sp_33',
      textAr: (concept) => `مرافعتك لمفهوم "${concept}" تُبرز مقدرة استدلالية واعدة. لو قمت بإحكام صياغة الشروط المسبقة في جملتك الافتتاحية لكانت حجتك عصية على أي طعن أكاديمي.`,
      textEn: (concept) => `Your discourse on "${concept}" shows formidable deductive prowess. Tightening the initial boundary conditions in your opening claim would make your thesis impregnable.`,
      scores: { logic: 89, simplicity: 87, practicality: 83 }
    },
    {
      id: 'sp_34',
      textAr: (concept) => `في فحصي لمفهوم "${concept}"، لاحظت استخدامك لمصطلحات حمالة أوجه. الدقة اللغوية شرط أساسي للوضوح المنطقي؛ عرّف المصطلح بدلالة واحدة لا تقبل الالتباس.`,
      textEn: (concept) => `Reviewing "${concept}", I observed equivocation in key terminology. Semantic precision is the prerequisite of logical rigor; define your terms with unambiguous singularity.`,
      scores: { logic: 77, simplicity: 82, practicality: 79 }
    },
    {
      id: 'sp_35',
      textAr: (concept) => `نموذج استدلالي رفيع المستوى لمفهوم "${concept}". لقد برهنت على الترابط السببي بوضوح وأغلقت كل الثغرات المحتملة للاستدلال الدائري. أحييك على هذا الانضباط العقلي!`,
      textEn: (concept) => `An exemplary logical architecture for "${concept}". You demonstrated clear causality, closed every loophole of circularity, and honored first principles. Supreme academic rigor!`,
      scores: { logic: 97, simplicity: 92, practicality: 89 }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. THE CURIOUS CHILD (35 distinct critique variations)
  // Jargon Crusher • Demands analogies, hates boring words, playful reactions
  // ═══════════════════════════════════════════════════════════════════════════
  curious_child: [
    {
      id: 'cc_01',
      textAr: (concept) => `انتظر لحظة! هل يمكنك شرح "${concept}" وكأنني في الخامسة من عمري؟ عندما استخدمت تلك الكلمات الطنانة شعرت بالملل. أعطني تشبيهاً من ألعاب الفيديو أو علبة الشوكولاتة حتى أفهمه وأتخيله فوراً!`,
      textEn: (concept) => `Wait a second! Can you explain "${concept}" like I'm 5 years old? Those fancy multi-syllable terms sound like homework! Give me a fun analogy—like a LEGO castle, toy cars, or a magic backpack—so I can actually picture it!`,
      scores: { logic: 84, simplicity: 72, practicality: 80 }
    },
    {
      id: 'cc_02',
      textAr: (concept) => `أنا لا أفهم كل تلك الكلمات الطويلة عن "${concept}"! هل هي مثل بالون ينتفخ حتى ينفجر، أم مثل ناطحة سحاب من مكعبات الليغو؟ احكِها لي كقصة كرتونية مضحكة قبل أن أغفو!`,
      textEn: (concept) => `I do not get those giant grown-up words about "${concept}"! Is it like a water balloon expanding until it pops, or a LEGO skyscraper? Tell it like a funny cartoon before I fall asleep!`,
      scores: { logic: 80, simplicity: 68, practicality: 75 }
    },
    {
      id: 'cc_03',
      textAr: (concept) => `واو! موضوع "${concept}" يبدو رائعاً كالسحر! لكن لماذا تجعله يبدو كواجب مدرسي ممل؟ أين التشبيه الممتع؟ أريد أن أراه مثل سيارة سباق سريعة أو حبة حلوى سحرية تمنحك قوى خارقة!`,
      textEn: (concept) => `Whoa! "${concept}" sounds magical, but why did you turn it into a boring lecture? Where is the fun picture? Explain it like a rocket ship, superhero cape, or magic candy!`,
      scores: { logic: 82, simplicity: 74, practicality: 78 }
    },
    {
      id: 'cc_04',
      textAr: (concept) => `كلامك عن "${concept}" جعل رأسي يدور كالمروحة! تخيل أنني كائن فضائي صغير هبط لتوه على الأرض، كيف تريني إياها في دقيقة واحدة باستخدام البيتزا والمثلجات دون أي تعقيد؟`,
      textEn: (concept) => `Your talk about "${concept}" made my head spin like a propeller! Pretend I'm a friendly little alien who only understands pizza slices and ice cream—explain it with food!`,
      scores: { logic: 78, simplicity: 70, practicality: 82 }
    },
    {
      id: 'cc_05',
      textAr: (concept) => `أعجبني شرحك لـ "${concept}"! لكن ما زلت أريد أن أعرف: لو كان هذا الشيء بطلاً خارقاً في لعبة، فما هي ضربته القاضية، وما هي نقطة ضعفه الوحيدة التي تهزمه؟`,
      textEn: (concept) => `I liked your take on "${concept}"! But tell me this: if this concept was a playable video game boss, what is its ultimate attack, and what tiny secret weakness defeats it?`,
      scores: { logic: 85, simplicity: 89, practicality: 84 }
    },
    {
      id: 'cc_06',
      textAr: (concept) => `توقّف! لقد استخدمت 3 كلمات صعبة جداً في سطر واحد! معلمتي تقول: إذا لم تستطع شرح "${concept}" لجدتك أو لقطتك الأليفة، فهذا يعني أنك أنت نفسك لست متأكداً منه بعد!`,
      textEn: (concept) => `Stop right there! You used three giant dictionary words in a single sentence! My teacher says if you cannot explain "${concept}" to your pet cat, you don't really get it yourself yet!`,
      scores: { logic: 81, simplicity: 65, practicality: 77 }
    },
    {
      id: 'cc_07',
      textAr: (concept) => `هذا تشبيه رائع ومسلي لـ "${concept}"! تخيلت المشهد فوراً في مخيلتي كأنه فيلم رسوم متحركة ملون. الآن فقط بدأت أفهم ما الذي يحدث حقاً في هذا العالم العجيب!`,
      textEn: (concept) => `Now that is an awesome analogy for "${concept}"! I pictured it instantly like an animated Pixar movie! Now I actually see what is happening without getting a headache!`,
      scores: { logic: 88, simplicity: 96, practicality: 85 }
    },
    {
      id: 'cc_08',
      textAr: (concept) => `هل يمكنني لمس "${concept}" بيدي؟ أم هو شيء خفي يعيش في الهواء مثل الأشباح والواي فاي؟ اجعلني أراه وألمسه وأتذوقه بمخيلتي حتى لا أنساه أبداً في حياتي!`,
      textEn: (concept) => `Can I touch "${concept}" with my hands, or is it invisible like ghosts and Wi-Fi? Make me see it, touch it, and taste it in my imagination so it sticks in my head forever!`,
      scores: { logic: 83, simplicity: 88, practicality: 79 }
    },
    {
      id: 'cc_09',
      textAr: (concept) => `يا له من شرح ذكي لـ "${concept}"! لكن لماذا يبدو الجميع كباراً وجادين عندما يتكلمون عنه؟ العلم يجب أن يكون ممتعاً مثل تفكيك ألعاب العيد لا مثل قراءة دليل غسالة الملابس!`,
      textEn: (concept) => `Clever explanation of "${concept}"! But why do grown-ups always sound so gloomy talking about science? It should feel like smashing piñatas, not reading a washing machine manual!`,
      scores: { logic: 86, simplicity: 92, practicality: 83 }
    },
    {
      id: 'cc_10',
      textAr: (concept) => `أحببت الفكرة! ولكن لو اختفى "${concept}" فجأة من كوكب الأرض هذا المساء، فما أول شيء سيتعطل في غرفتي أو في حديقة الألعاب غداً في الصباح؟`,
      textEn: (concept) => `I love the idea! But what if "${concept}" vanished from planet Earth tonight? What is the very first toy, game, or snack that would break tomorrow morning?`,
      scores: { logic: 84, simplicity: 90, practicality: 88 }
    },
    {
      id: 'cc_11',
      textAr: (concept) => `أشعر أنك تقرأ من كتاب قديم مليء بالغبار! قُل لي بصراحة عن "${concept}": كيف تشرحه لأخيك الصغير أثناء لعبكم بالكرة في الفناء الخلفي دون أن يهرب منك؟`,
      textEn: (concept) => `You sound like a dusty old encyclopedia! Tell me about "${concept}" the way you'd whisper a playground secret to your best friend while shooting basketball hoops!`,
      scores: { logic: 79, simplicity: 76, practicality: 81 }
    },
    {
      id: 'cc_12',
      textAr: (concept) => `برافو! لقد جعلت مفهوم "${concept}" يبدو سهلاً وبسيطاً كشرب عصير البرتقال! حتى الأطفال في الروضة سيفهمون هذا التشبيه اللامع ويصفقون لك بحرارة!`,
      textEn: (concept) => `Bravo! You made "${concept}" feel as easy and refreshing as cold lemonade on a hot summer day! Even a preschooler could grasp that analogy and cheer!`,
      scores: { logic: 90, simplicity: 98, practicality: 86 }
    },
    {
      id: 'cc_13',
      textAr: (concept) => `يا سلااام! هل تعني أن "${concept}" يشبه صندوق مفاجآت تفتحه فيخرج منه مهرج يقفز في الهواء؟ التشبيه مضحك جداً ولكن جعلني أفهم الفكرة في ثانية واحدة!`,
      textEn: (concept) => `Yay! Does that mean "${concept}" is like a Jack-in-the-box that springs open with a funny clown? That silly picture made me understand everything in two seconds!`,
      scores: { logic: 87, simplicity: 95, practicality: 82 }
    },
    {
      id: 'cc_14',
      textAr: (concept) => `أنت تتحدث بسرعة وكأنك تخشى أن يفوتك قطار الملاهي! تنفّس قليلاً، واشرح لي "${concept}" كأننا نرسم لوحة بألوان الشمع على ورقة بيضاء كبيرة!`,
      textEn: (concept) => `You're rushing like you're about to miss the roller coaster! Slow down, take a breath, and explain "${concept}" like we're doodling with giant bright crayons!`,
      scores: { logic: 80, simplicity: 78, practicality: 79 }
    },
    {
      id: 'cc_15',
      textAr: (concept) => `ماذا؟! كل هذا التعقيد لمجرد شرح "${concept}"؟! ظننتك ستخبرني بقصة تنين ينفث النار أو سفينة قراصنة تبحث عن الكنز! أعد صياغتها بروح المغامرة!`,
      textEn: (concept) => `What?! All those boring paragraphs just to explain "${concept}"?! I thought you'd tell me a tale about fire-breathing dragons or pirate treasure! Give it some adventure!`,
      scores: { logic: 78, simplicity: 72, practicality: 77 }
    },
    {
      id: 'cc_16',
      textAr: (concept) => `أوه! تشبيهك لـ "${concept}" بالسيارات المتصادمة في الملاهي كان رائعاً للغاية! رأيت الشرارات تتطاير وسمعت صوت الضحكات في رأسي فوراً! أنت معلم ممتع!`,
      textEn: (concept) => `Ooh! Comparing "${concept}" to bumper cars at the amusement park was brilliant! I could hear the crunch and see the sparks in my brain! You're a fun teacher!`,
      scores: { logic: 88, simplicity: 97, practicality: 84 }
    },
    {
      id: 'cc_17',
      textAr: (concept) => `لو أردت أن أرسم "${concept}" على دفتري الصغير، فما هو الشكل الأسهل: دائرة تبتسم، أم مربع حزين، أم خط متعرج يقفز كالأرنب؟ دلني كيف أرسمه!`,
      textEn: (concept) => `If I had to doodle "${concept}" in my sketchbook, what shape is it: a smiling circle, a grumpy square, or a zigzag jumping like a bunny? Show me how to draw it!`,
      scores: { logic: 82, simplicity: 91, practicality: 80 }
    },
    {
      id: 'cc_18',
      textAr: (concept) => `كلامك عن "${concept}" يشبه حشو شطيرة بالكثير من الخضار المسلوقة دون جبن ولا بطاطس مقرمشة! أضف القليل من التوابل والمرح إلى شرحك حتى يصبح شهياً!`,
      textEn: (concept) => `Your explanation of "${concept}" is like a sandwich full of soggy spinach with no melted cheese! Put some crunchy sprinkles and sauce on it so my brain wants to eat it!`,
      scores: { logic: 79, simplicity: 75, practicality: 80 }
    },
    {
      id: 'cc_19',
      textAr: (concept) => `وااو، هل يمكنني استخدام فكرة "${concept}" للفوز في لعبة الغميضة مع أصدقائي في الحديقة؟ هذا أول شيء خطر ببالي عندما سمعت شرحك الذكي!`,
      textEn: (concept) => `Whoa, could I use the trick behind "${concept}" to win a game of hide-and-seek with my friends in the park? That is the very first thing I thought of listening to you!`,
      scores: { logic: 85, simplicity: 93, practicality: 86 }
    },
    {
      id: 'cc_20',
      textAr: (concept) => `أنا فخور بك! لقد حطمت تلك المصطلحات الصعبة عن "${concept}" كما نحطم الأواني الفخارية بالعصا في الأعياد! الآن أصبح المفهوم شفافاً ونقياً كالماء العذب!`,
      textEn: (concept) => `I'm proud of you! You smashed those giant buzzwords about "${concept}" like a giant birthday piñata! Now the whole concept is as clear and sparkly as apple juice!`,
      scores: { logic: 89, simplicity: 99, practicality: 85 }
    },
    {
      id: 'cc_21',
      textAr: (concept) => `هل هذا يعني أن "${concept}" مثل مغناطيس سحري يلتقط الأشياء اللامعة من مسافة بعيدة؟ التشبيه البسيط جعل اللغز ينحل في لحظة واحدة!`,
      textEn: (concept) => `Does that mean "${concept}" is like a super-magnet snatching shiny paperclips from across the room? That simple image made the mystery click instantly!`,
      scores: { logic: 86, simplicity: 94, practicality: 83 }
    },
    {
      id: 'cc_22',
      textAr: (concept) => `شرحك لـ "${concept}" ليس سيئاً، لكنك لا تزال تستخدم نبرة المعلم الغاضب في الفصل! ابتسم قليلاً واجعلني أشعر أننا نلعب لعبة ألغاز شيقة ومثيرة!`,
      textEn: (concept) => `Not bad on "${concept}", but you still sound like a strict substitute teacher! Smile a little and make me feel like we're cracking a secret spy code together!`,
      scores: { logic: 81, simplicity: 82, practicality: 78 }
    },
    {
      id: 'cc_23',
      textAr: (concept) => `لقد أحببت تشبيه قطرات المطر لـ "${concept}"! كل فكرة معقدة تسقط وتتجمع في بركة صغيرة صافية تعكس السماء. هكذا يجب أن يكون التعليم دائماً!`,
      textEn: (concept) => `I loved the raindrop analogy for "${concept}"! Every tricky idea falls into a crystal-clear puddle reflecting the sky. That is how learning should always feel!`,
      scores: { logic: 87, simplicity: 96, practicality: 84 }
    },
    {
      id: 'cc_24',
      textAr: (concept) => `هل تعرف ما الشيء الناقص في شرحك لـ "${concept}"؟ صوت المؤثرات الصوتية! "بوووم!"، "طاااخ!"، "زوووم!"... الأطفال يتعلمون بالأصوات والألوان والحركة!`,
      textEn: (concept) => `You know what your explanation of "${concept}" is missing? Sound effects! "Boom!", "Zap!", "Whoosh!"... Kids learn through sound, color, and bouncing motion!`,
      scores: { logic: 82, simplicity: 88, practicality: 79 }
    },
    {
      id: 'cc_25',
      textAr: (concept) => `عندما بدأت تتكلم عن "${concept}" فكرت في الهروب لألعب بالكرة، لكن تشبيهك المفاجئ في المنتصف جعلني أتوقف وأستمع حتى آخر كلمة باهتمام حقيقي!`,
      textEn: (concept) => `When you started talking about "${concept}" I wanted to run outside, but that surprise analogy in the middle made me stop and listen all the way to the end!`,
      scores: { logic: 86, simplicity: 92, practicality: 82 }
    },
    {
      id: 'cc_26',
      textAr: (concept) => `أنت عبقري التبسيط! أخذت وحشاً مخيفاً اسمه "${concept}" وحولته إلى قطة أليفة صغيرة يمكن لأي طفل اللعب معها والتربيت على رأسها بلطف!`,
      textEn: (concept) => `You're a simplification wizard! You took a scary monster called "${concept}" and turned it into a cuddly purring kitten anyone can pet!`,
      scores: { logic: 91, simplicity: 98, practicality: 87 }
    },
    {
      id: 'cc_27',
      textAr: (concept) => `انتظر، هل هناك أي أزرار سرية يمكنني الضغط عليها في "${concept}"؟ لو كان هذا جهاز تحكم في لعبة، فما الزر الذي يقفز والزر الذي يطلق الليزر؟`,
      textEn: (concept) => `Wait, are there secret buttons I can press in "${concept}"? If this was a gaming controller, which button jumps and which button fires the laser beams?`,
      scores: { logic: 83, simplicity: 89, practicality: 85 }
    },
    {
      id: 'cc_28',
      textAr: (concept) => `لقد استخدمت كلمة أجنبية غامضة في منتصف حديثك عن "${concept}"! كلما سمعت كلمة لا أفهمها أشعر أن هناك جداراً طوبياً ارتفع أمامي فجأة. اهدم هذا الجدار فوراً!`,
      textEn: (concept) => `You used a mysterious foreign buzzword in "${concept}"! Every time I hear a word I don't know, a brick wall slams down in front of me. Tear that wall down!`,
      scores: { logic: 78, simplicity: 73, practicality: 76 }
    },
    {
      id: 'cc_29',
      textAr: (concept) => `تشبيهك لـ "${concept}" بحبات الدومينو المتساقطة واحدة تلو الأخرى كان أروع ما سمعت اليوم! شاهدت المشهد كله بوضوح تام دون أدنى حيرة!`,
      textEn: (concept) => `Comparing "${concept}" to a line of falling dominoes was the coolest thing I heard today! I watched the whole chain reaction in my head without any confusion!`,
      scores: { logic: 89, simplicity: 97, practicality: 86 }
    },
    {
      id: 'cc_30',
      textAr: (concept) => `هل يمكننا صنع تجربة في المطبخ باستخدام الخل وصودا الخبز لنرى "${concept}" وهو يثور؟ إذا استطعت أن تجعلني أراها في المطبخ، فسأعطيك مئة درجة كاملة!`,
      textEn: (concept) => `Could we test "${concept}" in the kitchen with baking soda and vinegar to watch it fizz? If you can make it erupt in my kitchen, you get a solid 100%!`,
      scores: { logic: 84, simplicity: 91, practicality: 88 }
    },
    {
      id: 'cc_31',
      textAr: (concept) => `شرح رائع، ولكن لماذا لا تبدأ بقصة طفل ضائع في الغابة ثم يكتشف "${concept}" وينجو؟ القصص هي أفضل طريقة لتثبيت العلم في عقول الصغار والكبار!`,
      textEn: (concept) => `Great explanation, but why not start with a story of a kid lost in the woods discovering "${concept}"? Stories are the glue that makes science stick forever!`,
      scores: { logic: 83, simplicity: 89, practicality: 81 }
    },
    {
      id: 'cc_32',
      textAr: (concept) => `تخيلت أن "${concept}" مثل فريق نمل صغير يتعاون لنقل قطعة سكر ضخمة إلى جحرهم! التشبيه جعلني أبتسم وأفهم الفكرة العميقة في نفس اللحظة!`,
      textEn: (concept) => `I pictured "${concept}" as a tiny ant army marching together to haul a giant sugar cube! That visual made me giggle and understand the deep idea at the same time!`,
      scores: { logic: 88, simplicity: 95, practicality: 84 }
    },
    {
      id: 'cc_33',
      textAr: (concept) => `كلامك عن "${concept}" منظم، ولكن ينقصه الإيقاع الموسيقي! التبسيط الحقيقي يشبه أغنية أطفال جميلة تعلق في الأذن وترددها طوال اليوم بمرح!`,
      textEn: (concept) => `Orderly talk on "${concept}", but lacking musical rhythm! Real Feynman simplification is like a catchy cartoon theme song you hum on the bus all morning!`,
      scores: { logic: 85, simplicity: 87, practicality: 80 }
    },
    {
      id: 'cc_34',
      textAr: (concept) => `أنا سعيد جداً بهذا الشرح لمفهوم "${concept}"! سأذهب فوراً لأرويه لأصدقائي في ملعب الحي وسأبدو أمامهم كعالم فضاء عبقري وصغير! شكراً لك!`,
      textEn: (concept) => `I'm so excited about this explanation of "${concept}"! I'm running to the playground right now to tell my friends—I'm gonna sound like a mini rocket scientist!`,
      scores: { logic: 90, simplicity: 98, practicality: 88 }
    },
    {
      id: 'cc_35',
      textAr: (concept) => `يا له من إتقان أسطوري لتقنية فاينمان في "${concept}"! لقد أزلت كل الأقنعة والمصطلحات ونطقت بالجوهر الصافي البسيط. أنت بطل تبسيط المعرفة بلا منازع!`,
      textEn: (concept) => `Legendary mastery of the Feynman Technique for "${concept}"! You stripped away all masks and jargon to speak pure, sparkling truth. You are the ultimate Jargon Crusher!`,
      scores: { logic: 96, simplicity: 100, practicality: 92 }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. THE PRAGMATIC ENGINEER (35 distinct critique variations)
  // System Realist • Real-world failure points, scale, latency, edge cases
  // ═══════════════════════════════════════════════════════════════════════════
  pragmatic_engineer: [
    {
      id: 'pe_01',
      textAr: (concept) => `نظريتك حول "${concept}" تبدو أنيقة على الورق، لكن مهندسي الواقع يهتمون بنقاط الانهيار. ماذا يحدث عند تضاعف الأحمال بمقدار 100 ضعف؟ اختبر دائماً الحالات المتطرفة، وابنِ نموذجاً عملياً ملموساً قبل الثقة العمياء بالنظرية.`,
      textEn: (concept) => `The theory behind "${concept}" looks pretty on the whiteboard, but in production, edge cases break things. How does this behave under 100x traffic or latency spikes? Always build a minimal prototype and stress-test the failure boundaries!`,
      scores: { logic: 86, simplicity: 82, practicality: 75 }
    },
    {
      id: 'pe_02',
      textAr: (concept) => `الكلام النظري عن "${concept}" جميل، لكن في خطوط الإنتاج والأنظمة الحية، ما هي تكلفة التنفيذ وزمن الاستجابة الحقيقي؟ حدد لي عنق الزجاجة ومواطن الفشل المحتملة تحت الضغط المالي والتقني.`,
      textEn: (concept) => `Theoretical models of "${concept}" are clean, but hardware constraints are messy. What is the bottleneck, what are the thermal or memory limits, and how do we measure latency under real load?`,
      scores: { logic: 84, simplicity: 80, practicality: 72 }
    },
    {
      id: 'pe_03',
      textAr: (concept) => `بصفتي مهندساً يواجه أعطال الواقع كل يوم، أسألك: كيف سنراقب أداء "${concept}" لحظياً؟ وما هي خطة الطوارئ البديلة عندما يتعطل المكون الأساسي في منتصف الليل وتتوقف الخدمة؟`,
      textEn: (concept) => `As an engineer fighting production fires, I ask: how do we monitor "${concept}" in real time? What is the failover plan when the primary component crashes at 3 AM?`,
      scores: { logic: 88, simplicity: 78, practicality: 70 }
    },
    {
      id: 'pe_04',
      textAr: (concept) => `نموذجك لـ "${concept}" يعمل في بيئة مختبرية معقمة، لكن بيئات العمل الحقيقية مليئة بالضجيج والتقلبات وتداخل الإشارات. كيف ستتعامل مع حالات الحافة واختناقات الأداء في العالم الواقعي؟`,
      textEn: (concept) => `Your model for "${concept}" works in a sterile lab, but production environments are noisy and unpredictable. How does this survive bad input, network drops, and corrupted packets?`,
      scores: { logic: 85, simplicity: 83, practicality: 73 }
    },
    {
      id: 'pe_05',
      textAr: (concept) => `أعجبني الجانب التطبيقي في فكرة "${concept}". والآن، لنتحدث بلغة الأرقام والميزانيات: ما هي كفاءة الطاقة والقدرة على التوسع عندما ننتقل من عشرة مستخدمين إلى عشرة ملايين؟`,
      textEn: (concept) => `I like your operational angle on "${concept}". Now let’s talk hard numbers: what is the energy efficiency, infrastructure bill, and scaling cost moving from 10 to 10 million users?`,
      scores: { logic: 87, simplicity: 85, practicality: 78 }
    },
    {
      id: 'pe_06',
      textAr: (concept) => `شرح ممتاز لـ "${concept}"، لكن انتبه لنقطة الفشل الفردية! إذا انهار هذا الجزء فستنهار المنظومة بأكملها كتأثير الدومينو. صمم نظام تكرار احتياطي يعزل الأعطال ويضمن الاستمرارية.`,
      textEn: (concept) => `Great technical breakdown of "${concept}", but beware the single point of failure! If this module dies, does the system cascade into a blackout? Build redundancy and graceful degradation!`,
      scores: { logic: 89, simplicity: 84, practicality: 82 }
    },
    {
      id: 'pe_07',
      textAr: (concept) => `تتحدث عن "${concept}" وكأن الموارد غير محدودة! في الهندسة الحقيقية كل بايت له ثمن، وكل دورة معالج تستهلك حرارة وطاقة. كيف نحقق نفس النتيجة بأقل قدر من الهدر؟`,
      textEn: (concept) => `You talk about "${concept}" as if resources are infinite! In reality, every byte costs money and every CPU cycle bleeds wattage. How do we build this with minimum resource waste?`,
      scores: { logic: 83, simplicity: 81, practicality: 76 }
    },
    {
      id: 'pe_08',
      textAr: (concept) => `أقدّر تركيزك على الآلية العملية لـ "${concept}". الخطوة القادمة هي كتابة اختبارات ضغط مكثفة لاكتشاف متى يتصدع النظام؛ لا تعتمد أبداً على التفاؤل النظري دون تجارب إجهاد حقيقية.`,
      textEn: (concept) => `I appreciate your mechanical focus on "${concept}". The next step is aggressive stress-testing to find where the seams burst; never trust theoretical optimism without a load test!`,
      scores: { logic: 86, simplicity: 87, practicality: 85 }
    },
    {
      id: 'pe_09',
      textAr: (concept) => `منظورك حول "${concept}" يقترب من متطلبات الصناعة الحقيقية! مع ذلك، احذر من التكاليف الخفية للصيانة والدعم الفني؛ فأبسط نظام هو الأسهل في الإصلاح عند وقوع الحوادث.`,
      textEn: (concept) => `Your view on "${concept}" aligns with industry reality! Just beware hidden maintenance debt; the simplest architecture is always the easiest to repair when things catch fire.`,
      scores: { logic: 88, simplicity: 88, practicality: 90 }
    },
    {
      id: 'pe_10',
      textAr: (concept) => `لقد وصفت طريقة عمل "${concept}" بدقة، لكنك أهملت معايير الأمان والتوافقية مع الأنظمة القديمة. كيف سندمج هذا الابتكار مع بنية تحتية عمرها عشرون عاماً دون إيقاف العمل؟`,
      textEn: (concept) => `You nailed how "${concept}" operates, but overlooked legacy compatibility and security posture. How does this interface with 20-year-old enterprise infrastructure without downtime?`,
      scores: { logic: 87, simplicity: 82, practicality: 81 }
    },
    {
      id: 'pe_11',
      textAr: (concept) => `هذا حل هندسي ذكي لـ "${concept}"! يوفر استهلاك الذاكرة ويقلل زمن الوصول بشكل ملحوظ. هكذا يفكر المهندسون المحترفون الذين يصنعون تقنيات تعيش وتصمد في الميدان.`,
      textEn: (concept) => `Now that is an elegant engineering solution for "${concept}"! It trims memory overhead and slashes latency. That is how elite systems architects build enduring technology.`,
      scores: { logic: 92, simplicity: 89, practicality: 95 }
    },
    {
      id: 'pe_12',
      textAr: (concept) => `المعمارية المقترحة لـ "${concept}" تبدو متينة وقابلة للتوسع التدريجي. تأكد فقط من توثيق واجهات الاستخدام وحالات الخطأ، فالكود غير الموثق هو قنبلة موقوتة في أي فريق عمل.`,
      textEn: (concept) => `Your architectural blueprint for "${concept}" is robust and gracefully scalable. Just document the edge error codes; undocumented systems are ticking time bombs for maintenance teams.`,
      scores: { logic: 90, simplicity: 86, practicality: 94 }
    },
    {
      id: 'pe_13',
      textAr: (concept) => `في النظم الموزعة لمفهوم "${concept}"، التزامن الكامل هو وهم مكلف! مبدأ CAP يفرض عليك التنازل إما عن الاتساق اللحظي أو التوافر أثناء انقطاع الشبكة. ما هو قرارك؟`,
      textEn: (concept) => `In distributed designs for "${concept}", instant consistency is a costly fantasy! The CAP theorem forces a tradeoff between consistency and availability during network partitions. What do you sacrifice?`,
      scores: { logic: 88, simplicity: 83, practicality: 89 }
    },
    {
      id: 'pe_14',
      textAr: (concept) => `أنت تفترض أن كل المكونات في "${concept}" ستستجيب في أجزاء من الملي ثانية. ماذا لو تعرضت قاعدة البيانات لتجميد مؤقت؟ صمم قواطع دوائر ومخازن مؤقتة لامتصاص الصدمات.`,
      textEn: (concept) => `You assume every module in "${concept}" responds in sub-milliseconds. What if the downstream database suffers a 5-second garbage collection freeze? Implement circuit breakers and message queues!`,
      scores: { logic: 87, simplicity: 84, practicality: 86 }
    },
    {
      id: 'pe_15',
      textAr: (concept) => `فكرة "${concept}" جيدة، لكنك لم تذكر كيف ستتعامل مع تسرب الذاكرة على المدى الطويل. النظام الذي يعمل بكفاءة لمدة ساعة قد يختنق ويموت بعد أسبوعين من التشغيل المستمر!`,
      textEn: (concept) => `Good pitch for "${concept}", but you didn't address slow memory leaks. A service that runs clean for an hour can easily exhaust RAM and crash after two weeks of continuous runtime!`,
      scores: { logic: 85, simplicity: 82, practicality: 83 }
    },
    {
      id: 'pe_16',
      textAr: (concept) => `هذا تصميم واقعي ومتقن لـ "${concept}"! يعتمد على مكونات قياسية جاهزة بدلاً من إعادة اختراع العجلة بتكلفة باهظة. المهندس الماهر يختار الحل الأبسط والأكثر موثوقية دائماً.`,
      textEn: (concept) => `Realistic and polished engineering for "${concept}"! Leveraging proven, battle-tested primitives instead of reinventing the wheel saves millions in operational headaches.`,
      scores: { logic: 91, simplicity: 88, practicality: 96 }
    },
    {
      id: 'pe_17',
      textAr: (concept) => `ماذا عن حالات التراجع التلقائي لـ "${concept}"؟ إذا قمنا بنشر تحديث وحدث خطأ فادح في خوادم الإنتاج، فهل يمكننا الرجوع للنسخة السابقة في ثوانٍ معدودة دون فقدان بيانات المستخدمين؟`,
      textEn: (concept) => `What is the rollback strategy for "${concept}"? If a bad deployment goes live to production servers, can we roll back in 30 seconds with zero customer data loss?`,
      scores: { logic: 86, simplicity: 81, practicality: 87 }
    },
    {
      id: 'pe_18',
      textAr: (concept) => `تحليلك لـ "${concept}" يعالج المعضلة التقنية الأساسية، لكنه يغفل تكلفة الباندويث وشبكة التوصيل. نقل هذه الكميات الضخمة من البيانات عبر القارات سيفجر الفاتورة السحابية شهرياً!`,
      textEn: (concept) => `Your analysis of "${concept}" solves the computational challenge, but ignores network egress costs. Shoveling that much data cross-region will obliterate your monthly cloud budget!`,
      scores: { logic: 84, simplicity: 83, practicality: 79 }
    },
    {
      id: 'pe_19',
      textAr: (concept) => `أعجبني أنك وضعت قيود السلامة والأمان في صلب شرحك لـ "${concept}". الأنظمة الهندسية المحترمة تصمم للدفاع في العمق، وتفترض دائماً أن المهاجمين سيكتشفون أضعف حلقة في السلسلة.`,
      textEn: (concept) => `I appreciate that you baked safety and defense-in-depth into "${concept}". Elite engineering assumes attackers will always probe and find the weakest link in your perimeter.`,
      scores: { logic: 90, simplicity: 85, practicality: 93 }
    },
    {
      id: 'pe_20',
      textAr: (concept) => `لقد وصفت المكونات البرمجية لـ "${concept}"، لكن أين العتاد الصلب؟ الحرارة واستهلاك الواط وتآكل شرائح الذاكرة هي حقائق فيزيائية لا مفر منها في أي معمارية ضخمة.`,
      textEn: (concept) => `You detailed the software layer of "${concept}", but where is the physical silicon? Thermal dissipation, wattage limits, and flash endurance are inescapable physical realities.`,
      scores: { logic: 86, simplicity: 80, practicality: 84 }
    },
    {
      id: 'pe_21',
      textAr: (concept) => `ممتاز! نموذجك لمفهوم "${concept}" يتضمن مقاييس واضحة ومؤشرات أداء لحظية (SLOs). إذا كنت لا تستطيع قياس النظام بالأرقام، فأنت لا تستطيع إدارته ولا تحسينه على الإطلاق.`,
      textEn: (concept) => `Superb! Your model for "${concept}" includes tangible service level objectives (SLOs). If you cannot measure system telemetry numerically, you cannot optimize or manage it!`,
      scores: { logic: 93, simplicity: 87, practicality: 97 }
    },
    {
      id: 'pe_22',
      textAr: (concept) => `توقيت الاستجابة في "${concept}" قد يكون مقبولاً في المتوسط، ولكن ما يهم حقاً هو النسبة المئوية 99 (p99 latency)! المستخدمون في ذيل التوزيع سيعانون من بطء شديد ما لم تخفف التفاوت.`,
      textEn: (concept) => `Average latency on "${concept}" might look respectable, but p99 tail latency is what kills user experience! Customers in the 99th percentile will choke unless you tame tail variance.`,
      scores: { logic: 87, simplicity: 82, practicality: 88 }
    },
    {
      id: 'pe_23',
      textAr: (concept) => `حل عملي ومباشر لـ "${concept}". تجنبت التعقيد المفرط واخترت خوارزمية ذات تعقيد زمني منخفض. البساطة الهندسية هي أعلى درجات المهارة والاحتراف.`,
      textEn: (concept) => `Pragmatic, direct solution for "${concept}". You avoided premature over-engineering and selected low algorithmic time complexity. Simplicity is the pinnacle of engineering art.`,
      scores: { logic: 92, simplicity: 90, practicality: 96 }
    },
    {
      id: 'pe_24',
      textAr: (concept) => `ماذا يحدث عندما تنقطع الكهرباء فجأة أثناء كتابة البيانات في "${concept}"؟ هل تمتلك سجلاً دورياً (WAL) يضمن عدم فساد الملفات واستعادة الحالة السليمة فور عودة التيار؟`,
      textEn: (concept) => `What happens when power cuts abruptly mid-write in "${concept}"? Do you maintain a write-ahead log (WAL) to guarantee zero file corruption and atomic recovery on reboot?`,
      scores: { logic: 88, simplicity: 83, practicality: 90 }
    },
    {
      id: 'pe_25',
      textAr: (concept) => `أنت تفترض أن المستخدمين سيتبعون التعليمات الصحيحة في "${concept}"! مهندس الواقع يعلم أن المستخدمين سيرسلون مدخلات عشوائية وسيحاولون كسر النظام بكل وسيلة. عقم المدخلات دائماً!`,
      textEn: (concept) => `You assume users will follow the happy path in "${concept}"! Real engineers know users will mash buttons and pass malicious payloads. Always sanitize input and validate boundaries!`,
      scores: { logic: 85, simplicity: 86, practicality: 88 }
    },
    {
      id: 'pe_26',
      textAr: (concept) => `أحييك على تقديم خطة تجزئة أفقية لمفهوم "${concept}". توزيع الأحمال عبر عدة خوادم مستقلة هو السبيل الوحيد للبقاء عند حدوث انفجار مفاجئ في حركة المرور.`,
      textEn: (concept) => `I commend your horizontal sharding strategy for "${concept}". Distributing load across partitioned nodes is the only survival path during massive traffic spikes.`,
      scores: { logic: 91, simplicity: 85, practicality: 95 }
    },
    {
      id: 'pe_27',
      textAr: (concept) => `فكرة "${concept}" واعدة، لكنك لم تدرس زمن الإقلاع والتهيئة الأولية. إذا استغرق تشغيل النسخة الاحتياطية خمس دقائق، فسيفوت الأوان وتتعطل الخدمة قبل اكتمال الإقلاع.`,
      textEn: (concept) => `Promising concept for "${concept}", but cold start latency is dangerous. If spinning up a replica container takes five minutes, the cluster will drown before relief arrives.`,
      scores: { logic: 84, simplicity: 82, practicality: 81 }
    },
    {
      id: 'pe_28',
      textAr: (concept) => `معمارية نظيفة لـ "${concept}" تراعي فصل المسؤوليات (Separation of Concerns). هذا يسهل على فرق التطوير صيانة وتحديث كل جزء بشكل منفصل دون خوف من إفساد الأجزاء الأخرى.`,
      textEn: (concept) => `Clean architecture for "${concept}" adhering to strict separation of concerns. This allows modular updates without risking regressions across adjacent subsystems.`,
      scores: { logic: 90, simplicity: 89, practicality: 94 }
    },
    {
      id: 'pe_29',
      textAr: (concept) => `لقد ركزت على تحسين الأداء في "${concept}" قبل التأكد من صحة النتائج وسلامة البيانات! التحسين المبكر هو أصل كل الشرور في هندسة البرمجيات؛ اجعل النظام يعمل بشكل صحيح أولاً ثم حسنه.`,
      textEn: (concept) => `You focused on optimizing "${concept}" before verifying correctness and data integrity! Premature optimization is the root of all engineering evil; make it correct first, then make it fast.`,
      scores: { logic: 82, simplicity: 81, practicality: 85 }
    },
    {
      id: 'pe_30',
      textAr: (concept) => `شرح هندسي استثنائي لـ "${concept}"! يشمل خطة الصيانة، والتكرار الجغرافي، وإدارة الأخطاء المتوقعة. هكذا تبنى الأنظمة الموثوقة التي يعتمد عليها ملايين البشر يومياً.`,
      textEn: (concept) => `Exceptional engineering treatise on "${concept}"! Incorporating geo-redundancy, graceful degradation, and incident response. This is how mission-critical infrastructure is engineered.`,
      scores: { logic: 95, simplicity: 91, practicality: 99 }
    },
    {
      id: 'pe_31',
      textAr: (concept) => `ما هي استراتيجية إدارة المخلفات وتفريغ السجلات في "${concept}"؟ إذا امتلأ القرص الصلب بسجلات الأخطاء فلن يتمكن النظام حتى من بدء التشغيل مجدداً. فكر في الأتمتة الدورية!`,
      textEn: (concept) => `What is the log rotation and tombstone policy in "${concept}"? If disk storage fills with uncompressed telemetry, the daemon won't even reboot. Automate retention lifecycle!`,
      scores: { logic: 86, simplicity: 84, practicality: 89 }
    },
    {
      id: 'pe_32',
      textAr: (concept) => `لقد تجنبت بذكاء فخاخ التزامن القاتلة في "${concept}". استخدام طوابير الرسائل غير المتزامنة يضمن انسيابية العمل ويمنع تجمد واجهات المستخدم تحت الضغط الشديد.`,
      textEn: (concept) => `You cleverly bypassed locking pitfalls in "${concept}". Asynchronous event-driven pipelines prevent thread starvation and keep customer-facing endpoints blazing fast.`,
      scores: { logic: 92, simplicity: 87, practicality: 96 }
    },
    {
      id: 'pe_33',
      textAr: (concept) => `في حال تعطل شبكة الاتصال أثناء تطبيق "${concept}"، كيف تتجنب معضلة انقسام الدماغ (Split-Brain)؟ يجب وجود نظام تصويت وتوافق آراء (Quorum) يحمي سلامة القرار.`,
      textEn: (concept) => `During split-brain network partitions in "${concept}", how do you resolve consensus? You must have leader leases and quorum arbitration to prevent divergent state updates.`,
      scores: { logic: 89, simplicity: 83, practicality: 92 }
    },
    {
      id: 'pe_34',
      textAr: (concept) => `مرافعة عملية مقنعة لمفهوم "${concept}". لقد أثبتت أنك لا تكتفي بفهم النظرية، بل تفكر كمهندس موقع ذي خبرة يحسب حساب الأعطال قبل وقوعها. عمل ممتاز!`,
      textEn: (concept) => `A thoroughly convincing operational defense of "${concept}". You demonstrated that you don't merely understand theory, but anticipate production incidents like a veteran SRE. Great work!`,
      scores: { logic: 94, simplicity: 89, practicality: 98 }
    },
    {
      id: 'pe_35',
      textAr: (concept) => `تحفة هندسية في شرح "${concept}"! توازن متقن بين بساطة المعمارية، ومرونة التوسع، والتكلفة التشغيلية المنخفضة. هذا هو المعيار الذهبي للتطبيق العملي في محكمة فاينمان!`,
      textEn: (concept) => `Masterclass engineering delivery for "${concept}"! Immaculate balance of architectural minimalism, elastic scalability, and cost efficiency. The gold standard of practical reality!`,
      scores: { logic: 96, simplicity: 92, practicality: 100 }
    }
  ]
};

/**
 * Returns a randomized critique for a specific judge from the 105+ replies bank
 */
export function getRandomJudgeCritique(judgeId, concept, isAr) {
  const bank = JUDGE_REPLIES_BANK[judgeId];
  if (!bank || bank.length === 0) return '';
  const idx = Math.floor(Math.random() * bank.length);
  const entry = bank[idx];
  return isAr ? entry.textAr(concept) : entry.textEn(concept);
}

/**
 * Returns a complete set of 3 dynamic critiques + tailored scores from the 105+ bank
 */
export function getRandomTribunalEvaluation(concept, explanation, isAr) {
  const safeConcept = concept || (isAr ? 'المفهوم المختار' : 'this concept');
  const skepticEntry = JUDGE_REPLIES_BANK.skeptic_professor[
    Math.floor(Math.random() * JUDGE_REPLIES_BANK.skeptic_professor.length)
  ];
  const childEntry = JUDGE_REPLIES_BANK.curious_child[
    Math.floor(Math.random() * JUDGE_REPLIES_BANK.curious_child.length)
  ];
  const engineerEntry = JUDGE_REPLIES_BANK.pragmatic_engineer[
    Math.floor(Math.random() * JUDGE_REPLIES_BANK.pragmatic_engineer.length)
  ];

  const wordCount = (explanation || '').trim().split(/\s+/).filter(Boolean).length;
  const lengthBonus = Math.min(8, Math.floor(wordCount / 6));

  return {
    skeptic: isAr ? skepticEntry.textAr(safeConcept) : skepticEntry.textEn(safeConcept),
    child: isAr ? childEntry.textAr(safeConcept) : childEntry.textEn(safeConcept),
    engineer: isAr ? engineerEntry.textAr(safeConcept) : engineerEntry.textEn(safeConcept),
    scores: {
      logic: Math.min(98, Math.max(65, skepticEntry.scores.logic + lengthBonus)),
      simplicity: Math.min(99, Math.max(60, childEntry.scores.simplicity + (wordCount > 40 ? -4 : 6))),
      practicality: Math.min(97, Math.max(68, engineerEntry.scores.practicality + lengthBonus)),
    },
    isAI: false,
    provider: isAr ? 'بنك الردود المعرفية (105+ رد)' : 'Cognitive Reply Bank (105+ Variations)'
  };
}
