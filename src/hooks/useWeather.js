/**
 * 1. getWeather ile newsData üzerinden hava durumu alır.
 * 2. refreshInterval ile periyodik güncelleme.
 * 3. weather, loading, error state ve refetch döner.
 * 4. İlk değer initialWeather; hata durumunda yedek kullanılır.
 * 5. useCallback ile fetchWeather referansı sabitlenir.
 */
import { useState, useEffect, useCallback } from 'react';
import { getWeather } from '../services/newsDataApi';

const REFRESH_INTERVAL_MS = 5000;

const initialWeather = {
  anlikDerece: 14,
  durum: 'Parçalı bulutlu',
  nemOrani: 62,
  tahmin3Gun: []
};

export function useWeather(options = {}) {
  const { refreshInterval = REFRESH_INTERVAL_MS } = options;
  const [weather, setWeather] = useState(initialWeather);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
      const data = await getWeather();
      setWeather(data && typeof data === 'object' ? data : initialWeather);
    } catch (err) {
      setError(err?.message || 'Hava durumu verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchWeather, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchWeather, refreshInterval]);

  return { weather, loading, error, refetch: fetchWeather };
}
