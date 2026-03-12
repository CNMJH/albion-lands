import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 任务系统初始数据种子
 * 创建示例 NPC、任务和成就
 */
async function main() {
  console.log('🌱 开始创建任务系统初始数据...');

  // ============================================
  // 创建 NPC
  // ============================================
  console.log('📍 创建 NPC...');

  const npc1 = await prisma.nPC.create({
    data: {
      id: 'npc_village_elder',
      name: '村长爷爷',
      type: 'quest',
      zoneId: 'zone_1',
      x: 100,
      y: 100,
      dialogue: JSON.stringify({
        greeting: [
          '欢迎来到呼噜村，年轻的冒险者！',
          '村里最近有些麻烦，能帮帮我吗？',
        ],
        farewell: [
          '一路平安！',
          '记得常回来看看！',
        ],
      }),
    },
  });

  const npc2 = await prisma.nPC.create({
    data: {
      id: 'npc_hunter',
      name: '猎人杰克',
      type: 'quest',
      zoneId: 'zone_1',
      x: 150,
      y: 120,
      dialogue: JSON.stringify({
        greeting: [
          '嘿！想学打猎吗？',
          '外面的世界很危险，但要小心！',
        ],
        farewell: [
          '狩猎愉快！',
          '别被野兽吃了！',
        ],
      }),
    },
  });

  const npc3 = await prisma.nPC.create({
    data: {
      id: 'npc_merchant',
      name: '商人莉莉',
      type: 'merchant',
      zoneId: 'zone_1',
      x: 120,
      y: 80,
      dialogue: JSON.stringify({
        greeting: [
          '来看看我的商品吧！',
          '物美价廉，童叟无欺！',
        ],
        farewell: [
          '欢迎下次光临！',
          '赚大钱哦！',
        ],
      }),
    },
  });

  const npc4 = await prisma.nPC.create({
    data: {
      id: 'npc_blacksmith',
      name: '铁匠老王',
      type: 'service',
      zoneId: 'zone_1',
      x: 80,
      y: 90,
      dialogue: JSON.stringify({
        greeting: [
          '需要修理装备吗？',
          '我的手艺可是村里最好的！',
        ],
        farewell: [
          '装备坏了再来找我！',
          '打铁声就是我的音乐！',
        ],
      }),
    },
  });

  // ============================================
  // 创建任务
  // ============================================
  console.log('📜 创建任务...');

  // 新手引导任务 1
  const quest1 = await prisma.quest.create({
    data: {
      id: 'quest_welcome',
      name: '欢迎来到呼噜村',
      description: '与村长对话，了解村庄的基本情况',
      type: 'main',
      level: 1,
      difficulty: 'easy',
      category: 'main_story',
      objectives: JSON.stringify([
        { type: 'talk', targetId: 'npc_village_elder', count: 1 },
      ]),
      expReward: 50,
      silverReward: 20,
      goldReward: 0,
      itemRewards: JSON.stringify([]),
      isRepeatable: false,
      giverId: 'npc_village_elder',
      receiverId: 'npc_village_elder',
    },
  });

  // 新手引导任务 2 - 采集
  const quest2 = await prisma.quest.create({
    data: {
      id: 'quest_first_gather',
      name: '第一次采集',
      description: '采集 5 个铜矿，学习基础采集技能',
      type: 'main',
      level: 1,
      difficulty: 'easy',
      category: 'gathering',
      objectives: JSON.stringify([
        { type: 'collect', targetId: 'copper_ore', count: 5 },
      ]),
      expReward: 100,
      silverReward: 50,
      goldReward: 0,
      itemRewards: JSON.stringify([{ itemId: 'item_pickaxe_t1', quantity: 1 }]),
      isRepeatable: false,
      prerequisites: JSON.stringify(['quest_welcome']),
      giverId: 'npc_village_elder',
      receiverId: 'npc_village_elder',
    },
  });

  // 战斗任务 - 讨伐史莱姆
  const quest3 = await prisma.quest.create({
    data: {
      id: 'quest_slime_hunt',
      name: '史莱姆讨伐战',
      description: '消灭 10 只史莱姆，保护村庄安全',
      type: 'main',
      level: 2,
      difficulty: 'easy',
      category: 'combat',
      objectives: JSON.stringify([
        { type: 'kill', targetId: 'monster_slime_green', count: 10 },
      ]),
      expReward: 150,
      silverReward: 80,
      goldReward: 0,
      itemRewards: JSON.stringify([{ itemId: 'item_sword_t1', quantity: 1 }]),
      isRepeatable: false,
      prerequisites: JSON.stringify(['quest_first_gather']),
      giverId: 'npc_hunter',
      receiverId: 'npc_hunter',
    },
  });

  // 战斗任务 - 讨伐野兔
  const quest4 = await prisma.quest.create({
    data: {
      id: 'quest_rabbit_hunt',
      name: '兔肉大餐',
      description: '猎杀 8 只野兔，为村民提供食物',
      type: 'side',
      level: 3,
      difficulty: 'easy',
      category: 'combat',
      objectives: JSON.stringify([
        { type: 'kill', targetId: 'monster_rabbit', count: 8 },
      ]),
      expReward: 120,
      silverReward: 60,
      goldReward: 0,
      itemRewards: JSON.stringify([{ itemId: 'item_meat', quantity: 5 }]),
      isRepeatable: true,
      repeatCooldown: 86400, // 24 小时
      giverId: 'npc_hunter',
      receiverId: 'npc_hunter',
    },
  });

  // 采集任务 - 木材收集
  const quest5 = await prisma.quest.create({
    data: {
      id: 'quest_wood_gather',
      name: '木材收集',
      description: '收集 10 个橡木，用于村庄建设',
      type: 'side',
      level: 2,
      difficulty: 'easy',
      category: 'gathering',
      objectives: JSON.stringify([
        { type: 'collect', targetId: 'oak_wood', count: 10 },
      ]),
      expReward: 100,
      silverReward: 50,
      goldReward: 0,
      itemRewards: JSON.stringify([]),
      isRepeatable: true,
      repeatCooldown: 43200, // 12 小时
      giverId: 'npc_village_elder',
      receiverId: 'npc_village_elder',
    },
  });

  // 递送任务
  const quest6 = await prisma.quest.create({
    data: {
      id: 'quest_delivery',
      name: '送货任务',
      description: '将工具送给铁匠老王',
      type: 'side',
      level: 1,
      difficulty: 'easy',
      category: 'delivery',
      objectives: JSON.stringify([
        { type: 'deliver', targetId: 'npc_blacksmith', count: 1 },
      ]),
      expReward: 80,
      silverReward: 40,
      goldReward: 0,
      itemRewards: JSON.stringify([]),
      isRepeatable: true,
      repeatCooldown: 21600, // 6 小时
      giverId: 'npc_merchant',
      receiverId: 'npc_blacksmith',
    },
  });

  // 高级任务 - 哥布林讨伐
  const quest7 = await prisma.quest.create({
    data: {
      id: 'quest_goblin_hunt',
      name: '哥布林威胁',
      description: '消灭 5 只哥布林，消除村庄威胁',
      type: 'main',
      level: 5,
      difficulty: 'normal',
      category: 'combat',
      objectives: JSON.stringify([
        { type: 'kill', targetId: 'monster_goblin', count: 5 },
      ]),
      expReward: 300,
      silverReward: 150,
      goldReward: 5,
      itemRewards: JSON.stringify([{ itemId: 'item_armor_t2', quantity: 1 }]),
      isRepeatable: false,
      prerequisites: JSON.stringify(['quest_slime_hunt']),
      giverId: 'npc_village_elder',
      receiverId: 'npc_village_elder',
    },
  });

  console.log(`✅ 创建了 ${await prisma.quest.count()} 个任务`);

  // ============================================
  // 创建 NPC-任务关联
  // ============================================
  console.log('🔗 创建 NPC-任务关联...');

  await prisma.nPCQuest.createMany({
    data: [
      { npcId: 'npc_village_elder', questId: 'quest_welcome', type: 'both' },
      { npcId: 'npc_village_elder', questId: 'quest_first_gather', type: 'both' },
      { npcId: 'npc_hunter', questId: 'quest_slime_hunt', type: 'both' },
      { npcId: 'npc_hunter', questId: 'quest_rabbit_hunt', type: 'both' },
      { npcId: 'npc_village_elder', questId: 'quest_wood_gather', type: 'both' },
      { npcId: 'npc_merchant', questId: 'quest_delivery', type: 'give' },
      { npcId: 'npc_blacksmith', questId: 'quest_delivery', type: 'receive' },
      { npcId: 'npc_village_elder', questId: 'quest_goblin_hunt', type: 'both' },
    ],
  });

  // ============================================
  // 创建每日任务
  // ============================================
  console.log('📅 创建每日任务...');

  await prisma.dailyQuest.createMany({
    data: [
      {
        id: 'daily_slime',
        questId: 'quest_slime_hunt',
        name: '每日：史莱姆讨伐',
        description: '每天消灭 5 只史莱姆',
        type: 'daily',
        pool: 'combat_daily',
        refreshTime: '00:00',
        expReward: 100,
        silverReward: 50,
        goldReward: 2,
        maxPerDay: 1,
      },
      {
        id: 'daily_gather',
        questId: 'quest_first_gather',
        name: '每日：采集练习',
        description: '每天采集 3 个矿石',
        type: 'daily',
        pool: 'gathering_daily',
        refreshTime: '00:00',
        expReward: 80,
        silverReward: 40,
        goldReward: 1,
        maxPerDay: 1,
      },
    ],
  });

  // ============================================
  // 创建成就
  // ============================================
  console.log('🏆 创建成就...');

  // 战斗成就
  await prisma.achievement.create({
    data: {
      id: 'ach_first_blood',
      name: '第一滴血',
      description: '首次击败怪物',
      category: 'combat',
      type: 'kill',
      targetType: 'monster',
      targetCount: 1,
      expReward: 50,
      silverReward: 20,
      goldReward: 0,
      title: '新手猎手',
      badge: 'badge_first_blood',
      isHidden: false,
    },
  });

  await prisma.achievement.create({
    data: {
      id: 'ach_slime_slayer',
      name: '史莱姆杀手',
      description: '击败 100 只史莱姆',
      category: 'combat',
      type: 'kill',
      targetType: 'monster_slime_green',
      targetCount: 100,
      expReward: 500,
      silverReward: 200,
      goldReward: 10,
      title: '史莱姆克星',
      badge: 'badge_slime_slayer',
      isHidden: false,
    },
  });

  await prisma.achievement.create({
    data: {
      id: 'ach_monster_hunter',
      name: '怪物猎人',
      description: '累计击败 1000 只怪物',
      category: 'combat',
      type: 'kill',
      targetType: 'any',
      targetCount: 1000,
      expReward: 2000,
      silverReward: 1000,
      goldReward: 50,
      title: '传奇猎人',
      badge: 'badge_monster_hunter',
      isHidden: false,
    },
  });

  // 采集成就
  await prisma.achievement.create({
    data: {
      id: 'ach_first_mine',
      name: '第一铲',
      description: '首次采集矿石',
      category: 'gathering',
      type: 'collect',
      targetType: 'ore',
      targetCount: 1,
      expReward: 30,
      silverReward: 10,
      goldReward: 0,
      title: '矿工学徒',
      badge: 'badge_first_mine',
      isHidden: false,
    },
  });

  await prisma.achievement.create({
    data: {
      id: 'ach_rich_miner',
      name: '富矿猎人',
      description: '累计采集 500 个矿石',
      category: 'gathering',
      type: 'collect',
      targetType: 'ore',
      targetCount: 500,
      expReward: 1000,
      silverReward: 500,
      goldReward: 25,
      title: '矿业大亨',
      badge: 'badge_rich_miner',
      isHidden: false,
    },
  });

  // 等级成就
  await prisma.achievement.create({
    data: {
      id: 'ach_level_10',
      name: '初出茅庐',
      description: '角色达到 10 级',
      category: 'exploration',
      type: 'reach_level',
      targetType: 'level',
      targetCount: 10,
      expReward: 200,
      silverReward: 100,
      goldReward: 5,
      title: '冒险者',
      badge: 'badge_level_10',
      isHidden: false,
    },
  });

  await prisma.achievement.create({
    data: {
      id: 'ach_level_50',
      name: '经验丰富',
      description: '角色达到 50 级',
      category: 'exploration',
      type: 'reach_level',
      targetType: 'level',
      targetCount: 50,
      expReward: 1000,
      silverReward: 500,
      goldReward: 25,
      title: '老冒险家',
      badge: 'badge_level_50',
      isHidden: false,
    },
  });

  // 社交成就
  await prisma.achievement.create({
    data: {
      id: 'ach_first_friend',
      name: '结交好友',
      description: '添加第一个好友',
      category: 'social',
      type: 'add_friend',
      targetType: 'friend',
      targetCount: 1,
      expReward: 50,
      silverReward: 20,
      goldReward: 0,
      title: '社交达人',
      badge: 'badge_first_friend',
      isHidden: false,
    },
  });

  await prisma.achievement.create({
    data: {
      id: 'ach_party_leader',
      name: '队伍领袖',
      description: '作为队长完成 10 次队伍任务',
      category: 'social',
      type: 'party_leader',
      targetType: 'party',
      targetCount: 10,
      expReward: 300,
      silverReward: 150,
      goldReward: 10,
      title: '团队领袖',
      badge: 'badge_party_leader',
      isHidden: false,
    },
  });

  // 隐藏成就
  await prisma.achievement.create({
    data: {
      id: 'ach_secret',
      name: '???',
      description: '???',
      category: 'exploration',
      type: 'secret',
      targetType: 'secret',
      targetCount: 1,
      expReward: 500,
      silverReward: 250,
      goldReward: 20,
      title: '秘密探索者',
      badge: 'badge_secret',
      isHidden: true,
    },
  });

  console.log(`✅ 创建了 ${await prisma.achievement.count()} 个成就`);

  // ============================================
  // 完成统计
  // ============================================
  console.log('\n📊 任务系统初始数据创建完成！');
  console.log(`  - NPC: ${await prisma.nPC.count()} 个`);
  console.log(`  - 任务：${await prisma.quest.count()} 个`);
  console.log(`  - NPC-任务关联：${await prisma.nPCQuest.count()} 个`);
  console.log(`  - 每日任务：${await prisma.dailyQuest.count()} 个`);
  console.log(`  - 成就：${await prisma.achievement.count()} 个`);
}

main()
  .catch(e => {
    console.error('❌ 创建任务系统初始数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
