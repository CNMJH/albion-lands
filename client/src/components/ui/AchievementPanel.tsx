import React from 'react';
import { useQuestStore } from '../stores/QuestSystem';

/**
 * 成就面板
 * 显示成就列表和进度
 */
export const AchievementPanel: React.FC = () => {
  const {
    isAchievementPanelOpen,
    toggleAchievementPanel,
    achievements,
    achievementProgress,
  } = useQuestStore();

  // 合并成就和进度
  const achievementsWithProgress = achievements.map(achievement => {
    const progress = achievementProgress.find(p => p.achievementId === achievement.id);
    return {
      ...achievement,
      current: progress?.current || 0,
      completed: progress?.completed || false,
      completedAt: progress?.completedAt,
    };
  });

  // 按分类分组
  const categories = ['combat', 'gathering', 'crafting', 'social', 'exploration'];
  const categoryNames: Record<string, string> = {
    combat: '⚔️ 战斗',
    gathering: '⛏️ 采集',
    crafting: '🔨 制造',
    social: '👥 社交',
    exploration: '🗺️ 探索',
  };

  if (!isAchievementPanelOpen) {
    return (
      <button className="achievement-panel-toggle" onClick={() => toggleAchievementPanel()}>
        🏆 成就
      </button>
    );
  }

  return (
    <div className="achievement-panel">
      <div className="panel-header">
        <h3>🏆 成就系统</h3>
        <button className="close-btn" onClick={() => toggleAchievementPanel(false)}>
          ✕
        </button>
      </div>

      <div className="panel-content">
        {/* 统计信息 */}
        <div className="achievement-stats">
          <div className="stat">
            <span className="stat-value">
              {achievementsWithProgress.filter(a => a.completed).length}/{achievementsWithProgress.length}
            </span>
            <span className="stat-label">已完成</span>
          </div>
        </div>

        {/* 按分类显示成就 */}
        {categories.map(category => {
          const categoryAchievements = achievementsWithProgress.filter(a => a.category === category);
          
          if (categoryAchievements.length === 0) return null;

          return (
            <section key={category} className="achievement-section">
              <h4>{categoryNames[category]}</h4>
              <div className="achievement-list">
                {categoryAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`achievement-card ${achievement.completed ? 'completed' : ''} ${achievement.isHidden && !achievement.completed ? 'hidden' : ''}`}
                  >
                    {achievement.isHidden && !achievement.completed ? (
                      <div className="achievement-hidden">
                        <span className="hidden-icon">❓</span>
                        <span className="hidden-text">隐藏成就</span>
                      </div>
                    ) : (
                      <>
                        <div className="achievement-info">
                          <div className="achievement-name">
                            {achievement.name}
                            {achievement.title && (
                              <span className="achievement-title">「{achievement.title}」</span>
                            )}
                          </div>
                          <div className="achievement-desc">{achievement.description}</div>
                          <div className="achievement-progress">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${Math.min((achievement.current / achievement.targetCount) * 100, 100)}%` }}
                              />
                              <span className="progress-text">
                                {achievement.current}/{achievement.targetCount}
                              </span>
                            </div>
                          </div>
                          <div className="achievement-rewards">
                            {achievement.expReward > 0 && <span>✨ {achievement.expReward}</span>}
                            {achievement.silverReward > 0 && <span>💰 {achievement.silverReward}</span>}
                            {achievement.goldReward > 0 && <span>💎 {achievement.goldReward}</span>}
                          </div>
                        </div>
                        {achievement.completed && (
                          <div className="completed-badge">✅</div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
