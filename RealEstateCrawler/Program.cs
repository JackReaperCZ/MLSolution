using System.Collections.Concurrent;
using RealEstateCrawler.Worker;

namespace RealEstateCrawler;

class Program
{
    public static ConcurrentQueue<string> Listings = new ConcurrentQueue<string>();
    public static ConcurrentQueue<ListingDetail> Results = new ConcurrentQueue<ListingDetail>();

    
    public static async Task Main()
    {
        ListingWorker.RunAsync();
        for(int i = 0; i < 10; i++)
        {
            DetailWorker.RunAsync();
        }
        Storage.Init();
    }
}
