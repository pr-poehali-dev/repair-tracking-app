import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function SalarySettingsManagement() {
  const [masterSalaryPercent, setMasterSalaryPercent] = useState<number>(50);
  const [inputValue, setInputValue] = useState<string>('50');
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('masterSalaryPercent');
    if (saved) {
      const percent = parseInt(saved);
      setMasterSalaryPercent(percent);
      setInputValue(String(percent));
    }
  }, []);

  const handleSave = () => {
    const value = parseInt(inputValue);
    
    if (isNaN(value) || value < 0 || value > 100) {
      toast({
        title: 'Ошибка',
        description: 'Процент должен быть от 0 до 100',
        variant: 'destructive',
      });
      return;
    }

    setMasterSalaryPercent(value);
    localStorage.setItem('masterSalaryPercent', String(value));
    
    toast({
      title: 'Сохранено',
      description: `Процент зарплаты мастера установлен: ${value}%`,
    });
  };

  const handleReset = () => {
    setInputValue('50');
    setMasterSalaryPercent(50);
    localStorage.setItem('masterSalaryPercent', '50');
    
    toast({
      title: 'Сброшено',
      description: 'Процент зарплаты возвращён к стандартному значению 50%',
    });
  };

  const exampleRevenue = 10000;
  const exampleSalary = Math.round((exampleRevenue * masterSalaryPercent) / 100);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Wallet" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Настройка зарплаты мастеров</p>
            <p className="text-blue-700">
              Укажите процент от стоимости ремонта, который получает мастер в качестве заработной платы.
              Изменения применяются ко всем мастерам в системе.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Процент зарплаты мастера
          </CardTitle>
          <CardDescription>
            Текущий процент: <span className="font-bold text-green-600">{masterSalaryPercent}%</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Процент от стоимости ремонта
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="50"
                className="text-lg"
              />
            </div>
            <Button onClick={handleSave} className="px-6">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button onClick={handleReset} variant="outline">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сброс
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Пример расчёта:</p>
            <div className="flex items-center justify-between text-sm">
              <span>Стоимость ремонта:</span>
              <span className="font-semibold">{exampleRevenue.toLocaleString()} ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Процент мастера ({masterSalaryPercent}%):</span>
              <span className="font-semibold text-green-600">{exampleSalary.toLocaleString()} ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <span>Остаётся компании ({100 - masterSalaryPercent}%):</span>
              <span className="font-semibold">{(exampleRevenue - exampleSalary).toLocaleString()} ₽</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Info" size={18} />
            Важная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Автоматический расчёт</p>
              <p className="text-muted-foreground text-xs">
                Зарплата мастера рассчитывается автоматически при просмотре статистики
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Только завершённые заказы</p>
              <p className="text-muted-foreground text-xs">
                В расчёт зарплаты входят только заказы со статусом "Готов" или "Завершён"
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Применяется ко всем</p>
              <p className="text-muted-foreground text-xs">
                Установленный процент действует для всех мастеров в системе
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
