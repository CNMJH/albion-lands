import { FastifyPluginAsync } from 'fastify'

const items: FastifyPluginAsync = async (fastify) => {
  // 获取物品列表
  fastify.get('/', async (request, reply) => {
    // TODO: 从数据库获取
    return {
      items: [],
      total: 0,
    }
  })

  // 获取物品详情
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any

    // TODO: 从数据库获取
    return {
      id,
      name: 'Iron Sword',
      type: 'Weapon',
      rarity: 'Common',
    }
  })
}

export default items
