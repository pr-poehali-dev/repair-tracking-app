import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useEmployees } from '@/hooks/useEmployees';
import { UserRole, roleLabels } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EmployeesManagement() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, toggleActive } = useEmployees();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'master' as UserRole,
  });

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      role: 'master' as UserRole,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formData.username.trim() || !formData.fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const exists = employees.some(emp => emp.username === formData.username);
    if (exists) {
      toast({
        title: 'Ошибка',
        description: 'Сотрудник с таким логином уже существует',
        variant: 'destructive',
      });
      return;
    }

    addEmployee({ ...formData, isActive: true });
    toast({
      title: 'Сотрудник добавлен',
      description: `${formData.fullName} успешно добавлен в систему`,
    });
    resetForm();
  };

  const handleEdit = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setFormData({
        username: employee.username,
        fullName: employee.fullName,
        role: employee.role,
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdate = () => {
    if (!editingId) return;

    if (!formData.username.trim() || !formData.fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    updateEmployee(editingId, formData);
    toast({
      title: 'Сотрудник обновлён',
      description: 'Данные успешно сохранены',
    });
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;

    if (deleteConfirmId === '1') {
      toast({
        title: 'Ошибка',
        description: 'Невозможно удалить главного директора',
        variant: 'destructive',
      });
      setDeleteConfirmId(null);
      return;
    }

    deleteEmployee(deleteConfirmId);
    toast({
      title: 'Сотрудник удалён',
      description: 'Сотрудник удалён из системы',
    });
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[50vh] pr-4">
        <div className="space-y-3">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="Users" size={48} className="mb-4 opacity-50" />
              <p className="text-sm">Нет сотрудников</p>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{employee.fullName}</h4>
                      {!employee.isActive && (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                      {employee.id === '1' && (
                        <Badge variant="default">Главный</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        <span>{employee.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Briefcase" size={14} />
                        <span>{roleLabels[employee.role]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(employee.id)}
                    >
                      <Icon
                        name={employee.isActive ? 'UserX' : 'UserCheck'}
                        size={14}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(employee.id)}
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    {employee.id !== '1' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(employee.id)}
                      >
                        <Icon name="Trash2" size={14} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-3">
        {isAdding ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="username" className="text-sm">
                  Логин
                </Label>
                <Input
                  id="username"
                  placeholder="ivanov"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={!!editingId}
                />
              </div>
              <div>
                <Label htmlFor="fullName" className="text-sm">
                  ФИО
                </Label>
                <Input
                  id="fullName"
                  placeholder="Иванов Иван Иванович"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role" className="text-sm">
                Роль
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1"
              >
                <Icon
                  name={editingId ? 'Save' : 'Plus'}
                  size={16}
                  className="mr-2"
                />
                {editingId ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <Icon name="UserPlus" size={16} className="mr-2" />
            Добавить сотрудника
          </Button>
        )}
      </div>

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Сотрудник будет полностью удалён из
              системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
