from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import csv
import os
import pathlib
import subprocess
# Importamos la función que hace toda la lógica de clasificación
from clasificador import classify_all

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

if __name__ == "__main__":
    app.run(debug=True, port=5050)
