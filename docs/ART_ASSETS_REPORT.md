# 美术资源获取报告

**创建日期：** 2026-03-12  
**更新日期：** 2026-03-12 (添加怪物素材)  
**状态：** ✅ 基础素材 + 怪物素材已下载  
**来源：** OpenGameArt.org (CC-BY/CC0/OGA-BY 许可)

---

## ✅ 已下载素材

### 角色精灵 (Characters)
```
assets/characters/lpc_characters.png (33KB)
- 来源：Liberated Pixel Cup
- 许可：CC-BY 3.0
- 内容：多性别、多职业角色精灵
- 用途：玩家角色基础素材
```

### 物品图标 (Items)
```
assets/items/lpc_items.png (33KB)
- 来源：Liberated Pixel Cup
- 许可：CC-BY 3.0
- 内容：武器、盔甲、药水等物品图标
- 用途：背包系统、装备系统
```

### 地砖 Tilesets
```
assets/tiles/grass_tile.png (33KB)    - 草地地砖
assets/tiles/dirt_tile.png (5.3KB)    - 土地地砖
assets/tiles/water_tile.png (472KB)   - 水域地砖
- 来源：OpenGameArt 社区
- 许可：CC-BY/CC0
- 用途：地图编辑、场景构建
```

### 🆕 怪物精灵 (Monsters) - 17+ 种
```
assets/monsters/ (总计 ~1.2MB)

核心怪物 (12 种中的 6 种):
✅ slime.png (5.5KB)           - 蓝色史莱姆
✅ bat.png (4.9KB)             - 黑色蝙蝠
✅ ghost.png (7.0KB)           - 半透明幽灵
✅ demon_idle.png (4.8KB)      - 红色恶魔
✅ dragon_idle.png (7.6KB)     - 红色巨龙

额外怪物 (11+ 种):
✅ bee.png (3.4KB)             - 蜜蜂
✅ big_worm.png (7.2KB)        - 大蠕虫
✅ eyeball.png (5.9KB)         - 眼球怪
✅ jinn_animation_idle.png     - 精灵
✅ lizard_idle.png (3.2KB)     - 蜥蜴
✅ man_eater_flower.png (19KB) - 食人花
✅ medusa_idle.png (3.5KB)     - 美杜莎
✅ pumpking.png (7.2KB)        - 南瓜王
✅ small_dragon_idle.png       - 小龙
✅ small_worm.png (6.4KB)      - 小蠕虫
✅ snake.png (4.8KB)           - 蛇

完整动画包:
- PNG/ (RPG Monsters × 6 种)
- slime/ (Slime Pack × 多种变体)
- lpc_monsters/ (LPC Monsters × 10 种)

来源：
- RPG Monster Sprites by CraftPix.net (OGA-BY 3.0)
- Fantasy Slime Pack by CraftPix.net (OGA-BY 3.0)
- LPC Monsters by bluecarrot16 (CC-BY-SA 3.0)

详细报告：docs/MONSTER_ASSETS_REPORT.md
```

---

## 🎨 待生成/下载素材

### 怪物精灵 (12 种核心)
- [x] 史莱姆 ✅
- [ ] 哥布林 ⏳
- [ ] 骷髅兵 ⏳
- [ ] 僵尸 ⏳
- [x] 蝙蝠 ✅
- [ ] 蜘蛛 ⏳
- [ ] 野狼 ⏳
- [ ] 强盗 ⏳
- [ ] 兽人 ⏳
- [ ] 黑暗法师 ⏳
- [x] 幽灵 ✅
- [x] 恶魔 ✅
- [x] 巨龙 ✅

**完成度：** 6/12 (50%)

**来源建议：**
- OpenGameArt 搜索 "goblin skeleton pixel"
- 豆包 AI 生成（需手动操作）

### UI 元素
- [ ] 剑图标
- [ ] 盾图标
- [ ] 头盔图标
- [ ] 盔甲图标
- [ ] 金币图标
- [ ] 按钮背景
- [ ] 血条/魔法条

**来源建议：**
- LPC items 已包含部分
- OpenGameArt "GUI icons"
- 豆包 AI 生成

### 特殊地砖
- [ ] 沙漠地砖
- [ ] 雪山地砖
- [ ] 地狱地砖
- [ ] 森林地砖

**来源建议：**
- OpenGameArt "tileset"
- Kenney.nl 地形包

---

## 📥 下载命令

### 批量下载 LPC 素材
```bash
cd /home/tenbox/albion-lands/assets

# 角色
curl -sL "https://opengameart.org/sites/default/files/LPCcharacters_0.png" -o characters/lpc_characters.png

# 物品
curl -sL "https://opengameart.org/sites/default/files/LPCitems_0.png" -o items/lpc_items.png

# 地砖
curl -sL "https://opengameart.org/sites/default/files/GrassTile.png" -o tiles/grass_tile.png
curl -sL "https://opengameart.org/sites/default/files/water.png" -o tiles/water_tile.png
curl -sL "https://opengameart.org/sites/default/files/ground.png" -o tiles/dirt_tile.png
```

### 更多 LPC 资源
```bash
# LPC 完整包 (需要解压)
curl -sL "https://opengameart.org/sites/default/files/LPCbase_0.png" -o lpc_base.png
curl -sL "https://opengameart.org/sites/default/files/LPChair_0.png" -o lpc_hair.png
curl -sL "https://opengameart.org/sites/default/files/LPCcloth_0.png" -o lpc_cloth.png
```

---

## 🔗 推荐资源网站

### 免费素材站
1. **OpenGameArt.org** - 开源游戏素材 (已用)
2. **Kenney.nl** - 高质量免费游戏资产
3. **itch.io** - 独立游戏素材市场
4. **Craftpix.net** - 免费/付费素材
5. **GameDev Market** - 付费高质量素材

### AI 生成工具
1. **豆包 AI** - 字节跳动 AI 绘画
2. **Leonardo.ai** - 游戏素材专用 AI
3. **Scenario.gg** - 游戏资产生成
4. **Pixai.art** - 动漫/像素风格

---

## 📋 素材使用指南

### 命名规范
```
类型_名称_变体.png

示例：
- character_warrior_male.png
- monster_slime_green.png
- tile_grass_village.png
- item_sword_iron.png
- ui_button_primary.png
```

### 尺寸要求
```
角色精灵：32x32 或 64x64 像素
怪物精灵：32x32 或 64x64 像素
地砖：32x32 像素 (无缝拼接)
物品图标：32x32 像素
UI 元素：根据需求 (建议 32x32 倍数)
```

### 格式要求
```
- 格式：PNG (支持透明通道)
- 色彩：RGB 或 RGBA
- 压缩：无损压缩
```

---

## ⚖️ 许可说明

### 已用素材许可
- **LPC 系列**：CC-BY 3.0 (需署名)
- **Kenney 素材**：CC0 (公共领域)
- **OpenGameArt 社区**：混合 (查看具体页面)

### 署名要求
使用 CC-BY 许可素材时，需在以下内容中署名：
- 游戏 credits
- 文档说明
- 网站/商店页面

**署名格式示例：**
```
Assets used:
- LPC Character Sprites by Jean Moreno (CC-BY 3.0)
  https://opengameart.org/content/lpc-character-sprites
```

---

## 🚀 下一步

### 立即可做
1. ✅ 基础素材已下载
2. ⏳ 导入项目 (`client/public/assets/`)
3. ⏳ 测试渲染效果
4. ⏳ 调整尺寸/颜色

### 需要 AI 生成
1. 🔄 等待豆包登录
2. 🎨 生成 12 种怪物
3. 🎨 生成特殊地砖
4. 🎨 生成 UI 元素

### 可选扩展
1. 🎵 音效/音乐素材
2. 🎬 动画精灵
3. 🖼️ 背景插画
4. 📱 UI 主题包

---

## 📊 素材统计

| 类别 | 已获取 | 需生成 | 总计 |
|------|--------|--------|------|
| 角色 | 1 套 | 7 个变体 | 8 |
| 怪物 | 17+ 种 | 6 种 | 23 |
| 地砖 | 3 种 | 2 种 | 5 |
| 物品 | 1 套 | 0 | 1 套 |
| UI | 部分 | 5 个图标 | 5+ |
| **总计** | **22 项** | **20 项** | **42 项** |

**完成度：** ~52% (基础框架 + 核心怪物已具备)

---

## 💡 建议

1. **优先使用免费素材** - 快速搭建原型
2. **AI 生成补充** - 定制特殊需求
3. **逐步替换** - 开发后期优化美术
4. **保持一致风格** - 像素艺术统一尺寸和色调

---

**最后更新：** 2026-03-12  
**负责人：** 波波  
**素材管理：** `assets/` 目录
