import { useState, useEffect } from 'react'
import './SkillBar.css'

/**
 * 技能栏组件
 * 显示快捷技能和物品
 */
export function SkillBar() {
  const [skills] = useState([
    { id: 1, key: '1', icon: '⚔️', name: '普通攻击', cooldown: 0 },
    { id: 2, key: '2', icon: '🔥', name: '火球术', cooldown: 0 },
    { id: 3, key: '3', icon: '💨', name: '冲锋', cooldown: 0 },
    { id: 4, key: '4', icon: '💊', name: '生命药水', cooldown: 0 },
    { id: 5, key: '5', icon: '✨', name: '治疗术', cooldown: 0 },
    { id: 6, key: '6', icon: '⚡', name: '闪电链', cooldown: 0 },
  ])

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

  return (
    <div className="skill-bar">
      {skills.map((skill, index) => (
        <div 
          key={skill.id}
          className="skill-slot"
          onClick={() => useSkill(index)}
          title={`${skill.name} (${skill.key})`}
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
  )
}
