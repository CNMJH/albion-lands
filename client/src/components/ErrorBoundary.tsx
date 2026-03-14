import { Component, ErrorInfo, ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 * 捕获子组件错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    console.error('ErrorBoundary caught error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 发送到错误监控服务
    this.reportError(error, errorInfo)
  }

  /**
   * 报告错误到监控服务
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // TODO: 集成错误监控服务 (如 Sentry)
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    console.error('Error Report:', errorReport)

    // 可以发送到服务端
    // fetch('/api/error-report', {
    //   method: 'POST',
    //   body: JSON.stringify(errorReport)
    // })
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    // 重新加载页面
    window.location.reload()
  }

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误 UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            
            <h1 className="error-title">出错了!</h1>
            
            <div className="error-message">
              {this.state.error?.message || '未知错误'}
            </div>

            <div className="error-details">
              <p>组件栈:</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-retry">
                🔄 重试
              </button>
              <button onClick={this.handleGoHome} className="btn-home">
                🏠 返回首页
              </button>
            </div>

            <div className="error-tips">
              <h3>💡 提示</h3>
              <ul>
                <li>刷新页面可能解决问题</li>
                <li>清除浏览器缓存后重试</li>
                <li>检查网络连接</li>
                <li>如果问题持续，请联系客服</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
