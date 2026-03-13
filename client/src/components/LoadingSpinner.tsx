import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ 
  size = 'medium', 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`

  const content = (
    <div className="loading-spinner">
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        {content}
      </div>
    )
  }

  return content
}
