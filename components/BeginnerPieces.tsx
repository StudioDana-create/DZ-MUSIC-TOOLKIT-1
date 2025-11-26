
import React, { useState, useEffect, useRef } from 'react';
import Piano from './Piano';

// --- Constants & Data ---

type HandPosition = 'Central C' | 'Normal C';
type Level = 1 | 2 | 3;
type Duration = 'quarter' | 'half' | 'whole';
type Speed = 'Slow' | 'Medium' | 'Fast';

interface NoteStep {
    pitch: string;
    duration: Duration;
}

interface Song {
    id: string;
    title: string;
    level: Level;
    handUsage: 'RH' | 'LH' | 'Both';
    notes: NoteStep[];
}

// Finger mappings for display on keys
const FINGER_MAPS: { [key in HandPosition]: { [note: string]: string } } = {
    'Normal C': {
        "C3": "5", "D3": "4", "E3": "3", "F3": "2", "G3": "1", // LH
        "C4": "1", "D4": "2", "E4": "3", "F4": "4", "G4": "5"  // RH
    },
    'Central C': {
        "F3": "5", "G3": "4", "A3": "3", "B3": "2", "C4": "1", // LH (Thumb on C4)
        "D4": "2", "E4": "3", "F4": "4", "G4": "5"             // RH
    }
};

const SPEEDS: { [key in Speed]: number } = {
    'Slow': 60,
    'Medium': 90,
    'Fast': 120
};

const DURATION_MULTIPLIERS: { [key in Duration]: number } = {
    'quarter': 1,
    'half': 2,
    'whole': 4
};

const DURATION_SYMBOLS: { [key in Duration]: string } = {
    'quarter': '♩', // Quarter note
    'half': '𝅗𝅥',    // Half note
    'whole': '𝅝'    // Whole note
};

// --- Song Library ---

const SONGS: Song[] = [
    // --- Level 1 ---
    {
        id: 'mary',
        title: 'Mary Had a Little Lamb',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "half" },
            { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "C4", duration: "whole" }
        ]
    },
    {
        id: 'jingle',
        title: 'Jingle Bells',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "E4", duration: "whole" }
        ]
    },
    {
        id: 'lightly',
        title: 'Lightly Row (Kortjakje)',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "G4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "half" },
            { pitch: "F4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "half" },
            { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" },
            { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "half" }
        ]
    },
    {
        id: 'jacob',
        title: 'Vader Jacob',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "C4", duration: "quarter" },
            { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "C4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "half" }
        ]
    },
    {
        id: 'scale_c',
        title: 'C Major Scale (Up)',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" },
            { pitch: "G4", duration: "whole" }
        ]
    },
    {
        id: 'clair',
        title: 'Au Clair de la Lune',
        level: 1,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "E4", duration: "half" }, { pitch: "D4", duration: "half" },
            { pitch: "C4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "C4", duration: "whole" }
        ]
    },

    // --- Level 2 ---
    {
        id: 'twinkle',
        title: 'Twinkle Twinkle Little Star',
        level: 2,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" },
            { pitch: "A4", duration: "quarter" }, { pitch: "A4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "F4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "half" },
            { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "F4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "half" },
            { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "F4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "half" },
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" },
            { pitch: "A4", duration: "quarter" }, { pitch: "A4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "F4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "whole" }
        ]
    },
    {
        id: 'london',
        title: 'London Bridge',
        level: 2,
        handUsage: 'RH',
        notes: [
            { pitch: "G4", duration: "quarter" }, { pitch: "A4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "F4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "half" },
            { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "half" }
        ]
    },
    {
        id: 'saints',
        title: 'Oh When The Saints',
        level: 2,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "whole" },
            { pitch: "C4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "whole" },
            { pitch: "C4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "E4", duration: "half" },
            { pitch: "C4", duration: "half" }, { pitch: "E4", duration: "half" }, { pitch: "D4", duration: "whole" }
        ]
    },
    {
        id: 'long',
        title: 'Long, Long Ago',
        level: 2,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "quarter" },
            { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "half" }
        ]
    },

    // --- Level 3 ---
    {
        id: 'ode',
        title: 'Ode to Joy',
        level: 3,
        handUsage: 'RH',
        notes: [
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "quarter" },
            { pitch: "G4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "half" }
        ]
    },
    {
        id: 'surprise',
        title: 'Surprise Symphony (Haydn)',
        level: 3,
        handUsage: 'Both', // Needs Central C for B3
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "G4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "E4", duration: "half" },
            { pitch: "F4", duration: "quarter" }, { pitch: "F4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "B3", duration: "quarter" }, { pitch: "B3", duration: "quarter" }, { pitch: "C4", duration: "half" }
        ]
    },
    {
        id: 'row',
        title: 'Row Row Row Your Boat',
        level: 3,
        handUsage: 'RH',
        notes: [
            { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "C4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "E4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "E4", duration: "quarter" },
            { pitch: "F4", duration: "quarter" }, { pitch: "G4", duration: "whole" }
        ]
    },
    {
        id: 'musette',
        title: 'Musette (Bach)',
        level: 3,
        handUsage: 'RH',
        notes: [
            { pitch: "G4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "G4", duration: "quarter" }, { pitch: "D4", duration: "quarter" },
            { pitch: "G4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "G4", duration: "half" },
            { pitch: "F4", duration: "quarter" }, { pitch: "E4", duration: "quarter" }, { pitch: "D4", duration: "quarter" }, { pitch: "C4", duration: "quarter" },
            { pitch: "D4", duration: "whole" }
        ]
    }
];

const START_MIDI = 48; // C3
const KEY_COUNT = 29; // C3 to E5 approx

const BeginnerPieces: React.FC = () => {
    // State
    const [handPos, setHandPos] = useState<HandPosition>('Central C');
    const [levelFilter, setLevelFilter] = useState<number | 'All'>('All');
    const [speed, setSpeed] = useState<Speed>('Medium');
    const [currentSongId, setCurrentSongId] = useState<string>(SONGS[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(-1); 
    
    // Derived
    const currentSong = SONGS.find(s => s.id === currentSongId) || SONGS[0];
    const filteredSongs = SONGS.filter(s => levelFilter === 'All' || s.level === levelFilter);
    const currentFingerMap = FINGER_MAPS[handPos];

    // Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Helpers
    const getMidiFromNote = (note: string) => {
        const name = note.slice(0, -1);
        const oct = parseInt(note.slice(-1));
        const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const idx = notes.indexOf(name);
        return (oct + 1) * 12 + idx;
    };

    const activeNoteStep = currentNoteIndex >= 0 ? currentSong.notes[currentNoteIndex] : null;
    const activeNoteMidi = activeNoteStep ? getMidiFromNote(activeNoteStep.pitch) : null;
    const activeNoteIndices = activeNoteMidi !== null ? [activeNoteMidi - START_MIDI] : [];
    
    // Highlight all song notes on piano
    const songMidiNotes = currentSong.notes.map(n => getMidiFromNote(n.pitch));
    const uniqueSongMidis = [...new Set(songMidiNotes)];
    const uniqueSongIndices = uniqueSongMidis.map(m => m - START_MIDI);

    // --- Audio ---
    const playTone = (midi: number, durationSec: number) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        osc.frequency.value = freq;
        osc.type = 'sine'; 

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.setValueAtTime(0.5, now + durationSec - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec + 0.1);
    };

    const startPlayback = () => {
        setIsPlaying(true);
        setCurrentNoteIndex(0);
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        setCurrentNoteIndex(-1);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    // --- Playback Effect ---
    useEffect(() => {
        if (isPlaying && currentNoteIndex >= 0 && currentNoteIndex < currentSong.notes.length) {
            const step = currentSong.notes[currentNoteIndex];
            const bpm = SPEEDS[speed];
            const beatMs = 60000 / bpm;
            const durationMs = beatMs * DURATION_MULTIPLIERS[step.duration];

            // Play sound
            const midi = getMidiFromNote(step.pitch);
            playTone(midi, durationMs / 1000);

            // Schedule next
            timerRef.current = window.setTimeout(() => {
                setCurrentNoteIndex(prev => prev + 1);
            }, durationMs);

            // Auto-scroll
            if (containerRef.current) {
                const NOTES_SPACING = 60;
                const START_X = 100;
                const noteX = START_X + currentNoteIndex * NOTES_SPACING;
                const containerW = containerRef.current.clientWidth;
                // Center the note
                containerRef.current.scrollTo({
                    left: noteX - containerW / 2,
                    behavior: 'smooth'
                });
            }

        } else if (isPlaying && currentNoteIndex >= currentSong.notes.length) {
            setIsPlaying(false);
            setCurrentNoteIndex(-1);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, [isPlaying, currentNoteIndex, currentSong, speed]);

    // --- Canvas Rendering (Staff) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Settings
        const NOTES_SPACING = 60;
        const START_X = 100;
        const LINE_SPACING = 14;
        
        // Dynamic Width
        const totalWidth = START_X + currentSong.notes.length * NOTES_SPACING + 100;
        const dpr = window.devicePixelRatio || 1;
        
        // Resize canvas
        canvas.width = totalWidth * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = `${totalWidth}px`;
        canvas.style.height = `200px`;
        
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, totalWidth, 200);

        const centerY = 100;
        
        // Draw Staff Lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#334155'; // Slate-700
        for (let i = -2; i <= 2; i++) {
            const y = centerY + i * LINE_SPACING;
            ctx.beginPath();
            ctx.moveTo(20, y);
            ctx.lineTo(totalWidth - 20, y);
            ctx.stroke();
        }

        // Determine Clef based on hand usage or pitch range
        const isBass = currentSong.handUsage === 'LH';
        // Draw Clef Text
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '60px serif';
        if (isBass) {
            ctx.fillText('𝄢', 50, centerY - 5); // Bass clef
        } else {
            ctx.fillText('𝄞', 50, centerY + 2); // Treble clef
        }

        // Draw Notes
        // Treble Center (B4) = 71
        // Bass Center (D3) = 50
        const centerMidi = isBass ? 50 : 71;

        const getStaffStep = (midi: number) => {
            const scaleSteps = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]; // C to B steps
            const octave = Math.floor(midi / 12) - 1;
            const noteIdx = midi % 12;
            return (octave * 7) + scaleSteps[noteIdx];
        };
        const centerStep = getStaffStep(centerMidi);

        currentSong.notes.forEach((noteStep, i) => {
            const midi = getMidiFromNote(noteStep.pitch);
            const currentStep = getStaffStep(midi);
            const stepDiff = centerStep - currentStep;
            
            const x = START_X + i * NOTES_SPACING;
            const y = centerY + (stepDiff * (LINE_SPACING / 2));
            
            // Color active note
            const isActive = i === currentNoteIndex;
            ctx.fillStyle = isActive ? '#0ea5e9' : '#1e293b'; // Sky Blue vs Slate
            ctx.strokeStyle = isActive ? '#0ea5e9' : '#1e293b';

            // Draw Ledger Lines
            const topY = centerY - 2 * LINE_SPACING;
            const bottomY = centerY + 2 * LINE_SPACING;
            
            if (y <= topY - LINE_SPACING) { // Note above staff
                ctx.beginPath();
                for (let ly = topY - LINE_SPACING; ly >= y; ly -= LINE_SPACING) {
                    ctx.moveTo(x - 12, ly);
                    ctx.lineTo(x + 12, ly);
                }
                ctx.stroke();
            } else if (y >= bottomY + LINE_SPACING) { // Note below staff
                ctx.beginPath();
                for (let ly = bottomY + LINE_SPACING; ly <= y; ly += LINE_SPACING) {
                    ctx.moveTo(x - 12, ly);
                    ctx.lineTo(x + 12, ly);
                }
                ctx.stroke();
            }

            // Draw Note Head
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 6, 0, 0, 2 * Math.PI);
            
            if (noteStep.duration === 'whole' || noteStep.duration === 'half') {
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.fill();
            }

            // Draw Stem
            if (noteStep.duration !== 'whole') {
                ctx.beginPath();
                ctx.lineWidth = 2;
                if (y <= centerY) {
                    // Stem Down (from left side)
                    ctx.moveTo(x - 8, y);
                    ctx.lineTo(x - 8, y + 40);
                } else {
                    // Stem Up (from right side)
                    ctx.moveTo(x + 8, y);
                    ctx.lineTo(x + 8, y - 40);
                }
                ctx.stroke();
            }
            
            // Draw Finger Number hint (optional, small above/below)
            if (isActive) {
                const finger = currentFingerMap[noteStep.pitch];
                if (finger) {
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    const labelY = y <= centerY ? y + 55 : y - 55;
                    ctx.fillText(finger, x, labelY);
                }
            }
        });

    }, [currentSong, currentNoteIndex, currentFingerMap]); // Redraw on step update

    // Handlers
    const handleNextSong = () => {
        const idx = filteredSongs.findIndex(s => s.id === currentSongId);
        const next = filteredSongs[(idx + 1) % filteredSongs.length];
        setCurrentSongId(next.id);
        stopPlayback();
    };

    const handlePrevSong = () => {
        const idx = filteredSongs.findIndex(s => s.id === currentSongId);
        const prev = filteredSongs[(idx - 1 + filteredSongs.length) % filteredSongs.length];
        setCurrentSongId(prev.id);
        stopPlayback();
    };

    // Custom Labels for Piano
    const customLabels: { [index: number]: string } = {};
    Object.keys(currentFingerMap).forEach(noteName => {
        const midi = getMidiFromNote(noteName);
        const index = midi - START_MIDI;
        if (index >= 0 && index < KEY_COUNT) {
            customLabels[index] = currentFingerMap[noteName];
        }
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full justify-start">
            {/* Header */}
            <div className="text-center md:text-left mb-2">
                 <h2 className="text-3xl font-bold text-white mb-2">Beginner Pieces – C Position</h2>
                 <p className="text-slate-400">Simpele liedjes met notenbalk voor beginners.</p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-cardBg p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hand Positie</label>
                    <select 
                        value={handPos} 
                        onChange={(e) => setHandPos(e.target.value as HandPosition)}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-accent"
                    >
                        <option value="Central C">Centrale C</option>
                        <option value="Normal C">C Positie</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Niveau</label>
                    <select 
                        value={levelFilter} 
                        onChange={(e) => setLevelFilter(e.target.value === 'All' ? 'All' : parseInt(e.target.value) as any)}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-accent"
                    >
                        <option value="All">Alles</option>
                        <option value="1">Niveau 1</option>
                        <option value="2">Niveau 2</option>
                        <option value="3">Niveau 3</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Snelheid</label>
                    <select 
                        value={speed} 
                        onChange={(e) => setSpeed(e.target.value as Speed)}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-accent"
                    >
                        <option value="Slow">Langzaam (60 BPM)</option>
                        <option value="Medium">Normaal (90 BPM)</option>
                        <option value="Fast">Snel (120 BPM)</option>
                    </select>
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Liedje</label>
                    <select 
                        value={currentSongId} 
                        onChange={(e) => { setCurrentSongId(e.target.value); stopPlayback(); }}
                        className="bg-bgDark text-white border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-accent"
                    >
                        {filteredSongs.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Transport */}
            <div className="flex justify-center gap-4">
                <button onClick={handlePrevSong} className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-xl font-bold text-lg transition-colors">←</button>
                <button 
                    onClick={isPlaying ? stopPlayback : startPlayback}
                    className={`
                        px-8 py-4 rounded-xl font-bold text-lg min-w-[200px] shadow-lg transition-all transform hover:scale-105 flex flex-col items-center justify-center leading-none
                        ${isPlaying 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-gradient-to-r from-primary to-accent text-white'}
                    `}
                >
                    <span>{isPlaying ? 'STOP' : 'SPEEL AF ▶'}</span>
                </button>
                <button onClick={handleNextSong} className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-xl font-bold text-lg transition-colors">→</button>
            </div>

            {/* Score Display (Canvas) */}
            <div className="bg-white rounded-3xl shadow-xl p-4 overflow-hidden relative">
                <div 
                    ref={containerRef}
                    className="overflow-x-auto custom-scrollbar scroll-smooth w-full"
                >
                    <canvas ref={canvasRef} height={200} className="mx-auto" />
                </div>
                
                {/* Overlay Title */}
                <div className="absolute top-4 right-6 text-slate-400 text-sm font-bold uppercase tracking-wider bg-white/80 px-2 rounded">
                    {currentSong.title}
                </div>
            </div>

            {/* Song Info Bar */}
            <div className="flex gap-6 text-slate-500 text-xs uppercase tracking-widest w-full justify-center">
                <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full"></div> Kwart
                </span>
                <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-slate-500 rounded-full"></div> Half
                </span>
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-500 rounded-full"></div> Heel
                </span>
            </div>

            {/* Piano */}
            <div className="mt-4 pb-8 flex-grow">
                 <Piano 
                    highlightIndices={uniqueSongIndices} 
                    chordIndices={activeNoteIndices}     
                    keyCount={KEY_COUNT}
                    startMidi={START_MIDI}
                    showLabels={false} 
                    customLabels={customLabels}
                />
                <div className="text-center mt-4 text-slate-500 text-sm">
                    {handPos === 'Central C' ? 'Centrale C Positie: Duimen delen de centrale C' : 'Normale C Positie: RH duim op C, LH pink op C'}
                </div>
            </div>
        </div>
    );
};

export default BeginnerPieces;
