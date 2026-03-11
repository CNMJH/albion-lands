import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import './ChatBox.css'

interface ChatMessage {
  id: string
  channel: string
  sender: string
  content: string
  timestamp: number
}

/**
 * 聊天框组件
 * 显示聊天信息和发送消息
 */
export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', channel: 'system', sender: '系统', content: '欢迎来到呼噜大陆！', timestamp: Date.now() },
    { id: '2', channel: 'system', sender: '系统', content: '按 Enter 打开聊天框，使用 /help 查看帮助', timestamp: Date.now() },
  ])
  const combatLog = useGameStore(state => state.combatLog)
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 监听战斗日志
  useEffect(() => {
    if (combatLog.length > 0) {
      const lastLog = combatLog[combatLog.length - 1]
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        channel: 'combat',
        sender: '战斗',
        content: lastLog,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [combatLog])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isFocused) {
        e.preventDefault()
        inputRef.current?.focus()
        setIsFocused(true)
      } else if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        setIsFocused(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused])

  const sendMessage = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      channel: 'local',
      sender: '我',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    inputRef.current?.blur()
    setIsFocused(false)

    // TODO: 发送到服务器
    console.log('发送消息:', input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'system': return '#f39c12'
      case 'local': return '#ffffff'
      case 'party': return '#3498db'
      case 'guild': return '#9b59b6'
      case 'trade': return '#2ecc71'
      case 'combat': return '#e74c3c'
      default: return '#ffffff'
    }
  }

  return (
    <div className="chat-box">
      {/* 聊天消息区域 */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <span 
              className="chat-sender"
              style={{ color: getChannelColor(msg.channel) }}
            >
              [{msg.channel}] {msg.sender}:
            </span>
            <span className="chat-content">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? "输入消息..." : "按 Enter 聊天"}
        />
      </div>
    </div>
  )
}
