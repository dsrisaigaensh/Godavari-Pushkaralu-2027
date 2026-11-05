import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Search,
  Camera,
  CameraOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  RotateCcw,
  Upload,
  Sparkles,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import type { Asset } from '../../types/asset';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolvedAsset, setResolvedAsset] = useState<Asset | null>(null);

  // Camera stream and scanning states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedSuccessEffect, setScannedSuccessEffect] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanAnimationIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio beep feedback helper
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (scanAnimationIdRef.current) {
      cancelAnimationFrame(scanAnimationIdRef.current);
      scanAnimationIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Parse QR text to extract clean asset code (handles full URLs and direct codes)
  const extractCleanCode = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.includes('/assets/lookup/qr/')) {
      const segment = trimmed.split('/assets/lookup/qr/').pop() || '';
      return segment.split(/[?#]/)[0];
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parts = trimmed.split('/');
      const last = parts[parts.length - 1] || '';
      return last.split(/[?#]/)[0];
    }
    return trimmed;
  };

  const handleLookup = useCallback(async (codeToLookup?: string) => {
    const rawTarget = (codeToLookup || inputCode).trim();
    if (!rawTarget) {
      setError('Please enter an Asset Code or scan a physical QR code.');
      return;
    }

    const cleanTarget = extractCleanCode(rawTarget);

    try {
      setLoading(true);
      setError('');
      setResolvedAsset(null);
      const asset = await api.lookupAssetByQR(cleanTarget);
      setResolvedAsset(asset);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No asset found matching this QR identifier or code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [inputCode]);

  // Handle a successful QR decode event
  const handleSuccessfulScan = useCallback((decodedText: string) => {
    playBeep();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // vibration unsupported or disallowed
      }
    }
    setScannedSuccessEffect(true);
    setTimeout(() => setScannedSuccessEffect(false), 1200);

    const cleanCode = extractCleanCode(decodedText);
    setInputCode(cleanCode);
    handleLookup(cleanCode);
  }, [handleLookup]);

  // Continuous frame scanning loop
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      scanAnimationIdRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleSuccessfulScan(code.data);
        // Pause loop momentarily so we don't trigger 60 times per second
        setTimeout(() => {
          if (isOpen && isCameraActive) {
            scanAnimationIdRef.current = requestAnimationFrame(scanLoop);
          }
        }, 1500);
        return;
      }
    }

    scanAnimationIdRef.current = requestAnimationFrame(scanLoop);
  }, [isOpen, isCameraActive, handleSuccessfulScan]);

  // Start live webcam / mobile camera
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser or environment (requires HTTPS or localhost).');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // essential for iOS Safari
        await videoRef.current.play();
        setIsCameraActive(true);
        scanAnimationIdRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.name : 'UnknownError';
      if (message === 'NotAllowedError' || message === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or enter the code manually.');
      } else if (message === 'NotFoundError' || message === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload a photo or use the quick test tags below.');
      } else {
        setCameraError('Unable to start camera feed. Please check device permissions.');
      }
      setIsCameraActive(false);
    }
  }, [stopCamera, scanLoop]);

  // Manage camera lifecycle based on modal visibility
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, startCamera, stopCamera]);

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Image upload fallback for scanning QR photos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            handleSuccessfulScan(code.data);
          } else {
            setError('No readable QR code found in the uploaded image. Please try another image or use manual entry.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleSimulateScan = (sampleCode: string) => {
    setInputCode(sampleCode);
    handleSuccessfulScan(sampleCode);
  };

  const handleGoToAsset = () => {
    if (resolvedAsset) {
      handleClose();
      navigate(`/assets/${resolvedAsset.id}`);
    }
  };

  const handleClose = () => {
    stopCamera();
    setInputCode('');
    setError('');
    setResolvedAsset(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="QR Code Asset Scanner & Verification">
      <div className="space-y-4">
        {/* Government Statutory Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-stone-700 flex items-start gap-2.5">
          <QrCode className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-stone-900">Sri Godavari Pushkaralu 2027 Field Traceability Verification</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Live optical scanning verifies municipal asset tags, structural checklists, and readiness certification records in real time.
            </p>
          </div>
        </div>

        {/* Live Camera Viewfinder Screen */}
        <div className="relative rounded-2xl bg-black overflow-hidden border border-[#EBDCC8] shadow-card aspect-video max-h-[320px] flex items-center justify-center">
          {/* Active HTML5 Video Stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isCameraActive ? 'opacity-100' : 'opacity-0'
            }`}
            playsInline
            autoPlay
            muted
          />

          {/* Off-screen canvas for frame extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Fallback / Camera Inactive or Error Screen */}
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-stone-900/90 z-10">
              <CameraOff className="w-12 h-12 text-stone-400 mb-2" />
              <p className="text-sm font-bold text-stone-200">
                {cameraError ? 'Camera Access Notice' : 'Camera Feed Paused'}
              </p>
              <p className="text-xs text-stone-400 max-w-sm mt-1 mb-3">
                {cameraError || 'Click below to activate your webcam or upload a photo of the QR code.'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="saffron"
                  onClick={() => startCamera(facingMode)}
                  icon={<Camera className="w-3.5 h-3.5" />}
                >
                  Start Camera
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload QR Image
                </Button>
              </div>
            </div>
          )}

          {/* Viewfinder Target Reticle Overlay (Visible when camera is streaming) */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              {/* Corner reticle frame */}
              <div
                className={`w-52 h-52 sm:w-60 sm:h-60 relative transition-all duration-300 ${
                  scannedSuccessEffect
                    ? 'border-4 border-emerald-400 scale-105 shadow-[0_0_25px_rgba(16,185,129,0.7)]'
                    : 'border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                } rounded-2xl flex items-center justify-center overflow-hidden`}
              >
                {/* 4 Decorative Corner Accents */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#EA580C] rounded-tl-md" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#EA580C] rounded-tr-md" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#EA580C] rounded-bl-md" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#EA580C] rounded-br-md" />

                {/* Animated Horizontal Scanning Laser */}
                <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-md shadow-amber-500/50" />

                {scannedSuccessEffect ? (
                  <div className="flex flex-col items-center gap-1 bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-400 text-emerald-300 animate-fadeIn">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <span className="text-[11px] font-bold tracking-wide">QR Tag Decoded!</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-200/80 tracking-wider uppercase bg-black/50 px-2 py-0.5 rounded-full">
                    Align Tag Inside Box
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Floating Controls Bar over Camera Feed */}
          {isCameraActive && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors shadow-sm"
                title={`Switch Camera (Currently ${facingMode === 'environment' ? 'Rear' : 'Front'})`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors shadow-sm"
                title="Upload QR Code Photo from device"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors shadow-sm"
                title="Pause Camera"
              >
                <CameraOff className="w-3.5 h-3.5 text-red-300" />
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input for Image Upload / Photo Snapping */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Quick Demo Pre-fills for Testing without Physical Paper Tags */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              Quick Demo Test Tags (1-Click Test)
            </label>
            <span className="text-[10px] text-stone-400">Pushkaralu Ghat Assets</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleSimulateScan('AST-RO-KOTI-01')}
              className="text-left text-xs bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 p-2 rounded-xl font-mono transition-colors"
            >
              <div className="font-bold text-[11px]">AST-RO-KOTI-01</div>
              <div className="text-[10px] text-rose-700 truncate">RO Kiosk (Kotilingala)</div>
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('QR-AST-SN-PUSH-040')}
              className="text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 p-2 rounded-xl font-mono transition-colors"
            >
              <div className="font-bold text-[11px]">QR-AST-SN-PUSH-040</div>
              <div className="text-[10px] text-emerald-700 truncate">Bio-Toilet (Pushkar)</div>
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('AST-HM-KOTI-01')}
              className="text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 p-2 rounded-xl font-mono transition-colors"
            >
              <div className="font-bold text-[11px]">AST-HM-KOTI-01</div>
              <div className="text-[10px] text-amber-700 truncate">High-Mast Tower</div>
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('AST-SAFE-SARA-01')}
              className="text-left text-xs bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 p-2 rounded-xl font-mono transition-colors"
            >
              <div className="font-bold text-[11px]">AST-SAFE-SARA-01</div>
              <div className="text-[10px] text-stone-600 truncate">Ghat Barricade</div>
            </button>
          </div>
        </div>

        {/* Manual Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="space-y-2"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Asset Code or Opaque QR Token
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. AST-RO-KOTI-01 or QR-AST-SN-PUSH-040"
                className="w-full pl-9 pr-24 py-2 bg-[#FAF7F2] border border-[#EBDCC8] rounded-xl text-sm font-mono text-stone-900 focus:ring-2 focus:ring-brand/40 focus:bg-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <Button
                type="submit"
                variant="saffron"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Lookup'}
              </Button>
            </div>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resolved Asset Preview Card */}
        {resolvedAsset && (
          <div className="p-4 bg-[#FAF7F2] border border-amber-300/80 rounded-2xl shadow-card space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-[#7A1618] bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-lg">
                  {resolvedAsset.asset_code}
                </span>
                <h4 className="font-bold text-stone-900 text-sm mt-1.5">{resolvedAsset.name}</h4>
                <p className="text-xs text-stone-500">{resolvedAsset.location_name || resolvedAsset.zone_name}</p>
              </div>
              <Badge variant={resolvedAsset.readiness_badge_variant} className="text-xs">
                {resolvedAsset.readiness_badge_text}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-white p-3 rounded-xl border border-[#EFE6DA]">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-semibold text-stone-800 truncate block">
                  {resolvedAsset.department || 'Municipal Administration'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-stone-800">{resolvedAsset.category}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Active Defects</span>
                <span className={resolvedAsset.open_defect_count > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                  {resolvedAsset.open_defect_count > 0 ? `${resolvedAsset.open_defect_count} Unresolved` : '0 (Clear)'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Operational State</span>
                <span className={resolvedAsset.is_operationally_ready ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-amber-700 font-medium'}>
                  {resolvedAsset.is_operationally_ready ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Ready for Pushkaralu
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Not Ready
                    </>
                  )}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="saffron"
              className="w-full justify-center gap-2"
              onClick={handleGoToAsset}
            >
              Open Complete Asset Dossier
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
