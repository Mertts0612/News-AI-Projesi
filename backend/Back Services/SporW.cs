using Microsoft.Extensions.Hosting;
using newsai_webapi.Data;
using newsai_webapi.Models;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;

namespace newsai_webapi.Workers
{
    public class SportsWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly string _apiKey = "ANAHTAR_BURAYA";

        public SportsWorker(IServiceProvider serviceProvider) => _serviceProvider = serviceProvider;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await UpdateScoresAsync();
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }

        private async Task UpdateScoresAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("X-RapidAPI-Key", _apiKey);
                client.DefaultRequestHeaders.Add("X-RapidAPI-Host", "api-football-v1.p.rapidapi.com");

                var response = await client.GetAsync("https://api-football-v1.p.rapidapi.com/v3/fixtures?league=203&season=2025&next=10");

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();

                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("response", out var responseElement))
                    {
                        var matchList = new List<SporData>();

                        foreach (var item in responseElement.EnumerateArray())
                        {
                            var fixture = item.GetProperty("fixture");
                            var teams = item.GetProperty("teams");
                            var goals = item.GetProperty("goals");
                            var matchDate = DateTime.Parse(fixture.GetProperty("date").GetString());

                            matchList.Add(new SporData
                            {
                                HomeTeam = teams.GetProperty("home").GetProperty("name").GetString() ?? "Bilinmiyor",
                                AwayTeam = teams.GetProperty("away").GetProperty("name").GetString() ?? "Bilinmiyor",
                                HomeLogo = teams.GetProperty("home").GetProperty("logo").GetString() ?? "",
                                AwayLogo = teams.GetProperty("away").GetProperty("logo").GetString() ?? "",
                                Score = goals.GetProperty("home").ValueKind == JsonValueKind.Null
                                        ? "0 - 0"
                                        : $"{goals.GetProperty("home").GetInt32()} - {goals.GetProperty("away").GetInt32()}",
                                Status = fixture.GetProperty("status").GetProperty("short").GetString() ?? "NS",
                                MatchDate = matchDate,
                                MatchTime = matchDate.ToLocalTime().ToString("HH:mm"),
                                LeagueName = "Trendyol Süper Lig"
                            });
                        }

                        context.Matches.RemoveRange(context.Matches);
                        await context.Matches.AddRangeAsync(matchList);
                        await context.SaveChangesAsync();

                        Console.WriteLine($"{DateTime.Now}: 10 yeni Süper Lig maçı güncellendi.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Spor API Hatası: {ex.Message}");
            }
        }
    }
}