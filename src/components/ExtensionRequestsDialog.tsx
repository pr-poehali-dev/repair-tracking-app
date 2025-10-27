import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ExtensionRequest {
  orderId: string;
  deviceType: string;
  deviceModel: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ExtensionRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: ExtensionRequest[];
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export default function ExtensionRequestsDialog({
  open,
  onOpenChange,
  requests,
  onApprove,
  onReject,
}: ExtensionRequestsDialogProps) {
  const { toast } = useToast();
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleApprove = (orderId: string) => {
    onApprove(orderId);
    toast({
      title: 'Продление одобрено',
      description: 'Срок диагностики продлен на 3 дня',
    });
  };

  const handleReject = (orderId: string) => {
    onReject(orderId);
    toast({
      title: 'Запрос отклонен',
      description: 'Продление срока диагностики отклонено',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Запросы на продление диагностики
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Нет активных запросов на рассмотрение</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.orderId}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {request.orderId}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.deviceType} • {request.deviceModel}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100">
                      На рассмотрении
                    </Badge>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-yellow-200">
                    <p className="text-xs text-muted-foreground mb-1">Причина задержки:</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <Icon name="User" size={12} className="inline mr-1" />
                    Запрос от: {request.requestedBy}
                    <span className="mx-2">•</span>
                    <Icon name="Clock" size={12} className="inline mr-1" />
                    {new Date(request.requestedAt).toLocaleString('ru-RU')}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(request.orderId)}
                      className="flex-1"
                      variant="default"
                    >
                      <Icon name="CheckCircle" size={16} className="mr-2" />
                      Одобрить (+3 дня)
                    </Button>
                    <Button
                      onClick={() => handleReject(request.orderId)}
                      className="flex-1"
                      variant="destructive"
                    >
                      <Icon name="XCircle" size={16} className="mr-2" />
                      Отклонить
                    </Button>
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
