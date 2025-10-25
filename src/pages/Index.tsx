import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

type OrderStatus = 'received' | 'in-progress' | 'ready' | 'completed';

interface Order {
  id: string;
  clientName: string;
  deviceType: string;
  deviceModel: string;
  issue: string;
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  price?: number;
  master?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'Иванов Петр',
    deviceType: 'Стиральная машина',
    deviceModel: 'Samsung WW70',
    issue: 'Не включается',
    status: 'received',
    priority: 'high',
    createdAt: '2024-10-24',
    price: 2500,
  },
  {
    id: 'ORD-002',
    clientName: 'Сидорова Анна',
    deviceType: 'Холодильник',
    deviceModel: 'LG GR-B489',
    issue: 'Не морозит',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-10-23',
    price: 3500,
    master: 'Петров А.',
  },
  {
    id: 'ORD-003',
    clientName: 'Козлов Сергей',
    deviceType: 'Микроволновка',
    deviceModel: 'Panasonic NN',
    issue: 'Не греет',
    status: 'ready',
    priority: 'low',
    createdAt: '2024-10-22',
    price: 1800,
    master: 'Иванов Д.',
  },
  {
    id: 'ORD-004',
    clientName: 'Морозова Елена',
    deviceType: 'Посудомойка',
    deviceModel: 'Bosch SMS',
    issue: 'Протечка',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-10-24',
    price: 4200,
    master: 'Петров А.',
  },
  {
    id: 'ORD-005',
    clientName: 'Никитин Олег',
    deviceType: 'Телевизор',
    deviceModel: 'Sony KD-55',
    issue: 'Нет изображения',
    status: 'received',
    priority: 'medium',
    createdAt: '2024-10-25',
    price: 5000,
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
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };
          
          if (newStatus === 'in-progress' && !order.master && user) {
            updatedOrder.master = user.fullName;
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
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

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-shadow animate-fade-in cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{order.clientName}</p>
          </div>
          <Badge className={priorityConfig[order.priority].color} variant="outline">
            {priorityConfig[order.priority].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Smartphone" size={16} className="text-muted-foreground" />
          <span className="font-medium">{order.deviceType}</span>
          <span className="text-muted-foreground">({order.deviceModel})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="AlertCircle" size={16} />
          <span>{order.issue}</span>
        </div>
        {order.master && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="User" size={16} />
            <span>{order.master}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <Badge className={statusConfig[order.status].color} variant="outline">
            {statusConfig[order.status].label}
          </Badge>
          {order.price && <span className="font-semibold text-primary">{order.price} ₽</span>}
        </div>
        
        {getNextStatus(order.status) && (
          <div className="pt-2 border-t mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
            >
              <Icon name="ArrowRight" size={14} />
              {statusConfig[getNextStatus(order.status)!].label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Icon name="Wrench" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Мастерская</h1>
                <p className="text-sm text-muted-foreground">Система учёта ремонтов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Новый заказ
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 relative h-10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user?.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive gap-2">
                    <Icon name="LogOut" size={16} />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <Icon name="LayoutDashboard" size={16} />
                Дашборд
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <Icon name="Columns3" size={16} />
                Канбан
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Icon name="List" size={16} />
                Список
              </TabsTrigger>
            </TabsList>

            <div className="relative w-80">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту, заказу, технике..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animate-scale-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Всего заказов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon name="FileText" size={24} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.inProgress}</div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Icon name="Hammer" size={24} className="text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Готово к выдаче</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.ready}</div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Icon name="CheckCircle" size={24} className="text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Выручка</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.revenue.toLocaleString()} ₽</div>
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <Icon name="TrendingUp" size={24} className="text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Последние заказы</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.slice(0, 6).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['received', 'in-progress', 'ready', 'completed'] as OrderStatus[]).map((status) => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <h3 className="font-semibold">{statusConfig[status].label}</h3>
                    <Badge variant="secondary">{filteredOrders.filter((o) => o.status === status).length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredOrders
                      .filter((o) => o.status === status)
                      .map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Заказ</th>
                        <th className="text-left p-4 font-semibold">Клиент</th>
                        <th className="text-left p-4 font-semibold">Техника</th>
                        <th className="text-left p-4 font-semibold">Проблема</th>
                        <th className="text-left p-4 font-semibold">Статус</th>
                        <th className="text-left p-4 font-semibold">Приоритет</th>
                        <th className="text-left p-4 font-semibold">Цена</th>
                        <th className="text-left p-4 font-semibold">Мастер</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                          <td className="p-4 font-medium">{order.id}</td>
                          <td className="p-4">{order.clientName}</td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-medium">{order.deviceType}</div>
                              <div className="text-muted-foreground">{order.deviceModel}</div>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{order.issue}</td>
                          <td className="p-4">
                            <Badge className={statusConfig[order.status].color} variant="outline">
                              {statusConfig[order.status].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={priorityConfig[order.priority].color} variant="outline">
                              {priorityConfig[order.priority].label}
                            </Badge>
                          </td>
                          <td className="p-4 font-semibold text-primary">{order.price ? `${order.price} ₽` : '—'}</td>
                          <td className="p-4 text-sm">{order.master || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}