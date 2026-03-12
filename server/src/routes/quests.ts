import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { QuestService } from '../services/QuestService';
import { AchievementService } from '../services/AchievementService';

const prisma = new PrismaClient();

/**
 * 任务系统路由
 * /api/v1/quests/*
 */
export async function questRoutes(fastify: FastifyInstance): Promise<void> {
  // ============================================
  // 任务相关
  // ============================================

  /**
   * 获取所有任务
   * GET /api/v1/quests
   */
  fastify.get('/', async (request, reply) => {
    try {
      const { type, category, level } = request.query as {
        type?: string;
        category?: string;
        level?: string;
      };

      let quests = await QuestService.getAllQuests();

      // 筛选
      if (type) {
        quests = quests.filter(q => q.type === type);
      }
      if (category) {
        quests = quests.filter(q => q.category === category);
      }
      if (level) {
        const minLevel = parseInt(level);
        quests = quests.filter(q => q.level <= minLevel);
      }

      reply.send({
        success: true,
        data: { quests },
      });
    } catch (error: any) {
      fastify.log.error(`获取任务列表失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取任务详情
   * GET /api/v1/quests/:id
   */
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const quest = await QuestService.getQuestById(id);

      if (!quest) {
        return reply.status(404).send({ success: false, error: '任务不存在' });
      }

      reply.send({
        success: true,
        data: { quest },
      });
    } catch (error: any) {
      fastify.log.error(`获取任务详情失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取角色任务列表
   * GET /api/v1/quests/character/:characterId
   */
  fastify.get('/character/:characterId', async (request, reply) => {
    try {
      const { characterId } = request.params as { characterId: string };
      const { status } = request.query as { status?: string };

      const quests = await QuestService.getCharacterQuests(characterId, status);

      reply.send({
        success: true,
        data: { quests },
      });
    } catch (error: any) {
      fastify.log.error(`获取角色任务列表失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 接取任务
   * POST /api/v1/quests/:id/accept
   */
  fastify.post('/:id/accept', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { characterId } = request.body as { characterId: string };

      if (!characterId) {
        return reply.status(400).send({ success: false, error: '缺少角色 ID' });
      }

      const result = await QuestService.acceptQuest(characterId, id);

      if (!result.success) {
        return reply.status(400).send({ success: false, error: result.message });
      }

      reply.send(result);
    } catch (error: any) {
      fastify.log.error(`接取任务失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 提交任务
   * POST /api/v1/quests/:id/complete
   */
  fastify.post('/:id/complete', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { characterId } = request.body as { characterId: string };

      if (!characterId) {
        return reply.status(400).send({ success: false, error: '缺少角色 ID' });
      }

      const result = await QuestService.completeQuest(characterId, id);

      if (!result.success) {
        return reply.status(400).send({ success: false, error: result.message });
      }

      reply.send(result);
    } catch (error: any) {
      fastify.log.error(`提交任务失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 放弃任务
   * POST /api/v1/quests/:id/abandon
   */
  fastify.post('/:id/abandon', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { characterId } = request.body as { characterId: string };

      if (!characterId) {
        return reply.status(400).send({ success: false, error: '缺少角色 ID' });
      }

      const result = await QuestService.abandonQuest(characterId, id);

      if (!result.success) {
        return reply.status(400).send({ success: false, error: result.message });
      }

      reply.send(result);
    } catch (error: any) {
      fastify.log.error(`放弃任务失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 更新任务进度（内部调用或自动触发）
   * POST /api/v1/quests/:id/progress
   */
  fastify.post('/:id/progress', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        characterId,
        objectiveType,
        targetId,
        amount = 1,
      } = request.body as {
        characterId: string;
        objectiveType: string;
        targetId: string;
        amount?: number;
      };

      if (!characterId || !objectiveType || !targetId) {
        return reply.status(400).send({
          success: false,
          error: '缺少必要参数',
        });
      }

      const result = await QuestService.updateProgress(
        characterId,
        id,
        objectiveType,
        targetId,
        amount
      );

      reply.send(result);
    } catch (error: any) {
      fastify.log.error(`更新任务进度失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取每日任务
   * GET /api/v1/quests/daily
   */
  fastify.get('/daily/list', async (request, reply) => {
    try {
      const dailyQuests = await QuestService.getDailyQuests();

      reply.send({
        success: true,
        data: { dailyQuests },
      });
    } catch (error: any) {
      fastify.log.error(`获取每日任务失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  // ============================================
  // NPC 相关
  // ============================================

  /**
   * 获取所有 NPC
   * GET /api/v1/quests/npcs
   */
  fastify.get('/npcs', async (request, reply) => {
    try {
      const { zoneId } = request.query as { zoneId?: string };

      let npcs = await QuestService.getAllNPCs();

      if (zoneId) {
        npcs = await QuestService.getNPCsInZone(zoneId);
      }

      reply.send({
        success: true,
        data: { npcs },
      });
    } catch (error: any) {
      fastify.log.error(`获取 NPC 列表失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取 NPC 详情
   * GET /api/v1/quests/npcs/:id
   */
  fastify.get('/npcs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const npc = await QuestService.getNPCById(id);

      if (!npc) {
        return reply.status(404).send({ success: false, error: 'NPC 不存在' });
      }

      reply.send({
        success: true,
        data: { npc },
      });
    } catch (error: any) {
      fastify.log.error(`获取 NPC 详情失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取 NPC 可发布的任务
   * GET /api/v1/quests/npcs/:id/quests
   */
  fastify.get('/npcs/:id/quests', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const quests = await QuestService.getNPCQuests(id);

      reply.send({
        success: true,
        data: { quests },
      });
    } catch (error: any) {
      fastify.log.error(`获取 NPC 任务失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  // ============================================
  // 成就相关
  // ============================================

  /**
   * 获取所有成就
   * GET /api/v1/quests/achievements
   */
  fastify.get('/achievements', async (request, reply) => {
    try {
      const { category } = request.query as { category?: string };

      let achievements = await AchievementService.getAllAchievements();

      if (category) {
        achievements = achievements.filter(a => a.category === category);
      }

      reply.send({
        success: true,
        data: { achievements },
      });
    } catch (error: any) {
      fastify.log.error(`获取成就列表失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取角色成就进度
   * GET /api/v1/quests/achievements/character/:characterId
   */
  fastify.get('/achievements/character/:characterId', async (request, reply) => {
    try {
      const { characterId } = request.params as { characterId: string };
      const { includeHidden } = request.query as { includeHidden?: string };

      const achievements = await AchievementService.getCharacterAchievements(
        characterId,
        includeHidden === 'true'
      );

      reply.send({
        success: true,
        data: { achievements },
      });
    } catch (error: any) {
      fastify.log.error(`获取角色成就失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });

  /**
   * 获取成就统计
   * GET /api/v1/quests/achievements/character/:characterId/stats
   */
  fastify.get('/achievements/character/:characterId/stats', async (request, reply) => {
    try {
      const { characterId } = request.params as { characterId: string };

      const stats = await AchievementService.getAchievementStats(characterId);

      reply.send({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      fastify.log.error(`获取成就统计失败：${error.message}`);
      reply.status(500).send({ success: false, error: '服务器错误' });
    }
  });
}
