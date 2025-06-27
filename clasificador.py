# clasificador.py
import os
import pathlib
import pandas as pd
import openai
from dotenv import load_dotenv
import json

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def calcular_score(fila):
    score = 50  # base
    # Sube si tiene email
    if fila.get('emails') and str(fila['emails']).strip():
        score += 15
    # Sube si la categoría corregida es "electro" o "tecnología"
    cat = str(fila.get('categoria_corregida', '') or fila.get('categoria', '')).lower()
    if 'electro' in cat or 'tecnolog' in cat:
        score += 15
    # Sube si confiabilidad es alta
    if str(fila.get('confiabilidad', '')).lower() == 'alta':
        score += 10
    # Sube si es ecommerce
    if str(fila.get('es_ecommerce', '')).lower() in ['sí', 'si', 'yes', 'true']:
        score += 10
    # Limita entre 1 y 100
    return max(1, min(score, 100))

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
    # Calcula el score con los datos obtenidos
    fila_dict = fila.to_dict() if hasattr(fila, 'to_dict') else dict(fila)
    fila_dict.update(datos)
    score = calcular_score(fila_dict)
    return pd.Series([
        datos.get("es_ecommerce", ""),
        datos.get("categoria_corregida", ""),
        datos.get("confiabilidad", ""),
        score
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
    # 3) Clasificar (agrega score)
    df[["es_ecommerce","categoria_corregida","confiabilidad","score"]] = df.apply(clasificar_fila, axis=1)
    # 4) Escribir
    df.to_csv(csv_out, index=False)
    # 5) Devolver para JSON
    return df.to_dict(orient="records")

if __name__ == "__main__":
    rows = classify_all()
    print(f"✅ Clasificación lista, {len(rows)} filas escritas.")
