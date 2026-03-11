// GM 工具前端逻辑
const API_BASE = '/api/v1/gm'

// 导航切换
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    // 移除所有激活状态
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    
    // 激活当前
    item.classList.add('active')
    const panelId = item.dataset.panel
    document.getElementById(panelId).classList.add('active')
    
    // 加载对应数据
    loadPanelData(panelId)
  })
})

// 加载面板数据
function loadPanelData(panelId) {
  switch(panelId) {
    case 'dashboard':
      loadDashboard()
      break
    case 'players':
      loadPlayers()
      break
    case 'items':
      loadItems()
      break
    case 'market':
      loadMarket()
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

// 加载仪表盘
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`)
    const data = await res.json()
    
    if (data.success) {
      const { playerCount, onlineCount, totalItems, totalOrders } = data.data
      
      document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${playerCount}</div>
          <div class="stat-label">总玩家数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${onlineCount}</div>
          <div class="stat-label">在线玩家</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalItems}</div>
          <div class="stat-label">物品总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalOrders}</div>
          <div class="stat-label">市场订单</div>
        </div>
      `
      
      // 最近日志
      const logs = data.data.recentLogs || []
      const logsHtml = logs.map(log => `
        <tr>
          <td>${log.type}</td>
          <td>${log.message}</td>
          <td>${new Date(log.createdAt).toLocaleString('zh-CN')}</td>
        </tr>
      `).join('')
      
      document.getElementById('recentLogs').innerHTML = logsHtml || '<tr><td colspan="3">暂无日志</td></tr>'
    }
  } catch (error) {
    console.error('加载仪表盘失败:', error)
  }
}

// 加载玩家列表
async function loadPlayers() {
  try {
    const res = await fetch(`${API_BASE}/players`)
    const data = await res.json()
    
    if (data.success) {
      const players = data.data.players || []
      const html = players.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.level}</td>
          <td>${p.zoneId} (${Math.round(p.x)}, ${Math.round(p.y)})</td>
          <td class="${p.isOnline ? 'status-online' : 'status-offline'}">
            ${p.isOnline ? '在线' : '离线'}
          </td>
          <td>💰 ${p.silver} / 🟡 ${p.gold}</td>
          <td>
            <button class="btn btn-gold" onclick="showPlayerActions('${p.id}')">操作</button>
          </td>
        </tr>
      `).join('')
      
      document.getElementById('playersTable').innerHTML = html || '<tr><td colspan="6">暂无玩家</td></tr>'
    }
  } catch (error) {
    console.error('加载玩家列表失败:', error)
  }
}

// 显示玩家操作菜单
function showPlayerActions(playerId) {
  const actions = prompt(`玩家 ${playerId} 操作:\n1. 修改等级\n2. 给予物品\n3. 给予货币\n4. 传送\n5. 重置背包\n6. 删除玩家\n\n输入选项 (1-6):`)
  
  switch(actions) {
    case '1':
      changeLevel(playerId)
      break
    case '2':
      giveItem(playerId)
      break
    case '3':
      giveCurrency(playerId)
      break
    case '4':
      teleport(playerId)
      break
    case '5':
      resetInventory(playerId)
      break
    case '6':
      deletePlayer(playerId)
      break
  }
}

// 修改等级
async function changeLevel(playerId) {
  const level = prompt('输入新等级 (1-100):')
  if (!level) return
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}/level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: parseInt(level) }),
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`等级修改成功！`)
      loadPlayers()
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 给予物品
async function giveItem(playerId) {
  const itemId = prompt('输入物品 ID:')
  if (!itemId) return
  
  const quantity = prompt('输入数量:', '1')
  if (!quantity) return
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity: parseInt(quantity) }),
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`给予物品成功！`)
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 给予货币
async function giveCurrency(playerId) {
  const silver = prompt('输入银币数量:', '1000')
  const gold = prompt('输入金币数量:', '100')
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}/currency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        silver: parseInt(silver || 0), 
        gold: parseInt(gold || 0) 
      }),
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`给予货币成功！`)
      loadPlayers()
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 传送玩家
async function teleport(playerId) {
  const zoneId = prompt('输入区域 ID (如 zone_1):', 'zone_1')
  const x = prompt('输入 X 坐标:', '400')
  const y = prompt('输入 Y 坐标:', '300')
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}/teleport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        zoneId, 
        x: parseFloat(x), 
        y: parseFloat(y) 
      }),
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`传送成功！`)
      loadPlayers()
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 重置背包
async function resetInventory(playerId) {
  if (!confirm('确定要重置该玩家的背包吗？所有物品将丢失！')) return
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}/inventory/reset`, {
      method: 'POST',
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`背包重置成功！`)
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 删除玩家
async function deletePlayer(playerId) {
  if (!confirm('确定要删除该玩家吗？此操作不可逆！')) return
  
  try {
    const res = await fetch(`${API_BASE}/players/${playerId}`, {
      method: 'DELETE',
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`玩家删除成功！`)
      loadPlayers()
    } else {
      alert(`失败：${data.error}`)
    }
  } catch (error) {
    alert('操作失败：' + error.message)
  }
}

// 加载物品列表
async function loadItems() {
  try {
    const res = await fetch(`${API_BASE}/items`)
    const data = await res.json()
    
    if (data.success) {
      const items = data.data.items || []
      const html = items.map(item => `
        <tr>
          <td>${item.id.substr(0, 8)}...</td>
          <td>${item.name}</td>
          <td>${item.type}</td>
          <td>${item.rarity}</td>
          <td>${item.minLevel}</td>
          <td>${item.basePrice}</td>
        </tr>
      `).join('')
      
      document.getElementById('itemsTable').innerHTML = html || '<tr><td colspan="6">暂无物品</td></tr>'
    }
  } catch (error) {
    console.error('加载物品列表失败:', error)
  }
}

// 加载市场订单
async function loadMarket() {
  try {
    const res = await fetch(`${API_BASE}/market`)
    const data = await res.json()
    
    if (data.success) {
      const orders = data.data.orders || []
      const html = orders.map(order => `
        <tr>
          <td>${order.item?.name || order.itemId}</td>
          <td>${order.quantity}</td>
          <td>${order.unitPrice}</td>
          <td>${order.quantity * order.unitPrice}</td>
          <td>${order.status}</td>
          <td>${new Date(order.createdAt).toLocaleString('zh-CN')}</td>
        </tr>
      `).join('')
      
      document.getElementById('marketTable').innerHTML = html || '<tr><td colspan="6">暂无订单</td></tr>'
    }
  } catch (error) {
    console.error('加载市场订单失败:', error)
  }
}

// 加载资源节点
async function loadResources() {
  try {
    const res = await fetch(`${API_BASE}/resources`)
    const data = await res.json()
    
    if (data.success) {
      const nodes = data.data.nodes || []
      const html = nodes.map(node => `
        <tr>
          <td>${node.name}</td>
          <td>${node.type}</td>
          <td>${node.zoneId}</td>
          <td>${node.hitsRemaining}/${node.maxHits}</td>
          <td>(${Math.round(node.x)}, ${Math.round(node.y)})</td>
        </tr>
      `).join('')
      
      document.getElementById('resourcesTable').innerHTML = html || '<tr><td colspan="5">暂无资源节点</td></tr>'
    }
  } catch (error) {
    console.error('加载资源节点失败:', error)
  }
}

// 加载日志
async function loadLogs() {
  const type = document.getElementById('logType').value
  const limit = document.getElementById('logLimit').value
  
  try {
    const res = await fetch(`${API_BASE}/logs?type=${type}&limit=${limit}`)
    const data = await res.json()
    
    if (data.success) {
      const logs = data.data.logs || []
      const html = logs.map(log => `
        <tr>
          <td>${log.type}</td>
          <td>${log.message}</td>
          <td>${new Date(log.createdAt).toLocaleString('zh-CN')}</td>
        </tr>
      `).join('')
      
      document.getElementById('logsTable').innerHTML = html || '<tr><td colspan="3">暂无日志</td></tr>'
    }
  } catch (error) {
    console.error('加载日志失败:', error)
  }
}

// 加载服务器状态
async function loadServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/server/status`)
    const data = await res.json()
    
    if (data.success) {
      const { uptime, memoryUsage, platform, nodeVersion } = data.data
      
      const hours = Math.floor(uptime / 3600)
      const minutes = Math.floor((uptime % 3600) / 60)
      const seconds = uptime % 60
      
      document.getElementById('serverStatus').innerHTML = `
        <div class="stat-card" style="margin-bottom: 20px;">
          <div class="stat-value">${hours}:${minutes.toString().padStart(2, '0')}:</div>
          <div class="stat-label">运行时间 (时：分：秒)</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${memoryUsage.rss} MB</div>
            <div class="stat-label">内存使用 (RSS)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${memoryUsage.heapUsed} MB</div>
            <div class="stat-label">堆内存使用</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${platform}</div>
            <div class="stat-label">操作系统</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${nodeVersion}</div>
            <div class="stat-label">Node.js 版本</div>
          </div>
        </div>
      `
    }
  } catch (error) {
    console.error('加载服务器状态失败:', error)
  }
}

// 初始化
loadDashboard()
