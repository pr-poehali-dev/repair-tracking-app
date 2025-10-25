import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DeviceType {
  id: number;
  name: string;
  category: string;
}

interface Client {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  devices: Array<{
    deviceType: string;
    deviceModel: string;
    serialNumber: string;
  }>;
}

const DEVICE_TYPES_API_URL = 'https://functions.poehali.dev/7e59e15a-4b6d-4147-8829-3060b4d82b31';
const CLIENTS_API_URL = 'https://functions.poehali.dev/a71e85f8-4a97-42b3-ad3f-f2a76d79cd8f';

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (order: NewOrderFormData) => void;
}

export interface NewOrderFormData {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  issue: string;
  appearance: string;
  accessories: string;
  priority: 'low' | 'medium' | 'high';
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless';
}

export default function NewOrderDialog({ open, onOpenChange, onSubmit }: NewOrderDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState<NewOrderFormData>({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    deviceType: '',
    deviceModel: '',
    serialNumber: '',
    issue: '',
    appearance: '',
    accessories: '',
    priority: 'medium',
    repairType: 'paid',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewOrderFormData, string>>>({});

  useEffect(() => {
    if (open) {
      loadDeviceTypes();
    }
  }, [open]);

  const loadDeviceTypes = async () => {
    try {
      const response = await fetch(DEVICE_TYPES_API_URL);
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки типов техники:', error);
    }
  };

  const searchClients = async (query: string, field: 'phone' | 'serialNumber') => {
    if (query.length < 3) {
      setClientSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const params = new URLSearchParams({ [field]: query });
      const response = await fetch(`${CLIENTS_API_URL}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClientSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Ошибка поиска клиентов:', error);
    }
  };

  const fillClientData = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.fullName,
      clientPhone: client.phone,
      clientAddress: client.address || '',
    }));
    setShowSuggestions(false);
    toast({
      title: 'Данные клиента заполнены',
      description: `Загружены данные: ${client.fullName}`,
    });
  };

  const handleChange = (field: keyof NewOrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    if (field === 'clientPhone' && value.length >= 3) {
      searchClients(value, 'phone');
    } else if (field === 'serialNumber' && value.length >= 3) {
      searchClients(value, 'serialNumber');
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewOrderFormData, string>> = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'Обязательное поле';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Обязательное поле';
    if (!formData.deviceType.trim()) newErrors.deviceType = 'Обязательное поле';
    if (!formData.issue.trim()) newErrors.issue = 'Обязательное поле';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await fetch(CLIENTS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.clientName,
            phone: formData.clientPhone,
            address: formData.clientAddress,
            deviceType: formData.deviceType,
            deviceModel: formData.deviceModel,
            serialNumber: formData.serialNumber,
          }),
        });
      } catch (error) {
        console.error('Ошибка сохранения клиента:', error);
      }

      onSubmit(formData);
      setFormData({
        clientName: '',
        clientAddress: '',
        clientPhone: '',
        deviceType: '',
        deviceModel: '',
        serialNumber: '',
        issue: '',
        appearance: '',
        accessories: '',
        priority: 'medium',
        repairType: 'paid',
      });
      setErrors({});
      setClientSuggestions([]);
      setShowSuggestions(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Icon name="Plus" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold">Новый заказ</div>
              <div className="text-sm font-normal text-muted-foreground">Менеджер: {user?.fullName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[calc(90vh-160px)]">
            <div className="space-y-6 pr-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="User" size={18} className="text-primary" />
                  Информация о клиенте
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="clientName">ФИО клиента <span className="text-destructive">*</span></Label>
                    <Input
                      id="clientName"
                      placeholder="Иванов Иван Иванович"
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      className={errors.clientName ? 'border-destructive' : ''}
                    />
                    {errors.clientName && <p className="text-xs text-destructive mt-1">{errors.clientName}</p>}
                  </div>

                  <div className="relative">
                    <Label htmlFor="clientPhone">Номер телефона <span className="text-destructive">*</span></Label>
                    <Input
                      id="clientPhone"
                      placeholder="+7 (___) ___-__-__"
                      value={formData.clientPhone}
                      onChange={(e) => handleChange('clientPhone', e.target.value)}
                      onFocus={() => formData.clientPhone.length >= 3 && searchClients(formData.clientPhone, 'phone')}
                      className={errors.clientPhone ? 'border-destructive' : ''}
                    />
                    {errors.clientPhone && <p className="text-xs text-destructive mt-1">{errors.clientPhone}</p>}
                    
                    {showSuggestions && clientSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {clientSuggestions.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-b-0"
                            onClick={() => fillClientData(client)}
                          >
                            <p className="font-medium">{client.fullName}</p>
                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                            {client.address && <p className="text-xs text-muted-foreground">{client.address}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientAddress">Адрес</Label>
                    <Input
                      id="clientAddress"
                      placeholder="ул. Примерная, д. 1, кв. 1"
                      value={formData.clientAddress}
                      onChange={(e) => handleChange('clientAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Smartphone" size={18} className="text-primary" />
                  Информация о технике
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceType">Вид техники <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.deviceType}
                      onValueChange={(value) => handleChange('deviceType', value)}
                    >
                      <SelectTrigger className={errors.deviceType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Выберите вид техники" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map((dt) => (
                          <SelectItem key={dt.id} value={dt.name}>
                            {dt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.deviceType && <p className="text-xs text-destructive mt-1">{errors.deviceType}</p>}
                  </div>

                  <div>
                    <Label htmlFor="deviceModel">Модель</Label>
                    <Input
                      id="deviceModel"
                      placeholder="Samsung WW70"
                      value={formData.deviceModel}
                      onChange={(e) => handleChange('deviceModel', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="serialNumber">Серийный номер</Label>
                    <Input
                      id="serialNumber"
                      placeholder="SN123456789"
                      value={formData.serialNumber}
                      onChange={(e) => handleChange('serialNumber', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="appearance">Внешний вид</Label>
                    <Textarea
                      id="appearance"
                      placeholder="Описание состояния: царапины, вмятины, потертости..."
                      value={formData.appearance}
                      onChange={(e) => handleChange('appearance', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="accessories">Комплектация</Label>
                    <Textarea
                      id="accessories"
                      placeholder="Что прилагается: инструкция, гарантийный талон, кабели..."
                      value={formData.accessories}
                      onChange={(e) => handleChange('accessories', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-primary" />
                  Заявленная неисправность
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="issue">Описание проблемы <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="issue"
                      placeholder="Подробное описание неисправности со слов клиента"
                      value={formData.issue}
                      onChange={(e) => handleChange('issue', e.target.value)}
                      rows={3}
                      className={errors.issue ? 'border-destructive' : ''}
                    />
                    {errors.issue && <p className="text-xs text-destructive mt-1">{errors.issue}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="repairType">Вид ремонта</Label>
                      <Select value={formData.repairType} onValueChange={(value: any) => handleChange('repairType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warranty">Гарантийный</SelectItem>
                          <SelectItem value="repeat">Повторный</SelectItem>
                          <SelectItem value="paid">Платный</SelectItem>
                          <SelectItem value="cashless">Безнал</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select value={formData.priority} onValueChange={(value: any) => handleChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Icon name="Check" size={18} />
              Создать заказ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}