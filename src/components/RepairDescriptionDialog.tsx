import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface RepairDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  currentDescription?: string;
  orderNumber: string;
}

export default function RepairDescriptionDialog({
  isOpen,
  onClose,
  onSave,
  currentDescription,
  orderNumber,
}: RepairDescriptionDialogProps) {
  const [description, setDescription] = useState(currentDescription || '');

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Описание выполненного ремонта</DialogTitle>
          <DialogDescription>
            Заказ {orderNumber}: опишите детали выполненного ремонта, замененные детали и проведенные работы
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repair-description">Описание ремонта *</Label>
            <Textarea
              id="repair-description"
              placeholder="Например: Заменен компрессор, произведена заправка хладагента R600a (100г), проверена герметичность системы..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Минимум 20 символов. Укажите выполненные работы, замененные детали, использованные материалы.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={description.trim().length < 20}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
