/**
 * 1. newsData.json tek kaynak; haber, kur, deprem, hava verisi buradan alınır.
 * 2. getNewsData: tüm veriyi döner; hata durumunda varsayılan değerler kullanılır.
 * 3. getNews, getCurrencies, getEarthquakes, getWeather ayrı veri sağlar.
 * 4. defaultCurrencies ve defaultWeather yedek veri tanımları.
 * 5. axios ile JSON çekilir ve normalize edilir.
 */
import axios from 'axios';

const NEWS_DATA_URL = '/src/Data/newsData.json';

const defaultCurrencies = {
  usd: { value: 33.45, change: 0.12 },
  eur: { value: 36.78, change: -0.08 },
  btc: { value: 98450, change: 2.34 },
  bist: { value: 9842, change: 0.47 },
  gold: { value: 3621, change: 0.83 }
};

const defaultWeather = {
  anlikDerece: 14,
  durum: 'Parçalı bulutlu',
  nemOrani: 62,
  tahmin3Gun: [
    { gun: 'Cumartesi', derece: 15 },
    { gun: 'Pazar', derece: 12 },
    { gun: 'Pazartesi', derece: 11 }
  ]
};

export async function getNewsData() {
  try {
    const { data } = await axios.get(NEWS_DATA_URL);
    const earthquakes = Array.isArray(data?.earthquakes) ? data.earthquakes : [];
    const weather = data?.weather && typeof data.weather === 'object'
      ? {
          anlikDerece: Number(data.weather.anlikDerece ?? defaultWeather.anlikDerece),
          durum: data.weather.durum ?? defaultWeather.durum,
          nemOrani: Number(data.weather.nemOrani ?? defaultWeather.nemOrani),
          tahmin3Gun: Array.isArray(data.weather.tahmin3Gun) ? data.weather.tahmin3Gun : defaultWeather.tahmin3Gun
        }
      : defaultWeather;
    return {
      news: Array.isArray(data?.news) ? data.news : [],
      currencies: data?.currencies && typeof data.currencies === 'object'
        ? {
            usd: { value: Number(data.currencies.usd?.value ?? defaultCurrencies.usd.value), change: Number(data.currencies.usd?.change ?? 0) },
            eur: { value: Number(data.currencies.eur?.value ?? defaultCurrencies.eur.value), change: Number(data.currencies.eur?.change ?? 0) },
            btc: { value: Number(data.currencies.btc?.value ?? defaultCurrencies.btc.value), change: Number(data.currencies.btc?.change ?? 0) },
            bist: { value: Number(data.currencies.bist?.value ?? defaultCurrencies.bist.value), change: Number(data.currencies.bist?.change ?? 0) },
            gold: { value: Number(data.currencies.gold?.value ?? defaultCurrencies.gold.value), change: Number(data.currencies.gold?.change ?? 0) }
          }
        : defaultCurrencies,
      earthquakes,
      weather
    };
  } catch (err) {
    console.warn('newsData yüklenemedi, varsayılan veriler kullanılıyor:', err?.message);
    return {
      news: [],
      currencies: defaultCurrencies,
      earthquakes: [],
      weather: defaultWeather
    };
  }
}

export async function getNews() {
  const { news } = await getNewsData();
  return news;
}

export async function getCurrencies() {
  const { currencies } = await getNewsData();
  return currencies;
}

export async function getEarthquakes() {
  const { earthquakes } = await getNewsData();
  return earthquakes;
}

export async function getWeather() {
  const { weather } = await getNewsData();
  return weather;
}
