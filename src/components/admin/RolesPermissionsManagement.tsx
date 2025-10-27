import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { UserRole, roleLabels, Permission } from '@/contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const permissionLabels: Record<Permission, string> = {
  view_orders: 'Просмотр заказов',
  create_orders: 'Создание заказов',
  edit_orders: 'Редактирование заказов',
  delete_orders: 'Удаление заказов',
  change_status: 'Изменение статуса',
  assign_master: 'Назначение мастера',
  view_finance: 'Просмотр финансов',
  edit_finance: 'Редактирование финансов',
  view_warranty: 'Просмотр гарантии',
  manage_parts: 'Управление запчастями',
  view_all: 'Просмотр всех данных',
  edit_repair: 'Редактирование ремонта',
  create_order: 'Создание заказа',
  manage_device_types: 'Управление типами устройств',
  view_clients: 'Просмотр клиентов',
  approve_extensions: 'Одобрение продлений',
};

const permissionCategories = {
  'Заказы': ['view_orders', 'create_orders', 'create_order', 'edit_orders', 'delete_orders', 'change_status', 'assign_master'],
  'Финансы': ['view_finance', 'edit_finance'],
  'Ремонт': ['edit_repair', 'view_warranty'],
  'Запчасти': ['manage_parts'],
  'Клиенты': ['view_clients'],
  'Справочники': ['manage_device_types'],
  'Система': ['view_all', 'approve_extensions'],
};

const rolePermissions: Record<UserRole, Permission[]> = {
  director: [
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
    'change_status', 'assign_master', 'view_finance', 'edit_finance',
    'view_warranty', 'manage_parts', 'view_all', 'edit_repair',
    'create_order', 'manage_device_types', 'view_clients', 'approve_extensions'
  ],
  master: [
    'view_orders', 'change_status', 'view_warranty', 'edit_repair'
  ],
  accountant: [
    'view_orders', 'view_finance', 'edit_finance', 'view_all', 'view_clients'
  ],
  warranty_manager: [
    'view_orders', 'create_orders', 'edit_orders', 'change_status', 'view_warranty',
    'create_order', 'view_clients'
  ],
  parts_manager: [
    'view_orders', 'manage_parts', 'view_all', 'view_clients'
  ],
  reception_manager: [
    'view_orders', 'create_orders', 'edit_orders', 'change_status', 'assign_master',
    'create_order', 'manage_device_types', 'view_clients'
  ],
};

const roleDescriptions: Record<UserRole, string> = {
  director: 'Полный доступ ко всем функциям системы',
  master: 'Работа с заказами и ремонтом',
  accountant: 'Управление финансами и отчётностью',
  warranty_manager: 'Работа с гарантийными заказами',
  parts_manager: 'Управление запчастями и закупками',
  reception_manager: 'Приём заказов и управление очередью',
};

export default function RolesPermissionsManagement() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');

  const roles: UserRole[] = ['director', 'master', 'accountant', 'warranty_manager', 'parts_manager', 'reception_manager'];

  return (
    <div className="grid grid-cols-3 gap-4 h-[60vh]">
      <div className="col-span-1">
        <h3 className="text-sm font-semibold mb-3">Роли</h3>
        <ScrollArea className="h-[55vh]">
          <div className="space-y-2 pr-4">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedRole === role
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{roleLabels[role]}</span>
                  {selectedRole === role && (
                    <Icon name="ChevronRight" size={16} className="text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {roleDescriptions[role]}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="col-span-2 border-l pl-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            Права доступа: {roleLabels[selectedRole]}
          </h3>
          <Badge variant="secondary">
            {rolePermissions[selectedRole].length} прав
          </Badge>
        </div>

        <ScrollArea className="h-[55vh]">
          <Accordion type="single" collapsible className="w-full pr-4">
            {Object.entries(permissionCategories).map(([category, permissions]) => {
              const categoryPermissions = permissions.filter(p =>
                rolePermissions[selectedRole].includes(p as Permission)
              );

              if (categoryPermissions.length === 0) return null;

              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline" className="ml-2">
                        {categoryPermissions.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {permissions.map((perm) => {
                        const hasPermission = rolePermissions[selectedRole].includes(perm as Permission);
                        if (!hasPermission) return null;

                        return (
                          <div
                            key={perm}
                            className="flex items-center gap-2 p-2 rounded bg-muted/30"
                          >
                            <Icon
                              name="CheckCircle2"
                              size={16}
                              className="text-green-600"
                            />
                            <span className="text-sm">
                              {permissionLabels[perm as Permission]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {rolePermissions[selectedRole].length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="ShieldOff" size={48} className="mb-4 opacity-50" />
              <p className="text-sm">Нет прав доступа</p>
            </div>
          )}
        </ScrollArea>

        <Separator className="my-4" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-medium mb-1">Информация о правах доступа</p>
              <p className="text-blue-700">
                Права доступа определяют, какие функции доступны пользователям с определённой ролью.
                Изменение прав доступа вступает в силу после перезахода в систему.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
