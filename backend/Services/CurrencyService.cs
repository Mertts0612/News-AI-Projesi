using System.Xml;
using newsai_webapi.Models;
using System.Net;

namespace newsai_webapi.Services
{
    public class CurrencyService
    {
        public List<CurrencyData> GetLiveCurrencies()
        {
            var list = new List<CurrencyData>();
            try
            {
                string url = "https://www.tcmb.gov.tr/kurlar/today.xml";

                var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                var xmlData = client.GetStringAsync(url).Result;

                var doc = new XmlDocument();
                doc.LoadXml(xmlData);

                // DOLAR
                var usdNode = doc.SelectSingleNode("//Currency[@CurrencyCode='USD']");
                if (usdNode != null)
                    list.Add(new CurrencyData { Name = "USD", Price = usdNode["ForexSelling"]?.InnerText.Replace(".", ",") ?? "0,00" });

                // EURO
                var eurNode = doc.SelectSingleNode("//Currency[@CurrencyCode='EUR']");
                if (eurNode != null)
                    list.Add(new CurrencyData { Name = "EUR", Price = eurNode["ForexSelling"]?.InnerText.Replace(".", ",") ?? "0,00" });

            }
            catch (Exception ex)
            {
                Console.WriteLine("Hata: " + ex.Message);
            }
            return list;
        }
    }
}