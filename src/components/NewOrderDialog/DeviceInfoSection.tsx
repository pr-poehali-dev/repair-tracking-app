import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { DeviceType, NewOrderFormData } from './types';

interface DeviceInfoSectionProps {
  formData: NewOrderFormData;
  errors: Partial<Record<keyof NewOrderFormData, string>>;
  deviceTypes: DeviceType[];
  onChange: (field: keyof NewOrderFormData, value: string) => void;
}

export default function DeviceInfoSection({
  formData,
  errors,
  deviceTypes,
  onChange,
}: DeviceInfoSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Smartphone" size={18} className="text-primary" />
        Информация о технике
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deviceType">Вид техники <span className="text-destructive">*</span></Label>
          <Select
            value={formData.deviceType}
            onValueChange={(value) => onChange('deviceType', value)}
          >
            <SelectTrigger className={errors.deviceType ? 'border-destructive' : ''}>
              <SelectValue placeholder="Выберите вид техники" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes.map((dt) => (
                <SelectItem key={dt.id} value={dt.name}>
                  {dt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.deviceType && <p className="text-xs text-destructive mt-1">{errors.deviceType}</p>}
        </div>

        <div>
          <Label htmlFor="deviceModel">Модель</Label>
          <Input
            id="deviceModel"
            placeholder="iPhone 13 Pro"
            value={formData.deviceModel}
            onChange={(e) => onChange('deviceModel', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="serialNumber">Серийный номер</Label>
          <Input
            id="serialNumber"
            placeholder="SN123456789"
            value={formData.serialNumber}
            onChange={(e) => onChange('serialNumber', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="appearance">Внешний вид</Label>
          <Input
            id="appearance"
            placeholder="Царапины, потёртости..."
            value={formData.appearance}
            onChange={(e) => onChange('appearance', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="accessories">Комплектация</Label>
          <Textarea
            id="accessories"
            placeholder="Что прилагается: инструкция, гарантийный талон, кабели..."
            value={formData.accessories}
            onChange={(e) => onChange('accessories', e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
