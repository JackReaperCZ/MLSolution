namespace RealEstateCrawler;

public static class Dashboard
{
    private static long _writtenBytes;
    private static long _processedItems;

    public static void AddWrittenBytes(int bytes)
    {
        Interlocked.Add(ref _writtenBytes, bytes);
    }

    public static void IncrementProcessedItems()
    {
        Interlocked.Increment(ref _processedItems);
    }
}
