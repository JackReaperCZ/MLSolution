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
  - The file data.jsonl is created/updated in the repository root: .\MLSolution\data.jsonl
- Stop:
  - Press Ctrl+C in the terminal.

Data Format (JSON Lines)
- Each line is a JSON object with these fields:
  - propertyType (string) — e.g., "Byty", "Domy a vily", "Komerční prostory"
  - size (string) — e.g., "83 m²", "2 750 m²"
  - price (number) — integer price in CZK
  - gpsX (string) — latitude in DMS format (e.g., 50°06'55"N)
  - gpsY (string) — longitude in DMS format (e.g., 14°17'19.2"E)

Train a Model in Google Colab
- Location of the notebook in this repo:
  - notebooks/RealEstatePriceTraining.ipynb
- Typical workflow:
  1) Generate data.jsonl by running the crawler.
  2) Open the notebook in [Google Colab](https://colab.research.google.com/drive/1gQptk3-6Ylbt-ah7wriahKsvOZ6lwyU6?usp=sharing) or upload the file to your Drive and open from there.
  3) Run all cells to:
     - Load and clean the dataset (parses m², converts GPS DMS to decimals)
     - Train a baseline RandomForest model to predict price
     - Report RMSE and R²