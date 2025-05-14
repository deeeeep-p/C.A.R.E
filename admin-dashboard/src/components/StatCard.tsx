import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend = 'neutral',
  trendValue
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend !== 'neutral' && trendValue && (
        <div className={`px-5 py-3 border-t border-gray-200 dark:border-gray-700 ${
          trend === 'up' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          <div className="text-sm flex items-center">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 mr-1.5" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1.5" />
            )}
            <span className="font-medium">{trendValue} {trend === 'up' ? 'increase' : 'decrease'}</span>
            <span className="ml-1">from yesterday</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;