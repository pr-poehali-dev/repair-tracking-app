import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, roleLabels } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import RoleBadge from '@/components/RoleBadge';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewOrder: () => void;
  onDeviceTypes: () => void;
  onClientsSearch: () => void;
  onExtensionRequests?: () => void;
  pendingRequestsCount?: number;
  onPartsRequests?: () => void;
  pendingPartsCount?: number;
  onPriceManagement?: () => void;
  onAdminSettings?: () => void;
}

export default function AppHeader({
  searchQuery,
  onSearchChange,
  onNewOrder,
  onDeviceTypes,
  onClientsSearch,
  onExtensionRequests,
  pendingRequestsCount = 0,
  onPartsRequests,
  pendingPartsCount = 0,
  onPriceManagement,
  onAdminSettings,
}: AppHeaderProps) {
  const { user, logout, hasPermission } = useAuth();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Трекинг ремонта</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {hasPermission('create_order') && (
            <Button onClick={onNewOrder}>
              <Icon name="Plus" size={18} className="mr-2" />
              Новый заказ
            </Button>
          )}

          {hasPermission('approve_extensions') && onExtensionRequests && (
            <Button 
              onClick={onExtensionRequests}
              variant="outline"
              className="relative"
            >
              <Icon name="Bell" size={18} className="mr-2" />
              Запросы
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </Button>
          )}

          {hasPermission('manage_parts') && onPartsRequests && (
            <Button 
              onClick={onPartsRequests}
              variant="outline"
              className="relative"
            >
              <Icon name="Package" size={18} className="mr-2" />
              Запчасти
              {pendingPartsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingPartsCount}
                </span>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="Settings" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Настройки</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hasRole('director') && onAdminSettings && (
                <DropdownMenuItem onClick={onAdminSettings}>
                  <Icon name="Shield" size={16} className="mr-2" />
                  Панель администратора
                </DropdownMenuItem>
              )}
              {hasRole('director') && <DropdownMenuSeparator />}
              {hasPermission('manage_device_types') && !hasRole('director') && (
                <DropdownMenuItem onClick={onDeviceTypes}>
                  <Icon name="Wrench" size={16} className="mr-2" />
                  Типы устройств
                </DropdownMenuItem>
              )}
              {hasPermission('edit_finance') && !hasRole('director') && onPriceManagement && (
                <DropdownMenuItem onClick={onPriceManagement}>
                  <Icon name="DollarSign" size={16} className="mr-2" />
                  База стоимостей
                </DropdownMenuItem>
              )}
              {hasPermission('view_clients') && (
                <DropdownMenuItem onClick={onClientsSearch}>
                  <Icon name="Users" size={16} className="mr-2" />
                  Клиенты
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>{user ? getUserInitials(user.fullName) : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  {user?.role && (
                    <div className="pt-1">
                      <RoleBadge role={user.role} />
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}