import React, { useState } from 'react'

export default function Reports({ reportData, onGenerateReport, isGenerating }) {
  const [logOpen, setLogOpen] = useState(false)

  const hasReport = reportData && reportData.message !== 'No document uploaded'
  const score = hasReport ? (reportData.risk_score ?? 0) : 68 // Use stitch default if no report
  const gaps = hasReport ? (reportData.gaps ?? []) : [
    'Unauthorized access attempt to L1 storage block',
    'SSL Certificate expiry in subdomain api.vault.internal',
    'Patch required for redundant backup service v4.1'
  ]
  const gapsCount = gaps.length
  
  // Custom mock register data combined with dynamic gaps if available
  const riskRegister = hasReport
    ? gaps.map((gap, i) => ({
        id: `VIQ-R${1000 + i}`,
        desc: gap,
        framework: ['GDPR ART 32', 'SOC2 TYPE II', 'HIPAA SEC', 'ISO 27001'][i % 4],
        severity: i === 0 ? 'CRITICAL' : i === 1 ? 'HIGH' : 'MEDIUM',
        status: i === 0 ? 'ACTIVE' : i === 1 ? 'REVIEWING' : 'QUEUED',
        color: i === 0 ? 'bg-error text-error' : i === 1 ? 'bg-orange-500 text-orange-500' : 'bg-yellow-400 text-yellow-400'
      }))
    : [
        { id: 'VIQ-2849', desc: 'Unauthorized access attempt to L1 storage block', framework: 'NIST CF 2.0', severity: 'CRITICAL', status: 'ACTIVE', color: 'bg-error text-error' },
        { id: 'VIQ-3102', desc: 'SSL Certificate expiry in subdomain api.vault.internal', framework: 'SOC2 TYPE II', severity: 'HIGH', status: 'REVIEWING', color: 'bg-orange-500 text-orange-500' },
        { id: 'VIQ-3155', desc: 'Patch required for redundant backup service v4.1', framework: 'GDPR ART 32', severity: 'MEDIUM', status: 'QUEUED', color: 'bg-yellow-400 text-yellow-400' }
      ]

  const now = new Date()
  const timeStr = now.toTimeString().split(' ')[0]

  return (
    <div className="p-8 space-y-6 animate-fade-in-up">
      {!hasReport && !isGenerating ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">assessment</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Document Context</h3>
          <p className="text-on-surface-variant text-center max-w-md mb-6">
            Generate a fresh Compliance Audit Report using the latest intelligence context in the system.
          </p>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all primary-glow btn-glow"
          >
            <span className="material-symbols-outlined">refresh</span>
            Generate Compliance Report
          </button>
        </div>
      ) : isGenerating ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">settings</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Generating Intelligence...</h3>
          <p className="text-on-surface-variant text-sm mt-1">Cross-referencing legal frameworks and compiling risk vectors</p>
        </div>
      ) : (
        <>
          {/* Critical Alert Banner */}
          {gapsCount > 0 && (
            <div className="animate-pulse-red rounded-xl p-4 flex items-center justify-between border border-error/50 flex-wrap gap-4">
              <div className="flex items-center gap-4 text-white">
                <span className="material-symbols-outlined text-display-lg" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <div>
                  <h2 className="font-headline-md text-headline-md">{gapsCount} Compliance Gap(s) Require Attention</h2>
                  <p className="font-body-md opacity-90">Anomalous compliance deviations detected in the uploaded policy text.</p>
                </div>
              </div>
              <button className="bg-white text-error-container px-6 py-2 rounded font-bold font-label-caps hover:scale-105 transition-transform">
                INITIATE REMEDIATION
              </button>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI Card 1 */}
            <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">OPEN RISKS</p>
                  <h3 className="font-display-lg text-display-lg text-error">{gapsCount * 3}</h3>
                </div>
                <span className="material-symbols-outlined text-error/30 text-4xl">priority_high</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="text-[12px] font-data-md">+12% from last week</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-error w-1/3"></div>
            </div>

            {/* KPI Card 2 */}
            <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">IN PROGRESS</p>
                  <h3 className="font-display-lg text-display-lg text-secondary">{gapsCount}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary/30 text-4xl">published_with_changes</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="text-[12px] font-data-md">Avg. Response: 4.2h</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-secondary w-1/2"></div>
            </div>

            {/* KPI Card 3 */}
            <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">RESOLVED THIS MONTH</p>
                  <h3 className="font-display-lg text-display-lg text-primary">34</h3>
                </div>
                <span className="material-symbols-outlined text-primary/30 text-4xl">check_circle</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="text-[12px] font-data-md">{score}% Compliance Score</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-primary w-2/3"></div>
            </div>
          </div>

          {/* Bento Section: Chart & Posture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Line Chart Section */}
            <div className="lg:col-span-8 glass-card p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-headline-md text-headline-md text-on-surface">Risk Trend — Last 6 Months</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-error"></span><span className="text-[10px] font-label-caps">Crit</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span class="text-[10px] font-label-caps">High</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span><span className="text-[10px] font-label-caps">Med</span></div>
                </div>
              </div>
              <div className="h-[300px] w-full relative">
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  <div className="h-full w-full border-b border-l border-outline-variant relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 grid grid-rows-4">
                      <div className="border-t border-outline-variant/20"></div>
                      <div className="border-t border-outline-variant/20"></div>
                      <div className="border-t border-outline-variant/20"></div>
                      <div className="border-t border-outline-variant/20"></div>
                    </div>
                    {/* SVG Path for Line Chart */}
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                      <path
                        className="drop-shadow-[0_0_5px_#ffb4ab]"
                        d="M0 220 Q 50 180, 100 190 T 200 130 T 300 160 T 400 80 T 500 100 T 600 30"
                        fill="none"
                        stroke="#ffb4ab"
                        strokeWidth="2"
                      ></path>
                      <path
                        d="M0 240 Q 50 230, 100 220 T 200 200 T 300 210 T 400 190 T 500 180 T 600 160"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    {/* Month Markers */}
                    <div className="absolute -bottom-6 w-full flex justify-between text-[10px] font-label-caps text-on-surface-variant">
                      <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Intelligence Radar/Gauge */}
            <div className="lg:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-2">Security Posture</h4>
                <p className="text-body-sm text-on-surface-variant">Real-time aggregate risk coefficient across all enterprise nodes.</p>
              </div>
              <div className="relative py-8 flex items-center justify-center">
                <div className="risk-gauge-container">
                  <div className="risk-gauge"></div>
                  {/* Gauge active pointer rotation mapping: -90deg is 0%, 0deg is 50%, 90deg is 100% */}
                  <div
                    className="risk-gauge-active"
                    style={{ transform: `rotate(${-90 + (score / 100) * 180}deg)` }}
                  ></div>
                </div>
                <div className="absolute bottom-6 text-center">
                  <span className="font-display-lg text-display-lg text-primary">{score}</span>
                  <p className="font-label-caps text-[10px] text-on-surface-variant">OPTIMAL RANGE</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-body-sm">
                  <span>Data Integrity</span>
                  <span className="text-primary font-data-md">{Math.min(score + 10, 100)}%</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(score + 10, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span>Threat Neutralization</span>
                  <span className="text-secondary font-data-md">{Math.max(score - 10, 0)}%</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${Math.max(score - 10, 0)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Register Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center flex-wrap gap-4">
              <h4 className="font-headline-md text-headline-md text-on-surface">Risk Register</h4>
              <div className="flex gap-2">
                <input
                  className="bg-surface-container border border-outline-variant rounded px-3 py-1.5 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
                  placeholder="Filter ID..."
                  type="text"
                />
                <button className="flex items-center gap-2 border border-outline-variant px-4 py-1.5 rounded text-label-caps hover:bg-surface-container transition-colors text-xs font-bold font-label-caps">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  EXPORT CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container/50 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Risk ID</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Framework</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {riskRegister.map((item, idx) => (
                    <tr key={idx} className="hover:bg-primary/5 transition-colors group table-row-hover">
                      <td className="px-6 py-4 font-data-md text-primary">{item.id}</td>
                      <td className="px-6 py-4 text-body-sm max-w-sm truncate" title={item.desc}>{item.desc}</td>
                      <td className="px-6 py-4">
                        <span className="text-label-caps bg-surface-container-high px-2 py-0.5 rounded text-[10px] border border-outline-variant uppercase">
                          {item.framework}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center h-full">
                        <span className={`risk-dot ${item.color.split(' ')[0]}`}></span>
                        <span className={`font-bold text-xs ${item.color.split(' ')[1]}`}>{item.severity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'ACTIVE' ? 'bg-error/10 text-error' : item.status === 'REVIEWING' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                        } status-pill`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collapsible A2A Log */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-6 hover:bg-surface-container transition-colors text-left"
              onClick={() => setLogOpen(!logOpen)}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary">terminal</span>
                <h4 className="font-headline-md text-headline-md text-on-surface">Agent Communication Log (A2A)</h4>
              </div>
              <span className={`material-symbols-outlined transition-transform duration-300 ${logOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {logOpen && (
              <div className="bg-[#0D1321] p-6 font-data-md text-data-md space-y-2 border-t border-outline-variant max-h-60 overflow-y-auto custom-scrollbar">
                {hasReport ? (
                  <>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[{timeStr}]</span>
                      <span className="text-primary">[INGESTION_A1]</span>
                      <span className="text-on-surface-variant">Document parsing complete. Analyzed compliance text blocks.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[{timeStr}]</span>
                      <span className="text-error">[RISK_ENGINE_B7]</span>
                      <span className="text-error">ANALYSIS COMPLETE: Found {gapsCount} compliance gap(s). Risk score: {score}%</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[{timeStr}]</span>
                      <span className="text-secondary">[REPORT_AGENT_C1]</span>
                      <span className="text-on-surface-variant">Synthesized executive report for human analyst review.</span>
                    </div>
                    {gaps.map((g, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="text-secondary-fixed-dim">[{timeStr}]</span>
                        <span className="text-error">[A2A_ALERT]</span>
                        <span className="text-error">GAP: {g}</span>
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[{timeStr}]</span>
                      <span className="text-primary">[BIGQUERY_MCP]</span>
                      <span className="text-on-surface-variant">
                        Report {reportData.bigquery_saved ? 'saved to BigQuery database.' : 'generated (BigQuery database sync skipped).'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[14:22:01]</span>
                      <span className="text-primary">[INGESTION_A1]</span>
                      <span className="text-on-surface-variant">Streaming cloud logs to Risk Analyzer... [DATA_PKT_083]</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[14:22:05]</span>
                      <span className="text-error">[RISK_ENGINE_B7]</span>
                      <span className="text-error">CRITICAL_THREAT_FOUND: Entropy shift in block_auth. Key: "ADMIN_ROOT"</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[14:22:08]</span>
                      <span className="text-secondary">[REPORT_AGENT_C1]</span>
                      <span className="text-on-surface-variant">Synthesized VIQ-2849 summary for human analyst review.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[14:23:45]</span>
                      <span className="text-primary">[INGESTION_A1]</span>
                      <span className="text-on-surface-variant">Heartbeat check: All nodes responsive. Latency 14ms.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-secondary-fixed-dim">[14:24:12]</span>
                      <span className="text-on-tertiary-fixed-variant">System: Auto-backup initiated for affected partition.</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
