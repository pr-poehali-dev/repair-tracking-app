import Icon from '@/components/ui/icon';

interface Order {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
}

interface ClientInfoSectionProps {
  order: Order;
}

export default function ClientInfoSection({ order }: ClientInfoSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="User" size={18} />
        Информация о клиенте
      </h3>
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-muted-foreground">ФИО</p>
          <p className="font-medium">{order.clientName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Адрес</p>
          <p className="font-medium">{order.clientAddress}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Телефон</p>
          <p className="font-medium">{order.clientPhone}</p>
        </div>
      </div>
    </div>
  );
}
