# 呼噜大陆 (Hulu Lands) - 完整游戏设计文档

**版本：** 1.0  
**创建日期：** 2026-03-11  
**作者：** 波波 & 阿米大王  
**参考：** 阿尔比恩 Online 深度分析报告（8 文档）

---

# 📋 目录

1. [游戏概述](#1-游戏概述)
2. [世界观与背景](#2-世界观与背景)
3. [核心玩法](#3-核心玩法)
4. [地图设计](#4-地图设计)
5. [职业系统](#5-职业系统)
6. [经济系统](#6-经济系统)
7. [PVP/PVE 系统](#7-pvppve-系统)
8. [社交系统](#8-社交系统)
9. [H5 客户端架构](#9-h5-客户端架构)
10. [服务端架构](#10-服务端架构)
11. [OpenClaw 集成](#11-openclaw-集成)
12. [技术实现](#12-技术实现)

---

# 1. 游戏概述

## 1.1 游戏定位

| 属性 | 描述 |
|------|------|
| **类型** | 2D MMORPG 浏览器游戏 |
| **风格** | 像素可爱风 |
| **平台** | Web (H5) + 移动端适配 |
| **目标用户** | 休闲 + 中度玩家（15-35 岁） |
| **游戏时长** | 每日 30-60 分钟 |
| **付费模式** | 会员订阅 + 外观内购（不影响平衡） |

## 1.2 核心特色

### 与阿尔比恩对比

| 特性 | 阿尔比恩 | 呼噜大陆 |
|------|----------|----------|
| 画风 | 低多边形 3D | 2D 像素可爱 |
| 视角 | 俯视角 3D | 俯视角 2D |
| 平台 | PC+ 移动端 | Web 优先 |
| 节奏 | 慢 | 快 |
| 新手门槛 | 高 | 低 |
| 死亡惩罚 | 全部掉落 | 部分掉落（1-3 件） |
| AI 集成 | 无 | 有（OpenClaw） |
| 学习曲线 | 陡峭 | 平缓 |

### 差异化优势

1. **AI 玩家共存** - OpenClaw AI 与真人玩家共同游戏
2. **像素可爱风** - 轻松愉快的视觉体验
3. **快节奏** - 适应现代玩家碎片时间
4. **新手友好** - 详细引导 + 保护机制
5. **浏览器即玩** - 无需下载客户端

## 1.3 设计原则

```
┌─────────────────────────────────────────┐
│           呼噜大陆设计三原则             │
├─────────────────────────────────────────┤
│ 1. 自由 - 装备决定职业，无固定职业限制   │
│ 2. 风险 - 区域风险分级，高风险高回报     │
│ 3. 社交 - 玩家驱动经济，AI 辅助不主导    │
└─────────────────────────────────────────┘
```

---

# 2. 世界观与背景

## 2.1 故事背景

在遥远的呼噜星球上，有一片神奇的大陆——呼噜大陆。这里生活着各种可爱的生物，从温顺的史莱姆到凶猛的巨龙。

千年前，远古文明留下了神秘的"能量水晶"，这些水晶散落在大陆各处，蕴含着强大的力量。如今，冒险者们从世界各地来到呼噜大陆，探索遗迹、采集资源、挑战怪物，寻找属于自己的传奇。

## 2.2 阵营设定

| 阵营 | 理念 | 主城 | 特色 |
|------|------|------|------|
| **呼噜联盟** | 和平发展 | 呼噜镇 | 商业加成 |
| **星辰公会** | 探索未知 | 星辰城 | 采集加成 |
| **自由冒险者** | 无阵营 | 无 | 无加成 |

**新手提示：** 前 20 级建议不加入阵营，自由探索

## 2.3 NPC 势力

| 势力 | 功能 | 分布 |
|------|------|------|
| 商人公会 | 交易、市场 | 所有安全区 |
| 工匠协会 | 制造、修理 | 主要城镇 |
| 冒险者协会 | 任务、声望 | 所有区域 |
| 守卫队 | 安全区保护 | 安全区 |

---

# 3. 核心玩法

## 3.1 游戏循环

```
┌──────────────────────────────────────────────────┐
│              呼噜大陆核心循环                     │
└──────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │ 采集   │   │ 战斗   │   │ 社交   │
   │ 资源   │   │ 怪物   │   │ 交易   │
   └───┬────┘   └───┬────┘   └───┬────┘
       │            │            │
       ▼            ▼            ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │ 制造   │   │ 装备   │   │ 组队   │
   │ 物品   │   │ 强化   │   │ 公会   │
   └───┬────┘   └───┬────┘   └───┬────┘
       │            │            │
       └────────────┼────────────┘
                    ▼
              ┌──────────┐
              │ 变强探索 │
              │ 新区域   │
              └──────────┘
```

## 3.2 核心系统

| 系统 | 功能 | 优先级 |
|------|------|--------|
| 战斗系统 | 技能释放、伤害计算、Buff | P0 |
| 背包系统 | 物品管理、装备穿戴 | P0 |
| 经济系统 | 采集、制造、交易 | P0 |
| 社交系统 | 好友、组队、公会 | P1 |
| 任务系统 | 主线、支线、日常 | P1 |
| PVP 系统 | 决斗、野外 PVP | P1 |
| 副本系统 | 地下城、世界 BOSS | P2 |

## 3.3 操作方式

### PC 端
| 按键 | 功能 |
|------|------|
| WASD/方向键 | 移动 |
| 鼠标左键 | 攻击/交互 |
| 鼠标右键 | 取消/菜单 |
| 1-6 | 技能快捷栏 |
| B | 背包 |
| C | 角色信息 |
| M | 地图 |
| Enter | 打开聊天 |
| Esc | 关闭界面 |

### 移动端
- 虚拟摇杆（左下）：移动
- 技能按钮（右下）：1-6 号技能
- 功能按钮（右上）：菜单、背包等

---

# 4. 地图设计

## 4.1 区域总览

```
┌─────────────────────────────────────────────────────────────┐
│                    呼噜大陆全境地图                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   【北部】                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │  9.深渊禁区  │  │ 8.巨龙巢穴  │  │ 7.遗迹之地  │        │
│   │  安全：0     │  │  安全：1-2  │  │  安全：3-4  │        │
│   │  等级：70+   │  │  等级：60+  │  │  等级：50+  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│   【中部】                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │ 6.迷雾森林  │  │ 5.王国腹地  │  │ 4.丘陵地带  │        │
│   │  安全：2-3   │  │  安全：5-6  │  │  安全：6-7  │        │
│   │  等级：40+   │  │  等级：30+  │  │  等级：20+  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│   【南部】                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │ 3.黑暗森林  │  │ 2.平原旷野  │  │ 1.新手村庄  │        │
│   │  安全：4-5   │  │  安全：7-8  │  │  安全：9-10 │        │
│   │  等级：10+   │  │  等级：5+   │  │  等级：1-5  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 区域详情

### 区域 1：新手村庄（呼噜镇）

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 9-10（绝对安全） |
| 推荐等级 | 1-5 |
| 面积 | 中等 |
| 传送点 | 有 |
| PVP | 禁止 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 小史莱姆 | 1-2 | 密集 | 粘液、金币 |
| 草史莱姆 | 2-3 | 中等 | 草元素、金币 |
| 流浪哥布林 | 3-4 | 稀疏 | 破布、木棍 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 铜矿 | 1 | 5 分钟 | 基础装备 |
| 橡树木 | 1 | 5 分钟 | 基础工具 |
| 棉花 | 1 | 3 分钟 | 基础衣物 |
| 小麦 | 1 | 3 分钟 | 食物 |

**NPC 设施：**
- 新手引导 NPC
- 基础商人
- 仓库管理员
- 传送法师

**连接区域：**
- 东 → 区域 2（平原旷野）

---

### 区域 2：平原旷野

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 7-8（安全区） |
| 推荐等级 | 5-10 |
| 面积 | 大 |
| 传送点 | 有 |
| PVP | 禁止 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 野兔 | 5-6 | 密集 | 兔肉、皮毛 |
| 狼 | 6-8 | 中等 | 狼皮、狼牙 |
| 熊 | 8-10 | 稀疏 | 熊皮、熊掌 |
| 哥布林斥候 | 7-9 | 中等 | 皮甲、短刀 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 锡矿 | 5 | 8 分钟 | 进阶装备 |
| 松木 | 5 | 8 分钟 | 进阶工具 |
| 亚麻 | 5 | 5 分钟 | 进阶衣物 |
| 胡萝卜 | 5 | 5 分钟 | 食物 |

**连接区域：**
- 西 → 区域 1（新手村庄）
- 北 → 区域 4（丘陵地带）
- 东 → 区域 3（黑暗森林）

---

### 区域 3：黑暗森林

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 4-5（低危区） |
| 推荐等级 | 10-20 |
| 面积 | 大 |
| 传送点 | 有 |
| PVP | 决斗模式 |
| 死亡惩罚 | 掉落 1 件 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 毒蜘蛛 | 10-12 | 密集 | 蛛丝、毒牙 |
| 骷髅兵 | 12-14 | 中等 | 骨头、铁剑 |
| 黑暗精灵 | 14-16 | 稀疏 | 精灵布、法杖 |
| 森林守护者 | 16-18 | BOSS | 稀有材料 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 铁矿 | 10 | 10 分钟 | 铁器装备 |
| 硬木 | 10 | 10 分钟 | 高级工具 |
| 丝绸草 | 10 | 8 分钟 | 高级衣物 |
| 蘑菇 | 10 | 5 分钟 | 药剂 |

**连接区域：**
- 西 → 区域 2（平原旷野）
- 北 → 区域 5（王国腹地）

---

### 区域 4：丘陵地带

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 6-7（安全区） |
| 推荐等级 | 20-30 |
| 面积 | 中等 |
| 传送点 | 有 |
| PVP | 禁止 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 山地羊 | 20-22 | 密集 | 羊毛、羊肉 |
| 石像鬼 | 22-24 | 中等 | 石头、翅膀 |
| 鹰身人 | 24-26 | 稀疏 | 羽毛、爪子 |
| 丘陵巨人 | 26-28 | BOSS | 巨人之力 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 银矿 | 20 | 12 分钟 | 银器装备 |
| 杉木 | 20 | 12 分钟 | 高级工具 |
| 麻布 | 20 | 10 分钟 | 高级衣物 |
| 草药 | 20 | 8 分钟 | 高级药剂 |

**连接区域：**
- 南 → 区域 2（平原旷野）
- 北 → 区域 6（迷雾森林）

---

### 区域 5：王国腹地

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 5-6（低危区） |
| 推荐等级 | 30-40 |
| 面积 | 大 |
| 传送点 | 有 |
| PVP | 决斗模式 |
| 死亡惩罚 | 掉落 1-2 件 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 王国守卫（敌对） | 30-32 | 密集 | 守卫装备 |
| 强盗 | 32-34 | 中等 | 强盗装备 |
| 魔法师 | 34-36 | 稀疏 | 魔法材料 |
| 堕落骑士 | 36-38 | BOSS | 骑士徽章 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 金矿 | 30 | 15 分钟 | 金器装备 |
| 桃花心木 | 30 | 15 分钟 | 大师工具 |
| 天鹅绒 | 30 | 12 分钟 | 大师衣物 |
| 稀有草药 | 30 | 10 分钟 | 大师药剂 |

**连接区域：**
- 南 → 区域 3（黑暗森林）
- 北 → 区域 7（遗迹之地）
- 西 → 区域 6（迷雾森林）

---

### 区域 6：迷雾森林

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 2-3（高危区） |
| 推荐等级 | 40-50 |
| 面积 | 大 |
| 传送点 | 有 |
| PVP | 开放 PVP |
| 死亡惩罚 | 掉落 2-3 件 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 迷雾幽灵 | 40-42 | 密集 | 幽灵精华 |
| 狼人 | 42-44 | 中等 | 狼皮、狼爪 |
| 吸血鬼 | 44-46 | 稀疏 | 吸血鬼之血 |
| 森林女巫 | 46-48 | BOSS | 女巫法杖 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 秘银矿 | 40 | 20 分钟 | 秘银装备 |
| 暗影木 | 40 | 20 分钟 | 暗影工具 |
| 月光布 | 40 | 15 分钟 | 月光衣物 |
| 魔力草 | 40 | 12 分钟 | 魔力药剂 |

**连接区域：**
- 南 → 区域 4（丘陵地带）
- 东 → 区域 5（王国腹地）
- 北 → 区域 8（巨龙巢穴）

---

### 区域 7：遗迹之地

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 3-4（高危区） |
| 推荐等级 | 50-60 |
| 面积 | 中等 |
| 传送点 | 有 |
| PVP | 开放 PVP |
| 死亡惩罚 | 掉落 2-3 件 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 石像守卫 | 50-52 | 密集 | 古代石头 |
| 木乃伊 | 52-54 | 中等 | 绷带、诅咒 |
| 法老亡灵 | 54-56 | 稀疏 | 法老遗物 |
| 遗迹守护者 | 56-58 | BOSS | 守护者之心 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 古代金矿 | 50 | 25 分钟 | 古代装备 |
| 神木 | 50 | 25 分钟 | 神级工具 |
| 龙鳞布 | 50 | 20 分钟 | 龙鳞衣物 |
| 生命草 | 50 | 15 分钟 | 生命药剂 |

**连接区域：**
- 南 → 区域 5（王国腹地）
- 北 → 区域 9（深渊禁区）

---

### 区域 8：巨龙巢穴

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 1-2（极危区） |
| 推荐等级 | 60-70 |
| 面积 | 中等 |
| 传送点 | 有 |
| PVP | 开放 PVP |
| 死亡惩罚 | 掉落 3-5 件 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 幼龙 | 60-62 | 密集 | 龙鳞、龙血 |
| 成年龙 | 62-64 | 中等 | 龙角、龙爪 |
| 古龙 | 64-66 | 稀疏 | 古龙之魂 |
| 龙王 | 66-68 | 世界 BOSS | 龙王之心 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 龙晶矿 | 60 | 30 分钟 | 龙晶装备 |
| 龙血木 | 60 | 30 分钟 | 龙血工具 |
| 龙翼布 | 60 | 25 分钟 | 龙翼衣物 |
| 龙魂草 | 60 | 20 分钟 | 龙魂药剂 |

**连接区域：**
- 南 → 区域 6（迷雾森林）
- 西 → 区域 9（深渊禁区）

---

### 区域 9：深渊禁区

**基本信息：**
| 属性 | 值 |
|------|-----|
| 安全等级 | 0（死亡区） |
| 推荐等级 | 70+ |
| 面积 | 小 |
| 传送点 | 无 |
| PVP | 开放 PVP |
| 死亡惩罚 | 掉落全部装备 |
| 特殊 | 死亡后随机复活 |

**怪物分布：**
| 怪物 | 等级 | 数量 | 掉落 |
|------|------|------|------|
| 深渊恶魔 | 70-72 | 密集 | 恶魔之角 |
| 堕落天使 | 72-74 | 中等 | 天使之羽 |
| 深渊领主 | 74-76 | 稀疏 | 领主之冠 |
| 深渊魔王 | 76-80 | 世界 BOSS | 魔王之心 |

**资源点：**
| 资源 | 等级 | 刷新时间 | 用途 |
|------|------|----------|------|
| 深渊水晶 | 70 | 60 分钟 | 顶级装备 |
| 世界树之木 | 70 | 60 分钟 | 顶级工具 |
| 神之布 | 70 | 45 分钟 | 顶级衣物 |
| 不朽草 | 70 | 30 分钟 | 不朽药剂 |

**连接区域：**
- 东 → 区域 7（遗迹之地）
- 南 → 区域 8（巨龙巢穴）

---

## 4.3 区域连接关系图

```
                    【北部高危区】
                    
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │ 深渊禁区 │◄──►│巨龙巢穴 │◄──►│遗迹之地 │
         │  Lv70+   │    │  Lv60+   │    │  Lv50+   │
         │ 安全：0  │    │ 安全：1-2│    │ 安全：3-4│
         └──────────┘    └──────────┘    └──────────┘
                              ▲               ▲
                              │               │
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │迷雾森林  │◄──►│王国腹地  │◄──►│丘陵地带  │
         │  Lv40+   │    │  Lv30+   │    │  Lv20+   │
         │ 安全：2-3│    │ 安全：5-6│    │ 安全：6-7│
         └──────────┘    └──────────┘    └──────────┘
                              ▲               ▲
                              │               │
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │黑暗森林  │◄──►│平原旷野  │◄──►│新手村庄  │
         │  Lv10+   │    │  Lv5+    │    │  Lv1-5   │
         │ 安全：4-5│    │ 安全：7-8│    │ 安全：9-10│
         └──────────┘    └──────────┘    └──────────┘
         
                    【南部安全区】

图例：
◄──► 双向通行
Lv   推荐等级
安全 安全等级（0-10，10 最安全）
```

## 4.4 传送系统

### 传送点分布

| 区域 | 传送点 | 解锁条件 |
|------|--------|----------|
| 新手村庄 | 1 个 | 初始解锁 |
| 平原旷野 | 2 个 | 到达区域 |
| 黑暗森林 | 2 个 | 到达区域 |
| 丘陵地带 | 2 个 | 到达区域 |
| 王国腹地 | 3 个 | 到达区域 |
| 迷雾森林 | 3 个 | 到达区域 |
| 遗迹之地 | 2 个 | 到达区域 |
| 巨龙巢穴 | 2 个 | 到达区域 |
| 深渊禁区 | 0 个 | 无法传送 |

### 传送费用

```
传送费 = 基础费 × 距离系数 × 装备重量

基础费：10 银币
距离系数：相邻区域 1.0，跨区 2.0
装备重量：每 10kg +10%
```

---

# 5. 职业系统

## 5.1 装备决定职业

**核心理念：** 无固定职业，装备决定能力

```
┌─────────────────────────────────────────┐
│        呼噜大陆职业系统                  │
├─────────────────────────────────────────┤
│  武器决定攻击方式                        │
│  防具决定防御属性                        │
│  饰品决定特殊能力                        │
│  自由搭配，无职业限制                    │
└─────────────────────────────────────────┘
```

## 5.2 武器分类

### 近战武器

| 武器 | 攻击速度 | 伤害类型 | 适合玩法 |
|------|----------|----------|----------|
| 剑 | 中等 | 平衡 | 通用 |
| 斧 | 慢 | 高爆发 | PVE |
| 锤 | 慢 | 破甲 | PVP |
| 匕首 | 快 | 暴击 | 偷袭 |
| 长矛 | 中等 | 穿透 | 团战 |

### 远程武器

| 武器 | 攻击速度 | 伤害类型 | 适合玩法 |
|------|----------|----------|----------|
| 弓 | 中等 | 物理 | 通用 |
| 弩 | 慢 | 高伤 | 狙击 |
| 法杖 | 慢 | 魔法 | 法师 |
| 魔典 | 快 | 持续 | DOT |

### 双手武器

| 武器 | 攻击速度 | 伤害类型 | 适合玩法 |
|------|----------|----------|----------|
| 巨剑 | 很慢 | 超高伤 | 爆发 |
| 战斧 | 慢 | 范围 | 群攻 |
| 法杖 | 中等 | 魔法 | 法爷 |

## 5.3 防具分类

### 布甲

| 属性 | 值 |
|------|-----|
| 物理防御 | 低 |
| 魔法防御 | 高 |
| 移动速度 | +10% |
| 能量回复 | +20% |
| 适合职业 | 法师、治疗 |

### 皮甲

| 属性 | 值 |
|------|-----|
| 物理防御 | 中 |
| 魔法防御 | 中 |
| 移动速度 | +5% |
| 暴击率 | +5% |
| 适合职业 | 刺客、猎人 |

### 锁甲

| 属性 | 值 |
|------|-----|
| 物理防御 | 高 |
| 魔法防御 | 低 |
| 移动速度 | 0% |
| 生命值 | +10% |
| 适合职业 | 战士、骑士 |

### 板甲

| 属性 | 值 |
|------|-----|
| 物理防御 | 极高 |
| 魔法防御 | 中 |
| 移动速度 | -5% |
| 生命值 | +20% |
| 适合职业 | 坦克 |

## 5.4 技能系统

### 技能获取

```
装备武器 → 解锁对应技能树 → 使用获得熟练度 → 升级技能
```

### 技能熟练度

| 等级 | 熟练度 | 解锁 |
|------|--------|------|
| 新手 | 0-100 | 基础技能 |
| 熟练 | 100-500 | 进阶技能 |
| 专家 | 500-2000 | 高级技能 |
| 大师 | 2000-10000 | 终极技能 |
| 传奇 | 10000+ | 被动加成 |

### 技能栏

- **快捷栏：** 6 个主动技能（1-6 键）
- **被动栏：** 4 个被动技能（自动生效）
- **切换：** 可保存 3 套技能配置

## 5.5 推荐流派

### 剑士流
```
武器：剑 + 盾
防具：板甲
技能：冲锋、盾击、嘲讽、格挡
定位：坦克
```

### 刺客流
```
武器：双匕首
防具：皮甲
技能：隐身、背刺、毒刃、闪避
定位：爆发输出
```

### 法师流
```
武器：法杖
防具：布甲
技能：火球、冰霜、雷电、传送
定位：远程输出
```

### 猎人流
```
武器：弓
防具：皮甲
技能：射击、陷阱、鹰眼、逃脱
定位：持续输出
```

### 治疗流
```
武器：魔典
防具：布甲
技能：治疗、护盾、复活、净化
定位：辅助治疗
```

---

# 6. 经济系统

## 6.1 货币系统

### 货币类型

| 货币 | 获取方式 | 用途 |
|------|----------|------|
| 铜币 | 打怪、任务 | 基础交易 |
| 银币 | 交易、副本 | 中级交易 |
| 金币 | 充值、活动 | 高级交易、外观 |

### 货币换算

```
100 铜币 = 1 银币
100 银币 = 1 金币
1 金币 ≈ 1 元人民币（充值）
```

## 6.2 资源采集

### 采集工具

| 工具 | 采集资源 | 等级要求 |
|------|----------|----------|
| 镐 | 矿石 | 1+ |
| 斧 | 木材 | 1+ |
| 镰刀 | 植物 | 1+ |
| 剥皮刀 | 动物皮毛 | 5+ |
| 高级工具 | 高级资源 | 20+ |

### 资源等级

| 资源类型 | T1 | T2 | T3 | T4 | T5 | T6 | T7 |
|----------|----|----|----|----|----|----|----|
| 矿石 | 铜 | 锡 | 铁 | 银 | 金 | 秘银 | 龙晶 |
| 木材 | 橡木 | 松木 | 硬木 | 杉木 | 桃花心木 | 暗影木 | 龙血木 |
| 植物 | 棉花 | 亚麻 | 丝绸草 | 麻布 | 天鹅绒 | 月光布 | 龙翼布 |

## 6.3 制造系统

### 制造设施

| 设施 | 制造物品 | 需要材料 |
|------|----------|----------|
| 铁匠铺 | 武器、防具 | 矿石、皮革 |
| 木工坊 | 工具、弓 | 木材、植物 |
| 纺织坊 | 衣物、布甲 | 植物、丝绸 |
| 炼金台 | 药剂、药水 | 草药、瓶子 |
| 厨房 | 食物、料理 | 食材、调料 |

### 制造公式

```
物品 = 基础材料 × 数量 + 催化剂 + 制造时间

成功率 = 基础成功率 + 熟练度加成 - 材料等级差
```

### 制造熟练度

| 等级 | 成功率加成 | 解锁 |
|------|------------|------|
| 新手 | 0% | 基础物品 |
| 熟练 | +10% | 进阶物品 |
| 专家 | +20% | 高级物品 |
| 大师 | +30% | 稀有物品 |
| 传奇 | +50% | 传说物品 |

## 6.4 交易系统

### 交易方式

| 方式 | 说明 | 手续费 |
|------|------|--------|
| 面对面交易 | 玩家直接交易 | 0% |
| 市场挂单 | 拍卖行挂单 | 5% |
| 快速出售 | 卖给 NPC | 0%（低价） |
| 公会交易 | 公会内部 | 2% |

### 市场系统

```
┌─────────────────────────────────────────┐
│              市场订单                    │
├─────────────────────────────────────────┤
│  买入订单：玩家出价收购物品             │
│  卖出订单：玩家出价出售物品             │
│  成交价：买卖双方匹配的价格             │
│  历史价：最近 7 天平均成交价            │
└─────────────────────────────────────────┘
```

### 价格机制

```
市场价格 = 供需关系决定

供 > 求 → 价格下跌
求 > 供 → 价格上涨
```

## 6.5 经济平衡

### 金币产出

| 来源 | 日产出估算 | 占比 |
|------|------------|------|
| 任务奖励 | 30% | 稳定 |
| 打怪掉落 | 20% | 稳定 |
| 市场交易 | 40% | 波动 |
| 活动奖励 | 10% | 波动 |

### 金币消耗

| 消耗 | 日消耗估算 | 占比 |
|------|------------|------|
| 传送费 | 15% | 稳定 |
| 修理费 | 20% | 稳定 |
| 制造材料 | 35% | 波动 |
| 外观购买 | 20% | 波动 |
| 其他 | 10% | 稳定 |

### 通胀控制

1. **消耗设计** - 确保足够的金币消耗途径
2. **产出控制** - 根据经济情况调整产出
3. **税收机制** - 交易手续费回收金币
4. **活动调控** - 通过活动调节货币流通

---

# 7. PVP/PVE 系统

## 7.1 PVP 系统

### PVP 区域分级

| 区域类型 | 安全等级 | PVP 规则 | 死亡惩罚 | 收益倍率 |
|----------|----------|----------|----------|----------|
| 安全区 | 6-10 | 禁止 PVP | 无掉落 | 1.0x |
| 低危区 | 4-5 | 决斗模式 | 掉落 1 件 | 1.2x |
| 高危区 | 2-3 | 开放 PVP | 掉落 2-3 件 | 1.5x |
| 极危区 | 1 | 开放 PVP | 掉落 3-5 件 | 1.8x |
| 死亡区 | 0 | 开放 PVP | 全部掉落 | 2.0x |

### PVP 玩法

#### 1. 野外 PVP
```
人数：自由
目标：击杀玩家、掠夺装备
奖励：敌方装备、荣誉点数
风险：根据区域等级
```

#### 2. 决斗模式
```
人数：1v1、2v2、3v3
目标：击败对方
奖励：荣誉点数、排名
风险：无掉落（低危区）
```

#### 3. 战场
```
人数：5v5、10v10
目标：占领据点、击杀竞赛
奖励：战场币、装备
风险：无掉落
```

#### 4. 竞技场
```
人数：1v1、2v2、5v5
目标：击败对方
奖励：排名积分、赛季奖励
风险：无掉落
```

### PVP 平衡机制

| 机制 | 说明 |
|------|------|
| 装备分匹配 | 根据装备等级匹配对手 |
| 人数平衡 | 尽量平衡双方人数 |
| 等级压缩 | 高等级属性压缩，缩小差距 |
| 控制递减 | 连续控制效果递减 |
| 新手保护 | 10 级前免疫 PVP |

### 荣誉系统

| 荣誉等级 | 积分要求 | 奖励 |
|----------|----------|------|
| 青铜 | 0-999 | 基础奖励 |
| 白银 | 1000-1999 | 较好奖励 |
| 黄金 | 2000-3999 | 好奖励 |
| 铂金 | 4000-7999 | 稀有奖励 |
| 钻石 | 8000+ | 顶级奖励 |

## 7.2 PVE 系统

### 怪物类型

| 类型 | 特点 | 典型怪物 |
|------|------|----------|
| 普通 | 基础 AI、单一技能 | 史莱姆、狼 |
| 精英 | 强化属性、额外技能 | 精英哥布林 |
| 冠军 | 特殊能力、高血量 | 哥布林首领 |
| BOSS | 多阶段、复杂机制 | 区域 BOSS |
| 世界 BOSS | 全服挑战、多阶段 | 龙王、魔王 |

### 怪物 AI 行为

```
状态机：
巡逻状态 → 发现玩家 → 追击状态 → 攻击状态
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              低血量逃跑       呼叫支援       使用特殊技能
                    │               │               │
                    └───────────────┴───────────────┘
                                    ▼
                              死亡掉落
```

### 副本设计

#### 普通副本
| 属性 | 值 |
|------|-----|
| 人数 | 1-5 人 |
| 时长 | 10-20 分钟 |
| 难度 | 普通/英雄 |
| 奖励 | 装备、材料 |

#### 团队副本
| 属性 | 值 |
|------|-----|
| 人数 | 10-20 人 |
| 时长 | 30-60 分钟 |
| 难度 | 英雄/传奇 |
| 奖励 | 稀有装备、成就 |

### 世界 BOSS

| BOSS | 等级 | 刷新时间 | 持续时间 | 奖励 |
|------|------|----------|----------|------|
| 森林守护者 | 18 | 每日 14:00 | 30 分钟 | 稀有材料 |
| 丘陵巨人 | 28 | 每日 20:00 | 30 分钟 | 巨人之力 |
| 遗迹守护者 | 58 | 每周六 20:00 | 60 分钟 | 守护者之心 |
| 龙王 | 68 | 每周日 20:00 | 60 分钟 | 龙王之心 |
| 深渊魔王 | 80 | 每月 1 日 | 120 分钟 | 魔王之心 |

### 奖励分配

```
世界 BOSS 奖励分配：
- 伤害排名前 10：额外奖励
- 最后一击：特殊奖励
- 参与玩家：基础奖励
```

---

# 8. 社交系统

## 8.1 好友系统

### 好友功能

| 功能 | 说明 |
|------|------|
| 好友列表 | 查看在线状态、位置 |
| 私聊 | 一对一聊天 |
| 快速组队 | 一键邀请组队 |
| 屏蔽 | 屏蔽骚扰玩家 |
| 黑名单 | 阻止添加 |

### 好友上限

| 账户类型 | 好友上限 |
|----------|----------|
| 免费 | 100 |
| 会员 | 200 |

## 8.2 组队系统

### 队伍规模

- **最大人数：** 5 人
- **最小人数：** 1 人（单人）

### 组队加成

| 人数 | 经验加成 | 金币加成 |
|------|----------|----------|
| 2 人 | +5% | +5% |
| 3 人 | +10% | +10% |
| 4 人 | +15% | +15% |
| 5 人 | +20% | +20% |

### 战利品分配

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| 自由拾取 | 谁捡到归谁 | 信任队伍 |
| 轮流拾取 | 按顺序分配 | 公平分配 |
| 队长分配 | 队长决定 | 固定队伍 |
| 需求优先 | 需求>贪婪 | 随机队伍 |
| 拍卖分配 | 价高者得 | 商业队伍 |

## 8.3 公会系统

### 公会结构

```
公会会长（1 人）
├── 官员（3-5 人）
│   ├── 招募官员
│   ├── 财务官员
│   └── 战争官员
├── 精英成员（10-20 人）
└── 普通成员（不限）
```

### 公会等级

| 等级 | 人数上限 | 解锁功能 | 升级要求 |
|------|----------|----------|----------|
| 1 | 30 | 基础功能 | 初始 |
| 2 | 50 | 金库 Lv1 | 贡献度 1000 |
| 3 | 80 | 金库 Lv2 | 贡献度 5000 |

### 公会权限

| 权限 | 会长 | 官员 | 精英 | 普通 |
|------|------|------|------|------|
| 邀请成员 | ✅ | ✅ | ❌ | ❌ |
| 踢出成员 | ✅ | ✅ | ❌ | ❌ |
| 管理金库 | ✅ | ✅ | ❌ | ❌ |
| 公会聊天 | ✅ | ✅ | ✅ | ✅ |

### 公会贡献度

| 行为 | 贡献度 |
|------|--------|
| 每日登录 | +10 |
| 完成公会任务 | +50-200 |
| 捐赠金币 | 1 金币=1 贡献度 |
| 参与公会活动 | +100 |

## 8.4 聊天系统

### 聊天频道

| 频道 | 范围 | 用途 |
|------|------|------|
| 本地 | 附近玩家 | 区域交流 |
| 区域 | 整个区域 | 区域公告 |
| 队伍 | 队伍成员 | 组队沟通 |
| 公会 | 公会成员 | 公会事务 |
| 交易 | 全服 | 买卖信息 |
| 私聊 | 两人 | 私人对话 |

### 聊天管理

| 违规类型 | 处罚 |
|----------|------|
| 轻微违规 | 警告 |
| 中度违规 | 禁言 1-24 小时 |
| 严重违规 | 禁言 7 天 |
| 极端违规 | 永久封禁 |

---

# 9. H5 客户端架构

## 9.1 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.x |
| 渲染 | Pixi.js | 7.x |
| 语言 | TypeScript | 5.x |
| 状态管理 | Zustand | 4.x |
| 网络 | WebSocket | 原生 |
| 构建 | Vite | 5.x |

## 9.2 目录结构

```
client/
├── src/
│   ├── components/           # React 组件
│   │   ├── GameCanvas.tsx    # 游戏画布
│   │   ├── UIOverlay.tsx     # UI 覆盖层
│   │   ├── CharacterInfo.tsx # 角色信息
│   │   ├── SkillBar.tsx      # 技能栏
│   │   ├── MiniMap.tsx       # 小地图
│   │   ├── ChatBox.tsx       # 聊天框
│   │   └── MenuBar.tsx       # 菜单栏
│   ├── renderer/             # 渲染系统
│   │   ├── GameRenderer.ts   # 主渲染器
│   │   ├── Camera.ts         # 摄像机
│   │   ├── GameObject.ts     # 游戏对象基类
│   │   ├── Player.ts         # 玩家
│   │   ├── Monster.ts        # 怪物
│   │   └── Effect.ts         # 特效
│   ├── store/                # 状态管理
│   │   ├── gameStore.ts      # 游戏状态
│   │   ├── playerStore.ts    # 玩家状态
│   │   └── uiStore.ts        # UI 状态
│   ├── network/              # 网络模块
│   │   ├── NetworkManager.ts # 网络管理器
│   │   ├── MessageHandler.ts # 消息处理
│   │   └── Reconnect.ts      # 重连逻辑
│   ├── utils/                # 工具函数
│   │   ├── math.ts           # 数学计算
│   │   ├── pathfinding.ts    # 寻路
│   │   └── helpers.ts        # 辅助函数
│   ├── assets/               # 资源
│   │   ├── sprites/          # 精灵图
│   │   ├── audio/            # 音频
│   │   └── maps/             # 地图
│   ├── App.tsx               # 主组件
│   └── main.tsx              # 入口
├── public/                   # 静态资源
├── package.json
└── vite.config.ts
```

## 9.3 核心模块

### 游戏循环

```typescript
// 游戏主循环（60 FPS）
function gameLoop(timestamp: number) {
  // 1. 处理输入
  handleInput();
  
  // 2. 更新逻辑
  updateGameState(deltaTime);
  updateEntities(deltaTime);
  updatePhysics(deltaTime);
  
  // 3. 渲染
  renderer.render();
  uiRenderer.render();
  
  // 4. 请求下一帧
  requestAnimationFrame(gameLoop);
}
```

### 渲染系统

```typescript
// 5 图层管理
const layers = {
  GROUND: 0,    // 地面
  OBJECTS: 1,   // 物体
  CHARACTERS: 2,// 角色
  EFFECTS: 3,   // 特效
  UI: 4         // UI
};

// 渲染顺序
renderer.render(layer.GROUND);
renderer.render(layer.OBJECTS);
renderer.render(layer.CHARACTERS);
renderer.render(layer.EFFECTS);
renderer.render(layer.UI);
```

### 摄像机系统

```typescript
class Camera {
  x: number;
  y: number;
  zoom: number;
  target: GameObject | null;
  
  // 跟随目标
  follow(target: GameObject) {
    this.target = target;
  }
  
  // 更新位置
  update(deltaTime: number) {
    if (this.target) {
      this.x = lerp(this.x, this.target.x, 0.1);
      this.y = lerp(this.y, this.target.y, 0.1);
    }
  }
}
```

### 网络管理器

```typescript
class NetworkManager {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: number;
  
  // 连接
  connect(url: string) {
    this.ws = new WebSocket(url);
    this.setupHandlers();
    this.startHeartbeat();
  }
  
  // 发送消息
  send(message: GameMessage) {
    this.ws.send(JSON.stringify(message));
  }
  
  // 心跳
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat', timestamp: Date.now() });
    }, 10000); // 10 秒
  }
  
  // 重连
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(this.url), 2000);
    }
  }
}
```

## 9.4 UI 系统

### UI 组件层次

```
App
├── GameCanvas (Pixi.js)
│   ├── 地面层
│   ├── 物体层
│   ├── 角色层
│   ├── 特效层
│   └── UI 层
└── UIOverlay (React)
    ├── CharacterInfo
    ├── SkillBar
    ├── MiniMap
    ├── ChatBox
    └── MenuBar
```

### 响应式设计

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .skill-bar {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .chat-box {
    height: 150px;
  }
  
  .mini-map {
    width: 120px;
    height: 120px;
  }
}
```

---

# 10. 服务端架构

## 10.1 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | 20.x |
| 框架 | Fastify | 4.x |
| 数据库 | PostgreSQL | 15.x |
| ORM | Prisma | 5.x |
| 缓存 | Redis | 7.x |
| WebSocket | ws | 8.x |
| 语言 | TypeScript | 5.x |

## 10.2 目录结构

```
server/
├── src/
│   ├── index.ts              # 入口
│   ├── WebSocketServer.ts    # WebSocket 服务
│   ├── routes/               # HTTP 路由
│   │   ├── auth.ts           # 认证
│   │   ├── users.ts          # 用户
│   │   ├── characters.ts     # 角色
│   │   ├── items.ts          # 物品
│   │   └── market.ts         # 市场
│   ├── services/             # 业务逻辑
│   │   ├── AuthService.ts    # 认证服务
│   │   ├── CombatService.ts  # 战斗服务
│   │   ├── EconomyService.ts # 经济服务
│   │   └── WorldService.ts   # 世界服务
│   ├── models/               # 数据模型
│   │   ├── Player.ts         # 玩家
│   │   ├── Item.ts           # 物品
│   │   └── Monster.ts        # 怪物
│   ├── utils/                # 工具函数
│   └── config/               # 配置
├── prisma/
│   └── schema.prisma         # 数据库 Schema
├── package.json
└── tsconfig.json
```

## 10.3 数据库设计

### 核心表

```prisma
// 用户表
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  characters Character[]
}

// 角色表
model Character {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  name      String
  level     Int      @default(1)
  exp       Int      @default(0)
  gold      Int      @default(0)
  mapId     String
  x         Float
  y         Float
  equipment Json     // 装备
  inventory Json     // 背包
  createdAt DateTime @default(now())
}

// 物品表
model Item {
  id        String   @id @default(uuid())
  name      String
  type      String   // 武器/防具/材料...
  rarity    String   // 普通/稀有/史诗...
  stats     Json     // 属性
  ownerId   String?  // 所有者
}

// 市场订单表
model MarketOrder {
  id        String   @id @default(uuid())
  itemId    String
  sellerId  String
  price     Int
  quantity  Int
  type      String   // buy/sell
  status    String   // active/completed/cancelled
  createdAt DateTime @default(now())
}
```

### 8 大系统

| 系统 | 主要表 | 功能 |
|------|--------|------|
| 用户系统 | User、Session | 认证、授权 |
| 角色系统 | Character、Stats | 角色数据 |
| 物品系统 | Item、Inventory | 物品管理 |
| 经济系统 | MarketOrder、Transaction | 交易市场 |
| 地图系统 | Map、Zone | 地图数据 |
| 社交系统 | Friend、Guild、Party | 社交关系 |
| 战斗系统 | CombatLog、Buff | 战斗记录 |
| 日志系统 | GameLog、AuditLog | 操作日志 |

## 10.4 WebSocket 服务

### 连接管理

```typescript
class WebSocketServer {
  private clients: Map<string, WebSocket> = new Map();
  private heartbeatTimeout = 30000; // 30 秒
  
  // 新连接
  handleConnection(ws: WebSocket, req: IncomingMessage) {
    const playerId = this.authenticate(req);
    this.clients.set(playerId, ws);
    
    ws.on('message', (data) => this.handleMessage(playerId, data));
    ws.on('close', () => this.clients.delete(playerId));
    
    // 心跳检测
    this.startHeartbeatCheck(playerId, ws);
  }
  
  // 消息处理
  handleMessage(playerId: string, data: string) {
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'move':
        this.handleMove(playerId, message);
        break;
      case 'attack':
        this.handleAttack(playerId, message);
        break;
      case 'chat':
        this.handleChat(playerId, message);
        break;
      // ... 更多消息类型
    }
  }
  
  // 广播消息
  broadcast(message: object, excludePlayerId?: string) {
    const data = JSON.stringify(message);
    this.clients.forEach((ws, playerId) => {
      if (playerId !== excludePlayerId && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}
```

### 消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| move | C→S | 玩家移动 |
| attack | C→S | 攻击指令 |
| cast | C→S | 施放技能 |
| chat | C→S | 聊天消息 |
| trade | C→S | 交易请求 |
| party | C→S | 组队操作 |
| market | C→S | 市场操作 |
| position | S→C | 位置同步 |
| combat | S→C | 战斗信息 |
| update | S→C | 状态更新 |

## 10.5 服务层

### 战斗服务

```typescript
class CombatService {
  // 计算伤害
  calculateDamage(attacker: Player, target: Player | Monster): number {
    const baseDamage = attacker.attack - target.defense;
    const critChance = attacker.critRate;
    const critMultiplier = attacker.critDamage;
    
    let damage = baseDamage;
    
    // 暴击判定
    if (Math.random() < critChance) {
      damage *= critMultiplier;
    }
    
    // 浮动范围 ±10%
    damage *= (0.9 + Math.random() * 0.2);
    
    return Math.floor(damage);
  }
  
  // 应用 Buff
  applyBuff(target: Player | Monster, buff: Buff) {
    target.buffs.push(buff);
    this.updateStats(target);
  }
  
  // 移除 Buff
  removeBuff(target: Player | Monster, buffId: string) {
    target.buffs = target.buffs.filter(b => b.id !== buffId);
    this.updateStats(target);
  }
}
```

### 经济服务

```typescript
class EconomyService {
  // 创建市场订单
  async createOrder(
    playerId: string,
    itemId: string,
    price: number,
    quantity: number,
    type: 'buy' | 'sell'
  ): Promise<MarketOrder> {
    // 验证物品
    const item = await this.getItem(itemId);
    if (!item) throw new Error('物品不存在');
    
    // 验证所有权
    if (type === 'sell' && item.ownerId !== playerId) {
      throw new Error('物品不属于你');
    }
    
    // 创建订单
    const order = await prisma.marketOrder.create({
      data: {
        itemId,
        sellerId: playerId,
        price,
        quantity,
        type,
        status: 'active'
      }
    });
    
    // 匹配订单
    await this.matchOrders(order);
    
    return order;
  }
  
  // 匹配订单
  async matchOrders(newOrder: MarketOrder) {
    // 查找匹配的订单
    const matchOrders = await this.findMatchingOrders(newOrder);
    
    for (const match of matchOrders) {
      // 执行交易
      await this.executeTrade(newOrder, match);
    }
  }
}
```

## 10.6 性能优化

### 实体管理

```typescript
// 只同步视野内的实体
class WorldService {
  getVisibleEntities(playerId: string, range: number): Entity[] {
    const player = this.getPlayer(playerId);
    
    return this.entities.filter(entity => {
      const distance = this.getDistance(player, entity);
      return distance <= range;
    });
  }
  
  // 空间分区优化
  private spatialIndex: Map<string, Entity[]> = new Map();
  
  updateSpatialIndex(entity: Entity) {
    const gridKey = this.getGridKey(entity.x, entity.y);
    // 更新空间索引
  }
}
```

### 数据库优化

```typescript
// 批量操作
async function batchUpdatePlayers(updates: PlayerUpdate[]) {
  await prisma.$transaction(
    updates.map(update =>
      prisma.character.update({
        where: { id: update.id },
        data: update.data
      })
    )
  );
}

// 缓存热点数据
const playerCache = new LRUCache({ max: 10000 });

async function getPlayer(id: string): Promise<Player> {
  const cached = playerCache.get(id);
  if (cached) return cached;
  
  const player = await prisma.character.findUnique({
    where: { id }
  });
  
  playerCache.set(id, player);
  return player;
}
```

---

# 11. OpenClaw 集成

## 11.1 AI 玩家设计

### AI 行为模式

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| Passive | 被动防御 | 安全区挂机 |
| Active | 主动攻击 | PVP/PVE |
| Gatherer | 采集资源 | 经济活动 |
| Explorer | 探索地图 | 地图开拓 |

### AI 限制

```typescript
// AI 玩家限制配置
const AI_LIMITS = {
  // 收益限制（真人 8 折）
  goldMultiplier: 0.8,
  expMultiplier: 0.8,
  
  // 操作延迟（模拟真人）
  minReactionTime: 200,  // 最小反应时间 ms
  maxReactionTime: 1000, // 最大反应时间 ms
  
  // API 限制
  maxActionsPerSecond: 5,  // 每秒最大操作
  maxPathfindingCalls: 10, // 寻路调用限制
  
  // 标识
  namePrefix: '[AI]',  // 名称前缀
  chatDisabled: true,   // 禁止聊天
};
```

## 11.2 OpenClaw SDK

### 客户端 API

```typescript
// OpenClawClient.ts
class OpenClawClient {
  private ws: WebSocket;
  private agent: AIAgent;
  
  // 连接游戏服务器
  connect(gameServerUrl: string, credentials: AuthCredentials) {
    this.ws = new WebSocket(gameServerUrl);
    this.authenticate(credentials);
  }
  
  // 控制 AI
  async move(targetX: number, targetY: number) {
    return this.agent.moveTo(targetX, targetY);
  }
  
  async attack(targetId: string) {
    return this.agent.attack(targetId);
  }
  
  async gather(resourceId: string) {
    return this.agent.gather(resourceId);
  }
  
  async useSkill(skillId: number, targetId?: string) {
    return this.agent.useSkill(skillId, targetId);
  }
  
  // 获取状态
  getState(): GameState {
    return this.agent.getState();
  }
  
  getInventory(): Item[] {
    return this.agent.getInventory();
  }
}
```

### AI Agent

```typescript
// agent.ts
class AIAgent {
  private mode: AIBehaviorMode = 'Passive';
  private stateMachine: StateMachine;
  
  constructor(mode: AIBehaviorMode) {
    this.mode = mode;
    this.setupStateMachine();
  }
  
  // 状态机
  private setupStateMachine() {
    this.stateMachine = new StateMachine({
      Idle: {
        onEnter: this.onIdleEnter,
        transitions: {
          ENEMY_DETECTED: 'Combat',
          RESOURCE_DETECTED: 'Gathering',
          LOW_HEALTH: 'Flee'
        }
      },
      Combat: {
        onEnter: this.onCombatEnter,
        onUpdate: this.onCombatUpdate,
        transitions: {
          ENEMY_DEAD: 'Idle',
          LOW_HEALTH: 'Flee'
        }
      },
      Gathering: {
        onEnter: this.onGatheringEnter,
        transitions: {
          INVENTORY_FULL: 'Idle',
          ENEMY_DETECTED: 'Combat'
        }
      },
      Flee: {
        onEnter: this.onFleeEnter,
        transitions: {
          SAFE: 'Idle'
        }
      }
    });
  }
  
  // 行为模式
  setMode(mode: AIBehaviorMode) {
    this.mode = mode;
    // 根据模式调整行为优先级
  }
}
```

## 11.3 有限 API

### 开放 API 列表

| API | 功能 | 频率限制 |
|-----|------|----------|
| getState() | 获取游戏状态 | 10 次/秒 |
| move(x, y) | 移动到坐标 | 5 次/秒 |
| attack(targetId) | 攻击目标 | 5 次/秒 |
| gather(resourceId) | 采集资源 | 3 次/秒 |
| useSkill(id, target) | 使用技能 | 5 次/秒 |
| getInventory() | 获取背包 | 5 次/秒 |
| getNearbyEntities() | 获取附近实体 | 5 次/秒 |
| getMarketPrices() | 获取市场价格 | 1 次/秒 |

### 禁止 API

```typescript
// 禁止的操作
const FORBIDDEN_ACTIONS = [
  'automateChat',      // 自动聊天
  'botTrading',        // 脚本交易
  'exploitDetection',  // 漏洞探测
  'packetInjection',   // 数据包注入
  'speedHack',         // 加速挂
  'wallHack',          // 透视挂
];
```

## 11.4 平衡性设计

### AI vs 真人

| 方面 | AI 玩家 | 真人玩家 |
|------|--------|----------|
| 反应速度 | 200-1000ms | 100-300ms |
| 操作精度 | 90% | 95%+ |
| 收益倍率 | 0.8x | 1.0x |
| 连续在线 | 限制 4 小时 | 无限制 |
| 社交功能 | 禁用 | 完整 |
| PVP 优先级 | 低 | 正常 |

### 防滥用机制

```typescript
// 检测异常行为
class AntiAbuseSystem {
  // 检测脚本行为
  detectBotBehavior(playerId: string): boolean {
    const actions = this.getRecentActions(playerId);
    
    // 检测规律性操作
    if (this.isTooRegular(actions)) {
      return true;
    }
    
    // 检测超人类反应
    if (this.isSuperhumanReaction(actions)) {
      return true;
    }
    
    // 检测长时间在线
    if (this.isTooLongOnline(playerId)) {
      return true;
    }
    
    return false;
  }
  
  // 处罚
  applyPenalty(playerId: string, severity: 'warning' | 'kick' | 'ban') {
    switch (severity) {
      case 'warning':
        this.sendWarning(playerId);
        break;
      case 'kick':
        this.kickPlayer(playerId);
        break;
      case 'ban':
        this.banPlayer(playerId);
        break;
    }
  }
}
```

## 11.5 AI 使用场景

### 推荐场景

1. **新手引导** - AI 队友陪同新手
2. **单人内容** - AI 补充组队人数
3. **资源采集** - AI 辅助采集
4. **世界填充** - AI 让世界更热闹

### 禁止场景

1. **竞技场排名** - AI 不得参与排名
2. **领土战争** - AI 不得参与大规模 PVP
3. **稀有 BOSS** - AI 不得抢夺稀有 BOSS
4. **市场操纵** - AI 不得操纵市场价格

---

# 12. 技术实现

## 12.1 开发计划

### 阶段 1：核心框架（4 周）- 95% 完成

| 周次 | 任务 | 状态 |
|------|------|------|
| 1 | 客户端框架搭建 | ✅ |
| 2 | 服务端框架搭建 | ✅ |
| 3 | OpenClaw SDK | ✅ |
| 4 | 通信协议 + 文档 | ✅ |

### 阶段 2：核心玩法（6 周）

| 周次 | 任务 | 优先级 |
|------|------|--------|
| 5-6 | 战斗系统实现 | P0 |
| 7-8 | 背包系统实现 | P0 |
| 9-10 | 经济系统实现 | P0 |

### 阶段 3：多人联机（4 周）

| 周次 | 任务 | 优先级 |
|------|------|--------|
| 11-12 | 社交系统实现 | P1 |
| 13-14 | 公会系统实现 | P1 |

### 阶段 4：内容扩展（8 周）

| 周次 | 任务 | 优先级 |
|------|------|--------|
| 15-18 | 9 大区域地图 | P1 |
| 19-22 | 50+ 种怪物 | P1 |

### 阶段 5：OpenClaw 集成（4 周）

| 周次 | 任务 | 优先级 |
|------|------|--------|
| 23-26 | AI 玩家部署 | P2 |

### 阶段 6：测试优化（4 周）

| 周次 | 任务 | 优先级 |
|------|------|--------|
| 27-30 | 测试优化 + 公测 | P0 |

## 12.2 部署架构

```
┌─────────────────────────────────────────────────┐
│                  负载均衡器                      │
│                  (Nginx)                        │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ 游戏服 1│ │ 游戏服 2│ │ 游戏服 3│
   │ (Node) │ │ (Node) │ │ (Node) │
   └───┬────┘ └───┬────┘ └───┬────┘
       │           │           │
       └───────────┼───────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │PostgreSQL│ │ Redis  │ │ 文件存储│
   └────────┘ └────────┘ └────────┘
```

## 12.3 性能指标

### 客户端

| 指标 | 目标 | 可接受 |
|------|------|--------|
| FPS | 60 | 30+ |
| 加载时间 | <5s | <10s |
| 内存占用 | <500MB | <1GB |
| 同屏角色 | 50+ | 20+ |

### 服务端

| 指标 | 目标 | 可接受 |
|------|------|--------|
| 延迟 | <50ms | <100ms |
| 并发连接 | 10000+ | 5000+ |
| 消息处理 | <10ms | <50ms |
| 数据库查询 | <20ms | <100ms |

## 12.4 监控与日志

### 关键指标监控

```typescript
// 监控指标
const metrics = {
  // 在线玩家
  onlinePlayers: number,
  
  // 服务器负载
  serverLoad: number,
  
  // 消息延迟
  messageLatency: number,
  
  // 数据库性能
  dbQueryTime: number,
  
  // 错误率
  errorRate: number,
};

// 告警阈值
const alerts = {
  onlinePlayers: { min: 0, max: 15000 },
  serverLoad: { max: 80 },
  messageLatency: { max: 200 },
  errorRate: { max: 1 },
};
```

### 日志系统

```typescript
// 日志级别
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 日志内容
interface GameLog {
  timestamp: Date;
  level: LogLevel;
  playerId?: string;
  action: string;
  details: object;
}

// 审计日志
interface AuditLog {
  timestamp: Date;
  playerId: string;
  action: string;
  before: object;
  after: object;
  ip: string;
}
```

---

# 📝 附录

## A. 术语表

| 术语 | 解释 |
|------|------|
| PVP | Player vs Player，玩家对战 |
| PVE | Player vs Environment，玩家对环境 |
| BOSS | 强大的怪物首领 |
| BUFF | 增益效果 |
| DEBUFF | 减益效果 |
| DPS | Damage Per Second，每秒伤害 |
| T | Tank，坦克 |
| AOE | Area of Effect，范围效果 |
| CD | Cooldown，技能冷却 |
| DOT | Damage over Time，持续伤害 |

## B. 配置示例

### 服务器配置

```env
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@localhost:5432/hululands"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
WS_HEARTBEAT_INTERVAL=10000
WS_HEARTBEAT_TIMEOUT=30000
```

### 客户端配置

```typescript
// config.ts
export const CONFIG = {
  API_URL: 'https://api.hululands.com',
  WS_URL: 'wss://ws.hululands.com',
  CDN_URL: 'https://cdn.hululands.com',
  VERSION: '1.0.0',
  DEBUG: false,
};
```

## C. 参考资料

1. 阿尔比恩 Online 深度分析报告（8 文档）
2. 完整游戏设计文档 `game-design-doc-full.md`
3. 美术资源需求文档 `art-requirements.md`
4. 快速启动指南 `QUICKSTART.md`

---

**文档版本：** 1.0  
**最后更新：** 2026-03-11  
**作者：** 波波 & 阿米大王  
**状态：** 完成

---

_《呼噜大陆完整游戏设计文档》_

_本设计参考阿尔比恩 Online 核心玩法，结合 H5 技术特点优化_

_版权所有，请勿外传_
