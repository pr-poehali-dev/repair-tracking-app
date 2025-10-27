import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { NewOrderFormData } from './types';

interface OurDeviceSectionProps {
  formData: NewOrderFormData;
  errors: Partial<Record<keyof NewOrderFormData, string>>;
  onChange: (field: keyof NewOrderFormData, value: string) => void;
}

export default function OurDeviceSection({
  formData,
  errors,
  onChange,
}: OurDeviceSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Package" size={18} className="text-primary" />
        Данные о нашей технике
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="receivedDate">Дата поступления техники <span className="text-destructive">*</span></Label>
          <Input
            id="receivedDate"
            type="date"
            value={formData.receivedDate}
            onChange={(e) => onChange('receivedDate', e.target.value)}
            className={errors.receivedDate ? 'border-destructive' : ''}
          />
          {errors.receivedDate && <p className="text-xs text-destructive mt-1">{errors.receivedDate}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchasePrice">Стоимость покупки, ₽</Label>
            <Input
              id="purchasePrice"
              type="number"
              placeholder="0"
              value={formData.purchasePrice || ''}
              onChange={(e) => onChange('purchasePrice', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="deliveryCost">Стоимость доставки, ₽</Label>
            <Input
              id="deliveryCost"
              type="number"
              placeholder="0"
              value={formData.deliveryCost || ''}
              onChange={(e) => onChange('deliveryCost', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="possibleIssue">Возможная неисправность</Label>
          <Textarea
            id="possibleIssue"
            placeholder="Предполагаемые проблемы или симптомы"
            value={formData.possibleIssue}
            onChange={(e) => onChange('possibleIssue', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
