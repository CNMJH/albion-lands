import { create } from 'zustand'

/**
 * 好友状态
 */
export type FriendStatus = 'pending' | 'accepted' | 'blocked'

/**
 * 好友信息
 */
export interface Friend {
  id: string
  userId: string
  friendId: string
  status: FriendStatus
  friend: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
  }
}

/**
 * 队伍成员信息
 */
export interface PartyMember {
  id: string
  partyId: string
  characterId: string
  role: 'Leader' | 'Member'
  character: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
    x: number
    y: number
  }
}

/**
 * 队伍信息
 */
export interface Party {
  id: string
  leaderId: string
  name?: string
  maxMembers: number
  isPublic: boolean
  members: PartyMember[]
  createdAt: Date
  updatedAt: Date
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string
  type: 'whisper' | 'party' | 'zone' | 'global'
  senderId: string
  senderName?: string
  receiverId?: string
  partyId?: string
  zoneId?: string
  content: string
  createdAt: Date
  isReceived?: boolean
}

/**
 * 社交状态
 */
interface SocialState {
  // 好友
  friends: Friend[]
  pendingRequests: Friend[]
  blockList: Friend[]
  
  // 队伍
  currentParty: Party | null
  
  // 聊天
  messages: ChatMessage[]
  chatHistory: Map<string, ChatMessage[]>
  
  // WebSocket
  ws: WebSocket | null
  
  // 动作
  connect: (wsUrl: string, characterId: string) => void
  disconnect: () => void
  
  // 好友
  sendFriendRequest: (friendUserId: string) => void
  acceptFriendRequest: (friendUserId: string) => void
  rejectFriendRequest: (friendUserId: string) => void
  removeFriend: (friendUserId: string) => void
  fetchFriends: () => Promise<void>
  fetchPendingRequests: () => Promise<void>
  
  // 队伍
  createParty: (name?: string, isPublic?: boolean) => void
  joinParty: (partyId: string) => void
  leaveParty: (partyId: string) => void
  kickMember: (partyId: string, targetId: string) => void
  fetchParty: () => Promise<void>
  
  // 聊天
  sendMessage: (type: string, content: string, options?: any) => void
  addMessage: (message: ChatMessage) => void
  fetchChatHistory: (type: string, targetId?: string) => Promise<void>
}

/**
 * 社交系统 Store
 */
export const useSocialStore = create<SocialState>((set, get) => ({
  // 初始状态
  friends: [],
  pendingRequests: [],
  blockList: [],
  currentParty: null,
  messages: [],
  chatHistory: new Map(),
  ws: null,

  /**
   * 连接 WebSocket
   */
  connect: (wsUrl: string, characterId: string) => {
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket 已连接')
      // 发送认证
      ws.send(JSON.stringify({
        type: 'auth',
        data: { characterId },
      }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      get().handleWebSocketMessage(message)
    }

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket 已断开')
      set({ ws: null })
    }

    set({ ws })
  },

  /**
   * 断开连接
   */
  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null })
    }
  },

  /**
   * 处理 WebSocket 消息
   */
  handleWebSocketMessage: (message: any) => {
    const { type, payload } = message

    switch (type) {
      case 'chatMessage':
        get().addMessage(payload as ChatMessage)
        break

      case 'chatError':
        console.error('聊天错误:', payload.error)
        break

      case 'friendRequestSent':
        console.log('好友请求已发送:', payload.friendUserId)
        break

      case 'friendAccepted':
        console.log('已添加好友:', payload.friendUserId)
        get().fetchFriends()
        break

      case 'friendAdded':
        console.log('对方接受了好友请求')
        get().fetchFriends()
        break

      case 'friendRejected':
        console.log('好友请求被拒绝')
        break

      case 'friendRemoved':
        console.log('已删除好友')
        get().fetchFriends()
        break

      case 'friendError':
        console.error('好友错误:', payload.error)
        break

      case 'partyCreated':
        console.log('队伍已创建:', payload.party)
        set({ currentParty: payload.party })
        break

      case 'partyJoined':
        console.log('已加入队伍:', payload.party)
        set({ currentParty: payload.party })
        break

      case 'partyLeft':
        console.log('已离开队伍')
        set({ currentParty: null })
        break

      case 'partyMemberJoined':
        console.log('新成员加入队伍')
        get().fetchParty()
        break

      case 'partyMemberLeft':
        console.log('成员离开队伍')
        get().fetchParty()
        break

      case 'partyMemberKicked':
        console.log('成员被踢出')
        get().fetchParty()
        break

      case 'partyKicked':
        console.log('你被踢出队伍')
        set({ currentParty: null })
        break

      case 'partyError':
        console.error('队伍错误:', payload.error)
        break

      default:
        console.log('未知消息类型:', type)
    }
  },

  /**
   * 发送好友请求
   */
  sendFriendRequest: (friendUserId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'friendRequest',
        data: { friendUserId },
      }))
    }
  },

  /**
   * 接受好友请求
   */
  acceptFriendRequest: (friendUserId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'friendAccept',
        data: { friendUserId },
      }))
    }
  },

  /**
   * 拒绝好友请求
   */
  rejectFriendRequest: (friendUserId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'friendReject',
        data: { friendUserId },
      }))
    }
  },

  /**
   * 删除好友
   */
  removeFriend: (friendUserId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'friendRemove',
        data: { friendUserId },
      }))
    }
  },

  /**
   * 获取好友列表
   */
  fetchFriends: async () => {
    // 简化处理：暂时只记录日志
    // 实际项目中应通过 HTTP API 获取
    console.log('获取好友列表')
  },

  /**
   * 获取待处理请求
   */
  fetchPendingRequests: async () => {
    // 简化处理：暂时只记录日志
    // 实际项目中应通过 HTTP API 获取
    console.log('获取好友请求')
  },

  /**
   * 创建队伍
   */
  createParty: (name?: string, isPublic?: boolean) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'partyCreate',
        data: { name, isPublic },
      }))
    }
  },

  /**
   * 加入队伍
   */
  joinParty: (partyId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'partyJoin',
        data: { partyId },
      }))
    }
  },

  /**
   * 离开队伍
   */
  leaveParty: (partyId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'partyLeave',
        data: { partyId },
      }))
    }
  },

  /**
   * 踢出成员
   */
  kickMember: (partyId: string, targetId: string) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'partyKick',
        data: { partyId, targetId },
      }))
    }
  },

  /**
   * 获取队伍信息
   */
  fetchParty: async () => {
    // 简化处理：暂时只记录日志
    // 实际项目中应通过 HTTP API 获取
    console.log('获取队伍信息')
  },

  /**
   * 发送聊天消息
   */
  sendMessage: (type: string, content: string, options?: any) => {
    const { ws } = get()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat',
        data: {
          type,
          content,
          ...options,
        },
      }))
    }
  },

  /**
   * 添加消息
   */
  addMessage: (message: ChatMessage) => {
    const { messages, chatHistory } = get()
    
    // 添加到消息列表
    set({ messages: [...messages, message] })

    // 添加到历史记录
    const key = message.type === 'whisper' 
      ? `whisper_${message.senderId}_${message.receiverId}`
      : message.type === 'party'
      ? `party_${message.partyId}`
      : message.type === 'zone'
      ? `zone_${message.zoneId}`
      : 'global'

    const history = chatHistory.get(key) || []
    chatHistory.set(key, [...history.slice(-99), message])
    set({ chatHistory })
  },

  /**
   * 获取聊天记录
   */
  fetchChatHistory: async (type: string, targetId?: string) => {
    // 简化处理：暂时只记录日志
    // 实际项目中应通过 HTTP API 获取
    console.log('获取聊天记录:', type, targetId)
  },
}))
