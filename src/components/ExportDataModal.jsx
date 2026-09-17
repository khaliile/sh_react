import React, { useState, useMemo, useEffect } from 'react';
import {
  FaDownload,
  FaFileCsv,
  FaFileCode,
  FaFileAlt,
  FaCopy,
  FaCheck,
  FaTimes,
  FaCalendarDay,
  FaCalendarWeek,
  FaDatabase,
  FaChartPie,
  FaClock
} from 'react-icons/fa';
import {
  getDailyExportData,
  getWeeklyExportData,
  formatDataAsMarkdown,
  formatDataAsCSV,
  downloadFile
} from '../utils/exportService';
import { todayKey, currentWeekKey } from '../utils/dateKey';

export default function ExportDataModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'backup'
  const [copied, setCopied] = useState(false);

  // Lock background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  const dailyData = useMemo(() => getDailyExportData(), [isOpen, activeTab]);
  const weeklyData = useMemo(() => getWeeklyExportData(), [isOpen, activeTab]);

  if (!isOpen) return null;

  const currentData = activeTab === 'daily' ? dailyData : weeklyData;

  const handleCopyReport = () => {
    let textToCopy = '';
    if (activeTab === 'backup') {
      const fullBackup = {
        exportedAt: new Date().toISOString(),
        studyLog: JSON.parse(localStorage.getItem('app_study_log') || '{}'),
        progressState: JSON.parse(localStorage.getItem('app_progress_state') || '{}'),
        rpgStats: JSON.parse(localStorage.getItem('rpg_stats_unified') || '{}'),
        quests: JSON.parse(localStorage.getItem('quest_log_quests') || '[]'),
        goals: {
          dailyGoal: localStorage.getItem('app_daily_study_goal_hours') || '5',
          weeklyGoal: localStorage.getItem('app_weekly_goal_hours') || '56',
        }
      };
      textToCopy = JSON.stringify(fullBackup, null, 2);
    } else {
      textToCopy = formatDataAsMarkdown(currentData);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    if (activeTab === 'backup') {
      const fullBackup = {
        exportedAt: new Date().toISOString(),
        studyLog: JSON.parse(localStorage.getItem('app_study_log') || '{}'),
        progressState: JSON.parse(localStorage.getItem('app_progress_state') || '{}'),
        rpgStats: JSON.parse(localStorage.getItem('rpg_stats_unified') || '{}'),
        quests: JSON.parse(localStorage.getItem('quest_log_quests') || '[]'),
        goals: {
          dailyGoal: localStorage.getItem('app_daily_study_goal_hours') || '5',
          weeklyGoal: localStorage.getItem('app_weekly_goal_hours') || '56',
        }
      };
      downloadFile(JSON.stringify(fullBackup, null, 2), `studyhub-full-backup-${todayKey()}.json`, 'application/json');
      return;
    }

    const filename = activeTab === 'daily'
      ? `study-daily-${dailyData.date}.json`
      : `study-weekly-${weeklyData.weekKey}.json`;

    downloadFile(JSON.stringify(currentData, null, 2), filename, 'application/json');
  };

  const handleDownloadCSV = () => {
    if (activeTab === 'backup') return;
    const csvContent = formatDataAsCSV(currentData);
    const filename = activeTab === 'daily'
      ? `study-daily-${dailyData.date}.csv`
      : `study-weekly-${weeklyData.weekKey}.csv`;

    downloadFile(csvContent, filename, 'text/csv');
  };

  const handleDownloadMD = () => {
    if (activeTab === 'backup') return;
    const mdContent = formatDataAsMarkdown(currentData);
    const filename = activeTab === 'daily'
      ? `study-daily-${dailyData.date}.md`
      : `study-weekly-${weeklyData.weekKey}.md`;

    downloadFile(mdContent, filename, 'text/markdown');
  };

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-header-title">
            <FaDownload className="export-header-icon" />
            <div>
              <h2>Export Study Data</h2>
              <p>Download or copy your daily and weekly study logs & analytics</p>
            </div>
          </div>
          <button className="export-close-btn" onClick={onClose} aria-label="Close export modal">
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="export-tabs">
          <button
            className={`export-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <FaCalendarDay /> Daily Report ({dailyData.weekday})
          </button>
          <button
            className={`export-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <FaCalendarWeek /> Weekly Report ({weeklyData.weekKey})
          </button>
          <button
            className={`export-tab ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <FaDatabase /> Full JSON Backup
          </button>
        </div>

        {/* Content Body */}
        <div className="export-modal-body">
          {activeTab !== 'backup' ? (
            <>
              {/* Stat Highlights */}
              <div className="export-metrics-grid">
                <div className="export-metric-card primary">
                  <span className="metric-label">
                    <FaClock /> {activeTab === 'daily' ? "Today's Study Time" : 'Weekly Total'}
                  </span>
                  <span className="metric-value">{currentData.summary.totalHoursFormatted}</span>
                  <span className="metric-sub">
                    {currentData.summary.totalMinutes} total minutes logged
                  </span>
                </div>

                <div className="export-metric-card">
                  <span className="metric-label">Target Completion</span>
                  <span className="metric-value">{currentData.summary.goalProgressPct}%</span>
                  <span className="metric-sub">
                    Goal: {activeTab === 'daily' ? `${currentData.summary.dailyGoalHours}h / day` : `${currentData.summary.weeklyGoalHours}h / week`}
                  </span>
                </div>

                <div className="export-metric-card">
                  <span className="metric-label">Scholar Level</span>
                  <span className="metric-value">Lv.{currentData.rpg.level}</span>
                  <span className="metric-sub">{currentData.rpg.character} · {currentData.rpg.rankTitle}</span>
                </div>
              </div>

              {/* Subject Breakdown Preview */}
              <div className="export-breakdown-box">
                <div className="breakdown-header">
                  <FaChartPie /> <span>Subject Breakdown</span>
                </div>
                <div className="breakdown-pills">
                  <div className="breakdown-pill math">
                    <span> Math:</span> <strong>{currentData.categoryBreakdown.math.formatted}</strong>
                  </div>
                  <div className="breakdown-pill ds">
                    <span> Data Science:</span> <strong>{currentData.categoryBreakdown.dataScience.formatted}</strong>
                  </div>
                  <div className="breakdown-pill english">
                    <span> English:</span> <strong>{currentData.categoryBreakdown.english.formatted}</strong>
                  </div>
                  <div className="breakdown-pill routine">
                    <span> Routine:</span> <strong>{currentData.categoryBreakdown.routine.formatted}</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="export-backup-info">
              <FaDatabase style={{ fontSize: '2.5rem', color: '#38bdf8', marginBottom: '12px' }} />
              <h3>Full Lifetime Database Snapshot</h3>
              <p>
                Exports all stored data including study logs, checklist histories, quest states,
                RPG levels, and character stats in a single JSON structure.
              </p>
            </div>
          )}

          {/* Action Download Buttons */}
          <div className="export-actions-panel">
            <span className="actions-label">Select Export Format:</span>
            <div className="export-buttons-row">
              <button className="export-btn btn-json" onClick={handleDownloadJSON}>
                <FaFileCode /> Download .JSON
              </button>

              {activeTab !== 'backup' && (
                <>
                  <button className="export-btn btn-csv" onClick={handleDownloadCSV}>
                    <FaFileCsv /> Download .CSV (Excel)
                  </button>

                  <button className="export-btn btn-md" onClick={handleDownloadMD}>
                    <FaFileAlt /> Download .MD (Markdown)
                  </button>
                </>
              )}

              <button className={`export-btn btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyReport}>
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
