using System;

namespace newsai_webapi.Models
{
    public class NewsData
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string OriginalContent { get; set; } = string.Empty; 
        public string SourceUrl { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;


        public string Category { get; set; } = string.Empty; 
        public bool IsVerified { get; set; } = false; 

        
        public DateTime PublishedAt { get; set; } 


        public int Views { get; set; } = 0; 
        public string ReadTime { get; set; } = string.Empty;
        public int Importance { get; set; }
        public bool Featured { get; set; }
    }
}