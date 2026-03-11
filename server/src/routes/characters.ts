import { FastifyPluginAsync } from 'fastify'

const characters: FastifyPluginAsync = async (fastify) => {
  // 获取角色列表
  fastify.get('/', async (request, reply) => {
    // TODO: 从数据库获取
    return {
      characters: [],
      total: 0,
    }
  })

  // 创建角色
  fastify.post('/', async (request, reply) => {
    const { name, class: characterClass } = request.body as any

    // TODO: 实现创建逻辑
    fastify.log.info(`创建角色：${name}`)

    return {
      success: true,
      character: {
        id: '1',
        name,
        class: characterClass,
        level: 1,
      },
    }
  })

  // 获取角色详情
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any

    // TODO: 从数据库获取
    return {
      id,
      name: 'Demo Character',
      level: 1,
      zone: 'starter_village',
    }
  })

  // 更新角色
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const updates = request.body as any

    // TODO: 实现更新逻辑
    return {
      success: true,
      message: '角色已更新',
    }
  })

  // 删除角色
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any

    // TODO: 实现删除逻辑
    return {
      success: true,
      message: '角色已删除',
    }
  })
}

export default characters
