import { useState, useEffect } from 'react'
import { useGameStore, Item as StoreItem } from '../stores/gameStore'
import { inventorySystem, InventoryItem } from '../systems/InventorySystem'
import './Inventory.css'

/**
 * 背包窗口组件
 */
export function Inventory() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [equipment, setEquipment] = useState<Map<string, InventoryItem>>(new Map())
  const [currency, setCurrency] = useState({ silver: 0, gold: 0 })

  // 监听背包更新
  useEffect(() => {
    const handleInventoryUpdate = () => {
      setInventoryItems(inventorySystem.getAllItems())
      setEquipment(new Map(inventorySystem.getAllEquipment()))
      setCurrency(inventorySystem.getCurrency())
    }

    inventorySystem.on('inventoryLoaded', handleInventoryUpdate)
    inventorySystem.on('slotUpdated', handleInventoryUpdate)
    inventorySystem.on('equipmentChanged', handleInventoryUpdate)
    inventorySystem.on('currencyUpdated', handleInventoryUpdate)

    // 初始加载
    handleInventoryUpdate()

    return () => {
      inventorySystem.off('inventoryLoaded', handleInventoryUpdate)
      inventorySystem.off('slotUpdated', handleInventoryUpdate)
      inventorySystem.off('equipmentChanged', handleInventoryUpdate)
      inventorySystem.off('currencyUpdated', handleInventoryUpdate)
    }
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B' || e.key === 'I' || e.key === 'i') {
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleInventory = () => {
    setIsOpen(!isOpen)
  }

  const handleSlotClick = (slot: number) => {
    setSelectedSlot(slot === selectedSlot ? null : slot)
  }

  const handleItemClick = (slot: number, item: InventoryItem) => {
    if (item.item.slot) {
      // 装备物品
      inventorySystem.equipItem(slot)
    } else if (item.item.type === 'Consumable') {
      // 使用消耗品
      inventorySystem.useItem(slot)
    }
    setSelectedSlot(null)
  }

  const handleEquipSlotClick = (equipSlot: string) => {
    const equipItem = equipment.get(equipSlot)
    if (equipItem) {
      // 卸下装备
      inventorySystem.unequipItem(equipSlot as any)
    }
  }

  if (!isOpen) {
    return (
      <button className="inventory-toggle-btn" onClick={toggleInventory}>
        🎒 背包 (B)
      </button>
    )
  }

  return (
    <div className="inventory-window">
      <div className="inventory-header">
        <h3>🎒 背包</h3>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="inventory-content">
        {/* 装备区域 */}
        <div className="equipment-panel">
          <h4>装备</h4>
          <div className="equipment-grid">
            <EquipmentSlot 
              slot="MainHand" 
              item={equipment.get('MainHand')} 
              onClick={handleEquipSlotClick}
            />
            <EquipmentSlot 
              slot="Armor" 
              item={equipment.get('Armor')} 
              onClick={handleEquipSlotClick}
            />
            <EquipmentSlot 
              slot="Legs" 
              item={equipment.get('Legs')} 
              onClick={handleEquipSlotClick}
            />
            <EquipmentSlot 
              slot="Boots" 
              item={equipment.get('Boots')} 
              onClick={handleEquipSlotClick}
            />
          </div>
        </div>

        {/* 背包区域 */}
        <div className="inventory-panel">
          <h4>物品 ({inventoryItems.length}/50)</h4>
          <div className="inventory-grid">
            {Array.from({ length: 50 }).map((_, index) => {
              const item = inventoryItems.find(i => i.slot === index)
              return (
                <InventorySlot
                  key={index}
                  slot={index}
                  item={item}
                  isSelected={selectedSlot === index}
                  onClick={handleSlotClick}
                  onItemClick={handleItemClick}
                />
              )
            })}
          </div>
        </div>

        {/* 货币区域 */}
        <div className="currency-panel">
          <div className="currency-row">
            <span className="currency-icon">🪙</span>
            <span className="currency-amount">{currency.silver.toLocaleString()}</span>
            <span className="currency-label">银币</span>
          </div>
          <div className="currency-row">
            <span className="currency-icon">💰</span>
            <span className="currency-amount">{currency.gold.toLocaleString()}</span>
            <span className="currency-label">金币</span>
          </div>
        </div>
      </div>

      {/* 物品信息提示 */}
      {selectedSlot !== null && (
        <ItemTooltip 
          item={inventoryItems.find(i => i.slot === selectedSlot)} 
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}

/**
 * 装备槽组件
 */
interface EquipmentSlotProps {
  slot: string
  item?: InventoryItem
  onClick: (slot: string) => void
}

function EquipmentSlot({ slot, item, onClick }: EquipmentSlotProps) {
  const slotNames: Record<string, string> = {
    MainHand: '主手',
    OffHand: '副手',
    Head: '头部',
    Armor: '衣服',
    Legs: '腿部',
    Boots: '鞋子',
    Gloves: '手套',
    Ring: '戒指',
    Necklace: '项链',
  }

  return (
    <div 
      className={`equipment-slot ${item ? 'has-item' : 'empty'}`}
      onClick={() => onClick(slot)}
      title={slotNames[slot] || slot}
    >
      {item ? (
        <div className={`item-icon rarity-${item.item.rarity.toLowerCase()}`}>
          {getItemIcon(item.item.type)}
          <span className="item-quantity">{item.quantity}</span>
        </div>
      ) : (
        <div className="slot-placeholder">{slotNames[slot] || slot}</div>
      )}
    </div>
  )
}

/**
 * 背包槽组件
 */
interface InventorySlotProps {
  slot: number
  item?: InventoryItem
  isSelected: boolean
  onClick: (slot: number) => void
  onItemClick: (slot: number, item: InventoryItem) => void
}

function InventorySlot({ slot, item, isSelected, onClick, onItemClick }: InventorySlotProps) {
  const handleClick = () => {
    onClick(slot)
    if (item) {
      onItemClick(slot, item)
    }
  }

  return (
    <div 
      className={`inventory-slot ${isSelected ? 'selected' : ''} ${item ? 'has-item' : 'empty'}`}
      onClick={handleClick}
    >
      {item && (
        <>
          <div className={`item-icon rarity-${item.item.rarity.toLowerCase()}`}>
            {getItemIcon(item.item.type)}
            {item.quantity > 1 && (
              <span className="item-quantity">{item.quantity}</span>
            )}
          </div>
          {item.isEquipped && <span className="equipped-indicator">★</span>}
        </>
      )}
    </div>
  )
}

/**
 * 物品信息提示组件
 */
interface ItemTooltipProps {
  item?: InventoryItem
  onClose: () => void
}

function ItemTooltip({ item, onClose }: ItemTooltipProps) {
  if (!item) return null

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Common: '#b0b0b0',
      Uncommon: '#1eff00',
      Rare: '#0070dd',
      Epic: '#a335ee',
      Legendary: '#ff8000',
    }
    return colors[rarity] || '#ffffff'
  }

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      Weapon: '武器',
      Armor: '防具',
      Material: '材料',
      Consumable: '消耗品',
      Tool: '工具',
      Quest: '任务物品',
    }
    return names[type] || type
  }

  return (
    <div className="item-tooltip" onClick={onClose}>
      <div className="tooltip-header">
        <h4 style={{ color: getRarityColor(item.item.rarity) }}>
          {item.item.name}
        </h4>
        <span className="tooltip-level">等级 {item.item.level}</span>
      </div>
      
      <div className="tooltip-info">
        <div className="tooltip-type">{getTypeName(item.item.type)}</div>
        <div className="tooltip-rarity">{item.item.rarity}</div>
      </div>

      {item.item.stats && Object.entries(item.item.stats).length > 0 && (
        <div className="tooltip-stats">
          {Object.entries(item.item.stats).map(([stat, value]) => (
            <div key={stat} className="stat-row">
              <span className="stat-name">{getStatName(stat)}:</span>
              <span className="stat-value">+{value}</span>
            </div>
          ))}
        </div>
      )}

      {item.item.description && (
        <div className="tooltip-description">
          {item.item.description}
        </div>
      )}

      <div className="tooltip-footer">
        <div className="tooltip-price">💰 {item.item.price}</div>
        <div className="tooltip-stack">堆叠：{item.quantity}/{item.item.maxStackSize}</div>
      </div>

      <div className="tooltip-actions">
        {item.item.slot && (
          <button className="action-btn">装备</button>
        )}
        {item.item.type === 'Consumable' && (
          <button className="action-btn">使用</button>
        )}
      </div>
    </div>
  )
}

/**
 * 获取物品图标
 */
function getItemIcon(type: string): string {
  const icons: Record<string, string> = {
    Weapon: '⚔️',
    Armor: '👕',
    Material: '📦',
    Consumable: '🧪',
    Tool: '⛏️',
    Quest: '📜',
  }
  return icons[type] || '📦'
}

/**
 * 获取属性名称
 */
function getStatName(stat: string): string {
  const names: Record<string, string> = {
    attack: '攻击力',
    defense: '防御力',
    magic: '魔法强度',
    hp: '生命值',
    mp: '法力值',
    critRate: '暴击率',
    speed: '速度',
  }
  return names[stat] || stat
}
