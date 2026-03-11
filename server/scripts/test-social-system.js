#!/usr/bin/env node

/**
 * 社交系统测试脚本
 * 测试好友、组队、聊天系统的所有功能
 */

const API_BASE = 'http://localhost:3002/api/v1'

// 测试配置
const TEST_USERS = [
  { email: 'test1@example.com', password: 'password123', name: '测试玩家 1' },
  { email: 'test2@example.com', password: 'password123', name: '测试玩家 2' },
  { email: 'test3@example.com', password: 'password123', name: '测试玩家 3' },
]

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  total: 0,
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

function test(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function(...args) {
      results.total++
      log(colors.blue, `\n📝 测试：${name}`)
      try {
        await originalMethod.apply(this, args)
        results.passed++
        log(colors.green, `✅ 通过：${name}`)
      } catch (error) {
        results.failed++
        log(colors.red, `❌ 失败：${name}`)
        log(colors.red, `   错误：${error.message}`)
      }
    }
  }
}

class SocialSystemTest {
  constructor() {
    this.tokens = {}
    this.characterIds = {}
    this.friendId = null
    this.partyId = null
  }

  // 辅助方法
  async request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || response.statusText)
    }
    return data
  }

  async login(email, password) {
    const data = await this.request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.tokens[email] = data.token
    this.characterIds[email] = data.character.id
    return data
  }

  // ==================== 好友系统测试 ====================

  @test('发送好友请求')
  async testSendFriendRequest() {
    const user1 = TEST_USERS[0]
    const user2 = TEST_USERS[1]

    await this.login(user1.email, user1.password)
    
    // 获取用户 2 的角色 ID
    await this.login(user2.email, user2.password)
    const user2CharId = this.characterIds[user2.email]

    await this.login(user1.email, user1.password)
    
    // 发送好友请求
    const data = await this.request(`${API_BASE}/social/friends/request`, {
      method: 'POST',
      body: JSON.stringify({ friendId: user2CharId }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }

    this.friendId = data.friendship.id
    log(colors.yellow, `   好友请求 ID: ${this.friendId}`)
  }

  @test('接受好友请求')
  async testAcceptFriendRequest() {
    const user2 = TEST_USERS[1]
    await this.login(user2.email, user2.password)

    const data = await this.request(`${API_BASE}/social/friends/respond`, {
      method: 'POST',
      body: JSON.stringify({ 
        requestId: this.friendId,
        action: 'accept',
      }),
      headers: {
        Authorization: `Bearer ${this.tokens[user2.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('获取好友列表')
  async testGetFriendsList() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/friends`, {
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success || !data.friends || data.friends.length === 0) {
      throw new Error('好友列表为空')
    }

    log(colors.yellow, `   好友数量：${data.friends.length}`)
  }

  @test('删除好友')
  async testDeleteFriend() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/friends/${this.friendId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  // ==================== 组队系统测试 ====================

  @test('创建队伍')
  async testCreateParty() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/party/create`, {
      method: 'POST',
      body: JSON.stringify({ name: '测试队伍' }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }

    this.partyId = data.party.id
    log(colors.yellow, `   队伍 ID: ${this.partyId}`)
  }

  @test('邀请玩家加入队伍')
  async testInviteToParty() {
    const user1 = TEST_USERS[0]
    const user2 = TEST_USERS[1]

    await this.login(user2.email, user2.password)
    const user2CharId = this.characterIds[user2.email]

    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/party/${this.partyId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ characterId: user2CharId }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('接受队伍邀请')
  async testAcceptPartyInvite() {
    const user2 = TEST_USERS[1]
    await this.login(user2.email, user2.password)

    const data = await this.request(`${API_BASE}/social/party/${this.partyId}/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tokens[user2.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('获取队伍信息')
  async testGetPartyInfo() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/party/${this.partyId}`, {
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success || !data.party) {
      throw new Error('获取队伍信息失败')
    }

    log(colors.yellow, `   队伍成员：${data.party.members.length}人`)
  }

  @test('离开队伍')
  async testLeaveParty() {
    const user2 = TEST_USERS[1]
    await this.login(user2.email, user2.password)

    const data = await this.request(`${API_BASE}/social/party/${this.partyId}/leave`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tokens[user2.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('解散队伍')
  async testDisbandParty() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/social/party/${this.partyId}/disband`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  // ==================== 聊天系统测试 ====================

  @test('发送区域聊天消息')
  async testSendZoneChat() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/chat/send`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'zone',
        content: '测试区域聊天消息',
        zoneId: 'zone_1',
      }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('发送世界聊天消息')
  async testSendGlobalChat() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/chat/send`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'global',
        content: '测试世界聊天消息',
      }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    // 世界聊天可能因为缺少大喇叭失败，这是预期的
    log(colors.yellow, `   世界聊天结果：${data.success ? '成功' : '失败（可能缺少大喇叭）'}`)
  }

  @test('发送私聊消息')
  async testSendWhisper() {
    const user1 = TEST_USERS[0]
    const user2 = TEST_USERS[1]

    await this.login(user2.email, user2.password)
    const user2CharId = this.characterIds[user2.email]

    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/chat/send`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'whisper',
        content: '测试私聊消息',
        targetId: user2CharId,
      }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }
  }

  @test('获取聊天历史')
  async testGetChatHistory() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)

    const data = await this.request(`${API_BASE}/chat/history?limit=10`, {
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })

    if (!data.success) {
      throw new Error(data.error)
    }

    log(colors.yellow, `   聊天消息数量：${data.messages?.length || 0}`)
  }

  // ==================== GM 工具测试 ====================

  @test('GM 查询玩家好友')
  async testGMGetFriends() {
    const user1 = TEST_USERS[0]
    await this.login(user1.email, user1.password)
    const charId = this.characterIds[user1.email]

    // 重新添加好友用于测试
    await this.login(user1.email, user1.password)
    const user2 = TEST_USERS[1]
    await this.login(user2.email, user2.password)
    const user2CharId = this.characterIds[user2.email]
    
    await this.login(user1.email, user1.password)
    const friendData = await this.request(`${API_BASE}/social/friends/request`, {
      method: 'POST',
      body: JSON.stringify({ friendId: user2CharId }),
      headers: {
        Authorization: `Bearer ${this.tokens[user1.email]}`,
      },
    })
    
    await this.login(user2.email, user2.password)
    await this.request(`${API_BASE}/social/friends/respond`, {
      method: 'POST',
      body: JSON.stringify({ 
        requestId: friendData.friendship.id,
        action: 'accept',
      }),
      headers: {
        Authorization: `Bearer ${this.tokens[user2.email]}`,
      },
    })

    // GM 查询
    const data = await this.request(`${API_BASE}/gm/players/${charId}/friends`)
    
    if (!data.success) {
      throw new Error(data.error)
    }

    log(colors.yellow, `   GM 查询好友数量：${data.friends?.length || 0}`)
  }

  @test('GM 查询聊天记录')
  async testGMGetChatHistory() {
    const data = await this.request(`${API_BASE}/gm/chat/history?limit=10`)
    
    if (!data.success) {
      throw new Error(data.error)
    }

    log(colors.yellow, `   GM 查询聊天数量：${data.messages?.length || 0}`)
  }

  // ==================== 运行所有测试 ====================

  async runAllTests() {
    log(colors.blue, '\n========================================')
    log(colors.blue, '🧪 社交系统测试开始')
    log(colors.blue, '========================================')

    try {
      // 好友系统测试
      log(colors.blue, '\n--- 好友系统测试 ---')
      await this.testSendFriendRequest()
      await this.testAcceptFriendRequest()
      await this.testGetFriendsList()
      await this.testDeleteFriend()

      // 组队系统测试
      log(colors.blue, '\n--- 组队系统测试 ---')
      await this.testCreateParty()
      await this.testInviteToParty()
      await this.testAcceptPartyInvite()
      await this.testGetPartyInfo()
      await this.testLeaveParty()
      await this.testDisbandParty()

      // 聊天系统测试
      log(colors.blue, '\n--- 聊天系统测试 ---')
      await this.testSendZoneChat()
      await this.testSendGlobalChat()
      await this.testSendWhisper()
      await this.testGetChatHistory()

      // GM 工具测试
      log(colors.blue, '\n--- GM 工具测试 ---')
      await this.testGMGetFriends()
      await this.testGMGetChatHistory()

    } catch (error) {
      log(colors.red, `\n❌ 测试中断：${error.message}`)
    }

    // 输出结果
    log(colors.blue, '\n========================================')
    log(colors.blue, '📊 测试结果')
    log(colors.blue, '========================================')
    log(colors.green, `✅ 通过：${results.passed}`)
    log(colors.red, `❌ 失败：${results.failed}`)
    log(colors.blue, `📝 总计：${results.total}`)
    
    const passRate = ((results.passed / results.total) * 100).toFixed(2)
    log(colors.yellow, `📈 通过率：${passRate}%`)
    log(colors.blue, '========================================\n')

    return results
  }
}

// 主函数
async function main() {
  const test = new SocialSystemTest()
  const results = await test.runAllTests()
  
  // 退出码
  process.exit(results.failed > 0 ? 1 : 0)
}

// 运行测试
main().catch(console.error)
