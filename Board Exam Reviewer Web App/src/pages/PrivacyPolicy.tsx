import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import './PlaceholderPage.css';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-layout">
      <Header title="Privacy Policy" showBack onBack={() => navigate(-1)} />
      <main className="placeholder-content">
        <Card className="placeholder-card" style={{ textAlign: 'left', overflowY: 'auto' }}>
          <h2>Privacy Policy for Gabay CSE Reviewer</h2>
          <p><strong>Effective Date:</strong> 7/21/2026</p>
          <p>Hello! I am a solo developer building Gabay Civil Service Exam Reviewer ("Gabay"). I take your privacy seriously and strictly comply with the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong>. This policy explains what information Gabay collects, why it is collected, and how your rights as a data subject are protected.</p>
          
          <h3>1. Information Collection</h3>
          <ul>
            <li><strong>Offline Data (IndexedDB):</strong> All your study progress, exam attempts, journal entries, and Leitner box states are stored <strong>locally on your device</strong> by default. I do not have access to this data.</li>
            <li><strong>Account Data (Supabase):</strong> If you create an account to back up your data or purchase a Pro pass, I collect your email address and basic profile information. This is securely managed by Supabase.</li>
            <li><strong>Payment Data (PayMongo):</strong> If you upgrade to Pro, your payment is processed securely by PayMongo. Gabay does not collect, see, or store your credit card or e-wallet details. I only receive a confirmation that you paid so I can unlock your account.</li>
            <li><strong>Analytics (PostHog):</strong> I collect anonymous usage data (like which categories are most popular or if a button is broken) to help me improve the app. This data is strictly stripped of any personally identifiable information (PII) or study journal content.</li>
          </ul>

          <h3>2. How Your Information is Used</h3>
          <ul>
            <li>To provide the core functionality of the app (syncing your progress across devices if you make an account).</li>
            <li>To process your Pro upgrade via PayMongo.</li>
            <li>To analyze app performance and fix bugs.</li>
          </ul>

          <h3>3. Data Processors</h3>
          <p>I use the following third-party services to make Gabay work:</p>
          <ul>
            <li><strong>Supabase:</strong> For secure user authentication and cloud database syncing.</li>
            <li><strong>PayMongo:</strong> For secure payment processing in the Philippines.</li>
            <li><strong>PostHog:</strong> For anonymous product analytics.</li>
            <li><strong>Vercel:</strong> For hosting the web application.</li>
          </ul>

          <h3>4. Your Data Subject Rights (RA 10173)</h3>
          <p>Under the Data Privacy Act of 2012, you have the right to be informed, access, object, erase or block, and rectify your personal data. If you created an account, you can request to have your account and all associated data permanently deleted by contacting me. If you are using the app in offline/guest mode, you can clear all your data simply by clearing your browser's site data.</p>

          <h3>5. Contact & Data Officer</h3>
          <p>If you have any questions about this Privacy Policy or wish to exercise your data privacy rights, please reach out directly to me at: <strong>dpduaneluy@gmail.com</strong></p>
        </Card>
      </main>
    </div>
  );
};
