import { useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import CVRenderer from "../components/CVRenderer";
import { parseYaml } from "../utils/parseYaml";
import sampleYaml from "../utils/sampleYaml";

const exportAsPdf = async (element) => {
  const options = {
    margin: [0, 0, 0, 0],
    filename: "cv.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    // "avoid-all" creates large blank spaces for long CVs.
    pagebreak: { mode: ["css", "legacy"] }
  };

  await html2pdf().set(options).from(element).save();
};

const App = () => {
  const [yamlText, setYamlText] = useState(sampleYaml);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const { parsedData, error } = useMemo(() => {
    try {
      const data = parseYaml(yamlText);
      return { parsedData: data, error: "" };
    } catch (e) {
      return { parsedData: null, error: e.message };
    }
  }, [yamlText]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setYamlText(content);
  };

  const handleDownload = async () => {
    if (!previewRef.current || !parsedData) return;
    setIsExporting(true);
    try {
      await exportAsPdf(previewRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="app-shell">
      <aside className="editor-panel">
        <div className="panel-header">
          <h2>YAML Editor</h2>
          <label className="upload-label">
            Upload YAML
            <input type="file" accept=".yaml,.yml,text/yaml" onChange={handleFileUpload} />
          </label>
        </div>
        <textarea
          value={yamlText}
          onChange={(event) => setYamlText(event.target.value)}
          spellCheck={false}
          className="yaml-textarea"
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button className="download-btn" onClick={handleDownload} disabled={!parsedData || isExporting}>
          {isExporting ? "Generating PDF..." : "Download PDF"}
        </button>
      </aside>

      <section className="preview-panel">
        <div className="preview-canvas" ref={previewRef}>
          {parsedData ? <CVRenderer data={parsedData} /> : <p className="empty-preview">Fix YAML errors to render.</p>}
        </div>
      </section>
    </main>
  );
};

export default App;
