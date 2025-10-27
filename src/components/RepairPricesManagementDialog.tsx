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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { RepairPrice } from '@/components/RepairPricesDialog';

interface RepairPricesManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prices: RepairPrice[];
  onAddPrice: (price: Omit<RepairPrice, 'id'>) => void;
  onDeletePrice: (id: string) => void;
}

export default function RepairPricesManagementDialog({
  isOpen,
  onClose,
  prices,
  onAddPrice,
  onDeletePrice,
}: RepairPricesManagementDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState('');
  const [newRepairName, setNewRepairName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  const deviceTypes = Array.from(new Set(prices.map(p => p.deviceType)));
  const [activeTab, setActiveTab] = useState(deviceTypes[0] || 'all');

  const filteredPrices = activeTab === 'all' 
    ? prices 
    : prices.filter(p => p.deviceType === activeTab);

  const handleAdd = () => {
    if (!newDeviceType.trim() || !newRepairName.trim() || !newPrice.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
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

    onAddPrice({
      deviceType: newDeviceType,
      repairName: newRepairName,
      price,
      description: newDescription || undefined,
    });

    toast({
      title: 'Позиция добавлена',
      description: 'Новая услуга добавлена в прайс-лист',
    });

    setNewDeviceType('');
    setNewRepairName('');
    setNewPrice('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onDeletePrice(id);
    toast({
      title: 'Позиция удалена',
      description: 'Услуга удалена из прайс-листа',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="DollarSign" size={24} />
            База стоимостей ремонтов
          </DialogTitle>
          <DialogDescription>
            Управление прайс-листом для всех типов техники
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${deviceTypes.length + 1}, 1fr)` }}>
            <TabsTrigger value="all">Все ({prices.length})</TabsTrigger>
            {deviceTypes.map(type => (
              <TabsTrigger key={type} value={type}>
                {type} ({prices.filter(p => p.deviceType === type).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                {filteredPrices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Icon name="Receipt" size={48} className="mb-4 opacity-50" />
                    <p className="text-sm">Нет позиций в прайс-листе</p>
                  </div>
                ) : (
                  filteredPrices.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                              {item.deviceType}
                            </span>
                          </div>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Icon name="Trash2" size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-3">
          {isAdding ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="device-type" className="text-sm">
                    Тип техники
                  </Label>
                  <Input
                    id="device-type"
                    placeholder="Стиральная машина"
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value)}
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
              </div>
              <div>
                <Label htmlFor="repair-name" className="text-sm">
                  Название работы
                </Label>
                <Input
                  id="repair-name"
                  placeholder="Замена подшипника"
                  value={newRepairName}
                  onChange={(e) => setNewRepairName(e.target.value)}
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
                    setNewDeviceType('');
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
              Добавить новую позицию
            </Button>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
