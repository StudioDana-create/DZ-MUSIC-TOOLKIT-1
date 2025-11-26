
import React, { useState, useEffect } from 'react';
import Piano from './Piano';

// --- Constants ---

const ROOTS = [
    { name: "C", val: 0, type: 'sharp' },
    { name: "C#", val: 1, type: 'sharp' },
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

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const CHORDS: { [key: string]: { name: string, intervals: number[], degrees: string[], suffix: string } } = {
    // Triads
    "maj":  { name: "Majeur", intervals: [0, 4, 7], degrees: ["1", "3", "5"], suffix: "" },
    "min":  { name: "Mineur", intervals: [0, 3, 7], degrees: ["1", "b3", "5"], suffix: "m" },
    "dim":  { name: "Verminderd", intervals: [0, 3, 6], degrees: ["1", "b3", "b5"], suffix: "dim" },
    "aug":  { name: "Overmatig", intervals: [0, 4, 8], degrees: ["1", "3", "#5"], suffix: "aug" },
    "sus2": { name: "Sus2", intervals: [0, 2, 7], degrees: ["1", "2", "5"], suffix: "sus2" },
    "sus4": { name: "Sus4", intervals: [0, 5, 7], degrees: ["1", "4", "5"], suffix: "sus4" },
    // Sevenths
    "maj7": { name: "Majeur 7", intervals: [0, 4, 7, 11], degrees: ["1", "3", "5", "7"], suffix: "maj7" },
    "min7": { name: "Mineur 7", intervals: [0, 3, 7, 10], degrees: ["1", "b3", "5", "b7"], suffix: "m7" },
    "dom7": { name: "Dominant 7", intervals: [0, 4, 7, 10], degrees: ["1", "3", "5", "b7"], suffix: "7" },
    "m7b5": { name: "Half-verminderd", intervals: [0, 3, 6, 10], degrees: ["1", "b3", "b5", "b7"], suffix: "ø7" },
    "dim7": { name: "Verminderd 7", intervals: [0, 3, 6, 9], degrees: ["1", "b3", "b5", "bb7"], suffix: "dim7" }
};

const START_MIDI = 48; // C3
const KEY_COUNT = 36; // 3 Octaves

const ChordIndex: React.FC = () => {
    // State
    const [rootIndex, setRootIndex] = useState(0); // Index in ROOTS array
    const [type, setType] = useState("maj");
    const [inversion, setInversion] = useState(0);
    
    // Computed Data
    const currentRoot = ROOTS[rootIndex];
    const currentChord = CHORDS[type];
    const isSeventh = currentChord.intervals.length === 4;

    // Logic
    const getNoteName = (midiVal: number, useFlats: boolean) => {
        const index = midiVal % 12;
        return useFlats ? FLATS[index] : SHARPS[index];
    };

    // Calculate Notes
    const baseMidi = START_MIDI + currentRoot.val;
    let chordMidiNotes = currentChord.intervals.map(interval => baseMidi + interval);

    // Apply Inversion
    let activeMidiNotes = [...chordMidiNotes];
    for (let k = 0; k < inversion; k++) {
        activeMidiNotes.sort((a, b) => a - b);
        activeMidiNotes[0] += 12; 
    }
    activeMidiNotes.sort((a, b) => a - b);

    // Map MIDI to Piano Indices (relative to START_MIDI)
    const activeChordIndices = activeMidiNotes.map(m => m - START_MIDI);

    // Text Display Data
    const useFlats = currentRoot.type === 'flat';
    const noteNames = activeMidiNotes.map(m => getNoteName(m, useFlats));
    
    let degreesArr = [...currentChord.degrees];
    for (let k = 0; k < inversion; k++) {
        const moved = degreesArr.shift();
        if (moved) degreesArr.push(moved);
    }

    let invText = "Grondligging";
    if (inversion === 1) invText = "1e Omkering";
    if (inversion === 2) invText = "2e Omkering";
    if (inversion === 3) invText = "3e Omkering";

    // Handlers
    const reset = () => {
        setRootIndex(0);
        setType("maj");
        setInversion(0);
    };

    // Reset inversion if switching to triad from 3rd inversion
    useEffect(() => {
        if (!isSeventh && inversion === 3) {
            setInversion(0);
        }
    }, [type, isSeventh, inversion]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cardBg p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Grondtoon</label>
                    <select 
                        value={rootIndex} 
                        onChange={(e) => setRootIndex(parseInt(e.target.value))}
                        className="bg-bgDark text-white border border-white/10 p-3 rounded-xl focus:border-accent outline-none appearance-none"
                    >
                        {ROOTS.map((r, i) => (
                            <option key={i} value={i}>{r.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Type</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        className="bg-bgDark text-white border border-white/10 p-3 rounded-xl focus:border-accent outline-none appearance-none"
                    >
                        <optgroup label="Drieklanken">
                            <option value="maj">Majeur</option>
                            <option value="min">Mineur</option>
                            <option value="dim">Verminderd</option>
                            <option value="aug">Overmatig</option>
                            <option value="sus2">Sus2</option>
                            <option value="sus4">Sus4</option>
                        </optgroup>
                        <optgroup label="Vierklanken">
                            <option value="maj7">Majeur 7</option>
                            <option value="min7">Mineur 7</option>
                            <option value="dom7">Dominant 7</option>
                            <option value="m7b5">Half-verminderd</option>
                            <option value="dim7">Verminderd 7</option>
                        </optgroup>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Omkering</label>
                    <select 
                        value={inversion} 
                        onChange={(e) => setInversion(parseInt(e.target.value))}
                        className="bg-bgDark text-white border border-white/10 p-3 rounded-xl focus:border-accent outline-none appearance-none"
                    >
                        <option value="0">Grondligging</option>
                        <option value="1">1e Omkering</option>
                        <option value="2">2e Omkering</option>
                        <option value="3" disabled={!isSeventh}>3e Omkering</option>
                    </select>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-cardBg p-8 rounded-3xl backdrop-blur-md border border-white/5 shadow-xl flex flex-col items-center text-center gap-6">
                <div>
                    <div className="text-6xl md:text-8xl font-bold text-accent drop-shadow-[0_0_25px_rgba(14,165,233,0.4)] mb-2">
                        {currentRoot.name}{currentChord.suffix}
                    </div>
                    <div className="text-slate-400 text-lg">
                        {currentChord.name} • {invText}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-8 w-full border-t border-white/10 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Noten</span>
                        <span className="text-2xl font-bold">{noteNames.join(" - ")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                         <span className="text-xs text-slate-500 uppercase tracking-wider">Trappen</span>
                         <span className="text-2xl font-bold font-mono text-slate-300">{degreesArr.join(" - ")}</span>
                    </div>
                </div>
            </div>

            {/* Piano */}
            <div className="mt-4">
                 <Piano 
                    highlightIndices={[]} 
                    chordIndices={activeChordIndices}
                    keyCount={KEY_COUNT}
                    startMidi={START_MIDI}
                />
            </div>
            
            <button 
                onClick={reset}
                className="self-center text-slate-500 hover:text-white transition-colors"
            >
                Reset Instellingen
            </button>
        </div>
    );
};

export default ChordIndex;
