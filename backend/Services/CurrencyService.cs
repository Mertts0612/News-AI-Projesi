using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using newsai_webapi.Models;

namespace newsai_webapi.Services
{
    public class CurrencyService
    {
        public List<CurrencyData> GetLiveCurrencies()
        {
            var list = new List<CurrencyData>();
            var trCulture = new CultureInfo("tr-TR");

            // --- 1. KÜRESEL VERİLER (Kusursuz Yahoo Finance) ---
            double usd = GetYahooPrice("TRY=X");
            double eur = GetYahooPrice("EURTRY=X");
            double bist = GetYahooPrice("XU100.IS");
            double goldOz = GetYahooPrice("GC=F");
            double btc = GetYahooPrice("BTC-USD");

            // --- 2. KAPALIÇARŞI FİZİKİ ALTIN FİYATI ---
            string kapalicarsiAltinStr = "0,00";
            decimal kapalicarsiAltinVal = 0;
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");

                // Kapalıçarşı fiyatı için Türkiye'nin en sağlam serbest piyasa API'si
                string json = client.GetStringAsync("https://api.genelpara.com/embed/para-birimleri.json").Result;

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                // GA = Gram Altın. ".ToString()" kullandığımız için sayı da gelse metin de gelse ÇÖKMEZ.
                if (root.TryGetProperty("GA", out var goldElement) && goldElement.TryGetProperty("satis", out var satisVal))
                {
                    kapalicarsiAltinStr = satisVal.ToString().Replace(".", ",");
                    decimal.TryParse(kapalicarsiAltinStr, NumberStyles.Any, trCulture, out kapalicarsiAltinVal);
                }
            }
            catch { }

            // YEDEK PLAN: Türkiye API'si anlık yanıt vermezse, Dünya ONS'u üzerinden "Makaslı" hesapla!
            if (kapalicarsiAltinVal == 0 && usd > 0 && goldOz > 0)
            {
                double ekranAltin = (goldOz / 31.1034768) * usd;
                double makasliAltin = ekranAltin + 150; // Fiziki altın için tahmini makas (Kuyumcu kârı)
                kapalicarsiAltinVal = Convert.ToDecimal(makasliAltin);
            }

            // --- 3. LİSTEYİ DOLDURMA (Ekranda Çıkacak Sırayla) ---
            // YENİ MODEL: Price yerine Buying ve Selling kullanıyoruz. ChangeRate henüz veritabanından gelmediği için 0.

            list.Add(new CurrencyData
            {
                Name = "USD",
                Code = "USD",
                Buying = Convert.ToDecimal(usd),
                Selling = Convert.ToDecimal(usd),
                LastUpdated = DateTime.Now
            });

            list.Add(new CurrencyData
            {
                Name = "EUR",
                Code = "EUR",
                Buying = Convert.ToDecimal(eur),
                Selling = Convert.ToDecimal(eur),
                LastUpdated = DateTime.Now
            });

            list.Add(new CurrencyData
            {
                Name = "ALTIN",
                Code = "GA",
                Buying = kapalicarsiAltinVal,
                Selling = kapalicarsiAltinVal,
                LastUpdated = DateTime.Now
            });

            list.Add(new CurrencyData
            {
                Name = "BIST100",
                Code = "XU100",
                Buying = Convert.ToDecimal(bist),
                Selling = Convert.ToDecimal(bist),
                LastUpdated = DateTime.Now
            });

            list.Add(new CurrencyData
            {
                Name = "BTC",
                Code = "BTC",
                Buying = Convert.ToDecimal(btc),
                Selling = Convert.ToDecimal(btc),
                LastUpdated = DateTime.Now
            });

            return list;
        }

        // --- YAHOO FINANCE BAĞLANTI MOTORU ---
        private double GetYahooPrice(string symbol)
        {
            try
            {
                string url = $"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}";
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                client.DefaultRequestHeaders.Add("Accept", "application/json");

                var json = client.GetStringAsync(url).Result;
                using var doc = JsonDocument.Parse(json);

                var meta = doc.RootElement.GetProperty("chart").GetProperty("result")[0].GetProperty("meta");
                return meta.GetProperty("regularMarketPrice").GetDouble();
            }
            catch
            {
                return 0; // Bir sorun olursa site patlamasın diye 0 döner
            }
        }
    }
}