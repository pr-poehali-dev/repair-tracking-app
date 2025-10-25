import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import RoleBadge from '@/components/RoleBadge';
import { roleLabels, UserRole } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface OrderUser extends User {
  userId: string;
  assignmentRole: string;
  addedAt: string;
}

interface AssignUserDialogProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_USERS_API_URL = 'https://functions.poehali.dev/eecda2dd-7328-41e9-934b-193583f2411e';

export default function AssignUserDialog({ orderId, isOpen, onClose }: AssignUserDialogProps) {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [orderUsers, setOrderUsers] = useState<OrderUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadOrderUsers();
    }
  }, [isOpen, orderId]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${ORDER_USERS_API_URL}?listUsers=true`);
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей',
        variant: 'destructive',
      });
    }
  };

  const loadOrderUsers = async () => {
    try {
      const response = await fetch(`${ORDER_USERS_API_URL}?orderId=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderUsers(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  const handleAddUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(ORDER_USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId, role: 'assigned' }),
      });

      if (response.ok) {
        toast({
          title: 'Пользователь добавлен',
          description: 'Пользователь теперь имеет доступ к заказу',
        });
        await loadOrderUsers();
      } else {
        throw new Error('Ошибка добавления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить пользователя',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(ORDER_USERS_API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId }),
      });

      if (response.ok) {
        toast({
          title: 'Пользователь удален',
          description: 'Доступ к заказу отозван',
        });
        await loadOrderUsers();
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователя',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isUserAssigned = (userId: string) => {
    return orderUsers.some(u => String(u.userId) === String(userId));
  };

  const availableUsers = allUsers.filter(user => !isUserAssigned(String(user.id)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление доступом к заказу {orderId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Users" size={16} />
              Участники заказа ({orderUsers.length})
            </h3>
            {orderUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет участников</p>
            ) : (
              <div className="space-y-2">
                {orderUsers.map(user => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </div>
                      <RoleBadge role={user.role} />
                      <Badge variant="outline" className="text-xs">
                        {user.addedAt}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveUser(String(user.userId))}
                      disabled={isLoading}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Добавить участника
            </h3>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Все пользователи уже добавлены</p>
            ) : (
              <div className="space-y-2">
                {availableUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(String(user.id))}
                      disabled={isLoading}
                    >
                      <Icon name="Plus" size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}