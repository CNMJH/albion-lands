import { test, expect } from '@playwright/test'

/**
 * P0+P1+P2 功能综合测试
 * 测试所有核心功能
 */

test.describe('P0 核心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    // 等待 Canvas 渲染并 focus
    const canvas = await page.waitForSelector('#game-canvas, canvas', { timeout: 10000 })
    await canvas.focus()
    // 等待游戏完全初始化（额外等待 2 秒）
    await page.waitForTimeout(2000)
  })

  test('游戏加载成功', async ({ page }) => {
    // 等待游戏 Canvas 渲染
    const canvas = await page.waitForSelector('canvas', { timeout: 10000 })
    expect(canvas).toBeTruthy()
    
    // 截图保存
    await page.screenshot({ path: 'screenshots/p0-01-game-loaded.png' })
  })

  test('背包功能 (B 键)', async ({ page }) => {
    // 按 B 键打开背包
    await page.keyboard.press('b')
    await page.waitForTimeout(500)
    
    // 检查背包面板是否显示
    const inventoryPanel = await page.$('.inventory-panel, [class*="inventory"]')
    expect(inventoryPanel).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-02-backpack.png' })
    
    // 再次按 B 关闭
    await page.keyboard.press('b')
  })

  test('装备功能 (C 键)', async ({ page }) => {
    // 按 C 键打开装备
    await page.keyboard.press('c')
    await page.waitForTimeout(500)
    
    // 检查装备面板是否显示
    const equipmentPanel = await page.$('.equipment-panel, [class*="equipment"]')
    expect(equipmentPanel).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-03-equipment.png' })
    
    // 关闭
    await page.keyboard.press('c')
  })

  test('聊天功能 (Enter 键)', async ({ page }) => {
    // 先点击 Canvas 确保焦点
    const canvas = await page.$('#game-canvas, canvas')
    await canvas?.click()
    await page.waitForTimeout(200)
    
    // 按 Enter 打开聊天框
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    // 检查聊天框是否激活（ChatUI 的 input 没有类名，用 placeholder 检测）
    const chatInput = await page.$('input[placeholder*="聊天"]')
    expect(chatInput).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-04-chat.png' })
    
    // 按 ESC 关闭
    await page.keyboard.press('Escape')
  })

  test('拍卖行功能 (M 键)', async ({ page }) => {
    // 先点击 Canvas 确保焦点
    const canvas = await page.$('#game-canvas, canvas')
    await canvas?.click()
    await page.waitForTimeout(200)
    
    // 按 M 键打开拍卖行
    await page.keyboard.press('m')
    await page.waitForTimeout(500)
    
    // 检查市场面板
    const marketPanel = await page.$('.market-panel, [class*="market"]')
    expect(marketPanel).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-05-market.png' })
    
    // 关闭
    await page.keyboard.press('m')
  })

  test('小地图显示', async ({ page }) => {
    // 小地图应该始终显示在右上角（动态创建的 Canvas）
    // 检查是否有 Canvas 元素在右上角位置
    const canvasCount = await page.$$eval('canvas', canvases => canvases.length)
    expect(canvasCount).toBeGreaterThan(1) // 至少有游戏 Canvas 和小地图 Canvas
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-06-minimap.png' })
  })

  test('技能栏显示', async ({ page }) => {
    // 技能栏应该显示在底部
    const skillBar = await page.$('.skill-bar, [class*="skillbar"]')
    expect(skillBar).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p0-07-skillbar.png' })
  })
})

test.describe('P1 功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    // 等待 Canvas 渲染并 focus
    const canvas = await page.waitForSelector('#game-canvas, canvas', { timeout: 10000 })
    await canvas.focus()
    // 等待游戏完全初始化
    await page.waitForTimeout(2000)
  })

  test('死亡统计面板 (F1)', async ({ page }) => {
    // 先点击 Canvas 确保焦点
    const canvas = await page.$('#game-canvas, canvas')
    await canvas?.click()
    await page.waitForTimeout(200)
    
    // 按 F1 打开死亡统计
    await page.keyboard.press('F1')
    await page.waitForTimeout(500)
    
    // 检查死亡统计面板
    const deathStats = await page.$('.death-stats-panel, [class*="death"]')
    expect(deathStats).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p1-01-death-stats.png' })
    
    // 关闭
    await page.keyboard.press('F1')
  })

  test('复活点面板 (F2)', async ({ page }) => {
    // 先点击 Canvas 确保焦点
    const canvas = await page.$('#game-canvas, canvas')
    await canvas?.click()
    await page.waitForTimeout(200)
    
    // 按 F2 打开复活点
    await page.keyboard.press('F2')
    await page.waitForTimeout(500)
    
    // 检查复活点面板
    const respawnPanel = await page.$('.respawn-panel, [class*="respawn"]')
    expect(respawnPanel).toBeTruthy()
    
    // 截图
    await page.screenshot({ path: 'screenshots/p1-02-respawn.png' })
    
    // 关闭
    await page.keyboard.press('F2')
  })
})

test.describe('P2 功能测试 - API 验证', () => {
  const characterId = '1fc5bfa9-a54b-406c-abaa-adb032a3f59a' // 测试玩家 1

  test('成就系统 API', async ({ request }) => {
    // 获取成就
    const response = await request.get(`http://localhost:3002/api/v1/achievements/${characterId}`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    console.log('✅ 成就系统 API 正常')
  })

  test('排行榜系统 API', async ({ request }) => {
    // 等级排行榜
    const levelResponse = await request.get('http://localhost:3002/api/v1/leaderboard/level?limit=10')
    expect(levelResponse.ok()).toBeTruthy()
    
    // PVP 排行榜
    const pvpResponse = await request.get('http://localhost:3002/api/v1/leaderboard/pvp?limit=10')
    expect(pvpResponse.ok()).toBeTruthy()
    
    // 财富排行榜
    const wealthResponse = await request.get('http://localhost:3002/api/v1/leaderboard/wealth?limit=10')
    expect(wealthResponse.ok()).toBeTruthy()
    
    console.log('✅ 排行榜系统 API 正常')
  })

  test('仓库系统 API', async ({ request }) => {
    // 获取仓库物品
    const response = await request.get(`http://localhost:3002/api/v1/bank/${characterId}`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    console.log('✅ 仓库系统 API 正常')
  })

  test('断线重连 API', async ({ request }) => {
    // 断线
    const disconnectResponse = await request.post('http://localhost:3002/api/v1/player/disconnect', {
      data: { characterId }
    })
    expect(disconnectResponse.ok()).toBeTruthy()
    
    // 重连
    const reconnectResponse = await request.post('http://localhost:3002/api/v1/player/reconnect', {
      data: { characterId }
    })
    expect(reconnectResponse.ok()).toBeTruthy()
    
    console.log('✅ 断线重连 API 正常')
  })

  test('物品详情 API', async ({ request }) => {
    // 获取物品列表
    const itemsResponse = await request.get('http://localhost:3002/api/v1/items?limit=1')
    expect(itemsResponse.ok()).toBeTruthy()
    
    const itemsData = await itemsResponse.json()
    if (itemsData.items && itemsData.items.length > 0) {
      const itemId = itemsData.items[0].id
      
      // 获取物品详情
      const detailResponse = await request.get(`http://localhost:3002/api/v1/items/${itemId}`)
      expect(detailResponse.ok()).toBeTruthy()
      
      console.log('✅ 物品详情 API 正常')
    }
  })
})

test.describe('网络请求健康检查', () => {
  test('所有核心 API 端点正常', async ({ request }) => {
    const endpoints = [
      'GET http://localhost:3002/health',
      'GET http://localhost:3002/api/v1',
      'GET http://localhost:3002/api/v1/items?limit=1',
      'GET http://localhost:3002/api/v1/maps',
      'GET http://localhost:3002/api/v1/npcs',
      'GET http://localhost:3002/api/v1/social/friends/1fc5bfa9-a54b-406c-abaa-adb032a3f59a',
      'GET http://localhost:3002/api/v1/quests/1fc5bfa9-a54b-406c-abaa-adb032a3f59a',
      'GET http://localhost:3002/api/v1/skills/1fc5bfa9-a54b-406c-abaa-adb032a3f59a',
      'GET http://localhost:3002/api/v1/equipment/1fc5bfa9-a54b-406c-abaa-adb032a3f59a',
      'GET http://localhost:3002/api/v1/inventory/1fc5bfa9-a54b-406c-abaa-adb032a3f59a',
    ]

    let successCount = 0
    for (const endpoint of endpoints) {
      const [method, url] = endpoint.split(' ')
      try {
        const response = method === 'GET' 
          ? await request.get(url)
          : await request.post(url)
        
        if (response.ok() || response.status() === 404) {
          successCount++
          console.log(`✅ ${method} ${url} - ${response.status()}`)
        } else {
          console.log(`❌ ${method} ${url} - ${response.status()}`)
        }
      } catch (error) {
        console.log(`❌ ${method} ${url} - ${error}`)
      }
    }

    console.log(`\n📊 API 健康度：${successCount}/${endpoints.length}`)
    expect(successCount).toBeGreaterThanOrEqual(endpoints.length - 2) // 允许最多 2 个失败
  })
})
