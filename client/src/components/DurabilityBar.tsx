import './DurabilityBar.css'

interface DurabilityBarProps {
  current: number
  max: number
  showText?: boolean
}

/**
 * 耐久度条组件
 */
export function DurabilityBar({ current, max, showText = true }: DurabilityBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  
  // 根据耐久度百分比选择颜色
  let colorClass = 'durability-good'
  if (percentage < 25) {
    colorClass = 'durability-critical'
  } else if (percentage < 50) {
    colorClass = 'durability-low'
  } else if (percentage < 75) {
    colorClass = 'durability-medium'
  }

  return (
    <div className="durability-bar-container">
      <div className={`durability-bar ${colorClass}`} style={{ width: `${percentage}%` }} />
      {showText && (
        <span className="durability-text">{current}/{max}</span>
      )}
    </div>
  )
}
