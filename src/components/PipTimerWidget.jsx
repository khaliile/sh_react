import { useEffect, useRef, useState, useCallback } from 'react';
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

export default function PipTimerWidget({
  taskName = 'Deep Focus Study',
  remainingSeconds = 1500,
  totalSeconds = 1500,
  isRunning = false,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Render timer on the hidden canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 400;
    const height = 240;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Subtle gradient overlay
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#27273a';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Title / Task Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const displayTask = taskName.length > 32 ? taskName.slice(0, 30) + '...' : taskName;
    ctx.fillText(displayTask.toUpperCase(), width / 2, 38);

    // Timer Progress Ring
    const centerX = width / 2;
    const centerY = 120;
    const radius = 55;
    const pct = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

    // Background Track Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Active Progress Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
    ctx.strokeStyle = isRunning ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Time Text
    const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const secs = String(remainingSeconds % 60).padStart(2, '0');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mins}:${secs}`, centerX, centerY - 2);

    // Status Pill
    ctx.fillStyle = isRunning ? '#10b981' : '#f59e0b';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(isRunning ? '● FOCUSING' : '❚❚ PAUSED', width / 2, 205);
  }, [taskName, remainingSeconds, totalSeconds, isRunning]);

  // Keep drawing whenever timer changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const togglePip = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        if (!video.srcObject) {
          const stream = canvas.captureStream(30);
          video.srcObject = stream;
          await video.play();
        }
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.warn("Picture-in-Picture error:", err);
      setIsSupported(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLeave = () => setIsPipActive(false);
    video.addEventListener('leavepictureinpicture', handleLeave);
    return () => video.removeEventListener('leavepictureinpicture', handleLeave);
  }, []);

  return (
    <div className="pip-timer-wrapper">
      <canvas ref={canvasRef} style={{ display: 'none' }} width="400" height="240" />
      <video ref={videoRef} style={{ display: 'none' }} muted playsInline />

      <button
        className={`pip-toggle-btn ${isPipActive ? 'active' : ''}`}
        onClick={togglePip}
        title="Pop out Always-on-Top Floating Picture-in-Picture Timer"
      >
        <FaExternalLinkAlt style={{ marginRight: '6px' }} />
        {isPipActive ? 'Floating Mode Active' : 'Pop-out Floating Timer'}
      </button>
    </div>
  );
}
