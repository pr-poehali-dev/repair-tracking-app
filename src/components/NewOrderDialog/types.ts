export interface DeviceType {
  id: number;
  name: string;
  category: string;
}

export interface Client {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  devices: Array<{
    deviceType: string;
    deviceModel: string;
    serialNumber: string;
  }>;
}

export interface NewOrderFormData {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  issue: string;
  appearance: string;
  accessories: string;
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless' | 'our-device';
  receivedDate?: string;
  purchasePrice?: number;
  deliveryCost?: number;
  possibleIssue?: string;
}

export const DEVICE_TYPES_API_URL = 'https://functions.poehali.dev/7e59e15a-4b6d-4147-8829-3060b4d82b31';
export const CLIENTS_API_URL = 'https://functions.poehali.dev/a71e85f8-4a97-42b3-ad3f-f2a76d79cd8f';