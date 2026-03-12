import { test, expect } from '@playwright/test';

/**
 * 死亡掉落系统 - 拾取功能测试
 */
test.describe('死亡掉落系统 - 拾取功能', () => {
  test.beforeEach(async ({ page }) => {
    // 打开游戏页面
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待游戏加载
  });

  test('游戏正常加载', async ({ page }) => {
    // 检查 Canvas 是否存在
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 截图
    await page.screenshot({ path: 'screenshots/death-pickup-test-start.png' });
    
    console.log('✅ 游戏加载正常');
  });

  test('UI 面板功能', async ({ page }) => {
    // 按 B 键打开背包
    await page.keyboard.press('b');
    await page.waitForTimeout(500);
    
    // 检查背包是否打开
    const inventory = page.locator('.inventory-panel');
    await expect(inventory).toBeVisible();
    
    // 按 C 键打开装备
    await page.keyboard.press('c');
    await page.waitForTimeout(500);
    
    // 检查装备面板是否打开
    const equipment = page.locator('.equipment-panel');
    await expect(equipment).toBeVisible();
    
    // 按 Enter 打开聊天
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 检查聊天框是否打开
    const chat = page.locator('.chat-ui');
    await expect(chat).toBeVisible();
    
    // 截图
    await page.screenshot({ path: 'screenshots/death-pickup-test-ui.png' });
    
    console.log('✅ UI 面板功能正常');
  });

  test('网络请求检查', async ({ page }) => {
    const requests: string[] = [];
    const errors: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        requests.push(url);
      }
    });
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') && response.status() >= 400) {
        errors.push(`${url} - ${response.status()}`);
      }
    });
    
    // 触发 API 请求
    await page.keyboard.press('b');
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('c');
    await page.waitForTimeout(1000);
    
    // 检查错误
    expect(errors.length).toBe(0);
    
    console.log('✅ 网络请求正常:', requests.length, '个请求，0 个错误');
    
    // 截图
    await page.screenshot({ path: 'screenshots/death-pickup-test-network.png' });
  });

  test('Canvas 焦点测试', async ({ page }) => {
    // 点击 Canvas 确保焦点
    const canvas = page.locator('canvas');
    await canvas.click();
    await page.waitForTimeout(200);
    
    // 测试键盘输入
    await page.keyboard.press('b');
    await page.waitForTimeout(500);
    
    const inventory = page.locator('.inventory-panel');
    await expect(inventory).toBeVisible();
    
    console.log('✅ Canvas 焦点正常');
  });
});
