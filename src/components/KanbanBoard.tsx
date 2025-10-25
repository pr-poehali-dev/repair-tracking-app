import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { OrderStatus } from './OrderCard';
import { statusConfig as defaultStatusConfig } from '@/lib/orderUtils';

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
  const columns: OrderStatus[] = [
    'received',
    'diagnostics',
    'repair',
    'parts-needed',
    'cost-approval',
    'payment-pending',
    'parts-delivery',
    'parts-arrived',
    'repair-continues',
    'repair-completed',
    'notify-client',
    'client-notified',
    'issued',
    'stuck',
    'disposal'
  ];

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-4 min-w-full pb-4" style={{ minWidth: 'max-content' }}>
        {columns.map((status) => {
          const columnOrders = getOrdersByStatus(status);
          return (
            <div key={status} className="space-y-3" style={{ minWidth: '280px' }}>
              <div className="flex items-center justify-between sticky top-0 bg-background pb-2">
                <h3 className="font-semibold text-sm">{statusConfig[status].label}</h3>
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
                        <Select value={order.status} onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}>
                          <SelectTrigger className="h-8 w-8 p-0">
                            <Icon name="RefreshCw" size={14} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(defaultStatusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
    </div>
  );
}