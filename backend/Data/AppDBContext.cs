using Microsoft.EntityFrameworkCore;
using newsai_webapi.Models;

namespace newsai_webapi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<EquakeData> Earthquakes { get; set; }
        public DbSet<CurrencyData> Currencies { get; set; }
        public DbSet<NewsData> News { get; set; }

        // PostgreSQL'deki tablo isimleri ve büyük/küçük harf sorunlarını çözen kısım:
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tablo isimlerini PostgreSQL'in en sevdiği format olan küçük harfe sabitliyoruz
            modelBuilder.Entity<CurrencyData>().ToTable("currencies");
            modelBuilder.Entity<NewsData>().ToTable("news");
            modelBuilder.Entity<EquakeData>().ToTable("earthquakes");
            modelBuilder.Entity<NewsData>().HasIndex(n => n.PublishedAt);
            modelBuilder.Entity<NewsData>().HasIndex(n => n.Views);
        }
    }
}