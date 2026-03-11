#!/usr/bin/env node

/**
 * 社交系统快速测试脚本
 * 测试核心功能
 */

// Node.js 18 需要导入 fetch
const { fetch } = require('undici')

const API_BASE = 'http://localhost:3002/api/v1'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const data = await response.json()
    return { ok: response.ok, status: response.status, data }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

async function main() {
  log(colors.blue, '\n========================================')
  log(colors.blue, '🧪 社交系统快速测试')
  log(colors.blue, '========================================\n')

  let passed = 0
  let failed = 0

  // 测试 1: 健康检查
  log(colors.cyan, '测试 1: 服务端健康检查')
  const health = await request('http://localhost:3002/health')
  if (health.ok) {
    log(colors.green, '✅ 服务端正常运行')
    passed++
  } else {
    log(colors.red, `❌ 服务端不可用：${health.error}`)
    failed++
    log(colors.yellow, '提示：请确保服务端已启动 (npm run dev)')
    process.exit(1)
  }

  // 测试 2: 登录测试账号
  log(colors.cyan, '\n测试 2: 登录测试账号')
  const loginRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test1@example.com',
      password: 'password123',
    }),
  })

  if (loginRes.ok && loginRes.data.token) {
    log(colors.green, '✅ 登录成功')
    const token = loginRes.data.token
    const charId = loginRes.data.character.id
    log(colors.yellow, `   角色 ID: ${charId}`)
    log(colors.yellow, `   角色名：${loginRes.data.character.name}`)
    passed++

    // 测试 3: 获取好友列表
    log(colors.cyan, '\n测试 3: 获取好友列表')
    const friendsRes = await request(`${API_BASE}/social/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (friendsRes.ok) {
      log(colors.green, '✅ 获取好友列表成功')
      log(colors.yellow, `   好友数量：${friendsRes.data.friends?.length || 0}`)
      passed++
    } else {
      log(colors.red, `❌ 获取好友列表失败：${friendsRes.data.error}`)
      failed++
    }

    // 测试 4: 发送区域聊天
    log(colors.cyan, '\n测试 4: 发送区域聊天消息')
    const chatRes = await request(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: 'zone',
        content: '测试聊天消息 ' + new Date().toLocaleTimeString(),
        zoneId: 'zone_1',
      }),
    })
    if (chatRes.ok) {
      log(colors.green, '✅ 发送聊天消息成功')
      passed++
    } else {
      log(colors.red, `❌ 发送聊天消息失败：${chatRes.data.error}`)
      failed++
    }

    // 测试 5: 发送世界聊天（使用大喇叭）
    log(colors.cyan, '\n测试 5: 发送世界聊天消息')
    const globalChatRes = await request(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: 'global',
        content: '测试世界聊天 ' + new Date().toLocaleTimeString(),
      }),
    })
    if (globalChatRes.ok) {
      log(colors.green, '✅ 发送世界聊天成功')
      passed++
    } else {
      log(colors.red, `❌ 发送世界聊天失败：${globalChatRes.data.error}`)
      failed++
    }

    // 测试 6: 获取聊天历史
    log(colors.cyan, '\n测试 6: 获取聊天历史')
    const historyRes = await request(`${API_BASE}/chat/history?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (historyRes.ok) {
      log(colors.green, '✅ 获取聊天历史成功')
      log(colors.yellow, `   消息数量：${historyRes.data.messages?.length || 0}`)
      passed++
    } else {
      log(colors.red, `❌ 获取聊天历史失败：${historyRes.data.error}`)
      failed++
    }

    // 测试 7: 创建队伍
    log(colors.cyan, '\n测试 7: 创建队伍')
    const partyRes = await request(`${API_BASE}/social/party/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: '测试队伍' }),
    })
    if (partyRes.ok) {
      log(colors.green, '✅ 创建队伍成功')
      const partyId = partyRes.data.party.id
      log(colors.yellow, `   队伍 ID: ${partyId}`)
      passed++

      // 测试 8: 获取队伍信息
      log(colors.cyan, '\n测试 8: 获取队伍信息')
      const partyInfoRes = await request(`${API_BASE}/social/party/${partyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (partyInfoRes.ok) {
        log(colors.green, '✅ 获取队伍信息成功')
        log(colors.yellow, `   成员数量：${partyInfoRes.data.party.members?.length || 0}`)
        passed++
      } else {
        log(colors.red, `❌ 获取队伍信息失败：${partyInfoRes.data.error}`)
        failed++
      }

      // 测试 9: 离开队伍
      log(colors.cyan, '\n测试 9: 离开队伍')
      const leaveRes = await request(`${API_BASE}/social/party/${partyId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (leaveRes.ok) {
        log(colors.green, '✅ 离开队伍成功')
        passed++
      } else {
        log(colors.red, `❌ 离开队伍失败：${leaveRes.data.error}`)
        failed++
      }
    } else {
      log(colors.red, `❌ 创建队伍失败：${partyRes.data.error}`)
      failed++
    }

    // 测试 10: GM 工具 - 查询玩家好友
    log(colors.cyan, '\n测试 10: GM 工具 - 查询玩家好友')
    const gmFriendsRes = await request(`${API_BASE}/gm/players/${charId}/friends`)
    if (gmFriendsRes.ok) {
      log(colors.green, '✅ GM 查询好友成功')
      log(colors.yellow, `   好友数量：${gmFriendsRes.data.friends?.length || 0}`)
      passed++
    } else {
      log(colors.red, `❌ GM 查询好友失败：${gmFriendsRes.data.error}`)
      failed++
    }

    // 测试 11: GM 工具 - 查询聊天记录
    log(colors.cyan, '\n测试 11: GM 工具 - 查询聊天记录')
    const gmChatRes = await request(`${API_BASE}/gm/chat/history?limit=5`)
    if (gmChatRes.ok) {
      log(colors.green, '✅ GM 查询聊天成功')
      log(colors.yellow, `   消息数量：${gmChatRes.data.messages?.length || 0}`)
      passed++
    } else {
      log(colors.red, `❌ GM 查询聊天失败：${gmChatRes.data.error}`)
      failed++
    }

    // 测试 12: 检查大喇叭数量
    log(colors.cyan, '\n测试 12: 检查大喇叭数量')
    const inventoryRes = await request(`${API_BASE}/character/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (inventoryRes.ok) {
      const horns = inventoryRes.data.inventory?.find(i => i.item.name === '大喇叭')
      if (horns) {
        log(colors.green, `✅ 大喇叭数量：${horns.quantity}个`)
        passed++
      } else {
        log(colors.yellow, '⚠️  未找到大喇叭')
        passed++
      }
    } else {
      log(colors.red, `❌ 获取背包失败：${inventoryRes.data.error}`)
      failed++
    }

  } else {
    log(colors.red, `❌ 登录失败：${loginRes.data.error}`)
    failed++
    log(colors.yellow, '提示：请确保测试数据已准备 (node scripts/prepare-test-data.js)')
  }

  // 输出结果
  log(colors.blue, '\n========================================')
  log(colors.blue, '📊 测试结果')
  log(colors.blue, '========================================')
  log(colors.green, `✅ 通过：${passed}`)
  log(colors.red, `❌ 失败：${failed}`)
  log(colors.blue, `📝 总计：${passed + failed}`)
  
  if (passed + failed > 0) {
    const passRate = ((passed / (passed + failed)) * 100).toFixed(2)
    log(colors.yellow, `📈 通过率：${passRate}%`)
  }
  log(colors.blue, '========================================\n')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
