
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Piano from './Piano';

interface Note {
  midi: number;
  note: string;
}

const NoteTrainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [useAccidentals, setUseAccidentals] = useState(false);
  const [useLedger, setUseLedger] = useState(false);
  const [useCPositions, setUseCPositions] = useState(false); // New state for beginner restriction
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const generateNote = useCallback(() => {
      let midi;

      if (useCPositions) {
          // Beginner Mode: Specific sets of white keys
          if (clef === 'treble') {
              // C Position & Middle C Position RH: C4 - G4
              const allowed = [60, 62, 64, 65, 67]; 
              midi = allowed[Math.floor(Math.random() * allowed.length)];
          } else {
              // C Position LH (C3-G3) + Middle C Position LH (F3-C4)
              // Combined Range: C3 (48) to C4 (60)
              const allowed = [48, 50, 52, 53, 55, 57, 59, 60];
              midi = allowed[Math.floor(Math.random() * allowed.length)];
          }
      } else {
          // Standard Logic
          let min, max;
          if (clef === 'treble') {
              // E4 (64) - F5 (77) standard
              min = useLedger ? 60 : 64; 
              max = useLedger ? 81 : 77;
          } else {
              // G2 (43) - A3 (57) standard
              min = useLedger ? 40 : 43;
              max = useLedger ? 60 : 57;
          }

          midi = Math.floor(Math.random() * (max - min + 1)) + min;
          
          // Filter accidentals
          const noteIndex = midi % 12;
          const isBlack = notes[noteIndex].includes('#');

          if (!useAccidentals && isBlack) {
              midi += 1;
          }
      }

      setCurrentNote({
          midi,
          note: notes[midi % 12]
      });
      setFeedback(null);
  }, [clef, useAccidentals, useLedger, useCPositions]);

  useEffect(() => {
    generateNote();
  }, [generateNote]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentNote) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas setup
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Config
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const lineSpacing = 16;
    const staffWidth = 200;

    // Draw Staff
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i = -2; i <= 2; i++) {
        const y = centerY + (i * lineSpacing);
        ctx.moveTo(centerX - staffWidth/2, y);
        ctx.lineTo(centerX + staffWidth/2, y);
    }
    ctx.stroke();

    // Draw Clef
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (clef === 'treble') {
        // G-Clef: Spiral centers on G line (2nd from bottom = centerY + lineSpacing)
        ctx.font = '100px serif';
        // Shift down to align the spiral loop with the G line
        ctx.fillText('𝄞', centerX - staffWidth/2 + 40, centerY + 12); 
    } else {
        // F-Clef: Dots straddle F line (2nd from top = centerY - lineSpacing)
        // With large font, the center of glyph is much lower than the dots.
        // We shift down (positive Y) to bring the dots down to the F line.
        ctx.font = '100px serif';
        ctx.fillText('𝄢', centerX - staffWidth/2 + 40, centerY + 8); 
    }

    // Draw Note
    // Treble Center Line (B4) = MIDI 71
    // Bass Center Line (D3) = MIDI 50
    const centerMidi = (clef === 'treble') ? 71 : 50;
    
    const getStaffStep = (midi: number) => {
        // Map midi to scale steps (C=0, D=1, E=2...)
        const scaleSteps = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
        const octave = Math.floor(midi / 12) - 1;
        const noteIdx = midi % 12;
        return (octave * 7) + scaleSteps[noteIdx];
    };

    const currentStep = getStaffStep(currentNote.midi);
    const centerStep = getStaffStep(centerMidi);
    const stepDiff = centerStep - currentStep;
    const y = centerY + (stepDiff * (lineSpacing / 2));
    const x = centerX + 20;

    // Ledger Lines
    const topY = centerY - (2 * lineSpacing);
    const bottomY = centerY + (2 * lineSpacing);
    
    ctx.beginPath();
    if (y <= topY - lineSpacing) {
        for (let ly = topY - lineSpacing; ly >= y; ly -= lineSpacing) {
            ctx.moveTo(x - 16, ly);
            ctx.lineTo(x + 16, ly);
        }
    }
    if (y >= bottomY + lineSpacing) {
        for (let ly = bottomY + lineSpacing; ly <= y; ly += lineSpacing) {
            ctx.moveTo(x - 16, ly);
            ctx.lineTo(x + 16, ly);
        }
    }
    ctx.stroke();

    // Note Head
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 8, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Accidental
    if (currentNote.note.includes('#')) {
        ctx.font = '24px serif';
        ctx.fillText('♯', x - 25, y + 4);
    }

  }, [currentNote, clef]);

  const handlePianoInput = (midi: number) => {
      if (!currentNote || feedback) return;

      // Check note index (C=0, C#=1...) regardless of octave
      if (midi % 12 === currentNote.midi % 12) {
          setScore(s => s + 10);
          setFeedback('correct');
          setTimeout(() => {
              generateNote();
          }, 800);
      } else {
          setScore(s => Math.max(0, s - 5));
          setFeedback('wrong');
          setTimeout(() => {
            setFeedback(null);
          }, 500);
      }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto items-center">
      <div className="flex flex-wrap justify-center gap-4 bg-cardBg p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full">
         <select 
            value={clef} 
            onChange={(e) => setClef(e.target.value as 'treble'|'bass')}
            className="bg-bgDark text-white border border-white/10 p-2 rounded-lg"
         >
            <option value="treble">G-sleutel (Viool)</option>
            <option value="bass">F-sleutel (Bas)</option>
         </select>
         
         <div className="flex gap-4 items-center">
             <label className="flex items-center gap-2 cursor-pointer text-white bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors">
                <input 
                    type="checkbox" 
                    checked={useCPositions} 
                    onChange={e => setUseCPositions(e.target.checked)} 
                    className="accent-primary w-5 h-5" 
                />
                <span className="text-sm font-semibold">C-Posities (Beginners)</span>
             </label>

             {!useCPositions && (
                <>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="checkbox" checked={useAccidentals} onChange={e => setUseAccidentals(e.target.checked)} className="accent-primary w-5 h-5" />
                        <span className="text-sm">Mollen & Kruizen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="checkbox" checked={useLedger} onChange={e => setUseLedger(e.target.checked)} className="accent-primary w-5 h-5" />
                        <span className="text-sm">Hulplijnen</span>
                    </label>
                </>
             )}
         </div>

         <div className="ml-auto font-bold text-2xl text-accent">
            Score: {score}
         </div>
      </div>

      <div className="relative w-full">
         <div className={`
            absolute top-4 left-0 right-0 text-center font-bold text-lg transition-all z-20
            ${feedback === 'correct' ? 'text-green-600 scale-110' : feedback === 'wrong' ? 'text-red-500 shake' : 'opacity-0'}
         `}>
            {feedback === 'correct' ? 'Goed zo!' : 'Probeer nog eens!'}
         </div>
         
         <div className="bg-white rounded-xl shadow-2xl overflow-hidden h-64 w-full flex items-center justify-center">
             <canvas ref={canvasRef} className="w-full h-full" />
         </div>
      </div>

      <div className="w-full">
          {/* Piano input: 1 Octave (12 keys) abstraction */}
          <Piano 
            onKeyClick={handlePianoInput} 
            showLabels={true} 
            highlightIndices={[]} 
            keyCount={12}
          />
      </div>
    </div>
  );
};

export default NoteTrainer;
