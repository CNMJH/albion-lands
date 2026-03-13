import { useState, useEffect } from 'react'
import './SkillBar-optimized.css'

/**
 * 技能栏组件
 * 显示快捷技能和物品
 */
export function SkillBar() {
  const [skills] = useState([
    { id: 1, key: 'Q', icon: '/assets/skills/sword.svg', name: '普通攻击', cooldown: 0, description: '对目标造成 100% 攻击力的物理伤害' },
    { id: 2, key: 'W', icon: '/assets/skills/fireball.svg', name: '火球术', cooldown: 3000, description: '发射火球，造成 150% 魔法伤害' },
    { id: 3, key: 'E', icon: '/assets/skills/charge.svg', name: '冲锋', cooldown: 8000, description: '向目标方向冲刺，移动速度 +50%' },
    { id: 4, key: 'R', icon: '/assets/skills/heal.svg', name: '治疗术', cooldown: 5000, description: '每秒恢复 200 点生命，持续 5 秒' },
    { id: 5, key: 'A', icon: '/assets/skills/lightning.svg', name: '闪电链', cooldown: 6000, description: '释放闪电链，最多弹射 3 个目标' },
    { id: 6, key: 'S', icon: '/assets/skills/shield.svg', name: '护盾', cooldown: 10000, description: '获得一个吸收 500 点伤害的护盾' },
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
            <div className="skill-icon">
            <img src={skill.icon} alt={skill.name} onError={(e) => {
              // 图片加载失败时显示默认图标
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.textContent = skill.key
            }} />
          </div>
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
