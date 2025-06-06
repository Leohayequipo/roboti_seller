import pandas as pd
import openai

client = openai.OpenAI(api_key="xx")

def clasificar_fila(fila):
    prompt = f"""
Analizá el siguiente sitio web:

- URL: {fila['url']}
- Email de contacto: {fila['emails']}
- Categoría detectada: {fila['categoria']}

Quiero que respondas:
1. ¿Es realmente un sitio ecommerce? (sí o no)
2. ¿La categoría detectada parece correcta? (sí/no + sugerencia si no)
3. ¿El sitio parece profesional/confiable? (sí/no con justificación)

Respondé en formato JSON con estas claves: "es_ecommerce", "categoria_corregida", "confiabilidad".
    """

    try:
        respuesta = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        contenido = respuesta.choices[0].message.content
        print(f"[✓] GPT respondió para {fila['url']}")
        datos = eval(contenido.strip())
        return pd.Series([
            datos.get('es_ecommerce', ''),
            datos.get('categoria_corregida', ''),
            datos.get('confiabilidad', '')
        ])
    except Exception as e:
        print(f"[❌] Error en {fila['url']}: {e}")
        return pd.Series(['ERROR', 'ERROR', 'ERROR'])

df = pd.read_csv("results/leads_scrape.csv")
df[['es_ecommerce', 'categoria_corregida', 'confiabilidad']] = df.apply(clasificar_fila, axis=1)
df.to_csv("results/leads_clasificados.csv", index=False)
print("✅ Clasificación completada y guardada en results/leads_clasificados.csv")
