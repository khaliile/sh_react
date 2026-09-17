import React from 'react';
import {
  FaPlay,
  FaStop,
  FaVolumeUp,
  FaSpinner,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPaperPlane,
  FaBolt,
  FaBook,
  FaBullseye,
  FaClock,
  FaStopwatch,
} from 'react-icons/fa';
import { cleanTextForSpeech } from '../../services/ttsService';

export default function MascotBubble({
  isAr,
  auraColor,
  chatStatus,
  visualStatus,
  liveTranscript,
  dialogueText,
  isVoiceLoading,
  isVoiceSpeaking,
  runVoice,
  stopVoice,
  isMuted,
  inputText,
  setInputText,
  handleUserSubmit,
  ttsStatus,
  toggleListening,
  isOfflineMode,
  quickChips = [],
}) {
  return (
    <>
      <div className="mascot-dialogue">
        {chatStatus === 'listening' ? (
          <i style={{ color: auraColor }}>{liveTranscript || (isAr ? 'أستمع...' : 'Listening...')}</i>
        ) : chatStatus === 'thinking' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: auraColor }}>
            <FaSpinner className="mascot-spin" /> {isAr ? 'أفكر...' : 'Thinking...'}
          </span>
        ) : (
          <>
            <div>{dialogueText}</div>
            {isVoiceLoading && (
              <div style={{ marginTop: 6, fontSize: '0.72rem', color: auraColor, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}>
                <FaSpinner className="mascot-spin" /> {isAr ? 'جاري تجهيز الصوت...' : 'Synthesizing voice...'}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button
          className="mascot-icon-btn mascot-run-voice"
          onClick={runVoice}
          disabled={!cleanTextForSpeech(dialogueText) || visualStatus === 'thinking' || isVoiceLoading || isMuted}
          title={isMuted ? (isAr ? 'ألغ الكتم أولاً' : 'Unmute first') : (isAr ? 'تشغيل الصوت للحوار الحالي' : 'Run voice for the current dialogue')}
        >
          {isVoiceLoading ? <FaSpinner className="mascot-spin" /> : isVoiceSpeaking ? <FaVolumeUp /> : <FaPlay />}
          {isVoiceLoading 
            ? (isAr ? 'جاري التجهيز...' : 'Synthesizing…')
            : isVoiceSpeaking 
              ? (isAr ? 'يتحدث...' : 'Speaking…') 
              : (isAr ? 'تشغيل الصوت' : 'Run Voice')
          }
        </button>

        <button
          className="mascot-icon-btn"
          onClick={stopVoice}
          disabled={visualStatus !== 'speaking' && visualStatus !== 'loading'}
          title={isAr ? 'إيقاف الصوت' : 'Stop voice'}
          aria-label={isAr ? 'إيقاف الصوت' : 'Stop voice'}
        >
          <FaStop />
        </button>
      </div>

      <div className="mascot-input-row">
        <input
          className="mascot-input"
          placeholder={isAr ? 'اسألني...' : 'Ask me anything...'}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleUserSubmit(); }}
          disabled={ttsStatus === 'processing'}
          style={ttsStatus === 'processing' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        />
        <button
          className="mascot-icon-btn"
          style={{ background: visualStatus === 'listening' ? '#ef444444' : '' }}
          onClick={toggleListening}
          title={visualStatus === 'listening' ? (isAr ? 'إيقاف الاستماع' : 'Stop listening') : (isAr ? 'بدء الإدخال الصوتي' : 'Start voice input')}
          aria-label={visualStatus === 'listening' ? (isAr ? 'إيقاف الاستماع' : 'Stop listening') : (isAr ? 'بدء الإدخال الصوتي' : 'Start voice input')}
          disabled={ttsStatus === 'processing'}
        >
          {visualStatus === 'listening' ? <FaMicrophoneSlash color="#ef4444" /> : <FaMicrophone />}
        </button>
        <button
          className="mascot-icon-btn"
          onClick={() => handleUserSubmit()}
          title={ttsStatus === 'processing' ? (isAr ? 'جاري تجهيز الصوت...' : 'Synthesizing voice…') : (isAr ? 'إرسال' : 'Send')}
          aria-label={isAr ? 'إرسال' : 'Send'}
          disabled={ttsStatus === 'processing'}
        >
          {ttsStatus === 'processing' ? <FaSpinner className="mascot-spin" /> : <FaPaperPlane />}
        </button>
      </div>

      <div className="mascot-chips">
        {isOfflineMode ? (
          isAr ? (
            <>
              <button className="mascot-chip" onClick={() => handleUserSubmit('تحفيز')}><FaBolt /> تحفيز</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('نصائح دراسة')}><FaBook /> نصائح دراسة</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('تركيز')}><FaBullseye /> مساعدة تركيز</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('مماطلة')}><FaClock /> تغلب على المماطلة</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('بومودورو')}><FaStopwatch /> معلومات بومودورو</button>
            </>
          ) : (
            <>
              <button className="mascot-chip" onClick={() => handleUserSubmit('motivation')}><FaBolt /> Motivation</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('study tips')}><FaBook /> Study Tips</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('focus')}><FaBullseye /> Focus Help</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('procrastination')}><FaClock /> Beat Procrastination</button>
              <button className="mascot-chip" onClick={() => handleUserSubmit('pomodoro')}><FaStopwatch /> Pomodoro Info</button>
            </>
          )
        ) : (
          quickChips.map((chip, i) => (
            <button key={i} className="mascot-chip" onClick={() => handleUserSubmit(chip)}>
              {chip}
            </button>
          ))
        )}
      </div>
    </>
  );
}
