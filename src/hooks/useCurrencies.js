/**
 * 1. getCurrencies ile newsData üzerinden kur verisi alır.
 * 2. refreshInterval ile periyodik güncelleme; varsayılan 5000 ms.
 * 3. currencies, loading, error state ve refetch döner.
 * 4. İlk yüklemede initialCurrencies kullanılır.
 * 5. Hata durumunda error mesajı set edilir.
 */
import { useState, useEffect, useCallback } from 'react';
import { getCurrencies } from '../services/newsDataApi';

const REFRESH_INTERVAL_MS = 5000;

const initialCurrencies = {
  usd: { value: 33.45, change: 0.12 },
  eur: { value: 36.78, change: -0.08 },
  btc: { value: 98450, change: 2.34 },
  bist: { value: 9842, change: 0.47 },
  gold: { value: 3621, change: 0.83 }
};

export function useCurrencies(options = {}) {
  const { refreshInterval = REFRESH_INTERVAL_MS } = options;
  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrencies = useCallback(async () => {
    try {
      setError(null);
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (err) {
      setError(err?.message || 'Kur verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchCurrencies, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchCurrencies, refreshInterval]);

  return { currencies, loading, error, refetch: fetchCurrencies };
}
