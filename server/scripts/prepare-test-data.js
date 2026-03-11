#!/usr/bin/env node

/**
 * 社交系统测试数据准备脚本
 * 创建测试账号和角色
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 开始准备社交系统测试数据...\n')

  const testUsers = [
    { email: 'test1@example.com', password: 'password123', name: '测试玩家 1' },
    { email: 'test2@example.com', password: 'password123', name: '测试玩家 2' },
    { email: 'test3@example.com', password: 'password123', name: '测试玩家 3' },
  ]

  for (const userData of testUsers) {
    console.log(`创建用户：${userData.email}`)
    
    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existingUser) {
        console.log(`  ⚠️  用户已存在，跳过`)
        continue
      }

      // 创建用户
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      })

      console.log(`  ✅ 用户创建成功：${user.id}`)

      // 创建角色
      const character = await prisma.character.create({
        data: {
          userId: user.id,
          name: userData.name,
          level: 10,
          zoneId: 'zone_1',
          x: 100,
          y: 100,
          isOnline: false,
        },
      })

      console.log(`  ✅ 角色创建成功：${character.id} (${character.name})`)

      // 给予 10 个大喇叭（使用 existing script）
      console.log(`  ℹ️  大喇叭将通过 GM 工具或 add-world-horn.js 脚本添加`)

      console.log('')
    } catch (error) {
      console.error(`  ❌ 创建失败：${error.message}`)
      console.error(error)
    }
  }

  console.log('✅ 测试数据准备完成！\n')
  console.log('测试账号信息:')
  console.log('  test1@example.com / password123')
  console.log('  test2@example.com / password123')
  console.log('  test3@example.com / password123')
  console.log('')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
