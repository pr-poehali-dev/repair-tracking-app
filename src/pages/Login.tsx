import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }

    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary p-4 rounded-2xl w-fit">
            <Icon name="Wrench" size={40} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Система учёта ремонтов</CardTitle>
          <CardDescription>Войдите в систему для продолжения работы</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <div className="relative">
                <Icon name="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-fade-in">
                <Icon name="AlertCircle" size={18} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full gap-2" size="lg">
              <Icon name="LogIn" size={18} />
              Войти
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Тестовые аккаунты:</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>• director / director123 (Директор)</p>
              <p>• master1 / master123 (Мастер)</p>
              <p>• accountant / accountant123 (Бухгалтер)</p>
              <p>• warranty / warranty123 (Менеджер гарантия)</p>
              <p>• parts / parts123 (Менеджер запчасти)</p>
              <p>• reception / reception123 (Менеджер приёма)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}