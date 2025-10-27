import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { OrderStatus } from './types';

interface Order {
  id: string;
  status: OrderStatus;
  isDelayed?: boolean;
  delayReason?: string;
  extensionRequest?: {
    requestedBy: string;
    requestedAt: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

interface DelaySectionProps {
  order: Order;
  hasPermission: (permission: string) => boolean;
  isDelayed: boolean;
  setIsDelayed: (value: boolean) => void;
  delayReason: string;
  setDelayReason: (value: string) => void;
}

export default function DelaySection({
  order,
  hasPermission,
  isDelayed,
  setIsDelayed,
  delayReason,
  setDelayReason,
}: DelaySectionProps) {
  const { toast } = useToast();

  const handleDelayChange = (checked: boolean) => {
    if (checked) {
      setIsDelayed(true);
    } else {
      setIsDelayed(false);
      setDelayReason('');
      toast({
        title: 'Задержка снята',
        description: 'Ремонт больше не отмечен как задержанный',
      });
    }
  };

  const handleSaveDelay = () => {
    if (isDelayed && !delayReason.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо указать причину задержки ремонта',
        variant: 'destructive',
      });
      return;
    }
    
    if (order.status === 'diagnostics' || order.status === 'repair') {
      const statusLabel = order.status === 'diagnostics' ? 'диагностики' : 'ремонта';
      toast({
        title: 'Запрос отправлен',
        description: `Запрос на продление срока ${statusLabel} отправлен директору на рассмотрение`,
      });
    } else {
      toast({
        title: 'Задержка сохранена',
        description: 'Информация о задержке ремонта обновлена',
      });
    }
  };

  if (!hasPermission('change_status')) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Clock" size={18} />
        Управление задержками
      </h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="delayed"
            checked={isDelayed}
            onCheckedChange={handleDelayChange}
          />
          <Label htmlFor="delayed" className="text-sm cursor-pointer">
            Задержанный ремонт
          </Label>
        </div>
        {isDelayed && (
          <div>
            <Label htmlFor="delay-reason" className="text-sm">
              Причина задержки
            </Label>
            <Textarea
              id="delay-reason"
              placeholder="Укажите причину задержки..."
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="min-h-[80px]"
            />
            {(order.status === 'diagnostics' || order.status === 'repair') && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-900">
                <Icon name="Info" size={14} className="inline mr-1" />
                При сохранении будет отправлен запрос директору на продление срока {order.status === 'diagnostics' ? 'диагностики' : 'ремонта'} на +3 дня
              </div>
            )}
            <Button 
              onClick={handleSaveDelay} 
              size="sm"
              className="mt-2"
            >
              <Icon name="Save" size={16} className="mr-2" />
              {(order.status === 'diagnostics' || order.status === 'repair') ? 'Запросить продление' : 'Сохранить задержку'}
            </Button>
          </div>
        )}
        
        {order.extensionRequest && (
          <div className={`text-sm p-3 rounded-md border ${
            order.extensionRequest.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
            order.extensionRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
            <p className="font-medium mb-1">
              {order.extensionRequest.status === 'pending' && '⏳ Запрос на рассмотрении'}
              {order.extensionRequest.status === 'approved' && '✅ Продление одобрено (+3 дня)'}
              {order.extensionRequest.status === 'rejected' && '❌ Продление отклонено'}
            </p>
            <p className="text-xs mb-1">
              <strong>Причина:</strong> {order.extensionRequest.reason}
            </p>
            <p className="text-xs text-muted-foreground">
              Запросил: {order.extensionRequest.requestedBy} • {order.extensionRequest.requestedAt}
            </p>
            {order.extensionRequest.reviewedBy && (
              <p className="text-xs text-muted-foreground">
                Рассмотрел: {order.extensionRequest.reviewedBy} • {order.extensionRequest.reviewedAt}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
