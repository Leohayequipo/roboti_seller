import { useState, useEffect } from "react";

export default function App() {
  const [urls, setUrls] = useState<string>("");
  const [scraping, setScraping] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [resultados, setResultados] = useState<any[]>([]);

  // 1. Función para recargar la tabla de resultados
  const fetchResultados = async () => {
    try {
      const res = await fetch("http://localhost:5050/resultados");
      const data = await res.json();
      if (!data.error) setResultados(data);
    } catch (err) {
      console.error("Fetch resultados:", err);
    }
  };

  // 2. La ejecutamos al montar el componente
  useEffect(() => {
    fetchResultados();
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    setMessage("Ejecutando scraping...");
    try {
      const res = await fetch("http://localhost:5050/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urls.split("\n") }),
      });
      const data = await res.json();
      setMessage(data.message || "Scraping finalizado");
      // Opcional: recarga también luego de scrape si lo deseas
      // await fetchResultados();
    } catch (error) {
      console.error(error);
      setMessage("Error al ejecutar el scraping");
    }
    setScraping(false);
  };

  const handleClasificar = async () => {
    setScraping(true);
    setMessage("Ejecutando clasificación...");
    try {
      const res = await fetch("http://localhost:5050/clasificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      // Primero parseamos JSON
      const data = await res.json();
  
      // Si el server devolvió un status >= 400
      if (!res.ok) {
        // data.error vendrá de tu jsonify({error:…},500)
        throw new Error(data.error || "Error desconocido en clasificación");
      }
  
      // Si todo está OK, reemplazamos el mensaje
      setMessage(data.message);
  
      // Y recargamos la tabla con los datos frescos
      await fetchResultados();
    } catch (err: any) {
      console.error("handleClasificar:", err);
      // Si el error viene con mensaje, lo mostramos
      setMessage(err.message || "Error al ejecutar la clasificación");
    } finally {
      setScraping(false);
    }
  };
  

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Roboti Seller – Scraping Inteligente</h1>
      <textarea
        rows={10}
        cols={60}
        placeholder="Pegá las URLs acá, una por línea"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
      />
      <br />
      <button onClick={handleScrape} disabled={scraping}>
        {scraping ? "Ejecutando scraping..." : "Iniciar scraping"}
      </button>
      <button onClick={handleClasificar} disabled={scraping} style={{ marginLeft: "1rem" }}>
        {scraping ? "Clasificando..." : "Ejecutar clasificación GPT"}
      </button>
      <p>{message}</p>

      {resultados.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Leads clasificados</h2>
          <table border={1} cellPadding={8} style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>URL</th>
                <th>Emails</th>
                <th>País</th>
                <th>Categoría</th>
                <th>E-commerce</th>
                <th>Cat. corregida</th>
                <th>Confiabilidad</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((fila, i) => (
                <tr key={i}>
                  <td>{fila.url}</td>
                  <td>{fila.emails}</td>
                  <td>{fila.pais}</td>
                  <td>{fila.categoria}</td>
                  <td>{fila.es_ecommerce}</td>
                  <td>{fila.categoria_corregida}</td>
                  <td>{fila.confiabilidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
