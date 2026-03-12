import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { equipmentService, EquipmentSlot } from '../services/EquipmentService'

/**
 * 装备路由
 * 
 * GET    /api/equipment/:characterId          - 获取角色装备
 * GET    /api/equipment/:characterId/stats    - 获取角色属性
 * POST   /api/equipment/:characterId/equip    - 装备物品
 * POST   /api/equipment/:characterId/unequip  - 卸下装备
 * POST   /api/equipment/:characterId/compare  - 对比物品
 */
export async function equipmentRoutes(fastify: FastifyInstance) {
  // 获取角色装备
  fastify.get('/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      
      const equipment = await equipmentService.getEquipment(characterId)
      
      return {
        success: true,
        data: equipment
      }
    } catch (error: any) {
      reply.code(400)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 获取角色属性
  fastify.get('/:characterId/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      
      const stats = await equipmentService.getCharacterStats(characterId)
      
      return {
        success: true,
        data: stats
      }
    } catch (error: any) {
      reply.code(400)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 装备物品
  fastify.post('/:characterId/equip', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      const { itemId, slot } = request.body as { itemId: string, slot: EquipmentSlot }

      if (!itemId || !slot) {
        reply.code(400)
        return {
          success: false,
          error: '缺少必要参数'
        }
      }

      const result = await equipmentService.equipItem(characterId, itemId, slot)

      if (!result.success) {
        reply.code(400)
        return {
          success: false,
          error: result.error
        }
      }

      // 获取更新后的装备和属性
      const [equipment, stats] = await Promise.all([
        equipmentService.getEquipment(characterId),
        equipmentService.getCharacterStats(characterId)
      ])

      return {
        success: true,
        data: {
          equipment,
          stats,
          previousItemId: result.previousItemId
        }
      }
    } catch (error: any) {
      reply.code(500)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 卸下装备
  fastify.post('/:characterId/unequip', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      const { slot } = request.body as { slot: EquipmentSlot }

      if (!slot) {
        reply.code(400)
        return {
          success: false,
          error: '缺少槽位参数'
        }
      }

      const result = await equipmentService.unequipItem(characterId, slot)

      if (!result.success) {
        reply.code(400)
        return {
          success: false,
          error: result.error
        }
      }

      // 获取更新后的装备和属性
      const [equipment, stats] = await Promise.all([
        equipmentService.getEquipment(characterId),
        equipmentService.getCharacterStats(characterId)
      ])

      return {
        success: true,
        data: {
          equipment,
          stats,
          itemId: result.itemId
        }
      }
    } catch (error: any) {
      reply.code(500)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 对比物品
  fastify.post('/:characterId/compare', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      const { itemId, slot } = request.body as { itemId: string, slot: EquipmentSlot }

      if (!itemId || !slot) {
        reply.code(400)
        return {
          success: false,
          error: '缺少必要参数'
        }
      }

      const result = await equipmentService.compareItems(characterId, slot, itemId)

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      reply.code(500)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 批量装备（预设）
  fastify.post('/:characterId/preset', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      const { preset } = request.body as { preset: Record<string, string> }

      if (!preset) {
        reply.code(400)
        return {
          success: false,
          error: '缺少预设配置'
        }
      }

      const result = await equipmentService.loadPreset(characterId, preset)

      if (!result.success) {
        reply.code(400)
        return {
          success: false,
          errors: result.errors
        }
      }

      // 获取更新后的装备和属性
      const [equipment, stats] = await Promise.all([
        equipmentService.getEquipment(characterId),
        equipmentService.getCharacterStats(characterId)
      ])

      return {
        success: true,
        data: {
          equipment,
          stats
        }
      }
    } catch (error: any) {
      reply.code(500)
      return {
        success: false,
        error: error.message
      }
    }
  })
}
