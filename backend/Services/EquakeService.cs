using System.Collections.Generic;
using System.Linq;
using newsai_webapi.Models;
using newsai_webapi.Data;

namespace newsai_webapi.Services
{
    public class EquakeService
    {
        private readonly AppDbContext _context;

        public EquakeService(AppDbContext context)
        {
            _context = context;
        }
        public List<EquakeData> GetRecentEarthquakes()
        {
            return _context.Earthquakes
                           .OrderByDescending(e => e.Id)
                           .Take(50)
                           .ToList();
        }
    }
}