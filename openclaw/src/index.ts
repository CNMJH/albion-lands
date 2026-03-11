/**
 * OpenClaw SDK for Albion Lands
 * 
 * 用于创建 AI 代理的完整 SDK
 * 
 * @example
 * ```typescript
 * import { OpenClawClient } from 'albion-lands-openclaw'
 * 
 * const client = new OpenClawClient({
 *   serverUrl: 'ws://localhost:3000/ws',
 *   agentId: 'my-bot-1',
 *   agentToken: 'your-token',
 * })
 * 
 * await client.connect()
 * 
 * client.on('gameStateUpdate', (state) => {
 *   console.log('游戏状态更新:', state)
 * })
 * 
 * // 移动
 * client.move(100, 200)
 * 
 * // 使用技能
 * client.useSkill('fireball', targetX, targetY)
 * ```
 */

export { OpenClawClient } from './OpenClawClient'
export * from './types'
export { createAIAgent } from './agent'
export type { AIAgent, AIAgentConfig } from './agent'
