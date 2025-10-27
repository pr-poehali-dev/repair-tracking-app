import Icon from '@/components/ui/icon';

interface Order {
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  issue: string;
  appearance: string;
  accessories: string;
}

interface DeviceInfoSectionProps {
  order: Order;
}

export default function DeviceInfoSection({ order }: DeviceInfoSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Smartphone" size={18} />
        Информация об устройстве
      </h3>
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-muted-foreground">Тип устройства</p>
          <p className="font-medium">{order.deviceType}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Модель</p>
          <p className="font-medium">{order.deviceModel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Серийный номер</p>
          <p className="font-medium">{order.serialNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Неисправность</p>
          <p className="font-medium">{order.issue}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Внешний вид</p>
          <p className="font-medium">{order.appearance}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Комплектация</p>
          <p className="font-medium">{order.accessories}</p>
        </div>
      </div>
    </div>
  );
}
