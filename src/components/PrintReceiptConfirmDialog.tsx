import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Order {
  id: string;
  clientName: string;
  deviceType: string;
  deviceModel: string;
}

interface PrintReceiptConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onPrintReceipt: () => void;
}

export default function PrintReceiptConfirmDialog({ 
  open, 
  onOpenChange, 
  order,
  onPrintReceipt 
}: PrintReceiptConfirmDialogProps) {
  if (!order) return null;

  const handlePrint = () => {
    onPrintReceipt();
    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Icon name="CheckCircle2" size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold">Заказ создан успешно!</div>
              <div className="text-sm font-normal text-muted-foreground">
                {order.id}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span className="font-medium">{order.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Smartphone" size={16} className="text-muted-foreground" />
              <span>{order.deviceType} {order.deviceModel}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <Icon name="Printer" size={16} className="mt-0.5 text-blue-600" />
            <p className="flex-1">
              Распечатайте квитанцию о приёме техники в ремонт для клиента
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            <Icon name="X" size={16} className="mr-2" />
            Пропустить
          </Button>
          <Button 
            onClick={handlePrint}
            className="w-full sm:w-auto"
          >
            <Icon name="Printer" size={16} className="mr-2" />
            Печать квитанции
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
