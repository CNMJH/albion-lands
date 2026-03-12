import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

const characters: FastifyPluginAsync = async (fastify) => {
  // 获取角色列表
  fastify.get('/', async (request, reply) => {
    try {
      const characters = await prisma.character.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return {
        characters: characters.map(c => ({
          id: c.id,
          name: c.name,
          level: c.level,
          zoneId: c.zoneId,
          isOnline: c.isOnline,
          user: {
            id: c.user.id,
            email: c.user.email,
          },
        })),
        total: characters.length,
      }
    } catch (error: any) {
      fastify.log.error(`获取角色列表失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 创建角色
  fastify.post('/', async (request, reply) => {
    try {
      const { userId, name } = request.body as { userId: string; name: string }

      if (!userId || !name) {
        return reply.status(400).send({
          success: false,
          error: '缺少 userId 或 name 参数',
        })
      }

      // 检查用户是否已有角色
      const existing = await prisma.character.findUnique({
        where: { userId },
      })

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: '该用户已创建过角色',
        })
      }

      const character = await prisma.character.create({
        data: {
          userId,
          name,
          level: 1,
          exp: 0,
          silver: 1000,
          gold: 100,
          zoneId: 'zone_1',
          x: 0,
          y: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      })

      return {
        success: true,
        character: {
          id: character.id,
          name: character.name,
          level: character.level,
          zoneId: character.zoneId,
          user: {
            id: character.user.id,
            email: character.user.email,
          },
        },
      }
    } catch (error: any) {
      fastify.log.error(`创建角色失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 获取角色详情
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const character = await prisma.character.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          inventory: {
            include: {
              item: true,
            },
          },
          partyMembers: {
            include: {
              party: true,
            },
          },
        },
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在',
        })
      }

      return {
        id: character.id,
        name: character.name,
        level: character.level,
        exp: character.exp,
        silver: character.silver,
        gold: character.gold,
        zoneId: character.zoneId,
        x: character.x,
        y: character.y,
        isOnline: character.isOnline,
        lastLoginAt: character.lastLoginAt,
        createdAt: character.createdAt,
        user: {
          id: character.user.id,
          email: character.user.email,
        },
        inventory: character.inventory.map(inv => ({
          id: inv.id,
          itemId: inv.itemId,
          quantity: inv.quantity,
          isEquipped: inv.isEquipped,
          item: {
            id: inv.item.id,
            name: inv.item.name,
            type: inv.item.type,
            rarity: inv.item.rarity,
          },
        })),
        party: character.partyMembers.length > 0 ? {
          id: character.partyMembers[0].party.id,
          name: character.partyMembers[0].party.name,
          role: character.partyMembers[0].role,
        } : null,
      }
    } catch (error: any) {
      fastify.log.error(`获取角色详情失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 更新角色
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { name, level, exp, silver, gold, zoneId, x, y } = request.body as any

      const character = await prisma.character.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(level !== undefined && { level }),
          ...(exp !== undefined && { exp }),
          ...(silver !== undefined && { silver }),
          ...(gold !== undefined && { gold }),
          ...(zoneId !== undefined && { zoneId }),
          ...(x !== undefined && { x }),
          ...(y !== undefined && { y }),
        },
      })

      return {
        success: true,
        message: '角色已更新',
        character: {
          id: character.id,
          name: character.name,
          level: character.level,
          zoneId: character.zoneId,
        },
      }
    } catch (error: any) {
      fastify.log.error(`更新角色失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 删除角色
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      await prisma.character.delete({
        where: { id },
      })

      return {
        success: true,
        message: '角色已删除',
      }
    } catch (error: any) {
      fastify.log.error(`删除角色失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })
}

export default characters
