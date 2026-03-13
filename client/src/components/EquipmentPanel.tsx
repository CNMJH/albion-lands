import { useState, useEffect } from 'react'
import { EquipmentSystem, type EquipmentSlot, type Equipment, type CharacterStats } from '../systems/EquipmentSystem'
import { useGameStore } from '../stores/gameStore'
import { DurabilityBar } from './DurabilityBar'
import './EquipmentPanel.css'

/**
 * 物品数据
 */
interface Item {
  id: string
  name: string
  type: string
  slot: EquipmentSlot
  tier: number
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
  icon?: string
  stats?: Record<string, number>
  description?: string
  minLevel: number
  price: number
}

/**
 * 装备面板组件
 */
export function EquipmentPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [equipment, setEquipment] = useState<Equipment>({})
  const [stats, setStats] = useState<CharacterStats>({
    attack: 0,
    defense: 0,
    hp: 0,
    attackSpeed: 0,
    moveSpeed: 0
  })
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null)
  const [equipmentSystem, setEquipmentSystem] = useState<EquipmentSystem | null>(null)
  const { player } = useGameStore()

  // 初始化
  useEffect(() => {
    // 从 gameStore 获取 characterId（优先）
    const charId = player?.id || localStorage.getItem('characterId') || ''
    
    // 如果 characterId 为空，不初始化装备系统
    if (!charId) {
      console.warn('⚠️ EquipmentPanel: characterId 为空，等待登录')
      return
    }
    
    const system = new EquipmentSystem(charId)
    setEquipmentSystem(system)

    // 监听装备变化
    const handleEquipmentChange = () => {
      setEquipment(system.getEquipment())
      setStats(system.getStats())
    }

    system.on('equipmentChanged', handleEquipmentChange)
    
    // 初始加载
    handleEquipmentChange()

    return () => {
      system.off('equipmentChanged', handleEquipmentChange)
    }
  }, [player?.id]) // 依赖 player.id，当玩家登录时重新初始化

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 聊天框激活时禁用快捷键
      const chatActive = document.querySelector('input:focus, textarea:focus')
      if (chatActive) return

      if (e.key === 'c' || e.key === 'C') {
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const handleEquipSlotClick = async (slot: EquipmentSlot) => {
    if (!equipmentSystem) return

    const currentItemId = equipment[slot]
    
    if (currentItemId) {
      // 卸下装备
      const result = await equipmentSystem.unequipItem(slot)
      if (!result.success) {
        console.error('卸下装备失败:', result.error)
      }
    } else {
      // 打开选择界面（从背包选择）
      setSelectedSlot(slot)
    }
  }

  const handleEquipItem = async (itemId: string, slot: EquipmentSlot) => {
    if (!equipmentSystem) return

    const result = await equipmentSystem.equipItem(itemId, slot)
    if (result.success) {
      setSelectedSlot(null)
    } else {
      console.error('装备失败:', result.error)
      alert(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button className="equipment-toggle-btn" onClick={togglePanel}>
        ⚔️ 装备 (C)
      </button>
    )
  }

  return (
    <div className="equipment-panel-window">
      <div className="equipment-header">
        <h3>⚔️ 装备</h3>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="equipment-content">
        {/* 左侧：装备槽位 */}
        <div className="equipment-slots-section">
          <h4>装备槽位</h4>
          <div className="equipment-slots-grid">
            <EquipmentSlotItem
              slot="MainHand"
              itemId={equipment.MainHand}
              onClick={() => handleEquipSlotClick('MainHand')}
              isSelected={selectedSlot === 'MainHand'}
            />
            <EquipmentSlotItem
              slot="OffHand"
              itemId={equipment.OffHand}
              onClick={() => handleEquipSlotClick('OffHand')}
              isSelected={selectedSlot === 'OffHand'}
            />
            <EquipmentSlotItem
              slot="Armor"
              itemId={equipment.Armor}
              onClick={() => handleEquipSlotClick('Armor')}
              isSelected={selectedSlot === 'Armor'}
            />
            <EquipmentSlotItem
              slot="Legs"
              itemId={equipment.Legs}
              onClick={() => handleEquipSlotClick('Legs')}
              isSelected={selectedSlot === 'Legs'}
            />
            <EquipmentSlotItem
              slot="Boots"
              itemId={equipment.Boots}
              onClick={() => handleEquipSlotClick('Boots')}
              isSelected={selectedSlot === 'Boots'}
            />
            <EquipmentSlotItem
              slot="Accessory"
              itemId={equipment.Accessory}
              onClick={() => handleEquipSlotClick('Accessory')}
              isSelected={selectedSlot === 'Accessory'}
            />
          </div>
        </div>

        {/* 右侧：角色属性 */}
        <div className="character-stats-section">
          <h4>角色属性</h4>
          <div className="stats-list">
            <StatRow 
              icon="⚔️" 
              label="攻击力" 
              value={stats.attack} 
              color="#e74c3c"
            />
            <StatRow 
              icon="🛡️" 
              label="防御力" 
              value={stats.defense} 
              color="#3498db"
            />
            <StatRow 
              icon="❤️" 
              label="生命值" 
              value={stats.hp} 
              color="#27ae60"
            />
            <StatRow 
              icon="⚡" 
              label="攻击速度" 
              value={stats.attackSpeed} 
              color="#f39c12"
              suffix="%"
            />
            <StatRow 
              icon="👟" 
              label="移动速度" 
              value={stats.moveSpeed} 
              color="#9b59b6"
              suffix="px/s"
            />
          </div>

          {/* 总评分 */}
          <div className="power-score">
            <div className="power-label">总评分</div>
            <div className="power-value">
              {calculatePowerScore(stats)}
            </div>
          </div>
        </div>
      </div>

      {/* 装备选择界面 */}
      {selectedSlot && (
        <ItemSelectionModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onEquip={(itemId) => handleEquipItem(itemId, selectedSlot)}
        />
      )}
    </div>
  )
}

/**
 * 装备槽位物品组件
 */
interface EquipmentSlotItemProps {
  slot: EquipmentSlot
  itemId?: string
  onClick: () => void
  isSelected: boolean
}

function EquipmentSlotItem({ slot, itemId, onClick, isSelected }: EquipmentSlotItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const slotNames: Record<EquipmentSlot, string> = {
    MainHand: '主手',
    OffHand: '副手',
    Armor: '胸甲',
    Legs: '腿甲',
    Boots: '鞋子',
    Accessory: '饰品'
  }

  const slotIcons: Record<EquipmentSlot, string> = {
    MainHand: '⚔️',
    OffHand: '🛡️',
    Armor: '👕',
    Legs: '👖',
    Boots: '👟',
    Accessory: '💍'
  }

  // 模拟耐久度（实际应从服务端获取）
  const durability = itemId ? Math.floor(Math.random() * 40) + 60 : 100
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (itemId) {
      setShowTooltip(true)
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top,
      })
    }
  }
  
  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <>
      <div 
        className={`equipment-slot-item ${itemId ? 'equipped' : 'empty'} ${isSelected ? 'selected' : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {itemId ? (
          <div className="equipped-item">
            <div className="item-icon">
              {slotIcons[slot]}
            </div>
            <div className="item-info">
              <div className="item-name">{getItemName(itemId)}</div>
              <div className="item-tier">T{getItemTier(itemId)}</div>
            </div>
            <div className="item-durability">
              <DurabilityBar current={durability} max={100} showText={false} />
            </div>
          </div>
        ) : (
          <div className="empty-slot">
            <div className="slot-icon">{slotIcons[slot]}</div>
            <div className="slot-name">{slotNames[slot]}</div>
          </div>
        )}
        {itemId && <div className="equipped-indicator">✓</div>}
      </div>
      
      {/* Hover 显示 tooltip */}
      {showTooltip && itemId && (
        <div 
          className="item-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="tooltip-header">
            <h4 className="tooltip-name">{getItemName(itemId)}</h4>
            <span className="tooltip-level">T{getItemTier(itemId)}</span>
          </div>
          <div className="tooltip-type">{slotNames[slot]}装备</div>
          <div className="tooltip-stats">
            <div className="tooltip-stat">
              <span className="tooltip-stat-label">攻击力</span>
              <span className="tooltip-stat-value">+{Math.floor(Math.random() * 20) + 10}</span>
            </div>
            <div className="tooltip-stat">
              <span className="tooltip-stat-label">防御力</span>
              <span className="tooltip-stat-value">+{Math.floor(Math.random() * 10) + 5}</span>
            </div>
          </div>
          <div className="tooltip-description">
            {getEquipmentDescription(slot)}
          </div>
        </div>
      )}
    </>
  )
}

/**
 * 属性行组件
 */
interface StatRowProps {
  icon: string
  label: string
  value: number
  color: string
  suffix?: string
}

function StatRow({ icon, label, value, color, suffix = '' }: StatRowProps) {
  return (
    <div className="stat-row">
      <div className="stat-label">
        <span className="stat-icon">{icon}</span>
        <span className="stat-name">{label}</span>
      </div>
      <div 
        className="stat-value" 
        style={{ color }}
      >
        {Math.round(value)}{suffix}
      </div>
    </div>
  )
}

/**
 * 物品选择弹窗
 */
interface ItemSelectionModalProps {
  slot: EquipmentSlot
  onClose: () => void
  onEquip: (itemId: string) => void
}

function ItemSelectionModal({ slot, onClose, onEquip }: ItemSelectionModalProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: 从背包系统获取可装备物品
    // 这里使用模拟数据
    const mockItems: Item[] = [
      {
        id: 'item_001',
        name: '铁剑',
        type: 'Weapon',
        slot: 'MainHand',
        tier: 1,
        rarity: 'Common',
        stats: { attack: 10, attackSpeed: 0.1 },
        minLevel: 1,
        price: 100
      },
      {
        id: 'item_002',
        name: '钢剑',
        type: 'Weapon',
        slot: 'MainHand',
        tier: 2,
        rarity: 'Uncommon',
        stats: { attack: 20, attackSpeed: 0.15 },
        minLevel: 10,
        price: 500
      },
      {
        id: 'item_003',
        name: '秘银剑',
        type: 'Weapon',
        slot: 'MainHand',
        tier: 3,
        rarity: 'Rare',
        stats: { attack: 35, attackSpeed: 0.2 },
        minLevel: 20,
        price: 2000
      }
    ]

    setItems(mockItems)
    setLoading(false)
  }, [slot])

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Common: '#b0b0b0',
      Uncommon: '#3498db',
      Rare: '#9b59b6',
      Legendary: '#f39c12'
    }
    return colors[rarity] || '#ffffff'
  }

  const getRarityBorder = (rarity: string) => {
    const borders: Record<string, string> = {
      Common: '1px solid #b0b0b0',
      Uncommon: '2px solid #3498db',
      Rare: '2px solid #9b59b6',
      Legendary: '3px solid #f39c12'
    }
    return borders[rarity] || '1px solid #fff'
  }

  return (
    <div className="item-selection-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>选择装备 - {getSlotName(slot)}</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : items.length === 0 ? (
            <div className="empty">没有可装备的物品</div>
          ) : (
            <div className="items-grid">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="item-card"
                  style={{ border: getRarityBorder(item.rarity) }}
                >
                  <div className="item-card-header">
                    <div className="item-card-icon">⚔️</div>
                    <div 
                      className="item-card-name"
                      style={{ color: getRarityColor(item.rarity) }}
                    >
                      {item.name}
                    </div>
                  </div>
                  
                  <div className="item-card-tier">T{item.tier}</div>
                  
                  {item.stats && (
                    <div className="item-card-stats">
                      {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat} className="item-stat">
                          <span className="stat-name">{getStatName(stat)}:</span>
                          <span className="stat-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="item-card-footer">
                    <div className="item-level">等级：{item.minLevel}</div>
                    <button 
                      className="equip-btn"
                      onClick={() => onEquip(item.id)}
                    >
                      装备
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 辅助函数
 */

function getSlotName(slot: EquipmentSlot): string {
  const names: Record<EquipmentSlot, string> = {
    MainHand: '主手',
    OffHand: '副手',
    Armor: '胸甲',
    Legs: '腿甲',
    Boots: '鞋子',
    Accessory: '饰品'
  }
  return names[slot] || slot
}

function getItemTier(_itemId: string): number {
  // 从 itemId 中提取 tier（模拟）
  return Math.floor(Math.random() * 5) + 1
}

function getItemName(itemId: string): string {
  // 从 itemId 生成物品名称（模拟）
  const prefixes = ['新手', '学徒', '冒险者', '勇士', '英雄']
  const suffixes = ['之剑', '之斧', '之弓', '之法杖', '之盾']
  const tier = getItemTier(itemId)
  return `${prefixes[Math.min(tier - 1, 4)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`
}

function getEquipmentDescription(slot: EquipmentSlot): string {
  const descriptions: Record<EquipmentSlot, string> = {
    MainHand: '主手装备，提供主要攻击力和武器特效',
    OffHand: '副手装备，提供防御和特殊能力',
    Armor: '胸甲装备，提供大量防御力和生命值',
    Legs: '腿甲装备，提供中等防御力和移动速度',
    Boots: '鞋子装备，提供移动速度和闪避',
    Accessory: '饰品装备，提供特殊属性和技能加成'
  }
  return descriptions[slot] || '装备'
}

function calculatePowerScore(stats: CharacterStats): number {
  // 简单的战力计算公式
  return Math.round(
    stats.attack * 2 + 
    stats.defense * 1.5 + 
    stats.hp * 0.5 + 
    stats.attackSpeed * 10 + 
    stats.moveSpeed * 0.1
  )
}

function getStatName(stat: string): string {
  const names: Record<string, string> = {
    attack: '攻击力',
    defense: '防御力',
    hp: '生命值',
    attackSpeed: '攻速',
    moveSpeed: '移速'
  }
  return names[stat] || stat
}
