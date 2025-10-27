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
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import AssignUserDialog from '@/components/AssignUserDialog';
import { getDeadlineStatus, formatDeadline } from '@/lib/orderUtils';

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
  repairDescription?: string;
  statusDeadline?: string;
  statusChangedAt?: string;
  isDelayed?: boolean;
  delayReason?: string;
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
  const { toast } = useToast();
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const nextStatus = getNextStatus(order.status);

  const requiresRepairDescription = (status: OrderStatus) => {
    return ['notify-client', 'client-notified', 'issued', 'stuck', 'disposal'].includes(status);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (requiresRepairDescription(newStatus) && !order.repairDescription) {
      toast({
        title: 'Требуется описание ремонта',
        description: 'Перед переводом в этот статус необходимо заполнить описание выполненного ремонта',
        variant: 'destructive',
      });
      return;
    }
    onStatusChange(order.id, newStatus);
  };

  const deadlineStatus = getDeadlineStatus(order);
  const getDeadlineColor = () => {
    switch (deadlineStatus) {
      case 'overdue': return 'ring-2 ring-red-500';
      case 'danger': return 'ring-2 ring-orange-500';
      case 'warning': return 'ring-2 ring-yellow-500';
      default: return '';
    }
  };

  return (
    <>
    <Card className={`hover:shadow-md transition-shadow ${getDeadlineColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{order.clientName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{order.id}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
            {order.statusDeadline && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  deadlineStatus === 'overdue' ? 'bg-red-50 text-red-700 border-red-300' :
                  deadlineStatus === 'danger' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                  deadlineStatus === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                  'bg-green-50 text-green-700 border-green-300'
                }`}
              >
                <Icon 
                  name={deadlineStatus === 'overdue' ? 'AlertTriangle' : 'Clock'} 
                  size={12} 
                  className="mr-1" 
                />
                {formatDeadline(order.statusDeadline)}
              </Badge>
            )}
          </div>
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
              <Select value={order.status} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                <SelectTrigger className="h-9 w-9 p-0">
                  <Icon name="RefreshCw" size={16} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const isDisabled = requiresRepairDescription(key as OrderStatus) && !order.repairDescription;
                    return (
                      <SelectItem key={key} value={key} disabled={isDisabled}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                          {config.label}
                          {isDisabled && <Icon name="Lock" size={12} className="ml-1 text-muted-foreground" />}
                        </div>
                      </SelectItem>
                    );
                  })}
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