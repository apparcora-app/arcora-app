import {
  Receipt,
  CreditCard,
  ShieldCheck,
  FileText,
  Bell,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { UrgencyItem, UrgencyItemType } from '@/lib/dashboard/urgency';

interface UrgencyWidgetProps {
  title: string;
  icon: LucideIcon;
  items: UrgencyItem[];
  emptyMessage: string;
  description?: string;
  emptyHint?: string;
  urgentColor: 'red' | 'yellow' | 'blue';
  onItemClick: (item: UrgencyItem) => void;
}

const typeIconMap: Record<UrgencyItemType, LucideIcon> = {
  bill: Receipt,
  subscription: CreditCard,
  warranty: ShieldCheck,
  document: FileText,
  reminder: Bell,
};

const getUrgentStyles = (color: 'red' | 'yellow' | 'blue') => {
  switch (color) {
    case 'red':
      return {
        iconClass: 'text-red-500',
        badgeBg: 'bg-red-500/10 text-red-500 border-red-500/20',
        cardBorder: 'border-red-500/20',
      };
    case 'yellow':
      return {
        iconClass: 'text-yellow-500',
        badgeBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        cardBorder: 'border-yellow-500/20',
      };
    case 'blue':
      return {
        iconClass: 'text-blue-500',
        badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        cardBorder: 'border-blue-500/20',
      };
  }
};

export const UrgencyWidget = ({
  title,
  icon: TitleIcon,
  items,
  emptyMessage,
  description,
  emptyHint,
  urgentColor,
  onItemClick,
}: UrgencyWidgetProps) => {
  const styles = getUrgentStyles(urgentColor);

  return (
    <Card className={cn('arcora-glow-edge flex h-full flex-col', items.length > 0 ? styles.cardBorder : '')}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TitleIcon className={cn('w-5 h-5', styles.iconClass)} />
            {title}
          </CardTitle>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {items.length > 0 ? (
          <span className={cn('rounded-lg border px-2.5 py-0.5 text-xs font-semibold', styles.badgeBg)}>
            {items.length}
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-muted-foreground opacity-80">
            <CheckCircle className="mb-3 h-10 w-10 text-emerald-500/50" />
            <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
            {emptyHint ? (
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{emptyHint}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const ItemIcon = typeIconMap[item.type];
              
              let daysText = '';
              if (item.daysDiff < 0) {
                daysText = `${Math.abs(item.daysDiff)}d ago`;
              } else if (item.daysDiff === 0) {
                daysText = 'Today';
              } else {
                daysText = `In ${item.daysDiff}d`;
              }

              return (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background/70">
                    <ItemIcon className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="capitalize">{item.type}</span>
                      <span>|</span>
                      {urgentColor === 'red' && item.daysDiff < 0 ? (
                        <span className="font-medium text-red-500">Overdue</span>
                      ) : (
                        <span>{daysText}</span>
                      )}
                    </p>
                  </div>

                  {item.amount ? (
                    <div className="shrink-0 pl-2 text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

