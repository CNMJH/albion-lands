import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { marketService } from '../services/MarketService';

/**
 * 拍卖行路由
 * 处理市场交易相关请求
 */
export async function marketRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/market/order
   * 创建订单
   */
  fastify.post('/order', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sellerId, itemId, quantity, unitPrice, type, duration } = request.body as any;

      if (!sellerId || !itemId || !quantity || !unitPrice) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await marketService.createOrder({
        sellerId,
        itemId,
        quantity,
        unitPrice,
        type,
        duration,
      });

      return reply.send(result);
    } catch (error) {
      console.error('创建订单失败:', error);
      return reply.status(500).send({
        success: false,
        message: '创建订单失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/market/orders
   * 查询市场订单
   */
  fastify.get('/orders', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { itemId, type = 'SELL', sortBy = 'price', sortOrder = 'asc', limit = 50 } = request.query as any;

      const orders = await marketService.getMarketOrders(
        itemId,
        type,
        sortBy,
        sortOrder,
        parseInt(limit)
      );

      return reply.send({
        success: true,
        orders,
      });
    } catch (error) {
      console.error('查询订单失败:', error);
      return reply.status(500).send({
        success: false,
        message: '查询订单失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/market/buy
   * 购买物品
   */
  fastify.post('/buy', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orderId, buyerId, quantity } = request.body as any;

      if (!orderId || !buyerId || !quantity) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await marketService.buyOrder({
        orderId,
        buyerId,
        quantity,
      });

      return reply.send(result);
    } catch (error) {
      console.error('购买失败:', error);
      return reply.status(500).send({
        success: false,
        message: '购买失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * POST /api/v1/market/cancel
   * 取消订单
   */
  fastify.post('/cancel', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orderId, sellerId } = request.body as any;

      if (!orderId || !sellerId) {
        return reply.status(400).send({
          success: false,
          message: '缺少必要参数',
        });
      }

      const result = await marketService.cancelOrder(orderId, sellerId);

      return reply.send(result);
    } catch (error) {
      console.error('取消订单失败:', error);
      return reply.status(500).send({
        success: false,
        message: '取消订单失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/market/seller/:sellerId
   * 获取卖家订单
   */
  fastify.get('/seller/:sellerId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sellerId } = request.params as any;
      const { status } = request.query as any;

      const orders = await marketService.getSellerOrders(sellerId, status);

      return reply.send({
        success: true,
        orders,
      });
    } catch (error) {
      console.error('查询卖家订单失败:', error);
      return reply.status(500).send({
        success: false,
        message: '查询卖家订单失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/market/history/:characterId
   * 获取交易历史
   */
  fastify.get('/history/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as any;
      const { limit = 20 } = request.query as any;

      const history = await marketService.getTransactionHistory(characterId, parseInt(limit));

      return reply.send({
        success: true,
        history,
      });
    } catch (error) {
      console.error('查询交易历史失败:', error);
      return reply.status(500).send({
        success: false,
        message: '查询交易历史失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  /**
   * GET /api/v1/market/price/:itemId
   * 获取平均价格
   */
  fastify.get('/price/:itemId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { itemId } = request.params as any;
      const { days = 7 } = request.query as any;

      const avgPrice = await marketService.getAveragePrice(itemId, parseInt(days));

      return reply.send({
        success: true,
        itemId,
        averagePrice: avgPrice,
        days: parseInt(days),
      });
    } catch (error) {
      console.error('查询价格失败:', error);
      return reply.status(500).send({
        success: false,
        message: '查询价格失败',
        error: error instanceof Error ? error.message : error,
      });
    }
  });
}
