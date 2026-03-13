import { useEffect, useState } from 'react'
import './ShortcutHints.css'

interface ShortcutHint {
  key: string
  action: string
  category: 'movement' | 'combat' | 'ui' | 'social'
}

const shortcuts: ShortcutHint[] = [
  // 移动
  { key: '鼠标右键', action: '移动/攻击', category: 'movement' },
  { key: 'Shift', action: '冲刺', category: 'movement' },
  
  // 战斗
  { key: 'Q/W/E/R', action: '技能', category: 'combat' },
  { key: 'A/S', action: '技能', category: 'combat' },
  { key: '空格', action: '普通攻击', category: 'combat' },
  
  // UI
  { key: 'B', action: '背包', category: 'ui' },
  { key: 'C', action: '装备', category: 'ui' },
  { key: 'M', action: '拍卖行', category: 'ui' },
  { key: 'F1', action: '死亡统计', category: 'ui' },
  { key: 'F2', action: '复活点', category: 'ui' },
  { key: 'Tab', action: '排行榜', category: 'ui' },
  { key: 'Escape', action: '关闭所有 UI', category: 'ui' },
  
  // 社交
  { key: 'Enter', action: '聊天', category: 'social' },
  { key: 'E', action: '拾取/交易', category: 'social' },
]

export function ShortcutHints() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        setVisible((v) => !v)
      }
      if (e.key === 'Escape') {
        setVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!visible) return null

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      movement: '🏃 移动',
      combat: '⚔️ 战斗',
      ui: '📱 界面',
      social: '💬 社交'
    }
    return titles[category] || category
  }

  const categories = ['movement', 'combat', 'ui', 'social']

  return (
    <div className="shortcut-hints-overlay" onClick={() => setVisible(false)}>
      <div className="shortcut-hints" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-header">
          <h2>⌨️ 快捷键说明</h2>
          <p>按 F10 打开/关闭此说明</p>
          <button onClick={() => setVisible(false)}>×</button>
        </div>
        
        <div className="shortcut-content">
          {categories.map((category) => (
            <div key={category} className="shortcut-category">
              <h3>{getCategoryTitle(category)}</h3>
              <div className="shortcut-list">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="shortcut-item">
                      <kbd className="shortcut-key">{shortcut.key}</kbd>
                      <span className="shortcut-action">{shortcut.action}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="shortcut-footer">
          <p>💡 提示：将鼠标悬停在技能图标上查看详细效果</p>
        </div>
      </div>
    </div>
  )
}
