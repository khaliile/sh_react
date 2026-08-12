import { useTimeTracker } from '../hooks/useAppHooks';
import BrainWakeup from '../components/BrainWakeup';
import StudyPassport from '../components/StudyPassport';
import ShadowRival from '../components/ShadowRival';
import DailySpin from '../components/DailySpin';

export default function ArenaPage() {
  const { log } = useTimeTracker();

  return (
    <section className="arena-container">
      <header className="arena-header">
        <h1>Arena</h1>
        <p className="arena-header-sub">Daily challenges, rivalries, and achievements beyond your schedule.</p>
      </header>

      <div className="arena-grid">
        <BrainWakeup />
        <DailySpin />
        <ShadowRival log={log} />
        <StudyPassport log={log} />
      </div>
    </section>
  );
}
