/**
 * 1. getEarthquakes ile newsData üzerinden deprem listesi alır.
 * 2. refreshInterval ile periyodik güncelleme.
 * 3. earthquakes, loading, error state ve refetch döner.
 * 4. Veri her zaman dizi olarak normalize edilir.
 * 5. useCallback ile fetchEarthquakes referansı sabitlenir.
 */
import { useState, useEffect, useCallback } from 'react';
import { getEarthquakes } from '../services/newsDataApi';

const REFRESH_INTERVAL_MS = 5000;

export function useEarthquakes(options = {}) {
  const { refreshInterval = REFRESH_INTERVAL_MS } = options;
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEarthquakes = useCallback(async () => {
    try {
      setError(null);
      const data = await getEarthquakes();
      setEarthquakes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Deprem verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchEarthquakes, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEarthquakes, refreshInterval]);

  return { earthquakes, loading, error, refetch: fetchEarthquakes };
}
