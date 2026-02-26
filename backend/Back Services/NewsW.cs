using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using newsai_webapi.Data;
using newsai_webapi.Models;
using newsai_webapi.Services;

namespace newsai_webapi.Workers
{
    public class NewsWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        // DİKKAT: AI servisi bitirince bu linki sana verecek. 
        // Şimdilik test için localhost:8000 yazıyoruz.
        private readonly string _fastApiUrl = "http://localhost:8000/process-news";

        public NewsWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    Console.WriteLine("Haber Ajanı: İnternetten yeni haberler taranıyor...");
                    await ProcessAndSaveNewsAsync();
                    await CleanOldNewsAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Haber Ajanı Hatası: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task ProcessAndSaveNewsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var _rssService = scope.ServiceProvider.GetRequiredService<RssService>();

            var rssHaberleri = _rssService.GetNews("");

            using var httpClient = new HttpClient();

            foreach (var item in rssHaberleri)
            {

                bool isExists = _context.News.Any(n => n.SourceUrl == item.SourceUrl);
                if (isExists) continue;

                var newsRequest = new
                {
                    title = item.Title,
                    content = item.Description
                };

                var jsonRequest = JsonSerializer.Serialize(newsRequest);
                var httpContent = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                try
                {
                    var response = await httpClient.PostAsync(_fastApiUrl, httpContent);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(responseString);
                        var root = doc.RootElement;

                        string aiCategory = root.TryGetProperty("category", out var cat) ? cat.GetString() : "Genel";
                        string aiSummary = root.TryGetProperty("summary", out var sum) ? sum.GetString() : "Özet çıkarılamadı.";
                        bool aiVerified = root.TryGetProperty("isVerified", out var ver) && ver.GetBoolean();

                        var newHaber = new NewsData
                        {
                            Title = item.Title,
                            Description = aiSummary,
                            OriginalContent = item.Description,
                            SourceUrl = item.SourceUrl,
                            Category = aiCategory,
                            IsVerified = aiVerified,
                            PublishedAt = DateTime.UtcNow,
                            Views = 0
                        };

                        _context.News.Add(newHaber);
                        await _context.SaveChangesAsync();

                        Console.WriteLine($"AI Onaylı Yeni Haber Eklendi: {item.Title}");
                    }
                }
                catch (Exception)
                {
                    // YEDEK PLAN
                    Console.WriteLine($"AI Kapalı! Yedek Plan Devrede, Ham Haber Kaydediliyor: {item.Title}");

                    var fallbackHaber = new NewsData
                    {
                        Title = item.Title,
                        Description = item.Description,
                        OriginalContent = item.Description,
                        SourceUrl = item.SourceUrl,
                        Category = "Genel", 
                        IsVerified = false,
                        PublishedAt = DateTime.UtcNow,
                        Views = 0,
                        ImageUrl = item.ImageUrl
                    };

                    _context.News.Add(fallbackHaber);
                    await _context.SaveChangesAsync();
                }
            }
        }

        // --- 3 AYLIK ARŞİV TEMİZLİĞİ ---
        private async Task CleanOldNewsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var limitDate = DateTime.UtcNow.AddMonths(-3);
            var oldNews = _context.News.Where(n => n.PublishedAt < limitDate).ToList();

            if (oldNews.Any())
            {
                _context.News.RemoveRange(oldNews);
                await _context.SaveChangesAsync();
                Console.WriteLine($"🧹 Sistem Temizliği: 3 aydan eski {oldNews.Count} haber veritabanından kalıcı olarak silindi.");
            }
        }
    }
}