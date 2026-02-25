using System;

namespace newsai_webapi.Models
{
    public class NewsData
    {
        // Veritabanı için ŞART olan kimlik numarası (Primary Key)
        public int Id { get; set; }

        // --- 1. TEMEL HABER BİLGİLERİ ---
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty; // AI'ın üreteceği özet buraya gelecek
        public string OriginalContent { get; set; } = string.Empty; // AI'a göndermek için saklayacağımız ham RSS metni
        public string SourceUrl { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        // --- 2. AI (YAPAY ZEKA) KATMANI ---
        public string Category { get; set; } = string.Empty; // NLP'den gelecek kategori
        public bool IsVerified { get; set; } = false; // LLM'den gelecek doğrulama (Sahte haber mi?)

        // --- 3. TARİH VE ZAMAN (Filtreleme için DateTime olmak ZORUNDA) ---
        public DateTime PublishedAt { get; set; } // 3 günlük ve 3 aylık arşiv hesaplamaları bununla yapılacak

        // --- 4. İSTATİSTİK VE GÖSTERİM ---
        public int Views { get; set; } = 0; // Matematik (Views++) yapabilmek için int olmalı
        public string ReadTime { get; set; } = string.Empty;
        public int Importance { get; set; }
        public bool Featured { get; set; }
    }
}