using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;

namespace RealEstateCrawler;

public class Storage
{
    private static bool _running = false;
    
    public static void Init()
    {
        _running = true;
        Thread t = new Thread(Loop);
        t.Start();
    }

    private static void Loop()
    {
        try
        {
            string filePath = "data.jsonl";
            using (var f = File.Open(filePath, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read)) { }
            
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
            
            using (StreamWriter writer = new StreamWriter(filePath, append: true))
            {
                while (_running)
                {
                    if (Program.Results.TryDequeue(out ListingDetail? detail))
                    {
                        if (detail == null) continue;
                        
                        string jsonLine = JsonSerializer.Serialize(detail, options);
                        writer.WriteLine(jsonLine);
                        writer.Flush();
                        var bytes = Encoding.UTF8.GetByteCount(jsonLine + Environment.NewLine);
                        Dashboard.AddWrittenBytes(bytes);
                        Dashboard.IncrementProcessedItems();
                    }
                    else
                    {
                        Thread.Sleep(100);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Storage Error: {ex}");
        }
    }
}