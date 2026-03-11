import { useState, useEffect } from 'react'
import './GMPanel.css'

/**
 * GM 面板组件
 * H5 网页端管理工具
 */
export function GMPanel() {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [serverStatus, setServerStatus] = useState<any>(null)
  const [message, setMessage] = useState<{type: string, text: string} | null>(null)

  // 监听快捷键 (Ctrl+G 打开 GM 面板)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault()
        setVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 加载数据
  useEffect(() => {
    if (visible) {
      loadDashboard()
    }
  }, [visible])

  // 加载仪表盘
  async function loadDashboard() {
    try {
      const res = await fetch('/api/v1/gm/dashboard')
      const data = await res.json()
      if (data.success) {
        setDashboard(data.data)
      }
    } catch (error) {
      showMessage('error', '加载仪表盘失败')
    }
  }

  // 加载玩家列表
  async function loadPlayers() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/gm/players')
      const data = await res.json()
      if (data.success) {
        setPlayers(data.data.players || [])
      }
    } catch (error) {
      showMessage('error', '加载玩家列表失败')
    }
    setLoading(false)
  }

  // 加载物品列表
  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/gm/items')
      const data = await res.json()
      if (data.success) {
        setItems(data.data.items || [])
      }
    } catch (error) {
      showMessage('error', '加载物品列表失败')
    }
    setLoading(false)
  }

  // 加载资源节点
  async function loadResources() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/gm/resources')
      const data = await res.json()
      if (data.success) {
        setResources(data.data.nodes || [])
      }
    } catch (error) {
      showMessage('error', '加载资源节点失败')
    }
    setLoading(false)
  }

  // 加载日志
  async function loadLogs(type = '', limit = 50) {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/gm/logs?type=${type}&limit=${limit}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data.logs || [])
      }
    } catch (error) {
      showMessage('error', '加载日志失败')
    }
    setLoading(false)
  }

  // 加载服务器状态
  async function loadServerStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/gm/server/status')
      const data = await res.json()
      if (data.success) {
        setServerStatus(data.data)
      }
    } catch (error) {
      showMessage('error', '加载服务器状态失败')
    }
    setLoading(false)
  }

  // 修改玩家等级
  async function changeLevel(playerId: string, level: number) {
    try {
      const res = await fetch(`/api/v1/gm/players/${playerId}/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', '等级修改成功')
        loadPlayers()
      } else {
        showMessage('error', data.error)
      }
    } catch (error) {
      showMessage('error', '操作失败')
    }
  }

  // 给予物品
  async function giveItem(playerId: string, itemId: string, quantity: number) {
    try {
      const res = await fetch(`/api/v1/gm/players/${playerId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', '给予物品成功')
      } else {
        showMessage('error', data.error)
      }
    } catch (error) {
      showMessage('error', '操作失败')
    }
  }

  // 给予货币
  async function giveCurrency(playerId: string, silver: number, gold: number) {
    try {
      const res = await fetch(`/api/v1/gm/players/${playerId}/currency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ silver, gold }),
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', '给予货币成功')
        loadPlayers()
      } else {
        showMessage('error', data.error)
      }
    } catch (error) {
      showMessage('error', '操作失败')
    }
  }

  // 传送玩家
  async function teleport(playerId: string, zoneId: string, x: number, y: number) {
    try {
      const res = await fetch(`/api/v1/gm/players/${playerId}/teleport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, x, y }),
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', '传送成功')
        loadPlayers()
      } else {
        showMessage('error', data.error)
      }
    } catch (error) {
      showMessage('error', '操作失败')
    }
  }

  // 显示消息
  function showMessage(type: string, text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 切换标签页
  function handleTabChange(tab: string) {
    setActiveTab(tab)
    switch(tab) {
      case 'dashboard':
        loadDashboard()
        break
      case 'players':
        loadPlayers()
        break
      case 'items':
        loadItems()
        break
      case 'resources':
        loadResources()
        break
      case 'logs':
        loadLogs()
        break
      case 'server':
        loadServerStatus()
        break
    }
  }

  if (!visible) return null

  return (
    <div className="gm-panel-overlay" onClick={() => setVisible(false)}>
      <div className="gm-panel" onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="gm-panel-header">
          <h2>🎮 GM 管理工具</h2>
          <div className="gm-panel-actions">
            <button className="gm-btn gm-btn-close" onClick={() => setVisible(false)}>×</button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="gm-panel-tabs">
          <button 
            className={`gm-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 仪表盘
          </button>
          <button 
            className={`gm-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => handleTabChange('players')}
          >
            👥 玩家
          </button>
          <button 
            className={`gm-tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => handleTabChange('items')}
          >
            🎒 物品
          </button>
          <button 
            className={`gm-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => handleTabChange('resources')}
          >
            🌲 资源
          </button>
          <button 
            className={`gm-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => handleTabChange('logs')}
          >
            📝 日志
          </button>
          <button 
            className={`gm-tab ${activeTab === 'server' ? 'active' : ''}`}
            onClick={() => handleTabChange('server')}
          >
            🖥️ 服务器
          </button>
        </div>

        {/* 内容区 */}
        <div className="gm-panel-content">
          {loading && <div className="gm-loading">加载中...</div>}

          {/* 仪表盘 */}
          {activeTab === 'dashboard' && dashboard && (
            <div className="gm-dashboard">
              <div className="gm-stats-grid">
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{dashboard.playerCount}</div>
                  <div className="gm-stat-label">总玩家数</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{dashboard.onlineCount}</div>
                  <div className="gm-stat-label">在线玩家</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{dashboard.totalItems}</div>
                  <div className="gm-stat-label">物品总数</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{dashboard.totalOrders}</div>
                  <div className="gm-stat-label">市场订单</div>
                </div>
              </div>

              <h3>最近日志</h3>
              <div className="gm-log-list">
                {(dashboard.recentLogs || []).map((log: any) => (
                  <div key={log.id} className="gm-log-item">
                    <span className="gm-log-type">{log.type}</span>
                    <span className="gm-log-message">{log.message}</span>
                    <span className="gm-log-time">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 玩家管理 */}
          {activeTab === 'players' && (
            <div className="gm-players">
              <div className="gm-player-list">
                {players.map(player => (
                  <div key={player.id} className="gm-player-item">
                    <div className="gm-player-info">
                      <div className="gm-player-name">{player.name}</div>
                      <div className="gm-player-details">
                        Lv.{player.level} | {player.zoneId} ({Math.round(player.x)}, {Math.round(player.y)})
                      </div>
                      <div className="gm-player-currency">
                        💰 {player.silver} / 🟡 {player.gold}
                      </div>
                    </div>
                    <div className="gm-player-actions">
                      <button 
                        className="gm-btn gm-btn-small"
                        onClick={() => {
                          const level = prompt('输入新等级:', player.level.toString())
                          if (level) changeLevel(player.id, parseInt(level))
                        }}
                      >
                        改等级
                      </button>
                      <button 
                        className="gm-btn gm-btn-small"
                        onClick={() => {
                          const itemId = prompt('输入物品 ID:')
                          if (itemId) {
                            const quantity = prompt('输入数量:', '1')
                            giveItem(player.id, itemId, parseInt(quantity || '1'))
                          }
                        }}
                      >
                        给物品
                      </button>
                      <button 
                        className="gm-btn gm-btn-small"
                        onClick={() => {
                          const silver = prompt('输入银币:', '1000')
                          const gold = prompt('输入金币:', '100')
                          giveCurrency(player.id, parseInt(silver || '0'), parseInt(gold || '0'))
                        }}
                      >
                        给货币
                      </button>
                      <button 
                        className="gm-btn gm-btn-small"
                        onClick={() => {
                          const zoneId = prompt('输入区域 ID:', 'zone_1')
                          const x = prompt('输入 X:', '400')
                          const y = prompt('输入 Y:', '300')
                          if (zoneId && x && y) {
                            teleport(player.id, zoneId, parseFloat(x), parseFloat(y))
                          }
                        }}
                      >
                        传送
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 物品管理 */}
          {activeTab === 'items' && (
            <div className="gm-items">
              <div className="gm-item-list">
                {items.map(item => (
                  <div key={item.id} className="gm-item-card">
                    <div className="gm-item-name">{item.name}</div>
                    <div className="gm-item-details">
                      <span className={`gm-rarity gm-rarity-${item.rarity.toLowerCase()}`}>
                        {item.rarity}
                      </span>
                      <span>{item.type}</span>
                      <span>Lv.{item.minLevel}</span>
                      <span>💰 {item.basePrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 资源节点 */}
          {activeTab === 'resources' && (
            <div className="gm-resources">
              <div className="gm-resource-list">
                {resources.map(node => (
                  <div key={node.id} className="gm-resource-item">
                    <div className="gm-resource-name">{node.name}</div>
                    <div className="gm-resource-details">
                      <span>{node.type}</span>
                      <span>{node.zoneId}</span>
                      <span>
                        ⛏️ {node.hitsRemaining}/{node.maxHits}
                      </span>
                      <span>
                        📍 ({Math.round(node.x)}, {Math.round(node.y)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 日志查看 */}
          {activeTab === 'logs' && (
            <div className="gm-logs">
              <div className="gm-log-filters">
                <select onChange={(e) => loadLogs(e.target.value)}>
                  <option value="">全部类型</option>
                  <option value="GM_ACTION">GM 操作</option>
                  <option value="GM_BROADCAST">GM 广播</option>
                  <option value="COMBAT">战斗</option>
                  <option value="TRADE">交易</option>
                </select>
              </div>
              <div className="gm-log-list">
                {logs.map(log => (
                  <div key={log.id} className="gm-log-item">
                    <span className="gm-log-type">{log.type}</span>
                    <span className="gm-log-message">{log.message}</span>
                    <span className="gm-log-time">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 服务器状态 */}
          {activeTab === 'server' && serverStatus && (
            <div className="gm-server-status">
              <div className="gm-stats-grid">
                <div className="gm-stat-card">
                  <div className="gm-stat-value">
                    {Math.floor(serverStatus.uptime / 3600)}:
                    {Math.floor((serverStatus.uptime % 3600) / 60).toString().padStart(2, '0')}
                  </div>
                  <div className="gm-stat-label">运行时间 (时：分)</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{serverStatus.memoryUsage.rss} MB</div>
                  <div className="gm-stat-label">内存使用</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{serverStatus.platform}</div>
                  <div className="gm-stat-label">操作系统</div>
                </div>
                <div className="gm-stat-card">
                  <div className="gm-stat-value">{serverStatus.nodeVersion}</div>
                  <div className="gm-stat-label">Node.js 版本</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`gm-message gm-message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* 快捷键提示 */}
        <div className="gm-shortcut-hint">
          Ctrl+G 打开/关闭
        </div>
      </div>
    </div>
  )
}
