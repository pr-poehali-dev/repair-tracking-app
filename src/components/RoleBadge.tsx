import { Badge } from '@/components/ui/badge';
import { UserRole, roleLabels } from '@/contexts/AuthContext';

interface RoleBadgeProps {
  role: UserRole;
}

const roleColors: Record<UserRole, string> = {
  director: 'bg-purple-100 text-purple-700 border-purple-200',
  master: 'bg-blue-100 text-blue-700 border-blue-200',
  accountant: 'bg-green-100 text-green-700 border-green-200',
  warranty_manager: 'bg-orange-100 text-orange-700 border-orange-200',
  parts_manager: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  reception_manager: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={roleColors[role]}>
      {roleLabels[role]}
    </Badge>
  );
}
