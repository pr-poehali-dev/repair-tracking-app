export type OrderStatus = 
  | 'received'
  | 'diagnostics'
  | 'repair'
  | 'parts-needed'
  | 'cost-approval'
  | 'payment-pending'
  | 'parts-delivery'
  | 'parts-arrived'
  | 'repair-continues'
  | 'repair-completed'
  | 'notify-client'
  | 'client-notified'
  | 'issued'
  | 'stuck'
  | 'disposal';

export interface OrderHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  issue: string;
  appearance: string;
  accessories: string;
  status: OrderStatus;
  repairType: 'warranty' | 'repeat' | 'paid' | 'cashless' | 'our-device';
  createdAt: string;
  createdTime: string;
  price?: number;
  master?: string;
  repairDescription?: string;
  history: OrderHistoryItem[];
  isDelayed?: boolean;
  delayReason?: string;
  customDeadlineDays?: number;
  partsRequest?: {
    requestedBy: string;
    requestedAt: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
  };
  extensionRequest?: {
    requestedBy: string;
    requestedAt: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
  };
  ourDeviceData?: {
    purchasePrice?: number;
    deliveryCost?: number;
    possibleIssue?: string;
  };
}