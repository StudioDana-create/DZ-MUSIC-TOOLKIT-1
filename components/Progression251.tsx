
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Piano from './Piano';

// --- Constants & Music Theory ---

const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const KEYS = [
    { name: "C", val: 0, type: 'sharp' },
    { name: "Db", val: 1, type: 'flat' },
    { name: "D", val: 2, type: 'sharp' },
    { name: "Eb", val: 3, type: 'flat' },
    { name: "E", val: 4, type: 'sharp' },
    { name: "F", val: 5, type: 'flat' },
    { name: "F#", val: 6, type: 'sharp' },
    { name: "Gb", val: 6, type: 'flat' },
    { name: "G", val: 7, type: 'sharp' },
    { name: "Ab", val: 8, type: 'flat' },
    { name: "A", val: 9, type: 'sharp' },
    { name: "Bb", val: 10, type: 'flat' },
    { name: "B", val: 11, type: 'sharp' }
];

// Chord Formulas (Semitones from root)
const CHORD_FORMULAS: { [key: string]: number[] } = {
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'dom7': [0, 4, 7, 10],
    'm7b5': [0, 3, 6, 10]
};

interface ChordStep {
    roman: string;
    degreeOffset: number; // semitones from key root
    quality: string;
    suffix: string;
    beats: number; // Rhythm duration
}

// Logic: ii (1 bar), V (1 bar), I (2 bars)
// Assuming 4/4 time -> 4 beats, 4 beats, 8 beats
const PROG_MAJOR: ChordStep[] = [
    { roman: 'ii', degreeOffset: 2, quality: 'min7', suffix: 'm7', beats: 4 },
    { roman: 'V', degreeOffset: 7, quality: 'dom7', suffix: '7', beats: 4 },
    { roman: 'I', degreeOffset: 0, quality: 'maj7', suffix: 'maj7', beats: 8 }
];

const PROG_MINOR: ChordStep[] = [
    { roman: 'iiø', degreeOffset: 2, quality: 'm7b5', suffix: 'ø7', beats: 4 },
    { roman: 'V', degreeOffset: 7, quality: 'dom7', suffix: '7', beats: 4 },
    { roman: 'i', degreeOffset: 0, quality: 'min7', suffix: 'm7', beats: 8 }
];

// Playback Config
const START_MIDI = 36; // C2 - Extended range for Drop voicings
const KEY_COUNT = 48; // 4 octaves (C2 to B5) to accommodate Drop 2/3 and Rootless

type VoicingMode = 'Low' | 'Mid' | 'High' | 'Drop 2' | 'Drop 3' | 'Rootless';

const Progression251: React.FC = () => {
    // State
    const [keyIndex, setKeyIndex] = useState(0); // Index in KEYS
    const [mode, setMode] = useState<'Major' | 'Minor'>('Major');
    const [bpm, setBpm] = useState(70); 
    const [voicingMode, setVoicingMode] = useState<VoicingMode>('Mid');
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState(0); // 0, 1, or 2

    // Refs for Audio & Timer
    const audioCtxRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<number | null>(null);

    // Derived Data
    const currentKey = KEYS[keyIndex];
    const progTemplate = mode === 'Major' ? PROG_MAJOR : PROG_MINOR;
    const currentStep = progTemplate[activeStepIndex];

    // Helper: Get Note Name
    const getNoteName = (midi: number) => {
        const idx = midi % 12;
        return currentKey.type === 'flat' ? NOTES_FLAT[idx] : NOTES_SHARP[idx];
    };

    // Calculate current chord notes with simple voice leading
    const calculateChordNotes = (step: ChordStep) => {
        // Absolute root of the chord (0-11)
        const rootVal = (currentKey.val + step.degreeOffset) % 12;
        
        // Bass note: Root in C3 octave (48-59)
        const bassMidi = 48 + ((rootVal - 48 % 12 + 12) % 12);
        
        let tones: number[] = [];

        // 1. ROOTLESS LOGIC
        if (voicingMode === 'Rootless') {
             // Rootless Voicings (A/B style or 9th chords)
             let intervals: number[] = [];
             
             if (step.quality === 'maj7') intervals = [4, 7, 11, 14]; // 3, 5, 7, 9
             else if (step.quality === 'min7') intervals = [3, 7, 10, 14]; // b3, 5, b7, 9
             else if (step.quality === 'dom7') intervals = [4, 9, 10, 14]; // 3, 13(6), b7, 9
             else if (step.quality === 'm7b5') intervals = [3, 6, 10, 12]; // b3, b5, b7, 8
             
             tones = intervals.map(i => bassMidi + i);
             tones = tones.map(note => {
                 while(note < 60) note += 12;
                 while(note > 79) note -= 12;
                 return note;
             });
        } 
        // 2. DROP VOICINGS
        else if (voicingMode === 'Drop 2' || voicingMode === 'Drop 3') {
            const formula = CHORD_FORMULAS[step.quality];
            let stack = formula.map(i => bassMidi + 24 + i);
            stack.sort((a,b) => a-b);
            
            if (voicingMode === 'Drop 2' && stack.length >= 2) {
                stack[stack.length - 2] -= 12;
            } else if (voicingMode === 'Drop 3' && stack.length >= 3) {
                stack[stack.length - 3] -= 12;
            }
            tones = stack;
        }
        // 3. STANDARD INVERSIONS
        else {
            let minRange = 60;
            let maxRange = 77;
            
            if (voicingMode === 'Low') {
                minRange = 53;
                maxRange = 70;
            } else if (voicingMode === 'High') {
                minRange = 67;
                maxRange = 84;
            }

            const formula = CHORD_FORMULAS[step.quality];
            tones = formula.map(interval => {
                let note = bassMidi + interval;
                while(note < minRange) note += 12;
                while(note > maxRange) note -= 12;
                return note;
            });
        }
        
        let cleanBass = bassMidi;
        while(cleanBass >= 60) cleanBass -= 12;

        const displayTones = [cleanBass, ...tones].sort((a,b) => a-b);
        return [...new Set(displayTones)]; // Dedup
    };

    const activeMidiNotes = calculateChordNotes(currentStep);
    const activeChordIndices = activeMidiNotes.map(m => m - START_MIDI); // Relative to Piano component start

    // Audio Playback
    const playChord = useCallback((notes: number[], beats: number) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const beatDuration = 60 / bpm;
        const totalDuration = beatDuration * beats;
        
        notes.forEach((midi, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            const freq = 440 * Math.pow(2, (midi - 69) / 12);
            osc.frequency.value = freq;
            osc.type = i === 0 ? 'triangle' : 'sine'; 

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(i === 0 ? 0.3 : 0.1, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration); 

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + totalDuration + 0.1);
        });
    }, [bpm]);

    // Playback Loop Logic
    useEffect(() => {
        if (isPlaying) {
            playChord(calculateChordNotes(currentStep), currentStep.beats);

            const beatSec = 60 / bpm;
            const stepDurationSec = beatSec * currentStep.beats;

            timerRef.current = window.setTimeout(() => {
                setActiveStepIndex(prev => (prev + 1) % 3);
            }, stepDurationSec * 1000);

        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, activeStepIndex, bpm]);

    const prevChord = () => { setActiveStepIndex(prev => (prev - 1 + 3) % 3); setIsPlaying(false); };
    const nextChord = () => { setActiveStepIndex(prev => (prev + 1) % 3); setIsPlaying(false); };

    useEffect(() => {
        setActiveStepIndex(0);
        setIsPlaying(false);
    }, [keyIndex, mode, voicingMode]);

    const chordRootName = getNoteName(currentKey.val + currentStep.degreeOffset);
    const chordSymbol = `${chordRootName}${currentStep.suffix}`;
    const tonesNames = activeMidiNotes.map(m => getNoteName(m));
    
    const getDegrees = (quality: string) => {
        if (quality === 'min7') return "1 - b3 - 5 - b7";
        if (quality === 'dom7') return "1 - 3 - 5 - b7";
        if (quality === 'maj7') return "1 - 3 - 5 - 7";
        if (quality === 'm7b5') return "1 - b3 - b5 - b7";
        return "";
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto h-full justify-start">
            {/* Controls - Compacted */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-cardBg p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Toonsoort</label>
                    <select 
                        value={keyIndex} 
                        onChange={(e) => setKeyIndex(parseInt(e.target.value))}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-lg text-sm"
                    >
                        {KEYS.map((k, i) => ( <option key={i} value={i}>{k.name}</option> ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Modus</label>
                    <select 
                        value={mode} onChange={(e) => setMode(e.target.value as any)}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-lg text-sm"
                    >
                        <option value="Major">Majeur</option>
                        <option value="Minor">Mineur</option>
                    </select>
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Voicing</label>
                    <select 
                        value={voicingMode} onChange={(e) => setVoicingMode(e.target.value as any)}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-lg text-sm"
                    >
                        <option value="Mid">Midden (Mid)</option>
                        <option value="Low">Laag (Low)</option>
                        <option value="High">Hoog (High)</option>
                        <option value="Drop 2">Drop 2</option>
                        <option value="Drop 3">Drop 3</option>
                        <option value="Rootless">Rootless</option>
                    </select>
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex justify-between">
                        <span>Tempo</span> <span className="text-accent">{bpm}</span>
                    </label>
                    <input 
                        type="range" min="40" max="180" value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-full accent-accent h-2 bg-black/20 rounded-full cursor-pointer"
                    />
                </div>
            </div>

            {/* Transport */}
            <div className="flex justify-center gap-4">
                <button onClick={prevChord} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold text-sm">← Vorige</button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`
                        px-6 py-2 rounded-lg font-bold min-w-[120px] shadow-lg transition-all text-sm
                        ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gradient-to-r from-primary to-accent text-white hover:scale-105'}
                    `}
                >
                    {isPlaying ? 'STOP' : 'PLAY'}
                </button>
                <button onClick={nextChord} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold text-sm">Volgende →</button>
            </div>

            {/* Info Panel - Compacted */}
            <div className="bg-cardBg p-6 rounded-2xl backdrop-blur-md border border-white/5 shadow-xl flex flex-col items-center text-center gap-2 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] font-bold text-white/5 pointer-events-none select-none">
                    {currentStep.roman}
                </div>

                <div className="z-10 w-full">
                    <div className="text-accent font-bold tracking-widest uppercase text-xs mb-1">
                        Akkoord {activeStepIndex + 1} / 3 • {currentStep.beats / 4} {currentStep.beats / 4 === 1 ? 'Maat' : 'Maten'}
                    </div>
                    <div className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
                        {chordSymbol}
                    </div>
                    <div className="text-lg text-slate-300 font-mono mb-4">
                        {tonesNames.join(" - ")}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-left bg-black/20 p-4 rounded-xl w-full max-w-lg mx-auto">
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Functie</span>
                            <div className="text-sm">{getDegrees(currentStep.quality)}</div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Voicing</span>
                            <div className="text-sm truncate">
                                <span className="text-slate-400">LH:</span> {tonesNames[0]} <span className="text-slate-400">/ RH:</span> {tonesNames.slice(1).join("-")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Piano */}
            <div className="mt-2 flex-grow min-h-[14rem]">
                 <Piano 
                    highlightIndices={[]} 
                    chordIndices={activeChordIndices}
                    keyCount={KEY_COUNT}
                    startMidi={START_MIDI}
                    showLabels={true}
                />
            </div>
        </div>
    );
};

export default Progression251;
