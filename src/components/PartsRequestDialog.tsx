import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface PartsRequestDialogProps {
  orderId: string;
  deviceType: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, partsDescription: string) => void;
  currentPartsRequest?: string;
}

export default function PartsRequestDialog({
  orderId,
  deviceType,
  isOpen,
  onClose,
  onSave,
  currentPartsRequest,
}: PartsRequestDialogProps) {
  const [partsDescription, setPartsDescription] = useState(currentPartsRequest || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (!partsDescription.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо описать требуемые запчасти',
        variant: 'destructive',
      });
      return;
    }

    onSave(orderId, partsDescription);
    toast({
      title: 'Запрос отправлен',
      description: 'Менеджер по запчастям получил уведомление',
    });
    onClose();
  };

  const handleClose = () => {
    setPartsDescription(currentPartsRequest || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Package" size={20} />
            Запрос запчастей
          </DialogTitle>
          <DialogDescription>
            Заказ {orderId} • {deviceType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-900">
            <Icon name="Info" size={14} className="inline mr-1" />
            После сохранения менеджер по запчастям получит уведомление с описанием требуемых деталей
          </div>

          <div>
            <Label htmlFor="parts-description" className="text-sm font-medium">
              Описание необходимых запчастей
            </Label>
            <Textarea
              id="parts-description"
              placeholder="Опишите необходимые запчасти: название, артикул, количество..."
              value={partsDescription}
              onChange={(e) => setPartsDescription(e.target.value)}
              className="min-h-[150px] mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Укажите максимально точное описание для ускорения поиска и заказа
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить запрос
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
