import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma'

/**
 * 死亡记录路由
 * GET /api/v1/combat/deaths/:characterId
 */
export async function deathRecordsRoutes(fastify: FastifyInstance) {
  fastify.get('/deaths/:characterId', async (
    request: FastifyRequest<{ Params: { characterId: string }; Querystring: { limit?: string; offset?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { characterId } = request.params
      const limit = parseInt(request.query.limit || '50', 10)
      const offset = parseInt(request.query.offset || '0', 10)

      // 验证角色 ID
      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '角色 ID 不能为空'
        })
      }

      // 查询死亡记录
      const records = await prisma.deathRecord.findMany({
        where: { characterId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      // 如果有击杀者，查询击杀者信息
      const formattedRecords = await Promise.all(records.map(async record => {
        let killerName: string | undefined = undefined;
        if (record.killerId) {
          const killer = await prisma.character.findUnique({
            where: { id: record.killerId },
            select: { name: true }
          });
          killerName = killer?.name;
        }

        return {
          id: record.id,
          characterId: record.characterId,
          killerCharacterId: record.killerId,
          killerName,
          mapId: record.mapId,
          safetyLevel: record.safetyLevel,
          createdAt: record.createdAt.toISOString()
        };
      }));

      return reply.status(200).send({
        success: true,
        records: formattedRecords,
        total: records.length
      })
    } catch (error) {
      console.error('获取死亡记录失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取死亡记录失败'
      })
    }
  })
}
