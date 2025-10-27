import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { OrderStatus } from './types';

interface Order {
  id: string;
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high';
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless' | 'our-device';
  createdAt: string;
  createdTime: string;
  repairDescription?: string;
  customDeadlineDays?: number;
}

interface OrderStatusSectionProps {
  order: Order;
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  priorityConfig: Record<string, { label: string; color: string }>;
  hasPermission: (permission: string) => boolean;
  customDeadline: string;
  setCustomDeadline: (value: string) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

const repairTypeLabels = {
  warranty: 'Гарантийный',
  repeat: 'Повторный',
  paid: 'Платный',
  cashless: 'Безнал',
  'our-device': 'Наша техника',
};

export default function OrderStatusSection({
  order,
  statusConfig,
  priorityConfig,
  hasPermission,
  customDeadline,
  setCustomDeadline,
  onStatusChange,
}: OrderStatusSectionProps) {
  const { toast } = useToast();

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
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge className={statusConfig[order.status].color}>
            {statusConfig[order.status].label}
          </Badge>
          {hasPermission('change_status') && onStatusChange && (
            <Select value={order.status} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
              <SelectTrigger className="w-[220px] h-8">
                <SelectValue />
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
        <Badge variant="outline" className={priorityConfig[order.priority].color}>
          {priorityConfig[order.priority].label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Создан</p>
          <p className="font-medium">{order.createdAt} в {order.createdTime}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Вид ремонта</p>
          <p className="font-medium">{repairTypeLabels[order.repairType]}</p>
        </div>
      </div>

      {hasPermission('approve_extensions') && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Label htmlFor="custom-deadline" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Icon name="Clock" size={16} />
            Индивидуальный срок выполнения
          </Label>
          <div className="flex gap-2 items-center">
            <input
              id="custom-deadline"
              type="number"
              min="1"
              max="30"
              value={customDeadline}
              onChange={(e) => setCustomDeadline(e.target.value)}
              placeholder="Дни (по умолчанию 3)"
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => {
                const days = parseInt(customDeadline);
                if (days && days > 0 && days <= 30) {
                  toast({
                    title: 'Срок установлен',
                    description: `Индивидуальный срок выполнения: ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`,
                  });
                } else {
                  toast({
                    title: 'Ошибка',
                    description: 'Укажите срок от 1 до 30 дней',
                    variant: 'destructive',
                  });
                }
              }}
              size="sm"
            >
              <Icon name="Check" size={16} className="mr-1" />
              Применить
            </Button>
          </div>
          {order.customDeadlineDays && (
            <p className="text-xs text-blue-700 mt-2">
              ⏱️ Установлен индивидуальный срок: {order.customDeadlineDays} {order.customDeadlineDays === 1 ? 'день' : order.customDeadlineDays < 5 ? 'дня' : 'дней'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}