import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface MediaFile {
  id: number;
  orderId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
}

interface OrderMediaSectionProps {
  orderId: string;
}

const MEDIA_API_URL = 'https://functions.poehali.dev/e24ab164-20b7-4558-b657-9d70e5c378a1';

export default function OrderMediaSection({ orderId }: OrderMediaSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, [orderId]);

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

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const headers: HeadersInit = {};
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }

      const response = await fetch(`${MEDIA_API_URL}?orderId=${orderId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки медиа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Файл слишком большой',
          description: 'Максимальный размер файла: 10 МБ',
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

        const response = await fetch(MEDIA_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            orderId,
            fileData: base64Data,
            fileName: selectedFile.name,
            fileType: selectedFile.type.startsWith('image/') ? 'image' : 'video',
            uploadedBy: user.fullName,
            description: uploadDescription,
          }),
        });

        if (response.ok) {
          toast({
            title: 'Фото загружено',
            description: 'Файл успешно добавлен к заказу',
          });
          setIsUploadDialogOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadDescription('');
          await loadMedia();
        } else {
          throw new Error('Ошибка загрузки');
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Image" size={20} className="text-primary" />
          <h3 className="font-semibold">Фотофиксация</h3>
          <span className="text-sm text-muted-foreground">({media.length})</span>
        </div>
        <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
          <Icon name="Upload" size={16} className="mr-2" />
          Загрузить фото
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Icon name="Image" size={48} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground mb-2">Нет загруженных фото</p>
          <p className="text-sm text-muted-foreground">
            Добавьте фото техники для документирования состояния
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((file) => (
            <div
              key={file.id}
              className="group relative border rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedImage(file.fileUrl)}
            >
              <div className="aspect-square relative">
                <img
                  src={file.fileUrl}
                  alt={file.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="ZoomIn" size={32} className="text-white" />
                </div>
              </div>
              <div className="p-2 bg-background">
                <p className="text-xs font-medium truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{formatDate(file.uploadedAt).split(',')[0]}</span>
                </div>
                {file.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {file.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Загрузить фото</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Выберите файл</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Поддерживаются форматы: JPG, PNG, GIF, WebP, MP4 (макс. 10 МБ)
              </p>
            </div>

            {previewUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Предпросмотр"
                  className="w-full h-64 object-contain bg-muted"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                placeholder="Например: Царапина на задней крышке, скол экрана..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadDescription('');
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
                  Загрузить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Просмотр фото</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImage}
                alt="Полный размер"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
