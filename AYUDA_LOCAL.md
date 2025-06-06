# 🛠 AYUDA LOCAL – Roboti Seller

Guía rápida para instalar y ejecutar el flujo completo: scraping + clasificación GPT.

---

## ✅ Requisitos previos

- Python 3.8 o superior
- Git
- Tener una cuenta en OpenAI y tu `API_KEY`
- Conexión a internet (Playwright necesita cargar páginas en vivo)

---

## 📦 Instalación inicial

1. Cloná el repositorio:

```bash
git clone https://github.com/tuusuario/roboti_seller.git
cd roboti_seller

2. Instalá las dependencias:
bash
Copiar
Editar
pip install -r requirements.txt
python -m playwright install
pip install python-dotenv


🔐 Configuración de API
1. Creá un archivo .env en la raíz del proyecto:
ini
Copiar
Editar
OPENAI_API_KEY=sk-tu-clave-real-aquí

📁 Estructura esperada del proyecto
bash
Copiar
Editar
roboti_seller/
├── urls.txt
├── scrape.py
├── clasificador.py
├── requirements.txt
├── .env
├── AYUDA_LOCAL.md
└── results/
    ├── leads_scrape.csv
    └── leads_clasificados.csv


🔍 1. Scraping
Pegá las URLs de tiendas e-commerce en urls.txt (una por línea).

Ejecutá el script:

bash
Copiar
Editar
python scrape.py

🤖 2. Clasificación con GPT
Asegurate de tener tu API Key en el .env.

Ejecutá el clasificador:

bash
Copiar
Editar
python clasificador.py
Esto genera results/leads_clasificados.csv con los campos:

es_ecommerce

categoria_corregida

confiabilidad

✅ Checklist final
 Proyecto clonado

 Dependencias instaladas

 Archivo .env con tu clave API

 URLs cargadas en urls.txt

 Scraping ejecutado (scrape.py)

 Clasificación ejecutada (clasificador.py)

