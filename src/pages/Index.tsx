import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import NewOrderDialog from '@/components/NewOrderDialog';
import ReceiptDialog from '@/components/ReceiptDialog';
import OrderStats from '@/components/OrderStats';
import OrderDetailsDialog from '@/components/OrderDetailsDialog';
import KanbanBoard from '@/components/KanbanBoard';
import DeviceTypesDialog from '@/components/DeviceTypesDialog';
import ClientsSearchDialog from '@/components/ClientsSearchDialog';
import AppHeader from '@/components/AppHeader';
import OrderList from '@/components/OrderList';
import Icon from '@/components/ui/icon';
import { useOrders } from '@/hooks/useOrders';
import { 
  Order, 
  statusConfig, 
  priorityConfig, 
  getNextStatus, 
  calculateStats, 
  filterOrders,
  hasCriticalOverdueOrders,
  getCriticalOverdueOrders
} from '@/lib/orderUtils';

export default function Index() {
  const { user, hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
  const [filterType, setFilterType] = useState<'all' | 'overdue'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isDeviceTypesOpen, setIsDeviceTypesOpen] = useState(false);
  const [isClientsSearchOpen, setIsClientsSearchOpen] = useState(false);

  const { orders, isLoading, handleCreateOrder, handleStatusChange, handleSaveRepairDescription } = useOrders(user);

  const filteredOrders = filterOrders(orders, searchQuery, filterType);
  const stats = calculateStats(orders);
  const hasCriticalOverdue = hasCriticalOverdueOrders(orders, user?.username);
  const criticalOrders = getCriticalOverdueOrders(orders, user?.username);

  const onCreateOrder = async (formData: any) => {
    const newOrder = await handleCreateOrder(formData);
    setReceiptOrder(newOrder);
  };

  const onStatusChange = (orderId: string, newStatus: any) => {
    if (hasCriticalOverdue) {
      const isCriticalOrder = criticalOrders.some(o => o.id === orderId);
      if (!isCriticalOrder) {
        return;
      }
    }
    handleStatusChange(orderId, newStatus, selectedOrder, setSelectedOrder);
  };

  const onSaveRepairDescription = (orderId: string, description: string) => {
    handleSaveRepairDescription(orderId, description, selectedOrder, setSelectedOrder);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewOrder={() => setIsNewOrderOpen(true)}
        onDeviceTypes={() => setIsDeviceTypesOpen(true)}
        onClientsSearch={() => setIsClientsSearchOpen(true)}
      />

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {hasCriticalOverdue && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertTriangle" className="text-red-600 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">
                Блокировка работы с новыми заказами
              </h3>
              <p className="text-sm text-red-800 mb-2">
                У вас есть {criticalOrders.length} {criticalOrders.length === 1 ? 'заказ' : 'заказа'} в статусе "Диагностика" с превышением срока 3 дня. 
                Необходимо завершить работу с этими заказами перед началом работы с другими заявками.
              </p>
              <div className="flex flex-wrap gap-2">
                {criticalOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-900 px-3 py-1 rounded-md font-medium transition-colors"
                  >
                    {order.id} - {order.deviceType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-4">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1">
            <TabsList>
              <TabsTrigger value="dashboard">
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Дашборд
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Icon name="Trello" size={16} className="mr-2" />
                Канбан
              </TabsTrigger>
              <TabsTrigger value="list">
                <Icon name="List" size={16} className="mr-2" />
                Список
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Все заказы
            </Button>
            <Button
              variant={filterType === 'overdue' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setFilterType('overdue')}
              className="relative"
            >
              <Icon name="AlertTriangle" size={16} className="mr-2" />
              Просроченные
              {stats.overdue > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white text-red-600 rounded-full text-xs font-bold">
                  {stats.overdue}
                </span>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeView} className="space-y-6">
          <TabsContent value="dashboard" className="space-y-6">
            <OrderStats stats={stats} />

            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-lg">Заказы не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Последние заказы</h2>
                <OrderList
                  orders={filteredOrders.slice(0, 6)}
                  onViewDetails={setSelectedOrder}
                  onViewReceipt={setReceiptOrder}
                  onStatusChange={onStatusChange}
                  getNextStatus={getNextStatus}
                />
                {filteredOrders.length > 6 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => setActiveView('list')}>
                      Показать все ({filteredOrders.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard
              orders={filteredOrders}
              statusConfig={statusConfig}
              priorityConfig={priorityConfig}
              onViewDetails={setSelectedOrder}
              onStatusChange={onStatusChange}
            />
          </TabsContent>

          <TabsContent value="list">
            <OrderList
              orders={filteredOrders}
              onViewDetails={setSelectedOrder}
              onViewReceipt={setReceiptOrder}
              onStatusChange={onStatusChange}
              getNextStatus={getNextStatus}
            />
          </TabsContent>
        </Tabs>
      </main>

      <NewOrderDialog
        open={isNewOrderOpen}
        onOpenChange={setIsNewOrderOpen}
        onSubmit={onCreateOrder}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        statusConfig={statusConfig}
        priorityConfig={priorityConfig}
        onStatusChange={onStatusChange}
        onSaveRepairDescription={onSaveRepairDescription}
      />

      <ReceiptDialog order={receiptOrder} onClose={() => setReceiptOrder(null)} />

      <DeviceTypesDialog open={isDeviceTypesOpen} onOpenChange={setIsDeviceTypesOpen} />

      <ClientsSearchDialog open={isClientsSearchOpen} onOpenChange={setIsClientsSearchOpen} />
    </div>
  );
}