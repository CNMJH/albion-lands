# 🔧 UI 互斥修复指南

**版本**: v0.3.7-alpha  
**更新时间**: 2026-03-14

---

## ❌ 问题报告

### 问题 1: 背包 UI 有问题
**症状**: 背包打开后样式错乱，或者看不到背包窗口

**原因**: `inventory-window` 类缺少 CSS 定义

---

### 问题 2: 角色无法移动，啥也干不了
**症状**: 
- 右键点击地面，角色不动
- 按技能键没反应
- 所有操作都无效

**可能原因**:
1. Canvas 没有 focus
2. 玩家数据未加载
3. **UI 打开时没有阻止游戏输入** ← 最可能
4. 网络断开

---

## ✅ 修复方案

### 修复 1: 背包 UI 样式

**修改**: `client/src/components/Inventory-optimized.css`

**添加**:
```css
.inventory-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}
```

**效果**: 背包窗口正确居中显示

---

### 修复 2: UI 互斥原则

**修改**: `client/src/systems/PlayerControlsSystem.ts`

**逻辑**:
```typescript
// 检查是否有 UI 打开
const anyUIOpen = Object.values(state.uiState).some(v => v === true)

if (anyUIOpen) {
  console.log('🚫 UI 打开中，阻止游戏输入')
  return  // 阻止游戏输入
}

// 正常处理移动/攻击
```

**效果**:
- ✅ 打开背包时，右键点击不会移动
- ✅ 打开装备时，技能键无效
- ✅ 关闭 UI 后，操作恢复正常

---

## 🚀 快速修复

### Windows 用户

```powershell
# 1. 拉取最新代码
cd F:\Tenbox\openclaw_1\02\albion-lands
git pull origin main

# 2. 运行修复启动器
.\fix-ui-mutex.bat
```

---

## 🔍 验证步骤

### 步骤 1: 测试背包 UI

1. **登录游戏**
2. **按 B 键** 打开背包
3. **检查**:
   - 背包窗口居中显示
   - 能看到装备栏和物品栏
   - 关闭按钮（×）在右上角

---

### 步骤 2: 测试 UI 互斥

1. **按 B 键打开背包**
2. **右键点击地面**
   - ❌ 旧行为：角色移动（错误）
   - ✅ 新行为：角色不动，控制台显示 `🚫 UI 打开中，阻止游戏输入`
3. **关闭背包**（点 × 或再按 B）
4. **右键点击地面**
   - ✅ 角色正常移动

---

### 步骤 3: 测试其他 UI

| UI | 快捷键 | 打开时能否移动 |
|----|--------|--------------|
| 背包 | B 键 | ❌ 不能 |
| 装备 | C 键 | ❌ 不能 |
| 拍卖行 | M 键 | ❌ 不能 |
| 聊天框 | Enter | ❌ 不能（但可打字） |
| 死亡统计 | F1 | ❌ 不能 |

**所有 UI 打开时都应该阻止游戏输入！**

---

## 📊 控制台日志

### 成功打开背包
```
✅ 打开 inventory UI（互斥模式）
```

### 打开背包时尝试移动
```
🖱️ [Canvas] 鼠标点击：button=2
🚫 UI 打开中，阻止游戏输入
```

### 关闭背包后移动
```
❌ 关闭 inventory UI
🖱️ [Canvas] 鼠标点击：button=2
🖱️ 右键点击 - 移动/攻击：{ x: 500, y: 300 }
🎯 玩家移动到 (500, 300)
🚶 移动中：{ x: 410, y: 300, angle: 0°, distance: 90 }
```

---

## 🐛 故障排查

### 问题 A: 背包打开但看不到

**检查**:
1. 按 F12 打开开发者工具
2. 切换到 "Elements" 标签
3. 查找 `<div class="inventory-window">`
4. 检查 CSS 是否加载

**解决**:
```javascript
// 在控制台强制显示背包
document.querySelector('.inventory-window').style.display = 'block'
```

---

### 问题 B: 还是无法移动（关闭 UI 后）

**检查控制台**:
```javascript
// 检查玩家数据
var state = useGameStore.getState()
console.log('玩家:', state.player)
console.log('UI 状态:', state.uiState)
```

**如果玩家数据为空**:
- 刷新页面重新登录

**如果 UI 状态有 true**:
- 某个 UI 没正确关闭，按 Escape 键强制关闭所有 UI

---

### 问题 C: Canvas 没有 focus

**检查**:
```javascript
var canvas = document.querySelector('canvas')
console.log('Focus:', document.activeElement === canvas)
```

**解决**:
```javascript
canvas.focus()
```

---

## 📝 技术细节

### 文件修改清单

```
client/src/
├── components/
│   └── Inventory-optimized.css   # 添加 inventory-window 样式
└── systems/
    └── PlayerControlsSystem.ts   # UI 互斥检查

根目录/
└── fix-ui-mutex.bat              # 修复启动器
```

---

## 🎯 UI 互斥设计原则

### 原则 1: 同时只打开一个 UI
- 打开新 UI 时，自动关闭旧 UI
- 避免多个 UI 重叠

### 原则 2: UI 打开时禁用游戏输入
- 防止误操作
- 提升用户体验

### 原则 3: Escape 键关闭所有 UI
- 快速返回游戏
- 紧急情况退出

---

## ✅ 预期行为

### 正常流程
```
1. 登录游戏
2. 右键点击移动 → ✅ 正常移动
3. 按 B 打开背包 → ✅ 背包显示
4. 右键点击 → ❌ 无法移动（UI 保护）
5. 关闭背包 → ✅ 背包消失
6. 右键点击 → ✅ 正常移动
```

### 快捷操作
```
1. 打开背包 (B) → 查看物品
2. 关闭背包 (B) → 继续游戏
3. 打开装备 (C) → 查看属性
4. 关闭装备 (C) → 继续游戏
5. 打开拍卖行 (M) → 交易
6. 关闭拍卖行 (M) → 继续游戏
```

---

## 🎮 完整操作指南

| 操作 | 按键 | 说明 |
|------|------|------|
| 移动 | 右键点击地面 | **UI 打开时无效** |
| 攻击 | 左键点击 | **UI 打开时无效** |
| 背包 | B 键 | 打开/关闭背包 |
| 装备 | C 键 | 打开/关闭装备 |
| 拍卖行 | M 键 | 打开/关闭拍卖行 |
| 聊天 | Enter 键 | 打开聊天框 |
| 关闭所有 UI | Escape 键 | 紧急退出 |

---

**有问题？截图 + 控制台日志发给我！** 📸
