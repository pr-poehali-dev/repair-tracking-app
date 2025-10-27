import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Client, NewOrderFormData } from './types';

interface ClientInfoSectionProps {
  formData: NewOrderFormData;
  errors: Partial<Record<keyof NewOrderFormData, string>>;
  clientSuggestions: Client[];
  showSuggestions: boolean;
  onChange: (field: keyof NewOrderFormData, value: string) => void;
  onFillClientData: (client: Client) => void;
  onPhoneFocus: () => void;
}

export default function ClientInfoSection({
  formData,
  errors,
  clientSuggestions,
  showSuggestions,
  onChange,
  onFillClientData,
  onPhoneFocus,
}: ClientInfoSectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="User" size={18} className="text-primary" />
        Информация о клиенте
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="clientName">ФИО клиента <span className="text-destructive">*</span></Label>
          <Input
            id="clientName"
            placeholder="Иванов Иван Иванович"
            value={formData.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className={errors.clientName ? 'border-destructive' : ''}
          />
          {errors.clientName && <p className="text-xs text-destructive mt-1">{errors.clientName}</p>}
        </div>

        <div className="relative">
          <Label htmlFor="clientPhone">Номер телефона <span className="text-destructive">*</span></Label>
          <Input
            id="clientPhone"
            placeholder="+7 (___) ___-__-__"
            value={formData.clientPhone}
            onChange={(e) => onChange('clientPhone', e.target.value)}
            onFocus={onPhoneFocus}
            className={errors.clientPhone ? 'border-destructive' : ''}
          />
          {errors.clientPhone && <p className="text-xs text-destructive mt-1">{errors.clientPhone}</p>}
          
          {showSuggestions && clientSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {clientSuggestions.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-b-0"
                  onClick={() => onFillClientData(client)}
                >
                  <p className="font-medium">{client.fullName}</p>
                  <p className="text-xs text-muted-foreground">{client.phone}</p>
                  {client.address && <p className="text-xs text-muted-foreground">{client.address}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="clientAddress">Адрес</Label>
          <Input
            id="clientAddress"
            placeholder="ул. Примерная, д. 1, кв. 1"
            value={formData.clientAddress}
            onChange={(e) => onChange('clientAddress', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
