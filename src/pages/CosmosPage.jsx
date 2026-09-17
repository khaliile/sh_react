import StudyAura from '../components/StudyAura';
import EntropyScore from '../components/EntropyScore';
import MirrorMode from '../components/MirrorMode';
import SleepDebt from '../components/SleepDebt';
import CloneBestDay from '../components/CloneBestDay';
import DeadHoursGraveyard from '../components/DeadHoursGraveyard';
import StudyFootprint from '../components/StudyFootprint';
import StudyMomentum from '../components/StudyMomentum';
import { useLanguage } from '../contexts/LanguageContext';

export default function CosmosPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  return (
    <section className="cosmos-container">
      <header className="cosmos-header">
        <div className="cosmos-header-text">
          <h1>{t('cosmos.title')}</h1>
          <p className="cosmos-header-sub">
            {t('cosmos.subtitle')}
          </p>
        </div>
        <div className="cosmos-header-badge">{isAr ? 'تجريبي' : 'EXPERIMENTAL'}</div>
      </header>

      <div className="cosmos-grid">
        <StudyAura />
        <EntropyScore />
        <StudyMomentum />
        <MirrorMode />
        <SleepDebt />
        <CloneBestDay />
        <div className="cosmos-full-width">
          <DeadHoursGraveyard />
        </div>
        <div className="cosmos-full-width">
          <StudyFootprint />
        </div>
      </div>
    </section>
  );
}
