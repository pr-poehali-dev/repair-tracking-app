import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Order, API_URL, mockOrders } from '@/lib/orderUtils';
import { OrderStatus } from '@/components/OrderCard';
import { NewOrderFormData } from '@/components/NewOrderDialog';
import { UserRole } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export function useOrders(user: User | null) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        return savedOrder;
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
      return newOrder;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, selectedOrder: Order | null, setSelectedOrder: (order: Order | null) => void) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const now = new Date();
    const timestamp = now.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const historyItem = {
      timestamp,
      action: `Статус изменен: ${newStatus}`,
      user: user?.fullName || 'Система',
    };

    const statusDeadlineHours: Record<OrderStatus, number> = {
      'received': 2,
      'diagnostics': 24,
      'repair': 48,
      'parts-needed': 4,
      'cost-approval': 12,
      'payment-pending': 72,
      'parts-delivery': 168,
      'parts-arrived': 4,
      'repair-continues': 48,
      'repair-completed': 2,
      'notify-client': 1,
      'client-notified': 48,
      'issued': 0,
      'stuck': 0,
      'disposal': 0,
    };

    const hours = statusDeadlineHours[newStatus] || 24;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);

    const updatedOrder = {
      ...order,
      status: newStatus,
      history: [...order.history, historyItem],
      statusDeadline: deadline.toISOString(),
      statusChangedAt: now.toISOString(),
      isOverdue: false,
    };

    if ((newStatus === 'diagnostics' || newStatus === 'repair') && !order.master && user) {
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

  const handleSaveRepairDescription = async (orderId: string, description: string, selectedOrder: Order | null, setSelectedOrder: (order: Order | null) => void) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const now = new Date();
    const timestamp = now.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const historyItem = {
      timestamp,
      action: 'Добавлено описание ремонта',
      user: user?.fullName || 'Система',
    };

    const updatedOrder = {
      ...order,
      repairDescription: description,
      history: [...order.history, historyItem],
    };

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
        title: 'Описание сохранено локально',
        description: 'Изменения не сохранены в базе данных',
        variant: 'destructive',
      });
    }
  };

  return {
    orders,
    isLoading,
    handleCreateOrder,
    handleStatusChange,
    handleSaveRepairDescription,
    loadOrders,
  };
}