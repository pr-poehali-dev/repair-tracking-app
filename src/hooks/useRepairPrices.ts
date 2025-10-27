import { useState, useEffect } from 'react';
import { RepairPrice } from '@/components/RepairPricesDialog';

const STORAGE_KEY = 'repair_prices';

const defaultPrices: RepairPrice[] = [
  { id: '1', deviceType: 'Стиральная машина', repairName: 'Замена подшипника', price: 3500, description: 'С учетом запчастей' },
  { id: '2', deviceType: 'Стиральная машина', repairName: 'Замена ТЭНа', price: 2500 },
  { id: '3', deviceType: 'Стиральная машина', repairName: 'Ремонт блока управления', price: 4500 },
  { id: '4', deviceType: 'Стиральная машина', repairName: 'Замена помпы', price: 2000 },
  { id: '5', deviceType: 'Холодильник', repairName: 'Заправка фреоном', price: 3000 },
  { id: '6', deviceType: 'Холодильник', repairName: 'Замена компрессора', price: 6500, description: 'С учетом компрессора' },
  { id: '7', deviceType: 'Холодильник', repairName: 'Замена термостата', price: 2500 },
  { id: '8', deviceType: 'Холодильник', repairName: 'Устранение утечки фреона', price: 4000 },
  { id: '9', deviceType: 'Микроволновка', repairName: 'Замена магнетрона', price: 2000 },
  { id: '10', deviceType: 'Микроволновка', repairName: 'Ремонт дверцы', price: 1500 },
  { id: '11', deviceType: 'Микроволновка', repairName: 'Замена слюды', price: 800 },
  { id: '12', deviceType: 'Посудомойка', repairName: 'Замена насоса', price: 3500 },
  { id: '13', deviceType: 'Посудомойка', repairName: 'Чистка форсунок', price: 1500 },
  { id: '14', deviceType: 'Посудомойка', repairName: 'Замена ТЭНа', price: 2800 },
  { id: '15', deviceType: 'Варочная панель', repairName: 'Замена конфорки', price: 2500 },
  { id: '16', deviceType: 'Варочная панель', repairName: 'Ремонт сенсорной панели', price: 4000 },
  { id: '17', deviceType: 'Духовой шкаф', repairName: 'Замена ТЭНа', price: 3000 },
  { id: '18', deviceType: 'Духовой шкаф', repairName: 'Ремонт терморегулятора', price: 2500 },
];

export function useRepairPrices() {
  const [prices, setPrices] = useState<RepairPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrices(JSON.parse(stored));
      } catch {
        setPrices(defaultPrices);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrices));
      }
    } else {
      setPrices(defaultPrices);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrices));
    }
    setIsLoading(false);
  }, []);

  const addPrice = (price: Omit<RepairPrice, 'id'>) => {
    const newPrice: RepairPrice = {
      ...price,
      id: Date.now().toString(),
    };
    const updated = [...prices, newPrice];
    setPrices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deletePrice = (id: string) => {
    const updated = prices.filter(p => p.id !== id);
    setPrices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getPricesByDevice = (deviceType: string) => {
    return prices.filter(p => p.deviceType === deviceType);
  };

  return {
    prices,
    isLoading,
    addPrice,
    deletePrice,
    getPricesByDevice,
  };
}
