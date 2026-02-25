using System;

namespace newsai_webapi.Models
{
    public class CurrencyData
    {
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty; // USD, EUR
        public string Name { get; set; } = string.Empty; // Dolar, Euro

        public decimal Buying { get; set; }  // Alış Fiyatı
        public decimal Selling { get; set; } // Satış Fiyatı

        // İŞTE SENİN İSTEDİĞİN O YÜZDELİK FARK ALANI!
        // Eğer değer pozitifse (Örn: 1.25) -> Front-end YEŞİL YAKACAK
        // Eğer değer negatifse (Örn: -0.85) -> Front-end KIRMIZI YAKACAK
        public decimal ChangeRate { get; set; }

        public DateTime LastUpdated { get; set; } // Güncellenme zamanı
    }
}