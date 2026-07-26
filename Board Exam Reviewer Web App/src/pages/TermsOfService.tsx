import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import './PlaceholderPage.css';

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-layout">
      <Header title="Terms of Service" showBack onBack={() => navigate(-1)} />
      <main className="placeholder-content">
        <Card className="placeholder-card" style={{ textAlign: 'left', overflowY: 'auto' }}>
          <h2>Terms of Service for Gabay CSE Reviewer</h2>
          <p><strong>Effective Date:</strong> 7/21/2026</p>
          <p>Welcome to the Gabay Civil Service Exam Reviewer ("Gabay"). By using this app, you agree to these simple terms.</p>
          
          <h3>1. Educational Purpose & Disclaimer</h3>
          <p>Gabay is an independent study tool. It is <strong>NOT</strong> affiliated with, endorsed by, or connected to the Civil Service Commission (CSC) of the Philippines or any government agency. The questions provided are simulations and past-pattern inspired. <strong>Passing mock exams in Gabay does not guarantee passing the actual Civil Service Exam.</strong></p>

          <h3>2. Pro Pass & Refunds</h3>
          <ul>
            <li><strong>Pro Access:</strong> Upgrading to Pro grants you access to all premium features, including mock exam simulations and unrestricted content, for the duration of your purchased pass (15-day Cram Pass or 30-day Mastery Pass).</li>
            <li><strong>Refunds:</strong> Because Gabay is a digital product offering immediate access to proprietary content, all sales are final. However, if you experience a critical technical issue that prevents you from accessing the Pro features you paid for, please contact me within 7 days of purchase for assistance.</li>
          </ul>

          <h3>3. Account Responsibilities</h3>
          <p>If you create an account to sync your progress, you are responsible for maintaining the security of your login credentials. I reserve the right to suspend accounts that are found to be abusing the system or attempting to bypass payment systems.</p>

          <h3>4. "As Is" Service</h3>
          <p>Gabay is provided "as is" without any warranties. As a solo developer, I do my absolute best to ensure the app is accurate and reliable, but I cannot be held liable for any interruptions in service, data loss, or minor inaccuracies in the study material.</p>

          <h3>5. Contact</h3>
          <p>For any support inquiries, contact me at: <strong>support@gabay-reviewer.ph</strong></p>
        </Card>
      </main>
    </div>
  );
};
