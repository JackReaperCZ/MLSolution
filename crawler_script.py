import requests
import os
import time

RUZE_KE_STAZENI = [
    {"id": 78882, "name": "Rosa_multiflora"},
    {"id": 83653, "name": "Rosa_rugosa"},
    {"id": 55884, "name": "Rosa_canina"},
    {"id": 78887, "name": "Rosa_woodsii"}
]

LIMIT_NA_DRUH = 500 

def download_images(taxon_id, save_dir, folder_name, params, current_count):
    api_url = "https://api.inaturalist.org/v1/observations"
    try:
        response = requests.get(api_url, params=params, timeout=15)
        data = response.json()
        observations = data.get("results", [])
        
        for obs in observations:
            if current_count >= LIMIT_NA_DRUH: break
            for photo in obs.get("photos", []):
                if current_count >= LIMIT_NA_DRUH: break
                
                # Získání URL a kontrola, zda už ji nemáme (prevence duplicit)
                img_url = photo["url"].replace("square", "medium")
                try:
                    img_data = requests.get(img_url, timeout=10).content
                    file_path = os.path.join(save_dir, f"{folder_name}_{current_count:03d}.jpg")
                    with open(file_path, "wb") as f:
                        f.write(img_data)
                    current_count += 1
                except: continue
            time.sleep(0.1)
    except Exception as e:
        print(f"      Chyba při stahování vlny: {e}")
    
    return current_count

def download_dataset():
    base_path = "dataset_ruze"
    
    for r in RUZE_KE_STAZENI:
        taxon_id = r["id"]
        folder_name = r["name"]
        save_dir = os.path.join(base_path, folder_name)
        if not os.path.exists(save_dir): os.makedirs(save_dir)
            
        print(f"\n>>> Zpracovávám: {folder_name}")
        count = 0

        # VLNA 1
        print("  Vlna 1: Hledám kvetoucí kusy...")
        params1 = {
            "taxon_id": taxon_id, "quality_grade": "research", 
            "photos": "true", "term_id": 12, "term_value_id": 13, "per_page": 100
        }
        count = download_images(taxon_id, save_dir, folder_name, params1, count)

        # VLNA 2
        if count < LIMIT_NA_DRUH:
            print(f"  Vlna 2: Nedostatek dat ({count}/{LIMIT_NA_DRUH}), hledám letní fotky...")
            params2 = {
                "taxon_id": taxon_id, "quality_grade": "research", 
                "photos": "true", "month": "6,7,8", "per_page": 100
            }
            count = download_images(taxon_id, save_dir, folder_name, params2, count)

        # VLNA 3: ZBYTEK
        if count < LIMIT_NA_DRUH:
            print(f"  Vlna 3: Stále málo dat ({count}/{LIMIT_NA_DRUH}), beru vše ověřené...")
            params3 = {
                "taxon_id": taxon_id, "quality_grade": "research", 
                "photos": "true", "per_page": 100
            }
            count = download_images(taxon_id, save_dir, folder_name, params3, count)

        print(f"--- Dokončeno: {folder_name} | Celkem staženo: {count} ---")

if __name__ == "__main__":
    download_dataset()