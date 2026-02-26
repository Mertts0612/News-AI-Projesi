using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using newsai_webapi.Data;
using newsai_webapi.Models;
using System.Globalization;

namespace newsai_webapi.Workers
{
    public class CurrencyWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public CurrencyWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    Console.WriteLine("Döviz Ajanı Çalıştı: Piyasalar kontrol ediliyor...");
                    await UpdateCurrenciesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Döviz Ajanı Beklenmedik Hata: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }

        private async Task UpdateCurrenciesAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                // 1. Fiyatları Çek
                decimal usd = GetYahooPrice("TRY=X");
                decimal eur = GetYahooPrice("EURTRY=X");
                decimal bist = GetYahooPrice("XU100.IS");
                decimal btc = GetYahooPrice("BTC-USD");
                decimal gold = await GetGoldPriceAsync(usd);

                // 2. İşlemleri Yap ve Listeye Ekle/Güncelle
                await ProcessCurrencyAsync(_context, "USD", "Dolar", usd);
                await ProcessCurrencyAsync(_context, "EUR", "Euro", eur);
                await ProcessCurrencyAsync(_context, "GA", "Gram Altın", gold);
                await ProcessCurrencyAsync(_context, "XU100", "BIST 100", bist);
                await ProcessCurrencyAsync(_context, "BTC", "Bitcoin", btc);

                // 3. Kaydet
                await _context.SaveChangesAsync();
                Console.WriteLine("Döviz kurları ve değişim yüzdeleri başarıyla güncellendi!");
            }
            catch (Exception ex)
            {
                // Veritabanı veya işlem hataları
                var innerMsg = ex.InnerException != null ? ex.InnerException.Message : "Ek detay yok.";
                Console.WriteLine("KRİTİK VERİTABANI HATASI!");
                Console.WriteLine($"Hata Mesajı: {ex.Message}");
                Console.WriteLine($"İç Hata (Detay): {innerMsg}");
            }
        }

        private async Task ProcessCurrencyAsync(AppDbContext context, string code, string name, decimal newPrice)
        {
            if (newPrice <= 0) return;

            var existingCurrency = context.Currencies.FirstOrDefault(c => c.Code == code);

            if (existingCurrency == null)
            {
                context.Currencies.Add(new CurrencyData
                {
                    Code = code,
                    Name = name,
                    Buying = newPrice,
                    Selling = newPrice,
                    ChangeRate = 0,
                    LastUpdated = DateTime.UtcNow
                });
            }
            else
            {
                decimal oldPrice = existingCurrency.Buying;
                decimal changeRate = 0;

                if (oldPrice > 0)
                {
                    changeRate = ((newPrice - oldPrice) / oldPrice) * 100;
                }

                existingCurrency.Buying = newPrice;
                existingCurrency.Selling = newPrice;
                existingCurrency.ChangeRate = changeRate;
                existingCurrency.LastUpdated = DateTime.UtcNow;
            }
        }
        private decimal GetYahooPrice(string symbol)
        {
            try
            {
                string url = $"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}";
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                var json = client.GetStringAsync(url).Result;
                using var doc = JsonDocument.Parse(json);
                var meta = doc.RootElement.GetProperty("chart").GetProperty("result")[0].GetProperty("meta");
                return Convert.ToDecimal(meta.GetProperty("regularMarketPrice").GetDouble());
            }
            catch { return 0; }
        }

        private async Task<decimal> GetGoldPriceAsync(decimal usdPrice)
        {
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                string json = await client.GetStringAsync("https://api.genelpara.com/embed/para-birimleri.json");
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("GA", out var gold) && gold.TryGetProperty("satis", out var satis))
                {
                    string val = satis.ToString().Replace(".", ",");
                    decimal.TryParse(val, NumberStyles.Any, new CultureInfo("tr-TR"), out decimal result);
                    if (result > 0) return result;
                }
            }
            catch { }

            decimal oz = GetYahooPrice("GC=F");
            if (oz > 0 && usdPrice > 0) return (oz / 31.1034768m) * usdPrice + 150m;
            return 0;
        }
    }
}