import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EmployeesManagement from '@/components/admin/EmployeesManagement';
import RolesPermissionsManagement from '@/components/admin/RolesPermissionsManagement';
import DatabasesManagement from '@/components/admin/DatabasesManagement';

interface AdminSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeviceTypes: () => void;
  onOpenPriceManagement: () => void;
}

export default function AdminSettingsDialog({
  isOpen,
  onClose,
  onOpenDeviceTypes,
  onOpenPriceManagement,
}: AdminSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            Панель администратора
          </DialogTitle>
          <DialogDescription>
            Управление сотрудниками, ролями и базами данных системы
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">
              <Icon name="Users" size={16} className="mr-2" />
              Сотрудники
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Icon name="Key" size={16} className="mr-2" />
              Роли и права
            </TabsTrigger>
            <TabsTrigger value="databases">
              <Icon name="Database" size={16} className="mr-2" />
              Базы данных
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4">
            <EmployeesManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <RolesPermissionsManagement />
          </TabsContent>

          <TabsContent value="databases" className="mt-4">
            <DatabasesManagement
              onOpenDeviceTypes={onOpenDeviceTypes}
              onOpenPriceManagement={onOpenPriceManagement}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
