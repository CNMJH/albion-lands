import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 技能配置数据
 */
interface SkillConfig {
  id: string
  name: string
  type: string
  damageMultiplier?: number
  healAmount?: number
  cooldown: number
  energyCost: number
  range: number
  duration?: number
  radius?: number
}

/**
 * 技能数据
 */
interface SkillData {
  characterId: string
  skillId: string
  level: number
  cooldownUntil?: Date
}

/**
 * 技能伤害计算结果
 */
interface SkillDamageResult {
  damage: number
  isCritical: boolean
  targetHp: number
  targetMaxHp: number
}

/**
 * 技能系统路由
 */
export async function skillsRoutes(fastify: FastifyInstance) {
  /**
   * 获取角色技能列表
   */
  fastify.get('/skills/:characterId', async (request: FastifyRequest<{ Params: { characterId: string } }>, reply: FastifyReply) => {
    try {
      const { characterId } = request.params

      const skills = await prisma.characterSkill.findMany({
        where: { characterId },
        include: {
          skill: true,
        },
        orderBy: {
          slot: 'asc',
        },
      })

      reply.send({
        success: true,
        skills: skills.map(s => ({
          id: s.skill.id,
          name: s.skill.name,
          level: s.level,
          slot: s.slot,
          type: s.skill.type,
          cooldown: s.skill.cooldown,
          energyCost: s.skill.energyCost,
        })),
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '获取技能列表失败' })
    }
  })

  /**
   * 装备技能到快捷栏
   */
  fastify.post('/skills/:characterId/equip', async (request: FastifyRequest<{ Params: { characterId: string }; Body: { skillId: string; slot: number } }>, reply: FastifyReply) => {
    try {
      const { characterId } = request.params
      const { skillId, slot } = request.body

      if (slot < 0 || slot > 7) {
        return reply.status(400).send({ success: false, error: '技能栏位必须是 0-7' })
      }

      // 检查技能是否存在
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
      })

      if (!skill) {
        return reply.status(404).send({ success: false, error: '技能不存在' })
      }

      // 检查角色是否已学习该技能
      const characterSkill = await prisma.characterSkill.findFirst({
        where: {
          characterId,
          skillId,
        },
      })

      if (!characterSkill) {
        // 自动学习技能
        await prisma.characterSkill.create({
          data: {
            characterId,
            skillId,
            level: 1,
            slot,
          },
        })
      } else {
        // 更新技能栏位
        await prisma.characterSkill.update({
          where: { id: characterSkill.id },
          data: { slot },
        })
      }

      reply.send({
        success: true,
        message: '技能装备成功',
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '装备技能失败' })
    }
  })

  /**
   * 计算技能伤害
   */
  fastify.post('/skills/calculate-damage', async (request: FastifyRequest<{ Body: { characterId: string; skillId: string; targetLevel: number } }>, reply: FastifyReply) => {
    try {
      const { characterId, skillId, targetLevel } = request.body

      // 获取角色信息
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      })

      if (!character) {
        return reply.status(404).send({ success: false, error: '角色不存在' })
      }

      // 获取技能配置
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
      })

      if (!skill) {
        return reply.status(404).send({ success: false, error: '技能不存在' })
      }

      // 计算基础攻击力（简化版：使用等级）
      const baseAttack = character.level * 10

      // 计算技能伤害
      const damageMultiplier = skill.damageMultiplier || 1.0
      const baseDamage = baseAttack * damageMultiplier

      // 暴击判定（固定 10% 暴击率）
      const critRate = 0.1
      const isCritical = Math.random() < critRate
      const critMultiplier = 1.5

      // 最终伤害
      let damage = baseDamage
      if (isCritical) {
        damage *= critMultiplier
      }

      // 目标防御减免（基于目标等级）
      const defense = (targetLevel || 1) * 5
      const damageReduction = defense / (defense + 100)
      damage = damage * (1 - damageReduction)

      // 取整
      damage = Math.floor(damage)

      reply.send({
        success: true,
        damage,
        isCritical,
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '计算伤害失败' })
    }
  })

  /**
   * 检查技能是否可用
   */
  fastify.post('/skills/check-available', async (request: FastifyRequest<{ Body: { characterId: string; skillId: string } }>, reply: FastifyReply) => {
    try {
      const { characterId, skillId } = request.body

      // 获取角色技能
      const characterSkill = await prisma.characterSkill.findFirst({
        where: {
          characterId,
          skillId,
        },
      })

      if (!characterSkill) {
        return reply.status(404).send({ success: false, error: '未学习该技能' })
      }

      // 检查冷却
      if (characterSkill.cooldownUntil && characterSkill.cooldownUntil > new Date()) {
        const remainingSeconds = Math.ceil((characterSkill.cooldownUntil.getTime() - Date.now()) / 1000)
        return reply.send({
          success: false,
          available: false,
          reason: 'cooldown',
          remainingSeconds,
        })
      }

      reply.send({
        success: true,
        available: true,
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '检查技能失败' })
    }
  })

  /**
   * 开始技能冷却
   */
  fastify.post('/skills/:characterId/start-cooldown', async (request: FastifyRequest<{ Params: { characterId: string }; Body: { skillId: string; cooldownSeconds: number } }>, reply: FastifyReply) => {
    try {
      const { characterId } = request.params
      const { skillId, cooldownSeconds } = request.body

      const cooldownUntil = new Date(Date.now() + cooldownSeconds * 1000)

      await prisma.characterSkill.updateMany({
        where: {
          characterId,
          skillId,
        },
        data: {
          cooldownUntil,
        },
      })

      reply.send({
        success: true,
        cooldownUntil,
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '开始冷却失败' })
    }
  })

  /**
   * 获取所有技能配置
   */
  fastify.get('/skills-config', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const skills = await prisma.skill.findMany({
        orderBy: {
          weaponType: 'asc',
        },
      })

      reply.send({
        success: true,
        skills,
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: '获取技能配置失败' })
    }
  })
}
