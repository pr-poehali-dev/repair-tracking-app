import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface OrderChatSectionProps {
  orderId: string;
}

const ORDERS_API_URL = 'https://functions.poehali.dev/e9af1ae4-2b09-4ac1-a49a-bf1172ebfc8c';

export default function OrderChatSection({ orderId }: OrderChatSectionProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const headers: HeadersInit = {};
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }

      const response = await fetch(`${ORDERS_API_URL}?action=chat&orderId=${orderId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setIsSending(true);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (user.id) {
        headers['X-User-Id'] = user.id;
      }

      const messageData = {
        orderId,
        userId: user.id,
        userName: user.fullName,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${ORDERS_API_URL}?action=chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;

    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="MessageSquare" size={20} className="text-primary" />
        <h3 className="font-semibold">Чат по заказу</h3>
      </div>

      <div className="border rounded-lg bg-muted/30">
        <ScrollArea className="h-[300px] p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <Icon name="MessageCircle" size={48} className="mb-2 opacity-30" />
                <p className="text-sm">Пока нет сообщений</p>
                <p className="text-xs">Начните обсуждение заказа</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.userId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {isCurrentUser ? 'Вы' : msg.userName}
                        </span>
                        <span className={`text-xs ${isCurrentUser ? 'opacity-70' : 'text-muted-foreground'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 bg-background">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Написать сообщение... (Enter - отправить, Shift+Enter - новая строка)"
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="shrink-0 h-[60px] w-[60px]"
            >
              {isSending ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Send" size={20} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Сообщения видны всем участникам заказа
          </p>
        </div>
      </div>
    </div>
  );
}