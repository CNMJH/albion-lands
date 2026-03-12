import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { skillSystem, SkillCooldown } from '../../systems/SkillSystem'
import { getSkillById } from '../../config/skills'
import './SkillBar.css'

/**
 * 技能栏组件
 * 显示 8 个技能快捷栏，支持冷却显示
 */
export const SkillBar: React.FC = () => {
  const skills = useGameStore((state) => state.skills)
  const playerMp = useGameStore((state) => state.player?.mp || 0)
  const playerMaxMp = useGameStore((state) => state.player?.maxMp || 50)
  
  const [cooldowns, setCooldowns] = useState<Map<string, SkillCooldown>>(new Map())

  // 监听冷却更新
  useEffect(() => {
    const interval = setInterval(() => {
      // 获取所有技能的冷却状态
      const newCooldowns = new Map<string, SkillCooldown>()
      
      skills.forEach((skillId, index) => {
        if (index < 8 && skillId) {
          const remaining = skillSystem.getCooldownRemaining(skillId)
          if (remaining > 0) {
            const config = getSkillById(skillId)
            if (config) {
              newCooldowns.set(skillId, {
                skillId,
                remainingTime: remaining,
                cooldownTime: config.cooldown,
              })
            }
          }
        }
      })

      setCooldowns(newCooldowns)
    }, 100)

    return () => clearInterval(interval)
  }, [skills])

  /**
   * 获取技能图标
   */
  const getSkillIcon = (skillId: string): string => {
    const config = getSkillById(skillId)
    return config?.icon || '❓'
  }

  /**
   * 获取技能描述
   */
  const getSkillDescription = (skillId: string): string => {
    const config = getSkillById(skillId)
    return config?.description || ''
  }

  /**
   * 获取冷却百分比
   */
  const getCooldownPercent = (skillId: string): number => {
    const cooldown = cooldowns.get(skillId)
    if (!cooldown) return 0
    return (cooldown.remainingTime / cooldown.cooldownTime) * 100
  }

  /**
   * 获取冷却文本
   */
  const getCooldownText = (skillId: string): string => {
    const cooldown = cooldowns.get(skillId)
    if (!cooldown) return ''
    return cooldown.remainingTime.toFixed(1)
  }

  /**
   * 检查是否可用
   */
  const isSkillAvailable = (skillId: string): boolean => {
    const config = getSkillById(skillId)
    if (!config) return false
    
    // 检查冷却
    if (skillSystem.isOnCooldown(skillId)) return false
    
    // 检查能量
    if (playerMp < config.energyCost) return false
    
    return true
  }

  return (
    <div className="skill-bar">
      {/* 能量条 */}
      <div className="mp-bar">
        <div 
          className="mp-fill" 
          style={{ 
            width: `${(playerMp / playerMaxMp) * 100}%`,
          }}
        />
        <span className="mp-text">{playerMp} / {playerMaxMp}</span>
      </div>

      {/* 技能栏 */}
      <div className="skill-slots">
        {Array.from({ length: 8 }).map((_, index) => {
          const skillId = skills[index]
          const isOnCooldown = skillId && skillSystem.isOnCooldown(skillId)
          const isAvailable = skillId ? isSkillAvailable(skillId) : false

          return (
            <div
              key={index}
              className={`skill-slot ${!skillId ? 'empty' : ''} ${isOnCooldown ? 'on-cooldown' : ''} ${!isAvailable && skillId ? 'no-energy' : ''}`}
              title={skillId ? getSkillDescription(skillId) : '空'}
            >
              {skillId ? (
                <>
                  <div className="skill-icon">{getSkillIcon(skillId)}</div>
                  <div className="skill-key">{index + 1}</div>
                  
                  {/* 冷却遮罩 */}
                  {isOnCooldown && (
                    <>
                      <div 
                        className="skill-cooldown-overlay"
                        style={{ 
                          height: `${getCooldownPercent(skillId)}%`,
                        }}
                      />
                      <span className="skill-cooldown-text">
                        {getCooldownText(skillId)}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="empty-slot">空</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
