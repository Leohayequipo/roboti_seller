import pandas as pd
import re, tldextract
from langdetect import detect
from playwright.sync_api import sync_playwright
def extract_emails(html):
    raw_emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html)
    # Filtro: descarta imágenes o archivos adjuntos
    return list(set(e for e in raw_emails if not e.lower().endswith(('.png', '.jpg', '.jpeg'))))

def guess_country(url):
    ext = tldextract.extract(url)
    domain = ext.domain
    tld = ext.suffix

    if tld == 'ar':
        return 'Argentina'
    elif tld == 'uy':
        return 'Uruguay'
    elif tld == 'br':
        return 'Brasil'
    elif tld == 'cl':
        return 'Chile'
    elif tld == 'mx':
        return 'México'
    elif '.com' in tld:
        if "woow" in domain:
            return "Uruguay"
        elif "fravega" in domain or "bgh" in domain or "cetrogar" in domain:
            return "Argentina"
        else:
            return "Desconocido"
    else:
        return 'Desconocido'
def guess_country(url):
    ext = tldextract.extract(url)
    tld = ext.suffix
    if tld == 'ar':
        return 'Argentina'
    elif tld == 'br':
        return 'Brasil'
    elif tld == 'mx':
        return 'México'
    else:
        return 'Desconocido'

def guess_category(text):
    categorias = {
        'electro': ['televisor', 'heladera', 'lavarropas', 'microondas'],
        'muebles': ['silla', 'sofá', 'mesa', 'almohadón'],
        'moda': ['camisa', 'pantalón', 'ropa', 'zapato'],
        'deportes': ['bicicleta', 'pelota', 'zapatilla', 'fitness'],
    }
    text = text.lower()
    for cat, keywords in categorias.items():
        if any(k in text for k in keywords):
            return cat
    return 'otro'

def main():
    urls = [line.strip() for line in open("urls.txt") if line.strip()]
    data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for url in urls:
            try:
                print(f"Scrapeando: {url}")
                page = browser.new_page()
                page.goto(url, timeout=60000)
                page_content = page.content()
                email_list = extract_emails(page_content)
                text = page.inner_text("body")
                pais = guess_country(url)
                categoria = guess_category(text)

                data.append({
                    'url': url,
                    'emails': ', '.join(email_list),
                    'pais': pais,
                    'categoria': categoria
                })

            except Exception as e:
                print(f"❌ Error en {url}: {e}")
            finally:
                page.close()

        browser.close()

    df = pd.DataFrame(data)
    df.to_csv("results/leads_scrape.csv", index=False)
    print("✅ Scraping terminado. Archivo guardado en results/leads_scrape.csv")

if __name__ == "__main__":
    main()
