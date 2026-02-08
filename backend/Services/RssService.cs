using System.ServiceModel.Syndication;
using System.Xml;
using newsai_webapi.Models;
using System.Text.RegularExpressions;

namespace newsai_webapi.Services
{
    public class RssService
    {
        private readonly List<string> _homeSources = new List<string>
        {
            "https://www.webtekno.com/rss.xml",
            "https://shiftdelete.net/feed",
            "https://webrazzi.com/feed"
        };

        private readonly List<string> _searchExtraSources = new List<string>
        {
            "https://www.donanimarsivi.com/feed/",
            "https://www.log.com.tr/feed/"
        };

        public List<NewsArticle> GetNews(string topic)
        {
            var allArticles = new List<NewsArticle>();
            List<string> urlsToScan;

            if (string.IsNullOrWhiteSpace(topic) || topic.ToLower() == "undefined")
            {
                urlsToScan = new List<string>(_homeSources);
                topic = "";
            }
            else
            {
                urlsToScan = new List<string>(_homeSources);
                urlsToScan.AddRange(_searchExtraSources);
                urlsToScan.Add($"https://news.google.com/rss/search?q={Uri.EscapeDataString(topic)}&hl=tr&gl=TR&ceid=TR:tr");
            }

            foreach (var url in urlsToScan)
            {
                var sourceArticles = new List<NewsArticle>();
                try
                {
                    using var reader = XmlReader.Create(url);
                    var feed = SyndicationFeed.Load(reader);
                    string currentSource = GetSourceName(url);

                    foreach (var item in feed.Items)
                    {
                        if (sourceArticles.Count >= 5) break;

                        var title = item.Title.Text;
                        var link = item.Links.FirstOrDefault()?.Uri.ToString() ?? "";
                        var rawSummary = item.Summary?.Text ?? "";

                        var linkLower = link.ToLower();
                        var titleLower = title.ToLower();

                        if (linkLower.Contains("webtekno.com/video")) continue;
                        if (linkLower.Contains("shiftdelete.net/sdn-tv")) continue;
                        if (linkLower.Contains("/inceleme/")) continue;
                        if (titleLower.Contains("video:") || titleLower.Contains("inceleme:")) continue;

                        if (!string.IsNullOrWhiteSpace(topic))
                        {
                            bool found = titleLower.Contains(topic.ToLower()) ||
                                         rawSummary.ToLower().Contains(topic.ToLower());
                            if (!found) continue;
                        }

                        string imageUrl = "";

                        var mediaThumb = item.ElementExtensions.FirstOrDefault(e => e.OuterName == "content" || e.OuterName == "thumbnail");
                        if (mediaThumb != null)
                        {
                            try
                            {
                                var element = mediaThumb.GetObject<XmlElement>();
                                imageUrl = element.GetAttribute("url");
                            }
                            catch { }
                        }

                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            var enclosure = item.Links.FirstOrDefault(l => l.RelationshipType == "enclosure");
                            if (enclosure != null) imageUrl = enclosure.Uri.ToString();
                        }

                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            var match = Regex.Match(rawSummary, "<img.+?src=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
                            if (match.Success)
                            {
                                imageUrl = match.Groups[1].Value;
                                if (imageUrl.StartsWith("//")) imageUrl = "https:" + imageUrl;
                            }
                        }

                        if (string.IsNullOrEmpty(imageUrl) && url.Contains("google"))
                        {
                            imageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
                        }

                        if (string.IsNullOrEmpty(imageUrl))
                            imageUrl = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop";

                        string cleanSummary = Regex.Replace(rawSummary, "<.*?>", string.Empty).Trim();
                        if (cleanSummary.Length > 200) cleanSummary = cleanSummary.Substring(0, 197) + "...";
                        if (string.IsNullOrEmpty(cleanSummary)) cleanSummary = "Haber detayları için kaynağı ziyaret edin.";

                        sourceArticles.Add(new NewsArticle
                        {
                            Title = title,
                            Link = link,
                            Summary = cleanSummary,
                            PubDate = item.PublishDate.DateTime,
                            ImageUrl = imageUrl,
                            SourceName = currentSource
                        });
                    }
                    allArticles.AddRange(sourceArticles);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Kaynak Hatası ({url}): {ex.Message}");
                }
            }

            return allArticles.OrderByDescending(a => a.PubDate).ToList();
        }

        private string GetSourceName(string url)
        {
            if (url.Contains("webtekno")) return "Webtekno";
            if (url.Contains("shiftdelete")) return "ShiftDelete";
            if (url.Contains("webrazzi")) return "Webrazzi";
            if (url.Contains("donanimarsivi")) return "Donanım Arşivi";
            if (url.Contains("log.com.tr")) return "LOG";
            if (url.Contains("google")) return "Google News";
            return "Teknoloji";
        }
    }
}