import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OrderStatsProps {
  stats: {
    total: number;
    received: number;
    inProgress: number;
    ready: number;
    completed: number;
    revenue: number;
  };
}

export default function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Всего заказов</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon name="ClipboardList" className="text-blue-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">В работе</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Icon name="Wrench" className="text-yellow-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Готово</p>
              <p className="text-2xl font-bold text-green-900">{stats.ready}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Выручка</p>
              <p className="text-2xl font-bold text-purple-900">{stats.revenue.toLocaleString()} ₽</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Icon name="Wallet" className="text-purple-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
