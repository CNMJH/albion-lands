import { useToastStore, toast } from '../stores/toastStore'

/**
 * 错误处理工具
 * 统一的错误提示和日志
 */

export interface ApiError {
  success: boolean
  error: string
  code?: string
  details?: any
}

/**
 * API 错误处理
 */
export function handleApiError(error: any, defaultMessage = '操作失败') {
  console.error('API Error:', error)

  let message = defaultMessage

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    if ('error' in error) {
      message = error.error
    } else if ('message' in error) {
      message = error.message
    }
  }

  toast.error(message, 5000)
  return message
}

/**
 * 网络错误处理
 */
export function handleNetworkError(error: any) {
  console.error('Network Error:', error)

  let message = '网络连接失败'

  if (error instanceof TypeError && error.message.includes('fetch')) {
    message = '无法连接到服务器，请检查网络'
  } else if (error instanceof Error) {
    message = error.message
  }

  toast.error(message, 5000)
  return message
}

/**
 * 验证错误处理
 */
export function handleValidationError(errors: Record<string, string>) {
  const messages = Object.values(errors)
  const message = messages.join('，')
  toast.warning(message, 4000)
  return message
}

/**
 * 权限错误处理
 */
export function handlePermissionError() {
  toast.error('没有权限执行此操作', 3000)
}

/**
 * 资源不存在错误
 */
export function handleNotFoundError(resource = '资源') {
  toast.error(`${resource}不存在`, 3000)
}

/**
 * 成功提示
 */
export function showSuccess(message: string, duration = 3000) {
  toast.success(message, duration)
}

/**
 * 警告提示
 */
export function showWarning(message: string, duration = 3000) {
  toast.warning(message, duration)
}

/**
 * 信息提示
 */
export function showInfo(message: string, duration = 3000) {
  toast.info(message, duration)
}

/**
 * 加载提示
 */
export function showLoading(message: string) {
  toast.info(message, 0) // 不自动消失
}

/**
 * 隐藏所有 Toast
 */
export function hideAllToasts() {
  const { toasts, removeToast } = useToastStore.getState()
  toasts.forEach((t) => removeToast(t.id))
}

/**
 * 确认对话框
 */
export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message)
    resolve(confirmed)
  })
}

/**
 * 输入提示
 */
export function promptInput(message: string, defaultValue = ''): Promise<string | null> {
  return new Promise((resolve) => {
    const result = window.prompt(message, defaultValue)
    resolve(result)
  })
}

/**
 * 批量错误处理
 */
export function handleBatchErrors(results: Array<{ success: boolean; error?: string }>) {
  const errors = results.filter((r) => !r.success).map((r) => r.error)
  
  if (errors.length > 0) {
    const message = `部分操作失败：${errors.join('，')}`
    toast.warning(message, 6000)
    return errors
  }
  
  return []
}

/**
 * 重试机制
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (i < maxRetries - 1) {
        console.log(`重试 ${i + 1}/${maxRetries}...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  handleApiError(lastError, '操作失败，请重试')
  throw lastError
}

/**
 * 防抖错误处理
 */
const errorDebounce: Record<string, number> = {}

export function debounceError(key: string, message: string, delay = 2000) {
  const now = Date.now()
  
  if (errorDebounce[key] && now - errorDebounce[key] < delay) {
    return // 跳过重复错误
  }

  errorDebounce[key] = now
  toast.error(message, 3000)

  // 清理
  setTimeout(() => {
    delete errorDebounce[key]
  }, delay)
}
