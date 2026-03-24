RealEstateCrawler

Overview
- Scrapes property listings from remax-czech.cz and saves structured results to JSON Lines.
- Output file: data.jsonl in the repository root (one JSON object per line).
- Includes a Colab notebook for training a baseline price model from the scraped data.

Prerequisites
- .NET 8 SDK installed and on PATH.
- Internet access to crawl the target site.

Run the Crawler
- Build:
  - dotnet build .\RealEstateCrawler\RealEstateCrawler.csproj -v minimal
- Run:
  - dotnet run --project .\RealEstateCrawler\RealEstateCrawler.csproj
- Output:
  - The file data.jsonl is created/updated in the repository root: C:\Users\domca\Documents\MLSolution\data.jsonl
- Stop:
  - Press Ctrl+C in the terminal.

Data Format (JSON Lines)
- Each line is a JSON object with these fields:
  - propertyType (string) — e.g., "Byty", "Domy a vily", "Komerční prostory"
  - size (string) — e.g., "83 m²", "2 750 m²"
  - price (number) — integer price in CZK
  - gpsX (string) — latitude in DMS format (e.g., 50°06'55"N)
  - gpsY (string) — longitude in DMS format (e.g., 14°17'19.2"E)

Key Source Files
- Program entry point: [Program.cs](file:///c:/Users/domca/Documents/MLSolution/RealEstateCrawler/Program.cs)
- Scraper: [RemaxScraper.cs](file:///c:/Users/domca/Documents/MLSolution/RealEstateCrawler/RemaxScraper.cs)
- Workers: [ListingWorker.cs](file:///c:/Users/domca/Documents/MLSolution/RealEstateCrawler/Worker/ListingWorker.cs), [DetailWorker.cs](file:///c:/Users/domca/Documents/MLSolution/RealEstateCrawler/Worker/DetailWorker.cs)
- Storage (writer): [Storage.cs](file:///c:/Users/domca/Documents/MLSolution/RealEstateCrawler/Storage.cs)

Train a Model in Google Colab
- Location of the notebook in this repo:
  - notebooks/RealEstatePriceTraining.ipynb
- Typical workflow:
  1) Generate data.jsonl by running the crawler.
  2) Open the notebook in Google Colab (File → Upload notebook) or upload the file to your Drive and open from there.
  3) Provide the data file to Colab using one of these options:
     - Upload data.jsonl directly into Colab’s /content
     - Mount Google Drive and place data.jsonl in /MyDrive
  4) Run all cells to:
     - Load and clean the dataset (parses m², converts GPS DMS to decimals)
     - Train a baseline RandomForest model to predict price
     - Report RMSE and R²
     - Save the trained model artifact (model.joblib) to /content or Drive

Notes
- The crawler is I/O bound and uses multiple workers; it continues running while new items are processed and written.
- The notebook accepts either data.jsonl (preferred) or a JSON array file named data.json.

