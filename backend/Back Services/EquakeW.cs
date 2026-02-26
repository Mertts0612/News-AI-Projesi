using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using newsai_webapi.Models;
using newsai_webapi.Data;
using System.Globalization;
using System.Text;
using System.Linq;

namespace newsai_webapi.Workers
{
    public class EarthquakeWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public EarthquakeWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    Console.WriteLine("Ajan Çalıştı: Kandilli'den yeni depremler kontrol ediliyor...");
                    await CheckAndSaveEarthquakesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ajan Hatası: {ex.Message}");
                }
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task CheckAndSaveEarthquakesAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var trCulture = new CultureInfo("tr-TR");
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            var trEncoding = Encoding.GetEncoding("windows-1254");

            string url = "http://www.koeri.boun.edu.tr/scripts/lst0.asp";
            using var client = new HttpClient();
            byte[] responseBytes = await client.GetByteArrayAsync(url);
            string response = trEncoding.GetString(responseBytes);

            string[] lines = response.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            bool isDataStarted = false;
            int savedCount = 0;

            foreach (string line in lines)
            {
                if (line.Contains("----------")) { isDataStarted = true; continue; }
                if (!isDataStarted) continue;

                string[] parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length >= 9)
                {
                    string mwStr = parts[7];
                    if (mwStr != "-.-" && double.TryParse(mwStr, NumberStyles.Any, CultureInfo.InvariantCulture, out double mwValue))
                    {
                        if (mwValue >= 3.0)
                        {
                            var locParts = new List<string>();
                            for (int i = 8; i < parts.Length; i++)
                            {
                                string word = parts[i];
                                if (word.StartsWith("İlk") || word.StartsWith("İLK") || word.Contains("lksel") || word.Contains("REV")) break;
                                word = word.Replace("(", "").Replace(")", "");
                                locParts.Add(word);
                            }

                            string rawLocation = string.Join(" ", locParts).Trim();

                            string aiCleanedLocation = await CleanLocationWithAI(rawLocation);

                            string finalLocation = trCulture.TextInfo.ToTitleCase(aiCleanedLocation.ToLower(trCulture));
                            string dateStr = parts[0] + " " + parts[1];

                            bool isExists = _context.Earthquakes.Any(e => e.Date == dateStr && e.Location == finalLocation);

                            if (!isExists)
                            {
                                _context.Earthquakes.Add(new EquakeData
                                {
                                    Location = finalLocation,
                                    Magnitude = mwValue,
                                    Date = dateStr
                                });
                                await _context.SaveChangesAsync();
                                savedCount++;
                            }
                        }
                    }
                }
                if (savedCount >= 10) break;
            }
            if (savedCount > 0) Console.WriteLine($"{savedCount} yeni deprem veritabanına eklendi!");
        }
        private async Task<string> CleanLocationWithAI(string rawLocation)
        {
            try
            {
                // BURASI AI İLE KONUŞTUĞUMUZ YER (Placeholder)
                // Arkadaşın API'yi verince buraya HTTP isteği atıp AI'dan gelen cevabı alacağız.
                // Şimdilik sistemin hata vermemesi için orijinal veriyi geri döndürüyoruz.

                // Örnek: 
                // var cleanText = await _aiService.Duzelt(rawLocation); 
                // return cleanText;

                return await Task.FromResult(rawLocation);
            }
            catch
            {
                // Eğer AI sunucusunda bir çökme olursa NewsAI patlamasın diye
                // yedek plan olarak ham veriyi kullanıyoruz.
                return rawLocation;
            }
        }
    }
}