
import React, { useState, useEffect, useRef, useCallback } from 'react';

const Metronome: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  
  // Tap Tempo state
  const tapTimesRef = useRef<number[]>([]);

  const scheduleNote = (time: number, beatIndex: number) => {
    if (!audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    osc.type = 'square';
    
    if (beatIndex === 0) {
        osc.frequency.value = 1200; // High click
        envelope.gain.value = 1.0;
    } else {
        osc.frequency.value = 800; // Low click
        envelope.gain.value = 0.5;
    }

    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);
    osc.start(time);
    osc.stop(time + 0.05);

    // Visual sync
    const drawTime = (time - audioContextRef.current.currentTime) * 1000;
    setTimeout(() => {
        setCurrentBeat(beatIndex);
    }, Math.max(0, drawTime));
  };

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
  };

  // Scheduler Ref Logic
  const beatIndexRef = useRef(0);

  const runScheduler = useCallback(() => {
     if (!isPlaying || !audioContextRef.current) return;
     
     const lookahead = 25.0;
     const scheduleAheadTime = 0.1;

     while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
         scheduleNote(nextNoteTimeRef.current, beatIndexRef.current);
         
         const secondsPerBeat = 60.0 / bpm;
         nextNoteTimeRef.current += secondsPerBeat;
         
         beatIndexRef.current = (beatIndexRef.current + 1) % beatsPerMeasure;
     }
     
     timerRef.current = window.setTimeout(runScheduler, lookahead);
  }, [isPlaying, bpm, beatsPerMeasure]);

  useEffect(() => {
      if (isPlaying) {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          if (audioContextRef.current.state === 'suspended') {
              audioContextRef.current.resume();
          }
          
          nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
          beatIndexRef.current = 0;
          runScheduler();
      } else {
          if (timerRef.current) clearTimeout(timerRef.current);
      }
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      }
  }, [isPlaying, runScheduler]);

  const handleTap = () => {
      const now = Date.now();
      const times = tapTimesRef.current;
      
      if (times.length > 0 && now - times[times.length - 1] > 2000) {
          tapTimesRef.current = [];
      }
      
      tapTimesRef.current.push(now);
      if (tapTimesRef.current.length > 4) tapTimesRef.current.shift();

      if (tapTimesRef.current.length > 1) {
          let intervals = [];
          for (let i = 1; i < tapTimesRef.current.length; i++) {
              intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i-1]);
          }
          const avg = intervals.reduce((a,b) => a+b) / intervals.length;
          const newBpm = Math.round(60000 / avg);
          if (newBpm >= 30 && newBpm <= 250) setBpm(newBpm);
      }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto bg-cardBg p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="text-center">
            <div className="text-[6rem] font-bold text-primary leading-none drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                {bpm}
            </div>
            <div className="text-slate-400 tracking-[0.2em] uppercase mt-2 font-semibold">BPM</div>
        </div>

        <div className="flex gap-4 h-8 items-center">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                <div 
                    key={i}
                    className={`
                        rounded-full transition-all duration-75
                        ${i === 0 ? 'w-6 h-6 border-2 border-white/20' : 'w-4 h-4 bg-white/10'}
                        ${currentBeat === i && isPlaying ? 'bg-accent shadow-[0_0_15px_#0ea5e9] scale-125' : ''}
                    `}
                />
            ))}
        </div>

        <div className="w-full flex items-center gap-4 bg-black/20 p-4 rounded-xl">
            <button onClick={() => setBpm(Math.max(30, bpm - 1))} className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 transition-colors">-</button>
            <input 
                type="range" 
                min="30" 
                max="250" 
                value={bpm} 
                onChange={(e) => setBpm(Number(e.target.value))}
                className="flex-1 accent-accent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <button onClick={() => setBpm(Math.min(250, bpm + 1))} className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 transition-colors">+</button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Maatsoort</label>
                <select 
                    value={beatsPerMeasure} 
                    onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
                    className="bg-bgDark border border-white/10 p-3 rounded-lg text-white focus:border-accent outline-none"
                >
                    <option value="2">2/4</option>
                    <option value="3">3/4</option>
                    <option value="4">4/4</option>
                    <option value="6">6/8</option>
                </select>
            </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Tap Tempo</label>
                <button 
                    onMouseDown={handleTap}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 active:bg-accent active:text-white p-3 rounded-lg font-bold transition-all"
                >
                    TAP
                </button>
            </div>
        </div>

        <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`
                w-full py-4 rounded-full text-xl font-bold shadow-lg transition-all transform hover:-translate-y-1
                ${isPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/50' 
                    : 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/50'}
            `}
        >
            {isPlaying ? 'STOP' : 'START'}
        </button>
    </div>
  );
};

export default Metronome;
