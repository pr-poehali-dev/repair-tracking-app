import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useRepairPrices } from '@/hooks/useRepairPrices';

interface DatabasesManagementProps {
  onOpenDeviceTypes: () => void;
  onOpenPriceManagement: () => void;
}

export default function DatabasesManagement({
  onOpenDeviceTypes,
  onOpenPriceManagement,
}: DatabasesManagementProps) {
  const { prices } = useRepairPrices();

  const databases = [
    {
      id: 'device-types',
      icon: 'Wrench' as const,
      title: 'Типы устройств',
      description: 'Справочник типов техники, марок и моделей',
      count: 0,
      countLabel: 'типов техники',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      onClick: onOpenDeviceTypes,
    },
    {
      id: 'repair-prices',
      icon: 'DollarSign' as const,
      title: 'Стоимость ремонтов',
      description: 'Прайс-лист услуг по ремонту техники',
      count: prices.length,
      countLabel: 'позиций',
      color: 'bg-green-50 text-green-600 border-green-200',
      onClick: onOpenPriceManagement,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Database" size={20} className="text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium mb-1">Управление базами данных</p>
            <p className="text-amber-700">
              В этом разделе вы можете управлять справочниками системы. 
              Изменения сразу отражаются во всех заказах и отчётах.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {databases.map((db) => (
          <Card key={db.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-lg border ${db.color}`}
                >
                  <Icon name={db.icon} size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{db.count}</p>
                  <p className="text-xs text-muted-foreground">{db.countLabel}</p>
                </div>
              </div>
              <CardTitle className="mt-4">{db.title}</CardTitle>
              <CardDescription>{db.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={db.onClick}
              >
                <Icon name="Settings" size={16} className="mr-2" />
                Управление
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Lightbulb" size={18} />
            Полезная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Типы устройств</p>
              <p className="text-muted-foreground text-xs">
                Используются при создании заказов и формировании отчётов по категориям техники
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Стоимость ремонтов</p>
              <p className="text-muted-foreground text-xs">
                Позволяют быстро устанавливать цену ремонта из готового прайс-листа
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}