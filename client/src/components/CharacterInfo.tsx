import { useGameStore } from '../stores/gameStore'
import './CharacterInfo-optimized.css'

/**
 * 角色信息组件
 * 显示生命值、魔法值、经验值等
 */
export function CharacterInfo() {
  const { player } = useGameStore()

  if (!player) {
    return <div className="character-info">加载中...</div>
  }

  const hpPercent = (player.hp / player.maxHp) * 100
  const mpPercent = (player.mp / player.maxMp) * 100
  const expPercent = (player.exp / player.maxExp) * 100

  return (
    <div className="character-info">
      {/* 等级 */}
      <div className="level-badge">
        Lv.{player.level}
      </div>

      {/* 名称 */}
      <div className="character-name">
        {player.name}
        {player.isBot && <span className="bot-tag">[AI]</span>}
      </div>

      {/* 生命值 */}
      <div className="status-bar hp-bar">
        <div 
          className="bar-fill" 
          style={{ width: `${hpPercent}%` }}
        />
        <span className="bar-text">
          {player.hp} / {player.maxHp}
        </span>
      </div>

      {/* 魔法值 */}
      <div className="status-bar mp-bar">
        <div 
          className="bar-fill" 
          style={{ width: `${mpPercent}%` }}
        />
        <span className="bar-text">
          {player.mp} / {player.maxMp}
        </span>
      </div>

      {/* 经验值 */}
      <div className="status-bar exp-bar">
        <div 
          className="bar-fill" 
          style={{ width: `${expPercent}%` }}
        />
        <span className="bar-text">
          {player.exp} / {player.maxExp}
        </span>
      </div>
    </div>
  )
}
