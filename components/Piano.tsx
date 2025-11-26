
import React, { useRef, useEffect } from 'react';

interface PianoProps {
  highlightIndices?: number[];
  chordIndices?: number[];
  rootIndex?: number;
  onKeyClick?: (midi: number) => void;
  showLabels?: boolean;
  customLabels?: { [index: number]: string }; // Map absolute index to label text
  keyCount?: number; // Control number of keys
  startMidi?: number; // Starting MIDI note (default C4 = 60)
}

const Piano: React.FC<PianoProps> = ({ 
  highlightIndices = [], 
  chordIndices = [], 
  rootIndex = -1,
  onKeyClick,
  showLabels = true,
  customLabels,
  keyCount = 24, // Default to 2 octaves
  startMidi = 60 // Default to C4
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  // Create keys based on keyCount starting from startMidi
  const keys = [];
  for (let i = 0; i < keyCount; i++) {
    const midi = startMidi + i;
    const noteIndex = midi % 12;
    keys.push({
      note: notes[noteIndex],
      index: noteIndex, // 0-11 relative index for note naming
      absoluteIndex: i, // 0-23 absolute index for unique identification
      midi: midi, 
      isBlack: notes[noteIndex].includes("#")
    });
  }

  // Auto-scroll to center active chords
  useEffect(() => {
    if (chordIndices.length > 0 && scrollContainerRef.current) {
        const getIsBlack = (i: number) => {
            const noteIdx = (startMidi + i) % 12;
            return [1, 3, 6, 8, 10].includes(noteIdx);
        };

        const KEY_WIDTH = 64; // Approx 4rem (w-16)

        // Calculate pixel bounds of the chord based on WHITE keys only
        let minPixel = Infinity;
        let maxPixel = -Infinity;

        chordIndices.forEach(idx => {
             // Count white keys before this index
             let whiteKeysBefore = 0;
             for(let k = 0; k < idx; k++) {
                 if(!getIsBlack(k)) whiteKeysBefore++;
             }
             
             // Approximate center of the key slot
             const pos = whiteKeysBefore * KEY_WIDTH;
             
             if(pos < minPixel) minPixel = pos;
             if(pos > maxPixel) maxPixel = pos;
        });

        // Add width of a key to maxPixel to include the key itself
        maxPixel += KEY_WIDTH;

        const container = scrollContainerRef.current;
        const currentScroll = container.scrollLeft;
        const containerWidth = container.clientWidth;
        
        // Check if chord is out of view (left or right)
        // Add padding to sensitivity
        const padding = 20;
        const isOutOfView = (minPixel < currentScroll + padding) || (maxPixel > currentScroll + containerWidth - padding);
        
        if (isOutOfView) {
            // Center the chord
            const centerPos = (minPixel + maxPixel) / 2;
            container.scrollTo({
                left: centerPos - (containerWidth / 2),
                behavior: 'smooth'
            });
        }
    }
  }, [chordIndices, startMidi]);

  return (
    <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-6 custom-scrollbar touch-pan-x">
      <div className="relative h-48 select-none mx-auto flex" style={{ width: 'max-content' }}>
        {keys.map((key) => {
          const isHighlighted = highlightIndices.includes(key.absoluteIndex);
          // Fallback: checks relative index if highlighted list contains low numbers (0-11) but we are in higher octaves
          const isRelativeHighlighted = keyCount <= 12 && highlightIndices.includes(key.index);
          
          const active = isHighlighted || isRelativeHighlighted;
          const isRoot = rootIndex === key.absoluteIndex || (keyCount <= 12 && rootIndex === key.index);
          const isChord = chordIndices.includes(key.absoluteIndex); 
          
          // Determine Label
          let labelText = null;
          if (customLabels && customLabels[key.absoluteIndex]) {
              labelText = customLabels[key.absoluteIndex];
          } else if (showLabels) {
              labelText = key.note;
          }

          if (key.isBlack) {
            const whiteKeysBefore = keys.slice(0, key.absoluteIndex).filter(k => !k.isBlack).length;
            const leftPos = `calc(${whiteKeysBefore} * 4rem - 1.25rem)`;

            return (
              <div
                key={key.absoluteIndex}
                onMouseDown={(e) => { e.preventDefault(); onKeyClick?.(key.midi); }}
                onTouchStart={(e) => { e.preventDefault(); onKeyClick?.(key.midi); }}
                className={`
                  absolute z-40 w-10 h-32 rounded-b-md cursor-pointer
                  transition-all duration-100 border-x border-b border-black/50 shadow-[2px_3px_5px_rgba(0,0,0,0.4)]
                  flex justify-center items-end pb-4
                  ${isChord ? 'bg-accent !text-white' : 'bg-slate-900 text-slate-500'}
                  ${active && !isChord ? 'ring-2 ring-accent ring-inset shadow-[0_0_10px_#0ea5e9]' : ''}
                  active:scale-[0.98] active:bg-slate-800
                `}
                style={{ left: leftPos }}
              >
               {labelText && <span className={`text-[10px] pointer-events-none font-bold ${customLabels ? 'text-white opacity-90' : 'opacity-0 hover:opacity-100'}`}>{labelText}</span>}
              </div>
            );
          } else {
            // White key
             return (
              <div
                key={key.absoluteIndex}
                onMouseDown={(e) => { e.preventDefault(); onKeyClick?.(key.midi); }}
                onTouchStart={(e) => { e.preventDefault(); onKeyClick?.(key.midi); }}
                className={`
                  relative w-16 h-48 bg-white border-l border-b border-slate-300 rounded-b-[4px] cursor-pointer
                  transition-colors duration-100 z-0 shrink-0
                  text-slate-400 font-semibold flex justify-center items-end pb-4
                  ${isChord ? '!bg-accent !text-white shadow-[0_0_20px_rgba(14,165,233,0.6)] z-20' : 'hover:bg-slate-50 active:bg-slate-100'}
                  shadow-[inset_0_-5px_10px_rgba(0,0,0,0.05)]
                `}
              >
                {active && (
                  <div className={`absolute bottom-10 rounded-full shadow-lg ${isRoot ? 'w-4 h-4 bg-primary' : 'w-3 h-3 bg-accent/80'}`}></div>
                )}
                {labelText && <span className={`pointer-events-none ${customLabels ? 'text-lg font-bold text-slate-600 mb-1' : 'text-sm'}`}>{labelText}</span>}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Piano;
