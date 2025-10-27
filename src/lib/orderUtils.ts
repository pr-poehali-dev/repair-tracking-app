import { OrderStatus } from '@/components/OrderCard';

export interface OrderHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export interface Order {
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
  repairDescription?: string;
  history: OrderHistoryItem[];
  statusDeadline?: string;
  statusChangedAt?: string;
  isOverdue?: boolean;
  isDelayed?: boolean;
  delayReason?: string;
  customDeadlineDays?: number;
  extensionRequest?: {
    requestedBy: string;
    requestedAt: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

export const API_URL = 'https://functions.poehali.dev/e9af1ae4-2b09-4ac1-a49a-bf1172ebfc8c';

export const mockOrders: Order[] = [
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
    status: 'diagnostics',
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
    status: 'client-notified',
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

export const statusConfig = {
  received: { label: 'Принят в ремонт', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  diagnostics: { label: 'Диагностика', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  repair: { label: 'Ремонт', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'parts-needed': { label: 'Требуется запчасть', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'cost-approval': { label: 'Согласование стоимости', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'payment-pending': { label: 'Ожидание оплаты', color: 'bg-red-100 text-red-700 border-red-200' },
  'parts-delivery': { label: 'Ожидание поставки', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  'parts-arrived': { label: 'Запчасть поступила', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  'repair-continues': { label: 'Ремонт продолжается', color: 'bg-lime-100 text-lime-700 border-lime-200' },
  'repair-completed': { label: 'Ремонт завершён', color: 'bg-green-100 text-green-700 border-green-200' },
  'notify-client': { label: 'Оповестить клиента', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'client-notified': { label: 'Клиент оповещён', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  issued: { label: 'Техника выдана', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  stuck: { label: 'Зависшая техника', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  disposal: { label: 'Утилизация', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Средний', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-700' },
};

export const statusDeadlineHours: Record<OrderStatus, number> = {
  'received': 2,
  'diagnostics': 72,
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

export const calculateStatusDeadline = (status: OrderStatus, customDays?: number): string => {
  let hours: number;
  
  if (customDays && customDays > 0) {
    hours = customDays * 24;
  } else {
    hours = statusDeadlineHours[status] || 24;
  }
  
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline.toISOString();
};

export const isOrderOverdue = (order: Order): boolean => {
  if (!order.statusDeadline) return false;
  return new Date() > new Date(order.statusDeadline);
};

export const getDeadlineStatus = (order: Order): 'ok' | 'warning' | 'danger' | 'overdue' => {
  if (!order.statusDeadline) return 'ok';
  
  const now = new Date().getTime();
  const deadline = new Date(order.statusDeadline).getTime();
  const statusChanged = order.statusChangedAt ? new Date(order.statusChangedAt).getTime() : now;
  
  const totalTime = deadline - statusChanged;
  const remainingTime = deadline - now;
  const percentRemaining = (remainingTime / totalTime) * 100;
  
  if (remainingTime <= 0) return 'overdue';
  if (percentRemaining <= 10) return 'danger';
  if (percentRemaining <= 25) return 'warning';
  return 'ok';
};

export const formatDeadline = (deadline: string): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  
  if (diffMs < 0) {
    const absDiff = Math.abs(diffMs);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      return `Просрочено на ${Math.floor(hours / 24)} дн.`;
    }
    return `Просрочено на ${hours}ч ${minutes}м`;
  }
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 48) {
    return `${Math.floor(hours / 24)} дн.`;
  }
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
};

export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    'received': 'diagnostics',
    'diagnostics': 'repair',
    'repair': 'repair-completed',
    'parts-needed': 'cost-approval',
    'cost-approval': 'payment-pending',
    'payment-pending': 'parts-delivery',
    'parts-delivery': 'parts-arrived',
    'parts-arrived': 'repair-continues',
    'repair-continues': 'repair-completed',
    'repair-completed': 'notify-client',
    'notify-client': 'client-notified',
    'client-notified': 'issued',
    'issued': null,
    'stuck': null,
    'disposal': null,
  };
  return statusFlow[currentStatus];
};

export const calculateStats = (orders: Order[]) => ({
  total: orders.length,
  received: orders.filter((o) => o.status === 'received').length,
  inProgress: orders.filter((o) => ['diagnostics', 'repair', 'repair-continues'].includes(o.status)).length,
  ready: orders.filter((o) => ['repair-completed', 'notify-client', 'client-notified'].includes(o.status)).length,
  completed: orders.filter((o) => o.status === 'issued').length,
  overdue: orders.filter((o) => getDeadlineStatus(o) === 'overdue').length,
  revenue: orders.reduce((sum, o) => sum + (o.price || 0), 0),
});

const getPriorityScore = (priority: 'low' | 'medium' | 'high'): number => {
  return { low: 1, medium: 2, high: 3 }[priority];
};

const getUrgencyScore = (order: Order): number => {
  const deadlineStatus = getDeadlineStatus(order);
  if (deadlineStatus === 'overdue') return 4;
  if (deadlineStatus === 'danger') return 3;
  if (deadlineStatus === 'warning') return 2;
  return 1;
};

export const hasCriticalOverdueOrders = (orders: Order[], masterName?: string): boolean => {
  return orders.some(order => 
    (order.status === 'diagnostics' || order.status === 'repair') && 
    order.master === masterName &&
    getDeadlineStatus(order) === 'overdue'
  );
};

export const getCriticalOverdueOrders = (orders: Order[], masterName?: string): Order[] => {
  return orders.filter(order => 
    (order.status === 'diagnostics' || order.status === 'repair') && 
    order.master === masterName &&
    getDeadlineStatus(order) === 'overdue'
  );
};

export const filterOrders = (orders: Order[], searchQuery: string, filterType?: 'all' | 'overdue') => {
  let filtered = orders;
  
  if (filterType === 'overdue') {
    filtered = filtered.filter((order) => getDeadlineStatus(order) === 'overdue');
  }
  
  if (searchQuery) {
    filtered = filtered.filter(
      (order) =>
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deviceType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filtered.sort((a, b) => {
    const urgencyDiff = getUrgencyScore(b) - getUrgencyScore(a);
    if (urgencyDiff !== 0) return urgencyDiff;
    
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
};