import { useEffect, useState } from 'react'
import './AchievementDisplay.css'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  completed: boolean
  completedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * 成就展示组件
 * 显示成就进度和解锁动画
 */
export function AchievementDisplay() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // 模拟加载成就数据
    loadAchievements()

    // 监听成就解锁
    const handleAchievementUnlock = (achievement: Achievement) => {
      setRecentUnlocks((prev) => [...prev, achievement])
      
      // 3 秒后移除
      setTimeout(() => {
        setRecentUnlocks((prev) => prev.filter((a) => a.id !== achievement.id))
      }, 5000)
    }

    window.addEventListener('achievement-unlock', ((e: any) => {
      handleAchievementUnlock(e.detail)
    }) as EventListener)

    return () => {
      window.removeEventListener('achievement-unlock', ((e: any) => {
        handleAchievementUnlock(e.detail)
      }) as EventListener)
    }
  }, [])

  const loadAchievements = () => {
    // TODO: 从 API 加载
    const mockAchievements: Achievement[] = [
      {
        id: 'first_blood',
        name: '第一滴血',
        description: '首次击败怪物',
        icon: '⚔️',
        progress: 1,
        maxProgress: 1,
        completed: true,
        completedAt: new Date(),
        rarity: 'common'
      },
      {
        id: 'level_10',
        name: '初出茅庐',
        description: '达到 10 级',
        icon: '🎯',
        progress: 8,
        maxProgress: 10,
        completed: false,
        rarity: 'common'
      },
      {
        id: 'rich',
        name: '富甲一方',
        description: '拥有 10000 金币',
        icon: '💰',
        progress: 5000,
        maxProgress: 10000,
        completed: false,
        rarity: 'rare'
      },
      {
        id: 'boss_slayer',
        name: 'BOSS 杀手',
        description: '击败 100 个 BOSS',
        icon: '👑',
        progress: 23,
        maxProgress: 100,
        completed: false,
        rarity: 'epic'
      },
      {
        id: 'legend',
        name: '传奇人物',
        description: '达到 100 级',
        icon: '🌟',
        progress: 45,
        maxProgress: 100,
        completed: false,
        rarity: 'legendary'
      }
    ]
    
    setAchievements(mockAchievements)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#b0b0b0'
      case 'rare': return '#3498db'
      case 'epic': return '#9b59b6'
      case 'legendary': return '#f39c12'
      default: return '#ffffff'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '0 0 10px rgba(176, 176, 176, 0.5)'
      case 'rare': return '0 0 15px rgba(52, 152, 219, 0.6)'
      case 'epic': return '0 0 20px rgba(155, 89, 182, 0.6)'
      case 'legendary': return '0 0 25px rgba(243, 156, 18, 0.8)'
      default: return 'none'
    }
  }

  return (
    <div className="achievement-display">
      {/* 最近解锁通知 */}
      <div className="recent-unlocks">
        {recentUnlocks.map((achievement) => (
          <div key={achievement.id} className="unlock-notification">
            <div className="unlock-icon">{achievement.icon}</div>
            <div className="unlock-info">
              <div className="unlock-title">🏆 成就解锁!</div>
              <div className="unlock-name">{achievement.name}</div>
              <div className="unlock-desc">{achievement.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 成就列表 */}
      <div className="achievements-panel">
        <div className="achievements-header">
          <h3>🏆 成就</h3>
          <button onClick={() => setShowAll(!showAll)}>
            {showAll ? '收起' : '展开全部'}
          </button>
        </div>

        <div className="achievements-list">
          {achievements.slice(0, showAll ? undefined : 5).map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
              style={{
                borderColor: getRarityColor(achievement.rarity),
                boxShadow: achievement.completed ? getRarityGlow(achievement.rarity) : 'none'
              }}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-desc">{achievement.description}</div>
                
                {!achievement.completed && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          backgroundColor: getRarityColor(achievement.rarity)
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                  </div>
                )}
                
                {achievement.completed && achievement.completedAt && (
                  <div className="achievement-completed">
                    ✅ 已完成于 {achievement.completedAt.toLocaleDateString()}
                  </div>
                )}
              </div>

              <div
                className="achievement-rarity"
                style={{ color: getRarityColor(achievement.rarity) }}
              >
                {achievement.rarity === 'legendary' ? '🌟' :
                 achievement.rarity === 'epic' ? '💜' :
                 achievement.rarity === 'rare' ? '💙' : '⚪'}
              </div>
            </div>
          ))}
        </div>

        {achievements.length > 5 && !showAll && (
          <div className="achievements-more">
            还有 {achievements.length - 5} 个成就...
          </div>
        )}
      </div>
    </div>
  )
}
