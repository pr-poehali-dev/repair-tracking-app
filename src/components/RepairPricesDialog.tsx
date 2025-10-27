import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export interface RepairPrice {
  id: string;
  deviceType: string;
  repairName: string;
  price: number;
  description?: string;
}

interface RepairPricesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deviceType: string;
  prices: RepairPrice[];
  canEdit: boolean;
  onAddPrice?: (price: Omit<RepairPrice, 'id'>) => void;
  onDeletePrice?: (id: string) => void;
  onSelectPrice?: (price: number, name: string) => void;
}

export default function RepairPricesDialog({
  isOpen,
  onClose,
  deviceType,
  prices,
  canEdit,
  onAddPrice,
  onDeletePrice,
  onSelectPrice,
}: RepairPricesDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRepairName, setNewRepairName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  const filteredPrices = prices.filter(p => p.deviceType === deviceType);

  const handleAdd = () => {
    if (!newRepairName.trim() || !newPrice.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название работы и стоимость',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную стоимость',
        variant: 'destructive',
      });
      return;
    }

    if (onAddPrice) {
      onAddPrice({
        deviceType,
        repairName: newRepairName,
        price,
        description: newDescription || undefined,
      });
      toast({
        title: 'Позиция добавлена',
        description: 'Новая услуга добавлена в прайс-лист',
      });
      setNewRepairName('');
      setNewPrice('');
      setNewDescription('');
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (onDeletePrice) {
      onDeletePrice(id);
      toast({
        title: 'Позиция удалена',
        description: 'Услуга удалена из прайс-листа',
      });
    }
  };

  const handleSelect = (price: number, name: string) => {
    if (onSelectPrice) {
      onSelectPrice(price, name);
      toast({
        title: 'Стоимость установлена',
        description: `${name}: ${price} ₽`,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="DollarSign" size={20} />
            Прайс-лист: {deviceType}
          </DialogTitle>
          <DialogDescription>
            Стоимость ремонтных работ для данного типа устройства
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-3">
            {filteredPrices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Icon name="Receipt" size={48} className="mb-4 opacity-50" />
                <p className="text-sm">Прайс-лист пуст</p>
                <p className="text-xs">Добавьте первую позицию</p>
              </div>
            ) : (
              filteredPrices.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.repairName}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mt-2">
                        {item.price} ₽
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {onSelectPrice && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelect(item.price, item.repairName)}
                        >
                          <Icon name="Check" size={14} className="mr-1" />
                          Выбрать
                        </Button>
                      )}
                      {canEdit && onDeletePrice && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Icon name="Trash2" size={14} className="text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {canEdit && onAddPrice && (
          <>
            <Separator />
            <div className="space-y-3">
              {isAdding ? (
                <>
                  <div>
                    <Label htmlFor="repair-name" className="text-sm">
                      Название работы
                    </Label>
                    <Input
                      id="repair-name"
                      placeholder="Замена экрана"
                      value={newRepairName}
                      onChange={(e) => setNewRepairName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repair-price" className="text-sm">
                      Стоимость (₽)
                    </Label>
                    <Input
                      id="repair-price"
                      type="number"
                      placeholder="2500"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repair-description" className="text-sm">
                      Описание (опционально)
                    </Label>
                    <Input
                      id="repair-description"
                      placeholder="С учетом стоимости запчастей"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex-1">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAdding(false);
                        setNewRepairName('');
                        setNewPrice('');
                        setNewDescription('');
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(true)}
                  className="w-full"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить позицию
                </Button>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
