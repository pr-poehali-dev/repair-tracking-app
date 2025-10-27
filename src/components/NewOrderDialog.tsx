import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ClientInfoSection from './NewOrderDialog/ClientInfoSection';
import DeviceInfoSection from './NewOrderDialog/DeviceInfoSection';
import OrderParametersSection from './NewOrderDialog/OrderParametersSection';
import OurDeviceSection from './NewOrderDialog/OurDeviceSection';
import IssueSection from './NewOrderDialog/IssueSection';
import { 
  DeviceType, 
  Client, 
  NewOrderFormData, 
  DEVICE_TYPES_API_URL, 
  CLIENTS_API_URL 
} from './NewOrderDialog/types';

export type { NewOrderFormData };

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (order: NewOrderFormData) => void;
}

export default function NewOrderDialog({ open, onOpenChange, onSubmit }: NewOrderDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
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
    receivedDate: '',
    purchasePrice: undefined,
    deliveryCost: undefined,
    possibleIssue: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewOrderFormData, string>>>({});

  useEffect(() => {
    if (open) {
      loadDeviceTypes();
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setCanScrollUp(target.scrollTop > 10);
    setCanScrollDown(target.scrollTop + target.clientHeight < target.scrollHeight - 10);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (scrollContainer) {
          setCanScrollDown(scrollContainer.scrollHeight > scrollContainer.clientHeight);
        }
      }, 100);
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
    if (field === 'purchasePrice' || field === 'deliveryCost') {
      setFormData(prev => ({ ...prev, [field]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
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
    
    if (formData.repairType === 'our-device') {
      if (!formData.receivedDate?.trim()) newErrors.receivedDate = 'Обязательное поле';
    } else {
      if (!formData.issue.trim()) newErrors.issue = 'Обязательное поле';
    }

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
        receivedDate: '',
        purchasePrice: undefined,
        deliveryCost: undefined,
        possibleIssue: '',
      });
      setErrors({});
      setClientSuggestions([]);
      setShowSuggestions(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {canScrollUp && (
            <div className="absolute top-[88px] left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 flex items-start justify-center">
              <div className="mt-1 text-muted-foreground animate-bounce">
                <Icon name="ChevronUp" size={20} />
              </div>
            </div>
          )}
          <div 
            className="flex-1 overflow-y-auto px-6" 
            onScroll={handleScroll}
            data-scroll-container
          >
            <div className="space-y-6 py-2">
              <ClientInfoSection
                formData={formData}
                errors={errors}
                clientSuggestions={clientSuggestions}
                showSuggestions={showSuggestions}
                onChange={handleChange}
                onFillClientData={fillClientData}
                onPhoneFocus={() => formData.clientPhone.length >= 3 && searchClients(formData.clientPhone, 'phone')}
              />

              <Separator />

              <DeviceInfoSection
                formData={formData}
                errors={errors}
                deviceTypes={deviceTypes}
                onChange={handleChange}
              />

              <Separator />

              <OrderParametersSection
                formData={formData}
                onChange={handleChange}
              />

              <Separator />

              {formData.repairType === 'our-device' ? (
                <OurDeviceSection
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              ) : (
                <IssueSection
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
          {canScrollDown && (
            <div className="absolute bottom-[72px] left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 flex items-end justify-center">
              <div className="mb-1 text-muted-foreground animate-bounce">
                <Icon name="ChevronDown" size={20} />
              </div>
            </div>
          )}

          <div className="flex gap-3 px-6 pb-6 pt-4 border-t bg-background shrink-0 relative z-20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              <Icon name="Check" size={18} className="mr-2" />
              Создать заказ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
