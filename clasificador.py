# clasificador.py
import os
import pathlib
import pandas as pd
import openai
from dotenv import load_dotenv
import json

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clasificar_fila(fila):
    prompt = f"""
Analizá el siguiente sitio web:
- URL: {fila['url']}
- Email de contacto: {fila['emails'] if pd.notnull(fila['emails']) else ''}
- Categoría detectada: {fila['categoria']}

Responde en JSON con:
  "es_ecommerce": "sí" o "no"
  "categoria_corregida": texto
  "confiabilidad": texto
"""
    resp = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    content = resp.choices[0].message.content.strip()
    try:
        datos = json.loads(content)
    except Exception as e:
        print(f"❌ Error parseando JSON de OpenAI: {e}\nRespuesta: {content}")
        datos = {"es_ecommerce": "", "categoria_corregida": "", "confiabilidad": ""}
    return pd.Series([
        datos.get("es_ecommerce", ""),
        datos.get("categoria_corregida", ""),
        datos.get("confiabilidad", "")
    ])

def classify_all():
    # 1) Ruta absoluta a tu CSV de scraping
    root = pathlib.Path(__file__).parent.resolve()
    csv_in = root / "results" / "leads_scrape.csv"
    csv_out = root / "results" / "leads_clasificados.csv"

    # 2) Leer
    df = pd.read_csv(csv_in)
    # Reemplaza NaN por string vacío en todas las columnas relevantes
    df = df.fillna("")
    # 3) Clasificar
    df[["es_ecommerce","categoria_corregida","confiabilidad"]] = df.apply(clasificar_fila, axis=1)
    # 4) Escribir
    df.to_csv(csv_out, index=False)
    # 5) Devolver para JSON
    return df.to_dict(orient="records")

if __name__ == "__main__":
    rows = classify_all()
    print(f"✅ Clasificación lista, {len(rows)} filas escritas.")
