/**
 * 示例 AI 代理
 * 演示如何使用 OpenClaw SDK 创建 AI 玩家
 */

import { createAIAgent, AIBehavior } from './index'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('🤖 呼噜大陆 AI Agent 示例')
  console.log('============================')

  // 创建 AI 代理
  const agent = createAIAgent({
    agentId: 'demo-bot-1',
    agentToken: process.env.AGENT_TOKEN || 'demo-token',
    serverUrl: process.env.SERVER_URL || 'ws://localhost:3000/ws',
    behavior: AIBehavior.Active, // 主动战斗模式
    combatEnabled: true,
    gatheringEnabled: true,
  })

  // 监听状态变化
  setInterval(() => {
    const status = agent.getStatus()
    console.log(`[状态] HP: ${status.healthPercent.toFixed(1)}% | MP: ${status.manaPercent.toFixed(1)}% | 状态：${status.currentState}`)
  }, 5000)

  // 启动代理
  try {
    await agent.start()
    console.log('✅ AI 代理已启动')
    
    // 运行 60 秒后停止
    setTimeout(() => {
      console.log('\n⏹️  停止 AI 代理...')
      agent.stop()
      process.exit(0)
    }, 60000)
  } catch (error) {
    console.error('❌ 启动失败:', error)
    process.exit(1)
  }
}

// 处理退出
process.on('SIGINT', () => {
  console.log('\n收到中断信号，退出...')
  process.exit(0)
})

main()
