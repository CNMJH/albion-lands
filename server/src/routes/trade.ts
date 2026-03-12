import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { tradeService } from '../services/TradeService';

/**
 * 交易路由
 * 处理玩家间交易相关请求
 */
export async function tradeRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/trade/request
   * 发起交易请求
   */
  fastify.post('/request', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { initiatorId, recipientId } = request.body as any;

      if (!initiatorId || !recipientId) {
        return reply.status(400).send({
          success: false,
          message: '缺少发起者或接收者 ID',
        });
      }

      const result = await tradeService.requestTrade(initiatorId, recipientId);

      return reply.send(result);
    } catch (error) {
      console.error('发起交易失败:', error);
      return reply.status(500).send({
        success: false,
        message: '发起交易失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/trade/respond
   * 响应交易请求
   */
  fastify.post('/respond', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId, recipientId, accept } = request.body as any;

      if (!tradeId || !recipientId || accept === undefined) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await tradeService.respondTrade(tradeId, recipientId, accept);

      return reply.send(result);
    } catch (error) {
      console.error('响应交易失败:', error);
      return reply.status(500).send({
        success: false,
        message: '响应交易失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/trade/add-item
   * 添加交易物品
   */
  fastify.post('/add-item', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId, characterId, itemId, quantity } = request.body as any;

      if (!tradeId || !characterId || !itemId) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await tradeService.addItem(tradeId, characterId, itemId, quantity || 1);

      return reply.send(result);
    } catch (error) {
      console.error('添加物品失败:', error);
      return reply.status(500).send({
        success: false,
        message: '添加物品失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/trade/set-silver
   * 设置交易银币
   */
  fastify.post('/set-silver', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId, characterId, silver } = request.body as any;

      if (!tradeId || !characterId || silver === undefined) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await tradeService.setSilver(tradeId, characterId, silver);

      return reply.send(result);
    } catch (error) {
      console.error('设置银币失败:', error);
      return reply.status(500).send({
        success: false,
        message: '设置银币失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/trade/confirm
   * 确认交易
   */
  fastify.post('/confirm', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId, characterId } = request.body as any;

      if (!tradeId || !characterId) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await tradeService.confirmTrade(tradeId, characterId);

      return reply.send(result);
    } catch (error) {
      console.error('确认交易失败:', error);
      return reply.status(500).send({
        success: false,
        message: '确认交易失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/trade/cancel
   * 取消交易
   */
  fastify.post('/cancel', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId, characterId } = request.body as any;

      if (!tradeId || !characterId) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await tradeService.cancelTrade(tradeId, characterId);

      return reply.send(result);
    } catch (error) {
      console.error('取消交易失败:', error);
      return reply.status(500).send({
        success: false,
        message: '取消交易失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/trade/:tradeId
   * 获取交易详情
   */
  fastify.get('/:tradeId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tradeId } = request.params as any;

      const trade = await tradeService.getTrade(tradeId);

      if (!trade) {
        return reply.status(404).send({
          success: false,
          message: '交易不存在',
        });
      }

      return reply.send({
        success: true,
        trade,
      });
    } catch (error) {
      console.error('获取交易详情失败:', error);
      return reply.status(500).send({
        success: false,
        message: '获取交易详情失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/trade/history/:characterId
   * 获取交易历史
   */
  fastify.get('/history/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as any;
      const { limit = 20 } = request.query as any;

      const history = await tradeService.getTradeHistory(characterId, parseInt(limit));

      return reply.send({
        success: true,
        history,
      });
    } catch (error) {
      console.error('获取交易历史失败:', error);
      return reply.status(500).send({
        success: false,
        message: '获取交易历史失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });
}
