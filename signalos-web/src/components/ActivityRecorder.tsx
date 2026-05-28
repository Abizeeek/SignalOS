import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Download,
  Eye,
  Keyboard,
  MousePointer2,
  Play,
  Radio,
  Square,
  Timer,
  Video,
  Bookmark,
  Plus,
  Trash2,
  AlertTriangle,
  Camera,
  Scan,
  EyeOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { playSuccessChime } from '../utils/SoundSynth';

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getSupportedMimeType = () => {
  const options = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return options.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

export function ActivityRecorder() {
  const {
    activityMetrics,
    setActivityMetrics,
    tasks,
    user,
    refreshData,
    updateTask,
    
    // Pull persistent refs and states from Context
    recorderRef,
    streamRef,
    webcamStreamRef,
    webcamStream,
    chunksRef,
    startedAtRef,
    lastInputAtRef,
    idleSecondsRef,
    countsRef,
    enableWebcam,
    setEnableWebcam,
    selectedTaskId,
    setSelectedTaskId,
    notes,
    setNotes,
    gazeStatus,
    setGazeStatus,
    pupilCoords,
    showInactivityAlert,
    setShowInactivityAlert,
    aiAdherence,
    setAiAdherence,
    aiAdherenceStatus,
    setAiAdherenceStatus,
    setLastSession,
    setRecordedSessions
  } = useAppContext();

  const [error, setError] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [downloadName, setDownloadName] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const [activeNoteText, setActiveNoteText] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  // Mount/Restoration effect: Attach persistent background stream to HTML Video elements when returning to this page
  useEffect(() => {
    if (activityMetrics.isRecording) {
      if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.log("Stream play failed", e));
        setPreviewReady(true);
      }
      if (enableWebcam && webcamStream && webcamVideoRef.current && !webcamVideoRef.current.srcObject) {
        webcamVideoRef.current.srcObject = webcamStream;
        webcamVideoRef.current.play().catch(e => console.log("Webcam play failed", e));
      }
    }
  }, [activityMetrics.isRecording, enableWebcam, webcamStream]);

  const activePercent = useMemo(() => {
    if (!activityMetrics.elapsedSeconds) return 100;
    return Math.round((activityMetrics.activeSeconds / activityMetrics.elapsedSeconds) * 100);
  }, [activityMetrics.activeSeconds, activityMetrics.elapsedSeconds]);

  // Hook to handle webcam video feed activation for the local UI reference
  useEffect(() => {
    if (enableWebcam && activityMetrics.isRecording && webcamStream) {
      if (webcamVideoRef.current && !webcamVideoRef.current.srcObject) {
        webcamVideoRef.current.srcObject = webcamStream;
        webcamVideoRef.current.play().catch(e => console.error("Webcam stream play failed", e));
      }
    } else {
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
    }
  }, [enableWebcam, activityMetrics.isRecording, webcamStream]);

  const getRecordingTimestamp = () => {
    if (!startedAtRef.current) return '00:00';
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const addQuickNote = (isBookmark: boolean = false) => {
    if (!isBookmark && !activeNoteText.trim()) return;
    const timestamp = getRecordingTimestamp();
    const newNote = {
      id: `note-${Date.now()}`,
      time: timestamp,
      text: isBookmark ? 'Bookmark Point' : activeNoteText,
      isBookmark
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNoteText('');
  };

  const discardRecording = () => {
    stopRecording();
    setNotes([]);
    setError('');
    setPreviewReady(false);
    setSelectedTaskId('');
    setEnableWebcam(false);
    setGazeStatus('FOCUSED');
    setShowInactivityAlert(false);
    setAiAdherence(null);
    setAiAdherenceStatus("Audit Idle - Start capturing to activate scanning.");
    
    setActivityMetrics({
      isRecording: false,
      elapsedSeconds: 0,
      activeSeconds: 0,
      idleSeconds: 0,
      clicks: 0,
      keyPresses: 0,
      mouseMoves: 0,
      visibilityChanges: 0,
      attentionScore: 100,
      activityRate: 0
    });
  };

  const startRecording = async () => {
    setError('');
    setIsPreparing(true);
    setPreviewReady(false);
    setNotes([]);
    setShowInactivityAlert(false);

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen recording is not available in this browser.');
      setIsPreparing(false);
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('This browser cannot save screen recordings.');
      setIsPreparing(false);
      return;
    }

    try {
      if (activityMetrics.recordingUrl) URL.revokeObjectURL(activityMetrics.recordingUrl);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false
      });

      const [videoTrack] = stream.getVideoTracks();
      const settings = videoTrack?.getSettings();
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      countsRef.current = {
        clicks: 0,
        keyPresses: 0,
        mouseMoves: 0,
        visibilityChanges: 0
      };
      idleSecondsRef.current = 0;
      startedAtRef.current = Date.now();
      lastInputAtRef.current = Date.now();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setPreviewReady(true);
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        const recordingUrl = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        setDownloadName(`signalos-activity-${timestamp}.webm`);

        try {
          const API_BASE = 'http://localhost:8080/api';
          const startTimeIso = new Date(startedAtRef.current).toISOString();
          const endTimeIso = new Date().toISOString();
          
          let activeTaskName = "Screen Activity Recording";
          let taskToComplete = null;
          if (selectedTaskId) {
            taskToComplete = tasks.find(t => t.id === selectedTaskId);
            if (taskToComplete) {
              activeTaskName = taskToComplete.name;
            }
          }

          let calculatedMood = 'NEUTRAL';
          if (countsRef.current.visibilityChanges > 3) {
            calculatedMood = 'DISTRACTED';
          } else if (countsRef.current.clicks > 10 || countsRef.current.keyPresses > 20) {
            calculatedMood = 'FLOW';
          }

          await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-User-Id': user?.id || 'default'
            },
            body: JSON.stringify({
              taskName: activeTaskName,
              startTime: startTimeIso,
              endTime: endTimeIso,
              interruptionCount: countsRef.current.visibilityChanges,
              mood: calculatedMood
            })
          });

          if (taskToComplete) {
            await updateTask({ ...taskToComplete, completed: true });
          } else {
            await refreshData();
          }
        } catch (e) {
          console.error("Failed to save screen recorded session to database:", e);
        }

        let finalTaskName = "Screen Activity Recording";
        if (selectedTaskId) {
          const tObj = tasks.find(t => t.id === selectedTaskId);
          if (tObj) finalTaskName = tObj.name;
        }

        const completedDetails = {
          taskName: finalTaskName,
          duration: activityMetrics.elapsedSeconds,
          activeSeconds: activityMetrics.activeSeconds,
          idleSeconds: activityMetrics.idleSeconds,
          clicks: countsRef.current.clicks,
          keyPresses: countsRef.current.keyPresses,
          mouseMoves: countsRef.current.mouseMoves,
          visibilityChanges: countsRef.current.visibilityChanges,
          attentionScore: activityMetrics.attentionScore,
          recordingUrl,
          recordedBytes: blob.size,
          notes: [...notes],
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setLastSession(completedDetails);
        setRecordedSessions(prev => [completedDetails, ...prev]);

        setActivityMetrics((current) => ({
          ...current,
          isRecording: false,
          recordingUrl,
          recordedBytes: blob.size
        }));
        chunksRef.current = [];
      };

      stream.getTracks().forEach((track) => {
        track.onended = () => stopRecording();
      });

      // Play start chime arpeggio
      playSuccessChime();

      setActivityMetrics({
        isRecording: true,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        activeSeconds: 0,
        idleSeconds: 0,
        clicks: 0,
        keyPresses: 0,
        mouseMoves: 0,
        visibilityChanges: 0,
        attentionScore: 100,
        activityRate: 0,
        capturedSurface: settings?.displaySurface,
        recordingUrl: undefined,
        recordedBytes: undefined
      });

      recorder.start(1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start screen recording.');
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    } finally {
      setIsPreparing(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      playSuccessChime();
    } else {
      setActivityMetrics((current) => ({ ...current, isRecording: false }));
    }

    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(t => t.stop());
      webcamStreamRef.current = null;
    }
    setEnableWebcam(false);
    setGazeStatus('FOCUSED');
    setShowInactivityAlert(false);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const statCards = [
    { label: 'Elapsed', value: formatDuration(activityMetrics.elapsedSeconds), icon: Timer, tone: 'text-sky-300' },
    { label: 'Active', value: formatDuration(activityMetrics.activeSeconds), icon: Activity, tone: 'text-emerald-300' },
    { label: 'Idle', value: formatDuration(activityMetrics.idleSeconds), icon: Eye, tone: 'text-amber-300' },
    { label: 'Attention', value: `${activityMetrics.attentionScore}%`, icon: Radio, tone: 'text-indigo-300' },
    { label: 'Clicks', value: activityMetrics.clicks.toString(), icon: MousePointer2, tone: 'text-violet-300' },
    { label: 'Keys', value: activityMetrics.keyPresses.toString(), icon: Keyboard, tone: 'text-teal-300' }
  ];

  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-36 w-full max-w-[1400px] mx-auto relative">
      
      {/* ABSOLUTE INACTIVITY FULL-SCREEN ALARM PANEL */}
      <AnimatePresence>
        {showInactivityAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 border-[12px] border-red-600/90 shadow-[inset_0_0_100px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center gap-6"
          >
            <div className="bg-red-600 border border-red-400 text-black font-black px-8 py-4 rounded-2xl shadow-2xl text-xl uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <AlertTriangle className="animate-bounce" />
              CRITICAL ALERT: INACTIVITY DETECTED!
            </div>
            <p className="text-slate-300 text-sm max-w-md text-center leading-relaxed">
              No input signals (mouse or keyboard) detected on the device for over 30 seconds. Protect your daily streaks!
            </p>
            <button
              onClick={() => {
                lastInputAtRef.current = Date.now();
                setShowInactivityAlert(false);
                playSuccessChime();
              }}
              className="px-6 py-3 bg-white hover:bg-slate-200 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg border border-white"
            >
              I AM ACTIVE (RESET PROTOCOL)
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Video className="text-indigo-300" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-wider">Activity Recorder</h1>
            <p className="text-slate-400 text-sm mt-1">
              Capture your screen and translate window activity into dynamic focus scores.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
        
        {/* LEFT COLUMN - CAPTURE STATION */}
        <section className="glass-panel rounded-3xl p-6 min-h-[520px] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-medium text-slate-100 uppercase tracking-wide">Live Capture Station</h2>
              <div className="text-xs text-slate-500 mt-1">
                {activityMetrics.isRecording
                  ? `Recording ${activityMetrics.capturedSurface || 'selected surface'}`
                  : 'Choose a tab, window, or screen when the browser asks.'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!activityMetrics.isRecording && (
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer max-w-[200px]"
                >
                  <option value="">General Screen Activity</option>
                  {pendingTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}

              {activityMetrics.isRecording ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={discardRecording}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-colors"
                  >
                    <Trash2 size={16} />
                    Discard
                  </button>
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 px-4 py-2 text-sm font-bold text-rose-200 border border-rose-500/20 hover:bg-rose-500/30 transition-colors"
                  >
                    <Square size={16} fill="currentColor" />
                    Stop
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isPreparing}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  <Play size={16} fill="currentColor" />
                  {isPreparing ? 'Preparing' : 'Start'}
                </button>
              )}
            </div>
          </div>

          <div className="relative flex-grow rounded-2xl overflow-hidden border border-white/10 bg-slate-950/70 min-h-[380px]">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-contain bg-slate-950"
            />
            {!previewReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <Video className="text-slate-600 mb-4" size={52} />
                <div className="text-slate-300 font-medium">No active capture</div>
                <div className="text-slate-500 text-sm mt-2 max-w-md">
                  Start recording, select the screen or browser tab you want to track, then keep working normally.
                </div>
              </div>
            )}
            {activityMetrics.isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-200">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                Recording
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN - ADVANCED TELEMETRY SYSTEMS */}
        <section className="space-y-6">
          
          {/* TRACKING PARAMETERS CARD */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Telemetry Diagnostics</h2>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                {activityMetrics.activityRate}/min
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{stat.label}</span>
                      <Icon className={stat.tone} size={15} />
                    </div>
                    <div className="text-2xl font-bold text-slate-100 tracking-tight font-mono">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Active Ratio</span>
                <span className="font-mono">{activePercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* NEW CORE 1: BIOMETRIC EYE-TRACKING TELEMETRY */}
          <div className="glass-panel rounded-3xl p-6 border-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
                <Camera className="text-cyan-400 animate-pulse" size={16} />
                Biometric Eye-Tracking
              </h3>
              
              {/* Webcam Switch Toggle */}
              {activityMetrics.isRecording ? (
                <button 
                  onClick={() => setEnableWebcam(!enableWebcam)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer ${
                    enableWebcam 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {enableWebcam ? "Webcam ON" : "Webcam OFF"}
                </button>
              ) : (
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">RECORDING LOCKED</span>
              )}
            </div>

            {/* LIVE WEBCAM TELEMETRY BUBBLE */}
            <div className="flex items-center gap-5 bg-slate-950/40 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
              <div className="h-24 w-24 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center border border-white/5 relative overflow-hidden">
                {enableWebcam && activityMetrics.isRecording ? (
                  <>
                    <video 
                      ref={webcamVideoRef}
                      muted
                      playsInline
                      className="h-full w-full object-cover rounded-full transform -scale-x-100"
                    />
                    {/* Rotating targeting grid overlay */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="absolute inset-1 border border-dashed border-cyan-500/30 rounded-full pointer-events-none"
                    />
                    {/* Pulsing focal square */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-cyan-400/50 rounded pointer-events-none animate-pulse" />
                  </>
                ) : (
                  <div className="text-center flex flex-col items-center gap-1.5 text-slate-600">
                    <EyeOff size={22} />
                    <span className="text-[9px] uppercase font-black tracking-wider">Feed Offline</span>
                  </div>
                )}
              </div>

              {/* Eye state diagnostics */}
              <div className="flex-1 space-y-2 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span>Gaze Track:</span>
                  <span className={`font-black uppercase tracking-wider ${
                    !activityMetrics.isRecording ? 'text-slate-500' : gazeStatus === 'FOCUSED' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'
                  }`}>
                    {!activityMetrics.isRecording ? 'OFFLINE' : gazeStatus}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span>Gaze Vector:</span>
                  <span className={enableWebcam && activityMetrics.isRecording ? "text-cyan-300 font-bold" : "text-slate-500"}>
                    {enableWebcam && activityMetrics.isRecording ? `[X:${pupilCoords[0]}% Y:${pupilCoords[1]}%]` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Blink Rate:</span>
                  <span className={enableWebcam && activityMetrics.isRecording ? "text-slate-300" : "text-slate-500"}>
                    {enableWebcam && activityMetrics.isRecording ? '14 bpm (Normal)' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW CORE 2: AI TASK ADHERENCE AUDITOR */}
          <div className="glass-panel rounded-3xl p-6 border-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
                <Scan className="text-indigo-400 animate-pulse" size={16} />
                AI Task Adherence Auditor
              </h3>
              
              {aiAdherence !== null ? (
                <span className={`font-mono text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded ${
                  aiAdherence > 75 
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                    : aiAdherence > 40 
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse' 
                    : 'border-rose-500/20 bg-rose-500/10 text-rose-400 animate-pulse'
                }`}>
                  {aiAdherence}% Match
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">STANDBY</span>
              )}
            </div>

            {/* AI HUD Scanner Screen */}
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4.5 min-h-[100px] relative overflow-hidden flex flex-col justify-center">
              
              {/* Sweeping Laser Scan Line */}
              {activityMetrics.isRecording && (
                <motion.div 
                  animate={{ y: [0, 95, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.8)] z-10 pointer-events-none"
                />
              )}

              <div className="font-mono text-[10px] leading-relaxed relative z-20">
                <div className="text-[8px] uppercase tracking-widest text-slate-500 font-black mb-1.5">TELEMETRY OCR BROADCAST:</div>
                <div className={
                  aiAdherence === null ? "text-slate-500 italic" : aiAdherence < 40 ? "text-rose-400 font-bold" : "text-indigo-200"
                }>
                  {aiAdherenceStatus}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC NOTE AREA */}
          {activityMetrics.isRecording ? (
            <div className="glass-panel rounded-3xl p-6 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)] flex flex-col gap-4 max-h-[380px]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                  <Bookmark className="text-indigo-400" size={18} />
                  Live Notebook
                </h2>
                <span className="text-xs font-mono text-indigo-300 font-bold px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  {getRecordingTimestamp()}
                </span>
              </div>

              <div className="flex-grow overflow-y-auto max-h-[160px] pr-2 custom-scrollbar space-y-2">
                {notes.length === 0 ? (
                  <div className="text-xs text-slate-500 italic text-center py-6">
                    Add quick notes or bookmark key moments during your session.
                  </div>
                ) : (
                  [...notes].reverse().map(n => (
                    <div key={n.id} className="flex gap-2.5 items-start bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold mt-0.5">{n.time}</span>
                      <div className="text-xs flex-1">
                        {n.isBookmark ? (
                          <span className="text-indigo-300 font-bold flex items-center gap-1">
                            <Bookmark size={10} fill="currentColor" /> {n.text}
                          </span>
                        ) : (
                          <span className="text-slate-300 leading-normal">{n.text}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={activeNoteText}
                  onChange={(e) => setActiveNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addQuickNote(false)}
                  placeholder="Type a quick note..."
                  className="flex-1 bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500/30 transition-all font-medium"
                />
                <button 
                  onClick={() => addQuickNote(false)}
                  className="bg-indigo-500 hover:bg-indigo-400 text-black p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title="Add Note"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => addQuickNote(true)}
                  className="bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title="Bookmark Moment"
                >
                  <Bookmark size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-lg font-medium text-slate-100 mb-4 uppercase tracking-wide">Recording Output</h2>
              
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      {activityMetrics.recordingUrl ? 'Capture ready' : 'No saved capture yet'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {activityMetrics.recordingUrl
                        ? `${formatBytes(activityMetrics.recordedBytes)} webm file`
                        : 'Stop a recording to generate a download.'}
                    </div>
                  </div>

                  {activityMetrics.recordingUrl && (
                    <a
                      href={activityMetrics.recordingUrl}
                      download={downloadName || 'signalos-activity.webm'}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>

                {notes.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Bookmark size={12} fill="currentColor" className="text-indigo-400" />
                      Session Log & Bookmarks
                    </h3>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {notes.map(n => (
                        <div key={n.id} className="flex gap-2.5 items-start text-xs border-b border-white/[0.02] pb-1.5 last:border-b-0">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">{n.time}</span>
                          <span className={n.isBookmark ? "text-indigo-300 font-semibold flex items-center gap-1" : "text-slate-300"}>
                            {n.isBookmark && <Bookmark size={8} fill="currentColor" />} {n.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTES METRICS */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 mb-3">Signal Notes</h2>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>Biometric eye-gaze tracking leverages facial presence tracking to enforce look-away focus penalties.</p>
              <p>Task adherence scanning matches active key inputs and window states against task tags to restrict decoy browser navigation.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

