import { useState } from 'react'
import './MenuBar.css'

interface MenuBarProps {
  onInventory: () => void
  onCharacter: () => void
  onSettings: () => void
}

/**
 * 菜单栏组件
 * 主菜单按钮
 */
export function MenuBar({ onInventory, onCharacter, onSettings }: MenuBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'inventory', label: '背包', icon: '🎒', action: onInventory },
    { id: 'character', label: '角色', icon: '👤', action: onCharacter },
    { id: 'skill', label: '技能', icon: '⚡', action: () => {} },
    { id: 'quest', label: '任务', icon: '📜', action: () => {} },
    { id: 'map', label: '地图', icon: '🗺️', action: () => {} },
    { id: 'guild', label: '公会', icon: '🏰', action: () => {} },
    { id: 'friends', label: '好友', icon: '👥', action: () => {} },
    { id: 'settings', label: '设置', icon: '⚙️', action: onSettings },
  ]

  return (
    <div className="menu-bar">
      {/* 主菜单按钮 */}
      <button 
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰ 菜单
      </button>

      {/* 菜单面板 */}
      {isOpen && (
        <div className="menu-panel">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => {
                item.action()
                setIsOpen(false)
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
