import { useState, useEffect } from 'react'
import './SkillBar-optimized.css'

/**
 * 技能栏组件
 * 显示快捷技能和物品
 */
export function SkillBar() {
  const [skills] = useState([
    { id: 1, key: '1', icon: '⚔️', name: '普通攻击', cooldown: 0, description: '对目标造成 100% 攻击力的物理伤害' },
    { id: 2, key: '2', icon: '🔥', name: '火球术', cooldown: 0, description: '发射火球，造成 150% 魔法伤害' },
    { id: 3, key: '3', icon: '💨', name: '冲锋', cooldown: 0, description: '向目标方向冲刺，移动速度 +50%' },
    { id: 4, key: '4', icon: '💊', name: '生命药水', cooldown: 0, description: '立即恢复 500 点生命值' },
    { id: 5, key: '5', icon: '✨', name: '治疗术', cooldown: 0, description: '每秒恢复 200 点生命，持续 5 秒' },
    { id: 6, key: '6', icon: '⚡', name: '闪电链', cooldown: 0, description: '释放闪电链，最多弹射 3 个目标' },
  ])
  
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      if (key >= '1' && key <= '6') {
        const index = parseInt(key) - 1
        useSkill(index)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const useSkill = (index: number) => {
    // 简化处理：暂时只记录日志
    // 实际项目中应通过 WebSocket 发送技能使用请求
    console.log(`使用技能 ${index + 1}`)
  }
  
  const handleMouseEnter = (e: React.MouseEvent, index: number) => {
    setHoveredSkill(index)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltipPosition({
      x: rect.left,
      y: rect.top - 120, // 在技能图标上方显示
    })
  }
  
  const handleMouseLeave = () => {
    setHoveredSkill(null)
  }

  return (
    <>
      <div className="skill-bar">
        {skills.map((skill, index) => (
          <div 
            key={skill.id}
            className="skill-slot"
            onClick={() => useSkill(index)}
            onMouseEnter={(e) => handleMouseEnter(e, index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="skill-icon">{skill.icon}</div>
            <div className="skill-key">{skill.key}</div>
            {skill.cooldown > 0 && (
              <div className="cooldown-overlay">
                {skill.cooldown}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 技能 Tooltip */}
      {hoveredSkill !== null && (
        <div 
          className="skill-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="skill-tooltip-name">{skills[hoveredSkill].name}</div>
          <div className="skill-tooltip-key">快捷键：{skills[hoveredSkill].key}</div>
          <div className="skill-tooltip-description">{skills[hoveredSkill].description}</div>
        </div>
      )}
    </>
  )
}
