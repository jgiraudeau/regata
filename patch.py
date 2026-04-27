import re

with open('src/app/AppClient.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import type { Zone, Course, CourseType, TacticalBriefing, WindPoint, WavePoint, TideData, Mark } from '@/types';",
    "import type { Zone, Course, CourseType, TacticalBriefing, WindPoint, WavePoint, TideData, Mark, CurrentGrid } from '@/types';"
)

# 2. Update state
content = content.replace(
    "const [weatherData, setWeatherData] = useState<{ wind: WindPoint[]; waves: WavePoint[]; tide: TideData } | null>(null);",
    "const [weatherData, setWeatherData] = useState<{ wind: WindPoint[]; waves: WavePoint[]; tide: TideData; currents?: CurrentGrid } | null>(null);\n  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);"
)

# 3. Replace the briefing view
# We will use regex to find the block
match = re.search(r"if \(step === 'briefing' && briefing\) \{.*?\n  \}\n\n  // === CONFIG VIEW ===", content, re.DOTALL)
if match:
    old_block = match.group(0)
    
    # We will build the new block
    # We want a split layout: left column for the map, right column for the text (or stacked on mobile)
    new_block = """if (step === 'briefing' && briefing) {
    const windPoints = weatherData?.wind || [];
    const currentSlices = weatherData?.currents?.timeSlices || [];
    const currentWind = windPoints[selectedTimeIndex];
    const currentSlice = currentSlices[selectedTimeIndex];

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 relative">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <button onClick={() => setStep('config')} className="text-sm text-slate-500 hover:text-slate-700">
            ← Nouvelle analyse
          </button>
          <div className="flex items-center gap-2">
            <button onClick={exportTxt} title="Télécharger en .txt" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition">
              <FileText className="w-4 h-4" /> TXT
            </button>
            <button onClick={exportPdf} title="Imprimer / Enregistrer en PDF" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button onClick={shareBriefing} title="Partager" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition">
              <Share2 className="w-4 h-4" /> Partager
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Briefing Tactique</h1>
          <p className="mt-1 text-sm text-slate-500">
            {zoneName} — {raceDate} à {startTime} — {courseTypes.find((c) => c.value === courseType)?.label}
          </p>
        </div>

        {weatherData && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Vent</p>
              <p className="text-2xl font-bold">{(windPoints[0]?.speed / 1.852).toFixed(0)} kts</p>
              <p className="text-xs text-slate-400">{windPoints[0]?.direction}°</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Rafales</p>
              <p className="text-2xl font-bold">{(windPoints[0]?.gusts / 1.852).toFixed(0)} kts</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Houle</p>
              <p className="text-2xl font-bold">{weatherData.waves[0]?.height?.toFixed(1)}m</p>
              <p className="text-xs text-slate-400">T={weatherData.waves[0]?.period?.toFixed(0)}s</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Coef marée</p>
              <p className="text-2xl font-bold">{weatherData.tide.coefficient}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Carte et Timeline */}
          <div className="space-y-4">
            <div className="relative z-0 h-[500px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <MapLoader 
                marks={marks} 
                windPoint={currentWind}
                currentPoints={currentSlice?.points}
              />
              
              {/* Timeline Overlay */}
              {windPoints.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000] border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(currentWind?.time).getHours()}h00
                    </span>
                    {currentSlice && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Marée : {currentSlice.label}
                      </span>
                    )}
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={windPoints.length - 1} 
                    value={selectedTimeIndex} 
                    onChange={(e) => setSelectedTimeIndex(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1 px-1">
                    <span className="text-[10px] text-slate-400">{new Date(windPoints[0]?.time).getHours()}h</span>
                    <span className="text-[10px] text-slate-400">{new Date(windPoints[windPoints.length - 1]?.time).getHours()}h</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Légende */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-4 text-xs">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-purple-500 flex items-center justify-center rounded-sm">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(180deg)'}}>
                     <line x1="12" y1="19" x2="12" y2="5"></line>
                     <polyline points="5 12 12 5 19 12"></polyline>
                   </svg>
                 </div>
                 <span>Vent</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-green-500 flex items-center justify-center rounded-sm">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(0deg)'}}>
                     <line x1="12" y1="19" x2="12" y2="5"></line>
                     <polyline points="5 12 12 5 19 12"></polyline>
                   </svg>
                 </div>
                 <span>Courant (faible)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-amber-500 flex items-center justify-center rounded-sm">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(0deg)'}}>
                     <line x1="12" y1="19" x2="12" y2="5"></line>
                     <polyline points="5 12 12 5 19 12"></polyline>
                   </svg>
                 </div>
                 <span>Courant (moyen)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-red-500 flex items-center justify-center rounded-sm">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(0deg)'}}>
                     <line x1="12" y1="19" x2="12" y2="5"></line>
                     <polyline points="5 12 12 5 19 12"></polyline>
                   </svg>
                 </div>
                 <span>Courant (fort)</span>
               </div>
            </div>
          </div>

          {/* Colonne droite : Briefing */}
          <div className="space-y-6">
            <div className="rounded-xl bg-blue-50 p-6">
              <h2 className="text-lg font-semibold text-blue-900">Conditions</h2>
              <p className="mt-2 text-blue-800">{briefing.conditionsSummary}</p>
            </div>

            <div className="rounded-xl bg-amber-50 p-6">
              <h2 className="text-lg font-semibold text-amber-900">Recommandations clés</h2>
              <div className="mt-3 space-y-3">
                {briefing.keyRecommendations
                  .sort((a, b) => a.priority - b.priority)
                  .map((rec, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">
                        {rec.priority}
                      </span>
                      <div>
                        <p className="text-amber-900">{rec.recommendation}</p>
                        {rec.timing && <p className="text-xs text-amber-600">{rec.timing}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-6">
              <h2 className="text-lg font-semibold text-green-900">Options favorables</h2>
              <div className="mt-3 space-y-4">
                {briefing.favorableOptions.map((opt, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-green-800">{opt.title}</h3>
                    <p className="mt-1 text-sm text-green-700">{opt.description}</p>
                    {opt.area && <p className="mt-1 text-xs text-green-500">Zone : {opt.area}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-red-50 p-6">
              <h2 className="text-lg font-semibold text-red-900">Options défavorables</h2>
              <div className="mt-3 space-y-4">
                {briefing.unfavorableOptions.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${opt.risk === 'high' ? 'bg-red-500' : opt.risk === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <div>
                      <h3 className="font-medium text-red-800">{opt.title}</h3>
                      <p className="mt-1 text-sm text-red-700">{opt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {briefing.timingConsiderations.length > 0 && (
              <div className="rounded-xl bg-purple-50 p-6">
                <h2 className="text-lg font-semibold text-purple-900">Timeline</h2>
                <div className="mt-3 space-y-3">
                  {briefing.timingConsiderations.map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="shrink-0 font-mono text-sm font-bold text-purple-700">{t.time}</span>
                      <div>
                        <p className="font-medium text-purple-800">{t.event}</p>
                        <p className="text-sm text-purple-600">{t.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === CONFIG VIEW ==="""
    
    content = content.replace(old_block, new_block)
    
    with open('src/app/AppClient.tsx', 'w') as f:
        f.write(content)
    print("Successfully replaced.")
else:
    print("Match not found.")
