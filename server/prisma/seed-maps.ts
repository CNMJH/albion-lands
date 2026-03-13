import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 种子数据：游戏地图配置
 */
async function seedMaps() {
  console.log('🗺️  开始创建地图数据...')

  const maps = [
    {
      id: 'starter_city',
      name: 'Starter City',
      displayName: '初始城市',
      description: '新手玩家的庇护所，绝对安全区域',
      safetyLevel: 10,
      type: 'city',
      minLevel: 1,
      maxLevel: 100,
      width: 2000,
      height: 2000,
      bgm: 'city_theme.ogg',
      tileTexture: 'tiles/city_floor.png',
      resources: JSON.stringify([
        { type: 'water_well', x: 500, y: 500, respawnTime: 300 },
        { type: 'food_vendor', x: 800, y: 600, respawnTime: 600 }
      ]),
      monsters: JSON.stringify([]), // 安全区无怪物
      npcs: JSON.stringify([
        { npcId: 'guard_001', x: 400, y: 400, type: 'guard' },
        { npcId: 'merchant_001', x: 800, y: 600, type: 'merchant' },
        { npcId: 'quest_giver_001', x: 600, y: 700, type: 'quest_giver' }
      ]),
      portals: JSON.stringify([
        { targetMapId: 'green_zone_1', x: 1800, y: 1000, name: '前往绿色区域' }
      ])
    },
    {
      id: 'green_zone_1',
      name: 'Green Zone 1',
      displayName: '绿色平原',
      description: '适合 1-10 级玩家的练级区域',
      safetyLevel: 8,
      type: 'open_world',
      minLevel: 1,
      maxLevel: 10,
      width: 3000,
      height: 3000,
      bgm: 'field_theme.ogg',
      tileTexture: 'tiles/grass.png',
      resources: JSON.stringify([
        { type: 'herb', x: 1000, y: 1000, respawnTime: 180 },
        { type: 'ore_node', x: 1500, y: 800, respawnTime: 300 },
        { type: 'wood', x: 2000, y: 1200, respawnTime: 120 }
      ]),
      monsters: JSON.stringify([
        { monsterId: 'slime', minLevel: 1, maxLevel: 3, spawnRate: 0.3 },
        { monsterId: 'wolf', minLevel: 3, maxLevel: 5, spawnRate: 0.2 },
        { monsterId: 'bear', minLevel: 5, maxLevel: 8, spawnRate: 0.1 }
      ]),
      npcs: JSON.stringify([
        { npcId: 'guard_002', x: 500, y: 500, type: 'guard' },
        { npcId: 'quest_giver_002', x: 1000, y: 1000, type: 'quest_giver' }
      ]),
      portals: JSON.stringify([
        { targetMapId: 'starter_city', x: 200, y: 200, name: '返回初始城市' },
        { targetMapId: 'yellow_zone_1', x: 2800, y: 1500, name: '前往黄色区域' }
      ])
    },
    {
      id: 'yellow_zone_1',
      name: 'Yellow Zone 1',
      displayName: '黄色荒地',
      description: '中等危险区域，掉落非装备物品',
      safetyLevel: 4,
      type: 'open_world',
      minLevel: 10,
      maxLevel: 30,
      width: 4000,
      height: 4000,
      bgm: 'danger_theme.ogg',
      tileTexture: 'tiles/desert.png',
      resources: JSON.stringify([
        { type: 'rare_herb', x: 2000, y: 2000, respawnTime: 300 },
        { type: 'gold_ore', x: 3000, y: 1500, respawnTime: 600 },
        { type: 'ancient_wood', x: 1500, y: 3000, respawnTime: 450 }
      ]),
      monsters: JSON.stringify([
        { monsterId: 'bandit', minLevel: 10, maxLevel: 15, spawnRate: 0.25 },
        { monsterId: 'scorpion', minLevel: 12, maxLevel: 18, spawnRate: 0.2 },
        { monsterId: 'desert_worm', minLevel: 15, maxLevel: 22, spawnRate: 0.15 },
        { monsterId: 'sand_golem', minLevel: 20, maxLevel: 28, spawnRate: 0.08 }
      ]),
      npcs: JSON.stringify([
        { npcId: 'merchant_002', x: 1000, y: 1000, type: 'merchant' },
        { npcId: 'quest_giver_003', x: 2000, y: 2000, type: 'quest_giver' }
      ]),
      portals: JSON.stringify([
        { targetMapId: 'green_zone_1', x: 200, y: 2000, name: '返回绿色区域' },
        { targetMapId: 'red_zone_1', x: 3800, y: 2000, name: '前往红色区域' }
      ])
    },
    {
      id: 'red_zone_1',
      name: 'Red Zone 1',
      displayName: '红色峡谷',
      description: '高危区域，PVP 允许，掉落装备',
      safetyLevel: 2,
      type: 'open_world',
      minLevel: 30,
      maxLevel: 60,
      width: 5000,
      height: 5000,
      bgm: 'battle_theme.ogg',
      tileTexture: 'tiles/canyon.png',
      resources: JSON.stringify([
        { type: 'titanium_ore', x: 3000, y: 3000, respawnTime: 900 },
        { type: 'crystal', x: 2500, y: 2000, respawnTime: 600 },
        { type: 'magic_wood', x: 4000, y: 3500, respawnTime: 750 }
      ]),
      monsters: JSON.stringify([
        { monsterId: 'elite_bandit', minLevel: 30, maxLevel: 40, spawnRate: 0.2 },
        { monsterId: 'dragon_whelp', minLevel: 35, maxLevel: 45, spawnRate: 0.15 },
        { monsterId: 'rock_golem', minLevel: 40, maxLevel: 50, spawnRate: 0.1 },
        { monsterId: 'phoenix', minLevel: 50, maxLevel: 60, spawnRate: 0.03 }
      ]),
      npcs: JSON.stringify([
        { npcId: 'black_market_001', x: 2000, y: 2000, type: 'black_market' }
      ]),
      portals: JSON.stringify([
        { targetMapId: 'yellow_zone_1', x: 200, y: 2500, name: '返回黄色区域' },
        { targetMapId: 'black_zone_1', x: 4800, y: 2500, name: '前往黑色区域' }
      ])
    },
    {
      id: 'black_zone_1',
      name: 'Black Zone 1',
      displayName: '黑色深渊',
      description: '死亡区域，极度危险，高价值掉落',
      safetyLevel: 0,
      type: 'open_world',
      minLevel: 60,
      maxLevel: 100,
      width: 6000,
      height: 6000,
      bgm: 'epic_battle_theme.ogg',
      tileTexture: 'tiles/volcano.png',
      resources: JSON.stringify([
        { type: 'adamantite_ore', x: 4000, y: 4000, respawnTime: 1800 },
        { type: 'dragon_crystal', x: 3000, y: 3000, respawnTime: 3600 },
        { type: 'ancient_relic', x: 5000, y: 5000, respawnTime: 7200 }
      ]),
      monsters: JSON.stringify([
        { monsterId: 'demon', minLevel: 60, maxLevel: 70, spawnRate: 0.15 },
        { monsterId: 'dragon', minLevel: 70, maxLevel: 85, spawnRate: 0.08 },
        { monsterId: 'ancient_dragon', minLevel: 85, maxLevel: 100, spawnRate: 0.02 },
        { monsterId: 'world_boss', minLevel: 100, maxLevel: 100, spawnRate: 0.001 }
      ]),
      npcs: JSON.stringify([]),
      portals: JSON.stringify([
        { targetMapId: 'red_zone_1', x: 200, y: 3000, name: '返回红色区域' }
      ])
    }
  ]

  for (const mapData of maps) {
    await prisma.gameMap.upsert({
      where: { id: mapData.id },
      update: mapData,
      create: mapData
    })
    console.log(`  ✅ 创建地图：${mapData.displayName}`)
  }

  console.log('🗺️  地图数据创建完成！')
}

export default seedMaps
