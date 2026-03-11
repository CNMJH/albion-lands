import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyWebSocket from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import { WebSocketServer } from './websocket/WebSocketServer'
import { registerRoutes } from './routes'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
})

// 注册插件
async function registerPlugins() {
  // CORS
  await fastify.register(fastifyCors, {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })

  // WebSocket
  await fastify.register(fastifyWebSocket, {
    options: {
      maxPayload: 1024 * 1024, // 1MB
    },
  })

  // 静态文件服务（GM 工具）
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/gm/',
  })
}

// 启动服务器
async function start() {
  try {
    // 注册插件
    await registerPlugins()

    // 注册路由
    registerRoutes(fastify)

    // 启动 WebSocket 服务器
    const wsServer = new WebSocketServer(fastify)
    await wsServer.start()

    // 启动 HTTP 服务器
    const port = parseInt(process.env.PORT || '3000')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })

    console.log(`
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://${host}:${port}                 ║
║  WebSocket: ws://${host}:${port}/ws          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
╚════════════════════════════════════════════════╝
    `)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// 优雅关闭
async function shutdown() {
  console.log('\n正在关闭服务器...')
  await fastify.close()
  console.log('服务器已关闭')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// 启动
start()
