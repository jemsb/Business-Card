import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Camera, StopCircle, RefreshCw, Clipboard, Check } from 'lucide-react';
import { parseVcard } from '../utils';
import { Contact } from '../types';

interface ScannerProps {
  onScanResult: (contact: Partial<Contact>) => void;
}

export function Scanner({ onScanResult }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Point your camera at a business card QR');
  const [manualText, setManualText] = useState('');
  const [parseError, setParseError] = useState('');
  const [pastedSuccessfully, setPastedSuccessfully] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Stop scanning helper
  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsScanning(false);
    setScanStatus('Point your camera at a business card QR');
  };

  useEffect(() => {
    return () => {
      // Clean up scanning on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(80);
      }
    } catch (e) {
      console.warn('Audio feedback failed', e);
    }
  };

  const startScan = async () => {
    setParseError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        videoRef.current.play();
      }
      setIsScanning(true);
      setScanStatus('Scanning…');
      // Begin standard scan loop
      animationFrameId.current = requestAnimationFrame(scanLoop);
    } catch (err: any) {
      console.error(err);
      setScanStatus('Camera permission denied or not available.');
    }
  };

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          playBeep();
          const parsed = parseVcard(code.data);
          onScanResult(parsed);
          stopScan();
          return;
        }
      }
    }
    // Continue loop
    animationFrameId.current = requestAnimationFrame(scanLoop);
  };

  const handleManualParse = () => {
    setParseError('');
    if (!manualText.trim()) {
      setParseError('Please paste some text first.');
      return;
    }

    const parsed = parseVcard(manualText);
    if (!parsed.name && !parsed.email && !parsed.phone) {
      setParseError('Could not find any standard contact fields from this raw text.');
      return;
    }

    onScanResult(parsed);
    setPastedSuccessfully(true);
    setTimeout(() => setPastedSuccessfully(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[260px] flex flex-col items-center justify-center p-6 text-center shadow-inner">
        {/* Hidden Canvas used for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video feed */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300 ${
            isScanning ? 'opacity-100 z-10' : 'opacity-0 -z-10'
          }`}
        />

        {/* Scanning Reticle Frame */}
        {isScanning && (
          <div className="absolute inset-x-8 inset-y-8 border-2 border-dashed border-emerald-500 rounded-xl z-20 pointer-events-none flex items-center justify-center">
            {/* Pulsing Scan Laser line */}
            <div className="w-[85%] h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-bounce" />
          </div>
        )}

        {/* Static State View */}
        {!isScanning && (
          <div className="z-0 py-4 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
              <Camera size={28} />
            </div>
            <p className="font-sans text-sm text-slate-500 px-4 max-w-xs leading-relaxed">
              {scanStatus}
            </p>
          </div>
        )}

        {/* Dynamic Scan status text inside scanning */}
        {isScanning && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-full z-25 tracking-wide uppercase">
            {scanStatus}
          </div>
        )}

        {/* Trigger Controls overlay/bottom */}
        <div className="z-30 mt-4">
          {!isScanning ? (
            <button
              onClick={startScan}
              id="btn-scan-start"
              className="px-6 py-2.5 bg-slate-900 text-white font-sans text-xs font-semibold tracking-wide rounded-xl shadow-md hover:bg-slate-800 transition duration-150 flex items-center gap-2 cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Camera size={15} />
              Open Camera
            </button>
          ) : (
            <button
              onClick={stopScan}
              id="btn-scan-stop"
              className="px-6 py-2.5 bg-rose-600 text-white font-sans text-xs font-semibold tracking-wide rounded-xl shadow-md hover:bg-rose-500 transition duration-150 flex items-center gap-2 cursor-pointer"
            >
              <StopCircle size={15} />
              Stop Scanning
            </button>
          )}
        </div>
      </div>

      {/* Manual text area input parser */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Or Paste Raw vCard Data
        </label>
        <div className="relative">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-[#f8fafc] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 min-h-[90px] text-slate-800 dark:text-slate-200"
            placeholder={`Paste standard raw vCard string. E.g.\nBEGIN:VCARD\nFN:John Doe\nTEL:+1555123456\nEND:VCARD`}
          />
        </div>

        {parseError && (
          <p className="mt-1.5 text-xs text-rose-500 font-sans font-medium">
            {parseError}
          </p>
        )}

        <button
          onClick={handleManualParse}
          id="btn-manual-parse"
          className="mt-3 inline-flex items-center gap-2 px-5 py-2 border border-slate-350 dark:border-slate-600 font-sans text-xs font-medium text-slate-700 dark:text-slate-300 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition duration-150 cursor-pointer"
        >
          {pastedSuccessfully ? <Check size={14} className="text-emerald-550" /> : <Clipboard size={14} />}
          Parse vCard String
        </button>
      </div>
    </div>
  );
}
