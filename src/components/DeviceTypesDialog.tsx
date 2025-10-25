import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceType {
  id: number;
  name: string;
  category: string;
}

interface DeviceTypesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVICE_TYPES_API_URL = 'https://functions.poehali.dev/7e59e15a-4b6d-4147-8829-3060b4d82b31';

const categories = [
  'Крупная бытовая техника',
  'Кухонная техника',
  'Встраиваемая техника',
  'Мелкая бытовая техника',
  'Электроника',
  'Компьютерная техника',
];

export default function DeviceTypesDialog({ isOpen, onClose }: DeviceTypesDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState({ name: '', category: categories[0] });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDeviceTypes();
    }
  }, [isOpen]);

  const loadDeviceTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(DEVICE_TYPES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки типов техники:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить типы техники',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeviceType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDeviceType.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название типа техники',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(DEVICE_TYPES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': user?.role || '',
        },
        body: JSON.stringify(newDeviceType),
      });

      if (response.ok) {
        toast({
          title: 'Тип техники добавлен',
          description: `${newDeviceType.name} успешно добавлен в справочник`,
        });
        setNewDeviceType({ name: '', category: categories[0] });
        await loadDeviceTypes();
      } else {
        throw new Error('Ошибка добавления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить тип техники',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteDeviceType = async (id: number, name: string) => {
    if (!confirm(`Удалить "${name}" из справочника?`)) {
      return;
    }

    try {
      const response = await fetch(DEVICE_TYPES_API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': user?.role || '',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast({
          title: 'Тип техники удален',
          description: `${name} удален из справочника`,
        });
        await loadDeviceTypes();
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить тип техники',
        variant: 'destructive',
      });
    }
  };

  const groupedByCategory = deviceTypes.reduce((acc, dt) => {
    if (!acc[dt.category]) {
      acc[dt.category] = [];
    }
    acc[dt.category].push(dt);
    return acc;
  }, {} as Record<string, DeviceType[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Справочник типов техники
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleAddDeviceType} className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Plus" size={16} />
              Добавить новый тип техники
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="deviceName">Название</Label>
                <Input
                  id="deviceName"
                  placeholder="Например: Микроволновая печь"
                  value={newDeviceType.name}
                  onChange={(e) => setNewDeviceType({ ...newDeviceType, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deviceCategory">Категория</Label>
                <select
                  id="deviceCategory"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newDeviceType.category}
                  onChange={(e) => setNewDeviceType({ ...newDeviceType, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="mt-3 w-full" disabled={isAdding}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </form>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedByCategory).map(([category, types]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                      {category} ({types.length})
                    </h3>
                    <div className="space-y-2">
                      {types.map((dt) => (
                        <div
                          key={dt.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                        >
                          <span className="font-medium">{dt.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDeviceType(dt.id, dt.name)}
                          >
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
