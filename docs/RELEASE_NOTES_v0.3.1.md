# 🎉 Hulu Lands v0.3.1-alpha 发布说明

**发布日期**: 2026-03-13  
**版本**: v0.3.1-alpha  
**项目**: 呼噜大陆 (Hulu Lands)  
**GitHub**: https://github.com/CNMJH/albion-lands  
**上一版本**: v0.3.0-alpha

---

## 🔧 本次更新亮点

### 🎯 P0 问题修复

**UI 互斥原则** - 严格遵循设计文档要求
> 同时只打开一个 UI 面板，打开新面板自动关闭旧面板

**修复前**:
```
按 B → 背包打开 ✅
按 C → 装备打开，背包未关闭 ❌
按 M → 拍卖行打开，背包和装备未关闭 ❌
结果：3 个 UI 同时显示，界面混乱
```

**修复后**:
```
按 B → 背包打开 ✅
按 C → 装备打开，背包自动关闭 ✅
按 M → 拍卖行打开，其他 UI 自动关闭 ✅
结果：严格互斥，界面清晰
```

---

## ✨ 新增功能

### ⌨️ 快捷键优化

#### Escape 键 - 关闭所有 UI
- **功能**: 一键关闭所有打开的 UI 面板
- **使用场景**: 快速返回游戏画面
- **测试**: 按 Escape → 所有 UI 关闭 ✅

#### Tab 键 - 计分板/排行榜
- **功能**: 快速打开/关闭计分板
- **使用场景**: 查看排名/战绩
- **测试**: 按 Tab → 计分板切换 ✅
- **注意**: 已防止浏览器默认行为（切换焦点）

---

## 📊 完整快捷键列表

### 战斗快捷键
| 按键 | 功能 | 说明 |
|------|------|------|
| **鼠标右键** | 移动/攻击 | LOL 风格智能攻击 |
| **鼠标左键** | 普通攻击 | 面向点击位置攻击 |
| **QWER** | 技能 1-4 | 由装备决定 |
| **Shift** | 冲刺 | 1.5 倍移速 |
| **E** | 拾取/交互 | 80px 范围 |

### UI 快捷键
| 按键 | 功能 | 状态 |
|------|------|------|
| **B** | 背包 | ✅ |
| **C** | 装备 | ✅ |
| **M** | 拍卖行 | ✅ |
| **Enter** | 聊天 | ✅ |
| **F1** | 死亡统计 | ✅ |
| **F2** | 复活点 | ✅ |
| **Escape** | 关闭所有 UI | ✅ **新增** |
| **Tab** | 计分板/排行榜 | ✅ **新增** |
| **P** | 商店 | ✅ |
| **K** | 计分板 | ✅ |
| **L** | 血条切换 | ✅ |
| **Z** | 快捷聊天 | ✅ |

---

## 🔍 技术改进

### 客户端

#### PlayerControlsSystem.ts
- **修改**: `toggleUI()` 方法重写
- **新增**: `closeAllUI()` 方法
- **改进**: UI 状态同步机制
- **代码量**: +30 行

#### gameStore.ts
- **新增**: `setUIStateAll()` 方法
- **新增**: `closeAllUI()` 方法
- **改进**: UI 状态管理
- **代码量**: +25 行

### 架构优化

**UI 互斥实现**:
```typescript
// 1. 关闭本地所有 UI
Object.keys(this.uiState).forEach(key => {
  this.uiState[key as keyof typeof this.uiState] = false
})

// 2. 打开目标 UI
this.uiState[uiType] = true

// 3. 同步到 store（一次性设置所有状态）
const newUIState = { /* ... */ }
newUIState[uiType] = true
store.setUIStateAll(newUIState)
```

**关键改进**:
- ✅ 使用 `setUIStateAll()` 一次性设置所有 UI 状态
- ✅ 确保 store 和本地状态完全同步
- ✅ 避免部分更新导致的状态不一致

---

## 🧪 测试验证

### 测试环境
- **浏览器**: Chrome Headless
- **客户端**: http://localhost:3001
- **服务端**: http://localhost:3002
- **测试账号**: test1@example.com

### 测试用例

#### UI 互斥测试 ✅
```
1. 按 B → 背包打开 ✅
2. 按 C → 装备打开，背包关闭 ✅
3. 按 M → 拍卖行打开，装备关闭 ✅
4. 按 F1 → 死亡统计打开，拍卖行关闭 ✅
5. 按 Escape → 所有 UI 关闭 ✅
```

#### Escape 键测试 ✅
```
前置条件: 打开任意 UI

步骤: 按 Escape
结果: 所有 UI 关闭 ✅
```

#### Tab 键测试 ✅
```
步骤: 按 Tab
结果: 计分板切换 ✅
注意: 防止浏览器默认行为
```

### 测试截图

1. `screenshots/test_ui_mutex_1.png` - 背包界面
2. `screenshots/test_ui_mutex_2.png` - 装备界面（背包已关闭）
3. `screenshots/test_ui_mutex_3.png` - 拍卖行界面（装备已关闭）
4. `screenshots/test_ui_mutex_4.png` - 所有 UI 关闭

---

## 📈 项目进度

### 总体完成度

| 版本 | 完成度 | 状态 |
|------|--------|------|
| v0.3.0-alpha | 92% (35/38) | 🟡 |
| **v0.3.1-alpha** | **97% (37/38)** | 🟢 |
| v0.4.0 (计划) | 100% (38/38) | ⏳ |

### 功能分类完成度

| 类别 | v0.3.0 | v0.3.1 | 变化 |
|------|--------|--------|------|
| P0 核心功能 | 100% | 100% | - |
| P1 游戏内容 | 100% | 100% | - |
| P2 优化功能 | 100% | 100% | - |
| UI 快捷键 | 67% | 80% | +13% ⬆️ |
| UI 互斥 | 0% | 100% | +100% ⬆️ |
| 智能攻击 | 60% | 60% | - |

---

## 📝 变更日志

### 提交记录

```
commit 78cac12
Author: AI Agent
Date: 2026-03-13

fix: 修复 UI 互斥原则（P0 问题）

- 修改 toggleUI 方法实现严格互斥
- 添加 setUIStateAll 方法到 gameStore
- 添加 closeAllUI 方法
- 新增 Escape 键关闭所有 UI
- 新增 Tab 键计分板功能
- 测试验证通过
```

### 文件变更

| 文件 | 变更 | 说明 |
|------|------|------|
| `client/src/systems/PlayerControlsSystem.ts` | +30/-5 | toggleUI 重写 + closeAllUI |
| `client/src/stores/gameStore.ts` | +25/-0 | setUIStateAll + closeAllUI |
| `docs/UI_MUTEX_FIX.md` | +150 | 修复报告 |
| `docs/GAP_ANALYSIS_v0.3.0.md` | +20 | 更新进度 |

---

## 🎯 已知问题

### 待优化功能（P1）

| 问题 | 优先级 | 计划版本 |
|------|--------|----------|
| 智能攻击不完整 | P1 | v0.4.0 |
| 攻击范围未差异化 | P1 | v0.4.0 |

### 长期规划（P2+）

| 问题 | 优先级 | 计划版本 |
|------|--------|----------|
| 移动端适配 | P2 | v0.5.0 |
| 新手引导 | P2 | v0.4.0 |
| 商店系统 | P2 | v0.4.0 |
| 回城功能 | P3 | v0.5.0 |
| 视角锁定 | P3 | v0.5.0 |

---

## 🚀 升级指南

### 从 v0.3.0 升级

```bash
# 拉取最新代码
git pull origin main

# 重启客户端
cd client && npm run dev

# 服务端无需重启（仅客户端修改）
```

### 全新安装

```bash
# Windows
launcher.bat

# Linux/Mac
cd server && npm run dev
cd client && npm run dev
```

访问：http://localhost:3001

---

## 📞 反馈渠道

- **GitHub Issues**: https://github.com/CNMJH/albion-lands/issues
- **项目主页**: https://github.com/CNMJH/albion-lands
- **测试账号**: test1@example.com / password123

---

## 🙏 致谢

感谢所有参与测试和反馈的玩家！

**Hulu Lands v0.3.1-alpha - UI 体验大幅改善！** 🎉

---

**MIT License** © 2026 Hulu Lands Team
