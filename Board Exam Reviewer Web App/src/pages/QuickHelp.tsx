import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/db';
import { HighYieldReferenceView } from '../components/HighYieldReferenceView';
import './QuickHelp.css';

export const QuickHelp: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'faq' | 'feedback'>('cheatsheet');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Feedback form state
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'question' | 'other'>('suggestion');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>(profile?.email || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const newFeedback = {
        id: uuidv4(),
        user_id: profile?.id || 'guest-user',
        user_email: email.trim() || profile?.email || 'Anonymous',
        user_name: profile?.display_name || 'Examinee',
        category,
        message: message.trim(),
        status: 'unresolved' as const,
        created_at: new Date().toISOString(),
      };

      await db.examinee_feedback.add(newFeedback);
      setSubmitSuccess(true);
      setMessage('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: '📲 How do I add Gabay to my phone home screen (App Shortcut)?',
      a: (
        <div>
          <p><strong>For iPhone (iOS Safari):</strong></p>
          <ol>
            <li>Open <strong>gabay-reviewer.vercel.app</strong> in <strong>Safari</strong>.</li>
            <li>Tap the <strong>Share button 📤</strong> (square with arrow up at the bottom bar).</li>
            <li>Scroll down and tap <strong>"Add to Home Screen" ➕</strong>.</li>
            <li>Tap <strong>"Add"</strong> at the top right. An official Gabay icon will appear on your home screen!</li>
          </ol>
          <p style={{ marginTop: '0.75rem' }}><strong>For Android Phone (Google Chrome):</strong></p>
          <ol>
            <li>Open <strong>gabay-reviewer.vercel.app</strong> in <strong>Chrome</strong>.</li>
            <li>Tap the <strong>three-dot menu (⋮)</strong> at the top right.</li>
            <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
            <li>Tap <strong>"Install"</strong>. Gabay will launch in full screen just like a native Play Store app!</li>
          </ol>
        </div>
      ),
    },
    {
      q: '⏱️ How does the 170-Item Mock Simulation work?',
      a: (
        <div>
          <p>The mock simulation mirrors the actual Philippine Civil Service Examination (CSE-PPT Professional). It consists of <strong>170 items</strong> across Verbal Ability (60), Analytical Ability (40), Numerical Ability (40), and General Information (30) with a single global timer of <strong>3 hours and 10 minutes</strong>.</p>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
            <li><strong>Free Tier Limit:</strong> Free examinees get exactly <strong>1 free 170-item simulation exam</strong> to benchmark initial readiness.</li>
            <li><strong>Pro Pass Limit:</strong> Pro Pass subscribers unlock <strong>unlimited simulation retakes</strong> with question de-duplication so you never repeat identical exam papers.</li>
            <li><strong>Passing Threshold:</strong> Set at <strong>80% (136 / 170 items)</strong>, matching official Civil Service Commission passing standards.</li>
          </ul>
        </div>
      ),
    },
    {
      q: '⭐ What is the difference between Gabay Free and Gabay Pro Pass?',
      a: (
        <div>
          <p>Gabay is designed so every examinee can review for free, while Pro Pass offers full intensive mastery access:</p>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
            <li><strong>Gabay Free Tier (100% Free):</strong> Includes <strong>244 core practice questions</strong>, up to 3 daily practice sessions, and <strong>1 full 170-item simulation attempt</strong>.</li>
            <li><strong>Gabay Pro Pass (15-Day Cram Pass @ ₱74 or 30-Day Mastery Pass @ ₱149):</strong> Unlocks the complete <strong>2,910+ DeepSeek question bank</strong> across all 5 subject categories & 23 subtopics, unlimited 170-item simulations, unlimited daily practice sessions, 5-Box Leitner spaced repetition flashcards, and predictive readiness analytics.</li>
            <li><strong>No Auto-Renewal:</strong> All Pro passes are one-time payments (GCash, Maya, QR Ph, Card) that automatically expire after 15 or 30 days without recurring debits.</li>
          </ul>
        </div>
      ),
    },
    {
      q: '🔒 What happens when my 15-day or 30-day Pro Pass expires?',
      a: (
        <div>
          <p>When your 15-day or 30-day Pro Pass reaches its expiration date, the app automatically transitions your account back to Free status. For security and fairness:</p>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
            <li>Access to Pro-tier questions (beyond the 244 free items) is automatically locked.</li>
            <li>Simulation attempts revert to the 1-attempt free quota.</li>
            <li>Your study history, exam records, and flashcard progress remain <strong>100% safe</strong> on your device so you never lose your data.</li>
          </ul>
        </div>
      ),
    },
    {
      q: '🧠 How does Leitner Spaced Repetition help me remember?',
      a: 'Leitner Spaced Repetition organizes your question cards into 5 memory boxes. Questions you answer incorrectly stay in Box 1 for daily review. As you get items correct, they advance to higher boxes (Box 2, 3, 4, 5) and are scheduled at longer intervals (e.g. 3 days, 7 days). This moves Civil Service concepts from short-term memory to permanent long-term retention before exam day!',
    },
    {
      q: '📶 Can I use Gabay offline without internet?',
      a: 'Yes! Gabay stores questions, mock sessions, flashcards, and your study journal locally on your device via IndexedDB. You can practice while commuting or offline. When you reconnect to the internet, your progress automatically syncs to your account.',
    },
    {
      q: '🛡️ Is my data private and secure?',
      a: 'Yes. Gabay strictly complies with Republic Act No. 10173 (Philippine Data Privacy Act of 2012). Your study data is stored safely on your device, and account data is encrypted via Supabase. We never sell your data or request sensitive government IDs.',
    },
  ];

  return (
    <div className="quick-help-layout">
      <Header title="Quick Help & FAQs" showBack onBack={() => navigate(-1)} />
      <main className="quick-help-content">
        <div className="help-tabs-header">
          <button
            className={`tab-btn ${activeTab === 'cheatsheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            📚 High-Yield Cheat Sheet
          </button>
          <button
            className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            ❓ FAQs & Guides
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            👋 Feedback
          </button>
        </div>

        {activeTab === 'cheatsheet' ? (
          <HighYieldReferenceView />
        ) : activeTab === 'faq' ? (
          <div className="faq-container">
            <Card className="help-hero-card">
              <h2>👋 Welcome to Gabay Support</h2>
              <p>Everything you need to master your Civil Service Examination review.</p>
            </Card>

            <div className="accordion-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="accordion-trigger"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    >
                      <span className="faq-question-text">{faq.q}</span>
                      <span className="accordion-icon">{isOpen ? '➖' : '➕'}</span>
                    </button>
                    {isOpen && <div className="accordion-content">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="feedback-container">
            <Card className="feedback-card">
              <h2>💬 Submit Comments or Suggestions</h2>
              <p className="feedback-subtitle">
                Have a suggestion, spot a typo, or want a new feature? Send your feedback directly to the Gabay developer!
              </p>

              {submitSuccess ? (
                <div className="feedback-success-box">
                  <span>✅</span>
                  <h3>Thank you for your feedback!</h3>
                  <p>Your suggestion has been logged and sent to the admin dashboard.</p>
                  <Button variant="secondary" onClick={() => setSubmitSuccess(false)}>
                    Submit Another Comment
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="feedback-form">
                  <div className="form-group">
                    <label htmlFor="feedback-category">Feedback Type</label>
                    <select
                      id="feedback-category"
                      className="feedback-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                    >
                      <option value="suggestion">👋 Feature Suggestion</option>
                      <option value="bug">🐛 Bug / Typo Report</option>
                      <option value="question">❓ Question about Exam</option>
                      <option value="other">📝 Other Comment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback-email">Your Email (Optional)</label>
                    <input
                      id="feedback-email"
                      type="email"
                      className="feedback-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="imdcluy@gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback-message">Comment / Suggestion</label>
                    <textarea
                      id="feedback-message"
                      required
                      rows={5}
                      className="feedback-textarea"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type your suggestion or feedback here..."
                    />
                  </div>

                  <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Send Feedback to Admin 🚀'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuickHelp;
