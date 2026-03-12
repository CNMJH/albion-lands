import React, { useState, useRef, useEffect } from 'react'
import { useSocialStore } from '../systems/SocialSystem'
import './ChatUI.css'

/**
 * 聊天 UI 组件
 */
export const ChatUI: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [activeChannel, setActiveChannel] = useState<'local' | 'party' | 'global'>('local')
  
  const {
    messages,
    currentParty,
    sendMessage,
  } = useSocialStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSend = () => {
    if (inputMessage.trim()) {
      let type = 'zone' // 本地聊天使用 zone 类型
      
      if (activeChannel === 'party') {
        if (!currentParty) {
          console.warn('不在队伍中')
          return
        }
        type = 'party'
        sendMessage(type, inputMessage.trim(), { partyId: currentParty.id })
      } else if (activeChannel === 'global') {
        type = 'global'
        sendMessage(type, inputMessage.trim())
      } else {
        // 本地/区域聊天
        sendMessage(type, inputMessage.trim(), { zoneId: 'zone_1' })
      }

      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  // 过滤当前频道的消息
  const filteredMessages = messages.filter(msg => {
    if (activeChannel === 'party') {
      return msg.type === 'party' && msg.partyId === currentParty?.id
    } else if (activeChannel === 'global') {
      return msg.type === 'global'
    } else {
      // 本地显示 zone 和 whisper
      return msg.type === 'zone' || msg.type === 'whisper'
    }
  }).slice(-100) // 只显示最新 100 条

  return (
    <div className="chat-ui">
      {/* 聊天窗口 */}
      <div className={`chat-window ${isExpanded ? 'expanded' : ''}`}>
        {/* 频道选择 */}
        <div className="chat-channels">
          <button
            className={`channel-btn ${activeChannel === 'local' ? 'active' : ''}`}
            onClick={() => setActiveChannel('local')}
          >
            本地
          </button>
          <button
            className={`channel-btn ${activeChannel === 'party' ? 'active' : ''} ${!currentParty ? 'disabled' : ''}`}
            onClick={() => currentParty && setActiveChannel('party')}
            disabled={!currentParty}
          >
            队伍 {currentParty && `(${currentParty.members.length})`}
          </button>
          <button
            className={`channel-btn ${activeChannel === 'global' ? 'active' : ''}`}
            onClick={() => setActiveChannel('global')}
          >
            世界
          </button>
        </div>

        {/* 消息区域 */}
        <div className="chat-messages">
          {filteredMessages.length === 0 ? (
            <div className="no-messages">暂无消息</div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div key={msg.id || index} className="chat-message">
                <span className={`message-type type-${msg.type}`}>
                  {msg.type === 'whisper' && '📩 '}
                  {msg.type === 'party' && '👥 '}
                  {msg.type === 'zone' && '📍 '}
                  {msg.type === 'global' && '🌍 '}
                </span>
                <span className="message-sender">
                  {msg.senderName || '未知'}
                </span>
                <span className="message-content">{msg.content}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        {isExpanded && (
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                activeChannel === 'party' 
                  ? '队伍聊天...' 
                  : activeChannel === 'global'
                  ? '世界聊天...'
                  : '本地聊天...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={500}
            />
            <button onClick={handleSend}>发送</button>
          </div>
        )}
      </div>

      {/* 展开/收起按钮 */}
      <button
        className="chat-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▲'}
      </button>
    </div>
  )
}
