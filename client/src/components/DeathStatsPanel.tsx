import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import './DeathStatsPanel.css';

interface DeathRecord {
  id: string;
  characterId: string;
  killerCharacterId?: string;
  killerName?: string;
  mapId: string;
  safetyLevel: number;
  createdAt: string;
}

interface DeathStats {
  totalDeaths: number;
  deathsByPVP: number;
  deathsByPVE: number;
  mostDangerousMap: string;
}

export const DeathStatsPanel: React.FC = () => {
  const { characterId } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [deathRecords, setDeathRecords] = useState<DeathRecord[]>([]);
  const [stats, setStats] = useState<DeathStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'records'>('stats');

  useEffect(() => {
    if (isOpen && characterId) {
      loadDeathStats();
    }
  }, [isOpen, characterId]);

  const loadDeathStats = async () => {
    if (!characterId) return;
    
    setLoading(true);
    try {
      // 加载死亡记录
      const recordsResponse = await fetch(`http://localhost:3002/api/v1/combat/deaths/${characterId}?limit=50`);
      
      if (!recordsResponse.ok) {
        console.error('加载死亡记录响应错误:', recordsResponse.status);
        return;
      }
      
      const recordsData = await recordsResponse.json();
      
      if (recordsData.success) {
        setDeathRecords(recordsData.records || []);
        
        // 计算统计数据
        const records = recordsData.records || [];
        const totalDeaths = records.length;
        const deathsByPVP = records.filter((r: DeathRecord) => r.killerCharacterId).length;
        const deathsByPVE = totalDeaths - deathsByPVP;
        
        // 最危险的地图
        const mapCounts: Record<string, number> = {};
        records.forEach((r: DeathRecord) => {
          mapCounts[r.mapId] = (mapCounts[r.mapId] || 0) + 1;
        });
        const mostDangerousMap = Object.entries(mapCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          totalDeaths,
          deathsByPVP,
          deathsByPVE,
          mostDangerousMap,
        });
      }
    } catch (error) {
      console.error('加载死亡统计失败:', error);
    }
    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  if (!isOpen) {
    return (
      <button className="death-stats-toggle" onClick={() => setIsOpen(true)}>
        💀 死亡统计
      </button>
    );
  }

  return (
    <div className="death-stats-panel">
      <div className="death-stats-header">
        <h3>💀 死亡统计</h3>
        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div className="death-stats-tabs">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 统计数据
        </button>
        <button
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📜 死亡记录
        </button>
      </div>

      <div className="death-stats-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : activeTab === 'stats' && stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💀</div>
              <div className="stat-value">{stats.totalDeaths}</div>
              <div className="stat-label">总死亡次数</div>
            </div>

            <div className="stat-card pvp">
              <div className="stat-icon">⚔️</div>
              <div className="stat-value">{stats.deathsByPVP}</div>
              <div className="stat-label">PVP 死亡</div>
            </div>

            <div className="stat-card pve">
              <div className="stat-icon">👹</div>
              <div className="stat-value">{stats.deathsByPVE}</div>
              <div className="stat-label">PVE 死亡</div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">☠️</div>
              <div className="stat-value">{stats.mostDangerousMap}</div>
              <div className="stat-label">最危险地图</div>
            </div>
          </div>
        ) : activeTab === 'records' ? (
          <div className="records-list">
            {deathRecords.length === 0 ? (
              <div className="empty">暂无死亡记录</div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>地图</th>
                    <th>击杀者</th>
                    <th>类型</th>
                  </tr>
                </thead>
                <tbody>
                  {deathRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatTime(record.createdAt)}</td>
                      <td>{record.mapId}</td>
                      <td>
                        {record.killerName ? (
                          <span className="killer-pvp">⚔️ {record.killerName}</span>
                        ) : (
                          <span className="killer-pve">👹 PVE</span>
                        )}
                      </td>
                      <td>
                        {record.killerCharacterId ? 'PVP' : 'PVE'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
