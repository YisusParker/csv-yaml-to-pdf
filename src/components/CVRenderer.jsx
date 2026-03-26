import Section from "./Section";
import { CertificationEntry, EducationEntry, ExperienceEntry } from "./Entry";
import { normalizeHref, parseRichInlineText } from "../utils/richText";

const renderInline = (value) =>
  parseRichInlineText(value).map((node, idx) => {
    if (node.type === "link") {
      return (
        <a key={idx} href={normalizeHref(node.href)} target="_blank" rel="noreferrer">
          {node.text}
        </a>
      );
    }
    if (node.type === "bold") {
      return <strong key={idx}>{node.children.map((child) => child.value ?? child.text).join("")}</strong>;
    }
    return <span key={idx}>{node.value}</span>;
  });

const ContactLine = ({ contact }) => {
  const items = [contact.email, contact.linkedin, contact.github].filter(Boolean);
  return (
    <p className="cv-contact-line">
      {items.map((item, idx) => (
        <span key={`${item}-${idx}`}>
          {idx > 0 ? " | " : ""}
          <a href={normalizeHref(item)} target="_blank" rel="noreferrer">
            {item}
          </a>
        </span>
      ))}
    </p>
  );
};

const SkillsList = ({ skills }) => (
  <div className="cv-skills">
    {skills.map((skill, idx) => (
      <p key={`skill-${idx}`}>
        <strong>{skill?.category ?? "Skills"}:</strong>{" "}
        {Array.isArray(skill?.items) ? skill.items.join(", ") : String(skill?.items ?? "")}
      </p>
    ))}
  </div>
);

const CVRenderer = ({ data }) => {
  const { cv, sections } = data;

  return (
    <div className="cv-document" id="cv-document">
      <header className="cv-header">
        <h1>{cv.name}</h1>
        <ContactLine contact={cv.contact ?? {}} />
      </header>

      {sections.summary.length > 0 && (
        <Section title="Summary">
          {sections.summary.map((text, idx) => (
            <p key={`summary-${idx}`} className="cv-summary-paragraph">
              {renderInline(text)}
            </p>
          ))}
        </Section>
      )}

      {sections.experience.length > 0 && (
        <Section title="Experience">
          {sections.experience.map((item, idx) => (
            <ExperienceEntry key={`experience-${idx}`} item={item} />
          ))}
        </Section>
      )}

      {sections.education.length > 0 && (
        <Section title="Education">
          {sections.education.map((item, idx) => (
            <EducationEntry key={`education-${idx}`} item={item} />
          ))}
        </Section>
      )}

      {sections.certifications.length > 0 && (
        <Section title="Certifications">
          {sections.certifications.map((item, idx) => (
            <CertificationEntry key={`certification-${idx}`} item={item} />
          ))}
        </Section>
      )}

      {sections.skills.length > 0 && (
        <Section title="Skills">
          <SkillsList skills={sections.skills} />
        </Section>
      )}
    </div>
  );
};

export default CVRenderer;
