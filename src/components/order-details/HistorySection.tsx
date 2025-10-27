import Icon from '@/components/ui/icon';
import { OrderHistoryItem } from './types';

interface Order {
  history: OrderHistoryItem[];
}

interface HistorySectionProps {
  order: Order;
}

export default function HistorySection({ order }: HistorySectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="History" size={18} />
        История заказа
      </h3>
      <div className="space-y-2">
        {order.history.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 text-sm border-l-2 border-muted pl-3 py-1"
          >
            <div className="flex-1">
              <p className="font-medium">{item.action}</p>
              {item.details && (
                <p className="text-muted-foreground text-xs">{item.details}</p>
              )}
              <p className="text-muted-foreground text-xs">
                {item.user} • {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
