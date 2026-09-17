import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaDownload,
  FaFileCsv,
  FaFileCode,
  FaFileAlt,
  FaCopy,
  FaCheck,
  FaClock,
  FaBullseye,
  FaFire,
  FaChartPie,
  FaGraduationCap,
  FaTasks
} from 'react-icons/fa';
import {
  getDailyExportData,
  getWeeklyExportData,
  getMonthlyExportData,
  formatDataAsMarkdown,
  formatDataAsCSV,
  downloadFile
} from '../utils/exportService';
import CognitiveFatigue from '../components/CognitiveFatigue';
import DistractionDNA from '../components/DistractionDNA';
import LevelForecast from '../components/LevelForecast';
import StudyDNAHelix from '../components/StudyDNAHelix';
import StudyVelocity from '../components/StudyVelocity';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORY_COLORS = {
  math: '#3b82f6',
  dataScience: '#10b981',
  english: '#f59e0b',
  routine: '#8b5cf6',
  other: '#ec4899',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AnalyticsPage = React.memo(function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [copied, setCopied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  // Day name translations
  const translateDayName = (englishDay) => {
    const dayMap = {
      'Monday': isAr ? 'الاثنين' : 'Monday',
      'Tuesday': isAr ? 'الثلاثاء' : 'Tuesday',
      'Wednesday': isAr ? 'الأربعاء' : 'Wednesday',
      'Thursday': isAr ? 'الخميس' : 'Thursday',
      'Friday': isAr ? 'الجمعة' : 'Friday',
      'Saturday': isAr ? 'السبت' : 'Saturday',
      'Sunday': isAr ? 'الأحد' : 'Sunday',
    };
    return dayMap[englishDay] || englishDay;
  };

  // Rank title translations
  const translateRankTitle = (englishRank) => {
    const rankMap = {
      'Novice Scholar': isAr ? 'باحث مبتدئ' : 'Novice Scholar',
      'Apprentice Scholar': isAr ? 'باحث متدرب' : 'Apprentice Scholar',
      'Expert Scholar': isAr ? 'باحث خبير' : 'Expert Scholar',
      'Master Scholar': isAr ? 'باحث متقن' : 'Master Scholar',
      'Legendary Scholar': isAr ? 'باحث أسطوري' : 'Legendary Scholar',
    };
    return rankMap[englishRank] || englishRank;
  };

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      setCurrentTheme(theme);
    };
    
    detectTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme-aware colors
  const isLight = currentTheme === 'light';
  const tooltipBg = isLight ? '#ffffff' : '#0f172a';
  const tooltipBorder = isLight ? '#e2e8f0' : '#334155';
  const tooltipTextColor = isLight ? '#0f172a' : '#f1f5f9';
  const gridStroke = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
  const axisStroke = isLight ? '#475569' : '#64748b';

  // Load fresh data only for the selected timeframe
  const activeData = useMemo(() => {
    let data;
    if (timeframe === 'daily') data = getDailyExportData();
    else if (timeframe === 'weekly') data = getWeeklyExportData();
    else data = getMonthlyExportData();
    
    // Translate day names in dailyBreakdown
    if (data.dailyBreakdown) {
      data.dailyBreakdown = data.dailyBreakdown.map(day => ({
        ...day,
        fullWeekday: translateDayName(day.fullWeekday)
      }));
    }
    
    return data;
  }, [timeframe, isAr]);

  // Pie chart category data preparation
  const categoryChartData = useMemo(() => {
    const cats = activeData.categoryBreakdown;
    return [
      { name: isAr ? 'الرياضيات' : 'Mathematics', value: cats.math.minutes, color: CATEGORY_COLORS.math },
      { name: isAr ? 'علم البيانات' : 'Data Science', value: cats.dataScience.minutes, color: CATEGORY_COLORS.dataScience },
      { name: isAr ? 'الإنجليزية' : 'English', value: cats.english.minutes, color: CATEGORY_COLORS.english },
      { name: isAr ? 'كتل الروتين' : 'Routine Blocks', value: cats.routine.minutes, color: CATEGORY_COLORS.routine },
      { name: isAr ? 'أخرى' : 'Other', value: cats.other.minutes, color: CATEGORY_COLORS.other },
    ].filter(item => item.value > 0);
  }, [activeData, isAr]);

  // Hourly timeline for daily view
  const dailyHourlyData = useMemo(() => {
    if (timeframe !== 'daily') return [];
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      minutes: 0,
    }));

    (activeData.sessions || []).forEach(s => {
      if (s.timestamp) {
        const h = new Date(s.timestamp).getHours();
        if (hours[h]) hours[h].minutes += s.minutes;
      }
    });

    // If no specific timestamps, distribute evenly or show session buckets
    if (hours.every(h => h.minutes === 0) && activeData.sessions.length > 0) {
      activeData.sessions.forEach((s, idx) => {
        const slot = (9 + idx * 2) % 24;
        hours[slot].minutes += s.minutes;
      });
    }

    return hours.filter((_, i) => i >= 6 && i <= 23); // Active waking hours
  }, [timeframe, activeData]);

  // Export actions
  const handleCopy = () => {
    const md = formatDataAsMarkdown(activeData);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const filename = `study-analytics-${timeframe}-${activeData.date || activeData.weekKey || activeData.monthName}.json`;
    downloadFile(JSON.stringify(activeData, null, 2), filename, 'application/json');
  };

  const handleDownloadCSV = () => {
    const csv = formatDataAsCSV(activeData);
    const filename = `study-analytics-${timeframe}-${activeData.date || activeData.weekKey || activeData.monthName}.csv`;
    downloadFile(csv, filename, 'text/csv');
  };

  const handleDownloadMD = () => {
    const md = formatDataAsMarkdown(activeData);
    const filename = `study-analytics-${timeframe}-${activeData.date || activeData.weekKey || activeData.monthName}.md`;
    downloadFile(md, filename, 'text/markdown');
  };

  return (
    <div className="analytics-page-container">
      {/* Top Header */}
      <header className="analytics-header">
        <div className="analytics-header-title">
          <div className="analytics-icon-badge">
            <FaChartLine />
          </div>
          <div>
            <h1>{t('analytics.title')}</h1>
            <p className="analytics-subtitle">
              {t('analytics.subtitle')}
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="analytics-timeframe-switch">
          <button
            className={`timeframe-pill ${timeframe === 'daily' ? 'active' : ''}`}
            onClick={() => setTimeframe('daily')}
          >
            <FaCalendarDay /> {t('analytics.daily')}
          </button>
          <button
            className={`timeframe-pill ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            <FaCalendarWeek /> {t('analytics.weekly')}
          </button>
          <button
            className={`timeframe-pill ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            <FaCalendarAlt /> {t('analytics.monthly')}
          </button>
        </div>
      </header>

      {/* Export Quick Bar */}
      <div className="analytics-export-bar">
        <div className="export-bar-label">
          <div className="export-icon-badge">
            <FaDownload />
          </div>
          <div className="export-label-content">
            <span className="export-bar-title">
              {timeframe === 'daily' 
                ? t('analytics.exportDaily') 
                : timeframe === 'weekly' 
                  ? t('analytics.exportWeekly') 
                  : t('analytics.exportMonthly')}
            </span>
            <span className="export-period-tag">
              {timeframe === 'daily' 
                ? (isAr ? 'يومي' : 'Daily') 
                : timeframe === 'weekly' 
                  ? (isAr ? 'أسبوعي' : 'Weekly') 
                  : (isAr ? 'شهري' : 'Monthly')}
            </span>
          </div>
        </div>
        <div className="export-bar-actions">
          <button className="quick-export-btn csv" onClick={handleDownloadCSV} title="Export as Excel / CSV">
            <FaFileCsv />
            <span>{t('analytics.csvSpreadsheet')}</span>
          </button>
          <button className="quick-export-btn json" onClick={handleDownloadJSON} title="Export raw JSON dataset">
            <FaFileCode />
            <span>{t('analytics.jsonData')}</span>
          </button>
          <button className="quick-export-btn md" onClick={handleDownloadMD} title="Export Markdown summary">
            <FaFileAlt />
            <span>{t('analytics.markdownReport')}</span>
          </button>
          <button className={`quick-export-btn copy ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy formatted summary to clipboard">
            {copied ? <FaCheck /> : <FaCopy />}
            <span>{copied ? t('analytics.copied') : t('analytics.copySummary')}</span>
          </button>
        </div>
      </div>

      {/* Key Metric Highlights Grid */}
      <div className="analytics-metrics-grid">
        <div className="metric-glow-card primary">
          <div className="card-top">
            <span className="card-tag"><FaClock /> {t('analytics.totalLoggedTime')}</span>
            <span className="card-badge">
              {timeframe === 'daily' ? t('analytics.today') : timeframe === 'weekly' ? t('analytics.thisWeek') : t('analytics.past30Days')}
            </span>
          </div>
          <div className="card-main-val">{activeData.summary.totalHoursFormatted}</div>
          <div className="card-sub-info">
            {activeData.summary.totalMinutes} {t('analytics.totalFocusMin')}
          </div>
        </div>

        <div className="metric-glow-card success">
          <div className="card-top">
            <span className="card-tag"><FaBullseye /> {t('analytics.goalCompletion')}</span>
            <span className="card-badge">{t('analytics.targetPace')}</span>
          </div>
          <div className="card-main-val">{activeData.summary.goalProgressPct}%</div>
          <div className="card-sub-info">
            {timeframe === 'daily' && `${t('analytics.target')}: ${activeData.summary.dailyGoalHours}h / day`}
            {timeframe === 'weekly' && `${t('analytics.target')}: ${activeData.summary.weeklyGoalHours}h / week`}
            {timeframe === 'monthly' && `${t('analytics.target')}: ${activeData.summary.monthlyGoalHours}h / month`}
          </div>
        </div>

        <div className="metric-glow-card warning">
          <div className="card-top">
            <span className="card-tag"><FaFire /> {t('analytics.consistencyActivity')}</span>
            <span className="card-badge">{t('analytics.streak')}</span>
          </div>
          <div className="card-main-val">
            {timeframe === 'daily'
              ? `${activeData.summary.sessionsCount} ${isAr ? 'جلسات' : 'Sessions'}`
              : timeframe === 'weekly'
                ? `${activeData.summary.activeDaysCount} / 7 ${t('common.days')}`
                : `${activeData.summary.consistencyRatePct}% ${isAr ? 'نشط' : 'Active'}`}
          </div>
          <div className="card-sub-info">
            {timeframe === 'monthly'
              ? `${activeData.summary.activeDaysCount} ${isAr ? 'من 30' : 'of 30'} ${t('common.days')} ${isAr ? 'نشط' : 'active'}`
              : `${t('analytics.avgPerActiveDay', { n: activeData.summary.averageDailyFormatted || activeData.summary.totalHoursFormatted })}`}
          </div>
        </div>

        <div className="metric-glow-card purple">
          <div className="card-top">
            <span className="card-tag"><FaGraduationCap /> {t('analytics.scholarStatus')}</span>
            <span className="card-badge">{t('analytics.rpg')}</span>
          </div>
          <div className="card-main-val">{isAr ? `المستوى ${activeData.rpg.level}` : `Lv.${activeData.rpg.level}`}</div>
          <div className="card-sub-info">
            {activeData.rpg.character} · {translateRankTitle(activeData.rpg.rankTitle)}
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="analytics-charts-grid">
        {/* Main Progression Chart */}
        <div className="analytics-chart-card main-chart">
          <div className="chart-card-header">
            <h3>
              {timeframe === 'daily' && t('analytics.hourlyFocus')}
              {timeframe === 'weekly' && t('analytics.weeklyProgChart')}
              {timeframe === 'monthly' && t('analytics.monthlyActivity')}
            </h3>
            <span className="chart-header-sub">
              {timeframe === 'daily' && `${activeData.formattedDate}`}
              {timeframe === 'weekly' && `${activeData.dateRange}`}
              {timeframe === 'monthly' && `${activeData.dateRange}`}
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              {timeframe === 'daily' ? (
                <BarChart data={dailyHourlyData}>
                  <defs>
                    <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={isLight ? 0.7 : 0.9} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={isLight ? 0.4 : 0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="hour" stroke={axisStroke} tick={{ fontSize: 11, fill: axisStroke }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11, fill: axisStroke }} tickFormatter={v => `${v}m`} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: 8 }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 600 }}
                    itemStyle={{ color: tooltipTextColor }}
                    cursor={{ fill: isLight ? '#bfdbfe' : '#60a5fa' }}
                    formatter={v => [`${v} mins`, isAr ? 'وقت الدراسة' : 'Study Time']}
                  />
                  <Bar dataKey="minutes" fill="url(#hourlyGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : timeframe === 'weekly' ? (
                <BarChart data={activeData.dailyBreakdown}>
                  <defs>
                    <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={isLight ? 0.8 : 0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={isLight ? 0.5 : 0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="fullWeekday" stroke={axisStroke} tick={{ fontSize: 11, fill: axisStroke }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11, fill: axisStroke }} tickFormatter={v => `${Math.round(v / 60)}h`} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: 8 }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 600 }}
                    itemStyle={{ color: tooltipTextColor }}
                    cursor={{ fill: isLight ? '#a7f3d0' : '#34d399' }}
                    formatter={v => [`${(v / 60).toFixed(1)}h (${v}m)`, isAr ? 'وقت الدراسة' : 'Study Time']}
                  />
                  <Bar dataKey="minutes" fill="url(#weeklyGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={activeData.dailyBreakdown}>
                  <defs>
                    <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={isLight ? 0.6 : 0.8} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke={axisStroke} tick={{ fontSize: 10, fill: axisStroke }} interval={3} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11, fill: axisStroke }} tickFormatter={v => `${Math.round(v / 60)}h`} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: 8 }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 600 }}
                    itemStyle={{ color: tooltipTextColor }}
                    cursor={{ fill: isLight ? '#c7d2fe' : '#818cf8' }}
                    formatter={v => [`${(v / 60).toFixed(1)}h (${v}m)`, isAr ? 'وقت الدراسة' : 'Study Time']}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} fill="url(#monthlyGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Chart */}
        <div className="analytics-chart-card category-chart">
          <div className="chart-card-header">
            <h3><FaChartPie /> {t('analytics.subjectAllocation')}</h3>
            <span className="chart-header-sub">{t('analytics.timeByCategory')}</span>
          </div>

          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryChartData.length === 0 ? (
              <div className="analytics-empty-state">
                {t('analytics.noCategoricalTimeframe', { timeframe })}
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: 8 }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 600 }}
                    itemStyle={{ color: tooltipTextColor }}
                    formatter={v => [`${(v / 60).toFixed(1)}h (${v}m)`, 'Time']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: isLight ? '#0f172a' : '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Details Table & Completed Tasks */}
      <div className="analytics-details-grid">
        {/* Category Breakdown Table */}
        <div className="analytics-detail-card">
          <div className="detail-card-header">
            <h3>{t('analytics.subjectBreakdownTable')}</h3>
            <span className="detail-tag">{timeframe.toUpperCase()}</span>
          </div>

          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('analytics.subject')}</th>
                  <th>{t('analytics.hours')}</th>
                  <th>{t('analytics.minutes')}</th>
                  <th>{t('analytics.share')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(activeData.categoryBreakdown).map(([catKey, catVal]) => {
                  const total = activeData.summary.totalMinutes || 1;
                  const pct = Math.round((catVal.minutes / total) * 100);
                  const color = CATEGORY_COLORS[catKey] || '#94a3b8';
                  const labelMap = {
                    math: t('analytics.mathematics'),
                    dataScience: t('analytics.dataScience'),
                    english: t('analytics.english'),
                    routine: t('analytics.routineSchedule'),
                    other: t('analytics.otherTasks')
                  };
                  return (
                    <tr key={catKey}>
                      <td>
                        <span className="table-color-dot" style={{ background: color }} />
                        {labelMap[catKey] || catKey}
                      </td>
                      <td><strong>{catVal.formatted}</strong></td>
                      <td>{catVal.minutes}m</td>
                      <td>
                        <div className="table-pct-bar">
                          <div className="table-pct-fill" style={{ width: `${pct}%`, background: color }} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task / Session Activity Feed */}
        <div className="analytics-detail-card">
          <div className="detail-card-header">
            <h3>
              {timeframe === 'daily' ? <><FaTasks /> {t('analytics.todayFocusSessions')}</> : t('analytics.timeframeHighlights')}
            </h3>
            <span className="detail-tag">{t('analytics.activityLog')}</span>
          </div>

          <div className="analytics-feed-list">
            {timeframe === 'daily' ? (
              activeData.sessions.length > 0 ? (
                activeData.sessions.map((s, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-dot" />
                    <div className="feed-info">
                      <div className="feed-task">{s.task}</div>
                      <div className="feed-meta">{s.category} · {s.formattedTime}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="analytics-empty-state">
                  {t('analytics.noSessionsToday')}
                </div>
              )
            ) : (
              <div className="weekly-summary-pills">
                <div className="summary-pill-item">
                  <span className="pill-title">{t('analytics.dateWindow')}</span>
                  <span className="pill-val">{activeData.dateRange || activeData.monthName}</span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-title">{t('analytics.avgDailyOutput')}</span>
                  <span className="pill-val">{activeData.summary.averageDailyFormatted} {t('analytics.perDay')}</span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-title">{t('analytics.goalProgressLabel')}</span>
                  <span className="pill-val">{t('analytics.achieved', { pct: activeData.summary.goalProgressPct })}</span>
                </div>
                <div className="summary-pill-item">
                  <span className="pill-title">{t('analytics.scholarLevel')}</span>
                  <span className="pill-val">{isAr ? `المستوى ${activeData.rpg.level}` : `Lv.${activeData.rpg.level}`} ({translateRankTitle(activeData.rpg.rankTitle)})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Predictive Intelligence & Study DNA */}
      <div className="cosmos-grid" style={{ marginBottom: '24px' }}>
        <CognitiveFatigue />
        <LevelForecast />
        <StudyVelocity />
        <DistractionDNA />
        <StudyDNAHelix />
      </div>

      {/* AI Strategic Performance Advisor */}
      <div className="ai-advisor-card">
        <div className="ai-advisor-header">
          <div className="ai-advisor-title">
            <FaChartLine />
          <span>{t('analytics.aiAdvisorTitle')}</span>
          </div>
          <button
            className="ai-speak-btn"
            onClick={() => {
              const analysisMsg = timeframe === 'daily'
                ? `Daily review: ${activeData.summary.totalHoursFormatted} logged (${activeData.summary.goalProgressPct}% of target). Maintain momentum and focus on core math and data science blocks.`
                : timeframe === 'weekly'
                  ? `Weekly performance: ${activeData.summary.totalHoursFormatted} total across ${activeData.summary.activeDaysCount} active days. Balance subject distribution for optimal retention.`
                  : `Monthly analysis: ${activeData.summary.totalHoursFormatted} completed with a ${activeData.summary.consistencyRatePct}% consistency rate. Systematic pacing is compound growth.`;
              
              window.dispatchEvent(new CustomEvent('mascot-event', {
                detail: {
                  eventType: 'USER_CHAT',
                  userMessage: analysisMsg,
                }
              }));
            }}
            title={isAr ? 'اطلب من التميمة التحدث بهذا التحليل الاستراتيجي' : 'Ask Mascot to speak this strategic analysis'}
          >
            <span>{isAr ? 'نصيحة استراتيجية صوتية' : 'Voice Strategic Advice'}</span>
          </button>
        </div>

        <div className="ai-insights-grid">
          <div className="ai-insight-item">
            <strong>{t('analytics.outputPacing')}</strong>{' '}
            {activeData.summary.goalProgressPct >= 80
              ? t('analytics.aiPacingExceptional', { pct: activeData.summary.goalProgressPct, timeframe, hours: activeData.summary.totalHoursFormatted })
              : activeData.summary.goalProgressPct >= 40
                ? t('analytics.aiPacingSteady', { pct: activeData.summary.goalProgressPct })
                : t('analytics.aiPacingLow', { pct: activeData.summary.goalProgressPct })}
          </div>

          <div className="ai-insight-item">
            <strong>{t('analytics.subjectBalanceLabel')}</strong>{' '}
            {activeData.categoryBreakdown.math.minutes > 0 && activeData.categoryBreakdown.dataScience.minutes > 0
              ? t('analytics.aiSubjectHealthy', { mathTime: activeData.categoryBreakdown.math.formatted, dsTime: activeData.categoryBreakdown.dataScience.formatted })
              : t('analytics.aiSubjectWeak')}
          </div>

          <div className="ai-insight-item">
            <strong>{t('analytics.strategicRecLabel')}</strong>{' '}
            {timeframe === 'daily'
              ? t('analytics.aiRecDaily')
              : timeframe === 'weekly'
                ? t('analytics.aiRecWeekly', { days: activeData.summary.activeDaysCount })
                : t('analytics.aiRecMonthly', { pct: Math.min(100, activeData.summary.consistencyRatePct + 10) })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AnalyticsPage;
