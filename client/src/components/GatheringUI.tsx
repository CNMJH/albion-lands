import { useEffect, useState } from 'react'
import { gatheringSystem, ResourceNode } from '../systems/GatheringSystem'
import './GatheringUI.css'

/**
 * 采集 UI 组件
 * 显示资源节点信息和采集进度
 */
export function GatheringUI() {
  const [visible, setVisible] = useState(false)
  const [currentNode, setCurrentNode] = useState<ResourceNode | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 监听采集事件
    const handleGatheringAnimation = ({ nodeId }: { nodeId: string }) => {
      const node = gatheringSystem.getResourceNode(nodeId)
      if (node) {
        setCurrentNode(node)
        setVisible(true)
        setProgress(0)
      }
    }

    const handleGatherSuccess = () => {
      setVisible(false)
      setCurrentNode(null)
      setProgress(0)
    }

    const handleGatherFail = () => {
      setVisible(false)
      setCurrentNode(null)
      setProgress(0)
    }

    gatheringSystem.on('gatheringAnimation', handleGatheringAnimation)
    gatheringSystem.on('gatherSuccess', handleGatherSuccess)
    gatheringSystem.on('gatherFail', handleGatherFail)

    return () => {
      gatheringSystem.off('gatheringAnimation', handleGatheringAnimation)
      gatheringSystem.off('gatherSuccess', handleGatherSuccess)
      gatheringSystem.off('gatherFail', handleGatherFail)
    }
  }, [])

  // 更新采集进度
  useEffect(() => {
    if (visible && currentNode) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100
          return prev + 10
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [visible, currentNode])

  if (!visible || !currentNode) return null

  return (
    <div className="gathering-ui">
      <div className="gathering-info">
        <div className="resource-name">{currentNode.name}</div>
        <div className="resource-level">等级 {currentNode.level}</div>
        
        {/* 采集进度条 */}
        <div className="gathering-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        {/* 剩余次数 */}
        <div className="resource-hits">
          剩余：{currentNode.hitsRemaining}/{currentNode.maxHits}
        </div>

        {/* 所需工具 */}
        {currentNode.toolRequired && (
          <div className="resource-tool">
            需要：{getToolName(currentNode.toolRequired)}
          </div>
        )}
      </div>
    </div>
  )
}

function getToolName(toolType: string): string {
  const names: Record<string, string> = {
    'pickaxe': '镐',
    'axe': '斧',
    'sickle': '镰刀',
    'rod': '鱼竿',
  }
  return names[toolType] || toolType
}
