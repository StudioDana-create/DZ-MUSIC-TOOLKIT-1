import React, { useState, useEffect } from 'react';
import Piano from './Piano';
import { KEYS_DATA } from '../constants';

const ToneLadder: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<string>("C");
  const [selectedType, setSelectedType] = useState<string>("Majeur");
  const [activeChordIndices, setActiveChordIndices] = useState<number[]>([]);
  const [activeDegreeIndex, setActiveDegreeIndex] = useState<number | null>(null);

  const currentKeyData = KEYS_DATA[selectedNote]?.[selectedType as "Majeur" | "Mineur"];

  useEffect(() => {
      // Reset chord when key changes
      setActiveChordIndices([]);
      setActiveDegreeIndex(null);
  }, [selectedNote, selectedType]);

  // Calculate the continuous scale indices for the 24-key piano.
  // The piano starts at C (0). 
  // We want the scale to visually start from the Root note and ascend continuously.
  const getContinuousScaleIndices = () => {
      if (!currentKeyData) return [];
      const rootIndex = currentKeyData.indices[0]; // The root index (0-11)
      
      // Map indices: if an index is less than the rootIndex, it means it wraps around in modulo 12.
      // We want to display it in the next octave (index + 12).
      // Example: F Major (Root 5). Indices: 5, 7, 9, 10, 0, 2, 4.
      // Display: 5, 7, 9, 10, 12(0+12), 14(2+12), 16(4+12).
      return currentKeyData.indices.map(index => {
          if (index < rootIndex) {
              return index + 12; // Shift to 2nd octave
          }
          return index; // Keep in 1st octave
      });
  };

  const continuousScaleIndices = getContinuousScaleIndices();
  // We also need to map the first element of this array to be the visual root
  const continuousRootIndex = continuousScaleIndices[0];


  const handleDegreeClick = (degreeIndex: number, scaleIndices: number[]) => {
      // Logic to find chord notes on the 24-key piano
      
      const chordIndicesRelative = [
        degreeIndex,
        (degreeIndex + 2) % 7,
        (degreeIndex + 4) % 7
      ];

      const chordNoteValues = chordIndicesRelative.map(i => scaleIndices[i]); // 0-11 values

      let rootKeyIndex = -1;
      let thirdKeyIndex = -1;
      let fifthKeyIndex = -1;

      // Helper to find best key match
      // Prioritize keys that are within the "Continuous Scale" visual range (approx continuousRootIndex to continuousRootIndex + 12)
      const findBestKey = (noteValue: number, afterIndex: number = -1) => {
          // Candidates: noteValue (octave 1) and noteValue + 12 (octave 2)
          const c1 = noteValue;
          const c2 = noteValue + 12;

          // If we have a previous note (afterIndex), pick the one closest/higher than it to build a proper triad
          if (afterIndex !== -1) {
              if (c1 > afterIndex) return c1;
              if (c2 > afterIndex) return c2;
              // If neither is strictly higher (e.g. slight inversion or wrap), pick c2 usually
              return c2; 
          }

          // If it's the Root of the chord, try to pick it close to the Scale Root visualization
          // i.e., inside the continuous range we calculated.
          if (c1 >= continuousRootIndex) return c1;
          return c2;
      };

      rootKeyIndex = findBestKey(chordNoteValues[0]);
      thirdKeyIndex = findBestKey(chordNoteValues[1], rootKeyIndex);
      fifthKeyIndex = findBestKey(chordNoteValues[2], thirdKeyIndex);

      setActiveChordIndices([rootKeyIndex, thirdKeyIndex, fifthKeyIndex]);
      setActiveDegreeIndex(degreeIndex);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-center gap-4 bg-cardBg p-4 rounded-xl backdrop-blur-sm border border-white/10">
        <select 
          value={selectedNote} 
          onChange={(e) => setSelectedNote(e.target.value)}
          className="bg-bgDark text-white border border-white/10 p-3 rounded-lg text-lg min-w-[120px] focus:border-accent outline-none"
        >
          {Object.keys(KEYS_DATA).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-bgDark text-white border border-white/10 p-3 rounded-lg text-lg min-w-[120px] focus:border-accent outline-none"
        >
          <option value="Majeur">Majeur</option>
          <option value="Mineur">Mineur</option>
        </select>
      </div>

      {currentKeyData ? (
        <div className="bg-cardBg p-8 rounded-3xl backdrop-blur-md border border-white/5 shadow-xl animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-accent">
                {currentKeyData.name}
              </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Noten</h3>
                <div className="flex flex-wrap gap-2">
                    {currentKeyData.notes.map((n, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-md font-mono text-sm">{n}</span>
                    ))}
                </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Vingerzetting</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-1">
                        <span className="text-slate-400">Rechts (RH):</span>
                        <span className="font-mono">{currentKeyData.fingering.rh}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Links (LH):</span>
                        <span className="font-mono">{currentKeyData.fingering.lh}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Trappen</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {currentKeyData.degrees.map((deg, i) => {
                         let type = "Majeur";
                         if (deg.includes('°')) type = "Verminderd";
                         else if (deg === deg.toLowerCase()) type = "Mineur";
                         
                         return (
                            <button 
                                key={i}
                                onClick={() => handleDegreeClick(i, currentKeyData.indices)}
                                className={`
                                    flex flex-col items-center justify-center p-2 rounded-lg border transition-all min-w-[60px]
                                    ${activeDegreeIndex === i 
                                        ? 'bg-primary border-primary shadow-lg scale-105' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent'}
                                `}
                            >
                                <span className="font-serif font-bold text-lg">{deg}</span>
                                <span className="text-[10px] text-slate-400 uppercase">{type}</span>
                                <span className="text-xs mt-1 text-accent">{currentKeyData.notes[i]}</span>
                            </button>
                         )
                    })}
                </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <Piano 
                highlightIndices={continuousScaleIndices} 
                rootIndex={continuousRootIndex}
                chordIndices={activeChordIndices}
                keyCount={24}
            />
          </div>
        </div>
      ) : (
        <div className="text-center p-12 text-slate-500">
            Geen data beschikbaar voor deze toonsoort.
        </div>
      )}
    </div>
  );
};

export default ToneLadder;