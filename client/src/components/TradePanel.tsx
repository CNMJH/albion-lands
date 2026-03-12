import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import './TradePanel.css';

interface TradeItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

interface TradeDetails {
  id: string;
  initiatorId: string;
  initiatorName: string;
  recipientId: string;
  recipientName: string;
  status: string;
  initiatorItems: TradeItem[];
  recipientItems: TradeItem[];
  initiatorSilver: number;
  recipientSilver: number;
  initiatorConfirmed: boolean;
  recipientConfirmed: boolean;
}

export const TradePanel: React.FC = () => {
  const { tradeSystem } = useGameStore();
  const [trade, setTrade] = useState<TradeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [silver, setSilver] = useState(0);

  // 从背包中选择物品（简化版，实际应从背包组件获取）
  const [inventoryItems] = useState<TradeItem[]>([
    { itemId: 'iron_sword', itemName: '铁剑', quantity: 10 },
    { itemId: 'leather_armor', itemName: '皮甲', quantity: 5 },
    { itemId: 'health_potion', itemName: '生命药水', quantity: 20 },
  ]);

  useEffect(() => {
    // 定时刷新交易状态
    const tradeId = trade?.id;
    if (tradeId && (trade?.status === 'PENDING' || trade?.status === 'ACCEPTED')) {
      const interval = setInterval(() => {
        refreshTrade();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [trade]);

  const refreshTrade = async () => {
    if (!trade?.id) return;
    try {
      const result = await tradeSystem?.getTradeDetails(trade.id);
      if (result) {
        setTrade(result);
      }
    } catch (error) {
      console.error('刷新交易失败:', error);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItem || !trade?.id) {
      alert('请选择物品');
      return;
    }

    setLoading(true);
    try {
      const result = await tradeSystem?.addItem(trade.id, selectedItem, quantity);
      if (result?.success) {
        alert('✅ 物品已添加到交易');
        refreshTrade();
      } else {
        alert(`❌ 添加失败：${result?.message}`);
      }
    } catch (error) {
      console.error('添加物品失败:', error);
      alert('❌ 添加物品失败');
    }
    setLoading(false);
  };

  const handleSetSilver = async () => {
    if (!trade?.id) return;

    setLoading(true);
    try {
      const result = await tradeSystem?.setSilver(trade.id, silver);
      if (result?.success) {
        alert('✅ 银币已设置');
        refreshTrade();
      } else {
        alert(`❌ 设置失败：${result?.message}`);
      }
    } catch (error) {
      console.error('设置银币失败:', error);
      alert('❌ 设置银币失败');
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!trade?.id || !confirm('确认交易？\n请仔细检查交易内容！')) return;

    setLoading(true);
    try {
      const result = await tradeSystem?.confirm(trade.id);
      if (result?.success) {
        alert('✅ 交易已确认！等待对方确认...');
        refreshTrade();
      } else {
        alert(`❌ 确认失败：${result?.message}`);
      }
    } catch (error) {
      console.error('确认交易失败:', error);
      alert('❌ 确认交易失败');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!trade?.id || !confirm('确定取消交易？')) return;

    setLoading(true);
    try {
      const result = await tradeSystem?.cancel(trade.id);
      if (result?.success) {
        alert('❌ 交易已取消');
        setTrade(null);
      } else {
        alert(`❌ 取消失败：${result?.message}`);
      }
    } catch (error) {
      console.error('取消交易失败:', error);
      alert('❌ 取消交易失败');
    }
    setLoading(false);
  };

  if (!trade) {
    return (
      <div className="trade-panel trade-empty">
        <div className="trade-message">
          <h3>🤝 交易</h3>
          <p>等待交易邀请...</p>
          <p className="hint">靠近其他玩家并按 E 键发起交易</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-panel">
      <div className="trade-header">
        <h3>🤝 交易</h3>
        <button className="close-btn" onClick={handleCancel} disabled={loading}>✕</button>
      </div>

      <div className="trade-content">
        {/* 对方区域 */}
        <div className="trade-side">
          <h4 className="trade-side-title">{trade.initiatorName}</h4>
          <div className="trade-items">
            {trade.initiatorItems.length === 0 ? (
              <p className="empty">暂无物品</p>
            ) : (
              <ul className="item-list">
                {trade.initiatorItems.map((item, idx) => (
                  <li key={idx} className="item-row">
                    <span className="item-name">{item.itemName}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="trade-silver">
            💰 银币：<span className="silver-value">{trade.initiatorSilver}</span>
          </div>
          <div className="trade-status">
            {trade.initiatorConfirmed ? (
              <span className="confirmed">✅ 已确认</span>
            ) : (
              <span className="pending">⏳ 待确认</span>
            )}
          </div>
        </div>

        {/* 中间操作区 */}
        <div className="trade-divider">
          <span className="vs">VS</span>
        </div>

        {/* 我方区域 */}
        <div className="trade-side">
          <h4 className="trade-side-title">我</h4>
          
          {/* 添加物品 */}
          <div className="add-item-section">
            <select 
              value={selectedItem || ''} 
              onChange={(e) => setSelectedItem(e.target.value)}
              className="item-select"
            >
              <option value="">选择物品</option>
              {inventoryItems.map(item => (
                <option key={item.itemId} value={item.itemId}>
                  {item.itemName} (x{item.quantity})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="quantity-input"
            />
            <button 
              onClick={handleAddItem} 
              disabled={loading || !selectedItem}
              className="add-btn"
            >
              添加
            </button>
          </div>

          {/* 设置银币 */}
          <div className="add-silver-section">
            <input
              type="number"
              value={silver}
              onChange={(e) => setSilver(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="银币数量"
              className="silver-input"
            />
            <button 
              onClick={handleSetSilver} 
              disabled={loading}
              className="set-silver-btn"
            >
              设置银币
            </button>
          </div>

          {/* 我的交易物品 */}
          <div className="trade-items">
            {trade.recipientItems.length === 0 ? (
              <p className="empty">暂无物品</p>
            ) : (
              <ul className="item-list">
                {trade.recipientItems.map((item, idx) => (
                  <li key={idx} className="item-row">
                    <span className="item-name">{item.itemName}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 我的银币 */}
          <div className="trade-silver">
            💰 银币：<span className="silver-value">{trade.recipientSilver}</span>
          </div>

          {/* 确认状态 */}
          <div className="trade-status">
            {trade.recipientConfirmed ? (
              <span className="confirmed">✅ 已确认</span>
            ) : (
              <span className="pending">⏳ 待确认</span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="trade-actions">
            <button 
              onClick={handleConfirm} 
              disabled={loading}
              className="confirm-btn"
            >
              ✅ 确认交易
            </button>
            <button 
              onClick={handleCancel} 
              disabled={loading}
              className="cancel-btn"
            >
              ❌ 取消
            </button>
          </div>
        </div>
      </div>

      {/* 交易状态提示 */}
      {trade.initiatorConfirmed && trade.recipientConfirmed && (
        <div className="trade-success">
          🎉 双方已确认，交易即将完成...
        </div>
      )}
    </div>
  );
};
