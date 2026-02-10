using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;

namespace RealEstateCrawler;

public class RemaxScraper
{
    private static readonly HttpClient _httpClient = new HttpClient();
    private const string BaseUrl = "https://www.remax-czech.cz";

    public static async Task<ListingDetail> ScrapeListingDetail(string url)
    {
        try
        {
            string html = await _httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // 1. Get Property Type and Size logic
            var infoRows = doc.DocumentNode.SelectNodes("//div[contains(@class, 'pd-detail-info__row')]");
            if (infoRows == null) return null;

            string propType = GetValueFromTable(infoRows, "Typ nemovitosti:");
            
            // Filter types
            string[] allowedTypes = { "Domy a vily", "Byty", "Komerční prostory" };
            if (string.IsNullOrEmpty(propType) || !allowedTypes.Contains(propType)) return null;

            string size = null;
            if (propType == "Byty")
                size = GetValueFromTable(infoRows, "Podlahová plocha:");
            else // Domy a vily or Komerční prostory
                size = GetValueFromTable(infoRows, "Užitná plocha:");

            if (string.IsNullOrEmpty(size)) return null;

            // 2. Get Price (Cena)
            var priceNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'pd-table__label') and contains(., 'Cena:')]//following-sibling::div");
            if (priceNode == null) return null;

            // Clean price string (remove spaces, non-breaking spaces, and CZK) to get int
            string priceRaw = Regex.Replace(priceNode.InnerText, @"[^\d]", "");
            if (!int.TryParse(priceRaw, out int priceValue)) return null;

            // 3. Get GPS from map div
            var mapNode = doc.DocumentNode.SelectSingleNode("//div[@id='listingMap']");
            string gpsRaw = mapNode?.GetAttributeValue("data-gps", "");
            if (string.IsNullOrEmpty(gpsRaw) || !gpsRaw.Contains(",")) return null;

            var gpsParts = gpsRaw.Split(',');
            
            return new ListingDetail
            {
                PropertyType = propType,
                Size = size,
                Price = priceValue,
                GpsX = gpsParts[0].Trim(),
                GpsY = gpsParts[1].Trim()
            };
        }
        catch
        {
            return null;
        }
    }

    private static string GetValueFromTable(HtmlNodeCollection rows, string labelText)
    {
        var row = rows.FirstOrDefault(r => 
            r.SelectSingleNode(".//div[contains(@class, 'pd-detail-info__label')]")?.InnerText.Trim() == labelText);
        
        return row?.SelectSingleNode(".//div[contains(@class, 'pd-detail-info__value')]")?.InnerText.Trim();
    }

    public static async Task GetAllListingUrls()
    {
        int currentPage = 1;
        bool hasMoreResults = true;

        // Set a User-Agent to avoid being blocked by basic bot detection
        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        }

        while (hasMoreResults)
        {            
            // Construct the URL for the current page
            string searchUrl = $"{BaseUrl}/reality/vyhledavani/?hledani=1&sale=1&stranka={currentPage}";
            
            try
            {
                string html = await _httpClient.GetStringAsync(searchUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // Select all divs with the specific class
                var items = doc.DocumentNode.SelectNodes("//div[contains(@class, 'pl-items__item')]");

                if (items != null && items.Count > 0)
                {
                    foreach (var item in items)
                    {
                        // Get the data-url attribute value
                        string dataUrl = item.GetAttributeValue("data-url", "");

                        if (!string.IsNullOrEmpty(dataUrl))
                        {
                            // Prepend the base URL to create a full link
                            Program.Listings.Enqueue(BaseUrl + dataUrl);
                        }
                    }
                    currentPage++; // Move to next page
                }
                else
                {
                    // No more items found, exit the loop
                    hasMoreResults = false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error on page {currentPage}: {ex.Message}");
                hasMoreResults = false;
            }
        }
    }
}
