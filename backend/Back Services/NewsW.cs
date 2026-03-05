using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json; 
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
        private readonly IServiceProvider _serviceProvider;
        private readonly string _nlpApiUrl = "http://0.0.0.0:5000";
        private readonly string _llmApiUrl = "http://0.0.0.0:8000";

        public NewsWorker(IServiceProvider serviceProvider) => _serviceProvider = serviceProvider;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                Console.WriteLine($"---AI Destekli Haber İşleme Aktif: {DateTime.Now} ---");
                await ProcessAndSaveNewsAsync();
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }

        private async Task ProcessAndSaveNewsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var rssService = scope.ServiceProvider.GetRequiredService<RssService>();

            var rssNews = rssService.GetNews("");
            var tumHaberlerListesi = rssNews.Select(x => new { title = x.Title }).ToList();

            foreach (var item in rssNews)
            {
                bool exists = context.News.Any(n => n.Title == item.Title);
                if (exists) continue;

                string finalDescription = item.Description;
                string finalCategory = item.Category;
                int finalImportance = 5; 
                string finalReadTime = "2 dk";
                bool finalIsVerified = false;

                try
                {
                    using var client = new HttpClient();
                    client.Timeout = TimeSpan.FromSeconds(30);

                    
                    var nlpPayload = new
                    {
                        content = item.Description,
                        tumHaberler = tumHaberlerListesi
                    };

                    var nlpResponse = await client.PostAsJsonAsync(_nlpApiUrl, nlpPayload);

                    if (nlpResponse.IsSuccessStatusCode)
                    {
                        var nlpResult = await nlpResponse.Content.ReadFromJsonAsync<NlpResponse>();
                        if (nlpResult != null)
                        {
                            finalCategory = nlpResult.kategori;
                            finalImportance = nlpResult.onemPuani;
                            finalReadTime = nlpResult.okumaSuresi;
                            Console.WriteLine($"NLP: {nlpResult.haberBasligi} - Önem: {nlpResult.onemPuani}");
                        }
                    }

                    var llmPayload = new { title = item.Title, content = item.Description, category = finalCategory };
                    var llmResponse = await client.PostAsJsonAsync(_llmApiUrl, llmPayload);

                    if (llmResponse.IsSuccessStatusCode)
                    {
                        var llmResult = await llmResponse.Content.ReadFromJsonAsync<LlmResponse>();
                        if (llmResult != null)
                        {
                            finalDescription = llmResult.Summary;
                            finalIsVerified = llmResult.IsVerified;
                        }
                    }
                }
                catch (Exception ex) { Console.WriteLine($"AI Hatası: {ex.Message}"); }


                context.News.Add(new NewsData
                {
                    Title = item.Title,
                    Description = finalDescription, 
                    OriginalContent = item.Description, 
                    SourceUrl = item.SourceUrl,
                    ImageUrl = item.ImageUrl,
                    Category = finalCategory,
                    IsVerified = finalIsVerified,
                    PublishedAt = item.PublishedAt,
                    Views = 0,
                    ReadTime = finalReadTime, 
                    Importance = finalImportance, 
                    Featured = finalImportance > 8 
                });
            }

            await context.SaveChangesAsync();
        }

        private async Task CleanOldNewsAsync(AppDbContext context)
        {
            var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
            var oldNews = context.News.Where(n => n.PublishedAt < threeMonthsAgo);
            context.News.RemoveRange(oldNews);
            await context.SaveChangesAsync();
        }
    }

    public class NlpResponse
    {
        public string haberBasligi { get; set; } = "";
        public string kategori { get; set; } = "";
        public string okumaSuresi { get; set; } = "";
        public int onemPuani { get; set; }
    }

    public class LlmResponse { public string Summary { get; set; } = ""; public bool IsVerified { get; set; } }
}