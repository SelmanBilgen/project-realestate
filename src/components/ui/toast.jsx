import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '../../utils/utils'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((props) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...props, id }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const Toast = ({ title, description, variant = 'default', onDismiss }) => {
  const icons = {
    default: <CheckCircle className="h-5 w-5" />,
    destructive: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
  }

  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  }

  return (
    <div className={cn(
      'w-80 p-4 rounded-lg shadow-lg border flex items-start space-x-3 transition-all animate-in slide-in-from-right',
      variantClasses[variant]
    )}>
      <div className="flex-shrink-0">
        {icons[variant]}
      </div>
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}