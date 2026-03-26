import { useEffect, useMemo, useRef, useState } from "react";
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

const SECTION_KEYS = ["summary", "experience", "education", "certifications", "skills"];

const clone = (value) => JSON.parse(JSON.stringify(value));

const moveInArray = (items, from, direction) => {
  const to = from + direction;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

const App = () => {
  const [yamlText, setYamlText] = useState(sampleYaml);
  const [isExporting, setIsExporting] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(SECTION_KEYS);
  const [editorMode, setEditorMode] = useState("yaml");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const previewRef = useRef(null);

  const { parsedData, error } = useMemo(() => {
    try {
      const data = parseYaml(yamlText);
      return { parsedData: data, error: "" };
    } catch (e) {
      return { parsedData: null, error: e.message };
    }
  }, [yamlText]);

  useEffect(() => {
    if (!parsedData) return;
    setEditableData(clone(parsedData));
    const available = SECTION_KEYS.filter((key) => parsedData.sections[key]?.length > 0);
    setSectionOrder(available);
  }, [parsedData]);

  const activeData = editableData ?? parsedData;

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setYamlText(content);
    setUploadedFileName(file.name);
  };

  const handleDownload = async () => {
    if (!previewRef.current || !activeData) return;
    setIsExporting(true);
    try {
      await exportAsPdf(previewRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  const moveSection = (index, direction) => {
    setSectionOrder((prev) => moveInArray(prev, index, direction));
  };

  const moveSectionItem = (sectionKey, index, direction) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      next.sections[sectionKey] = moveInArray(next.sections[sectionKey] ?? [], index, direction);
      return next;
    });
  };

  const updateSectionItemField = (sectionKey, index, field, value) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      if (!next.sections[sectionKey]?.[index]) return prev;
      next.sections[sectionKey][index][field] = value;
      return next;
    });
  };

  const updateSummary = (index, value) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      next.sections.summary[index] = value;
      return next;
    });
  };

  const updateSkills = (index, value) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      next.sections.skills[index].items = value
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean);
      return next;
    });
  };

  const updateContactField = (field, value) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      next.cv.contact = next.cv.contact ?? {};
      next.cv.contact[field] = value;
      return next;
    });
  };

  const updateHighlights = (sectionKey, index, value) => {
    setEditableData((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      if (!next.sections[sectionKey]?.[index]) return prev;
      next.sections[sectionKey][index].highlights = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      return next;
    });
  };

  return (
    <main className="app-shell">
      <aside className="editor-panel">
        <div className="panel-header">
          <h2>Editor</h2>
          <div className="mode-toggle">
            <button
              type="button"
              className={editorMode === "yaml" ? "active" : ""}
              onClick={() => setEditorMode("yaml")}
            >
              YAML
            </button>
            <button
              type="button"
              className={editorMode === "builder" ? "active" : ""}
              onClick={() => setEditorMode("builder")}
            >
              Visual Builder
            </button>
          </div>
        </div>

        {editorMode === "yaml" ? (
          <>
            <label className="upload-label">
              <span className="upload-label-main">
                <span className="upload-icon" aria-hidden="true">
                  ↑
                </span>
                Upload YAML
              </span>
              <span className="upload-label-sub">
                {uploadedFileName || "Selecciona un archivo YAML (.yml o .yaml)"}
              </span>
              <input type="file" accept=".yaml,.yml,text/yaml" onChange={handleFileUpload} />
            </label>
            <textarea
              value={yamlText}
              onChange={(event) => setYamlText(event.target.value)}
              spellCheck={false}
              className="yaml-textarea"
            />
          </>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
        {editorMode === "builder" && activeData ? (
          <div className="builder-panel">
            <h3>Visual Builder</h3>
            <p className="builder-help">Mueve secciones y edita bloques sin tocar el YAML.</p>
            <div className="builder-section">
              <div className="builder-section-head">
                <strong>header</strong>
              </div>
              <div className="builder-item">
                <input
                  className="builder-input"
                  value={activeData.cv.name ?? ""}
                  onChange={(event) =>
                    setEditableData((prev) => {
                      if (!prev) return prev;
                      const next = clone(prev);
                      next.cv.name = event.target.value;
                      return next;
                    })
                  }
                  placeholder="Full name"
                />
                <input
                  className="builder-input"
                  value={activeData.cv.contact?.email ?? ""}
                  onChange={(event) => updateContactField("email", event.target.value)}
                  placeholder="Email"
                />
                <input
                  className="builder-input"
                  value={activeData.cv.contact?.linkedin ?? ""}
                  onChange={(event) => updateContactField("linkedin", event.target.value)}
                  placeholder="LinkedIn URL"
                />
                <input
                  className="builder-input"
                  value={activeData.cv.contact?.github ?? ""}
                  onChange={(event) => updateContactField("github", event.target.value)}
                  placeholder="GitHub URL"
                />
              </div>
            </div>
            <div className="builder-section-list">
              {sectionOrder.map((sectionKey, sectionIndex) => (
                <div key={sectionKey} className="builder-section">
                  <div className="builder-section-head">
                    <strong>{sectionKey}</strong>
                    <div className="builder-actions">
                      <button type="button" onClick={() => moveSection(sectionIndex, -1)}>
                        ↑
                      </button>
                      <button type="button" onClick={() => moveSection(sectionIndex, 1)}>
                        ↓
                      </button>
                    </div>
                  </div>

                  {sectionKey === "summary" &&
                    activeData.sections.summary.map((item, idx) => (
                      <textarea
                        key={`summary-builder-${idx}`}
                        className="builder-input"
                        value={item}
                        onChange={(event) => updateSummary(idx, event.target.value)}
                      />
                    ))}

                  {sectionKey === "experience" &&
                    activeData.sections.experience.map((item, idx) => (
                      <div key={`exp-builder-${idx}`} className="builder-item">
                        <div className="builder-actions">
                          <button type="button" onClick={() => moveSectionItem("experience", idx, -1)}>
                            ↑
                          </button>
                          <button type="button" onClick={() => moveSectionItem("experience", idx, 1)}>
                            ↓
                          </button>
                        </div>
                        <input
                          className="builder-input"
                          value={item.position ?? ""}
                          onChange={(event) => updateSectionItemField("experience", idx, "position", event.target.value)}
                          placeholder="Position"
                        />
                        <input
                          className="builder-input"
                          value={item.company ?? ""}
                          onChange={(event) => updateSectionItemField("experience", idx, "company", event.target.value)}
                          placeholder="Company"
                        />
                        <textarea
                          className="builder-input"
                          value={(item.highlights ?? []).join("\n")}
                          onChange={(event) => updateHighlights("experience", idx, event.target.value)}
                          placeholder={"Bullets (una linea por bullet)\n- logro 1\n- logro 2"}
                        />
                      </div>
                    ))}

                  {sectionKey === "education" &&
                    activeData.sections.education.map((item, idx) => (
                      <div key={`edu-builder-${idx}`} className="builder-item">
                        <div className="builder-actions">
                          <button type="button" onClick={() => moveSectionItem("education", idx, -1)}>
                            ↑
                          </button>
                          <button type="button" onClick={() => moveSectionItem("education", idx, 1)}>
                            ↓
                          </button>
                        </div>
                        <input
                          className="builder-input"
                          value={item.institution ?? ""}
                          onChange={(event) => updateSectionItemField("education", idx, "institution", event.target.value)}
                          placeholder="Institution"
                        />
                        <textarea
                          className="builder-input"
                          value={(item.highlights ?? []).join("\n")}
                          onChange={(event) => updateHighlights("education", idx, event.target.value)}
                          placeholder={"Bullets (una linea por bullet)\n- curso relevante\n- reconocimiento"}
                        />
                      </div>
                    ))}

                  {sectionKey === "certifications" &&
                    activeData.sections.certifications.map((item, idx) => (
                      <div key={`cert-builder-${idx}`} className="builder-item">
                        <div className="builder-actions">
                          <button type="button" onClick={() => moveSectionItem("certifications", idx, -1)}>
                            ↑
                          </button>
                          <button type="button" onClick={() => moveSectionItem("certifications", idx, 1)}>
                            ↓
                          </button>
                        </div>
                        <input
                          className="builder-input"
                          value={item.name ?? ""}
                          onChange={(event) => updateSectionItemField("certifications", idx, "name", event.target.value)}
                          placeholder="Certification"
                        />
                        <textarea
                          className="builder-input"
                          value={(item.highlights ?? []).join("\n")}
                          onChange={(event) => updateHighlights("certifications", idx, event.target.value)}
                          placeholder={"Bullets (una linea por bullet)\n- tema 1\n- tema 2"}
                        />
                      </div>
                    ))}

                  {sectionKey === "skills" &&
                    activeData.sections.skills.map((item, idx) => (
                      <div key={`skill-builder-${idx}`} className="builder-item">
                        <div className="builder-actions">
                          <button type="button" onClick={() => moveSectionItem("skills", idx, -1)}>
                            ↑
                          </button>
                          <button type="button" onClick={() => moveSectionItem("skills", idx, 1)}>
                            ↓
                          </button>
                        </div>
                        <input
                          className="builder-input"
                          value={item.category ?? ""}
                          onChange={(event) => updateSectionItemField("skills", idx, "category", event.target.value)}
                          placeholder="Category"
                        />
                        <input
                          className="builder-input"
                          value={(item.items ?? []).join(", ")}
                          onChange={(event) => updateSkills(idx, event.target.value)}
                          placeholder="item1, item2, item3"
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <button className="download-btn" onClick={handleDownload} disabled={!activeData || isExporting}>
          {isExporting ? "Generating PDF..." : "Download PDF"}
        </button>
      </aside>

      <section className="preview-panel">
        <div className="preview-canvas" ref={previewRef}>
          {activeData ? (
            <CVRenderer data={activeData} sectionOrder={sectionOrder} />
          ) : (
            <p className="empty-preview">Fix YAML errors to render.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default App;
