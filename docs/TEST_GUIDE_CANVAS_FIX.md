# 🧪 测试指南 - Canvas 修复验证

**版本**: v0.4.1  
**日期**: 2026-03-14  
**提交**: `bac8417`

---

## 🚀 快速测试

### 1. 拉取最新代码
```bash
git pull origin main
```

### 2. 重启游戏
关闭当前游戏，重新运行：
```bash
npm run dev
```

### 3. 打开浏览器
访问：http://localhost:3001

---

## ✅ 预期结果

### 控制台日志（按顺序）

**初始化阶段** - 应该看到：
```
===== GameCanvas useEffect 开始 =====
GameCanvas: 已清理容器内容
GameCanvas: 开始初始化渲染器...
🎨 GameRenderer: 开始初始化...
✅ GameRenderer: Pixi Application 已创建
✅ GameRenderer: Canvas 已添加到 DOM
✅ GameRenderer: Canvas 已立即 focus
✅ 游戏渲染器初始化完成
🖼️ Canvas 尺寸：1920 x 1080
🎯 Canvas tabindex: 0
✅ GameCanvas: renderer.init() 已完成
```

**Canvas 焦点** - 右上角应该显示：
```
✅ 已聚焦（绿色）
```

**地面渲染** - 应该看到：
```
✅ MapSystem: 地砖纹理加载成功
✅ MapSystem: 地图初始化完成
```

**玩家数据** - 应该看到：
```
setupNetworkHandlers: 开始设置网络处理器...
📦 setupNetworkHandlers: localStorage characterId = xxx-xxx-xxx
✅ setupNetworkHandlers: 已从 localStorage 恢复 characterId
```

---

## ❌ 不应该出现的错误

以下错误**不应该再出现**：

```
❌ GameCanvas: 无法获取 Canvas 元素
❌ Canvas 元素不存在！
❌ MapSystem: ground 图层不存在
⚠️ EquipmentPanel: characterId 为空，等待登录
❌ 装备响应错误：400
❌ 属性响应错误：400
```

---

## 🎮 功能测试

### 1. 键盘控制
- **WASD**: 移动角色
- **Shift**: 冲刺
- **B**: 打开背包
- **C**: 打开装备
- **E**: 拾取/交互

### 2. 鼠标控制
- **右键**: 移动/攻击
- **左键**: 攻击/选择
- **QWERAS**: 技能

### 3. UI 测试
- **装备面板**: 按 C 键，应该正常打开，无 400 错误
- **背包面板**: 按 B 键，应该正常打开
- **小地图**: 左上角应该显示玩家和怪物

---

## 📊 问题反馈

如果还有问题，请提供：

1. **完整控制台日志**（从页面加载开始）
2. **右上角调试信息截图**
3. **具体哪个功能不工作**

---

## 🔧 已知问题

以下问题**已知但暂不修复**（不影响核心玩法）：

- ⚠️ 新手教程缺失
- ⚠️ 好友/组队功能未实现
- ⚠️ 技能特效偶尔不显示

---

**测试愉快！** 🎉
