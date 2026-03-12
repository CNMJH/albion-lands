import React, { useState } from 'react';
import { useQuestStore } from '../../stores/QuestSystem';
import { useGameStore } from '../../stores/gameStore';

interface NPCDialogueProps {
  npcId: string;
  onClose: () => void;
}

/**
 * NPC 对话组件
 * 显示 NPC 对话和可交互选项
 */
export const NPCDialogue: React.FC<NPCDialogueProps> = ({ npcId, onClose }) => {
  const { npcs, acceptQuest } = useQuestStore();
  const [selectedDialogue, setSelectedDialogue] = useState<string>('greeting');

  const npc = npcs.find(n => n.id === npcId);
  const { player } = useGameStore()
  const characterId = player?.id || ''; // 从 gameStore 获取

  if (!npc) {
    return null;
  }

  const dialogue = npc.dialogue || {};
  const greetings = dialogue.greeting || ['你好！'];
  const farewells = dialogue.farewell || ['再见！'];

  // 获取 NPC 相关的任务
  const npcQuests = npc.quests || [];

  const handleAcceptQuest = async (questId: string) => {
    const result = await acceptQuest(characterId, questId);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || '接取任务失败');
    }
  };

  return (
    <div className="npc-dialogue-overlay" onClick={onClose}>
      <div className="npc-dialogue-box" onClick={e => e.stopPropagation()}>
        {/* NPC 头像和名称 */}
        <div className="npc-header">
          <div className="npc-avatar">
            {npc.type === 'quest' ? '👴' : npc.type === 'merchant' ? '🧙' : '🔨'}
          </div>
          <div className="npc-name">
            <div>{npc.name}</div>
            <div className="npc-type">
              {npc.type === 'quest' ? '任务发布者' : npc.type === 'merchant' ? '商人' : '服务 NPC'}
            </div>
          </div>
        </div>

        {/* 对话内容 */}
        <div className="dialogue-content">
          <div className="dialogue-text">
            {selectedDialogue === 'greeting'
              ? greetings[Math.floor(Math.random() * greetings.length)]
              : farewells[Math.floor(Math.random() * farewells.length)]}
          </div>

          {/* 对话选项 */}
          <div className="dialogue-options">
            <button
              className={`dialogue-option ${selectedDialogue === 'greeting' ? 'active' : ''}`}
              onClick={() => setSelectedDialogue('greeting')}
            >
              💬 打招呼
            </button>
            <button
              className={`dialogue-option ${selectedDialogue === 'farewell' ? 'active' : ''}`}
              onClick={() => setSelectedDialogue('farewell')}
            >
              👋 道别
            </button>
          </div>
        </div>

        {/* 任务列表 */}
        {npcQuests.length > 0 && (
          <div className="quest-offers">
            <h4>📜 可用任务</h4>
            <div className="quest-list">
              {npcQuests.map((nq: any) => (
                <div key={nq.quest.id} className="quest-offer-item">
                  <div className="quest-offer-info">
                    <div className="quest-offer-name">{nq.quest.name}</div>
                    <div className="quest-offer-desc">{nq.quest.description}</div>
                    <div className="quest-offer-rewards">
                      <span>✨ {nq.quest.expReward}</span>
                      <span>💰 {nq.quest.silverReward}</span>
                    </div>
                  </div>
                  <button
                    className="btn-accept-quest"
                    onClick={() => handleAcceptQuest(nq.quest.id)}
                  >
                    ✅ 接取
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 关闭按钮 */}
        <button className="btn-close" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
};
