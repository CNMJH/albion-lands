import React from 'react';
import { useQuestStore } from '../stores/QuestSystem';

/**
 * 任务追踪面板
 * 显示当前进行中的任务
 */
export const QuestTracker: React.FC = () => {
  const { characterQuests, setSelectedQuest, selectedQuestId } = useQuestStore();

  const inProgressQuests = characterQuests.filter(q => q.status === 'in_progress');

  if (inProgressQuests.length === 0) {
    return (
      <div className="quest-tracker empty">
        <div className="tracker-header">📜 任务追踪</div>
        <div className="tracker-content">
          <p className="empty-message">暂无进行中的任务</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quest-tracker">
      <div className="tracker-header">📜 任务追踪</div>
      <div className="tracker-content">
        {inProgressQuests.map(questProgress => (
          <div
            key={questProgress.id}
            className={`quest-item ${selectedQuestId === questProgress.questId ? 'selected' : ''}`}
            onClick={() => setSelectedQuest(questProgress.questId)}
          >
            <div className="quest-name">{questProgress.quest.name}</div>
            <div className="quest-objectives">
              {questProgress.progress.map((prog, idx) => (
                <div key={idx} className="objective">
                  <span className={`objective-icon ${prog.completed ? 'completed' : ''}`}>
                    {prog.completed ? '✅' : '⬜'}
                  </span>
                  <span className="objective-text">
                    {prog.current}/{prog.required}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
