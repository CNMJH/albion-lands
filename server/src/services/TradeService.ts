import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TradeRequest {
  initiatorId: string;
  recipientId: string;
}

export interface TradeItem {
  itemId: string;
  quantity: number;
  slot: 'INITIATOR' | 'RECIPIENT';
}

export interface TradeResult {
  success: boolean;
  tradeId?: string;
  message?: string;
}

/**
 * 交易服务
 * 实现玩家间交易系统
 */
export class TradeService {
  /**
   * 发起交易请求
   */
  async requestTrade(initiatorId: string, recipientId: string): Promise<TradeResult> {
    // 1. 验证双方角色存在
    const [initiator, recipient] = await Promise.all([
      prisma.character.findUnique({ where: { id: initiatorId } }),
      prisma.character.findUnique({ where: { id: recipientId } }),
    ]);

    if (!initiator || !recipient) {
      return {
        success: false,
        message: '角色不存在',
      };
    }

    // 2. 检查是否同一角色
    if (initiatorId === recipientId) {
      return {
        success: false,
        message: '不能与自己交易',
      };
    }

    // 3. 检查是否在同一地图
    if (initiator.zoneId !== recipient.zoneId) {
      return {
        success: false,
        message: '目标不在同一区域',
      };
    }

    // 4. 检查距离 (简化版，实际应该计算坐标距离)
    const distance = Math.sqrt(
      Math.pow(initiator.x - recipient.x, 2) +
      Math.pow(initiator.y - recipient.y, 2)
    );

    if (distance > 100) {
      return {
        success: false,
        message: '距离太远 (最大 100px)',
      };
    }

    // 5. 检查是否有进行中的交易
    const existingTrade = await prisma.trade.findFirst({
      where: {
        OR: [
          { initiatorId, recipientId },
          { initiatorId: recipientId, recipientId: initiatorId },
        ],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });

    if (existingTrade) {
      return {
        success: false,
        message: '已有进行中的交易',
      };
    }

    // 6. 创建交易记录
    const trade = await prisma.trade.create({
      data: {
        initiatorId,
        recipientId,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      tradeId: trade.id,
    };
  }

  /**
   * 响应交易请求
   */
  async respondTrade(tradeId: string, recipientId: string, accept: boolean): Promise<TradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return {
        success: false,
        message: '交易不存在',
      };
    }

    if (trade.recipientId !== recipientId) {
      return {
        success: false,
        message: '无权操作此交易',
      };
    }

    if (trade.status !== 'PENDING') {
      return {
        success: false,
        message: '交易状态不正确',
      };
    }

    if (!accept) {
      // 拒绝交易
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: 'CANCELLED' },
      });

      return {
        success: true,
        message: '交易已拒绝',
      };
    }

    // 接受交易
    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'ACCEPTED' },
    });

    return {
      success: true,
      message: '交易已接受',
    };
  }

  /**
   * 添加交易物品
   */
  async addItem(
    tradeId: string,
    characterId: string,
    itemId: string,
    quantity: number
  ): Promise<TradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return {
        success: false,
        message: '交易不存在',
      };
    }

    // 检查交易状态
    if (trade.status !== 'ACCEPTED') {
      return {
        success: false,
        message: '交易未接受',
      };
    }

    // 确定是哪一方的物品
    const slot = characterId === trade.initiatorId ? 'INITIATOR' : 'RECIPIENT';

    if (characterId !== trade.initiatorId && characterId !== trade.recipientId) {
      return {
        success: false,
        message: '无权添加物品',
      };
    }

    // 验证物品存在且属于该角色
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        characterId,
        itemId,
      },
    });

    if (!inventoryItem) {
      return {
        success: false,
        message: '物品不存在',
      };
    }

    if (inventoryItem.quantity < quantity) {
      return {
        success: false,
        message: '物品数量不足',
      };
    }

    // 添加交易物品
    await prisma.tradeItem.create({
      data: {
        tradeId,
        ownerId: characterId,
        itemId,
        quantity,
        slot,
      },
    });

    return {
      success: true,
      message: '物品已添加',
    };
  }

  /**
   * 设置交易银币
   */
  async setSilver(
    tradeId: string,
    characterId: string,
    silver: number
  ): Promise<TradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return {
        success: false,
        message: '交易不存在',
      };
    }

    if (characterId !== trade.initiatorId && characterId !== trade.recipientId) {
      return {
        success: false,
        message: '无权操作',
      };
    }

    // 验证银币足够
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character || character.silver < silver) {
      return {
        success: false,
        message: '银币不足',
      };
    }

    // 更新交易银币
    const isInitiator = characterId === trade.initiatorId;
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        [isInitiator ? 'initiatorSilver' : 'recipientSilver']: silver,
      },
    });

    return {
      success: true,
      message: '银币已设置',
    };
  }

  /**
   * 确认交易
   */
  async confirmTrade(tradeId: string, characterId: string): Promise<TradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!trade) {
      return {
        success: false,
        message: '交易不存在',
      };
    }

    if (trade.status !== 'ACCEPTED') {
      return {
        success: false,
        message: '交易状态不正确',
      };
    }

    // 检查是否双方都已确认 (简化版，实际需要跟踪双方确认状态)
    // 这里假设第二次确认就是完成交易

    // 执行交易
    await this.executeTrade(trade);

    return {
      success: true,
      message: '交易完成',
    };
  }

  /**
   * 执行交易 (原子操作)
   */
  private async executeTrade(trade: any): Promise<void> {
    const { id, initiatorId, recipientId, initiatorSilver, recipientSilver, items } = trade;

    // 使用事务确保原子性
    await prisma.$transaction(async (tx) => {
      // 1. 转移银币
      if (initiatorSilver > 0) {
        await tx.character.update({
          where: { id: initiatorId },
          data: { silver: { decrement: initiatorSilver } },
        });
        await tx.character.update({
          where: { id: recipientId },
          data: { silver: { increment: initiatorSilver } },
        });
      }

      if (recipientSilver > 0) {
        await tx.character.update({
          where: { id: recipientId },
          data: { silver: { decrement: recipientSilver } },
        });
        await tx.character.update({
          where: { id: initiatorId },
          data: { silver: { increment: recipientSilver } },
        });
      }

      // 2. 转移物品
      for (const tradeItem of items) {
        const { ownerId, itemId, quantity, slot } = tradeItem;
        const receiverId = ownerId === initiatorId ? recipientId : initiatorId;

        // 从原所有者删除
        const itemsToDelete = await tx.inventoryItem.findMany({
          where: {
            characterId: ownerId,
            itemId,
          },
          take: 1,
        });

        if (itemsToDelete.length > 0) {
          await tx.inventoryItem.delete({
            where: { id: itemsToDelete[0].id },
          });
        }

        // 添加到接收者
        const existingItem = await tx.inventoryItem.findFirst({
          where: {
            characterId: receiverId,
            itemId,
          },
        });

        if (existingItem) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: { increment: quantity },
            },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              characterId: receiverId,
              itemId,
              quantity,
            },
          });
        }
      }

      // 3. 更新交易状态
      await tx.trade.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    });
  }

  /**
   * 取消交易
   */
  async cancelTrade(tradeId: string, characterId: string): Promise<TradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return {
        success: false,
        message: '交易不存在',
      };
    }

    if (trade.initiatorId !== characterId && trade.recipientId !== characterId) {
      return {
        success: false,
        message: '无权取消交易',
      };
    }

    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'CANCELLED' },
    });

    return {
      success: true,
      message: '交易已取消',
    };
  }

  /**
   * 获取交易详情
   */
  async getTrade(tradeId: string) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return trade;
  }

  /**
   * 获取角色的交易历史
   */
  async getTradeHistory(characterId: string, limit: number = 20) {
    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { initiatorId: characterId },
          { recipientId: characterId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // 获取角色名称
    const initiatorIds = [...new Set(trades.map(t => t.initiatorId))];
    const recipientIds = [...new Set(trades.map(t => t.recipientId))];
    
    const [initiators, recipients] = await Promise.all([
      prisma.character.findMany({
        where: { id: { in: initiatorIds } },
        select: { id: true, name: true },
      }),
      prisma.character.findMany({
        where: { id: { in: recipientIds } },
        select: { id: true, name: true },
      }),
    ]);

    const initiatorMap = new Map(initiators.map(c => [c.id, c.name]));
    const recipientMap = new Map(recipients.map(c => [c.id, c.name]));

    return trades.map(trade => ({
      id: trade.id,
      status: trade.status,
      createdAt: trade.createdAt,
      completedAt: trade.completedAt,
      initiatorName: initiatorMap.get(trade.initiatorId) || 'Unknown',
      recipientName: recipientMap.get(trade.recipientId) || 'Unknown',
      initiatorSilver: trade.initiatorSilver,
      recipientSilver: trade.recipientSilver,
      itemCount: trade.items.length,
      isInitiator: trade.initiatorId === characterId,
    }));
  }
}

export const tradeService = new TradeService();
