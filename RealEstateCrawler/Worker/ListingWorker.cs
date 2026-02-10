using RealEstateCrawler;
namespace RealEstateCrawler.Worker;

public static class ListingWorker
{
    public static async Task RunAsync()
    {
        await RemaxScraper.GetAllListingUrls();
    }
}
