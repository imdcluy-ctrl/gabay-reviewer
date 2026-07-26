import React, { useState, useEffect } from 'react';
import {
  CSC_EXAM_CHECKLIST_ITEMS,
  computeChecklistStats,
} from '../../lib/cscExamChecklist';
import {
  getChecklistProgress,
  saveChecklistProgress,
  resetChecklistProgress,
} from '../../lib/anxietyStorage';
import './ExamChecklist.css';

interface ExamChecklistProps {
  localUserId: string;
}

export const ExamChecklist: React.FC<ExamChecklistProps> = ({ localUserId }) => {
  const [checkedSet, setCheckedSet] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      if (!localUserId) return;
      const progress = await getChecklistProgress(localUserId);
      if (isMounted) setCheckedSet(progress);
    }

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [localUserId]);

  const handleToggleItem = async (id: string) => {
    const nextSet = new Set(checkedSet);
    if (nextSet.has(id)) {
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }

    setCheckedSet(nextSet);
    if (localUserId) {
      await saveChecklistProgress(localUserId, nextSet);
    }
  };

  const handleReset = async () => {
    setCheckedSet(new Set());
    if (localUserId) {
      await resetChecklistProgress(localUserId);
    }
  };

  const stats = computeChecklistStats(checkedSet);

  const filteredItems = activeCategory === 'all'
    ? CSC_EXAM_CHECKLIST_ITEMS
    : CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="exam-checklist-card">
      <div className="checklist-header">
        <div>
          <h3 className="checklist-title">CSC Exam Day Logistics Checklist</h3>
          <p className="checklist-subtitle">
            Verify all mandatory documents and supplies before heading to your testing venue.
          </p>
        </div>

        <button type="button" className="btn-reset-checklist" onClick={handleReset}>
          Reset List 🔄
        </button>
      </div>

      {/* Progress Bar Header */}
      <div className="checklist-progress-panel">
        <div className="progress-info-row">
          <span className="progress-label">
            Mandatory Items Ready: <strong>{stats.requiredChecked} / {stats.requiredTotal}</strong>
          </span>
          <span className={`readiness-pill ${stats.isReady ? 'ready' : 'pending'}`}>
            {stats.isReady ? '✅ Exam Day Ready!' : '⚠️ Missing Mandatory Items'}
          </span>
        </div>

        <div className="checklist-bar-track">
          <div
            className="checklist-bar-fill"
            style={{ width: `${(stats.requiredChecked / stats.requiredTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="checklist-category-filters">
        <button
          type="button"
          className={`cat-filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Items ({CSC_EXAM_CHECKLIST_ITEMS.length})
        </button>
        <button
          type="button"
          className={`cat-filter-chip ${activeCategory === 'mandatory' ? 'active' : ''}`}
          onClick={() => setActiveCategory('mandatory')}
        >
          Mandatory Docs ({CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.category === 'mandatory').length})
        </button>
        <button
          type="button"
          className={`cat-filter-chip ${activeCategory === 'supplies' ? 'active' : ''}`}
          onClick={() => setActiveCategory('supplies')}
        >
          Supplies ({CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.category === 'supplies').length})
        </button>
        <button
          type="button"
          className={`cat-filter-chip ${activeCategory === 'attire' ? 'active' : ''}`}
          onClick={() => setActiveCategory('attire')}
        >
          Attire ({CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.category === 'attire').length})
        </button>
        <button
          type="button"
          className={`cat-filter-chip ${activeCategory === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveCategory('reminders')}
        >
          Venue Reminders ({CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.category === 'reminders').length})
        </button>
      </div>

      {/* Items List */}
      <div className="checklist-items-list">
        {filteredItems.map(item => {
          const isChecked = checkedSet.has(item.id);
          return (
            <label
              key={item.id}
              className={`checklist-item-row ${isChecked ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                className="checklist-checkbox"
                checked={isChecked}
                onChange={() => handleToggleItem(item.id)}
              />

              <div className="item-details">
                <div className="item-title-row">
                  <span className="item-title-en">{item.titleEn}</span>
                  <span className="item-title-tl">({item.titleTl})</span>
                  {item.isRequired && <span className="required-badge">REQUIRED</span>}
                </div>
                <p className="item-description">{item.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Official Disclaimer (INV-027f) */}
      <div className="checklist-disclaimer">
        ℹ Disclaimer: Always verify venue room assignments and specific guidelines against your official CSC Notice of School Assignment (NOSA).
      </div>
    </div>
  );
};
