import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, roleLabels } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import NewOrderDialog, { NewOrderFormData } from '@/components/NewOrderDialog';
import ReceiptDialog from '@/components/ReceiptDialog';
import OrderStats from '@/components/OrderStats';
import OrderCard, { OrderStatus } from '@/components/OrderCard';
import OrderDetailsDialog from '@/components/OrderDetailsDialog';
import KanbanBoard from '@/components/KanbanBoard';
import RoleBadge from '@/components/RoleBadge';
import DeviceTypesDialog from '@/components/DeviceTypesDialog';

interface OrderHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

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
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high';
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless';
  createdAt: string;
  createdTime: string;
  price?: number;
  master?: string;
  history: OrderHistoryItem[];
}

const API_URL = 'https://functions.poehali.dev/e9af1ae4-2b09-4ac1-a49a-bf1172ebfc8c';

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'Иванов Петр Сергеевич',
    clientAddress: 'ул. Ленина, д. 25, кв. 14',
    clientPhone: '+7 (912) 345-67-89',
    deviceType: 'Стиральная машина',
    deviceModel: 'Samsung WW70',
    serialNumber: 'SN123456789',
    issue: 'Не включается',
    appearance: 'Хорошее состояние, без царапин',
    accessories: 'Инструкция, гарантийный талон',
    status: 'received',
    priority: 'high',
    repairType: 'paid',
    createdAt: '2024-10-24',
    createdTime: '10:30',
    price: 2500,
    history: [
      { timestamp: '2024-10-24 10:30', action: 'Создан заказ', user: 'Сидорова М.' },
    ],
  },
  {
    id: 'ORD-002',
    clientName: 'Сидорова Анна Ивановна',
    clientAddress: 'пр. Победы, д. 102, кв. 5',
    clientPhone: '+7 (923) 456-78-90',
    deviceType: 'Холодильник',
    deviceModel: 'LG GR-B489',
    serialNumber: 'LG987654321',
    issue: 'Не морозит',
    appearance: 'Потертости на дверце',
    accessories: 'Полки, ящики в комплекте',
    status: 'in-progress',
    priority: 'medium',
    repairType: 'warranty',
    createdAt: '2024-10-23',
    createdTime: '09:15',
    price: 3500,
    master: 'Петров А.',
    history: [
      { timestamp: '2024-10-23 09:15', action: 'Создан заказ', user: 'Сидорова М.' },
      { timestamp: '2024-10-23 11:20', action: 'Переведен в работу', user: 'Петров А.', details: 'Назначен мастер' },
    ],
  },
  {
    id: 'ORD-003',
    clientName: 'Козлов Сергей Петрович',
    clientAddress: 'ул. Мира, д. 8, кв. 22',
    clientPhone: '+7 (934) 567-89-01',
    deviceType: 'Микроволновка',
    deviceModel: 'Panasonic NN',
    serialNumber: 'PN456789012',
    issue: 'Не греет',
    appearance: 'Отличное',
    accessories: 'Поддон стеклянный',
    status: 'ready',
    priority: 'low',
    repairType: 'cashless',
    createdAt: '2024-10-22',
    createdTime: '14:00',
    price: 1800,
    master: 'Иванов Д.',
    history: [
      { timestamp: '2024-10-22 14:00', action: 'Создан заказ', user: 'Сидорова М.' },
      { timestamp: '2024-10-22 15:30', action: 'Переведен в работу', user: 'Иванов Д.', details: 'Назначен мастер' },
      { timestamp: '2024-10-23 10:00', action: 'Ремонт завершен', user: 'Иванов Д.' },
    ],
  },
];

const statusConfig = {
  received: { label: 'Принят', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'in-progress': { label: 'В работе', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ready: { label: 'Готов', color: 'bg-green-100 text-green-700 border-green-200' },
  completed: { label: 'Выдан', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Средний', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-700' },
};

export default function Index() {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeviceTypesOpen, setIsDeviceTypesOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const headers: HeadersInit = {};
      
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }
      
      const response = await fetch(API_URL, { headers });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setOrders(mockOrders);
      toast({
        title: 'Ошибка загрузки',
        description: 'Используются тестовые данные',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async (formData: NewOrderFormData) => {
    const maxOrderNumber = orders.reduce((max, order) => {
      const num = parseInt(order.id.replace('ORD-', ''));
      return num > max ? num : max;
    }, 0);
    
    const newOrderId = `ORD-${String(maxOrderNumber + 1).padStart(3, '0')}`;
    const now = new Date();
    const timestamp = now.toLocaleString('ru-RU', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    
    const newOrder: Order = {
      id: newOrderId,
      ...formData,
      status: 'received',
      createdAt: date,
      createdTime: time,
      history: [
        {
          timestamp,
          action: 'Создан заказ',
          user: user?.fullName || 'Система',
        },
      ],
    };
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrder),
      });
      
      if (response.ok) {
        const savedOrder = await response.json();
        setOrders(prev => [savedOrder, ...prev]);
        toast({
          title: 'Заказ создан',
          description: `Заказ ${newOrderId} сохранен в базе данных`,
        });
        setReceiptOrder(savedOrder);
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error) {
      setOrders(prev => [newOrder, ...prev]);
      toast({
        title: 'Заказ создан локально',
        description: `Заказ ${newOrderId} добавлен (не сохранен в БД)`,
        variant: 'destructive',
      });
      setReceiptOrder(newOrder);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const historyItem: OrderHistoryItem = {
      timestamp: new Date().toLocaleString('ru-RU', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
      action: `Переведен в статус: ${statusConfig[newStatus].label}`,
      user: user?.fullName || 'Система',
    };

    const updatedOrder = { 
      ...order, 
      status: newStatus,
      history: [...order.history, historyItem]
    };

    if (newStatus === 'in-progress' && !order.master && user) {
      updatedOrder.master = user.fullName;
      historyItem.details = 'Назначен мастер';
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        const savedOrder = await response.json();
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? savedOrder : o)
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(savedOrder);
        }
      } else {
        throw new Error('Ошибка обновления');
      }
    } catch (error) {
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? updatedOrder : o)
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      toast({
        title: 'Статус обновлен локально',
        description: 'Изменения не сохранены в базе данных',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: orders.length,
    received: orders.filter((o) => o.status === 'received').length,
    inProgress: orders.filter((o) => o.status === 'in-progress').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    revenue: orders.reduce((sum, o) => sum + (o.price || 0), 0),
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      'received': 'in-progress',
      'in-progress': 'ready',
      'ready': 'completed',
      'completed': null,
    };
    return statusFlow[currentStatus];
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Icon name="Wrench" className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CRM Мастерская
                </h1>
                <p className="text-xs text-muted-foreground">Управление заказами</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasPermission('create_orders') && (
                <Button onClick={() => setIsNewOrderOpen(true)}>
                  <Icon name="Plus" className="mr-2" size={18} />
                  Новый заказ
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user ? getUserInitials(user.fullName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      {user?.role && <RoleBadge role={user.role} />}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasRole('director') && (
                    <>
                      <DropdownMenuItem onClick={() => setIsDeviceTypesOpen(true)}>
                        <Icon name="Settings" className="mr-2" size={16} />
                        Справочник техники
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <Icon name="LogOut" className="mr-2" size={16} />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <OrderStats stats={stats} />

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Поиск по клиенту, заказу или устройству..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="dashboard">
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Дашборд
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Icon name="Columns3" size={16} className="mr-2" />
                Канбан
              </TabsTrigger>
              <TabsTrigger value="list">
                <Icon name="List" size={16} className="mr-2" />
                Список
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeView} className="space-y-4">
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  statusConfig={statusConfig}
                  priorityConfig={priorityConfig}
                  onViewDetails={setSelectedOrder}
                  onViewReceipt={setReceiptOrder}
                  onStatusChange={handleStatusChange}
                  getNextStatus={getNextStatus}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard
              orders={filteredOrders}
              statusConfig={statusConfig}
              priorityConfig={priorityConfig}
              onViewDetails={setSelectedOrder}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  statusConfig={statusConfig}
                  priorityConfig={priorityConfig}
                  onViewDetails={setSelectedOrder}
                  onViewReceipt={setReceiptOrder}
                  onStatusChange={handleStatusChange}
                  getNextStatus={getNextStatus}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        statusConfig={statusConfig}
        priorityConfig={priorityConfig}
      />

      <NewOrderDialog
        open={isNewOrderOpen}
        onOpenChange={setIsNewOrderOpen}
        onSubmit={handleCreateOrder}
      />

      <ReceiptDialog
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      <DeviceTypesDialog
        isOpen={isDeviceTypesOpen}
        onClose={() => setIsDeviceTypesOpen(false)}
      />
    </div>
  );
}