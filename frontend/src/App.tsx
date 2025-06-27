import { useState, useEffect } from "react";
import { FaGlobe, FaShoppingCart, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

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
    <div className="app-bg">
      <div className="main-container">
        <header className="header">
          <FaShoppingCart className="logo-icon" />
          <div>
            <h1>Roboti Seller</h1>
            <p className="subtitle">Scraping & Scoring Inteligente de E-commerce</p>
          </div>
        </header>
        <section className="input-section">
          <textarea
            rows={8}
            cols={60}
            placeholder="Pegá las URLs acá, una por línea"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="url-textarea"
          />
          <div className="button-row">
            <button className="main-btn" onClick={handleScrape} disabled={scraping}>
              {scraping ? "Ejecutando scraping..." : "Iniciar scraping"}
            </button>
            <button className="main-btn" onClick={handleClasificar} disabled={scraping}>
              {scraping ? "Clasificando..." : "Ejecutar clasificación GPT"}
            </button>
          </div>
          <p className="message">{message}</p>
        </section>
        {resultados.length > 0 && (
          <section className="results-section">
            <h2>Leads clasificados</h2>
            <div className="table-responsive">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Emails</th>
                    <th>País</th>
                    <th>Categoría</th>
                    <th>E-commerce</th>
                    <th>Cat. corregida</th>
                    <th>Confiabilidad</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((fila, i) => (
                    <tr key={i}>
                      <td className="url-cell">{fila.url}</td>
                      <td>{fila.emails}</td>
                      <td><span className="badge badge-country"><FaGlobe /> {fila.pais}</span></td>
                      <td><span className={`badge badge-cat badge-cat-${(fila.categoria_corregida || fila.categoria || '').toLowerCase()}`}>{fila.categoria_corregida || fila.categoria}</span></td>
                      <td>
                        {String(fila.es_ecommerce).toLowerCase().startsWith("s") || String(fila.es_ecommerce).toLowerCase().startsWith("y") ? (
                          <span className="badge badge-yes"><FaCheckCircle /> Sí</span>
                        ) : (
                          <span className="badge badge-no"><FaTimesCircle /> No</span>
                        )}
                      </td>
                      <td>{fila.categoria_corregida}</td>
                      <td>
                        <span className={`badge badge-conf badge-conf-${(fila.confiabilidad || '').toLowerCase()}`}>{fila.confiabilidad}</span>
                      </td>
                      <td>
                        <span className={`badge badge-score badge-score-${getScoreColor(fila.score)}`}>{fila.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <footer className="footer">Hecho con ❤️ por tu equipo</footer>
      </div>
    </div>
  );
}

// Helper para color de score
function getScoreColor(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}
