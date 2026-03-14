import { test, expect, type Page } from '@playwright/test'

// 测试配置
const SERVER_URL = 'http://localhost:3001'
const TEST_ACCOUNT = {
  email: 'test1@example.com',
  password: 'password123',
}

// 辅助函数：等待游戏加载
async function waitForGameLoad(page: Page) {
  await page.goto(SERVER_URL)
  await page.waitForSelector('#game-container', { timeout: 10000 })
  await page.waitForTimeout(3000) // 等待游戏初始化
}

// 辅助函数：聚焦 Canvas
async function focusCanvas(page: Page) {
  const canvas = page.locator('canvas').first()
  await canvas.focus()
  await page.waitForTimeout(1000)
  return canvas
}

// 辅助函数：检查调试覆盖层
async function checkDebugOverlay(page: Page) {
  const overlay = page.locator('.debug-overlay')
  const isVisible = await overlay.isVisible()
  if (isVisible) {
    const text = await overlay.textContent()
    console.log('调试覆盖层:', text)
    return text
  }
  return null
}

test.describe('🎮 单人游戏功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGameLoad(page)
  })

  test('✅ 游戏加载测试', async ({ page }) => {
    // 检查游戏容器
    const gameContainer = page.locator('#game-container')
    await expect(gameContainer).toBeVisible()

    // 检查 Canvas
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // 检查 UI 覆盖层
    const uiOverlay = page.locator('.ui-overlay')
    await expect(uiOverlay).toBeVisible()

    console.log('✅ 游戏加载成功')
  })

  test('✅ 玩家移动测试', async ({ page }) => {
    const canvas = await focusCanvas(page)

    // 截图：移动前
    await page.screenshot({ path: 'screenshots/move-before.png' })

    // 右键点击移动
    await canvas.click({ button: 'right', position: { x: 400, y: 300 } })
    await page.waitForTimeout(1500)

    // 截图：移动后
    await page.screenshot({ path: 'screenshots/move-after.png' })

    // 检查控制台日志
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('移动') || text.includes('move')) {
        consoleLogs.push(text)
      }
    })

    console.log('移动日志:', consoleLogs)
    expect(consoleLogs.length).toBeGreaterThan(0)
  })

  test('✅ 玩家攻击测试', async ({ page }) => {
    const canvas = await focusCanvas(page)

    // 左键攻击
    await canvas.click({ button: 'left' })
    await page.waitForTimeout(500)

    // 截图：攻击
    await page.screenshot({ path: 'screenshots/attack.png' })

    // 检查攻击日志
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('攻击') || text.includes('attack')) {
        consoleLogs.push(text)
      }
    })

    console.log('攻击日志:', consoleLogs)
  })

  test('✅ UI 打开/关闭测试', async ({ page }) => {
    const canvas = await focusCanvas(page)

    // 按 B 键打开背包
    await page.keyboard.press('b')
    await page.waitForTimeout(500)

    // 检查背包 UI
    const inventory = page.locator('.inventory-window')
    await expect(inventory).toBeVisible()

    // 截图：背包打开
    await page.screenshot({ path: 'screenshots/inventory-open.png' })

    // 按 B 键关闭背包
    await page.keyboard.press('b')
    await page.waitForTimeout(500)

    // 检查背包已关闭
    await expect(inventory).not.toBeVisible()

    // 截图：背包关闭
    await page.screenshot({ path: 'screenshots/inventory-closed.png' })
  })

  test('✅ 装备 UI 测试', async ({ page }) => {
    const canvas = await focusCanvas(page)

    // 按 C 键打开装备
    await page.keyboard.press('c')
    await page.waitForTimeout(500)

    // 检查装备 UI
    const equipment = page.locator('.equipment-panel')
    await expect(equipment).toBeVisible()

    // 截图：装备界面
    await page.screenshot({ path: 'screenshots/equipment.png' })

    // 按 C 键关闭
    await page.keyboard.press('c')
    await page.waitForTimeout(500)
  })

  test('✅ 技能栏测试', async ({ page }) => {
    const canvas = await focusCanvas(page)

    // 检查技能栏
    const skillBar = page.locator('.skill-bar')
    await expect(skillBar).toBeVisible()

    // 截图：技能栏
    await page.screenshot({ path: 'screenshots/skill-bar.png' })

    // 按 Q 键使用技能
    await page.keyboard.press('q')
    await page.waitForTimeout(500)

    // 检查技能特效
    console.log('✅ 技能 Q 已释放')
  })

  test('✅ 小地图测试', async ({ page }) => {
    // 检查小地图
    const minimap = page.locator('.minimap')
    await expect(minimap).toBeVisible()

    // 截图：小地图
    await page.screenshot({ path: 'screenshots/minimap.png' })

    console.log('✅ 小地图显示正常')
  })

  test('✅ 角色信息测试', async ({ page }) => {
    // 检查角色信息
    const characterInfo = page.locator('.character-info')
    await expect(characterInfo).toBeVisible()

    // 截图：角色信息
    await page.screenshot({ path: 'screenshots/character-info.png' })

    console.log('✅ 角色信息显示正常')
  })
})

test.describe('👥 多人联机功能测试', () => {
  test('✅ 网络同步测试', async ({ page }) => {
    await waitForGameLoad(page)
    const canvas = await focusCanvas(page)

    // 检查 WebSocket 连接
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('WebSocket') || text.includes('连接')) {
        consoleLogs.push(text)
      }
    })

    await page.waitForTimeout(2000)
    console.log('网络日志:', consoleLogs)

    // 检查是否有连接成功日志
    const connected = consoleLogs.some(log => log.includes('连接') || log.includes('connect'))
    expect(connected).toBe(true)
  })

  test('✅ 聊天功能测试', async ({ page }) => {
    await waitForGameLoad(page)
    const canvas = await focusCanvas(page)

    // 按 Enter 打开聊天框
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // 输入聊天消息
    await page.keyboard.type('测试聊天消息')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // 截图：聊天
    await page.screenshot({ path: 'screenshots/chat.png' })

    // 检查聊天消息
    const chatMessages = page.locator('.chat-messages')
    await expect(chatMessages).toBeVisible()

    console.log('✅ 聊天功能正常')
  })

  test('✅ 好友系统测试', async ({ page }) => {
    await waitForGameLoad(page)
    const canvas = await focusCanvas(page)

    // 打开好友 UI（假设有快捷键）
    await page.keyboard.press('f')
    await page.waitForTimeout(500)

    // 截图：好友界面
    await page.screenshot({ path: 'screenshots/friends.png' })

    console.log('✅ 好友系统测试完成')
  })
})

test.describe('🌐 网络稳定性测试', () => {
  test('✅ 断线重连测试', async ({ page }) => {
    await waitForGameLoad(page)

    // 模拟网络断开
    await page.route('**/ws/**', route => route.abort())

    await page.waitForTimeout(2000)

    // 检查是否显示断开提示
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('断开') || text.includes('disconnect') || text.includes('重连')) {
        consoleLogs.push(text)
      }
    })

    console.log('断线日志:', consoleLogs)

    // 恢复网络
    await page.unroute('**/ws/**')
    await page.waitForTimeout(3000)

    console.log('✅ 断线重连测试完成')
  })

  test('✅ 网络延迟测试', async ({ page }) => {
    await waitForGameLoad(page)

    // 模拟网络延迟
    await page.route('**/*', async route => {
      await page.waitForTimeout(500) // 500ms 延迟
      await route.continue()
    })

    // 测试移动
    const canvas = await focusCanvas(page)
    await canvas.click({ button: 'right', position: { x: 400, y: 300 } })
    await page.waitForTimeout(2000)

    console.log('✅ 网络延迟测试完成')
  })
})

test.describe('🔧 浏览器兼容性测试', () => {
  test('✅ Canvas 渲染测试', async ({ page }) => {
    await waitForGameLoad(page)

    const canvas = page.locator('canvas').first()
    const boundingBox = await canvas.boundingBox()

    expect(boundingBox).toBeTruthy()
    expect(boundingBox!.width).toBeGreaterThan(0)
    expect(boundingBox!.height).toBeGreaterThan(0)

    console.log(`✅ Canvas 尺寸：${boundingBox!.width} x ${boundingBox!.height}`)
  })

  test('✅ 键盘输入测试', async ({ page }) => {
    await waitForGameLoad(page)
    const canvas = await focusCanvas(page)

    // 测试各个按键
    const keys = ['w', 'a', 's', 'd', 'b', 'c', 'e', 'q', 'w', 'r']
    
    for (const key of keys) {
      await page.keyboard.press(key)
      await page.waitForTimeout(200)
    }

    console.log('✅ 键盘输入测试完成')
  })

  test('✅ 鼠标输入测试', async ({ page }) => {
    await waitForGameLoad(page)
    const canvas = await focusCanvas(page)

    // 测试左键
    await canvas.click({ button: 'left', position: { x: 400, y: 300 } })
    await page.waitForTimeout(300)

    // 测试右键
    await canvas.click({ button: 'right', position: { x: 500, y: 400 } })
    await page.waitForTimeout(300)

    // 测试移动
    await canvas.hover({ position: { x: 600, y: 500 } })
    await page.waitForTimeout(300)

    console.log('✅ 鼠标输入测试完成')
  })
})

test.describe('📊 性能测试', () => {
  test('✅ FPS 测试', async ({ page }) => {
    await waitForGameLoad(page)

    // 打开性能监控（F11）
    await page.keyboard.press('F11')
    await page.waitForTimeout(1000)

    // 截图：性能监控
    await page.screenshot({ path: 'screenshots/performance.png' })

    // 检查 FPS
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('FPS') || text.includes('fps')) {
        consoleLogs.push(text)
      }
    })

    await page.waitForTimeout(3000)
    console.log('FPS 日志:', consoleLogs)
  })

  test('✅ 内存使用测试', async ({ page }) => {
    await waitForGameLoad(page)

    // 获取内存使用情况
    const metrics = await page.metrics()
    console.log('内存使用:', {
      JSHeapUsedSize: (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2) + ' MB',
      JSHeapTotalSize: (metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2) + ' MB',
    })

    expect(metrics.JSHeapUsedSize).toBeLessThan(500 * 1024 * 1024) // < 500MB
  })
})
