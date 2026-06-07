import React, { useState, useRef } from 'react'

export default function Upload({ uploadedFiles, onUploadFile, isUploading }) {
  const [dragActive, setDragActive] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const fileInputRef = useRef(null)

  // Stepper state determination based on current uploading progress
  const getStepStatus = (stepIndex) => {
    if (!isUploading) {
      if (uploadedFiles.length > 0 && uploadedFiles[0].status === 'complete') {
        return 'complete'
      }
      return 'idle'
    }
    
    // We are uploading: simulate processing steps
    const activeFile = uploadedFiles[0]
    if (!activeFile) return 'idle'

    const progress = activeFile.progress
    if (stepIndex === 1) {
      return progress >= 30 ? 'complete' : 'active'
    }
    if (stepIndex === 2) {
      if (progress < 30) return 'idle'
      return progress >= 60 ? 'complete' : 'active'
    }
    if (stepIndex === 3) {
      if (progress < 60) return 'idle'
      return progress >= 90 ? 'complete' : 'active'
    }
    if (stepIndex === 4) {
      if (progress < 90) return 'idle'
      return progress >= 100 ? 'complete' : 'active'
    }
    return 'idle'
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0])
    }
  }

  const triggerBrowse = () => {
    fileInputRef.current.click()
  }

  const filterPills = [
    { id: 'all', label: 'All' },
    { id: 'gdpr', label: 'GDPR' },
    { id: 'hipaa', label: 'HIPAA' },
    { id: 'soc2', label: 'SOC2' },
    { id: 'iso27001', label: 'ISO27001' }
  ]

  // Filter history list based on selected filter
  const filteredHistory = uploadedFiles.filter(file => {
    if (activeFilter === 'all') return true
    // Assign random frameworks mock-wise for displaying
    const frameworks = ['gdpr', 'hipaa', 'soc2', 'iso27001']
    const mockFramework = frameworks[file.name.length % frameworks.length]
    return mockFramework === activeFilter
  })

  return (
    <div className="p-8 space-y-6 animate-fade-in-up">
      {/* Framework Filter Pills */}
      <div className="flex flex-wrap gap-3">
        {filterPills.map(pill => {
          const isActive = activeFilter === pill.id
          return (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-label-caps transition-all ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'glass-card text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Upload Drop Zone & Queue */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerBrowse}
            className={`glass-card rounded-xl p-10 flex flex-col items-center justify-center border-dashed border-2 min-h-[320px] transition-all cursor-pointer group ${
              dragActive
                ? 'border-primary bg-primary/10 drop-zone-active'
                : 'border-primary/40 bg-primary/5 hover:bg-primary/10'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-primary animate-bounce-subtle" style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud_upload
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Ingest New Intelligence</h2>
            <p className="text-on-surface-variant text-body-md mb-8 max-w-md text-center">
              Drag and drop policy documents, audit logs, or compliance frameworks. Supported formats: PDF, DOCX, CSV.
            </p>
            <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg flex items-center gap-2 hover:shadow-[0_0_15px_rgba(168,232,255,0.4)] transition-all pointer-events-none">
              <span className="material-symbols-outlined">add</span>
              Browse Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.csv,.txt"
            />
          </div>

          {/* Active Upload Queue */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">pending_actions</span>
                Active Upload Queue
              </h3>
              <span className="text-on-surface-variant text-xs font-label-caps uppercase">
                {uploadedFiles.filter(f => f.status !== 'complete').length} Task(s) Active
              </span>
            </div>
            <div className="space-y-6">
              {uploadedFiles.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4 opacity-60">
                  No files in queue. Upload a document to get started.
                </p>
              ) : (
                uploadedFiles.map((f, i) => {
                  const isDone = f.status === 'complete'
                  const isErr = f.status === 'error'
                  const statusColor = isDone ? 'primary' : isErr ? 'error' : 'secondary'
                  const statusLabel = isDone ? 'READY' : isErr ? 'FAILED' : 'EXTRACTING'
                  const barWidth = Math.min(f.progress || 0, 100)
                  const icon = f.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'
                  const glow = isDone ? 'shadow-[0_0_8px_rgba(168,232,255,0.5)]' : !isErr ? 'shadow-[0_0_8px_rgba(76,215,246,0.5)]' : ''

                  return (
                    <div key={i} className="space-y-2 animate-fade-in-up">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-${statusColor}`}>{icon}</span>
                          <div>
                            <p className="text-sm font-bold">{f.name}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                              {f.size} • {isDone ? 'Processing Complete' : isErr ? 'Upload Failed' : 'Extraction in Progress'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`status-pill bg-${statusColor}/10 text-${statusColor} border border-${statusColor}/20`}>
                            {statusLabel}
                          </span>
                          <span className={`font-data-md text-${statusColor}`}>{Math.round(barWidth)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${statusColor} ${glow} transition-all duration-300`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-card rounded-xl p-6 h-full border-primary/20">
            <h3 className="font-headline-md text-lg text-primary mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined">auto_fix_high</span>
              VaultIQ Agent Pipeline
            </h3>
            <div className="relative pl-10 space-y-12">
              <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] pipeline-line"></div>

              {/* Step 1 */}
              <PipelineStep
                step={1}
                title="Document Ingestion"
                desc="OCR and metadata extraction active. Parsing textual structures."
                status={getStepStatus(1)}
              />

              {/* Step 2 */}
              <PipelineStep
                step={2}
                title="Semantic Analysis"
                desc="Neural mapping of compliance clauses to global standards."
                status={getStepStatus(2)}
              />

              {/* Step 3 */}
              <PipelineStep
                step={3}
                title="Risk Profiling"
                desc="Scanning for high-priority deviations and threat vectors."
                status={getStepStatus(3)}
              />

              {/* Step 4 */}
              <PipelineStep
                step={4}
                title="Report Generation"
                desc="Synthesizing final executive summary and action plan."
                status={getStepStatus(4)}
              />
            </div>
          </div>
        </div>

        {/* Upload History Table (Full Width) */}
        <div className="col-span-12">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">history</span>
                Upload History
              </h3>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-label-caps text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 font-bold">Document</th>
                    <th className="px-6 py-4 font-bold">Framework</th>
                    <th className="px-6 py-4 font-bold">Uploaded</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-body-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant opacity-60">
                        No documents found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((f, i) => {
                      const frameworks = ['GDPR', 'HIPAA', 'SOC2', 'ISO27001']
                      const framework = frameworks[f.name.length % frameworks.length]
                      const timeString = f.timestamp ? f.timestamp.toLocaleString() : 'Just now'

                      return (
                        <tr key={i} className="hover:bg-primary/5 transition-colors group table-row-hover">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-sm">article</span>
                              </div>
                              <span className="font-bold">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] border border-outline-variant uppercase">
                              {framework}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-data-md">{timeString}</td>
                          <td className="px-6 py-4">
                            <span className={`status-pill ${f.status === 'complete' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-error border-red-500/20'}`}>
                              {f.status === 'complete' ? 'Verified' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelineStep({ step, title, desc, status }) {
  let dotClass = 'bg-surface-container border-outline'
  let dotContent = <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></div>
  let titleClass = 'text-on-surface-variant'
  let labelClass = 'text-on-surface-variant bg-surface-container border-outline-variant'
  let labelText = 'IDLE'
  let stepOpacity = 'opacity-50'

  if (status === 'active') {
    dotClass = 'bg-surface-container border-outline'
    dotContent = <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4cd7f6]"></div>
    titleClass = 'text-secondary'
    labelClass = 'text-secondary bg-secondary/10 border-secondary/20'
    labelText = 'PROCESSING'
    stepOpacity = ''
  } else if (status === 'complete') {
    dotClass = 'bg-primary border-surface shadow-[0_0_10px_rgba(168,232,255,0.6)]'
    dotContent = <span className="material-symbols-outlined text-background text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
    titleClass = 'text-primary'
    labelClass = 'text-primary bg-primary/10 border-primary/20'
    labelText = 'COMPLETE'
    stepOpacity = ''
  }

  return (
    <div className={`relative group ${stepOpacity} transition-all duration-300`}>
      <div className={`absolute -left-[37px] top-0 w-7 h-7 rounded-full border-4 flex items-center justify-center z-10 transition-transform ${dotClass}`}>
        {dotContent}
      </div>
      <div className="space-y-1">
        <p className={`font-bold text-sm uppercase tracking-wider ${titleClass}`}>{title}</p>
        <p className="text-xs text-on-surface-variant">{desc}</p>
        <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded border ${labelClass}`}>
          {labelText}
        </span>
      </div>
    </div>
  )
}
