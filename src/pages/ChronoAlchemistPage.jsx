import React, { useState, useMemo } from 'react';
import {
  FaFire, FaFlask, FaMagic, FaPlus, FaTrash,
  FaBolt, FaShieldAlt, FaClock, FaStar, FaCheckCircle
} from 'react-icons/fa';
import { GiCauldron, GiPotionBall } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './ChronoAlchemistPage.css';

const REAGENTS = [
  { id: 'mercury',  nameEn: 'Mercury of Logic',    nameAr: 'زئبق المنطق',     color: '#818cf8', source: isRTL => isRTL ? 'رياضيات — 60 دقيقة' : '60 min Math',        icon: <FaBolt /> },
  { id: 'essence',  nameEn: 'Essence of Patterns', nameAr: 'جوهر الأنماط',    color: '#22d3ee', source: isRTL => isRTL ? 'علوم بيانات — 45 دقيقة' : '45 min Data Sci', icon: <FaStar /> },
  { id: 'aether',   nameEn: 'Aether of Pure Flow', nameAr: 'أثير التدفق النقي', color: '#a855f7', source: isRTL => isRTL ? 'عمل عميق — 90 دقيقة' : '90 min Deep Work', icon: <FaMagic /> },
  { id: 'ember',    nameEn: 'Ember of Discipline', nameAr: 'جمرة الانضباط',   color: '#f97316', source: isRTL => isRTL ? 'سلسلة 7 أيام' : '7-day streak',            icon: <FaFire /> },
];

const RECIPES = [
  {
    id: 'iron_will',
    nameEn: 'Elixir of Iron Will', nameAr: 'إكسير الإرادة الحديدية',
    descEn: 'Protects your streak from 1 life emergency — no penalty if you miss a day.',
    descAr: 'يحمي سلسلتك من طارئ واحد — لا عقوبة إذا فاتتك يوم دراسة.',
    ingredients: ['mercury', 'ember'],
    color: '#f59e0b', icon: <FaShieldAlt />,
    effect: isRTL => isRTL ? 'حماية السلسلة × 1 يوم' : 'Streak Shield × 1 day',
  },
  {
    id: 'double_focus',
    nameEn: 'Potion of Double Focus', nameAr: 'جرعة التركيز المضاعف',
    descEn: 'Doubles XP earned for the next 24 hours of study.',
    descAr: 'يضاعف نقاط XP المكتسبة خلال 24 ساعة من المذاكرة.',
    ingredients: ['aether', 'essence'],
    color: '#4ade80', icon: <FaBolt />,
    effect: isRTL => isRTL ? '×2 نقاط XP لمدة 24 ساعة' : '×2 XP for 24 hours',
  },
  {
    id: 'grand_clarity',
    nameEn: 'Grand Clarity Tonic', nameAr: 'تونيك الصفاء الكبير',
    descEn: 'Clears mental fog — unlocks a random Memory Palace room review.',
    descAr: 'يبدد ضباب الذهن — يفتح مراجعة عشوائية في قصر الذاكرة.',
    ingredients: ['mercury', 'aether', 'essence'],
    color: '#22d3ee', icon: <GiPotionBall />,
    effect: isRTL => isRTL ? 'مراجعة عشوائية في قصر الذاكرة' : 'Random Memory Palace review',
  },
  {
    id: 'philosophers_stone',
    nameEn: "Philosopher's Stone Shard", nameAr: 'شظية حجر الفلاسفة',
    descEn: 'Converts 200 study coins into a rare avatar cosmetic upgrade.',
    descAr: 'تحوّل 200 عملة دراسة إلى ترقية نادرة لزي الشخصية.',
    ingredients: ['mercury', 'essence', 'aether', 'ember'],
    color: '#a855f7', icon: <FaMagic />,
    effect: isRTL => isRTL ? '+200 عملة → تحسين نادر للزي' : '+200 coins → rare cosmetic',
  },
];

function loadInventory() {
  try { return JSON.parse(localStorage.getItem('alchemist_inventory') || '{}'); }
  catch { return {}; }
}
function saveInventory(data) {
  try { localStorage.setItem('alchemist_inventory', JSON.stringify(data)); } catch {}
}
function loadBrewed() {
  try { return JSON.parse(localStorage.getItem('alchemist_brewed') || '[]'); }
  catch { return []; }
}
function saveBrewed(data) {
  try { localStorage.setItem('alchemist_brewed', JSON.stringify(data)); } catch {}
}

export default function ChronoAlchemistPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const [inventory, setInventory] = useState(loadInventory);
  const [brewed, setBrewed] = useState(loadBrewed);
  const [cauldron, setCauldron] = useState([]);
  const [brewMsg, setBrewMsg] = useState(null);

  // Compute available reagents from study data
  const available = useMemo(() => {
    const hrs = data.totalHours || 0;
    const streak = data.streak || 0;
    return {
      mercury: Math.floor(hrs / 1) + (inventory.mercury || 0),
      essence: Math.floor(hrs / 0.75) + (inventory.essence || 0),
      aether:  Math.floor(hrs / 1.5) + (inventory.aether || 0),
      ember:   Math.floor(streak / 7) + (inventory.ember || 0),
    };
  }, [data, inventory]);

  const addToCauldron = (id) => {
    if (cauldron.length >= 4) return;
    setCauldron(prev => [...prev, id]);
  };

  const removeFromCauldron = (idx) => {
    setCauldron(prev => prev.filter((_, i) => i !== idx));
  };

  const tryBrew = () => {
    const sorted = [...cauldron].sort().join(',');
    const match = RECIPES.find(r => [...r.ingredients].sort().join(',') === sorted);
    if (match) {
      const newBrewed = [{ id: match.id, brewedAt: Date.now() }, ...brewed];
      setBrewed(newBrewed);
      saveBrewed(newBrewed);
      setBrewMsg({ success: true, recipe: match });
    } else {
      setBrewMsg({ success: false });
    }
    setCauldron([]);
    setTimeout(() => setBrewMsg(null), 4000);
  };

  return (
    <div className={`chrono-alchemist ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="ca-header">
        <h1>
          <GiCauldron style={{ display: 'inline', marginRight: isRTL ? 0 : '0.5rem', marginLeft: isRTL ? '0.5rem' : 0, verticalAlign: 'middle' }} />
          {isRTL ? 'مختبر الكيمياء الزمنية' : 'Chrono-Alchemist Lab'}
        </h1>
        <p>
          {isRTL
            ? 'حوّل ساعات مذاكرتك إلى مكونات سحرية واطبخ جرعات تعزّز رحلتك الدراسية'
            : 'Transform your study hours into magical reagents — brew elixirs that supercharge your journey'}
        </p>
        <span className="ca-badge">
          <GiCauldron style={{ marginRight: '0.3rem' }} />
          {isRTL ? `${brewed.length} جرعة مطبوخة` : `${brewed.length} Potions Brewed`}
        </span>
      </div>

      {/* Brew Message */}
      {brewMsg && (
        <div className={`ca-brew-msg ${brewMsg.success ? 'success' : 'fail'}`}>
          {brewMsg.success ? (
            <>
              <FaCheckCircle />
              {isRTL
                ? `تهانينا! طبخت "${brewMsg.recipe.nameAr}" بنجاح! التأثير: ${brewMsg.recipe.effect(true)}`
                : `Success! You brewed "${brewMsg.recipe.nameEn}"! Effect: ${brewMsg.recipe.effect(false)}`}
            </>
          ) : (
            <>
              <FaFlask />
              {isRTL ? 'المكونات لا تتطابق مع أي وصفة معروفة — جرّب تركيبة أخرى!' : 'No matching recipe — try a different combination!'}
            </>
          )}
        </div>
      )}

      <div className="ca-main-grid">
        {/* Left: Reagents */}
        <div className="ca-reagents-panel">
          <div className="ca-panel-title">
            <FaFlask />
            {isRTL ? 'مخزن المكونات السحرية' : 'Reagent Stockpile'}
          </div>
          <div className="ca-study-note">
            {isRTL
              ? `إجمالي الساعات المسجلة: ${Math.round(data.totalHours || 0)} س — السلسلة: ${data.streak || 0} يوم`
              : `Logged hours: ${Math.round(data.totalHours || 0)}h — Streak: ${data.streak || 0}d`}
          </div>
          <div className="ca-reagents-list">
            {REAGENTS.map(r => (
              <div key={r.id} className="ca-reagent-card" style={{ '--r-color': r.color }}>
                <div className="ca-reagent-icon" style={{ color: r.color }}>{r.icon}</div>
                <div className="ca-reagent-info">
                  <div className="ca-reagent-name">{isRTL ? r.nameAr : r.nameEn}</div>
                  <div className="ca-reagent-source">{r.source(isRTL)}</div>
                </div>
                <div className="ca-reagent-qty" style={{ color: r.color }}>×{available[r.id] || 0}</div>
                <button
                  className="ca-add-cauldron-btn"
                  onClick={() => addToCauldron(r.id)}
                  disabled={cauldron.length >= 4}
                  style={{ borderColor: r.color, color: r.color }}
                >
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Cauldron */}
        <div className="ca-cauldron-panel">
          <div className="ca-cauldron-visual">
            <GiCauldron className="ca-cauldron-icon" />
            <div className="ca-cauldron-slots">
              {cauldron.map((rId, i) => {
                const r = REAGENTS.find(x => x.id === rId);
                return (
                  <div key={i} className="ca-slot" style={{ color: r.color, borderColor: r.color }}>
                    {r.icon}
                    <button className="ca-slot-remove" onClick={() => removeFromCauldron(i)}>
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
              {Array.from({ length: 4 - cauldron.length }).map((_, i) => (
                <div key={`empty-${i}`} className="ca-slot empty">
                  <span>?</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="ca-brew-btn"
            onClick={tryBrew}
            disabled={cauldron.length < 2}
          >
            <FaFire />
            {isRTL ? 'ابدأ الطبخ' : 'Brew!'}
          </button>
        </div>

        {/* Right: Recipes */}
        <div className="ca-recipes-panel">
          <div className="ca-panel-title">
            <GiPotionBall />
            {isRTL ? 'وصفات الجرعات المعروفة' : 'Known Recipes'}
          </div>
          <div className="ca-recipes-list">
            {RECIPES.map(recipe => {
              const isBrewed = brewed.some(b => b.id === recipe.id);
              return (
                <div key={recipe.id} className={`ca-recipe-card ${isBrewed ? 'brewed' : ''}`} style={{ '--r-color': recipe.color }}>
                  <div className="ca-recipe-icon" style={{ color: recipe.color }}>{recipe.icon}</div>
                  <div className="ca-recipe-info">
                    <div className="ca-recipe-name">{isRTL ? recipe.nameAr : recipe.nameEn}</div>
                    <div className="ca-recipe-ingredients">
                      {recipe.ingredients.map(iId => {
                        const ing = REAGENTS.find(r => r.id === iId);
                        return (
                          <span key={iId} className="ca-ingredient-pill" style={{ borderColor: ing.color, color: ing.color }}>
                            {isRTL ? ing.nameAr : ing.nameEn}
                          </span>
                        );
                      })}
                    </div>
                    <div className="ca-recipe-effect">{recipe.effect(isRTL)}</div>
                  </div>
                  {isBrewed && <FaCheckCircle className="ca-brewed-check" style={{ color: recipe.color }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
