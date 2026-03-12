# 美术资源生成指南

**创建日期：** 2026-03-12  
**状态：** 🚧 需要手动登录

---

## 📸 当前状态

浏览器已打开豆包 AI 页面，但需要**手动登录**才能生成图片。

**截图位置：** `docs/doubao-login-needed.png`

---

## 🔐 登录步骤

1. **在浏览器中完成登录**
   - 使用手机号或微信扫码登录
   - 完成验证码验证（如果有）

2. **登录后继续生成**

---

## 🎨 需要生成的资源清单

### 1. 玩家角色（8 个）

| 角色 | 提示词 |
|------|--------|
| 男性战士 | `2D pixel art game sprite, male warrior, front view, standing pose, medieval armor, sword and shield, white background, 32x32 pixel style` |
| 女性战士 | `2D pixel art game sprite, female warrior, front view, standing pose, medieval armor, sword and shield, white background, 32x32 pixel style` |
| 男性法师 | `2D pixel art game sprite, male mage, front view, standing pose, blue robe, magic staff, white background, 32x32 pixel style` |
| 女性法师 | `2D pixel art game sprite, female mage, front view, standing pose, purple robe, magic staff, white background, 32x32 pixel style` |
| 男性弓箭手 | `2D pixel art game sprite, male archer, front view, standing pose, leather armor, bow and arrows, white background, 32x32 pixel style` |
| 女性弓箭手 | `2D pixel art game sprite, female archer, front view, standing pose, green leather armor, bow, white background, 32x32 pixel style` |
| 男性工匠 | `2D pixel art game sprite, male craftsman, front view, standing pose, apron, hammer, white background, 32x32 pixel style` |
| 女性工匠 | `2D pixel art game sprite, female craftsman, front view, standing pose, apron, tools, white background, 32x32 pixel style` |

### 2. 怪物（12 种）

| 怪物 | 提示词 |
|------|--------|
| 史莱姆 | `2D pixel art game sprite, green slime monster, cute, blob shape, simple face, white background, 32x32 pixel style` |
| 哥布林 | `2D pixel art game sprite, goblin, small green humanoid, pointy ears, club weapon, white background, 32x32 pixel style` |
| 骷髅兵 | `2D pixel art game sprite, skeleton warrior, bones, sword and shield, white background, 32x32 pixel style` |
| 僵尸 | `2D pixel art game sprite, zombie, undead, tattered clothes, green skin, white background, 32x32 pixel style` |
| 蝙蝠 | `2D pixel art game sprite, bat, flying, wings spread, dark purple, white background, 32x32 pixel style` |
| 蜘蛛 | `2D pixel art game sprite, giant spider, 8 legs, black and red, white background, 32x32 pixel style` |
| 野狼 | `2D pixel art game sprite, wolf, gray fur, standing pose, white background, 32x32 pixel style` |
| 强盗 | `2D pixel art game sprite, bandit, human, mask, dagger, dark clothes, white background, 32x32 pixel style` |
| 兽人 | `2D pixel art game sprite, orc, large green humanoid, axe, muscular, white background, 32x32 pixel style` |
| 黑暗法师 | `2D pixel art game sprite, dark mage, black robe, hood, magic staff, glowing eyes, white background, 32x32 pixel style` |
| 幽灵 | `2D pixel art game sprite, ghost, translucent, floating, white and blue, white background, 32x32 pixel style` |
| 恶魔 | `2D pixel art game sprite, demon, red skin, horns, wings, trident, white background, 32x32 pixel style` |

### 3. 场景地砖（5 个区域）

| 区域 | 提示词 |
|------|--------|
| 村庄草地 | `2D pixel art game tile, grass terrain, green grass with flowers, seamless tile, top down view, 32x32 pixel style` |
| 森林 | `2D pixel art game tile, forest floor, dark green grass with leaves, seamless tile, top down view, 32x32 pixel style` |
| 沙漠 | `2D pixel art game tile, desert sand, yellow sand dunes, seamless tile, top down view, 32x32 pixel style` |
| 雪山 | `2D pixel art game tile, snow terrain, white snow with ice, seamless tile, top down view, 32x32 pixel style` |
| 地狱 | `2D pixel art game tile, lava terrain, dark red with glowing lava cracks, seamless tile, top down view, 32x32 pixel style` |

### 4. 资源物品图标（10 个）

| 物品 | 提示词 |
|------|--------|
| 铜矿石 | `2D pixel art game icon, copper ore, brown rock with copper veins, white background, 32x32 pixel style` |
| 铁矿石 | `2D pixel art game icon, iron ore, gray rock with silver veins, white background, 32x32 pixel style` |
| 金矿石 | `2D pixel art game icon, gold ore, yellow rock with gold veins, white background, 32x32 pixel style` |
| 木材 | `2D pixel art game icon, wood log, brown tree trunk, white background, 32x32 pixel style` |
| 草药 | `2D pixel art game icon, herb, green plant with leaves, white background, 32x32 pixel style` |
| 鱼 | `2D pixel art game icon, fish, silver fish, white background, 32x32 pixel style` |
| 兽皮 | `2D pixel art game icon, leather, brown hide, white background, 32x32 pixel style` |
| 生命药水 | `2D pixel art game icon, health potion, red bottle with cork, white background, 32x32 pixel style` |
| 魔法药水 | `2D pixel art game icon, mana potion, blue bottle with cork, white background, 32x32 pixel style` |
| 面包 | `2D pixel art game icon, bread, loaf of bread, white background, 32x32 pixel style` |

### 5. UI 元素

| 元素 | 提示词 |
|------|--------|
| 剑图标 | `2D pixel art game icon, sword weapon, silver blade with brown hilt, white background, 32x32 pixel style` |
| 盾图标 | `2D pixel art game icon, shield, metal shield with cross emblem, white background, 32x32 pixel style` |
| 头盔图标 | `2D pixel art game icon, helmet, metal knight helmet, white background, 32x32 pixel style` |
| 盔甲图标 | `2D pixel art game icon, chest armor, metal plate armor, white background, 32x32 pixel style` |
| 金币图标 | `2D pixel art game icon, gold coin, circular gold coin with dollar sign, white background, 32x32 pixel style` |

---

## 📁 资源保存位置

生成的图片应保存到：
```
/home/tenbox/albion-lands/assets/
├── characters/     # 玩家角色
├── monsters/       # 怪物
├── tiles/          # 地地图块
├── items/          # 物品图标
└── ui/             # UI 元素
```

---

## 🛠️ 后续处理

生成图片后需要：

1. **批量重命名** - 使用统一命名规范
   - 角色：`character_warrior_male.png`
   - 怪物：`monster_slime.png`
   - 地砖：`tile_grass_village.png`
   - 物品：`item_copper_ore.png`

2. **背景移除** - 使用工具移除白色背景（如需透明）

3. **尺寸统一** - 确保所有精灵为 32x32 或 64x64 像素

4. **导入项目** - 复制到 `client/public/assets/` 目录

---

## 🔄 替代方案

如果豆包 AI 生成效果不理想，可尝试：

1. **Leonardo.ai** - 专门的游戏素材生成
2. **Scenario.gg** - AI 游戏资产生成
3. **Stable Diffusion** - 本地部署，使用像素艺术 LoRA
4. **OpenGameArt.org** - 免费开源游戏素材
5. **itch.io 素材包** - 付费高质量像素素材

---

**下一步：** 用户手动登录豆包 AI 后继续生成
