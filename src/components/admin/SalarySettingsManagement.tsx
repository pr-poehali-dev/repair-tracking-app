import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MasterSalary {
  masterName: string;
  percent: number;
}

export default function SalarySettingsManagement() {
  const [defaultPercent, setDefaultPercent] = useState<number>(50);
  const [defaultInput, setDefaultInput] = useState<string>('50');
  const [masterSalaries, setMasterSalaries] = useState<MasterSalary[]>([]);
  const [newMasterName, setNewMasterName] = useState<string>('');
  const [newMasterPercent, setNewMasterPercent] = useState<string>('50');
  const { toast } = useToast();

  useEffect(() => {
    const savedDefault = localStorage.getItem('masterSalaryPercent');
    if (savedDefault) {
      const percent = parseInt(savedDefault);
      setDefaultPercent(percent);
      setDefaultInput(String(percent));
    }

    const savedIndividual = localStorage.getItem('individualMasterSalaries');
    if (savedIndividual) {
      setMasterSalaries(JSON.parse(savedIndividual));
    }
  }, []);

  const handleSaveDefault = () => {
    const value = parseInt(defaultInput);
    
    if (isNaN(value) || value < 0 || value > 100) {
      toast({
        title: 'Ошибка',
        description: 'Процент должен быть от 0 до 100',
        variant: 'destructive',
      });
      return;
    }

    setDefaultPercent(value);
    localStorage.setItem('masterSalaryPercent', String(value));
    
    toast({
      title: 'Сохранено',
      description: `Стандартный процент установлен: ${value}%`,
    });
  };

  const handleResetDefault = () => {
    setDefaultInput('50');
    setDefaultPercent(50);
    localStorage.setItem('masterSalaryPercent', '50');
    
    toast({
      title: 'Сброшено',
      description: 'Стандартный процент возвращён к 50%',
    });
  };

  const handleAddMaster = () => {
    if (!newMasterName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя мастера',
        variant: 'destructive',
      });
      return;
    }

    const percent = parseInt(newMasterPercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast({
        title: 'Ошибка',
        description: 'Процент должен быть от 0 до 100',
        variant: 'destructive',
      });
      return;
    }

    const exists = masterSalaries.find(m => m.masterName === newMasterName.trim());
    if (exists) {
      toast({
        title: 'Ошибка',
        description: 'Мастер с таким именем уже существует',
        variant: 'destructive',
      });
      return;
    }

    const updated = [...masterSalaries, { masterName: newMasterName.trim(), percent }];
    setMasterSalaries(updated);
    localStorage.setItem('individualMasterSalaries', JSON.stringify(updated));
    
    setNewMasterName('');
    setNewMasterPercent('50');
    
    toast({
      title: 'Добавлено',
      description: `Индивидуальный процент для ${newMasterName.trim()}: ${percent}%`,
    });
  };

  const handleUpdateMaster = (masterName: string, newPercent: number) => {
    if (isNaN(newPercent) || newPercent < 0 || newPercent > 100) {
      toast({
        title: 'Ошибка',
        description: 'Процент должен быть от 0 до 100',
        variant: 'destructive',
      });
      return;
    }

    const updated = masterSalaries.map(m => 
      m.masterName === masterName ? { ...m, percent: newPercent } : m
    );
    setMasterSalaries(updated);
    localStorage.setItem('individualMasterSalaries', JSON.stringify(updated));
    
    toast({
      title: 'Обновлено',
      description: `Процент для ${masterName}: ${newPercent}%`,
    });
  };

  const handleDeleteMaster = (masterName: string) => {
    const updated = masterSalaries.filter(m => m.masterName !== masterName);
    setMasterSalaries(updated);
    localStorage.setItem('individualMasterSalaries', JSON.stringify(updated));
    
    toast({
      title: 'Удалено',
      description: `Индивидуальная настройка для ${masterName} удалена`,
    });
  };

  const exampleRevenue = 10000;
  const exampleSalary = Math.round((exampleRevenue * defaultPercent) / 100);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Wallet" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Настройка зарплаты мастеров</p>
            <p className="text-blue-700">
              Установите стандартный процент для всех мастеров или индивидуальный процент для каждого.
              Индивидуальные настройки имеют приоритет над стандартным процентом.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="default">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default">
            <Icon name="Users" size={16} className="mr-2" />
            Стандартный процент
          </TabsTrigger>
          <TabsTrigger value="individual">
            <Icon name="User" size={16} className="mr-2" />
            Индивидуальные ({masterSalaries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Стандартный процент для всех мастеров
              </CardTitle>
              <CardDescription>
                Текущий процент: <span className="font-bold text-green-600">{defaultPercent}%</span>
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
                    value={defaultInput}
                    onChange={(e) => setDefaultInput(e.target.value)}
                    placeholder="50"
                    className="text-lg"
                  />
                </div>
                <Button onClick={handleSaveDefault} className="px-6">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button onClick={handleResetDefault} variant="outline">
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
                  <span>Процент мастера ({defaultPercent}%):</span>
                  <span className="font-semibold text-green-600">{exampleSalary.toLocaleString()} ₽</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2">
                  <span>Остаётся компании ({100 - defaultPercent}%):</span>
                  <span className="font-semibold">{(exampleRevenue - exampleSalary).toLocaleString()} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserPlus" size={20} />
                Добавить индивидуальную настройку
              </CardTitle>
              <CardDescription>
                Установите особый процент зарплаты для конкретного мастера
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Имя мастера (как в системе)
                  </label>
                  <Input
                    value={newMasterName}
                    onChange={(e) => setNewMasterName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className="w-32">
                  <label className="text-sm font-medium mb-2 block">
                    Процент
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newMasterPercent}
                    onChange={(e) => setNewMasterPercent(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <Button onClick={handleAddMaster}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>

          {masterSalaries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Icon name="Users" size={48} className="mx-auto mb-3 opacity-20" />
                <p>Индивидуальные настройки не добавлены</p>
                <p className="text-sm">Все мастера используют стандартный процент: {defaultPercent}%</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {masterSalaries.map((master) => (
                <Card key={master.masterName}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{master.masterName}</p>
                        <p className="text-sm text-muted-foreground">
                          Индивидуальный процент: <span className="font-bold text-green-600">{master.percent}%</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={master.percent}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (val !== master.percent && !isNaN(val)) {
                              handleUpdateMaster(master.masterName, val);
                            }
                          }}
                          className="w-20"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteMaster(master.masterName)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
              <p className="font-medium">Приоритет индивидуальных настроек</p>
              <p className="text-muted-foreground text-xs">
                Если для мастера установлен индивидуальный процент, он используется вместо стандартного
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Автоматический расчёт</p>
              <p className="text-muted-foreground text-xs">
                Зарплата рассчитывается автоматически на основе завершённых заказов мастера
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Точное совпадение имени</p>
              <p className="text-muted-foreground text-xs">
                Имя мастера должно точно совпадать с именем в системе (с учётом регистра и пробелов)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
