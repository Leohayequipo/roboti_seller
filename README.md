# 🤖 Roboti Seller – Scraping Inteligente de E-commerce

Este proyecto automatiza el scraping de tiendas online (como las de la plataforma VTEX), extrae datos clave y los guarda en un archivo CSV para clasificación y prospección posterior.

---

## 🚀 ¿Qué hace?

Por cada URL de tienda, el script:

- Extrae el país (basado en el dominio)
- Busca emails públicos de contacto
- Detecta categoría del ecommerce (electro, muebles, etc.)
- Guarda todo en `results/leads_scrape.csv`

---

## 🧰 Tecnologías usadas

- Python 3.8+
- Playwright (navegador headless)
- Pandas
- tldextract
- langdetect

---

## 📦 Instalación

1. Cloná o copiá el proyecto en tu PC

2. (Opcional pero recomendado) Activá un entorno virtual:

```bash
python -m venv venv
venv\Scripts\activate

```

---

## 🏁 Cómo poner en marcha el proyecto

### 1. Backend (Python)

1. Abre una terminal y navega a la carpeta del backend:
   ```sh
   cd roboti_seller
   ```
2. Instala las dependencias:
   ```sh
   pip install -r requirements.txt
   ```
3. Ejecuta la app (ajusta si usas Flask, FastAPI, etc.):
   ```sh
   python app.py
   ```

### 2. Frontend (React)

1. Abre otra terminal y navega a la carpeta del frontend:
   ```sh
   cd roboti_seller/frontend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

### 3. Acceso
- El backend suele correr en `http://localhost:5000` (o el puerto que indique tu app).
- El frontend suele correr en `http://localhost:5173` (o el puerto que indique Vite).

¡Listo! Así puedes poner en marcha el proyecto completo (backend + frontend).
