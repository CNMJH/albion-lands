import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import './DeathStatsPanel.css';

interface DeathRecord {
  id: string;
  characterId: string;
  killerCharacterId?: string;
  killerName?: string;
  mapId: string;
  mapName: string;
  safetyLevel: number;
  level: number;
  expLost: number;
  itemsDropped: number;
  durabilityLost: number;
  createdAt: string;
}

interface DeathStats {
  totalDeaths: number;
  deathsByPVP: number;
  deathsByPVE: number;
  totalExpLost: number;
  totalItemsDropped: number;
  totalDurabilityLost: number;
  mostDangerousMap: string;
  averageLevelAtDeath: number;
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
      const recordsData = await recordsResponse.json();
      
      if (recordsData.success) {
        setDeathRecords(recordsData.records || []);
        
        // 计算统计数据
        const records = recordsData.records || [];
        const totalDeaths = records.length;
        const deathsByPVP = records.filter((r: DeathRecord) => r.killerCharacterId).length;
        const deathsByPVE = totalDeaths - deathsByPVP;
        const totalExpLost = records.reduce((sum: number, r: DeathRecord) => sum + r.expLost, 0);
        const totalItemsDropped = records.reduce((sum: number, r: DeathRecord) => sum + r.itemsDropped, 0);
        const totalDurabilityLost = records.reduce((sum: number, r: DeathRecord) => sum + r.durabilityLost, 0);
        
        // 最危险的地图
        const mapCounts: Record<string, number> = {};
        records.forEach((r: DeathRecord) => {
          mapCounts[r.mapName] = (mapCounts[r.mapName] || 0) + 1;
        });
        const mostDangerousMap = Object.entries(mapCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        
        // 平均死亡等级
        const averageLevelAtDeath = totalDeaths > 0
          ? Math.round(records.reduce((sum: number, r: DeathRecord) => sum + r.level, 0) / totalDeaths)
          : 0;

        setStats({
          totalDeaths,
          deathsByPVP,
          deathsByPVE,
          totalExpLost,
          totalItemsDropped,
          totalDurabilityLost,
          mostDangerousMap,
          averageLevelAtDeath,
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

            <div className="stat-card">
              <div className="stat-icon">📉</div>
              <div className="stat-value">{stats.totalExpLost.toLocaleString()}</div>
              <div className="stat-label">损失经验</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎒</div>
              <div className="stat-value">{stats.totalItemsDropped}</div>
              <div className="stat-label">掉落物品</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔨</div>
              <div className="stat-value">{stats.totalDurabilityLost}</div>
              <div className="stat-label">耐久损失</div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">☠️</div>
              <div className="stat-value">{stats.mostDangerousMap}</div>
              <div className="stat-label">最危险地图</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">Lv.{stats.averageLevelAtDeath}</div>
              <div className="stat-label">平均死亡等级</div>
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
                    <th>等级</th>
                    <th>击杀者</th>
                    <th>经验损失</th>
                    <th>物品掉落</th>
                    <th>耐久损失</th>
                  </tr>
                </thead>
                <tbody>
                  {deathRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatTime(record.createdAt)}</td>
                      <td>{record.mapName}</td>
                      <td>Lv.{record.level}</td>
                      <td>
                        {record.killerName ? (
                          <span className="killer-pvp">⚔️ {record.killerName}</span>
                        ) : (
                          <span className="killer-pve">👹 PVE</span>
                        )}
                      </td>
                      <td className="exp-lost">-{record.expLost.toLocaleString()}</td>
                      <td>{record.itemsDropped}</td>
                      <td>-{record.durabilityLost}</td>
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
