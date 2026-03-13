import { useToastStore } from '../stores/toastStore'
import './Toast.css'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getTypeClass = (type: string) => {
    return `toast-${type}`
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`toast ${getTypeClass(toast.type)}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
