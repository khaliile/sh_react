import StudyAura from '../components/StudyAura';
import EntropyScore from '../components/EntropyScore';
import MirrorMode from '../components/MirrorMode';
import SleepDebt from '../components/SleepDebt';
import CloneBestDay from '../components/CloneBestDay';
import DeadHoursGraveyard from '../components/DeadHoursGraveyard';
import StudyFootprint from '../components/StudyFootprint';

export default function CosmosPage() {
  return (
    <section className="cosmos-container">
      <header className="cosmos-header">
        <div className="cosmos-header-text">
          <h1>Cosmos</h1>
          <p className="cosmos-header-sub">
            7 experimental features that see through your data — and reflect it back.
          </p>
        </div>
        <div className="cosmos-header-badge">EXPERIMENTAL</div>
      </header>

      <div className="cosmos-grid">
        <StudyAura />
        <EntropyScore />
        <MirrorMode />
        <SleepDebt />
        <CloneBestDay />
        <DeadHoursGraveyard />
        <div className="cosmos-full-width">
          <StudyFootprint />
        </div>
      </div>
    </section>
  );
}
