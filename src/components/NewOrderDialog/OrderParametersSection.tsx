import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { NewOrderFormData } from './types';

interface OrderParametersSectionProps {
  formData: NewOrderFormData;
  onChange: (field: keyof NewOrderFormData, value: string) => void;
}

export default function OrderParametersSection({
  formData,
  onChange,
}: OrderParametersSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Settings" size={18} className="text-primary" />
        Параметры заказа
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="repairType">Вид ремонта</Label>
          <Select value={formData.repairType} onValueChange={(value: string) => onChange('repairType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warranty">Гарантийный</SelectItem>
              <SelectItem value="repeat">Повторный</SelectItem>
              <SelectItem value="paid">Платный</SelectItem>
              <SelectItem value="cashless">Безнал</SelectItem>
              <SelectItem value="our-device">Наша техника</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Приоритет</Label>
          <Select value={formData.priority} onValueChange={(value: string) => onChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
