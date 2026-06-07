import React, { useState, useRef, useEffect } from 'react'

export default function Chat({ chatMessages, onSendMessage, isChatting, uploadedFiles }) {
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatting])

  const handleSend = (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || isChatting) return
    onSendMessage(inputText.trim())
    setInputText('')
  }

  const handleSuggestionClick = (text) => {
    if (isChatting) return
    onSendMessage(text)
  }

  // System reference documents (Stitch mock data) + newly uploaded documents
  const systemContexts = [
    { name: 'Data Retention Policy V2.pdf', score: 98, tag: 'GDPR', status: 'Modified 2h ago', icon: 'description', color: 'text-secondary' },
    { name: 'Privacy Notice - UK Branch.docx', score: 42, tag: 'UK-DPA', status: 'In Review', icon: 'article', color: 'text-error' },
    { name: 'EU Regulation 2016/679.txt', score: 85, tag: 'REGULATORY', status: 'Active', icon: 'gavel', color: 'text-primary' },
    { name: 'Encryption Standards_SEC.pdf', score: 71, tag: 'ISO 27001', status: 'Active', icon: 'terminal', color: 'text-primary-fixed-dim' }
  ]

  // Combine uploaded files (mapped to context format) and system contexts
  const customContexts = uploadedFiles
    .filter(f => f.status === 'complete')
    .map((f, i) => ({
      name: f.name,
      score: Math.floor(Math.random() * 40 + 60), // Random score for newly uploaded files
      tag: ['GDPR', 'HIPAA', 'SOC2', 'ISO27001'][i % 4],
      status: 'Just now',
      icon: 'description',
      color: 'text-primary'
    }))

  const allContexts = [...customContexts, ...systemContexts]

  const filteredContexts = allContexts.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const suggestionChips = [
    { text: 'Summarize gaps', icon: 'summarize' },
    { text: 'List critical risks', icon: 'report_problem' },
    { text: 'Draft privacy clause', icon: 'policy' },
    { text: 'Explain Article 32', icon: 'help' }
  ]

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Left Panel: Document Context (28%) */}
      <section className="w-[28%] border-r border-outline-variant flex flex-col bg-surface-container-lowest/50 select-none">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low/30">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/50"
              placeholder="Search knowledge base..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          <div className="font-label-caps text-label-caps text-on-surface-variant mb-2 opacity-50 px-2">
            ACTIVE CONTEXT ({filteredContexts.length})
          </div>
          {filteredContexts.map((doc, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className={`material-symbols-outlined ${doc.color}`}>{doc.icon}</span>
                <span className={`font-data-md text-data-md ${doc.color}`}>{doc.score}%</span>
              </div>
              <h4 className="font-body-md font-bold text-on-surface truncate">{doc.name}</h4>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase border border-outline-variant">
                  {doc.tag}
                </span>
                <span className="font-label-caps text-[10px] text-on-surface-variant opacity-60">
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Panel: Chat Area (72%) */}
      <section className="w-[72%] flex flex-col bg-surface relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 pb-48">
          
          {/* Welcome Message (Renders if message list has only welcome or is empty) */}
          {chatMessages.length === 0 && (
            <div className="flex justify-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div className="chat-bubble-ai max-w-[85%] p-6 rounded-2xl rounded-tl-none">
                <h5 className="font-headline-md text-primary text-[18px] mb-3">Welcome to VaultIQ Compliance Assistant</h5>
                <div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                  <p>I am your AI-powered compliance auditor. Upload your policy documents or compliance logs, and I can analyze them for potential compliance drift.</p>
                  <p>You can ask me questions such as:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>What are the encryption standards referenced in our policies?</li>
                    <li>Are there indefinite retention clauses that violate GDPR?</li>
                    <li>What compliance gaps exist in the HIPAA security configurations?</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user'
            
            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="chat-bubble-user max-w-[80%] p-4 rounded-2xl rounded-tr-none">
                    <p className="font-body-md text-on-surface">{msg.text}</p>
                  </div>
                </div>
              )
            }

            // AI or AI Error Bubble
            const isError = msg.isError
            const gapData = msg.gapData // Contains gap details if AI returns a compliance gap
            
            return (
              <div key={msg.id} className="flex justify-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${isError ? 'bg-error' : 'bg-primary'} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${isError ? 'text-on-error' : 'text-on-primary'} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isError ? 'error' : 'smart_toy'}
                  </span>
                </div>
                
                {gapData ? (
                  /* Risk Alert Bubble style from Stitch */
                  <div className="chat-bubble-ai risk-alert max-w-[85%] p-6 rounded-2xl rounded-tl-none relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-error/10 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      <h5 className="font-headline-md text-error text-[18px]">Compliance Gap Detected</h5>
                    </div>
                    <div className="space-y-4 text-on-surface-variant font-body-md">
                      <p>Analysis of your uploaded document shows a critical discrepancy:</p>
                      <div className="bg-surface-container-lowest/40 p-4 rounded border border-outline-variant/30 font-data-md text-sm border-l-4 border-l-error">
                        {gapData.clause}
                      </div>
                      <p className="text-error-container/80 text-sm">{gapData.explanation}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-error/20 border border-error/40 rounded-lg flex items-center gap-2 hover:bg-error/30 transition-all text-error font-bold text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                        Remediate Gap
                      </button>
                      <button className="px-4 py-2 bg-surface-bright/20 border border-outline-variant rounded-lg flex items-center gap-2 hover:bg-surface-bright/40 transition-all text-on-surface-variant font-bold text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                        Create Jira Ticket
                      </button>
                      <div className="ml-auto px-3 py-2 bg-orange-400/10 border border-orange-400/30 rounded-lg flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px]">priority_high</span>
                        Risk Level: {gapData.level || 'High'}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard AI Bubble */
                  <div className="chat-bubble-ai max-w-[85%] p-6 rounded-2xl rounded-tl-none">
                    <div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                      {formatText(msg.text)}
                    </div>
                    {!isError && (
                      <div className="mt-6 flex items-center gap-2 flex-wrap">
                        <div className="px-3 py-1 bg-surface-container border border-outline-variant rounded-full flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            AI Generated
                          </span>
                        </div>
                        <div className="px-3 py-1 bg-surface-container border border-outline-variant rounded-full flex items-center gap-2 hover:bg-surface-container-high cursor-pointer transition-colors">
                          <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                          <span className="text-xs font-bold text-primary-fixed uppercase tracking-wider">
                            Source: RAG_VECTOR_DB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isChatting && (
            <div className="flex justify-start gap-4 animate-fade-in-up">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div className="chat-bubble-ai p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar Area */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-12">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(chip.text)}
                  className="shrink-0 px-4 py-2 bg-surface-container-high/80 backdrop-blur rounded-full border border-outline-variant text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="glass-card flex items-center gap-4 p-2 pl-4 rounded-2xl shadow-2xl">
              <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 py-4 font-body-md outline-none"
                placeholder="Ask VaultIQ about your compliance posture..."
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex items-center gap-2 pr-2">
                <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button
                  type="submit"
                  disabled={isChatting}
                  className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </div>
            </form>
            <p className="text-center font-label-caps text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em]">
              VAULTIQ AI ENGINE v4.2 • DATA ENCRYPTED END-TO-END
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// Convert markdown-like response formatting to React JSX elements
function formatText(text) {
  if (!text) return null
  
  // Split by double line breaks to form paragraphs
  const paragraphs = text.split('\n\n')

  return paragraphs.map((para, pIdx) => {
    // If it's a bulleted list item
    if (para.startsWith('- ')) {
      const items = para.split('\n- ')
      return (
        <ul key={pIdx} className="list-disc pl-5 space-y-2">
          {items.map((item, iIdx) => {
            const cleanItem = item.replace(/^- /, '')
            return <li key={iIdx}>{formatInline(cleanItem)}</li>
          })}
        </ul>
      )
    }

    // Standard paragraph
    const lines = para.split('\n')
    return (
      <p key={pIdx}>
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {formatInline(line)}
          </React.Fragment>
        ))}
      </p>
    )
  })
}

// Format bold text like **bold** to <strong className="text-primary">
function formatInline(line) {
  const parts = line.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-primary">{part}</strong>
    }
    return part
  })
}
