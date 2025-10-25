import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import AssignUserDialog from '@/components/AssignUserDialog';
import RepairDescriptionDialog from '@/components/RepairDescriptionDialog';
import { useAuth } from '@/contexts/AuthContext';

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

interface OrderHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

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
  history: OrderHistoryItem[];
}

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  priorityConfig: Record<string, { label: string; color: string }>;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onSaveRepairDescription?: (orderId: string, description: string) => void;
}

const repairTypeLabels = {
  warranty: 'Гарантийный',
  repeat: 'Повторный',
  paid: 'Платный',
  cashless: 'Безнал',
};

export default function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
  statusConfig,
  priorityConfig,
  onStatusChange,
  onSaveRepairDescription,
}: OrderDetailsDialogProps) {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [isRepairDescOpen, setIsRepairDescOpen] = useState(false);

  if (!order) return null;

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

  const handleSaveDescription = (description: string) => {
    if (onSaveRepairDescription) {
      onSaveRepairDescription(order.id, description);
      toast({
        title: 'Описание сохранено',
        description: 'Описание ремонта успешно добавлено',
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Детали заказа {order.id}</DialogTitle>
              {hasPermission('assign_master') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignUserOpen(true)}
                >
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Участники
                </Button>
              )}
            </div>
          </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
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
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="User" size={18} />
                Информация о клиенте
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">ФИО</p>
                  <p className="font-medium">{order.clientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Адрес</p>
                  <p className="font-medium">{order.clientAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Телефон</p>
                  <p className="font-medium">{order.clientPhone}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Smartphone" size={18} />
                Информация об устройстве
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Тип устройства</p>
                  <p className="font-medium">{order.deviceType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Модель</p>
                  <p className="font-medium">{order.deviceModel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Серийный номер</p>
                  <p className="font-medium">{order.serialNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Внешний вид</p>
                  <p className="font-medium">{order.appearance}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Комплектация</p>
                  <p className="font-medium">{order.accessories}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" size={18} />
                Проблема
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">{order.issue}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="FileText" size={18} />
                  Описание выполненного ремонта
                </h3>
                {hasPermission('edit_repair') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRepairDescOpen(true)}
                  >
                    <Icon name={order.repairDescription ? "Edit" : "Plus"} size={16} className="mr-2" />
                    {order.repairDescription ? 'Редактировать' : 'Добавить'}
                  </Button>
                )}
              </div>
              {order.repairDescription ? (
                <p className="text-sm bg-green-50 border border-green-200 p-3 rounded-md whitespace-pre-wrap">{order.repairDescription}</p>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  Описание ремонта пока не добавлено. Необходимо заполнить перед завершением ремонта.
                </p>
              )}
            </div>

            {order.master && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Wrench" size={18} />
                    Мастер
                  </h3>
                  <p className="text-sm font-medium">{order.master}</p>
                </div>
              </>
            )}

            {order.price && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Wallet" size={18} />
                    Стоимость
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {order.price.toLocaleString()} ₽
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="History" size={18} />
                История изменений
              </h3>
              <div className="space-y-3">
                {order.history.map((item, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      {index < order.history.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.timestamp} • {item.user}
                      </p>
                      {item.details && (
                        <p className="text-muted-foreground text-xs mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    <AssignUserDialog
      orderId={order.id}
      isOpen={isAssignUserOpen}
      onClose={() => setIsAssignUserOpen(false)}
    />

    <RepairDescriptionDialog
      isOpen={isRepairDescOpen}
      onClose={() => setIsRepairDescOpen(false)}
      onSave={handleSaveDescription}
      currentDescription={order.repairDescription}
      orderNumber={order.id}
    />
    </>
  );
}