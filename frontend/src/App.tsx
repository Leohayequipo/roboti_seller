import { useState, useEffect } from "react";
import { FaGlobe, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaEnvelope, FaRobot } from "react-icons/fa";

export default function App() {
  const [urls, setUrls] = useState<string>("");
  const [scraping, setScraping] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [mailLoading, setMailLoading] = useState<string | null>(null);

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)" }}>
      <div className="main-container">
        <header className="header" style={{ marginTop: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <FaShoppingCart className="logo-icon" style={{ fontSize: 48, color: "#646cff", background: "#e0e7ff", borderRadius: "50%", padding: 16, boxShadow: "0 2px 8px #646cff22" }} />
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0, color: "#232946", letterSpacing: "-1px" }}>Roboti Seller</h1>
            <p className="subtitle" style={{ color: "#646cff", fontSize: "1.2rem", margin: 0, fontWeight: 500 }}>Scraping & Scoring Inteligente de E-commerce</p>
          </div>
        </header>
        <section className="input-section" style={{ width: "100%", background: "#f5f7fa", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px #646cff11", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <textarea
            rows={6}
            cols={60}
            placeholder="Pegá las URLs acá, una por línea"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="url-textarea"
            style={{ width: "100%", maxWidth: 600, borderRadius: 8, border: "1.5px solid #c7d2fe", padding: 12, fontSize: "1.1rem", marginBottom: 16, boxShadow: "0 1px 4px #646cff11", resize: "vertical", background: "#fff" }}
          />
          <div className="button-row" style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            <button className="main-btn" style={{ background: "linear-gradient(90deg, #646cff 60%, #a5b4fc 100%)", color: "#fff", fontWeight: 700, fontSize: "1.1rem", border: "none", borderRadius: 8, padding: "12px 28px", cursor: "pointer", boxShadow: "0 2px 8px #646cff22", display: "flex", alignItems: "center", gap: 8 }} onClick={handleScrape} disabled={scraping}>
              <span role="img" aria-label="rocket">🚀</span> Iniciar scraping
            </button>
            <button className="main-btn" style={{ background: "linear-gradient(90deg, #22c55e 60%, #a7f3d0 100%)", color: "#fff", fontWeight: 700, fontSize: "1.1rem", border: "none", borderRadius: 8, padding: "12px 28px", cursor: "pointer", boxShadow: "0 2px 8px #22c55e22", display: "flex", alignItems: "center", gap: 8 }} onClick={handleClasificar} disabled={scraping}>
              <span role="img" aria-label="brain">🧠</span> Ejecutar clasificación GPT
            </button>
          </div>
          <p className="message" style={{ color: "#232946", fontSize: "1rem", marginTop: 6, minHeight: 24 }}>{message}</p>
        </section>
        {resultados.length > 0 && (
          <section className="results-section" style={{ marginTop: 18, width: "100%" }}>
            <h2 style={{ color: "#646cff", fontSize: "1.4rem", textAlign: "left", marginBottom: 10, fontWeight: 700 }}>Leads clasificados</h2>
            <div className="table-responsive" style={{ width: "100%", marginLeft: 40, overflowX: "auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #646cff11", paddingBottom: 8 }}>
              <table className="results-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>URL</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>Emails</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>País</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>Categoría</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>E-commerce</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>Cat. corregida</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>Confiabilidad</th>
                    <th style={{ background: "#e0e7ff", color: "#232946", fontWeight: 700, borderBottom: "2px solid #c7d2fe", position: "sticky", top: 0, zIndex: 1, padding: "10px 8px" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((fila, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", transition: "background 0.2s" }}>
                      <td className="url-cell" style={{ wordBreak: "break-all", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fila.url}</td>
                      <td style={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fila.emails}</td>
                      <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 16, padding: "4px 12px", fontSize: "0.98em", fontWeight: 600, background: "#f1f5f9", color: "#4f46e5" }}><FaGlobe style={{ marginRight: 4 }} /> {fila.pais}</span></td>
                      <td><span style={{ display: "inline-block", borderRadius: 16, padding: "4px 12px", fontWeight: 600, background: "#a5b4fc", color: "#232946" }}>{fila.categoria_corregida || fila.categoria}</span></td>
                      <td>
                        {String(fila.es_ecommerce).toLowerCase().startsWith("s") || String(fila.es_ecommerce).toLowerCase().startsWith("y") ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 16, padding: "4px 12px", fontWeight: 600, background: "#34d399", color: "#fff" }}><FaCheckCircle style={{ marginRight: 4 }} /> Sí</span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 16, padding: "4px 12px", fontWeight: 600, background: "#f87171", color: "#fff" }}><FaTimesCircle style={{ marginRight: 4 }} /> No</span>
                        )}
                      </td>
                      <td>{fila.categoria_corregida}</td>
                      <td>
                        <span style={{ display: "inline-block", borderRadius: 16, padding: "4px 12px", fontWeight: 600, background: fila.confiabilidad === 'alta' ? '#34d399' : fila.confiabilidad === 'media' ? '#fbbf24' : '#f87171', color: fila.confiabilidad === 'media' ? '#232946' : '#fff' }}>{fila.confiabilidad}</span>
                      </td>
                      <td>
                        <span style={{ display: "inline-block", borderRadius: 16, padding: "4px 12px", fontWeight: 700, background: fila.score >= 80 ? 'linear-gradient(90deg, #34d399 60%, #a5b4fc 100%)' : fila.score >= 60 ? 'linear-gradient(90deg, #fbbf24 60%, #a5b4fc 100%)' : 'linear-gradient(90deg, #f87171 60%, #a5b4fc 100%)', color: fila.score >= 80 ? '#fff' : fila.score >= 60 ? '#232946' : '#fff', marginRight: 8 }}>{fila.score}</span>
                      </td>
                      <td>
                        <button
                          style={{
                            background: fila.emails ? "#2563eb" : "#cbd5e1",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 12px",
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: fila.emails ? "pointer" : "not-allowed",
                            marginLeft: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: fila.emails ? 1 : 0.5,
                            transition: "background 0.2s"
                          }}
                          disabled={!fila.emails || mailLoading === fila.emails}
                          title={fila.emails ? `Enviar mail a ${fila.emails}` : "Sin email"}
                          onClick={async () => {
                            if (fila.emails) {
                              setMailLoading(fila.emails);
                              try {
                                const res = await fetch("http://localhost:5050/generar_mail", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    empresa: fila.url || "la empresa",
                                    rubro: fila.categoria_corregida || fila.categoria || "su rubro",
                                    uuid: fila.uuid || fila.url?.split("/").pop() || "1234",
                                    email: fila.emails
                                  })
                                });
                                const data = await res.json();
                                if (data.subject && data.body) {
                                  window.location.href = `mailto:${fila.emails}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
                                }
                              } catch (e) {
                                alert("Error generando el mail: " + e);
                              }
                              setMailLoading(null);
                            }
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {mailLoading === fila.emails ? (
                              <span style={{ fontSize: 16, marginRight: 6 }} role="img" aria-label="cargando">⏳</span>
                            ) : null}
                            <FaEnvelope />
                            <FaRobot style={{ marginLeft: "2px" }} />
                            Enviar Mail
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <footer className="footer" style={{ marginTop: 32, textAlign: "center", color: "#888", fontSize: "0.98rem", paddingBottom: 8 }}>Hecho con ❤️ por tu equipo</footer>
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
