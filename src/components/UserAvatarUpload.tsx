import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserAvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UPLOAD_API_URL = 'https://functions.poehali.dev/e24ab164-20b7-4558-b657-9d70e5c378a1';

export default function UserAvatarUpload({ open, onOpenChange }: UserAvatarUploadProps) {
  const { user, updateUserAvatar } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Файл слишком большой',
          description: 'Максимальный размер аватарки: 5 МБ',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Неверный формат',
          description: 'Пожалуйста, выберите изображение',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (user.id) {
          headers['X-User-Id'] = user.id;
        }

        const response = await fetch(`${UPLOAD_API_URL}?action=avatar`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: user.id,
            fileData: base64Data,
            fileName: selectedFile.name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          updateUserAvatar(data.avatarUrl);
          
          toast({
            title: 'Аватарка обновлена',
            description: 'Ваша фотография успешно загружена',
          });
          
          onOpenChange(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        } else {
          throw new Error('Ошибка загрузки');
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить аватарку',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !user.avatarUrl) return;

    try {
      setIsDeleting(true);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (user.id) {
        headers['X-User-Id'] = user.id;
      }

      const response = await fetch(`${UPLOAD_API_URL}?action=delete-avatar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        updateUserAvatar('');
        
        toast({
          title: 'Аватарка удалена',
          description: 'Ваша фотография успешно удалена',
        });
        
        onOpenChange(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления аватарки:', error);
      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить аватарку',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user?.avatarUrl ? 'Изменить аватарку' : 'Загрузить аватарку'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Поддерживаются форматы: JPG, PNG, GIF, WebP (макс. 5 МБ)
            </p>
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={previewUrl}
                  alt="Предпросмотр аватарки"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {!previewUrl && user?.avatarUrl && (
            <div className="flex justify-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-muted">
                <img
                  src={user.avatarUrl}
                  alt="Текущая аватарка"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            {user?.avatarUrl && !selectedFile && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                {isDeleting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  {user?.avatarUrl ? 'Изменить' : 'Загрузить'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}