import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { BoxBreathingTimer } from '../components/anxiety/BoxBreathingTimer';
import { WorryDump } from '../components/anxiety/WorryDump';
import { ExamChecklist } from '../components/anxiety/ExamChecklist';
import { Button } from '../components/Button';
import './AnxietyHub.css';

export const AnxietyHub: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'breathing' | 'worry' | 'checklist'>('breathing');

  const userId = profile?.id || 'guest';

  return (
    <div className="anxiety-hub-layout">
      {/* Sticky Header */}
      <header className="anxiety-sticky-header">
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          ◀ Dashboard
        </Button>
        <div className="anxiety-header-title">
          <h1>Test Anxiety &amp; Performance Toolkit</h1>
          <p className="anxiety-header-subtitle">
            Psychological &amp; logistical prep for exam confidence
          </p>
        </div>
      </header>

      <main className="anxiety-main-content">
        {/* Navigation Tabs */}
        <nav className="anxiety-tabs" aria-label="Toolkit Sections">
          <button
            type="button"
            className={`anxiety-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
            onClick={() => setActiveTab('breathing')}
          >
            🫁 4-4-4-4 Box Breathing
          </button>
          <button
            type="button"
            className={`anxiety-tab-btn ${activeTab === 'worry' ? 'active' : ''}`}
            onClick={() => setActiveTab('worry')}
          >
            📝 Pre-Exam Worry Dump
          </button>
          <button
            type="button"
            className={`anxiety-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            📋 CSC Day Checklist
          </button>
        </nav>

        {/* Tab Panels */}
        {activeTab === 'breathing' && <BoxBreathingTimer />}
        {activeTab === 'worry' && <WorryDump localUserId={userId} />}
        {activeTab === 'checklist' && <ExamChecklist localUserId={userId} />}

        {/* Medical & Legal Disclaimer Footer (INV-027g) */}
        <footer className="anxiety-medical-disclaimer">
          <p>
            ℹ <strong>Self-Help Prep Tools Disclaimer:</strong> The Box Breathing exercise and Worry Dump journaling tools are designed as self-help educational techniques for managing acute study stress and exam-day nervousness. They do not constitute clinical psychological treatment, medical advice, or psychiatric diagnosis. If you experience severe anxiety or distress, please consult a qualified healthcare professional.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AnxietyHub;
