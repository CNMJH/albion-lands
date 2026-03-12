import { network } from '../network/NetworkManager'

/**
 * 简单的事件发射器 (浏览器环境)
 */
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
      return true
    }
    return false
  }
}

/**
 * 怪物类型
 */
export interface MonsterTemplate {
  id: string
  name: string
  level: number
  hp: number
  attack: number
  defense: number
  expReward: number
  silverReward: number
  zoneId: string
  aggroRange: number
  attackRange: number
  moveSpeed: number
  size?: number // 缩放比例 (默认 1.0)
}

/**
 * 怪物实例
 */
export interface Monster {
  id: string
  templateId: string
  name: string
  level: number
  hp: number
  maxHp: number
  x: number
  y: number
  zoneId: string
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'return'
  targetId?: string
  patrolPoints?: Array<{ x: number; y: number }>
  currentPatrolIndex?: number
  type?: string // 用于渲染的怪物类型
  size?: number // 缩放比例 (默认 1.0)
}

/**
 * 怪物 AI 系统
 * 负责管理所有怪物的 AI 行为
 */
export class MonsterAI extends EventEmitter {
  private monsters: Map<string, Monster> = new Map()
  private monsterTemplates: Map<string, MonsterTemplate> = new Map()
  private updateInterval: number = 100 // 毫秒
  private lastUpdateTime: number = 0

  // 怪物模板定义 (使用新素材映射)
  private readonly defaultTemplates: MonsterTemplate[] = [
    // 新手村庄 (Lv1-10) - zone_1
    { id: 'slime', name: '蓝色史莱姆', level: 2, hp: 50, attack: 8, defense: 2, expReward: 20, silverReward: 5, zoneId: 'zone_1', aggroRange: 100, attackRange: 30, moveSpeed: 80, size: 0.8 },
    { id: 'bat', name: '黑色蝙蝠', level: 4, hp: 60, attack: 10, defense: 3, expReward: 25, silverReward: 6, zoneId: 'zone_1', aggroRange: 90, attackRange: 25, moveSpeed: 110, size: 0.6 },
    { id: 'bee', name: '蜜蜂', level: 3, hp: 40, attack: 7, defense: 2, expReward: 18, silverReward: 4, zoneId: 'zone_1', aggroRange: 80, attackRange: 20, moveSpeed: 130, size: 0.5 },
    
    // 平原旷野 (Lv10-25) - zone_2
    { id: 'goblin', name: '哥布林', level: 12, hp: 150, attack: 25, defense: 8, expReward: 60, silverReward: 15, zoneId: 'zone_2', aggroRange: 120, attackRange: 35, moveSpeed: 100, size: 0.9 },
    { id: 'wolf', name: '野狼', level: 15, hp: 180, attack: 30, defense: 10, expReward: 75, silverReward: 20, zoneId: 'zone_2', aggroRange: 130, attackRange: 40, moveSpeed: 110, size: 1.0 },
    { id: 'snake', name: '毒蛇', level: 10, hp: 120, attack: 22, defense: 6, expReward: 50, silverReward: 12, zoneId: 'zone_2', aggroRange: 100, attackRange: 30, moveSpeed: 95, size: 0.7 },
    
    // 迷雾森林 (Lv25-40) - zone_3
    { id: 'spider', name: '毒蜘蛛', level: 28, hp: 280, attack: 45, defense: 15, expReward: 120, silverReward: 30, zoneId: 'zone_3', aggroRange: 130, attackRange: 40, moveSpeed: 95, size: 0.8 },
    { id: 'ghost', name: '幽灵', level: 32, hp: 320, attack: 50, defense: 12, expReward: 140, silverReward: 35, zoneId: 'zone_3', aggroRange: 140, attackRange: 45, moveSpeed: 90, size: 1.0 },
    { id: 'skeleton', name: '骷髅兵', level: 35, hp: 380, attack: 55, defense: 18, expReward: 160, silverReward: 40, zoneId: 'zone_3', aggroRange: 120, attackRange: 35, moveSpeed: 85, size: 1.0 },
    
    // 巨龙山脉 (Lv40-60) - zone_4
    { id: 'orc', name: '兽人', level: 45, hp: 600, attack: 80, defense: 35, expReward: 250, silverReward: 60, zoneId: 'zone_4', aggroRange: 180, attackRange: 50, moveSpeed: 85, size: 1.2 },
    { id: 'lizard', name: '蜥蜴人', level: 42, hp: 520, attack: 70, defense: 30, expReward: 220, silverReward: 50, zoneId: 'zone_4', aggroRange: 160, attackRange: 45, moveSpeed: 100, size: 1.0 },
    { id: 'medusa', name: '美杜莎', level: 50, hp: 750, attack: 95, defense: 40, expReward: 300, silverReward: 75, zoneId: 'zone_4', aggroRange: 170, attackRange: 55, moveSpeed: 80, size: 1.1 },
    
    // 深渊遗迹 (Lv60+) - zone_5
    { id: 'demon', name: '恶魔', level: 65, hp: 1200, attack: 120, defense: 60, expReward: 500, silverReward: 120, zoneId: 'zone_5', aggroRange: 200, attackRange: 60, moveSpeed: 90, size: 1.3 },
    { id: 'dragon', name: '巨龙', level: 75, hp: 2000, attack: 180, defense: 90, expReward: 800, silverReward: 200, zoneId: 'zone_5', aggroRange: 250, attackRange: 100, moveSpeed: 70, size: 2.0 },
    { id: 'mummy', name: '木乃伊', level: 60, hp: 900, attack: 100, defense: 50, expReward: 400, silverReward: 90, zoneId: 'zone_5', aggroRange: 180, attackRange: 50, moveSpeed: 75, size: 1.0 },
    { id: 'zombie', name: '僵尸', level: 55, hp: 800, attack: 90, defense: 45, expReward: 350, silverReward: 80, zoneId: 'zone_5', aggroRange: 160, attackRange: 45, moveSpeed: 65, size: 1.0 },
  ]

  constructor() {
    super()
    this.initializeTemplates()
    this.setupNetworkHandlers()
  }

  /**
   * 初始化怪物模板
   */
  private initializeTemplates(): void {
    this.defaultTemplates.forEach(template => {
      this.monsterTemplates.set(template.id, template)
    })
    console.log(`初始化 ${this.monsterTemplates.size} 个怪物模板`)
  }

  /**
   * 设置网络消息处理器
   */
  private setupNetworkHandlers(): void {
    // 监听怪物生成
    network.onMessage('monsterSpawn', (payload) => {
      this.spawnMonster(payload)
    })

    // 监听怪物移动
    network.onMessage('monsterMove', (payload) => {
      this.updateMonsterPosition(payload)
    })

    // 监听怪物攻击
    network.onMessage('monsterAttack', (payload) => {
      this.emit('monsterAttack', payload)
    })

    // 监听怪物死亡
    network.onMessage('monsterDeath', (payload) => {
      this.removeMonster(payload.monsterId)
      this.emit('monsterDeath', payload)
    })

    // 监听区域怪物列表
    network.onMessage('monsterList', (payload) => {
      this.loadMonsterList(payload.monsters)
    })
  }

  /**
   * 生成怪物
   */
  public spawnMonster(data: {
    id: string
    templateId: string
    x: number
    y: number
    zoneId: string
  }): void {
    const template = this.monsterTemplates.get(data.templateId)
    if (!template) {
      console.warn(`怪物模板不存在：${data.templateId}`)
      return
    }

    const monster: Monster = {
      id: data.id,
      templateId: template.id,
      name: template.name,
      level: template.level,
      hp: template.hp,
      maxHp: template.hp,
      x: data.x,
      y: data.y,
      zoneId: data.zoneId,
      state: 'idle',
      patrolPoints: this.generatePatrolPoints(data.x, data.y, 100),
      currentPatrolIndex: 0,
      type: template.id, // 用于渲染的怪物类型
      size: template.size || 1.0, // 缩放比例
    }

    this.monsters.set(monster.id, monster)
    this.emit('monsterSpawned', monster)
  }

  /**
   * 生成巡逻点
   */
  private generatePatrolPoints(startX: number, startY: number, range: number): Array<{ x: number; y: number }> {
    const points = []
    const pointCount = 4 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2
      const distance = range * (0.5 + Math.random() * 0.5)
      points.push({
        x: startX + Math.cos(angle) * distance,
        y: startY + Math.sin(angle) * distance,
      })
    }
    
    return points
  }

  /**
   * 更新怪物位置
   */
  public updateMonsterPosition(data: { id: string; x: number; y: number }): void {
    const monster = this.monsters.get(data.id)
    if (monster) {
      monster.x = data.x
      monster.y = data.y
      this.emit('monsterMoved', monster)
    }
  }

  /**
   * 移除怪物
   */
  public removeMonster(monsterId: string): void {
    this.monsters.delete(monsterId)
    this.emit('monsterRemoved', monsterId)
  }

  /**
   * 加载怪物列表
   */
  public loadMonsterList(monsters: Array<{ id: string; templateId: string; x: number; y: number; zoneId: string }>): void {
    monsters.forEach(data => {
      this.spawnMonster(data)
    })
  }

  /**
   * 更新怪物 AI
   */
  public update(deltaTime: number, playerPosition?: { x: number; y: number }): void {
    const now = Date.now()
    if (now - this.lastUpdateTime < this.updateInterval) return
    this.lastUpdateTime = now

    this.monsters.forEach(monster => {
      this.updateMonsterAI(monster, deltaTime, playerPosition)
    })
  }

  /**
   * 更新单个怪物 AI
   */
  private updateMonsterAI(monster: Monster, deltaTime: number, playerPosition?: { x: number; y: number }): void {
    const template = this.monsterTemplates.get(monster.templateId)
    if (!template) return

    switch (monster.state) {
      case 'idle':
        this.updateIdleState(monster, template, playerPosition)
        break
      case 'patrol':
        this.updatePatrolState(monster, template, deltaTime, playerPosition)
        break
      case 'chase':
        this.updateChaseState(monster, template, deltaTime, playerPosition)
        break
      case 'attack':
        this.updateAttackState(monster, template, playerPosition)
        break
      case 'return':
        this.updateReturnState(monster, template, deltaTime)
        break
    }
  }

  /**
   * 空闲状态
   */
  private updateIdleState(monster: Monster, template: MonsterTemplate, playerPosition?: { x: number; y: number }): void {
    if (playerPosition && this.checkAggro(monster, template, playerPosition)) {
      monster.state = 'chase'
      monster.targetId = 'player'
      this.emit('monsterStateChanged', { monsterId: monster.id, state: 'chase' })
    } else if (Math.random() < 0.01) {
      monster.state = 'patrol'
      this.emit('monsterStateChanged', { monsterId: monster.id, state: 'patrol' })
    }
  }

  /**
   * 巡逻状态
   */
  private updatePatrolState(monster: Monster, template: MonsterTemplate, deltaTime: number, playerPosition?: { x: number; y: number }): void {
    if (playerPosition && this.checkAggro(monster, template, playerPosition)) {
      monster.state = 'chase'
      monster.targetId = 'player'
      this.emit('monsterStateChanged', { monsterId: monster.id, state: 'chase' })
      return
    }

    if (!monster.patrolPoints || monster.patrolPoints.length === 0) {
      monster.state = 'idle'
      return
    }

    const targetPoint = monster.patrolPoints[monster.currentPatrolIndex || 0]
    if (!targetPoint) return

    const dx = targetPoint.x - monster.x
    const dy = targetPoint.y - monster.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 10) {
      monster.currentPatrolIndex = (monster.currentPatrolIndex || 0) + 1
      if (monster.currentPatrolIndex >= monster.patrolPoints.length) {
        monster.currentPatrolIndex = 0
      }
      monster.state = 'idle'
    } else {
      const moveX = (dx / distance) * template.moveSpeed * deltaTime
      const moveY = (dy / distance) * template.moveSpeed * deltaTime
      monster.x += moveX
      monster.y += moveY
      
      this.emit('monsterMove', {
        id: monster.id,
        x: monster.x,
        y: monster.y,
      })
    }
  }

  /**
   * 追击状态
   */
  private updateChaseState(monster: Monster, template: MonsterTemplate, deltaTime: number, playerPosition?: { x: number; y: number }): void {
    if (!playerPosition) {
      monster.state = 'return'
      return
    }

    const distanceToPlayer = Math.sqrt(
      Math.pow(playerPosition.x - monster.x, 2) + Math.pow(playerPosition.y - monster.y, 2)
    )

    // 进入攻击范围
    if (distanceToPlayer <= template.attackRange) {
      monster.state = 'attack'
      this.emit('monsterStateChanged', { monsterId: monster.id, state: 'attack' })
      return
    }

    // 追击
    const dx = playerPosition.x - monster.x
    const dy = playerPosition.y - monster.y
    const moveX = (dx / distanceToPlayer) * template.moveSpeed * deltaTime
    const moveY = (dy / distanceToPlayer) * template.moveSpeed * deltaTime
    
    monster.x += moveX
    monster.y += moveY

    this.emit('monsterMove', {
      id: monster.id,
      x: monster.x,
      y: monster.y,
    })

    // 检查是否超出追击范围
    if (monster.patrolPoints && monster.patrolPoints.length > 0) {
      const homeX = monster.patrolPoints[0].x
      const homeY = monster.patrolPoints[0].y
      const distanceFromHome = Math.sqrt(
        Math.pow(monster.x - homeX, 2) + Math.pow(monster.y - homeY, 2)
      )

      if (distanceFromHome > template.aggroRange * 2) {
        monster.state = 'return'
      }
    }
  }

  /**
   * 攻击状态
   */
  private updateAttackState(monster: Monster, template: MonsterTemplate, playerPosition?: { x: number; y: number }): void {
    if (!playerPosition) {
      monster.state = 'return'
      return
    }

    const distanceToPlayer = Math.sqrt(
      Math.pow(playerPosition.x - monster.x, 2) + Math.pow(playerPosition.y - monster.y, 2)
    )

    // 超出攻击范围，转为追击
    if (distanceToPlayer > template.attackRange * 1.5) {
      monster.state = 'chase'
      return
    }

    // 随机攻击
    if (Math.random() < 0.02) {
      this.emit('monsterAttack', {
        monsterId: monster.id,
        templateId: monster.templateId,
        attack: template.attack,
        targetId: 'player',
      })
    }
  }

  /**
   * 返回状态
   */
  private updateReturnState(monster: Monster, template: MonsterTemplate, deltaTime: number): void {
    if (!monster.patrolPoints || monster.patrolPoints.length === 0) {
      monster.state = 'idle'
      return
    }

    const homePoint = monster.patrolPoints[0]
    const dx = homePoint.x - monster.x
    const dy = homePoint.y - monster.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 10) {
      monster.state = 'idle'
      monster.x = homePoint.x
      monster.y = homePoint.y
    } else {
      const moveX = (dx / distance) * template.moveSpeed * deltaTime
      const moveY = (dy / distance) * template.moveSpeed * deltaTime
      monster.x += moveX
      monster.y += moveY

      this.emit('monsterMove', {
        id: monster.id,
        x: monster.x,
        y: monster.y,
      })
    }
  }

  /**
   * 检查是否进入仇恨范围
   */
  private checkAggro(monster: Monster, template: MonsterTemplate, playerPosition: { x: number; y: number }): boolean {
    const dx = playerPosition.x - monster.x
    const dy = playerPosition.y - monster.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= template.aggroRange
  }

  /**
   * 获取怪物
   */
  public getMonster(id: string): Monster | undefined {
    return this.monsters.get(id)
  }

  /**
   * 获取所有怪物
   */
  public getAllMonsters(): Monster[] {
    return Array.from(this.monsters.values())
  }

  /**
   * 获取怪物模板
   */
  public getTemplate(templateId: string): MonsterTemplate | undefined {
    return this.monsterTemplates.get(templateId)
  }

  /**
   * 清理所有怪物
   */
  public clear(): void {
    this.monsters.clear()
  }
}

// 导出单例
export const monsterAI = new MonsterAI()
