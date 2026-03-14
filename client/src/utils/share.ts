/**
 * 分享工具
 * 支持多种分享方式
 */

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
  image?: string
}

/**
 * 使用 Web Share API 分享
 */
export async function shareWeb(options: ShareOptions = {}): Promise<boolean> {
  if (!navigator.share) {
    console.warn('Web Share API not supported')
    return false
  }

  try {
    await navigator.share({
      title: options.title || '呼噜大陆 - Hulu Lands',
      text: options.text || '一起来玩呼噜大陆吧！',
      url: options.url || window.location.href
    })
    return true
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error)
    }
    return false
  }
}

/**
 * 分享到微信
 */
export function shareToWeChat(options: ShareOptions = {}) {
  // 微信不支持直接分享，生成二维码或提示用户
  // 提示用户
  alert('请复制链接到微信：\n\n' + (options.url || window.location.href))
}

/**
 * 分享到 QQ
 */
export function shareToQQ(options: ShareOptions = {}) {
  const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?` +
    `url=${encodeURIComponent(options.url || window.location.href)}&` +
    `title=${encodeURIComponent(options.title || '呼噜大陆')} &` +
    `summary=${encodeURIComponent(options.text || '一起来玩呼噜大陆吧！')}&` +
    `pics=${encodeURIComponent(options.image || '')}&` +
    `source=呼噜大陆`
  
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * 分享到微博
 */
export function shareToWeibo(options: ShareOptions = {}) {
  const shareUrl = `https://service.weibo.com/share/share.php?` +
    `url=${encodeURIComponent(options.url || window.location.href)}&` +
    `title=${encodeURIComponent(options.title || '呼噜大陆')}&` +
    `pic=${encodeURIComponent(options.image || '')}&` +
    `appkey=` // 需要申请 appkey
  
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * 分享到 Twitter
 */
export function shareToTwitter(options: ShareOptions = {}) {
  const shareUrl = `https://twitter.com/intent/tweet?` +
    `text=${encodeURIComponent(options.text || '一起来玩呼噜大陆吧！')} &` +
    `url=${encodeURIComponent(options.url || window.location.href)}`
  
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * 分享到 Facebook
 */
export function shareToFacebook(options: ShareOptions = {}) {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?` +
    `u=${encodeURIComponent(options.url || window.location.href)}`
  
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * 分享到 Discord
 */
export function shareToDiscord(options: ShareOptions = {}) {
  // Discord 不支持直接分享，复制链接
  copyToClipboard(options.url || window.location.href)
  alert('链接已复制到剪贴板，请粘贴到 Discord')
}

/**
 * 分享到 Reddit
 */
export function shareToReddit(options: ShareOptions = {}) {
  const shareUrl = `https://www.reddit.com/submit?` +
    `url=${encodeURIComponent(options.url || window.location.href)}&` +
    `title=${encodeURIComponent(options.title || '呼噜大陆')}`
  
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

/**
 * 通过邮件分享
 */
export function shareViaEmail(options: ShareOptions = {}) {
  const subject = encodeURIComponent(options.title || '呼噜大陆')
  const body = encodeURIComponent(
    `${options.text || '一起来玩呼噜大陆吧！'}\n\n` +
    `${options.url || window.location.href}`
  )
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

/**
 * 通过短信分享
 */
export function shareViaSMS(options: ShareOptions = {}) {
  const body = encodeURIComponent(
    `${options.text || '一起来玩呼噜大陆吧！'}\n` +
    `${options.url || window.location.href}`
  )
  
  window.location.href = `sms:?body=${body}`
}

/**
 * 复制链接
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && 'writeText' in navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    }
  } catch (error) {
    console.error('Copy failed:', error)
    return false
  }
}

/**
 * 生成分享图片
 */
export async function generateShareImage(
  canvas: HTMLCanvasElement,
  options: {
    title?: string
    subtitle?: string
  } = {}
): Promise<Blob> {
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 设置尺寸
  tempCanvas.width = 1200
  tempCanvas.height = 630

  // 绘制背景
  ctx.fillStyle = '#16213e'
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

  // 绘制游戏截图
  if (canvas) {
    ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height)
  }

  // 绘制标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Arial'
  ctx.fillText(options.title || '呼噜大陆', 40, 80)

  // 绘制副标题
  ctx.fillStyle = '#f39c12'
  ctx.font = '24px Arial'
  ctx.fillText(options.subtitle || 'Hulu Lands', 40, 120)

  return new Promise((resolve) => {
    tempCanvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

/**
 * 分享菜单组件
 */
export interface ShareMenuConfig {
  container: HTMLElement
  options: ShareOptions
  platforms?: Array<'wechat' | 'qq' | 'weibo' | 'twitter' | 'facebook' | 'discord' | 'reddit' | 'email' | 'sms'>
}

export function createShareMenu(config: ShareMenuConfig): HTMLElement {
  const container = document.createElement('div')
  container.className = 'share-menu'
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(22, 33, 62, 0.98);
    border: 2px solid #3498db;
    border-radius: 12px;
    padding: 20px;
    z-index: 10003;
    min-width: 300px;
  `

  const title = document.createElement('h3')
  title.textContent = '分享到'
  title.style.cssText = 'color: #fff; margin: 0 0 15px 0; text-align: center;'
  container.appendChild(title)

  const platforms = config.platforms || ['wechat', 'qq', 'weibo', 'twitter', 'copy']
  const buttons: Array<{ platform: string; label: string; color: string; action: () => void }> = [
    {
      platform: 'wechat',
      label: '微信',
      color: '#07c160',
      action: () => shareToWeChat(config.options)
    },
    {
      platform: 'qq',
      label: 'QQ',
      color: '#12b7f5',
      action: () => shareToQQ(config.options)
    },
    {
      platform: 'weibo',
      label: '微博',
      color: '#e6162d',
      action: () => shareToWeibo(config.options)
    },
    {
      platform: 'twitter',
      label: 'Twitter',
      color: '#1da1f2',
      action: () => shareToTwitter(config.options)
    },
    {
      platform: 'copy',
      label: '复制链接',
      color: '#3498db',
      action: async () => {
        const success = await copyToClipboard(config.options.url || window.location.href)
        if (success) {
          alert('链接已复制')
        }
      }
    }
  ]

  buttons.forEach((btn) => {
    if (!platforms.includes(btn.platform as any)) return

    const button = document.createElement('button')
    button.textContent = btn.label
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background: ${btn.color};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.02)'
      button.style.opacity = '0.9'
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
      button.style.opacity = '1'
    })

    button.addEventListener('click', () => {
      btn.action()
      container.remove()
    })

    container.appendChild(button)
  })

  // 关闭按钮
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '✕'
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  `
  closeBtn.addEventListener('click', () => container.remove())
  container.appendChild(closeBtn)

  // 点击背景关闭
  container.addEventListener('click', (e) => {
    if (e.target === container) {
      container.remove()
    }
  })

  config.container.appendChild(container)

  return container
}
