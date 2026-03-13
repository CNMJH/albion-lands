// @ts-ignore - Fastify type issue
import { FastifyPluginAsync } from 'fastify';
import { deathService } from '../services/DeathService';

// @ts-ignore - Fastify WebSocket route type issue
export const deathRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/combat/death
   * 处理玩家死亡
   */
  fastify.post<{
    Body: {
      characterId: string;
      killerId?: string;
      mapId: string;
      safetyLevel: number;
    };
  }>('/death', async (request, reply) => {
    try {
      const { characterId, killerId, mapId, safetyLevel } = request.body;

      // 验证必填参数
      if (!characterId) {
        return reply.status(400).send({
          success: false,
          message: '角色 ID 不能为空',
        });
      }

      if (!mapId) {
        return reply.status(400).send({
          success: false,
          message: '地图 ID 不能为空',
        });
      }

      if (safetyLevel === undefined || safetyLevel === null) {
        return reply.status(400).send({
          success: false,
          message: '安全等级不能为空',
        });
      }

      // 处理死亡
      const result = await deathService.handleDeath(
        characterId,
        mapId,
        safetyLevel,
        killerId
      );

      return reply.send({
        success: true,
        ...result,
      });
    } catch (error: any) {
      fastify.log.error('处理死亡失败:', error);
      return reply.status(500).send({
        success: false,
        message: error.message || '处理死亡失败',
      });
    }
  });

  /**
   * POST /api/v1/combat/loot
   * 拾取掉落物
   */
  // @ts-ignore - Fastify type issue
  fastify.post<{
    Body: {
      characterId: string;
      droppedItemId: string;
    };
  }>('/loot', async (request, reply) => {
    try {
      const { characterId, droppedItemId } = request.body;

      // 验证必填参数
      if (!characterId) {
        return reply.status(400).send({
          success: false,
          message: '角色 ID 不能为空',
        });
      }

      if (!droppedItemId) {
        return reply.status(400).send({
          success: false,
          message: '掉落物 ID 不能为空',
        });
      }

      // 拾取掉落物
      const result = await deathService.lootDroppedItem(
        characterId,
        droppedItemId
      );

      return reply.send(result);
    } catch (error: any) {
      fastify.log.error('拾取掉落物失败:', error);
      return reply.status(500).send({
        success: false,
        message: error.message || '拾取掉落物失败',
      });
    }
  });

  /**
   * GET /api/v1/combat/drops/:mapId
   * 查询地图上的掉落物
   */
  // @ts-ignore - Fastify type issue
  fastify.get<{
    Params: {
      mapId: string;
    };
  }>('/drops/:mapId', async (request, reply) => {
    try {
      const { mapId } = request.params;

      const drops = await deathService.getDropsInMap(mapId);

      return reply.send({
        success: true,
        drops: drops.map((drop) => ({
          id: drop.id,
          x: drop.x,
          y: drop.y,
          itemId: drop.itemId,
          itemName: drop.item.name,
          quantity: drop.quantity,
          ownerId: drop.ownerId,
          expireAt: drop.expireAt,
        })),
      });
    } catch (error: any) {
      fastify.log.error('查询掉落物失败:', error);
      return reply.status(500).send({
        success: false,
        message: error.message || '查询掉落物失败',
      });
    }
  });
};

export default deathRoutes;
