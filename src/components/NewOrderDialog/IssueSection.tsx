import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { NewOrderFormData } from './types';

interface IssueSectionProps {
  formData: NewOrderFormData;
  errors: Partial<Record<keyof NewOrderFormData, string>>;
  onChange: (field: keyof NewOrderFormData, value: string) => void;
}

export default function IssueSection({
  formData,
  errors,
  onChange,
}: IssueSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="AlertCircle" size={18} className="text-primary" />
        Заявленная неисправность
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="issue">Описание проблемы <span className="text-destructive">*</span></Label>
          <Textarea
            id="issue"
            placeholder="Подробное описание неисправности со слов клиента"
            value={formData.issue}
            onChange={(e) => onChange('issue', e.target.value)}
            rows={3}
            className={errors.issue ? 'border-destructive' : ''}
          />
          {errors.issue && <p className="text-xs text-destructive mt-1">{errors.issue}</p>}
        </div>
      </div>
    </div>
  );
}
