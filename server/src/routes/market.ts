import { FastifyPluginAsync } from 'fastify'

const market: FastifyPluginAsync = async (fastify) => {
  // 获取市场订单列表
  fastify.get('/orders', async (request, reply) => {
    // TODO: 从数据库获取
    return {
      orders: [],
      total: 0,
    }
  })

  // 创建订单
  fastify.post('/orders', async (request, reply) => {
    const { itemId, quantity, unitPrice } = request.body as any

    // TODO: 实现创建逻辑
    fastify.log.info(`创建市场订单：物品 ${itemId}`)

    return {
      success: true,
      order: {
        id: '1',
        itemId,
        quantity,
        unitPrice,
      },
    }
  })

  // 取消订单
  fastify.delete('/orders/:id', async (request, reply) => {
    const { id } = request.params as any

    // TODO: 实现取消逻辑
    return {
      success: true,
      message: '订单已取消',
    }
  })
}

export default market
