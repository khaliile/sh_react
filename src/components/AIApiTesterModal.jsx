import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaRobot, FaCheckCircle, FaTimesCircle, FaBolt, FaSync,
  FaServer, FaMicrochip, FaTimes, FaKey, FaClock, FaPaperPlane
} from 'react-icons/fa';
import { GiCrystalBall, GiBrain, GiCpu } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { testAllAIProviders, queryUnifiedAI, PROVIDERS_CONFIG } from '../services/unifiedAIService';
import './AIApiTesterModal.css';

export default function AIApiTesterModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [lastTested, setLastTested] = useState(null);

  // Custom sandbox tester
  const [customPrompt, setCustomPrompt] = useState('Explain quantum computing in one sentence.');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [querying, setQuerying] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState(null);

  const runAllTests = async () => {
    setTesting(true);
    try {
      const testResults = await testAllAIProviders();
      setResults(testResults);
      setLastTested(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to run AI provider tests:', err);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      runAllTests();
    }
  }, [isOpen]);

  const handleSandboxSubmit = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setQuerying(true);
    setSandboxResponse(null);

    try {
      const res = await queryUnifiedAI({
        prompt: customPrompt,
        preferredProvider: selectedProvider === 'auto' ? null : selectedProvider,
        maxTokens: 150
      });
      setSandboxResponse({
        ok: true,
        reply: res.reply,
        provider: res.provider,
        model: res.model,
        latencyMs: res.latencyMs
      });
    } catch (err) {
      setSandboxResponse({
        ok: false,
        error: err.message
      });
    } finally {
      setQuerying(false);
    }
  };

  if (!isOpen) return null;

  const modalNode = (
    <div className={`ai-modal-overlay ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="ai-modal-backdrop" onClick={onClose} />
      <div className="ai-modal-container">
        
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-title-wrap">
            <GiCpu className="ai-modal-title-icon" />
            <div>
              <h2>{isRTL ? 'مصفوفة الذكاء الاصطناعي وفحص الاتصال' : 'AI Multi-Engine Matrix & Diagnostics'}</h2>
              <span className="ai-modal-subtitle">
                {isRTL
                  ? 'فحص ومراقبة استجابة كافة مزودي الذكاء الاصطناعي المربوطة بالتطبيق'
                  : 'Live connectivity, latency, and response audit across all registered AI providers'}
              </span>
            </div>
          </div>
          <button className="ai-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="ai-modal-actions-bar">
          <button
            className="ai-run-tests-btn"
            onClick={runAllTests}
            disabled={testing}
          >
            <FaSync className={testing ? 'spin-icon' : ''} />
            <span>{testing ? (isRTL ? 'جارٍ فحص المزودات...' : 'Testing All Engines...') : (isRTL ? 'إعادة فحص كافة المزودات' : 'Run Diagnostics on All APIs')}</span>
          </button>
          {lastTested && (
            <span className="ai-last-tested">
              <FaClock /> {isRTL ? `آخر فحص: ${lastTested}` : `Last checked: ${lastTested}`}
            </span>
          )}
        </div>

        {/* Results Grid */}
        <div className="ai-providers-grid">
          {results.length === 0 && testing ? (
            <div className="ai-loading-placeholder">
              <FaSync className="spin-icon" style={{ fontSize: '2rem', color: '#f59e0b' }} />
              <p>{isRTL ? 'جارٍ الاتصال بمزودات الذكاء الاصطناعي وقياس زمن الاستجابة...' : 'Pinging AI endpoints and measuring latency...'}</p>
            </div>
          ) : (
            results.map((r) => (
              <div key={r.id} className={`ai-provider-card ${r.ok ? 'online' : 'offline'}`}>
                <div className="ai-card-top">
                  <div className="ai-provider-name-row">
                    <span className="ai-status-indicator" />
                    <strong>{r.name}</strong>
                  </div>
                  <span className={`ai-badge ${r.ok ? 'success' : 'error'}`}>
                    {r.ok ? <><FaCheckCircle /> 200 OK</> : <><FaTimesCircle /> Failed</>}
                  </span>
                </div>

                <div className="ai-card-details">
                  <div className="ai-detail-item">
                    <span className="ai-detail-lbl">{isRTL ? 'النموذج النشط:' : 'Active Model:'}</span>
                    <span className="ai-detail-val code">{r.model}</span>
                  </div>
                  <div className="ai-detail-item">
                    <span className="ai-detail-lbl">{isRTL ? 'سرعة الاستجابة:' : 'Latency:'}</span>
                    <span className="ai-detail-val" style={{ color: r.latencyMs < 1000 ? '#4ade80' : '#f59e0b' }}>
                      <FaBolt /> {r.latencyMs} ms
                    </span>
                  </div>
                </div>

                {r.ok ? (
                  <div className="ai-reply-quote">
                    "{r.reply}"
                  </div>
                ) : (
                  <div className="ai-error-quote">
                    {r.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Live Interactive Sandbox Tester */}
        <div className="ai-sandbox-section">
          <h3>
            <FaPaperPlane />
            {isRTL ? 'منطقة الاختبار التفاعلي الحي' : 'Live Interactive Query Sandbox'}
          </h3>
          <form onSubmit={handleSandboxSubmit} className="ai-sandbox-form">
            <div className="ai-sandbox-row">
              <input
                type="text"
                className="ai-sandbox-input"
                placeholder={isRTL ? 'اكتب سؤالاً أو أمراً لاختبار الرد...' : 'Type a query or prompt to test...'}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
              />
              <select
                className="ai-sandbox-select"
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
              >
                <option value="auto">{isRTL ? 'تلقائي (الأسرع مع التحويل)' : 'Auto Multi-Engine (Fastest)'}</option>
                <option value="nvidia">NVIDIA NIM</option>
                <option value="groq">Groq Cloud</option>
                <option value="inception">Inception Labs</option>
                <option value="gemini">Google Gemini 2</option>
                <option value="codecraft">CodeCraft API</option>
              </select>
              <button
                type="submit"
                className="ai-sandbox-submit-btn"
                disabled={querying}
              >
                {querying ? <FaSync className="spin-icon" /> : <FaPaperPlane />}
                <span>{isRTL ? 'إرسال' : 'Send'}</span>
              </button>
            </div>
          </form>

          {sandboxResponse && (
            <div className={`ai-sandbox-result ${sandboxResponse.ok ? 'success' : 'error'}`}>
              {sandboxResponse.ok ? (
                <>
                  <div className="ai-sandbox-result-header">
                    <span className="ai-res-badge">
                      <FaRobot /> {sandboxResponse.provider} ({sandboxResponse.model})
                    </span>
                    <span className="ai-res-speed">
                      <FaBolt /> {sandboxResponse.latencyMs} ms
                    </span>
                  </div>
                  <p className="ai-sandbox-result-text">{sandboxResponse.reply}</p>
                </>
              ) : (
                <p className="ai-sandbox-result-text error">{sandboxResponse.error}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
