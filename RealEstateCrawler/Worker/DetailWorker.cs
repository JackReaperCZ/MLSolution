using RealEstateCrawler;
namespace RealEstateCrawler.Worker;

public static class DetailWorker
{
    public static async Task RunAsync()
    {
        while (true)
        {
            if (Program.Listings.TryDequeue(out string listingUrl))
            {
                var detail = await RemaxScraper.ScrapeListingDetail(listingUrl);
                if (detail != null)
                {
                    Program.Results.Enqueue(detail);
                }
            }
            else
            {
                await Task.Delay(1000);
            }
        }
    }
}
