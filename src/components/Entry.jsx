import { formatDateRange } from "../utils/formatDate";
import { normalizeHref, parseRichInlineText } from "../utils/richText";

const renderInline = (value) =>
  parseRichInlineText(value).map((node, idx) => {
    if (node.type === "bold") {
      return (
        <strong key={idx}>
          {node.children.map((child, cidx) => {
            if (child.type === "link") {
              return (
                <a key={`${idx}-${cidx}`} href={normalizeHref(child.href)} target="_blank" rel="noreferrer">
                  {child.text}
                </a>
              );
            }
            return <span key={`${idx}-${cidx}`}>{child.value}</span>;
          })}
        </strong>
      );
    }

    if (node.type === "link") {
      return (
        <a key={idx} href={normalizeHref(node.href)} target="_blank" rel="noreferrer">
          {node.text}
        </a>
      );
    }

    return <span key={idx}>{node.value}</span>;
  });

const normalizeListItem = (item) => {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const entries = Object.entries(item);
    if (entries.length === 0) return "";
    return entries.map(([key, value]) => `${key}: ${String(value ?? "")}`).join(" | ");
  }
  return "";
};

const Entry = ({ title, subtitle, location, dateRange, summary, highlights }) => {
  return (
    <article className="cv-entry">
      <div className="cv-entry-main">
        <h3 className="cv-entry-title">{title}</h3>
        {(subtitle || location) && (
          <p className="cv-entry-subtitle">
            {[subtitle, location].filter(Boolean).join(" — ")}
          </p>
        )}
        {summary ? <p className="cv-entry-summary">{renderInline(summary)}</p> : null}
        {Array.isArray(highlights) && highlights.length > 0 ? (
          <ul className="cv-entry-highlights">
            {highlights.map((item, idx) => (
              <li key={`${title}-${idx}`}>{renderInline(normalizeListItem(item))}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <aside className="cv-entry-date">{dateRange}</aside>
    </article>
  );
};

export const ExperienceEntry = ({ item }) => (
  <Entry
    title={
      [item.position, item.company].filter(Boolean).join(", ") +
      (item.location ? ` — ${item.location}` : "")
    }
    dateRange={formatDateRange(item.start_date, item.end_date)}
    summary={item.summary}
    highlights={item.highlights}
  />
);

export const EducationEntry = ({ item }) => (
  <Entry
    title={item.institution}
    subtitle={[item.area, item.location].filter(Boolean).join(" — ")}
    dateRange={formatDateRange(item.start_date, item.end_date)}
    highlights={item.highlights}
  />
);

export const CertificationEntry = ({ item }) => (
  <Entry
    title={item.name}
    subtitle={item.issuer}
    dateRange={item.year ? String(item.year) : ""}
    highlights={item.highlights}
  />
);

export default Entry;
