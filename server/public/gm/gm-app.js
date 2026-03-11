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
    case 'social':
      // 社交管理面板
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

// ==================== 社交管理功能 ====================

// 加载社交信息
async function loadSocialInfo() {
  const playerId = document.getElementById('socialPlayerId').value
  if (!playerId) {
    alert('请输入玩家 ID')
    return
  }

  try {
    // 加载好友
    const friendsRes = await fetch(`/api/v1/gm/players/${playerId}/friends`)
    const friendsData = await friendsRes.json()
    
    if (friendsData.success) {
      const friends = friendsData.data.friends || []
      const friendsHtml = friends.map(f => {
        const friendInfo = f.characterId === playerId ? f.friend : f.character
        return `
          <tr>
            <td>${friendInfo.name}</td>
            <td>${friendInfo.level}</td>
            <td class="${friendInfo.isOnline ? 'status-online' : 'status-offline'}">
              ${friendInfo.isOnline ? '在线' : '离线'}
            </td>
            <td>${f.status}</td>
          </tr>
        `
      }).join('')
      
      document.getElementById('friendsTable').innerHTML = friendsHtml || '<tr><td colspan="4">暂无好友</td></tr>'
    }

    // 加载队伍
    const partyRes = await fetch(`/api/v1/gm/players/${playerId}/party`)
    const partyData = await partyRes.json()
    
    const partyDiv = document.getElementById('partyInfo')
    if (partyData.success && partyData.data.party) {
      const party = partyData.data.party
      const membersHtml = party.members.map(m => `
        <div style="padding: 8px; background: rgba(255,255,255,0.05); margin-bottom: 5px; border-radius: 4px;">
          <strong>${m.role === 'Leader' ? '👑' : ''}${m.character.name}</strong>
          Lv.${m.character.level} 
          <span class="${m.character.isOnline ? 'status-online' : 'status-offline'}">
            ${m.character.isOnline ? '在线' : '离线'}
          </span>
          - ${m.character.zoneId}
        </div>
      `).join('')
      
      partyDiv.innerHTML = `
        <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 6px; margin-bottom: 10px;">
          <strong>队伍：${party.name || '未命名'}</strong> (${party.members.length}/${party.maxMembers}人)
        </div>
        ${membersHtml}
      `
    } else {
      partyDiv.innerHTML = '<div class="loading">未加入队伍</div>'
    }

    document.getElementById('socialInfo').style.display = 'block'
  } catch (error) {
    console.error('加载社交信息失败:', error)
    alert('加载失败：' + error.message)
  }
}

// 加载聊天记录
async function loadChatHistory() {
  const type = document.getElementById('chatType').value
  const query = type ? `?type=${type}` : ''
  
  try {
    const res = await fetch(`/api/v1/gm/chat/history${query}`)
    const data = await res.json()
    
    if (data.success) {
      const messages = data.data.messages || []
      const html = messages.map(msg => `
        <tr>
          <td>${msg.sender.name} (Lv.${msg.sender.level})</td>
          <td>${msg.type}</td>
          <td>${msg.content}</td>
          <td>${new Date(msg.createdAt).toLocaleString('zh-CN')}</td>
          <td>
            <button class="btn btn-danger" onclick="deleteChatMessage('${msg.id}')">删除</button>
          </td>
        </tr>
      `).join('')
      
      document.getElementById('chatTable').innerHTML = html || '<tr><td colspan="5">暂无聊天记录</td></tr>'
    }
  } catch (error) {
    console.error('加载聊天记录失败:', error)
  }
}

// 删除聊天消息
async function deleteChatMessage(messageId) {
  if (!confirm('确定删除这条消息吗？')) return
  
  try {
    const res = await fetch(`/api/v1/gm/chat/${messageId}`, { method: 'DELETE' })
    const data = await res.json()
    
    if (data.success) {
      alert('消息已删除')
      loadChatHistory()
    } else {
      alert('删除失败：' + data.error)
    }
  } catch (error) {
    console.error('删除消息失败:', error)
    alert('删除失败：' + error.message)
  }
}

// 给予大喇叭
async function giveWorldHorn() {
  const playerId = document.getElementById('giveHornPlayerId').value
  const quantity = parseInt(document.getElementById('giveHornQuantity').value)
  
  if (!playerId) {
    alert('请输入玩家 ID')
    return
  }
  
  try {
    const res = await fetch(`/api/v1/gm/players/${playerId}/give-horn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    const data = await res.json()
    
    if (data.success) {
      alert(data.message)
    } else {
      alert('给予失败：' + data.error)
    }
  } catch (error) {
    console.error('给予大喇叭失败:', error)
    alert('给予失败：' + error.message)
  }
}

// 加载大喇叭统计
async function loadHornStats() {
  try {
    const res = await fetch(`/api/v1/gm/items/world-horn/stats`)
    const data = await res.json()
    
    if (data.success) {
      const { totalHorns, playerCount, distribution } = data.data
      const distHtml = distribution.slice(0, 20).map(d => `
        <div style="padding: 5px 0; border-bottom: 1px solid #333;">
          <span>${d.characterId}</span>: <strong>${d.quantity}</strong> 个
        </div>
      `).join('')
      
      document.getElementById('hornStats').innerHTML = `
        <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 6px; margin-bottom: 10px;">
          <strong>全服大喇叭统计</strong><br>
          拥有玩家数：${playerCount} 人<br>
          总数量：${totalHorns} 个
        </div>
        <div style="max-height: 300px; overflow-y: auto;">
          ${distHtml || '<div class="loading">暂无数据</div>'}
        </div>
      `
    }
  } catch (error) {
    console.error('加载大喇叭统计失败:', error)
  }
}

// 初始化
loadDashboard()
