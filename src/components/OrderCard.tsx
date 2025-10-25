import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import AssignUserDialog from '@/components/AssignUserDialog';

export type OrderStatus = 
  | 'received'
  | 'diagnostics'
  | 'repair'
  | 'parts-needed'
  | 'cost-approval'
  | 'payment-pending'
  | 'parts-delivery'
  | 'parts-arrived'
  | 'repair-continues'
  | 'repair-completed'
  | 'notify-client'
  | 'client-notified'
  | 'issued'
  | 'stuck'
  | 'disposal';

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

interface OrderCardProps {
  order: Order;
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  priorityConfig: Record<string, { label: string; color: string }>;
  onViewDetails: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  getNextStatus: (status: OrderStatus) => OrderStatus | null;
}

export default function OrderCard({
  order,
  statusConfig,
  priorityConfig,
  onViewDetails,
  onViewReceipt,
  onStatusChange,
  getNextStatus,
}: OrderCardProps) {
  const { hasPermission } = useAuth();
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const nextStatus = getNextStatus(order.status);

  return (
    <>
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{order.clientName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{order.id}</p>
          </div>
          <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Smartphone" size={16} className="text-muted-foreground" />
            <span className="font-medium">{order.deviceType}</span>
            <span className="text-muted-foreground">{order.deviceModel}</span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <Icon name="AlertCircle" size={16} className="text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{order.issue}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">{order.createdAt}</span>
          </div>

          {order.master && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">{order.master}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Badge variant="outline" className={priorityConfig[order.priority].color}>
                {priorityConfig[order.priority].label}
              </Badge>
              {order.price && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {order.price.toLocaleString()} ₽
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(order)}>
              <Icon name="Eye" size={16} className="mr-1" />
              Подробнее
            </Button>
            {hasPermission('assign_master') && (
              <Button variant="outline" size="sm" onClick={() => setIsAssignUserOpen(true)}>
                <Icon name="Users" size={16} />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onViewReceipt(order)}>
              <Icon name="FileText" size={16} />
            </Button>
            {hasPermission('change_status') && (
              <Select value={order.status} onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}>
                <SelectTrigger className="h-9 w-9 p-0">
                  <Icon name="RefreshCw" size={16} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    
    <AssignUserDialog
      orderId={order.id}
      isOpen={isAssignUserOpen}
      onClose={() => setIsAssignUserOpen(false)}
    />
    </>
  );
}