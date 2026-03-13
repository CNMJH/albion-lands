/**
 * 颜色对比度工具
 * 确保颜色符合 WCAG 无障碍标准
 */

/**
 * 计算颜色亮度
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 计算对比度比率
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * 检查是否符合 WCAG AA 标准
 */
export function isWcagAA(color1: string, color2: string, fontSize = 'normal'): boolean {
  const ratio = getContrastRatio(color1, color2)
  
  // AA 标准
  const minRatio = fontSize === 'large' ? 3.0 : 4.5
  
  return ratio >= minRatio
}

/**
 * 检查是否符合 WCAG AAA 标准
 */
export function isWcagAAA(color1: string, color2: string, fontSize = 'normal'): boolean {
  const ratio = getContrastRatio(color1, color2)
  
  // AAA 标准
  const minRatio = fontSize === 'large' ? 4.5 : 7.0
  
  return ratio >= minRatio
}

/**
 * Hex 转 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * RGB 转 Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * 调整颜色亮度
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = percent / 100
  
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * (1 + factor))))
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * (1 + factor))))
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * (1 + factor))))

  return rgbToHex(r, g, b)
}

/**
 * 获取最佳文字颜色
 */
export function getBestTextColor(backgroundColor: string): string {
  const lum = getLuminance(backgroundColor)
  
  // 深色背景用白色文字，浅色背景用黑色文字
  return lum > 0.5 ? '#000000' : '#ffffff'
}

/**
 * 验证颜色对比度
 */
export function validateColorContrast(
  bgColor: string,
  textColor: string,
  level: 'AA' | 'AAA' = 'AA'
): {
  passed: boolean
  ratio: number
  required: number
  message: string
} {
  const ratio = getContrastRatio(bgColor, textColor)
  const required = level === 'AAA' ? 7.0 : 4.5
  
  return {
    passed: ratio >= required,
    ratio,
    required,
    message: `对比度 ${ratio.toFixed(2)}:${1} ${ratio >= required ? '✅' : '❌'}`
  }
}

/**
 * 检查所有颜色变量
 */
export function checkAllColors(): Array<{
  pair: string
  bg: string
  fg: string
  ratio: number
  passed: boolean
}> {
  const colors = [
    { name: 'Primary', bg: '#16213e', fg: '#ffffff' },
    { name: 'Accent Gold', bg: '#f39c12', fg: '#ffffff' },
    { name: 'Accent Red', bg: '#e74c3c', fg: '#ffffff' },
    { name: 'Accent Green', bg: '#27ae60', fg: '#ffffff' },
    { name: 'Accent Blue', bg: '#3498db', fg: '#ffffff' },
    { name: 'Accent Purple', bg: '#9b59b6', fg: '#ffffff' },
    { name: 'Gray Dark', bg: '#212529', fg: '#ffffff' },
    { name: 'Gray Light', bg: '#e9ecef', fg: '#000000' },
  ]

  return colors.map((c) => {
    const ratio = getContrastRatio(c.bg, c.fg)
    return {
      pair: c.name,
      bg: c.bg,
      fg: c.fg,
      ratio,
      passed: ratio >= 4.5
    }
  })
}

/**
 * 打印颜色对比度报告
 */
export function printColorReport() {
  console.log('=== 颜色对比度报告 ===\n')
  
  const results = checkAllColors()
  
  results.forEach((r) => {
    const status = r.passed ? '✅' : '❌'
    console.log(`${status} ${r.pair}: ${r.ratio.toFixed(2)}:1`)
    console.log(`   背景：${r.bg}  文字：${r.fg}\n`)
  })
  
  const passed = results.filter((r) => r.passed).length
  console.log(`总计：${passed}/${results.length} 通过\n`)
}
