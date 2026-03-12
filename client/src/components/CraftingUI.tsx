import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'
import './CraftingUI.css'

/**
 * 制造配方
 */
interface Recipe {
  id: string
  name: string
  type: string
  outputItemId: string
  outputQuantity: number
  requiredLevel: number
  craftTime: number
  requiredItems: Array<{
    itemId: string
    quantity: number
  }>
  expReward: number
}

/**
 * 制造 UI 组件
 */
export function CraftingUI() {
  const [visible, setVisible] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [crafting, setCrafting] = useState(false)
  const [craftProgress, setCraftProgress] = useState(0)
  const inventory = useGameStore((state) => state.inventory)

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' || e.key === 'K') {
        setVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 获取配方列表
  useEffect(() => {
    if (visible && recipes.length === 0) {
      network.send('getRecipes', {})
      
      const handleRecipes = (payload: { recipes: Recipe[] }) => {
        setRecipes(payload.recipes)
      }

      network.onMessage('recipes', handleRecipes)
      return () => {
        network.offMessage('recipes', handleRecipes)
      }
    }
  }, [visible])

  // 监听制造成功
  useEffect(() => {
    const handleCraftSuccess = (payload: {
      recipeId: string
      itemId: string
      quantity: number
      exp: number
    }) => {
      setCrafting(false)
      setCraftProgress(0)
      console.log(`制造成功：${payload.itemId} x${payload.quantity}`)
    }

    const handleCraftFail = (payload: {
      recipeId: string
      reason: string
    }) => {
      setCrafting(false)
      setCraftProgress(0)
      alert(`制造失败：${payload.reason}`)
    }

    network.onMessage('craftSuccess', handleCraftSuccess)
    network.onMessage('craftFail', handleCraftFail)

    return () => {
      network.offMessage('craftSuccess', handleCraftSuccess)
      network.offMessage('craftFail', handleCraftFail)
    }
  }, [])

  // 过滤配方
  const filteredRecipes = selectedType === 'all'
    ? recipes
    : recipes.filter(r => r.type === selectedType)

  // 制造类型选项
  const types = ['all', 'Blacksmithing', 'Woodworking', 'Tailoring', 'Alchemy', 'Cooking']
  const typeNames: Record<string, string> = {
    'all': '全部',
    'Blacksmithing': '锻造',
    'Woodworking': '木工',
    'Tailoring': '裁缝',
    'Alchemy': '炼金',
    'Cooking': '烹饪',
  }

  // 检查材料是否足够
  const checkMaterials = (recipe: Recipe): boolean => {
    if (!inventory) return false
    
    for (const required of recipe.requiredItems) {
      const item = inventory.slots.find(i => i && i.templateId === required.itemId)
      if (!item || item.quantity < required.quantity) {
        return false
      }
    }
    return true
  }

  // 开始制造
  const startCrafting = (recipe: Recipe) => {
    if (!checkMaterials(recipe)) {
      alert('材料不足！')
      return
    }

    setCrafting(true)
    setCraftProgress(0)
    setSelectedRecipe(recipe)

    // 发送制造请求
    network.send('craft', {
      recipeId: recipe.id,
    })

    // 模拟制造进度
    const interval = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, recipe.craftTime / 10)
  }

  if (!visible) return null

  return (
    <div className="crafting-ui-overlay" onClick={() => setVisible(false)}>
      <div className="crafting-ui" onClick={e => e.stopPropagation()}>
        <div className="crafting-header">
          <h2>🔨 制造</h2>
          <button className="close-btn" onClick={() => setVisible(false)}>×</button>
        </div>

        {/* 类型筛选 */}
        <div className="crafting-filters">
          {types.map(type => (
            <button
              key={type}
              className={`filter-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {typeNames[type]}
            </button>
          ))}
        </div>

        <div className="crafting-content">
          {/* 配方列表 */}
          <div className="recipe-list">
            {filteredRecipes.map(recipe => {
              const hasMaterials = checkMaterials(recipe)
              return (
                <div
                  key={recipe.id}
                  className={`recipe-item ${selectedRecipe?.id === recipe.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="recipe-name">{recipe.name}</div>
                  <div className="recipe-level">等级 {recipe.requiredLevel}</div>
                  {!hasMaterials && <div className="missing-materials">⚠️ 材料不足</div>}
                </div>
              )
            })}
          </div>

          {/* 配方详情 */}
          <div className="recipe-details">
            {selectedRecipe ? (
              <>
                <h3>{selectedRecipe.name}</h3>
                <div className="recipe-info">
                  <div>类型：{typeNames[selectedRecipe.type]}</div>
                  <div>等级：{selectedRecipe.requiredLevel}</div>
                  <div>制造时间：{(selectedRecipe.craftTime / 1000).toFixed(1)}秒</div>
                  <div>经验：{selectedRecipe.expReward}</div>
                </div>

                <div className="recipe-materials">
                  <h4>所需材料:</h4>
                  {selectedRecipe.requiredItems.map(mat => {
                    const have = inventory?.slots.find(i => i && i.templateId === mat.itemId)
                    const hasEnough = (have?.quantity || 0) >= mat.quantity
                    return (
                      <div key={mat.itemId} className={`material-item ${hasEnough ? '' : 'missing'}`}>
                        <span>{mat.itemId}</span>
                        <span>{have?.quantity || 0} / {mat.quantity}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="recipe-output">
                  <h4>产物:</h4>
                  <div className="output-item">
                    {selectedRecipe.outputItemId} x{selectedRecipe.outputQuantity}
                  </div>
                </div>

                <button
                  className="craft-btn"
                  onClick={() => startCrafting(selectedRecipe)}
                  disabled={crafting || !checkMaterials(selectedRecipe)}
                >
                  {crafting && selectedRecipe?.id === selectedRecipe.id
                    ? `制造中... ${craftProgress}%`
                    : '制造'}
                </button>

                {crafting && selectedRecipe?.id === selectedRecipe.id && (
                  <div className="craft-progress-bar">
                    <div className="progress-fill" style={{ width: `${craftProgress}%` }} />
                  </div>
                )}
              </>
            ) : (
              <div className="no-selection">选择一个配方</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
