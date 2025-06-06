# 🤖 Roboti Seller – Scraping Inteligente de E-commerce

Este proyecto automatiza el scraping de tiendas online (ej: VTEX), extrae datos clave y los guarda en un archivo CSV listo para clasificación y prospección.

---

## 🚀 ¿Qué hace?

Por cada URL de tienda, el script:
- Extrae el país (por dominio)
- Busca mails públicos de contacto
- Detecta categoría del ecommerce (ej: electro, muebles, etc.)
- Guarda todo en `results/leads_scrape.csv`

---

## 🧰 Tecnologías usadas

- 🐍 Python 3.8+
- 🎭 Playwright (headless browser)
- 📊 Pandas
- 🌍 tldextract
- 🧠 langdetect

---

## 📦 Instalación

1. Cloná o copiá el proyecto en tu PC

2. (Opcional pero recomendado) Activá un entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate
