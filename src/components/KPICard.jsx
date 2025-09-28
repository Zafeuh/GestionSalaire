import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

const KPICard = ({ icon: Icon, title, value, unit = '', color = 'sky', previousValue = 0 }) => {
  const numericValue = parseInt(value) || 0;
  const progress = previousValue ? (numericValue / previousValue) * 100 : 100;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-x-4">
          <div className={`p-3 rounded-full bg-${color}-100/20`}>
            <Icon className={`h-6 w-6 text-${color}-500`} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {unit}
              </h3>
              {previousValue > 0 && (
                <span className={`text-xs font-medium ${
                  numericValue >= previousValue ? 'text-green-500' : 'text-red-500'
                }`}>
                  {numericValue >= previousValue ? '↑' : '↓'}
                  {Math.abs(((numericValue - previousValue) / previousValue) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardContent>
    </Card>
  );
};

export default KPICard;
