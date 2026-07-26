import React from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import './PlaceholderPage.css';

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, icon, description }) => {
  return (
    <div className="placeholder-layout">
      <OfflineBanner />
      <Header title={title} />
      <main className="placeholder-content">
        <Card className="placeholder-card">
          <div className="placeholder-big-icon">{icon}</div>
          <h2>{title}</h2>
          <p>{description}</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
};
