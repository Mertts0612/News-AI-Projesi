using Microsoft.AspNetCore.Mvc;
using newsai_webapi.Data;
using newsai_webapi.Models;
using newsai_webapi.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace newsai_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly WeatherService _weatherService;
        public NewsController(AppDbContext context, WeatherService weatherService)
        {
            _context = context;
            _weatherService = weatherService;
        }

        [HttpGet]
        public IActionResult GetNews(bool isArchive = false, int page = 1, int pageSize = 20)
        {
            if (page <= 0) page = 1;

            var cutoffDate = DateTime.UtcNow.AddDays(-3);
            var query = _context.News.AsQueryable();

            if (!isArchive)
                query = query.Where(n => n.PublishedAt >= cutoffDate);
            else
                query = query.Where(n => n.PublishedAt < cutoffDate);

            var news = query
                .OrderByDescending(n => n.PublishedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new {
                    id = n.Id,
                    title = n.Title,
                    description = n.Description,
                    sourceUrl = n.SourceUrl,
                    category = n.Category,
                    imageUrl = n.ImageUrl,
                    publishedAt = n.PublishedAt,
                    isVerified = n.IsVerified
                })
                .ToList();

            return Ok(news);
        }

        [HttpPost("click/{id}")]
        public async Task<IActionResult> IncrementClick(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return NotFound("Haber bulunamadı.");

            news.Views += 1;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tıklanma kaydedildi." });
        }

        [HttpGet("featured")]
        public IActionResult GetFeaturedNews()
        {
            var last24Hours = DateTime.UtcNow.AddHours(-24);

            var featured = _context.News
                .Where(n => n.PublishedAt >= last24Hours)
                .OrderByDescending(n => n.Views)
                .Select(n => new {
                    id = n.Id,
                    title = n.Title,
                    description = n.Description,
                    imageUrl = n.ImageUrl,
                    category = n.Category,
                    publishedAt = n.PublishedAt
                })
                .FirstOrDefault();

            if (featured == null) return NotFound("Henüz öne çıkan bir haber yok.");

            return Ok(featured);
        }

        [HttpGet("weather")]
        public async Task<IActionResult> GetWeather([FromQuery] double lat, [FromQuery] double lon)
        {
            try
            {
                var weather = await _weatherService.GetWeatherAsync(lat, lon);
                return Ok(weather);
            }
            catch (Exception ex)
            {
                return BadRequest($"Hava durumu alınamadı: {ex.Message}");
            }
        }

        [HttpGet("currencies")]
        public IActionResult GetCurrencies() => Ok(_context.Currencies.OrderBy(c => c.Id).ToList());

        [HttpGet("earthquakes")]
        public IActionResult GetEarthquakes()
        {
            string bugunFormatli = DateTime.Today.ToString("yyyy.MM.dd");
            var data = _context.Earthquakes
                .AsEnumerable()
                .Where(e => e.Date != null && e.Date.StartsWith(bugunFormatli))
                .OrderByDescending(e => e.Date)
                .Take(15)
                .ToList();
            return Ok(data);
        }
    }
}