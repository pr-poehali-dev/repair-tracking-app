import { useState, useEffect } from 'react';

const ORDERS_API_URL = 'https://functions.poehali.dev/e9af1ae4-2b09-4ac1-a49a-bf1172ebfc8c';

export function useChatSearch(searchQuery: string) {
  const [chatMatches, setChatMatches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchInChats = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setChatMatches([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(
          `${ORDERS_API_URL}?action=search-chat&q=${encodeURIComponent(searchQuery)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const orderIds = await response.json();
          setChatMatches(orderIds);
        } else {
          setChatMatches([]);
        }
      } catch (error) {
        console.error('Chat search error:', error);
        setChatMatches([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchInChats, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { chatMatches, isSearching };
}
