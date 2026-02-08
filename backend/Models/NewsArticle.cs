namespace newsai_webapi.Models
{
    public class NewsArticle
    {
        public string Title { get; set; }
        public string Link { get; set; }
        public string Summary { get; set; }
        public DateTime PubDate { get; set; }
        public string ImageUrl { get; set; }
        public string SourceName { get; set; }
    }
}
