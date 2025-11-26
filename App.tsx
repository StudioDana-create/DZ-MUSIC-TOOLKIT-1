
import React, { useState } from 'react';
import ToneLadder from './components/ToneLadder';
import NoteTrainer from './components/NoteTrainer';
import Metronome from './components/Metronome';
import ChordIndex from './components/ChordIndex';
import Progression251 from './components/Progression251';
import BeginnerPieces from './components/BeginnerPieces';

type Tool = 'dashboard' | 'toneladder' | 'notetrainer' | 'metronome' | 'chordindex' | 'progression251' | 'beginnerpieces';

const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<Tool>('dashboard');

  const renderTool = () => {
    switch(currentTool) {
      case 'toneladder': return <ToneLadder />;
      case 'notetrainer': return <NoteTrainer />;
      case 'metronome': return <Metronome />;
      case 'chordindex': return <ChordIndex />;
      case 'progression251': return <Progression251 />;
      case 'beginnerpieces': return <BeginnerPieces />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <ToolCard 
                title="Beginner Pieces" 
                desc="Simpele liedjes in C-positie voor beginners."
                icon="👶"
                onClick={() => setCurrentTool('beginnerpieces')}
            />
            <ToolCard 
                title="Piano Toonsoorten" 
                desc="Leer toonsoorten, noten en akkoorden."
                icon={<IconKeys />}
                onClick={() => setCurrentTool('toneladder')}
            />
             <ToolCard 
                title="Chord Index" 
                desc="Verken akkoorden, omkeringen en harmonie."
                icon="🧩"
                onClick={() => setCurrentTool('chordindex')}
            />
             <ToolCard 
                title="2-5-1 Trainer" 
                desc="Oefen jazz progressies in alle toonsoorten."
                icon={<IconSteps />}
                onClick={() => setCurrentTool('progression251')}
            />
             <ToolCard 
                title="Notentrainer" 
                desc="Oefen het lezen van noten op de balk."
                icon="🎼"
                onClick={() => setCurrentTool('notetrainer')}
            />
             <ToolCard 
                title="Metronoom Pro" 
                desc="Geavanceerde metronoom met tap tempo."
                icon="⏱️"
                onClick={() => setCurrentTool('metronome')}
            />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center p-6 bg-bgDark selection:bg-accent selection:text-white">
       {/* Background Effects - Deep Blue Theme */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-sky-900/20 rounded-full blur-[100px] -z-10"></div>

      <header className="w-full max-w-5xl mb-8 flex flex-col items-center">
        {currentTool !== 'dashboard' && (
            <button 
                onClick={() => setCurrentTool('dashboard')}
                className="self-start mb-4 text-slate-400 hover:text-accent flex items-center gap-2 transition-colors font-semibold"
            >
                ← Terug naar Dashboard
            </button>
        )}
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent mb-2 tracking-tight">
                DZ MUSIC TOOLKIT
            </h1>
            <p className="text-slate-400 text-lg">
                {currentTool === 'dashboard' ? 'Kies een tool om te oefenen' : 'Music Education Tools'}
            </p>
        </div>
      </header>

      <main className="w-full max-w-5xl z-10 pb-12">
        {renderTool()}
      </main>

      <footer className="mt-auto py-8 text-slate-600 text-sm font-medium">
        <p>DZ MUSIC TOOLKIT © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// --- Icons (Updated for Blue Theme) ---

const IconKeys = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-lg">
        <defs>
            <linearGradient id="grad_keys" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" /> {/* Blue 600 */}
                <stop offset="1" stopColor="#0ea5e9" /> {/* Sky 500 */}
            </linearGradient>
        </defs>
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#grad_keys)" strokeWidth="2" fill="none" />
        <path d="M6 4V12" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 4V12" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 4V12" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 4V12" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12V20" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12V20" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 12V20" stroke="url(#grad_keys)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 4H7V9H5V4Z" fill="url(#grad_keys)" fillOpacity="0.3" />
        <path d="M13 4H15V9H13V4Z" fill="url(#grad_keys)" fillOpacity="0.3" />
    </svg>
);

const IconSteps = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-lg">
        <defs>
            <linearGradient id="grad_steps" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" />
                <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
        </defs>
        <rect x="3" y="12" width="5" height="8" rx="1" stroke="url(#grad_steps)" strokeWidth="2" fill="url(#grad_steps)" fillOpacity="0.1"/>
        <text x="5.5" y="10" textAnchor="middle" fill="#0ea5e9" fontSize="6" fontWeight="bold" fontFamily="sans-serif">ii</text>
        
        <rect x="9.5" y="8" width="5" height="12" rx="1" stroke="url(#grad_steps)" strokeWidth="2" fill="url(#grad_steps)" fillOpacity="0.3"/>
        <text x="12" y="6" textAnchor="middle" fill="#0ea5e9" fontSize="6" fontWeight="bold" fontFamily="sans-serif">V</text>
        
        <rect x="16" y="4" width="5" height="16" rx="1" stroke="url(#grad_steps)" strokeWidth="2" fill="url(#grad_steps)" fillOpacity="0.5"/>
        <text x="18.5" y="12" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">I</text>
        
        <path d="M5.5 17 Q 12 22 18.5 17" stroke="url(#grad_steps)" strokeWidth="1" strokeDasharray="2 1" fill="none" opacity="0.5" />
    </svg>
);

// --- ToolCard Component ---

const ToolCard: React.FC<{title: string, desc: string, icon: React.ReactNode, onClick: () => void}> = ({ title, desc, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-cardBg p-8 rounded-3xl border border-white/5 hover:border-accent hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group text-left flex flex-col items-center text-center w-full backdrop-blur-sm"
    >
        <div className="mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center h-20 w-20 text-6xl">
            {typeof icon === 'string' ? (
                <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                    {icon}
                </span>
            ) : (
                icon
            )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">{title}</h2>
        <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{desc}</p>
    </button>
);

export default App;
