/**
 * 截图工具
 * 捕获游戏画面并保存
 */

export interface ScreenshotOptions {
  filename?: string
  format?: 'image/png' | 'image/jpeg'
  quality?: number
  includeUI?: boolean
}

/**
 * 捕获 Canvas 截图
 */
export function captureCanvas(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to capture canvas'))
          }
        },
        options.format || 'image/png',
        options.quality || 0.9
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 捕获整个屏幕 (包括 UI)
 */
export async function captureScreen(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions = {}
): Promise<Blob> {
  // 创建临时 canvas
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 设置尺寸为窗口大小
  tempCanvas.width = window.innerWidth
  tempCanvas.height = window.innerHeight

  // 绘制游戏 canvas
  ctx.drawImage(canvas, 0, 0)

  // 如果包括 UI，绘制 UI 层
  if (options.includeUI) {
    const uiOverlay = document.getElementById('ui-overlay')
    if (uiOverlay) {
      // 使用 html2canvas 库 (需要额外安装)
      // 这里简化处理，只捕获 canvas
    }
  }

  return captureCanvas(tempCanvas, options)
}

/**
 * 保存截图到本地
 */
export async function saveScreenshot(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions = {}
): Promise<string> {
  const blob = await captureCanvas(canvas, options)
  
  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = options.filename || `hulu_lands_${timestamp}.png`
  
  // 创建下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  
  // 清理
  URL.revokeObjectURL(url)
  
  return filename
}

/**
 * 复制截图到剪贴板
 */
export async function copyScreenshotToClipboard(
  canvas: HTMLCanvasElement
): Promise<void> {
  try {
    const blob = await captureCanvas(canvas)
    
    // 使用 Clipboard API
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      const item = new ClipboardItem({ [blob.type]: blob })
      await navigator.clipboard.write([item])
      console.log('Screenshot copied to clipboard')
    } else {
      throw new Error('Clipboard API not supported')
    }
  } catch (error) {
    console.error('Failed to copy screenshot:', error)
    throw error
  }
}

/**
 * 上传截图到服务器
 */
export async function uploadScreenshot(
  canvas: HTMLCanvasElement,
  uploadUrl: string,
  options: ScreenshotOptions = {}
): Promise<any> {
  const blob = await captureCanvas(canvas, options)
  
  const formData = new FormData()
  formData.append('screenshot', blob, 'screenshot.png')
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('Upload failed')
  }
  
  return await response.json()
}

/**
 * 批量截图
 */
export async function captureMultipleScreenshots(
  canvas: HTMLCanvasElement,
  count: number,
  interval: number
): Promise<Blob[]> {
  const screenshots: Blob[] = []
  
  for (let i = 0; i < count; i++) {
    const blob = await captureCanvas(canvas)
    screenshots.push(blob)
    
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }
  
  return screenshots
}

/**
 * 创建截图预览
 */
export function createScreenshotPreview(blob: Blob): HTMLImageElement {
  const img = document.createElement('img')
  img.src = URL.createObjectURL(blob)
  img.style.maxWidth = '100%'
  img.style.maxHeight = '400px'
  img.style.border = '2px solid #3498db'
  img.style.borderRadius = '8px'
  
  return img
}

/**
 * 截图快捷键处理
 */
export function setupScreenshotShortcut(
  canvas: HTMLCanvasElement,
  key: string = 'PrintScreen'
) {
  const handler = (e: KeyboardEvent) => {
    if (e.key === key) {
      e.preventDefault()
      saveScreenshot(canvas)
        .then((filename) => {
          console.log(`Screenshot saved: ${filename}`)
        })
        .catch((error) => {
          console.error('Screenshot failed:', error)
        })
    }
  }
  
  window.addEventListener('keydown', handler)
  
  return () => {
    window.removeEventListener('keydown', handler)
  }
}

/**
 * 截图按钮处理
 */
export function createScreenshotButton(
  canvas: HTMLCanvasElement,
  container: HTMLElement
): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = '📷 截图'
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: rgba(52, 152, 219, 0.8);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    z-index: 10000;
    transition: all 0.2s;
  `
  
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(52, 152, 219, 1)'
    button.style.transform = 'scale(1.05)'
  })
  
  button.addEventListener('mouseleave', () => {
    button.style.background = 'rgba(52, 152, 219, 0.8)'
    button.style.transform = 'scale(1)'
  })
  
  button.addEventListener('click', () => {
    saveScreenshot(canvas)
      .then((filename) => {
        console.log(`Screenshot saved: ${filename}`)
      })
      .catch((error) => {
        console.error('Screenshot failed:', error)
      })
  })
  
  container.appendChild(button)
  
  return button
}

/**
 * 获取截图统计
 */
export function getScreenshotStats(): {
  count: number
  totalSize: number
  lastScreenshot: Date | null
} {
  let count = 0
  let totalSize = 0
  let lastScreenshot: Date | null = null
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('hulu_lands_screenshot_')) {
      count++
      const data = localStorage.getItem(key)
      if (data) {
        totalSize += data.length
        const timestamp = parseInt(key.split('_').pop() || '0')
        lastScreenshot = new Date(timestamp)
      }
    }
  }
  
  return { count, totalSize, lastScreenshot }
}
