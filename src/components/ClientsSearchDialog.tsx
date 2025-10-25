import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Client {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  devices: Array<{
    id: number;
    deviceType: string;
    deviceModel: string;
    serialNumber: string;
  }>;
}

interface ClientsSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLIENTS_API_URL = 'https://functions.poehali.dev/a71e85f8-4a97-42b3-ad3f-f2a76d79cd8f';

export default function ClientsSearchDialog({ isOpen, onClose }: ClientsSearchDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'phone' | 'serialNumber'>('all');

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(CLIENTS_API_URL);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadClients();
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (searchField === 'all') {
        params.append('search', searchQuery);
      } else {
        params.append(searchField, searchQuery);
      }

      const response = await fetch(`${CLIENTS_API_URL}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        handleSearch();
      } else if (searchQuery.length === 0) {
        loadClients();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchField]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            База клиентов
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="searchQuery">Поиск</Label>
              <Input
                id="searchQuery"
                placeholder="Введите ФИО, телефон или серийный номер..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="searchField">Поле поиска</Label>
              <select
                id="searchField"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
              >
                <option value="all">Все поля</option>
                <option value="phone">Телефон</option>
                <option value="serialNumber">Серийный номер</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Найдено клиентов: {clients.length}</span>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Search" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Клиенты не найдены</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 hover:bg-accent">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{client.fullName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Phone" size={14} />
                            {client.phone}
                          </span>
                          {client.address && (
                            <span className="flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {client.address}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {client.devices.length} устройств
                      </Badge>
                    </div>

                    {client.devices.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2 font-semibold">Устройства:</p>
                        <div className="space-y-2">
                          {client.devices.map((device) => (
                            <div key={device.id} className="flex items-center gap-2 text-sm">
                              <Icon name="Smartphone" size={14} className="text-muted-foreground" />
                              <span className="font-medium">{device.deviceType}</span>
                              {device.deviceModel && (
                                <span className="text-muted-foreground">{device.deviceModel}</span>
                              )}
                              {device.serialNumber && (
                                <Badge variant="secondary" className="text-xs">
                                  S/N: {device.serialNumber}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
