import React from 'react';
import { useQuestStore } from '../../stores/QuestSystem';
import { useGameStore } from '../../stores/gameStore';

/**
 * 任务面板
 * 显示所有可用任务和角色任务
 */
export const QuestPanel: React.FC = () => {
  const {
    isQuestPanelOpen,
    toggleQuestPanel,
    availableQuests,
    characterQuests,
    acceptQuest,
    completeQuest,
    abandonQuest,
  } = useQuestStore();

  // 假设从用户上下文获取角色 ID
  const { player } = useGameStore()
  const characterId = player?.id || ''; // 从 gameStore 获取

  if (!isQuestPanelOpen) {
    return (
      <button className="quest-panel-toggle" onClick={() => toggleQuestPanel()}>
        📜 任务
      </button>
    );
  }

  return (
    <div className="quest-panel">
      <div className="panel-header">
        <h3>📜 任务面板</h3>
        <button className="close-btn" onClick={() => toggleQuestPanel(false)}>
          ✕
        </button>
      </div>

      <div className="panel-content">
        {/* 进行中的任务 */}
        <section className="quest-section">
          <h4>📌 进行中</h4>
          <div className="quest-list">
            {characterQuests
              .filter(q => q.status === 'in_progress')
              .map(questProgress => (
                <div key={questProgress.id} className="quest-card">
                  <div className="quest-info">
                    <div className="quest-title">{questProgress.quest.name}</div>
                    <div className="quest-desc">{questProgress.quest.description}</div>
                    <div className="quest-progress">
                      {questProgress.progress.map((prog, idx) => (
                        <div key={idx} className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(prog.current / prog.required) * 100}%` }}
                          />
                          <span className="progress-text">
                            {prog.current}/{prog.required}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="quest-rewards">
                    <span>💰 {questProgress.quest.silverReward}</span>
                    <span>✨ {questProgress.quest.expReward}</span>
                  </div>
                  {questProgress.status === 'completed' && (
                    <button
                      className="btn-complete"
                      onClick={() => completeQuest(characterId, questProgress.questId)}
                    >
                      ✅ 提交任务
                    </button>
                  )}
                  <button
                    className="btn-abandon"
                    onClick={() => abandonQuest(characterId, questProgress.questId)}
                  >
                    ❌ 放弃
                  </button>
                </div>
              ))}
            {characterQuests.filter(q => q.status === 'in_progress').length === 0 && (
              <p className="empty-message">暂无进行中的任务</p>
            )}
          </div>
        </section>

        {/* 可接取的任务 */}
        <section className="quest-section">
          <h4>📋 可接取</h4>
          <div className="quest-list">
            {availableQuests
              .filter(q => !characterQuests.find(cq => cq.questId === q.id && cq.status === 'in_progress'))
              .map(quest => (
                <div key={quest.id} className="quest-card">
                  <div className="quest-info">
                    <div className="quest-title">{quest.name}</div>
                    <div className="quest-desc">{quest.description}</div>
                    <div className="quest-requirements">
                      <span>🎯 Lv.{quest.level}</span>
                      <span>💀 {quest.difficulty === 'easy' ? '简单' : quest.difficulty === 'normal' ? '普通' : '困难'}</span>
                    </div>
                  </div>
                  <div className="quest-rewards">
                    <span>💰 {quest.silverReward}</span>
                    <span>✨ {quest.expReward}</span>
                  </div>
                  <button
                    className="btn-accept"
                    onClick={() => acceptQuest(characterId, quest.id)}
                  >
                    ✅ 接取任务
                  </button>
                </div>
              ))}
            {availableQuests.filter(q => !characterQuests.find(cq => cq.questId === q.id && cq.status === 'in_progress')).length === 0 && (
              <p className="empty-message">暂无可接取的任务</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
