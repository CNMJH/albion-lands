import React, { useState } from 'react'
import { useSocialStore } from '../systems/SocialSystem'
import './FriendsUI.css'

/**
 * 好友 UI 组件
 */
export const FriendsUI: React.FC = () => {
  const [showFriends, setShowFriends] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [addFriendId, setAddFriendId] = useState('')
  
  const {
    friends,
    pendingRequests,
    currentParty,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    createParty,
    leaveParty,
  } = useSocialStore()

  const handleAddFriend = () => {
    if (addFriendId.trim()) {
      sendFriendRequest(addFriendId.trim())
      setAddFriendId('')
    }
  }

  const onlineFriends = friends.filter(f => f.friend.isOnline)
  const offlineFriends = friends.filter(f => !f.friend.isOnline)

  return (
    <div className="friends-ui">
      {/* 好友按钮 */}
      <button 
        className="friends-toggle-btn"
        onClick={() => setShowFriends(!showFriends)}
      >
        👥 好友
      </button>

      {/* 好友面板 */}
      {showFriends && (
        <div className="friends-panel">
          <div className="friends-header">
            <h3>好友列表</h3>
            <button 
              className="close-btn"
              onClick={() => setShowFriends(false)}
            >
              ✕
            </button>
          </div>

          {/* 添加好友 */}
          <div className="add-friend-section">
            <input
              type="text"
              placeholder="输入用户 ID"
              value={addFriendId}
              onChange={(e) => setAddFriendId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
            />
            <button onClick={handleAddFriend}>添加</button>
          </div>

          {/* 选项卡 */}
          <div className="friends-tabs">
            <button
              className={showRequests ? 'active' : ''}
              onClick={() => setShowRequests(true)}
            >
              好友请求 ({pendingRequests.length})
            </button>
            <button
              className={!showRequests ? 'active' : ''}
              onClick={() => setShowRequests(false)}
            >
              好友列表 ({friends.length})
            </button>
          </div>

          {/* 好友请求 */}
          {showRequests && (
            <div className="requests-list">
              {pendingRequests.length === 0 ? (
                <p className="empty-text">没有新请求</p>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <span className="request-name">{request.friend.name}</span>
                      <span className="request-level">Lv.{request.friend.level}</span>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => acceptFriendRequest(request.userId)}
                      >
                        接受
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => rejectFriendRequest(request.userId)}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 好友列表 */}
          {!showRequests && (
            <div className="friends-list">
              {/* 在线好友 */}
              <div className="friends-section">
                <h4>在线好友 ({onlineFriends.length})</h4>
                {onlineFriends.length === 0 ? (
                  <p className="empty-text">没有在线好友</p>
                ) : (
                  onlineFriends.map(friend => (
                    <div key={friend.id} className="friend-item online">
                      <div className="friend-info">
                        <span className="friend-name">{friend.friend.name}</span>
                        <span className="friend-level">Lv.{friend.friend.level}</span>
                        <span className="friend-zone">{friend.friend.zoneId}</span>
                      </div>
                      <div className="friend-actions">
                        <button className="action-btn">密聊</button>
                        <button className="action-btn">组队</button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFriend(friend.friendId)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 离线好友 */}
              <div className="friends-section">
                <h4>离线好友 ({offlineFriends.length})</h4>
                {offlineFriends.length === 0 ? (
                  <p className="empty-text">没有离线好友</p>
                ) : (
                  offlineFriends.map(friend => (
                    <div key={friend.id} className="friend-item offline">
                      <div className="friend-info">
                        <span className="friend-name">{friend.friend.name}</span>
                        <span className="friend-level">Lv.{friend.friend.level}</span>
                      </div>
                      <div className="friend-actions">
                        <button className="remove-btn" onClick={() => removeFriend(friend.friendId)}>
                          删除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 队伍信息 */}
          {currentParty && (
            <div className="party-section">
              <h4>当前队伍</h4>
              <div className="party-info">
                <div className="party-header">
                  <span>{currentParty.name || '未命名队伍'}</span>
                  <span>{currentParty.members.length}/{currentParty.maxMembers}</span>
                </div>
                <div className="party-members">
                  {currentParty.members.map(member => (
                    <div key={member.id} className="party-member">
                      <span className="member-name">
                        {member.role === 'Leader' ? '👑' : ''}
                        {member.character.name}
                      </span>
                      <span className="member-level">Lv.{member.character.level}</span>
                      <span className={`member-status ${member.character.isOnline ? 'online' : 'offline'}`}>
                        {member.character.isOnline ? '在线' : '离线'}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  className="leave-party-btn"
                  onClick={() => leaveParty(currentParty.id)}
                >
                  离开队伍
                </button>
              </div>
            </div>
          )}

          {/* 创建队伍按钮 */}
          {!currentParty && (
            <div className="create-party-section">
              <button 
                className="create-party-btn"
                onClick={() => createParty(undefined, false)}
              >
                创建队伍
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
