import { DollarSign, Lock } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface DashboardChartsPanelProps {
  paidThisMonth: number;
  totalDue: number;
  securityScore: number;
}

export const DashboardChartsPanel = ({
  paidThisMonth,
  totalDue,
  securityScore,
}: DashboardChartsPanelProps) => {
  const spendingData = [
    { name: 'Paid', value: paidThisMonth, color: '#2dd36f' },
    { name: 'Due', value: totalDue, color: '#ffc409' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            This Month (Shrunk)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {spendingData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card) / 0.96)',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2dd36f]" />
              Paid: {formatCurrency(paidThisMonth)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ffc409]" />
              Due: {formatCurrency(totalDue)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            Security Health
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-2">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="56" cy="56" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="56"
                cy="56"
                r="44"
                fill="none"
                stroke="#2dd36f"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(securityScore / 100) * 276.46} 276.46`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{securityScore}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
