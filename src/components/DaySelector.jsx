import { daysOfWeek } from '../data/constants';

export default function DaySelector({ currentDay, setCurrentDay }) {
  return (
    <div className="filter-container">
      {daysOfWeek.map(day => (
        <button key={day} className={`filter-btn ${currentDay === day ? 'active' : ''}`} onClick={() => setCurrentDay(day)}>
          {day}
        </button>
      ))}
    </div>
  );
}