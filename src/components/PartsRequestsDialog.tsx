import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface PartsRequest {
  orderId: string;
  deviceType: string;
  deviceModel: string;
  requestedBy: string;
  requestedAt: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface PartsRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: PartsRequest[];
  onStartProcessing: (orderId: string) => void;
  onComplete: (orderId: string) => void;
}

export default function PartsRequestsDialog({
  open,
  onOpenChange,
  requests,
  onStartProcessing,
  onComplete,
}: PartsRequestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Package" size={24} />
            Запросы на запчасти
          </DialogTitle>
          <DialogDescription>
            Список запросов от мастеров на необходимые запчасти
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="Package" size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Нет активных запросов на запчасти</p>
              <p className="text-sm">Мастера не отправляли запросы</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.orderId}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Icon name="FileText" size={18} />
                        Заказ {request.orderId}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.deviceType} • {request.deviceModel}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status === 'pending' && '⏳ Ожидает'}
                      {request.status === 'in-progress' && '🔄 В процессе'}
                      {request.status === 'completed' && '✅ Выполнено'}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Необходимые запчасти:
                      </p>
                      <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">
                        {request.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="User" size={14} />
                      <span>Запросил: {request.requestedBy}</span>
                      <span>•</span>
                      <Icon name="Clock" size={14} />
                      <span>{request.requestedAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onStartProcessing(request.orderId)}
                        className="flex-1"
                      >
                        <Icon name="Play" size={16} className="mr-2" />
                        Взять в работу
                      </Button>
                    )}
                    {request.status === 'in-progress' && (
                      <Button
                        size="sm"
                        onClick={() => onComplete(request.orderId)}
                        className="flex-1"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Отметить выполненным
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
