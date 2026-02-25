using System.ServiceModel.Syndication;
using System.Xml;
using newsai_webapi.Models;
using System.Text.RegularExpressions;
using System.Net.Http;
using System.Collections.Generic;
using System;
using System.Linq;

namespace newsai_webapi.Services
{
    public class RssService
    {
        private readonly List<string> _homeSources = new List<string>
        {
            "https://www.log.com.tr/feed/",
            "https://webrazzi.com/feed",
            "https://www.birgun.net/rss/kategori/guncel-7",
            "https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNREY2Ym1OZkVnSjBjaWdBUAE?hl=tr&gl=TR&ceid=TR%3Atr",
            "https://news.google.com/rss/search?q=spor&hl=tr&gl=TR&ceid=TR:tr"
        };

        private readonly List<string> _searchExtraSources = new List<string>
        {
            "https://www.donanimarsivi.com/feed/",
            "https://www.webtekno.com/rss.xml",
            "https://shiftdelete.net/feed"
        };

        public List<NewsData> GetNews(string topic)
        {
            var allArticles = new List<NewsData>();
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
                var sourceArticles = new List<NewsData>();
                try
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

                    var stream = client.GetStreamAsync(url).Result;
                    using var reader = XmlReader.Create(stream);
                    var feed = SyndicationFeed.Load(reader);
                    string currentSource = GetSourceName(url);

                    foreach (var item in feed.Items)
                    {
                        if (sourceArticles.Count >= 7) break; // Her kaynaktan biraz daha fazla haber alalım

                        var title = item.Title?.Text ?? "Başlık Yok";
                        var link = item.Links.FirstOrDefault()?.Uri.ToString() ?? "";
                        var summaryText = item.Summary?.Text ?? "";

                        // 1. Content:Encoded kısmını çek (Webrazzi ve Log burayı sever)
                        var contentText = "";
                        var contentExtension = item.ElementExtensions.FirstOrDefault(e => e.OuterName == "encoded");
                        if (contentExtension != null)
                        {
                            try { contentText = contentExtension.GetObject<XmlElement>().InnerText; } catch { }
                        }

                        string imageUrl = "";

                        // A - Media Content / Thumbnail Avı
                        var mediaExtensions = item.ElementExtensions.Where(e => e.OuterName == "content" || e.OuterName == "thumbnail");
                        foreach (var ext in mediaExtensions)
                        {
                            try
                            {
                                var xml = ext.GetObject<XmlElement>();
                                var attr = xml.GetAttribute("url");
                                if (!string.IsNullOrEmpty(attr)) { imageUrl = attr; break; }
                            }
                            catch { }
                        }

                        // B - Enclosure Avı
                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            var enclosure = item.Links.FirstOrDefault(l => l.RelationshipType == "enclosure");
                            if (enclosure != null) imageUrl = enclosure.Uri.ToString();
                        }

                        // C - Regex ile HTML İçinden Resim Cımbızlama (Google News ve Webrazzi için en garantisi)
                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            // Hem özette hem de tam içerikte ara
                            var combinedHtml = summaryText + contentText;
                            // Regex'i daha esnek hale getirdik
                            var match = Regex.Match(combinedHtml, @"<img[^>]+src=[""']([^""']+)[""']", RegexOptions.IgnoreCase);
                            if (match.Success)
                            {
                                imageUrl = match.Groups[1].Value;
                                if (imageUrl.StartsWith("//")) imageUrl = "https:" + imageUrl;
                            }
                        }

                        // D - Hiçbir şey bulunamazsa Stok Resim ver (En azından boş kalmasın)
                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            string categoryHint = !string.IsNullOrWhiteSpace(topic) ? topic : title;
                            imageUrl = GetStockImageByCategory(categoryHint);
                        }

                        sourceArticles.Add(new NewsData
                        {
                            Title = title,
                            SourceUrl = link,
                            Description = "AI tarafından özet hazırlanıyor...",
                            PublishedAt = item.PublishDate.UtcDateTime,
                            ImageUrl = imageUrl,
                            Category = currentSource
                        });
                    }
                    allArticles.AddRange(sourceArticles);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Kaynak Hatası ({url}): {ex.Message}");
                }
            }

            return allArticles.OrderByDescending(a => a.PublishedAt).ToList();
        }

        private string GetSourceName(string url)
        {
            if (url.Contains("webtekno")) return "Webtekno";
            if (url.Contains("shiftdelete")) return "ShiftDelete";
            if (url.Contains("webrazzi")) return "Webrazzi";
            if (url.Contains("donanimarsivi")) return "Donanım Arşivi";
            if (url.Contains("log.com.tr")) return "LOG";
            if (url.Contains("google")) return "Google News";
            if (url.Contains("birgun")) return "BirGün";
            return "Genel Haber";
        }

        private string GetStockImageByCategory(string categoryWord)
        {
            var word = (categoryWord ?? "").ToLower();

            if (word.Contains("ekonomi") || word.Contains("dolar") || word.Contains("borsa"))
                return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800";

            if (word.Contains("spor") || word.Contains("maç") || word.Contains("futbol"))
                return "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800";

            if (word.Contains("teknoloji") || word.Contains("apple") || word.Contains("yazılım"))
                return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800";

            return "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800";
        }
    }
}