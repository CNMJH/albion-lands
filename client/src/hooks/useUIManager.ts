import { useState, useEffect } from 'react'
import { playerControls } from '../systems/PlayerControlsSystem'

/**
 * UI 面板类型
 */
export type UIPanel = 'inventory' | 'crafting' | 'quest' | 'friends' | 'chat'

/**
 * UI 状态接口
 */
export interface UIState {
  inventory: boolean
  crafting: boolean
  quest: boolean
  friends: boolean
  chat: boolean
}

const initialUIState: UIState = {
  inventory: false,
  crafting: false,
  quest: false,
  friends: false,
  chat: false,
}

/**
 * UI 管理器 Hook
 * 
 * 用法：
 * ```tsx
 * function App() {
 *   const { uiState, toggleUI, closeAllUI, isUIOpen } = useUIManager()
 *   
 *   return (
 *     <>
 *       {uiState.inventory && <Inventory />}
 *       {uiState.crafting && <CraftingUI />}
 *       {uiState.quest && <QuestUI />}
 *       {uiState.friends && <FriendsUI />}
 *       {uiState.chat && <ChatBox />}
 *     </>
 *   )
 * }
 * ```
 */
export function useUIManager() {
  const [uiState, setUIState] = useState<UIState>(initialUIState)

  useEffect(() => {
    // 监听玩家操作系统的 UI 切换事件
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return

    const handleUIToggle = (event: any) => {
      const { type, visible } = event.detail || event
      if (type && type in initialUIState) {
        setUIState(prev => ({
          ...prev,
          [type]: visible,
        }))
      }
    }

    // 使用自定义事件监听
    canvas.addEventListener('uiToggle', handleUIToggle as EventListener)

    return () => {
      canvas.removeEventListener('uiToggle', handleUIToggle as EventListener)
    }
  }, [])

  /**
   * 切换 UI 面板
   */
  const toggleUI = (panel: UIPanel) => {
    setUIState(prev => {
      const newState: UIState = { ...initialUIState }
      
      // 如果当前面板是打开的，关闭所有
      // 如果当前面板是关闭的，打开它
      newState[panel] = !prev[panel]
      
      // 同步到玩家操作系统
      const controls = playerControls.getInstance()
      if (controls) {
        controls.setUIState('inventory', newState.inventory)
        controls.setUIState('crafting', newState.crafting)
        controls.setUIState('quest', newState.quest)
        controls.setUIState('friends', newState.friends)
        controls.setUIState('chat', newState.chat)
      }
      
      return newState
    })
  }

  /**
   * 关闭所有 UI
   */
  const closeAllUI = () => {
    setUIState(initialUIState)
    
    const controls = playerControls.getInstance()
    if (controls) {
      controls.setUIState('inventory', false)
      controls.setUIState('crafting', false)
      controls.setUIState('quest', false)
      controls.setUIState('friends', false)
      controls.setUIState('chat', false)
    }
  }

  /**
   * 设置单个 UI 状态
   */
  const setPanelState = (panel: UIPanel, visible: boolean) => {
    setUIState(prev => {
      const newState = { ...prev, [panel]: visible }
      
      // 同步到玩家操作系统
      const controls = playerControls.getInstance()
      if (controls) {
        controls.setUIState(panel, visible)
      }
      
      return newState
    })
  }

  /**
   * 检查是否有 UI 打开
   */
  const isUIOpen = () => {
    return uiState.inventory || uiState.crafting || uiState.quest || uiState.friends || uiState.chat
  }

  return {
    uiState,
    toggleUI,
    closeAllUI,
    isUIOpen,
    setPanelState,
  }
}

/**
 * UI 快捷键说明
 * 
 * B - 背包 (Inventory)
 * C - 制作 (Crafting)
 * Q - 任务 (Quest)
 * F - 好友 (Friends)
 * Enter - 聊天 (Chat)
 * Esc - 关闭所有 UI（待实现）
 */
