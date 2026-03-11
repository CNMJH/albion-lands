import { useState } from 'react'
import { CharacterInfo } from './CharacterInfo'
import { SkillBar } from './SkillBar'
import { MiniMap } from './MiniMap'
import { ChatBox } from './ChatBox'
import { MenuBar } from './MenuBar'
import './UIOverlay.css'

/**
 * UI 覆盖层组件
 * 包含所有游戏 UI 元素
 */
export function UIOverlay() {
  const [showInventory, setShowInventory] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div id="ui-overlay">
      {/* 顶部区域 */}
      <div className="ui-top">
        {/* 小地图 */}
        <div className="ui-top-left">
          <MiniMap />
        </div>

        {/* 角色信息 */}
        <div className="ui-top-center">
          <CharacterInfo />
        </div>

        {/* 菜单按钮 */}
        <div className="ui-top-right">
          <MenuBar
            onInventory={() => setShowInventory(true)}
            onCharacter={() => setShowCharacter(true)}
            onSettings={() => setShowSettings(true)}
          />
        </div>
      </div>

      {/* 底部区域 */}
      <div className="ui-bottom">
        {/* 技能栏 */}
        <div className="ui-bottom-center">
          <SkillBar />
        </div>
      </div>

      {/* 左侧区域 */}
      <div className="ui-left">
        {/* 聊天框 */}
        <div className="ui-left-bottom">
          <ChatBox />
        </div>
      </div>

      {/* 弹窗窗口 */}
      {showInventory && (
        <div className="ui-window">
          <div className="window-header">
            <span>背包</span>
            <button onClick={() => setShowInventory(false)}>×</button>
          </div>
          <div className="window-content">
            <p>背包功能开发中...</p>
          </div>
        </div>
      )}

      {showCharacter && (
        <div className="ui-window">
          <div className="window-header">
            <span>角色</span>
            <button onClick={() => setShowCharacter(false)}>×</button>
          </div>
          <div className="window-content">
            <p>角色信息开发中...</p>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="ui-window">
          <div className="window-header">
            <span>设置</span>
            <button onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className="window-content">
            <p>设置功能开发中...</p>
          </div>
        </div>
      )}
    </div>
  )
}
