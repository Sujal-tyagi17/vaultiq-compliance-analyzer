import React, { useEffect } from 'react'

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }) {
  const { id, message, type } = toast

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  let bgClass = 'bg-surface-container-high border-primary text-primary'
  let iconName = 'check_circle'

  if (type === 'error') {
    bgClass = 'bg-error-container border-error text-on-error-container'
    iconName = 'error'
  } else if (type === 'warning') {
    bgClass = 'bg-yellow-950/80 border-yellow-500 text-yellow-200'
    iconName = 'warning'
  }

  return (
    <div
      onClick={() => onClose(id)}
      className={`pointer-events-auto cursor-pointer ${bgClass} px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-fade-in-up max-w-md transition-all duration-300`}
    >
      <span className="material-symbols-outlined">{iconName}</span>
      <span className="text-sm font-bold">{message}</span>
    </div>
  )
}
