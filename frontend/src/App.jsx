import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Toast from './components/Toast'
import Dashboard from './views/Dashboard'
import Upload from './views/Upload'
import Chat from './views/Chat'
import Reports from './views/Reports'

export default function App() {
  // --- State ---
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [toasts, setToasts] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isChatting, setIsChatting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Initialize cursor glow effect (Stitch visual atmosphere)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Initial demo chat messages from Stitch UI
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'demo-1',
      sender: 'user',
      text: 'What are the data retention requirements under GDPR Article 5?'
    },
    {
      id: 'demo-2',
      sender: 'ai',
      text: 'Under GDPR Article 5, personal data must be kept in a form which permits identification of data subjects for **no longer than is necessary** for the purposes for which the personal data are processed.\n\n- Data may be stored for longer periods for archiving purposes in the public interest, scientific/historical research, or statistical purposes.\n- Appropriate technical and organizational measures must be implemented.\n- Organizations must establish clear time limits for periodic review of data storage.'
    },
    {
      id: 'demo-3',
      sender: 'user',
      text: 'Are we currently compliant with this requirement?'
    },
    {
      id: 'demo-4',
      sender: 'ai',
      gapData: {
        clause: 'Section 4.2 states: "All marketing lead data shall be retained indefinitely to ensure customer lifetime value tracking."',
        explanation: 'This contradicts GDPR Storage Limitation principles which prohibit indefinite retention of identifiable lead data without active consent renewal or specific legal justification.',
        level: 'High'
      }
    }
  ])

  // Simple Hash Router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const validPages = ['dashboard', 'upload', 'chat', 'reports']
      if (validPages.includes(hash)) {
        setCurrentPage(hash)
      } else {
        setCurrentPage('dashboard')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    // Run once initially
    handleHashChange()

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (page) => {
    window.location.hash = page
  }

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/dashboard')
      if (res.ok) {
        const data = await res.json()
        setDashboardData(data)
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message)
    }
  }

  // Fetch initial dashboard status
  useEffect(() => {
    fetchDashboard()
    // Auto-refresh every 30s in background
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  // Toast Management
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // API Upload File
  const handleUploadFile = async (file) => {
    if (isUploading) return
    setIsUploading(true)

    const fileEntry = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      status: 'uploading',
      progress: 0,
      timestamp: new Date()
    }

    setUploadedFiles((prev) => [fileEntry, ...prev])

    // Progress simulation
    const progressInterval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => {
          if (f.name === file.name && f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: f.progress + Math.floor(Math.random() * 15 + 5) }
          }
          return f
        })
      )
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Ingestion and mapping success
      clearInterval(progressInterval)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: 'complete', progress: 100 }
            : f
        )
      )

      addToast(`✓ ${file.name} uploaded and indexed successfully`)
      
      // Refresh statistics
      await fetchDashboard()

    } catch (err) {
      clearInterval(progressInterval)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: 'error', progress: 0 }
            : f
        )
      )
      addToast(`✗ Upload failed: ${err.message}`, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  // API Send Chat Message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isChatting) return

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text
    }

    setChatMessages((prev) => [...prev, userMsg])
    setIsChatting(true)

    try {
      const response = await fetch(`/chat?q=${encodeURIComponent(text)}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: result.answer
      }

      setChatMessages((prev) => [...prev, aiMsg])

    } catch (err) {
      const errMsg = {
        id: 'error-' + Date.now(),
        sender: 'ai',
        isError: true,
        text: 'Sorry, I could not process your request. Ensure a PDF is uploaded first and that the backend server is running.'
      }
      setChatMessages((prev) => [...prev, errMsg])
      addToast(`✗ Chat error: ${err.message}`, 'error')
    } finally {
      setIsChatting(false)
    }
  }

  // API Generate Compliance Report
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/report')
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      if (data.message === 'No document uploaded') {
        addToast('Please upload a document before generating reports.', 'warning')
        setReportData(null)
      } else {
        setReportData(data)
        addToast('✓ Compliance report generated successfully!')
      }
    } catch (err) {
      addToast(`✗ Report generation failed: ${err.message}`, 'error')
      setReportData(null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Page titles lookup
  const pageTitles = {
    dashboard: 'Compliance Overview',
    upload: 'Document Upload Portal',
    chat: 'Compliance Assistant',
    reports: 'Risk Intelligence Portal'
  }

  return (
    <div className="flex min-h-screen">
      {/* Dynamic Cursor Glow Layer */}
      <div
        id="cursor-glow"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      ></div>

      {/* Sidebar Component */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="ml-[240px] flex flex-col flex-1 min-h-screen relative z-10">
        
        {/* Shared Top App Bar */}
        <Header title={pageTitles[currentPage] || 'VaultIQ'} />

        {/* Dynamic Views */}
        <main className="flex-1">
          {currentPage === 'dashboard' && (
            <Dashboard data={dashboardData} onNavigate={handleNavigate} />
          )}
          {currentPage === 'upload' && (
            <Upload
              uploadedFiles={uploadedFiles}
              onUploadFile={handleUploadFile}
              isUploading={isUploading}
            />
          )}
          {currentPage === 'chat' && (
            <Chat
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isChatting={isChatting}
              uploadedFiles={uploadedFiles}
            />
          )}
          {currentPage === 'reports' && (
            <Reports
              reportData={reportData}
              onGenerateReport={handleGenerateReport}
              isGenerating={isGenerating}
            />
          )}
        </main>
      </div>

      {/* Shared Toast Notification Layer */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  )
}
