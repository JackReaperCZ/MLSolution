# Růže CNN Clasificace

Tento projekt pokrývá kompletní pipeline pro klasifikaci čtyř druhů růží: sběr dat z iNaturalist, trénink modelu v Google Colab a nasazení webové aplikace pomocí Docker Compose.

## Přehled
- Sběr dat: [crawler_script.py](https://github.com/JackReaperCZ/MLSolution/blob/main/crawler_script.py) stáhne ověřené fotografie z iNaturalist do adresářové struktury `dataset_ruze/<třída>`.
- Trénink: [colab_ruze_classifier.ipynb](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb) trénuje CNN v Google Colab na datasetu nahraném na Google Drive a uloží model do `MyDrive/ruze_model`.
- Aplikace: [ruze-app](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app) obsahuje frontend (React) a backend (FastAPI) s docker-compose nasazením. Backend načítá uložený model a poskytuje REST API.

---

## 1) Sběr dat (iNaturalist)
- Umístění: [crawler_script.py](https://github.com/JackReaperCZ/MLSolution/blob/main/crawler_script.py)
- Konfigurovatelné druhy: pole `RUZE_KE_STAZENI` s taxon ID iNaturalist
- Limit na druh: `LIMIT_NA_DRUH = 500`
- Tři vlny dotazů:
  - Vlna 1: kvetoucí kusy (term_id=12, term_value_id=13) [crawler_script.py:L54-L59](https://github.com/JackReaperCZ/MLSolution/blob/main/crawler_script.py#L54-L59)
  - Vlna 2: letní měsíce (6–8) [crawler_script.py:L62-L68](https://github.com/JackReaperCZ/MLSolution/blob/main/crawler_script.py#L62-L68)
  - Vlna 3: vše ověřené [crawler_script.py:L71-L77](https://github.com/JackReaperCZ/MLSolution/blob/main/crawler_script.py#L71-L77)

### Jak spustit
```bash
# v lokálním prostředí (Windows PowerShell / Python 3.11+)
python ..\MLSolution\crawler_script.py
```
Po dokončení vznikne složka `dataset_ruze` se strukturou:
```
dataset_ruze/
  Rosa_multiflora/
  Rosa_rugosa/
  Rosa_canina/
  Rosa_woodsii/
```

---

## 2) Trénink v Google Colab
- Notebook: [colab_ruze_classifier.ipynb](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb)
- Vstupní dataset: nahrajte lokální `dataset_ruze` na Google Drive do `MyDrive/dataset_ruze`
- Pipeline:
  - Načtení cest k souborům do DataFrame a stratifikovaný split Train/Val/Test [colab_ruze_classifier.ipynb:L75-L88](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb#L75-L88)
  - ImageDataGenerator s rescale a augmentací pro trénink [colab_ruze_classifier.ipynb:L90-L107](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb#L90-L107)
  - CNN (Conv2D+MaxPool bloky, Dense, Dropout) [colab_ruze_classifier.ipynb:L125-L141](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb#L125-L141)
  - Callbacky: EarlyStopping, ReduceLROnPlateau, ModelCheckpoint [colab_ruze_classifier.ipynb:L145-L151](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb#L145-L151)
  - Vyhodnocení na testu a uložení modelu [colab_ruze_classifier.ipynb:L169-L181](https://github.com/JackReaperCZ/MLSolution/blob/main/colab_ruze_classifier.ipynb#L169-L181)

### Postup v Colabu
1. Otevřete https://colab.research.google.com a nahrajte notebook.
2. Spusťte buňky pro připojení Drive a konfiguraci.
3. Ujistěte se, že dataset je v `MyDrive/dataset_ruze`.
4. Spusťte trénink; nejlepší váhy se uloží automaticky.

### Výstupy (na Drive)
- Model: `MyDrive/ruze_model/ruze_model.keras`
- Třídy: `MyDrive/ruze_model/class_names.json`

---

## 3) Nasazení webové aplikace (ruze-app)
- Kořen: [ruze-app](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app)
- Backend (FastAPI): [main.py](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/main.py)
  - Načítá model z `/app/model/ruze_model.keras` a třídy z `/app/model/class_names.json` [main.py:L25-L40](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/main.py#L25-L40)
  - Endpointy:
    - `GET /health` — stav služby a modelu [main.py:L50-L53](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/main.py#L50-L53)
    - `POST /classify` — přijme obrázek a vrátí pravděpodobnosti tříd [main.py:L54-L78](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/main.py#L54-L78)
  - Závislosti: [requirements.txt](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/requirements.txt) (tensorflow-cpu, fastapi, Pillow, numpy…)
- Frontend (React + Vite): [frontend](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/frontend)
  - Upload obrázku a volání `/api/classify` přes nginx proxy [App.jsx](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/frontend/src/App.jsx)
  - Nginx šablona s proxy na backend: [nginx.conf](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/frontend/nginx.conf)
- Docker Compose: [docker-compose.yml](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/docker-compose.yml)
  - Backend mountuje model ze složky `./model` (read‑only)
  - Frontend build s proměnnou BACKEND_PORT předaná do nginx

### Příprava modelu pro aplikaci
Zkopírujte z Drive do projektu:
```
..\MLSolution\ruze-app\model\
  ruze_model.keras
  class_names.json
```

---

## 4) Spuštění s Docker Compose
1. Vytvořte `.env` z [.env.example](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/.env.example) a případně upravte porty:
   ```
   FRONTEND_PORT=80
   BACKEND_PORT=8000
   ```
2. Otevřete terminál ve složce `ruze-app`:
   ```bash
   cd ..\MLSolution\ruze-app
   docker compose up -d --build
   ```
3. Ověřte běh backendu:
   - `http://localhost:8000/health` (změňte podle BACKEND_PORT)
4. Otevřete frontend:
   - `http://localhost/` (nebo `http://localhost:<FRONTEND_PORT>`)

Pozn.: Pokud model není přítomen, backend běží v „mock“ režimu a vrací náhodné pravděpodobnosti (užitečné pro vývoj UI) [main.py:L64-L71](https://github.com/JackReaperCZ/MLSolution/tree/main/ruze-app/backend/main.py#L64-L71).

---

## 5) Aktualizace modelu
1. Přetrénujte v Colabu; vznikne nový `ruze_model.keras` a `class_names.json`.
2. Nahraďte soubory v `ruze-app/model/`.
3. Restartujte backend kontejner:
   ```bash
   docker compose restart backend
   ```

---

## 6) Struktura projektu
```
MLSolution/
  crawler_script.py            # iNaturalist downloader (dataset_ruze)
  colab_ruze_classifier.ipynb  # trénink CNN v Colabu (Google Drive)
  ruze-app/
    backend/                   # FastAPI + TensorFlow CPU
    frontend/                  # React + Vite + nginx
    model/                     # uložený model a třídy pro nasazení
    docker-compose.yml         # orchestrace FE/BE
    .env.example               # porty
```

---

## Požadavky
- Google účet (Drive, Colab)
- Docker a Docker Compose
- Python 3.11+ (pro `crawler_script.py`)
- Node.js 20+ (pro frontend build, pokud nevyužijete Docker build)

---

## Tipy a řešení problémů
- Backend nevidí model: ověřte cestu `ruze-app/model/ruze_model.keras` a `class_names.json`, mount `./model:/app/model:ro` je v docker-compose.yml.
- Chyba při klasifikaci obrázku: zkontrolujte, že obrázek má podporovaný typ (JPG/PNG/WEBP) a maximální velikost (viz nginx `client_max_body_size`).
- Rozdílné porty: upravte `.env` a restartujte Compose.
