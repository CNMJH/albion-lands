import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pvpService } from '../services/PVPService';

/**
 * PVP 路由
 * 处理玩家间对战相关请求
 */
export async function pvpRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/pvp/attack
   * 攻击玩家
   */
  fastify.post('/attack', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { attackerId, targetId, damage, skillId } = request.body as any;

      if (!attackerId || !targetId) {
        return reply.status(400).send({
          success: false,
          message: '缺少攻击者或目标 ID',
        });
      }

      if (!damage || damage <= 0) {
        return reply.status(400).send({
          success: false,
          message: '伤害值无效',
        });
      }

      const result = await pvpService.attackPlayer(attackerId, targetId, damage, skillId);

      return reply.send(result);
    } catch (error) {
      console.error('PVP 攻击失败:', error);
      return reply.status(500).send({
        success: false,
        message: 'PVP 攻击失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/pvp/stats/:characterId
   * 获取 PVP 统计
   */
  fastify.get('/stats/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as any;

      const stats = await pvpService.getPVPStats(characterId);

      if (!stats) {
        return reply.status(404).send({
          success: false,
          message: '未找到 PVP 统计',
        });
      }

      return reply.send({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('获取 PVP 统计失败:', error);
      return reply.status(500).send({
        success: false,
        message: '获取 PVP 统计失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/pvp/leaderboard
   * 获取 PVP 排行榜
   */
  fastify.get('/leaderboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { type = 'kills', limit = 100 } = request.query as any;

      const leaderboard = await pvpService.getLeaderboard(type, parseInt(limit));

      return reply.send({
        success: true,
        leaderboard,
      });
    } catch (error) {
      console.error('获取排行榜失败:', error);
      return reply.status(500).send({
        success: false,
        message: '获取排行榜失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/pvp/history/:characterId
   * 获取击杀记录
   */
  fastify.get('/history/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as any;
      const { limit = 20 } = request.query as any;

      const history = await pvpService.getKillHistory(characterId, parseInt(limit));

      return reply.send({
        success: true,
        history,
      });
    } catch (error) {
      console.error('获取击杀记录失败:', error);
      return reply.status(500).send({
        success: false,
        message: '获取击杀记录失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });
}
