/**
 * 市场系统
 * 处理拍卖行交易逻辑
 */
export class MarketSystem {
  private characterId: string;

  constructor(characterId: string) {
    this.characterId = characterId;
  }

  /**
   * 创建订单
   */
  async createOrder(
    itemId: string,
    quantity: number,
    unitPrice: number,
    type: 'SELL' | 'BUY' = 'SELL',
    duration: number = 24
  ): Promise<any> {
    try {
      const response = await fetch('http://localhost:3002/api/v1/market/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: this.characterId,
          itemId,
          quantity,
          unitPrice,
          type,
          duration,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('🏪 订单创建成功');
      } else {
        console.error('❌ 订单创建失败:', result.message);
      }

      return result;
    } catch (error) {
      console.error('🏪 创建订单失败:', error);
      return { success: false, message: '网络错误' };
    }
  }

  /**
   * 查询市场
   */
  async getMarketOrders(
    itemId?: string,
    type: 'SELL' | 'BUY' = 'SELL',
    sortBy: 'price' | 'time' = 'price',
    sortOrder: 'asc' | 'desc' = 'asc',
    limit: number = 50
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        type,
        sortBy,
        sortOrder,
        limit: limit.toString(),
      });

      if (itemId) {
        params.append('itemId', itemId);
      }

      const response = await fetch(`http://localhost:3002/api/v1/market/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        return result.orders;
      }

      return [];
    } catch (error) {
      console.error('🏪 查询市场失败:', error);
      return [];
    }
  }

  /**
   * 购买物品
   */
  async buyOrder(orderId: string, quantity: number): Promise<any> {
    try {
      const response = await fetch('http://localhost:3002/api/v1/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          buyerId: this.characterId,
          quantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ 购买成功');
      } else {
        console.error('❌ 购买失败:', result.message);
      }

      return result;
    } catch (error) {
      console.error('🏪 购买失败:', error);
      return { success: false, message: '网络错误' };
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await fetch('http://localhost:3002/api/v1/market/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          sellerId: this.characterId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('❌ 订单已取消');
      } else {
        console.error('❌ 取消失败:', result.message);
      }

      return result;
    } catch (error) {
      console.error('🏪 取消订单失败:', error);
      return { success: false, message: '网络错误' };
    }
  }

  /**
   * 获取我的订单
   */
  async getMyOrders(status?: string): Promise<any> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await fetch(`http://localhost:3002/api/v1/market/seller/${this.characterId}${params}`);
      const result = await response.json();

      if (result.success) {
        return result.orders;
      }

      return [];
    } catch (error) {
      console.error('🏪 获取我的订单失败:', error);
      return [];
    }
  }

  /**
   * 获取交易历史
   */
  async getTransactionHistory(limit: number = 20): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/market/history/${this.characterId}?limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        return result.history;
      }

      return [];
    } catch (error) {
      console.error('🏪 获取交易历史失败:', error);
      return [];
    }
  }

  /**
   * 获取平均价格
   */
  async getAveragePrice(itemId: string, days: number = 7): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/market/price/${itemId}?days=${days}`);
      const result = await response.json();

      if (result.success) {
        return result.averagePrice;
      }

      return null;
    } catch (error) {
      console.error('🏪 获取平均价格失败:', error);
      return null;
    }
  }
}
