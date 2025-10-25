import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { OrderStatus } from './OrderCard';

interface Order {
  id: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  issue: string;
  appearance: string;
  accessories: string;
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high';
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless';
  createdAt: string;
  createdTime: string;
  price?: number;
  master?: string;
}

interface KanbanBoardProps {
  orders: Order[];
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  priorityConfig: Record<string, { label: string; color: string }>;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export default function KanbanBoard({
  orders,
  statusConfig,
  priorityConfig,
  onViewDetails,
  onStatusChange,
}: KanbanBoardProps) {
  const columns: OrderStatus[] = ['received', 'in-progress', 'ready', 'completed'];

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((status) => {
        const columnOrders = getOrdersByStatus(status);
        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{statusConfig[status].label}</h3>
              <Badge variant="secondary">{columnOrders.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {columnOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{order.clientName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{order.id}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{order.deviceType}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{order.issue}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className={priorityConfig[order.priority].color}>
                          {priorityConfig[order.priority].label}
                        </Badge>
                        {order.price && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            {order.price.toLocaleString()} ₽
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onViewDetails(order)}
                        >
                          <Icon name="Eye" size={14} className="mr-1" />
                          Детали
                        </Button>
                        {status !== 'completed' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const nextStatus: Record<OrderStatus, OrderStatus | null> = {
                                received: 'in-progress',
                                'in-progress': 'ready',
                                ready: 'completed',
                                completed: null,
                              };
                              const next = nextStatus[status];
                              if (next) onStatusChange(order.id, next);
                            }}
                          >
                            <Icon name="ArrowRight" size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
