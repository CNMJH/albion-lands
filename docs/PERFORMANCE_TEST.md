# 性能测试工具

**用途：** 监控游戏性能（FPS、内存、加载时间）

---

## 🔧 使用方法

### 1. FPS 监控

**浏览器控制台输入：**

```javascript
// 启用 FPS 计数器
function enableFPSCounter() {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;
  
  function countFPS() {
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frames;
      frames = 0;
      lastTime = now;
      console.log(`📊 FPS: ${fps}`);
    }
    requestAnimationFrame(countFPS);
  }
  
  countFPS();
  return () => console.log('FPS 监控已启动，查看控制台输出');
}

enableFPSCounter();
```

### 2. 内存监控

**浏览器控制台输入：**

```javascript
// 监控内存使用
function monitorMemory() {
  if (!performance.memory) {
    console.warn('❌ 浏览器不支持内存监控');
    console.warn('请使用 Chrome 并启用 --enable-precise-memory-info');
    return;
  }
  
  setInterval(() => {
    const used = performance.memory.usedJSHeapSize / 1048576;
    const total = performance.memory.totalJSHeapSize / 1048576;
    const limit = performance.memory.jsHeapSizeLimit / 1048576;
    
    console.log(`💾 内存：${used.toFixed(2)}MB / ${total.toFixed(2)}MB (${((used/limit)*100).toFixed(1)}%)`);
  }, 5000);
  
  return '内存监控已启动（每 5 秒）';
}

monitorMemory();
```

### 3. 性能报告

**浏览器控制台输入：**

```javascript
// 生成性能报告
function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    },
    memory: performance.memory ? {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    } : 'Not supported',
    network: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'Not supported',
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory
  };
  
  console.table(report);
  return report;
}

generatePerformanceReport();
```

### 4. 加载时间测试

**浏览器控制台输入：**

```javascript
// 测试加载时间
function measureLoadTime() {
  if (performance.timing) {
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;
    
    const metrics = {
      'DNS 查询': timing.domainLookupEnd - timing.domainLookupStart,
      'TCP 连接': timing.connectEnd - timing.connectStart,
      '请求响应': timing.responseEnd - timing.requestStart,
      'DOM 解析': timing.domComplete - timing.domLoading,
      '资源加载': timing.loadEventEnd - timing.navigationStart,
      '首屏时间': timing.domContentLoadedEventEnd - timing.navigationStart
    };
    
    console.log('⏱️ 加载时间分析:');
    for (const [key, value] of Object.entries(metrics)) {
      console.log(`  ${key}: ${value}ms`);
    }
    
    return metrics;
  }
  
  return 'Performance Timing API not supported';
}

measureLoadTime();
```

### 5. 渲染性能

**浏览器控制台输入：**

```javascript
// 监控渲染性能
function monitorRenderPerformance() {
  let longFrames = 0;
  let totalFrames = 0;
  
  function checkFrame() {
    totalFrames++;
    const start = performance.now();
    
    requestAnimationFrame(() => {
      const duration = performance.now() - start;
      if (duration > 16.67) { // 超过 60fps 的帧时间
        longFrames++;
        console.warn(`⚠️ 慢帧：${duration.toFixed(2)}ms`);
      }
      
      if (totalFrames % 60 === 0) {
        const ratio = ((longFrames / totalFrames) * 100).toFixed(2);
        console.log(`📊 帧率质量：${totalFrames} 帧，${longFrames} 慢帧 (${ratio}%)`);
      }
      
      checkFrame();
    });
  }
  
  checkFrame();
  return '渲染性能监控已启动';
}

monitorRenderPerformance();
```

### 6. 一键性能测试

**浏览器控制台输入：**

```javascript
// 一键性能测试
async function runPerformanceTest() {
  console.log('🚀 开始性能测试...\n');
  
  // 1. 基本信息
  console.log('📋 系统信息:');
  console.log(`  浏览器：${navigator.userAgent}`);
  console.log(`  屏幕：${screen.width}x${screen.height}`);
  console.log(`  CPU 核心：${navigator.hardwareConcurrency || '未知'}`);
  console.log(`  内存：${navigator.deviceMemory || '未知'}GB\n`);
  
  // 2. 加载时间
  console.log('⏱️ 加载时间:');
  const timing = performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  console.log(`  总加载时间：${loadTime}ms\n`);
  
  // 3. 内存使用
  if (performance.memory) {
    console.log('💾 内存使用:');
    const used = performance.memory.usedJSHeapSize / 1048576;
    console.log(`  已使用：${used.toFixed(2)}MB\n`);
  }
  
  // 4. FPS 测试（10 秒）
  console.log('📊 FPS 测试（10 秒）...');
  await new Promise(resolve => {
    let frames = 0;
    let lastTime = performance.now();
    let fpsValues = [];
    
    function count() {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsValues.push(frames);
        frames = 0;
        lastTime = now;
      }
      if (now - lastTime + frames * 16 < 10000) {
        requestAnimationFrame(count);
      } else {
        const avg = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
        const min = Math.min(...fpsValues);
        const max = Math.max(...fpsValues);
        console.log(`  平均 FPS: ${avg.toFixed(1)}`);
        console.log(`  最低 FPS: ${min}`);
        console.log(`  最高 FPS: ${max}`);
        resolve();
      }
    }
    
    count();
  });
  
  console.log('\n✅ 性能测试完成！');
}

runPerformanceTest();
```

---

## 📊 性能标准

### FPS 标准

| 场景 | 优秀 | 良好 | 一般 | 差 |
|------|------|------|------|-----|
| 空闲 | > 60 | 55-60 | 45-54 | < 45 |
| 移动 | > 55 | 50-55 | 40-49 | < 40 |
| 战斗 | > 50 | 45-50 | 35-44 | < 35 |
| 多人 | > 45 | 40-45 | 30-39 | < 30 |

### 内存标准

| 时间 | 优秀 | 良好 | 一般 | 差 |
|------|------|------|------|-----|
| 初始 | < 150MB | 150-200MB | 200-250MB | > 250MB |
| 30 分钟 | < 250MB | 250-300MB | 300-400MB | > 400MB |
| 1 小时 | < 300MB | 300-400MB | 400-500MB | > 500MB |

### 加载时间标准

| 指标 | 优秀 | 良好 | 一般 | 差 |
|------|------|------|------|-----|
| 首屏 | < 3s | 3-5s | 5-8s | > 8s |
| 可交互 | < 5s | 5-8s | 8-12s | > 12s |
| 完全加载 | < 10s | 10-15s | 15-20s | > 20s |

---

## 🐛 性能问题排查

### FPS 过低

**可能原因：**
1. 渲染对象过多
2. 动画过于复杂
3. 未使用硬件加速

**解决方法：**
```javascript
// 1. 检查渲染对象数量
console.log('渲染对象数量:', renderer.plugins.batch.totalDraws);

// 2. 减少同屏角色
// 修改配置：MAX_VISIBLE_ENTITIES = 20

// 3. 启用硬件加速
// CSS 中添加：will-change: transform;
```

### 内存泄漏

**可能原因：**
1. 事件监听器未清理
2. 定时器未清除
3. 大对象未释放

**解决方法：**
```javascript
// 1. 检查事件监听器
console.log('事件监听器:', getEventListeners(window));

// 2. 定期清理
setInterval(() => {
  if (performance.memory.usedJSHeapSize > 400 * 1048576) {
    console.warn('内存使用过高，建议刷新页面');
  }
}, 30000);
```

### 加载过慢

**可能原因：**
1. 资源文件过大
2. 网络请求过多
3. 未使用 CDN

**解决方法：**
```javascript
// 1. 检查资源大小
performance.getEntriesByType('resource').forEach(r => {
  console.log(`${r.name}: ${(r.transferSize / 1024).toFixed(2)}KB`);
});

// 2. 启用资源压缩
// 使用 gzip/brotli 压缩

// 3. 使用 CDN
// 将静态资源托管到 CDN
```

---

**阿米大王，性能测试工具已就绪！** 📊
