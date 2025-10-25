import OrderCard, { OrderStatus } from '@/components/OrderCard';
import { Order, statusConfig, priorityConfig } from '@/lib/orderUtils';

interface OrderListProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  getNextStatus: (status: OrderStatus) => OrderStatus | null;
}

export default function OrderList({
  orders,
  onViewDetails,
  onViewReceipt,
  onStatusChange,
  getNextStatus,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg">Заказы не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          statusConfig={statusConfig}
          priorityConfig={priorityConfig}
          onViewDetails={onViewDetails}
          onViewReceipt={onViewReceipt}
          onStatusChange={onStatusChange}
          getNextStatus={getNextStatus}
        />
      ))}
    </div>
  );
}
