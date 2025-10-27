import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PartsRequestDialog from '@/components/PartsRequestDialog';
import { OrderStatus } from './types';

interface Order {
  id: string;
  status: OrderStatus;
  deviceType: string;
  partsRequest?: {
    requestedBy: string;
    requestedAt: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
  };
}

interface PartsRequestSectionProps {
  order: Order;
  hasPermission: (permission: string) => boolean;
  onSavePartsRequest: (orderId: string, description: string) => void;
}

export default function PartsRequestSection({
  order,
  hasPermission,
  onSavePartsRequest,
}: PartsRequestSectionProps) {
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false);

  const canRequestParts = ['diagnostics', 'repair', 'repair-continues'].includes(order.status);

  if (!hasPermission('change_status') || !canRequestParts) {
    return null;
  }

  return (
    <>
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="Package" size={18} />
          Запчасти
        </h3>
        <div className="space-y-3">
          {order.partsRequest ? (
            <div className={`p-3 rounded-md border ${
              order.partsRequest.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
              order.partsRequest.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">
                  {order.partsRequest.status === 'pending' && '⏳ Запрос отправлен менеджеру'}
                  {order.partsRequest.status === 'in-progress' && '🔄 Запчасти в процессе заказа'}
                  {order.partsRequest.status === 'completed' && '✅ Запчасти готовы'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPartsDialogOpen(true)}
                >
                  <Icon name="Edit" size={14} />
                </Button>
              </div>
              <p className="text-sm mb-2 whitespace-pre-wrap">
                <strong>Описание:</strong> {order.partsRequest.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Запросил: {order.partsRequest.requestedBy} • {order.partsRequest.requestedAt}
              </p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPartsDialogOpen(true)}
              className="w-full"
            >
              <Icon name="Package" size={16} className="mr-2" />
              Требуются запчасти
            </Button>
          )}
        </div>
      </div>

      <PartsRequestDialog
        orderId={order.id}
        deviceType={order.deviceType}
        isOpen={isPartsDialogOpen}
        onClose={() => setIsPartsDialogOpen(false)}
        onSave={onSavePartsRequest}
        currentPartsRequest={order.partsRequest?.description}
      />
    </>
  );
}
