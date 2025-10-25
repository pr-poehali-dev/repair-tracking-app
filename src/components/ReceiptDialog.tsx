import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

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
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless';
  createdAt: string;
  createdTime: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const repairTypeLabels = {
  warranty: 'Гарантийный',
  repeat: 'Повторный',
  paid: 'Платный',
  cashless: 'Безнал',
};

export default function ReceiptDialog({ open, onOpenChange, order }: ReceiptDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] print:max-w-full print:shadow-none print:border-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Icon name="FileText" size={20} className="text-primary-foreground" />
            </div>
            Квитанция о приёме техники
          </DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6 p-8 print:p-0">
          <div className="text-center border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold mb-2">КВИТАНЦИЯ О ПРИЁМЕ ТЕХНИКИ В РЕМОНТ</h1>
            <div className="flex justify-between items-center text-sm">
              <div>
                <strong>№ заказа:</strong> {order.id}
              </div>
              <div>
                <strong>Дата:</strong> {order.createdAt} <strong>Время:</strong> {order.createdTime}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">ИНФОРМАЦИЯ О КЛИЕНТЕ</h2>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-semibold min-w-[120px]">ФИО:</span>
                  <span>{order.clientName}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold min-w-[120px]">Телефон:</span>
                  <span>{order.clientPhone}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold min-w-[120px]">Адрес:</span>
                  <span>{order.clientAddress || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">ВИД РЕМОНТА</h2>
              <div className="text-sm">
                <div className="inline-block border-2 border-black px-4 py-2 font-bold">
                  {repairTypeLabels[order.repairType]}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">ИНФОРМАЦИЯ О ТЕХНИКЕ</h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex">
                  <span className="font-semibold min-w-[140px]">Вид техники:</span>
                  <span>{order.deviceType}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold min-w-[140px]">Модель:</span>
                  <span>{order.deviceModel || '—'}</span>
                </div>
              </div>
              <div className="flex">
                <span className="font-semibold min-w-[140px]">Серийный номер:</span>
                <span>{order.serialNumber || '—'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold min-w-[140px]">Внешний вид:</span>
                <span>{order.appearance || '—'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold min-w-[140px]">Комплектация:</span>
                <span>{order.accessories || '—'}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">ЗАЯВЛЕННАЯ НЕИСПРАВНОСТЬ</h2>
            <p className="text-sm">{order.issue}</p>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="mb-2">Техника принята:</p>
              <div className="border-b border-black w-full mb-1"></div>
              <p className="text-xs text-gray-600">(подпись мастера-приёмщика)</p>
            </div>
            <div>
              <p className="mb-2">Техника сдана:</p>
              <div className="border-b border-black w-full mb-1"></div>
              <p className="text-xs text-gray-600">(подпись клиента)</p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-400 pt-6 mt-8">
            <p className="text-xs text-gray-600 text-center">
              Отрывная часть для клиента
            </p>
            <div className="mt-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <strong>№ заказа:</strong> {order.id}
                </div>
                <div>
                  <strong>Дата:</strong> {order.createdAt} {order.createdTime}
                </div>
              </div>
              <div className="mt-2">
                <strong>Клиент:</strong> {order.clientName}
              </div>
              <div>
                <strong>Телефон:</strong> {order.clientPhone}
              </div>
              <div>
                <strong>Техника:</strong> {order.deviceType} {order.deviceModel}
              </div>
              <div>
                <strong>Вид ремонта:</strong> {repairTypeLabels[order.repairType]}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 print:hidden">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button className="flex-1 gap-2" onClick={handlePrint}>
            <Icon name="Printer" size={18} />
            Печать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
