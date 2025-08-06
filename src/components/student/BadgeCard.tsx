import React from 'react';
import { Badge } from '../../types';
import Card, { CardContent } from '../ui/Card';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard = ({ badge }: BadgeCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <Card hoverEffect className="h-full border border-gray-200">
      <CardContent>
        <div className="flex flex-col items-center text-center">
          <div className="text-4xl mb-3">{badge.icon}</div>
          <div className="font-medium text-gray-900 mb-1">{badge.title}</div>
          <div className="text-sm text-gray-500 mb-3">{badge.description}</div>
          <div className="text-xs text-gray-400">Earned on {formatDate(badge.dateEarned)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
