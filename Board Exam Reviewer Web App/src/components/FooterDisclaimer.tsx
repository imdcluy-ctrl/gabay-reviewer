import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FooterDisclaimer.css';

export const FooterDisclaimer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="global-disclaimer-footer">
      <div className="disclaimer-footer-content">
        <p className="disclaimer-footer-text">
          🛡️ <strong>Disclaimer:</strong> Gabay Reviewer is an independent ed-tech tool and is not affiliated with, endorsed by, or sponsored by the Civil Service Commission (CSC) or any Philippine government agency. All practice questions are original content, not reproductions of official exam material. Gabay does not guarantee passing scores or official exam outcomes. See our{' '}
          <span className="disclaimer-link" onClick={() => navigate('/privacy')}>Privacy Policy</span> and{' '}
          <span className="disclaimer-link" onClick={() => navigate('/terms')}>Terms of Use</span> for how we handle your data.
        </p>
        <p className="disclaimer-copyright">
          © {new Date().getFullYear()} Gabay Reviewer — Built for Philippine Civil Service Examinees
        </p>
      </div>
    </footer>
  );
};
