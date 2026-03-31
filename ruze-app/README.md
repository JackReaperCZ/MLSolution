# 🌹 Klasifikátor Růží / Rose Classifier

Webová aplikace pro klasifikaci čtyř druhů divoce rostoucích růží pomocí CNN modelu.

## Druhy / Species
- *Rosa canina* — Růže šípková / Dog Rose
- *Rosa multiflora* — Růže mnohokvětá / Multiflora Rose
- *Rosa rugosa* — Růže svraskalá / Rugosa Rose
- *Rosa woodsii* — Růže Woodsova / Wood's Rose

## Spuštění / Quick Start

### 1. Připravte model / Prepare the model

Zkopírujte soubory modelu z Google Drive do složky `model/`:

```bash
mkdir -p model
cp /cesta/k/ruze_model.keras  model/ruze_model.keras
cp /cesta/k/class_names.json  model/class_names.json
```

Struktura by měla být:
```
ruze-app/
├── model/
│   ├── ruze_model.keras
│   └── class_names.json
├── backend/
├── frontend/
└── docker-compose.yml
```

### 2. Spusťte aplikaci / Launch

```bash
docker compose up --build
```

Aplikace bude dostupná na **http://localhost**

### 3. Zastavení / Stop

```bash
docker compose down
```

## Vývoj bez modelu / Dev without model

Aplikace funguje i bez modelu — backend se spustí v **mock módu** a vrací náhodná data pro testování UI.

## Architektura / Architecture

```
Browser
  └── Nginx :80
        ├── /          → React SPA (built static files)
        └── /api/*     → FastAPI backend :8000
                              └── TensorFlow model
```

## Požadavky / Requirements

- Docker & Docker Compose
- Model: `ruze_model.keras` + `class_names.json` (volitelné / optional)
