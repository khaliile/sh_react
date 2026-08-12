import { useMemo } from 'react';
import { roadmapsData } from '../data/constants';
import ProgressChart from '../components/ProgressChart'; // تأكد إن الملف ده موجود في components

export default function RoadmapPage({ type, currentDay, checkedItems, toggleCheck }) {
  const roadmap = roadmapsData[type];
  
  // حماية في حالة لو النوع مش موجود
  if (!roadmap) return <section className="focus-card"><h1>Page not found</h1></section>;
  
  const dayData = roadmap[currentDay];
  
  // حساب الـ Progress
  const { total, completed, percentage } = useMemo(() => {
    if (!dayData || !dayData.tasks) return { total: 0, completed: 0, percentage: 0 };
    const tot = dayData.tasks.length;
    let comp = dayData.tasks.filter((_, idx) => checkedItems[`${type}-${currentDay}-${idx}`]).length;
    return { 
      total: tot, 
      completed: comp, 
      percentage: tot > 0 ? (comp / tot) * 100 : 0 
    };
  }, [dayData, checkedItems, type, currentDay]);

  if (!dayData) return <section className="focus-card"><h1>No tasks for this day</h1></section>;

  return (
    <section className="focus-card roadmap-card">
      <header className="card-header roadmap-header">
        <div>
          <span className={`category-tag tag-${roadmap.theme}`}>{dayData.cat || roadmap.title}</span>
          <h1 className="roadmap-main-title">{roadmap.title}</h1>
          <p className="roadmap-sub-title">Tasks for {currentDay}</p>
        </div>
        <div className="roadmap-progress-badge">
          <span className="rpb-pct">{Math.round(percentage)}%</span>
          <span className="rpb-lbl">completed</span>
        </div>
      </header>

      <div className="task-list-container">
        {dayData.tasks.map((task, idx) => {
          const id = `${type}-${currentDay}-${idx}`;
          const isDone = !!checkedItems[id];
          return (
            <div key={idx} className={`task-row ${isDone ? 'completed' : ''}`}>
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleCheck(id)}
                />
                <span className={`custom-checkbox border-${roadmap.theme}`}></span>
              </label>
              <label className="task-label" onClick={() => toggleCheck(id)}>{task}</label>
            </div>
          );
        })}
      </div>

      <footer className="progress-footer">
        <ProgressChart completed={completed} total={total} />
        <div className="progress-info-col">
          <div className="progress-track">
            <div
              className={`progress-fill bg-${roadmap.theme}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="progress-stats">{completed} of {total} tasks completed today</span>
        </div>
      </footer>
    </section>
  );
}