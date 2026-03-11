import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const auth: FastifyPluginAsync = async (fastify) => {
  // 注册
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password } = request.body as { email: string; password: string }

      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: '邮箱已被注册',
        })
      }

      // 创建用户
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      })

      // 创建默认角色
      const character = await prisma.character.create({
        data: {
          userId: user.id,
          name: `玩家${user.id.slice(0, 8)}`,
          level: 1,
          zoneId: 'zone_1',
          x: 0,
          y: 0,
        },
      })

      fastify.log.info(`用户注册：${email}`)

      return {
        success: true,
        message: '注册成功',
        user: {
          id: user.id,
          email: user.email,
        },
        character: {
          id: character.id,
          name: character.name,
        },
      }
    } catch (error: any) {
      fastify.log.error(`注册失败：${error.message}`)
      return reply.status(500).send({
        success: false,
        error: '注册失败',
      })
    }
  })

  // 登录
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as { email: string; password: string }
      
      fastify.log.info(`登录请求：${email}`)

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          character: true,
        },
      })

      if (!user) {
        fastify.log.warn(`用户不存在：${email}`)
        return reply.status(401).send({
          success: false,
          error: '用户不存在',
        })
      }

      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        fastify.log.warn(`密码错误：${email}`)
        return reply.status(401).send({
          success: false,
          error: '密码错误',
        })
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      )

      // 获取默认角色
      const character = user.character

      // 更新在线状态
      if (character) {
        await prisma.character.update({
          where: { id: character.id },
          data: { isOnline: true },
        })
      }

      fastify.log.info(`用户登录：${email}`)

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
        },
        character: {
          id: character?.id,
          name: character?.name,
          level: character?.level,
          zoneId: character?.zoneId,
        },
      }
    } catch (error: any) {
      fastify.log.error(`登录失败：${error.message}`)
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: '登录失败',
      })
    }
  })

  // 登出
  fastify.post('/logout', async (request, reply) => {
    try {
      const { characterId } = request.body as { characterId: string }

      if (characterId) {
        await prisma.character.update({
          where: { id: characterId },
          data: { isOnline: false },
        })
      }

      return { success: true }
    } catch (error: any) {
      fastify.log.error(`登出失败：${error.message}`)
      return reply.status(500).send({
        success: false,
        error: '登出失败',
      })
    }
  })
}

export default auth
