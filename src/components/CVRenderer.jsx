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

const defaultSectionOrder = ["summary", "experience", "education", "certifications", "skills"];

const sectionTitles = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  skills: "Skills"
};

const CVRenderer = ({ data, sectionOrder = defaultSectionOrder }) => {
  const { cv, sections } = data;
  const orderedSections = sectionOrder.filter((key) => Array.isArray(sections[key]) && sections[key].length > 0);

  const renderSection = (key) => {
    if (key === "summary") {
      return (
        <Section title={sectionTitles[key]}>
          {sections.summary.map((text, idx) => (
            <p key={`summary-${idx}`} className="cv-summary-paragraph">
              {renderInline(text)}
            </p>
          ))}
        </Section>
      );
    }

    if (key === "experience") {
      return (
        <Section title={sectionTitles[key]}>
          {sections.experience.map((item, idx) => (
            <ExperienceEntry key={`experience-${idx}`} item={item} />
          ))}
        </Section>
      );
    }

    if (key === "education") {
      return (
        <Section title={sectionTitles[key]}>
          {sections.education.map((item, idx) => (
            <EducationEntry key={`education-${idx}`} item={item} />
          ))}
        </Section>
      );
    }

    if (key === "certifications") {
      return (
        <Section title={sectionTitles[key]}>
          {sections.certifications.map((item, idx) => (
            <CertificationEntry key={`certification-${idx}`} item={item} />
          ))}
        </Section>
      );
    }

    if (key === "skills") {
      return (
        <Section title={sectionTitles[key]}>
          <SkillsList skills={sections.skills} />
        </Section>
      );
    }

    return null;
  };

  return (
    <div className="cv-document" id="cv-document">
      <header className="cv-header">
        <h1>{cv.name}</h1>
        <ContactLine contact={cv.contact ?? {}} />
      </header>
      {orderedSections.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

export default CVRenderer;
