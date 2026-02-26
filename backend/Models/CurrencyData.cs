using System;

namespace newsai_webapi.Models
{
    public class CurrencyData
    {
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty; // USD, EUR
        public string Name { get; set; } = string.Empty; // Dolar, Euro

        public decimal Buying { get; set; }
        public decimal Selling { get; set; }
        public decimal ChangeRate { get; set; }

        public DateTime LastUpdated { get; set; } 
    }
}