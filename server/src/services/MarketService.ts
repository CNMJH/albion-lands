import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderParams {
  sellerId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  type?: 'SELL' | 'BUY';
  duration?: number; // 小时
}

export interface BuyOrderParams {
  orderId: string;
  buyerId: string;
  quantity: number;
}

/**
 * 拍卖行服务
 * 实现市场交易系统
 */
export class MarketService {
  private TAX_RATE = 0.05; // 5% 成交税
  private LISTING_FEE = 0.01; // 1% 上架费

  /**
   * 创建订单
   */
  async createOrder(params: CreateOrderParams) {
    const { sellerId, itemId, quantity, unitPrice, type = 'SELL', duration = 24 } = params;

    // 1. 验证卖家存在
    const seller = await prisma.character.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return { success: false, message: '卖家不存在' };
    }

    // 2. 验证物品存在
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 3. 验证价格范围
    if (unitPrice < 1 || unitPrice > 1000000) {
      return { success: false, message: '价格必须在 1-1,000,000 之间' };
    }

    // 4. 验证数量
    if (quantity < 1) {
      return { success: false, message: '数量必须大于 0' };
    }

    // 5. 计算手续费
    const totalPrice = unitPrice * quantity;
    const listingFee = Math.floor(totalPrice * this.LISTING_FEE);

    // 6. 检查银币足够 (上架费)
    if (seller.silver < listingFee) {
      return { success: false, message: `银币不足，需要 ${listingFee} 上架费` };
    }

    // 7. 验证物品所有权 (出售订单)
    if (type === 'SELL') {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId: sellerId,
          itemId,
          quantity: { gte: quantity },
        },
      });

      if (!inventoryItem) {
        return { success: false, message: '物品数量不足' };
      }
    }

    // 8. 计算过期时间
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration);

    // 9. 创建订单 (使用事务)
    const order = await prisma.$transaction(async (tx) => {
      // 扣除上架费
      await tx.character.update({
        where: { id: sellerId },
        data: { silver: { decrement: listingFee } },
      });

      // 创建订单
      const newOrder = await tx.marketOrder.create({
        data: {
          sellerId,
          itemId,
          quantity,
          unitPrice,
          type,
          status: 'ACTIVE',
          expiresAt,
        },
        include: {
          item: true,
        },
      });

      // 如果是出售订单，锁定物品
      if (type === 'SELL') {
        const itemsToDelete = await tx.inventoryItem.findMany({
          where: {
            characterId: sellerId,
            itemId,
          },
          take: 1,
        });
        if (itemsToDelete.length > 0) {
          await tx.inventoryItem.delete({
            where: { id: itemsToDelete[0].id },
          });
        }
      }

      return newOrder;
    });

    return {
      success: true,
      order,
      listingFee,
      message: '订单创建成功',
    };
  }

  /**
   * 查询市场订单
   */
  async getMarketOrders(
    itemId?: string,
    type: 'SELL' | 'BUY' = 'SELL',
    sortBy: 'price' | 'time' = 'price',
    sortOrder: 'asc' | 'desc' = 'asc',
    limit: number = 50
  ) {
    const where: any = {
      status: 'ACTIVE',
      type,
      expiresAt: { gt: new Date() },
    };

    if (itemId) {
      where.itemId = itemId;
    }

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.unitPrice = sortOrder;
    } else if (sortBy === 'time') {
      orderBy.createdAt = sortOrder;
    }

    const orders = await prisma.marketOrder.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        item: true,
        seller: {
          select: { id: true, name: true },
        },
      },
    });

    return orders.map(order => ({
      id: order.id,
      itemId: order.itemId,
      itemName: order.item.name,
      itemType: order.item.type,
      itemRarity: order.item.rarity,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalPrice: order.unitPrice * order.quantity,
      type: order.type,
      sellerId: order.sellerId,
      sellerName: order.seller.name,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    }));
  }

  /**
   * 购买物品
   */
  async buyOrder(params: BuyOrderParams) {
    const { orderId, buyerId, quantity } = params;

    // 1. 验证买家存在
    const buyer = await prisma.character.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      return { success: false, message: '买家不存在' };
    }

    // 2. 验证订单存在
    const order = await prisma.marketOrder.findUnique({
      where: { id: orderId },
      include: {
        item: true,
        seller: true,
      },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    // 3. 验证订单状态
    if (order.status !== 'ACTIVE') {
      return { success: false, message: '订单已失效' };
    }

    // 4. 验证订单类型
    if (order.type !== 'SELL') {
      return { success: false, message: '只能购买出售订单' };
    }

    // 5. 验证数量
    const buyQuantity = Math.min(quantity, order.quantity);
    if (buyQuantity < 1) {
      return { success: false, message: '购买数量必须大于 0' };
    }

    // 6. 计算总价和税费
    const totalPrice = order.unitPrice * buyQuantity;
    const tax = Math.floor(totalPrice * this.TAX_RATE);
    const sellerReceive = totalPrice - tax;

    // 7. 检查买家银币足够
    if (buyer.silver < totalPrice) {
      return { success: false, message: `银币不足，需要 ${totalPrice}` };
    }

    // 8. 执行交易 (使用事务)
    await prisma.$transaction(async (tx) => {
      // 扣除买家银币
      await tx.character.update({
        where: { id: buyerId },
        data: { silver: { decrement: totalPrice } },
      });

      // 增加卖家银币
      await tx.character.update({
        where: { id: order.sellerId },
        data: { silver: { increment: sellerReceive } },
      });

      // 更新订单
      const remainingQuantity = order.quantity - buyQuantity;
      if (remainingQuantity <= 0) {
        await tx.marketOrder.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });
      } else {
        await tx.marketOrder.update({
          where: { id: orderId },
          data: { quantity: remainingQuantity },
        });
      }

      // 添加物品到买家背包
      const existingItem = await tx.inventoryItem.findFirst({
        where: {
          characterId: buyerId,
          itemId: order.itemId,
        },
      });

      if (existingItem) {
        await tx.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: buyQuantity } },
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            characterId: buyerId,
            itemId: order.itemId,
            quantity: buyQuantity,
          },
        });
      }

      // 记录交易历史
      await tx.transactionHistory.create({
        data: {
          orderId,
          buyerId,
          sellerId: order.sellerId,
          itemId: order.itemId,
          quantity: buyQuantity,
          price: order.unitPrice,
          tax,
        },
      });
    });

    return {
      success: true,
      quantity: buyQuantity,
      totalPrice,
      tax,
      message: '购买成功',
    };
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, sellerId: string) {
    // 1. 验证订单存在
    const order = await prisma.marketOrder.findUnique({
      where: { id: orderId },
      include: { item: true },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    // 2. 验证所有权
    if (order.sellerId !== sellerId) {
      return { success: false, message: '无权取消此订单' };
    }

    // 3. 验证订单状态
    if (order.status !== 'ACTIVE') {
      return { success: false, message: '订单已失效' };
    }

    // 4. 取消订单并退还物品
    await prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.marketOrder.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // 如果是出售订单，退还物品
      if (order.type === 'SELL') {
        const existingItem = await tx.inventoryItem.findFirst({
          where: {
            characterId: sellerId,
            itemId: order.itemId,
          },
        });

        if (existingItem) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: { increment: order.quantity } },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              characterId: sellerId,
              itemId: order.itemId,
              quantity: order.quantity,
            },
          });
        }
      }
    });

    return {
      success: true,
      message: '订单已取消',
    };
  }

  /**
   * 获取卖家的订单
   */
  async getSellerOrders(sellerId: string, status?: string) {
    const where: any = { sellerId };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.marketOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        item: true,
      },
    });

    return orders.map(order => ({
      id: order.id,
      itemName: order.item.name,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      type: order.type,
      status: order.status,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    }));
  }

  /**
   * 获取交易历史
   */
  async getTransactionHistory(characterId: string, limit: number = 20) {
    const transactions = await prisma.transactionHistory.findMany({
      where: {
        OR: [
          { buyerId: characterId },
          { sellerId: characterId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 获取物品和角色信息
    const itemIds = [...new Set(transactions.map(t => t.itemId))];
    const buyerIds = [...new Set(transactions.map(t => t.buyerId))];
    const sellerIds = [...new Set(transactions.map(t => t.sellerId))];
    
    const [items, buyers, sellers] = await Promise.all([
      prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, name: true },
      }),
      prisma.character.findMany({
        where: { id: { in: buyerIds } },
        select: { id: true, name: true },
      }),
      prisma.character.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, name: true },
      }),
    ]);

    const itemMap = new Map(items.map(i => [i.id, i.name]));
    const buyerMap = new Map(buyers.map(b => [b.id, b.name]));
    const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

    return transactions.map(tx => ({
      id: tx.id,
      itemName: itemMap.get(tx.itemId) || 'Unknown',
      quantity: tx.quantity,
      price: tx.price,
      totalPrice: tx.price * tx.quantity,
      tax: tx.tax,
      isSeller: tx.sellerId === characterId,
      otherPartyName: tx.sellerId === characterId 
        ? buyerMap.get(tx.buyerId) || 'Unknown' 
        : sellerMap.get(tx.sellerId) || 'Unknown',
      createdAt: tx.createdAt,
    }));
  }

  /**
   * 清理过期订单
   */
  async cleanupExpiredOrders() {
    const expiredOrders = await prisma.marketOrder.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: new Date() },
      },
    });

    for (const order of expiredOrders) {
      await this.cancelOrder(order.id, order.sellerId);
    }

    return expiredOrders.length;
  }

  /**
   * 获取物品平均价格
   */
  async getAveragePrice(itemId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transactionHistory.findMany({
      where: {
        itemId,
        createdAt: { gte: startDate },
      },
    });

    if (transactions.length === 0) {
      return null;
    }

    const total = transactions.reduce((sum, tx) => sum + tx.price * tx.quantity, 0);
    const quantity = transactions.reduce((sum, tx) => sum + tx.quantity, 0);

    return Math.floor(total / quantity);
  }
}

export const marketService = new MarketService();
