from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import csv
import os
import pathlib
import subprocess
# Importamos la función que hace toda la lógica de clasificación
from clasificador import classify_all
import openai

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return """
    <h1>Roboti Seller Backend</h1>
    <p>Servidor Flask corriendo correctamente.</p>
    <p>Este backend debe ser consumido desde el frontend React.</p>
    """

@app.route("/scrape", methods=["POST"])
def scrape():
    data = request.get_json()
    urls = data.get("urls", [])

    try:
        # Guardar URLs en urls.txt
        with open("urls.txt", "w", encoding="utf-8") as f:
            for url in urls:
                f.write(url.strip() + "\n")

        # Ejecutar el script de scraping
        result = subprocess.run(
            ["python", "scrape.py"],
            cwd=str(pathlib.Path(__file__).parent.resolve()),
            capture_output=True,
            text=True
        )

        return jsonify({
            "message": "Scraping ejecutado correctamente.",
            "output": result.stdout
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clasificar", methods=["POST"])
def clasificar():
    try:
        # Llamamos directamente a la función que lee, clasifica y escribe el CSV
        rows = classify_all()
        return jsonify({
            "message": "Clasificación ejecutada correctamente.",
            "data": rows
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/resultados", methods=["GET"])
def resultados():
    try:
        # Devolver el CSV como JSON (para la tabla)
        csv_path = pathlib.Path(__file__).parent / "results" / "leads_clasificados.csv"
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            datos = list(reader)
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download", methods=["GET"])
def download():
    try:
        # Permitir descargar el CSV completo
        csv_path = pathlib.Path(__file__).parent / "results" / "leads_clasificados.csv"
        return send_file(
            csv_path,
            mimetype="text/csv",
            as_attachment=True,
            download_name="leads_clasificados.csv"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generar_mail", methods=["POST"])
def generar_mail():
    data = request.get_json()
    empresa = data.get("empresa", "la empresa")
    rubro = data.get("rubro", "su rubro")
    uuid = data.get("uuid", "1234")
    email = data.get("email", "")
    prompt = f"""
Redactá un correo para {empresa}, dedicada a {rubro}, donde les contamos que ofrecemos una herramienta de analítica avanzada con IA. Invitarlos a charlar con nuestro asesor virtual para entender sus necesidades.

Incluí en el cuerpo algo como:
<p>Podés iniciar una charla con nuestro asesor inteligente acá:</p>
<a href=\"https://roboti.miempresa.com/chat/{uuid}\" target=\"_blank\">Chatear con Roboti</a>
"""
    try:
        resp = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY")).chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        content = resp.choices[0].message.content.strip()
        # Asunto sugerido
        subject = f"¡Conocé nuestra herramienta de IA para {empresa}!"
        return jsonify({"subject": subject, "body": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)
