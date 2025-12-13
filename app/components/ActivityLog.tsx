import React from 'react';
import { ActivityLogItem } from '@/lib/api';
import { ScrollText, CheckCircle, AlertCircle, ShoppingCart, DollarSign } from 'lucide-react';

const ActivityLog = ({ data }: { data: ActivityLogItem[] }) => {
  if (!data || data.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'DAILY_START': return <CheckCircle className="w-4 h-4 text-slate-400" />;
      case 'BUY_EXEC': return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'SELL_EXEC': return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'STOP_LOSS': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <ScrollText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <ScrollText className="w-5 h-5 mr-2 text-slate-500" />
          Live Activity Log
        </h3>
        <span className="text-xs text-slate-500 font-mono">results/activity_log.json</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.slice(0, 100).map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {getIcon(item.type)}
                        <span className="ml-2 text-sm font-medium text-slate-700">{item.type}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLog;
