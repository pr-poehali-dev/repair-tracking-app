import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import AssignUserDialog from '@/components/AssignUserDialog';
import RepairDescriptionDialog from '@/components/RepairDescriptionDialog';
import RepairPricesDialog from '@/components/RepairPricesDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRepairPrices } from '@/hooks/useRepairPrices';

import { Order, OrderStatus } from '@/components/order-details/types';
import OrderStatusSection from '@/components/order-details/OrderStatusSection';
import ClientInfoSection from '@/components/order-details/ClientInfoSection';
import DeviceInfoSection from '@/components/order-details/DeviceInfoSection';
import RepairInfoSection from '@/components/order-details/RepairInfoSection';
import DelaySection from '@/components/order-details/DelaySection';
import PartsRequestSection from '@/components/order-details/PartsRequestSection';
import HistorySection from '@/components/order-details/HistorySection';
import OrderChatSection from '@/components/OrderChatSection';
import OrderMediaSection from '@/components/OrderMediaSection';

export type { OrderStatus };

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onSaveRepairDescription?: (orderId: string, description: string) => void;
  onSavePartsRequest?: (orderId: string, description: string) => void;
}

export default function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
  statusConfig,
  onStatusChange,
  onSaveRepairDescription,
  onSavePartsRequest,
}: OrderDetailsDialogProps) {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const { prices, addPrice, deletePrice } = useRepairPrices();
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [isRepairDescOpen, setIsRepairDescOpen] = useState(false);
  const [isPriceListOpen, setIsPriceListOpen] = useState(false);
  const [isDelayed, setIsDelayed] = useState(order?.isDelayed || false);
  const [delayReason, setDelayReason] = useState(order?.delayReason || '');
  const [customDeadline, setCustomDeadline] = useState(order?.customDeadlineDays?.toString() || '');

  if (!order) return null;

  const handleSaveDescription = (description: string) => {
    if (onSaveRepairDescription) {
      onSaveRepairDescription(order.id, description);
      toast({
        title: 'Описание сохранено',
        description: 'Описание ремонта успешно добавлено',
      });
    }
  };

  const handleSavePartsRequest = (orderId: string, description: string) => {
    if (onSavePartsRequest) {
      onSavePartsRequest(orderId, description);
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
              <OrderStatusSection
                order={order}
                statusConfig={statusConfig}
                hasPermission={hasPermission}
                customDeadline={customDeadline}
                setCustomDeadline={setCustomDeadline}
                onStatusChange={onStatusChange}
              />

              <Separator />

              <ClientInfoSection order={order} />

              <Separator />

              <DeviceInfoSection order={order} />

              <Separator />

              <RepairInfoSection
                order={order}
                hasPermission={hasPermission}
                onOpenRepairDesc={() => setIsRepairDescOpen(true)}
                onOpenPriceList={() => setIsPriceListOpen(true)}
              />

              <Separator />

              <DelaySection
                order={order}
                hasPermission={hasPermission}
                isDelayed={isDelayed}
                setIsDelayed={setIsDelayed}
                delayReason={delayReason}
                setDelayReason={setDelayReason}
              />

              <Separator />

              <PartsRequestSection
                order={order}
                hasPermission={hasPermission}
                onSavePartsRequest={handleSavePartsRequest}
              />

              <Separator />

              <OrderMediaSection orderId={order.id} />

              <Separator />

              <OrderChatSection orderId={order.id} />

              <Separator />

              <HistorySection order={order} />
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
        orderId={order.id}
        currentDescription={order.repairDescription || ''}
        isOpen={isRepairDescOpen}
        onClose={() => setIsRepairDescOpen(false)}
        onSave={handleSaveDescription}
      />

      <RepairPricesDialog
        isOpen={isPriceListOpen}
        onClose={() => setIsPriceListOpen(false)}
        deviceType={order.deviceType}
        prices={prices}
        canEdit={hasPermission('edit_finance')}
        onAddPrice={addPrice}
        onDeletePrice={deletePrice}
        onSelectPrice={(price) => {
          console.log('Selected price:', price);
        }}
      />
    </>
  );
}