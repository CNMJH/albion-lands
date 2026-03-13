# 🧪 全面测试验证指南

**版本**: v0.3.8-alpha  
**更新时间**: 2026-03-14 00:30  
**编译状态**: ✅ 服务端 0 错误，客户端 0 错误

---

## 📋 测试前准备

### 1. 拉取最新代码

```powershell
cd F:\Tenbox\openclaw_1\03\albion-lands
git pull origin main
```

**预期输出**:
```
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
remote: Compressing objects: 100% (15/15), done.
remote: Total 15 (delta 8), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (15/15), done.
From https://github.com/CNMJH/albion-lands
   a3f755c..HEAD  main     -> origin/main
Updating a3f755c..HEAD
Fast-forward
 server/src/routes/characters.ts     | 4 ++--
 server/src/routes/gathering.ts      | 4 ++++
 server/src/routes/item-detail.ts    | 4 ++++
 server/src/routes/index.ts          | 4 ++--
 server/tsconfig.build.json          | 3 ++-
 5 files changed, 15 insertions(+), 4 deletions(-)
```

---

### 2. 清除缓存并重启

```powershell
.\force-restart.bat
```

**预期输出**:
```
════════════════════════════════════════════
   Hulu Lands - 强制重启
════════════════════════════════════════════

[1/4] 清除服务端缓存...
[2/4] 清除客户端缓存...
[3/4] 启动服务端...
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3002                 ║
║  WebSocket: ws://0.0.0.0:3002/ws               ║
║  Environment: development                      ║
╚════════════════════════════════════════════════╝

[4/4] 启动客户端...
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

---

### 3. 访问清除缓存工具

打开浏览器访问:
```
http://localhost:3001/clear-cache.html
```

点击 **"清除缓存并刷新"** 按钮。

---

### 4. 强制刷新浏览器

按 **Ctrl + Shift + R** 强制刷新页面。

---

## 🎮 游戏测试清单

### 基础功能测试 (P0)

#### ✅ 1. 创建角色

**步骤**:
1. 访问 http://localhost:3001
2. 输入邮箱 `test1@example.com`
3. 输入密码 `password123`
4. 输入角色名 `测试玩家 1`
5. 点击 **创建角色**

**预期结果**:
- [ ] 角色创建成功提示
- [ ] 自动登录游戏
- [ ] 看到游戏画面（深绿色背景 + 网格）

**截图**: `screenshots/test_create_character.png`

---

#### ✅ 2. 登录游戏

**步骤**:
1. 使用已创建的角色登录
2. 观察加载过程

**预期结果**:
- [ ] 加载时间 < 5 秒
- [ ] 看到游戏场景
- [ ] 角色显示在屏幕中央（蓝色圆形）
- [ ] 地面网格可见（白色线条，64x64px）
- [ ] 小地图显示在左上角（200x200px）

**截图**: `screenshots/test_login.png`

---

#### ✅ 3. 背包系统

**步骤**:
1. 按 **B 键** 打开背包
2. 观察背包界面

**预期结果**:
- [ ] 背包窗口居中显示
- [ ] 6 个装备槽横向排列（3 列×2 行）
- [ ] 装备槽是正方形
- [ ] 物品栏格子是正方形（10 列×5 行）
- [ ] 货币显示：💰 1000 银币 / 🪙 100 金币
- [ ] 8 件新手装备在物品栏中

**截图**: `screenshots/test_backpack.png`

---

#### ✅ 4. 装备系统

**步骤**:
1. 按 **C 键** 打开装备面板
2. 观察装备界面

**预期结果**:
- [ ] 6 个装备槽显示（主手/副手/胸甲/腿甲/鞋子/饰品）
- [ ] 装备槽横向排列
- [ ] 属性面板显示 5 项属性
- [ ] 战力评分显示

**截图**: `screenshots/test_equipment.png`

---

#### ✅ 5. 角色移动

**步骤**:
1. 鼠标右键点击地面
2. 观察角色移动

**预期结果**:
- [ ] 角色向点击位置移动
- [ ] 移动时产生灰尘特效
- [ ] 角色面向移动方向
- [ ] 脚下有阴影
- [ ] 小地图玩家箭头移动

**截图**: `screenshots/test_move.png`

---

#### ✅ 6. 怪物显示

**步骤**:
1. 观察周围场景
2. 查看小地图

**预期结果**:
- [ ] 至少 10 只怪物在附近
- [ ] 怪物显示为红色圆点
- [ ] 小地图显示怪物红点
- [ ] 怪物有发光效果

**截图**: `screenshots/test_monsters.png`

---

#### ✅ 7. 货币显示验证

**步骤**:
1. 打开背包（B 键）
2. 查看货币显示区域

**预期结果**:
- [ ] 银币显示：`1,000`
- [ ] 金币显示：`100`
- [ ] 货币图标正确（💰/🪙）

**截图**: `screenshots/test_currency.png`

---

#### ✅ 8. UI 互斥测试

**步骤**:
1. 按 B 键打开背包
2. 按 C 键打开装备
3. 按 M 键打开拍卖行
4. 按 Escape 键

**预期结果**:
- [ ] 同时只打开一个 UI 面板
- [ ] 打开新面板时旧面板自动关闭
- [ ] Escape 键关闭所有 UI

**截图**: `screenshots/test_ui_mutex.png`

---

#### ✅ 9. 技能栏测试

**步骤**:
1. 观察技能栏
2. 按 Q/W/E/R 键

**预期结果**:
- [ ] 6 个技能图标显示
- [ ] 技能图标不同（不要都一样）
- [ ] 快捷键响应正常
- [ ] 技能释放有特效（金黄色光环）

**截图**: `screenshots/test_skills.png`

---

#### ✅ 10. 聊天系统测试

**步骤**:
1. 按 Enter 键打开聊天框
2. 输入文字发送
3. 观察聊天显示

**预期结果**:
- [ ] 聊天框激活时光标闪烁
- [ ] 可以输入文字
- [ ] 消息显示在聊天区域
- [ ] 聊天激活时禁用 WASD

**截图**: `screenshots/test_chat.png`

---

## 🐛 问题报告模板

如果测试中发现问题，请按以下格式报告：

```markdown
### 问题描述
[简短描述问题]

### 复现步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

### 预期结果
[应该发生什么]

### 实际结果
[实际发生了什么]

### 截图
[上传截图]

### 环境信息
- 浏览器：Chrome 120 / Firefox 121 / Edge 120
- 操作系统：Windows 10 / Windows 11
- 游戏版本：v0.3.8-alpha
```

---

## 📊 测试结果汇总

### P0 核心功能

| 测试项 | 状态 | 截图 | 备注 |
|--------|------|------|------|
| 创建角色 | ⏳ 待测 | ❌ | |
| 登录游戏 | ⏳ 待测 | ❌ | |
| 背包系统 | ⏳ 待测 | ❌ | |
| 装备系统 | ⏳ 待测 | ❌ | |
| 角色移动 | ⏳ 待测 | ❌ | |
| 怪物显示 | ⏳ 待测 | ❌ | |
| 货币显示 | ⏳ 待测 | ❌ | |
| UI 互斥 | ⏳ 待测 | ❌ | |
| 技能栏 | ⏳ 待测 | ❌ | |
| 聊天系统 | ⏳ 待测 | ❌ | |

**通过率**: 0/10 (0%)

---

### P1 重要功能

| 测试项 | 状态 | 截图 | 备注 |
|--------|------|------|------|
| 菜单按钮布局 | ⏳ 待测 | ❌ | |
| 小地图渲染 | ⏳ 待测 | ❌ | |
| Tooltip 显示 | ⏳ 待测 | ❌ | |
| 死亡统计 | ⏳ 待测 | ❌ | |
| 复活点绑定 | ⏳ 待测 | ❌ | |

**通过率**: 0/5 (0%)

---

## 📸 截图保存指南

### 截图目录结构

```
screenshots/
├── test_create_character.png
├── test_login.png
├── test_backpack.png
├── test_equipment.png
├── test_move.png
├── test_monsters.png
├── test_currency.png
├── test_ui_mutex.png
├── test_skills.png
└── test_chat.png
```

### 截图要求

1. **清晰度**: 1920x1080 或更高分辨率
2. **格式**: PNG（无损压缩）
3. **命名**: `test_[功能名].png`
4. **内容**: 包含完整 UI 和游戏场景

---

## 🚀 快速验证脚本

### PowerShell 一键验证

```powershell
# 验证服务端
curl http://localhost:3002/api/v1/health

# 验证客户端
curl http://localhost:3001

# 验证 WebSocket
# 手动访问 ws://localhost:3002/ws
```

### 预期响应

**服务端健康检查**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-14T00:30:00.000Z"
}
```

**客户端**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Hulu Lands</title>
  ...
</head>
...
</html>
```

---

## 📞 反馈渠道

- **GitHub Issues**: https://github.com/CNMJH/albion-lands/issues
- **Discord**: [待添加]
- **Email**: [待添加]

---

**测试愉快！如有问题请及时反馈！** 🎮
