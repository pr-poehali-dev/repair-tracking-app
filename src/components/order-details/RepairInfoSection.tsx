import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Order {
  id: string;
  price?: number;
  master?: string;
  repairDescription?: string;
}

interface RepairInfoSectionProps {
  order: Order;
  hasPermission: (permission: string) => boolean;
  onOpenRepairDesc: () => void;
}

export default function RepairInfoSection({
  order,
  hasPermission,
  onOpenRepairDesc,
}: RepairInfoSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Wrench" size={18} />
        Информация о ремонте
      </h3>
      <div className="space-y-2 text-sm">
        {order.price && (
          <div>
            <p className="text-muted-foreground">Стоимость</p>
            <p className="font-medium">{order.price} ₽</p>
          </div>
        )}
        {order.master && (
          <div>
            <p className="text-muted-foreground">Мастер</p>
            <p className="font-medium">{order.master}</p>
          </div>
        )}
        {order.repairDescription && (
          <div>
            <p className="text-muted-foreground">Описание ремонта</p>
            <p className="font-medium whitespace-pre-wrap">{order.repairDescription}</p>
          </div>
        )}
        {hasPermission('change_status') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRepairDesc}
            className="mt-2"
          >
            <Icon name="FileEdit" size={16} className="mr-2" />
            {order.repairDescription ? 'Редактировать описание' : 'Добавить описание'}
          </Button>
        )}
      </div>
    </div>
  );
}
