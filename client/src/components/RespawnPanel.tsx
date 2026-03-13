import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import './RespawnPanel.css';

export const RespawnPanel: React.FC = () => {
  const { characterId } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [respawnPoint, setRespawnPoint] = useState<{ mapId: string; x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && characterId) {
      loadRespawnPoint();
    }
  }, [isOpen, characterId]);

  const loadRespawnPoint = async () => {
    if (!characterId) return;
    
    try {
      const response = await fetch(`http://localhost:3002/api/v1/respawn/${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setRespawnPoint(data.data);
      }
    } catch (error) {
      console.error('加载复活点失败:', error);
    }
  };

  const bindCurrentLocation = async () => {
    if (!characterId) return;
    
    setLoading(true);
    try {
      // 从 gameStore 获取当前位置
      const player = useGameStore.getState().player;
      if (!player) {
        showMessage('error', '无法获取当前位置');
        return;
      }

      const response = await fetch('http://localhost:3002/api/v1/respawn/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          mapId: player.zoneId,
          x: player.x,
          y: player.y
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRespawnPoint({ mapId: player.zoneId, x: player.x, y: player.y });
        showMessage('success', `复活点已绑定到当前位置 (${player.zoneId})`);
      } else {
        showMessage('error', data.error || '绑定失败');
      }
    } catch (error) {
      console.error('绑定复活点失败:', error);
      showMessage('error', '绑定失败，请重试');
    }
    setLoading(false);
  };

  const resetRespawn = async () => {
    if (!characterId) return;
    
    if (!confirm('确定要重置复活点到初始城市吗？')) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/v1/respawn/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId })
      });

      const data = await response.json();
      
      if (data.success) {
        setRespawnPoint({ mapId: 'starter_city', x: 0, y: 0 });
        showMessage('success', '复活点已重置到初始城市');
      } else {
        showMessage('error', data.error || '重置失败');
      }
    } catch (error) {
      console.error('重置复活点失败:', error);
      showMessage('error', '重置失败，请重试');
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (!isOpen) {
    return (
      <button className="respawn-toggle" onClick={() => setIsOpen(true)}>
        ⚰️ 复活点
      </button>
    );
  }

  return (
    <div className="respawn-panel">
      <div className="respawn-header">
        <h3>⚰️ 复活点绑定</h3>
        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div className="respawn-content">
        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="current-location">
          <h4>📍 当前绑定</h4>
          {respawnPoint ? (
            <div className="respawn-info">
              <div className="info-row">
                <span className="label">地图:</span>
                <span className="value">{respawnPoint.mapId}</span>
              </div>
              <div className="info-row">
                <span className="label">坐标:</span>
                <span className="value">({respawnPoint.x.toFixed(0)}, {respawnPoint.y.toFixed(0)})</span>
              </div>
            </div>
          ) : (
            <div className="no-respawn">
              <p>未绑定复活点</p>
              <p className="hint">死亡后将在初始城市复活</p>
            </div>
          )}
        </div>

        <div className="actions">
          <button 
            className="btn btn-primary" 
            onClick={bindCurrentLocation}
            disabled={loading}
          >
            {loading ? '绑定中...' : '📍 绑定当前位置'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={resetRespawn}
            disabled={loading}
          >
            {loading ? '处理中...' : '🔄 重置到初始城市'}
          </button>
        </div>

        <div className="tips">
          <h4>💡 提示</h4>
          <ul>
            <li>绑定复活点后，死亡将在绑定位置复活</li>
            <li>可以随时重置回初始城市</li>
            <li>建议在安全区域绑定复活点</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
