import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import './MarketPanel.css';

interface MarketOrder {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerName: string;
  type: 'SELL' | 'BUY';
  status: string;
  expiresAt: string;
}

interface TransactionHistory {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  tax: number;
  isSeller: boolean;
  otherPartyName: string;
  createdAt: string;
}

export const MarketPanel: React.FC = () => {
  const { characterId, marketSystem } = useGameStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'history'>('buy');
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [myOrders, setMyOrders] = useState<MarketOrder[]>([]);
  const [history, setHistory] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchItemId, setSearchItemId] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 上架表单
  const [sellItemId, setSellItemId] = useState('');
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(100);
  const [sellDuration, setSellDuration] = useState(24);

  // 购买数量
  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);

  useEffect(() => {
    if (activeTab === 'buy') {
      loadMarketOrders();
    } else if (activeTab === 'sell') {
      loadMyOrders();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadMarketOrders = async () => {
    setLoading(true);
    try {
      const result = await marketSystem?.getMarketOrders(
        searchItemId || undefined,
        'SELL',
        sortBy,
        sortOrder
      );
      setOrders(result || []);
    } catch (error) {
      console.error('加载市场订单失败:', error);
    }
    setLoading(false);
  };

  const loadMyOrders = async () => {
    setLoading(true);
    try {
      const result = await marketSystem?.getMyOrders();
      setMyOrders(result || []);
    } catch (error) {
      console.error('加载我的订单失败:', error);
    }
    setLoading(false);
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await marketSystem?.getTransactionHistory(50);
      setHistory(result || []);
    } catch (error) {
      console.error('加载交易历史失败:', error);
    }
    setLoading(false);
  };

  const handleCreateOrder = async () => {
    if (!sellItemId || !characterId) {
      alert('请填写物品 ID');
      return;
    }

    setLoading(true);
    try {
      const result = await marketSystem?.createOrder(
        sellItemId,
        sellQuantity,
        sellPrice,
        'SELL',
        sellDuration
      );

      if (result?.success) {
        alert('✅ 订单创建成功！');
        setSellItemId('');
        setSellQuantity(1);
        setSellPrice(100);
        loadMyOrders();
      } else {
        alert(`❌ 创建失败：${result?.message}`);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('❌ 创建订单失败');
    }
    setLoading(false);
  };

  const handleBuyOrder = async (order: MarketOrder) => {
    if (!characterId) {
      alert('角色 ID 不存在');
      return;
    }

    setLoading(true);
    try {
      const result = await marketSystem?.buyOrder(order.id, 1);

      if (result?.success) {
        alert(`✅ 购买成功！\n数量：${result.quantity}\n总价：💰${result.totalPrice}\n税费：💰${result.tax}`);
        loadMarketOrders();
      } else {
        alert(`❌ 购买失败：${result?.message}`);
      }
    } catch (error) {
      console.error('购买失败:', error);
      alert('❌ 购买失败');
    }
    setLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消这个订单吗？')) return;

    setLoading(true);
    try {
      const result = await marketSystem?.cancelOrder(orderId);

      if (result?.success) {
        alert('✅ 订单已取消');
        loadMyOrders();
      } else {
        alert(`❌ 取消失败：${result?.message}`);
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      alert('❌ 取消订单失败');
    }
    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="market-panel">
      <div className="market-header">
        <h2>🏪 拍卖行</h2>
        <button className="close-btn" onClick={() => useGameStore.getState().setUIState('market', false)}>✕</button>
      </div>

      {/* 标签页 */}
      <div className="market-tabs">
        <button
          className={`tab ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          🛒 购买
        </button>
        <button
          className={`tab ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          📝 出售
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 交易历史
        </button>
      </div>

      {/* 购买页面 */}
      {activeTab === 'buy' && (
        <div className="market-content">
          <div className="market-filters">
            <input
              type="text"
              placeholder="物品 ID 搜索"
              value={searchItemId}
              onChange={(e) => setSearchItemId(e.target.value)}
              className="filter-input"
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="price">价格</option>
              <option value="time">时间</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
              <option value="asc">↑ 升序</option>
              <option value="desc">↓ 降序</option>
            </select>
            <button onClick={loadMarketOrders} disabled={loading} className="search-btn">
              🔍 搜索
            </button>
          </div>

          <div className="market-orders">
            {loading ? (
              <div className="loading">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="empty">暂无订单</div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>物品</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>总价</th>
                    <th>卖家</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={selectedOrder?.id === order.id ? 'selected' : ''}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td>{order.itemName}</td>
                      <td>x{order.quantity}</td>
                      <td className="price">💰{order.unitPrice}</td>
                      <td className="price">💰{order.totalPrice}</td>
                      <td>{order.sellerName}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyOrder(order);
                          }}
                          className="buy-btn"
                          disabled={loading}
                        >
                          购买
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 出售页面 */}
      {activeTab === 'sell' && (
        <div className="market-content">
          <div className="sell-form">
            <h3>📝 创建订单</h3>
            <div className="form-group">
              <label>物品 ID:</label>
              <input
                type="text"
                value={sellItemId}
                onChange={(e) => setSellItemId(e.target.value)}
                placeholder="输入物品 ID"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>数量:</label>
                <input
                  type="number"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>单价:</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseInt(e.target.value) || 100)}
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>有效期:</label>
              <select value={sellDuration} onChange={(e) => setSellDuration(parseInt(e.target.value))}>
                <option value="24">24 小时</option>
                <option value="48">48 小时</option>
                <option value="72">72 小时</option>
              </select>
            </div>
            <div className="form-summary">
              <p>上架费：💰{Math.floor(sellPrice * sellQuantity * 0.01)}</p>
              <p>预计收入：💰{Math.floor(sellPrice * sellQuantity * 0.95)}</p>
            </div>
            <button onClick={handleCreateOrder} disabled={loading || !sellItemId} className="create-btn">
              📝 创建订单
            </button>
          </div>

          <div className="my-orders">
            <h3>📋 我的订单</h3>
            <button onClick={loadMyOrders} className="refresh-btn" disabled={loading}>
              🔄 刷新
            </button>
            {loading ? (
              <div className="loading">加载中...</div>
            ) : myOrders.length === 0 ? (
              <div className="empty">暂无订单</div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>物品</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>状态</th>
                    <th>过期时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.itemName}</td>
                      <td>x{order.quantity}</td>
                      <td className="price">💰{order.unitPrice}</td>
                      <td>
                        <span className={`status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatTime(order.expiresAt)}</td>
                      <td>
                        {order.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="cancel-btn"
                            disabled={loading}
                          >
                            取消
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 交易历史页面 */}
      {activeTab === 'history' && (
        <div className="market-content">
          <div className="history-header">
            <h3>📜 交易历史</h3>
            <button onClick={loadHistory} className="refresh-btn" disabled={loading}>
              🔄 刷新
            </button>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : history.length === 0 ? (
            <div className="empty">暂无交易记录</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>物品</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>总价</th>
                  <th>税费</th>
                  <th>交易方</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id} className={tx.isSeller ? 'seller' : 'buyer'}>
                    <td>{tx.itemName}</td>
                    <td>x{tx.quantity}</td>
                    <td className="price">💰{tx.price}</td>
                    <td className="price">💰{tx.totalPrice}</td>
                    <td className="tax">💰{tx.tax}</td>
                    <td>{tx.otherPartyName}</td>
                    <td>{formatTime(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
