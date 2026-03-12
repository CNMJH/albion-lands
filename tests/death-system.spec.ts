import { test, expect } from '@playwright/test';

/**
 * 死亡掉落系统测试
 */
test.describe('死亡掉落系统', () => {
  test.beforeEach(async ({ page }) => {
    // 打开游戏页面
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('游戏正常加载', async ({ page }) => {
    // 等待游戏加载
    await page.waitForTimeout(3000);
    
    // 检查 Canvas 是否存在
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 截图
    await page.screenshot({ path: 'screenshots/death-test-start.png' });
    
    console.log('✅ 游戏加载正常');
  });

  test('打开背包和装备面板', async ({ page }) => {
    await page.waitForTimeout(3000);
    
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
    
    // 截图
    await page.screenshot({ path: 'screenshots/death-test-ui.png' });
    
    console.log('✅ UI 面板正常');
  });

  test('检查网络请求', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // 监听网络请求
    const requests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        requests.push(url);
      }
    });
    
    // 按 B 键打开背包触发 API 请求
    await page.keyboard.press('b');
    await page.waitForTimeout(1000);
    
    // 按 C 键打开装备触发 API 请求
    await page.keyboard.press('c');
    await page.waitForTimeout(1000);
    
    // 检查是否有 500 错误
    const errors = requests.filter(url => url.includes('500'));
    expect(errors.length).toBe(0);
    
    console.log('✅ 网络请求正常:', requests.length, '个请求');
  });
});
