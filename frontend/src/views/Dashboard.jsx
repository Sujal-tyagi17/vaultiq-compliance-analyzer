import React, { useEffect, useState } from 'react'

export default function Dashboard({ data, onNavigate }) {
  const [gaugeRotate, setGaugeRotate] = useState(-45)

  // Default values or database values
  const docsCount = data?.documents ?? 0
  const riskScore = docsCount > 0 ? (data?.risk_score ?? 0) : 84
  const gapsCount = docsCount > 0 ? (data?.gaps ?? 0) : 7
  const isDemoMode = docsCount === 0

  useEffect(() => {
    // Animate risk gauge rotation after mount
    const timer = setTimeout(() => {
      // Rotate from -45deg (0%) to 135deg (100%)
      const rotation = -45 + (riskScore / 100) * 180
      setGaugeRotate(rotation)
    }, 300)
    return () => clearTimeout(timer)
  }, [riskScore])

  // Donut chart calculations
  const radius = 100
  const stroke = 16
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  
  // Segments for GDPR (92%), SOC2 (78%), HIPAA (82%)
  const strokeDashoffsetGDPR = circumference - (92 / 100) * circumference
  const strokeDashoffsetSOC2 = circumference - (78 / 100) * circumference

  return (
    <div className="p-8 space-y-8 animate-fade-in-up">
      {/* Hero Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Compliance Overview</h2>
          <p className="text-on-surface-variant font-body-md mt-2">
            {isDemoMode ? (
              <>Showing Demo Data · Ingest your own compliance documents to view active posture</>
            ) : (
              <>Last analyzed: Just now · {docsCount} active framework documents analyzed</>
            )}
          </p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all primary-glow btn-glow"
        >
          <span className="material-symbols-outlined">analytics</span>
          Run New Analysis
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">description</span>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">DOCUMENTS ANALYZED</p>
          <div className="flex items-baseline gap-2">
            <span className="font-data-lg text-4xl text-primary">{isDemoMode ? 142 : docsCount}</span>
            <span className="text-xs text-secondary">{isDemoMode ? '+12 this week' : 'active'}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">grid_view</span>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">ACTIVE FRAMEWORKS</p>
          <div className="flex items-baseline gap-2">
            <span className="font-data-lg text-4xl text-primary">4</span>
            <span className="text-xs text-on-surface-variant">Global Reach</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">warning</span>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">COMPLIANCE GAPS</p>
          <div className="flex items-baseline gap-2">
            <span className={`font-data-lg text-4xl ${gapsCount > 0 ? 'text-error' : 'text-primary'}`}>{gapsCount}</span>
            <span className="text-xs text-on-surface-variant">{isDemoMode ? '-2 resolved' : 'identified'}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">verified_user</span>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">AVG COMPLIANCE SCORE</p>
          <div className="flex items-baseline gap-2">
            <span className="font-data-lg text-4xl text-primary">{riskScore}%</span>
            <span className="text-xs text-secondary-fixed-dim">Target 95%</span>
          </div>
        </div>
      </div>

      {/* Analysis Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Donut Chart Card (60%) */}
        <div className="lg:col-span-6 glass-card rounded-xl p-8 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Framework Health</h3>
              <p className="text-sm text-on-surface-variant">Real-time aggregate compliance by sector</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-secondary inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-outline inline-block"></span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-around flex-wrap gap-6">
            <div className="relative">
              <svg className="w-64 h-64 -rotate-90">
                <circle cx="128" cy="128" fill="transparent" r={normalizedRadius} stroke="#1b2023" strokeWidth={stroke}></circle>
                {/* Segment 1: Primary Cyan */}
                <circle
                  cx="128"
                  cy="128"
                  fill="transparent"
                  r={normalizedRadius}
                  stroke="#a8e8ff"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: strokeDashoffsetGDPR }}
                  strokeLinecap="round"
                ></circle>
                {/* Segment 2: Secondary Teal */}
                <circle
                  cx="128"
                  cy="128"
                  fill="transparent"
                  r={normalizedRadius - stroke}
                  stroke="#4cd7f6"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: strokeDashoffsetSOC2 }}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-data-lg text-5xl text-on-surface">{riskScore}</span>
                <span className="text-xs text-on-surface-variant tracking-widest font-bold">AVG SCORE</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-primary"></div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold">GDPR</p>
                  <p className="font-data-md text-primary">92% COMPLIANT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-secondary"></div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold">SOC2</p>
                  <p className="font-data-md text-secondary">78% COMPLIANT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-surface-container-highest"></div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold">HIPAA</p>
                  <p className="font-data-md text-on-surface-variant">82% COMPLIANT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Bar Chart Card (40%) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-8">
          <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Risk Severity</h3>
          <p className="text-sm text-on-surface-variant mb-8">Detected vulnerabilities across fleet</p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-error uppercase">Critical</span>
                <span className="text-on-surface font-data-md">{isDemoMode ? '07' : gapsCount}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full" style={{ width: isDemoMode ? '15%' : `${Math.min(gapsCount * 10, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-secondary-container uppercase">High</span>
                <span className="text-on-surface font-data-md">{isDemoMode ? '14' : Math.floor(gapsCount * 0.5)}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-full" style={{ width: isDemoMode ? '35%' : `${Math.min(gapsCount * 5, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-primary uppercase">Medium</span>
                <span className="text-on-surface font-data-md">{isDemoMode ? '42' : '2'}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-on-surface-variant uppercase">Low</span>
                <span className="text-on-surface font-data-md">{isDemoMode ? '89' : '5'}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-on-surface-variant h-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Table & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table (70%) */}
        <div className="lg:col-span-8 glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">Framework Compliance</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Export PDF <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">FRAMEWORK</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-center">STATUS</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right">LAST SCAN</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr className="hover:bg-surface-container-high transition-colors table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">policy</span>
                      </div>
                      <span className="font-bold">GDPR Compliance</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isDemoMode || riskScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'} status-pill`}>
                      {isDemoMode || riskScore >= 80 ? 'VALID' : 'DRIFTED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-data-md text-sm text-on-surface-variant">2h ago</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('reports')} className="text-primary text-xs font-bold hover:glow px-3 py-1 border border-primary/30 rounded">
                      VIEW REPORT
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-lg">shield</span>
                      </div>
                      <span className="font-bold">SOC2 Type II</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20 status-pill">
                      DRIFTED
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-data-md text-sm text-on-surface-variant">5h ago</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('reports')} className="text-primary text-xs font-bold hover:glow px-3 py-1 border border-primary/30 rounded">
                      VIEW REPORT
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-error/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error text-lg">medical_services</span>
                      </div>
                      <span className="font-bold">HIPAA Security</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isDemoMode || gapsCount > 0 ? 'bg-error/10 text-error border-error/20' : 'bg-green-500/10 text-green-400 border-green-500/20'} status-pill`}>
                      {isDemoMode || gapsCount > 0 ? 'FAILING' : 'VALID'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-data-md text-sm text-on-surface-variant">12m ago</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('reports')} className="text-primary text-xs font-bold hover:glow px-3 py-1 border border-primary/30 rounded">
                      VIEW REPORT
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-outline-variant/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">language</span>
                      </div>
                      <span className="font-bold">ISO 27001</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 status-pill">
                      VALID
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-data-md text-sm text-on-surface-variant">1d ago</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onNavigate('reports')} className="text-primary text-xs font-bold hover:glow px-3 py-1 border border-primary/30 rounded">
                      VIEW REPORT
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Activity (30%) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-6 flex flex-col">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Agent Activity</h3>
          <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            {/* Activity Item */}
            <div className="relative pl-6 border-l border-outline-variant">
              <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-primary rounded-full"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm agent-pulse">PDF Ingestion Agent</span>
                <span className="font-data-md text-[10px] text-on-surface-variant uppercase">
                  {docsCount > 0 ? 'Idle' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {docsCount > 0 ? 'Parsing complete. Extracted text structures.' : 'Scanning directory uploads for incoming data...'}
              </p>
              {!isDemoMode && docsCount === 0 && (
                <div className="mt-2 w-full bg-surface-container h-1 rounded-full">
                  <div className="bg-primary h-full w-[65%] animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Activity Item */}
            <div className="relative pl-6 border-l border-outline-variant">
              <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-secondary rounded-full"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm agent-pulse">Risk Assessment Agent</span>
                <span className="font-data-md text-[10px] text-on-surface-variant uppercase">Idle</span>
              </div>
              <p className="text-xs text-on-surface-variant">Cross-referencing framework gaps with BigQuery log records.</p>
            </div>

            {/* Activity Item */}
            <div className="relative pl-6 border-l border-outline-variant">
              <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-surface-bright rounded-full"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">Report Generation Agent</span>
                <span className="font-data-md text-[10px] text-on-surface-variant uppercase">Complete</span>
              </div>
              <p className="text-xs text-on-surface-variant">Identified non-conforming clauses and output report logs.</p>
            </div>

            {/* Activity Item */}
            <div className="relative pl-6 border-l border-outline-variant opacity-60">
              <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-surface-bright rounded-full"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">System Auditor</span>
                <span className="font-data-md text-[10px] text-on-surface-variant uppercase">Log Saved</span>
              </div>
              <p className="text-xs text-on-surface-variant">Daily integrity check passed. No tamper signatures found.</p>
            </div>
          </div>
          <button className="mt-6 w-full py-3 border border-outline-variant rounded-lg text-sm font-bold hover:bg-surface-container transition-colors">
            VIEW FULL LOGS
          </button>
        </div>
      </div>

      {/* Footer / Technical Specs */}
      <footer className="mt-auto pt-6 border-t border-outline-variant flex justify-between items-center text-on-surface-variant">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="font-label-caps text-[10px]">ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="font-label-caps text-[10px]">VAULT-CORE V.2.4.1-STABLE</div>
        </div>
        <div className="font-data-md text-[10px] tracking-widest">
          ENCRYPTION: AES-256-GCM ACTIVE
        </div>
      </footer>
    </div>
  )
}
