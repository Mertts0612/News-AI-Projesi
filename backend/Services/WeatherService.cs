using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using newsai_webapi.Models;

namespace newsai_webapi.Services
{
    public class WeatherService
    {
        private readonly string _apiKey = "ANAHTAR_BURAYA";

        public async Task<WeatherResponse> GetWeatherAsync(double lat, double lon)
        {
            using var client = new HttpClient();
            var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_apiKey}&units=metric&lang=tr";

            var response = await client.GetStringAsync(url);
            using var doc = JsonDocument.Parse(response);
            var root = doc.RootElement;

            return new WeatherResponse
            {
                City = root.GetProperty("name").GetString(),
                Temperature = root.GetProperty("main").GetProperty("temp").GetDouble(),
                Description = root.GetProperty("weather")[0].GetProperty("description").GetString(),
                Icon = root.GetProperty("weather")[0].GetProperty("icon").GetString()
            };
        }
    }
}