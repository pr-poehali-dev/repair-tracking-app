import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface MasterSalaryReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masters: string[];
}

interface SalaryReport {
  repairs: Array<{
    orderId: string;
    startDate: string;
    endDate: string;
    salary: number;
    repairDays: number;
  }>;
  summary: {
    totalRepairs: number;
    totalSalary: number;
    averageRepairDays: number;
  };
}

const ORDERS_API_URL = 'https://functions.poehali.dev/e9af1ae4-2b09-4ac1-a49a-bf1172ebfc8c';

export default function MasterSalaryReportDialog({
  open,
  onOpenChange,
  masters,
}: MasterSalaryReportDialogProps) {
  const { toast } = useToast();
  const [selectedMaster, setSelectedMaster] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [report, setReport] = useState<SalaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedMaster || !startDate || !endDate) {
      toast({
        title: 'Заполните все поля',
        description: 'Выберите мастера и укажите период',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${ORDERS_API_URL}?action=salary-report&master=${encodeURIComponent(selectedMaster)}&startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        throw new Error('Ошибка загрузки отчёта');
      }
    } catch (error) {
      console.error('Ошибка генерации отчёта:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сформировать отчёт',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!report) return;

    const rows = [
      ['Отчёт по зарплате мастера'],
      [`Мастер: ${selectedMaster}`],
      [`Период: ${new Date(startDate).toLocaleDateString('ru-RU')} - ${new Date(endDate).toLocaleDateString('ru-RU')}`],
      [],
      ['№ ремонта', 'Дата начала', 'Дата завершения', 'Дней на ремонт', 'Зарплата (₽)'],
      ...report.repairs.map(r => [
        r.orderId,
        new Date(r.startDate).toLocaleDateString('ru-RU'),
        new Date(r.endDate).toLocaleDateString('ru-RU'),
        r.repairDays.toString(),
        r.salary.toFixed(2),
      ]),
      [],
      ['Итого ремонтов:', report.summary.totalRepairs.toString()],
      ['Общая зарплата:', `${report.summary.totalSalary.toFixed(2)} ₽`],
      ['Средний срок ремонта:', `${report.summary.averageRepairDays.toFixed(1)} дней`],
    ];

    const csvContent = rows.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salary_report_${selectedMaster}_${startDate}_${endDate}.csv`;
    link.click();

    toast({
      title: 'Отчёт экспортирован',
      description: 'Файл успешно сохранён',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Отчёт по зарплате мастера</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Мастер</Label>
              <Select value={selectedMaster} onValueChange={setSelectedMaster}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите мастера" />
                </SelectTrigger>
                <SelectContent>
                  {masters.map((master) => (
                    <SelectItem key={master} value={master}>
                      {master}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Формирование...
                </>
              ) : (
                <>
                  <Icon name="FileText" size={16} className="mr-2" />
                  Сформировать отчёт
                </>
              )}
            </Button>

            {report && (
              <>
                <Button onClick={handleExportToExcel} variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспорт в Excel
                </Button>
                <Button onClick={handlePrint} variant="outline">
                  <Icon name="Printer" size={16} className="mr-2" />
                  Печать
                </Button>
              </>
            )}
          </div>

          {report && (
            <div className="print:p-8" id="salary-report">
              <div className="mb-6 print:block">
                <h2 className="text-2xl font-bold mb-2">Отчёт по зарплате мастера</h2>
                <p className="text-muted-foreground">
                  <strong>Мастер:</strong> {selectedMaster}
                </p>
                <p className="text-muted-foreground">
                  <strong>Период:</strong>{' '}
                  {new Date(startDate).toLocaleDateString('ru-RU')} -{' '}
                  {new Date(endDate).toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">№ ремонта</th>
                      <th className="px-4 py-3 text-left font-semibold">Дата начала</th>
                      <th className="px-4 py-3 text-left font-semibold">Дата завершения</th>
                      <th className="px-4 py-3 text-right font-semibold">Дней на ремонт</th>
                      <th className="px-4 py-3 text-right font-semibold">Зарплата (₽)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.repairs.map((repair, index) => (
                      <tr key={repair.orderId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-mono">{repair.orderId}</td>
                        <td className="px-4 py-3">
                          {new Date(repair.startDate).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(repair.endDate).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 text-right">{repair.repairDays}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {repair.salary.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/10 font-bold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        Всего ремонтов:
                      </td>
                      <td className="px-4 py-3 text-right">{report.summary.totalRepairs}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        Общая зарплата:
                      </td>
                      <td className="px-4 py-3 text-right text-lg">
                        {report.summary.totalSalary.toFixed(2)} ₽
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        Средний срок ремонта:
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.summary.averageRepairDays.toFixed(1)} дней
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {!report && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Выберите параметры и нажмите "Сформировать отчёт"</p>
            </div>
          )}
        </div>
      </DialogContent>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #salary-report, #salary-report * {
            visibility: visible;
          }
          #salary-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  );
}
