import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Order } from '@/lib/orderUtils';

interface MasterStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  masterName: string;
}

interface DateRange {
  from: string;
  to: string;
}

export default function MasterStatsDialog({
  open,
  onOpenChange,
  orders,
  masterName,
}: MasterStatsDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const getMasterSalaryPercent = (): number => {
    const individualSalaries = localStorage.getItem('individualMasterSalaries');
    if (individualSalaries) {
      const salaries = JSON.parse(individualSalaries);
      const masterSalary = salaries.find((s: { masterName: string; percent: number }) => s.masterName === masterName);
      if (masterSalary) {
        return masterSalary.percent;
      }
    }
    
    const defaultPercent = localStorage.getItem('masterSalaryPercent');
    return defaultPercent ? parseInt(defaultPercent) : 50;
  };

  const salaryPercent = getMasterSalaryPercent();

  const filterOrdersByDate = (orders: Order[]): Order[] => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= fromDate && orderDate <= toDate && order.master === masterName;
    });
  };

  const filteredOrders = filterOrdersByDate(orders);

  const stats = {
    total: filteredOrders.length,
    completed: filteredOrders.filter(o => o.status === 'ready' || o.status === 'completed').length,
    inProgress: filteredOrders.filter(o => o.status === 'diagnostics' || o.status === 'repair' || o.status === 'waiting_parts').length,
    totalRevenue: filteredOrders
      .filter(o => o.status === 'ready' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.price || 0), 0),
    masterSalary: filteredOrders
      .filter(o => o.status === 'ready' || o.status === 'completed')
      .reduce((sum, o) => sum + ((o.price || 0) * (salaryPercent / 100)), 0),
    avgRepairTime: 0,
  };

  const completedOrders = filteredOrders.filter(
    o => o.status === 'ready' || o.status === 'completed'
  );

  if (completedOrders.length > 0) {
    const totalTime = completedOrders.reduce((sum, order) => {
      const created = new Date(order.createdAt).getTime();
      const completed = new Date().getTime();
      return sum + (completed - created);
    }, 0);
    stats.avgRepairTime = Math.round(totalTime / completedOrders.length / (1000 * 60 * 60 * 24));
  }

  const setQuickRange = (days: number) => {
    const to = new Date();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={24} />
            Моя статистика
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Период</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(7)}
              >
                Неделя
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(30)}
              >
                Месяц
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(90)}
              >
                3 месяца
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(365)}
              >
                Год
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">От</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">До</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-700 font-medium">Моя зарплата за период</CardDescription>
              <CardTitle className="text-4xl text-green-600">{Math.round(stats.masterSalary).toLocaleString()} ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Icon name="Wallet" size={16} />
                {salaryPercent}% от стоимости {stats.completed} завершённых ремонтов
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Всего заказов</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="FileText" size={16} />
                  За выбранный период
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Завершено</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="CheckCircle2" size={16} />
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% от общего
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>В работе</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  Активные заказы
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Выручка компании</CardDescription>
                <CardTitle className="text-3xl">{stats.totalRevenue.toLocaleString()} ₽</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="DollarSign" size={16} />
                  Завершённые заказы
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="TrendingUp" size={18} />
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Средний срок ремонта</span>
                <span className="font-semibold">
                  {stats.avgRepairTime > 0 ? `${stats.avgRepairTime} дн.` : 'Нет данных'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Средний чек</span>
                <span className="font-semibold">
                  {stats.completed > 0 ? `${Math.round(stats.totalRevenue / stats.completed).toLocaleString()} ₽` : 'Нет данных'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Средняя зарплата за заказ</span>
                <span className="font-semibold text-green-600">
                  {stats.completed > 0 ? `${Math.round(stats.masterSalary / stats.completed).toLocaleString()} ₽` : 'Нет данных'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Процент завершения</span>
                <span className="font-semibold">
                  {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                </span>
              </div>
            </CardContent>
          </Card>

          {filteredOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="List" size={18} />
                  Список заказов за период
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{order.id} - {order.deviceType}</div>
                        <div className="text-xs text-muted-foreground">{order.deviceModel}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{order.price?.toLocaleString()} ₽</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}