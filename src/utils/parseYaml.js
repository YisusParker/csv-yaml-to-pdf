import yaml from "js-yaml";

const asArray = (value) => (Array.isArray(value) ? value : []);

const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const validateShape = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("The YAML root must be an object.");
  }

  if (!data.cv || typeof data.cv !== "object") {
    throw new Error("Missing required 'cv' object.");
  }
};

const normalizeSocial = (socialNetworks = []) => {
  const contact = {};
  for (const item of socialNetworks) {
    if (!item || typeof item !== "object") continue;
    const network = String(item.network ?? "").toLowerCase();
    const username = String(item.username ?? "").trim();
    if (!username) continue;
    if (network === "linkedin") {
      contact.linkedin = `linkedin.com/in/${username}`;
    } else if (network === "github") {
      contact.github = `github.com/${username}`;
    }
  }
  return contact;
};

const normalizeSkills = (skills = []) =>
  asArray(skills).map((skill) => {
    if (!skill || typeof skill !== "object") return { category: "Skills", items: [String(skill ?? "")] };
    if (Array.isArray(skill.items)) {
      return {
        category: skill.category ?? skill.label ?? "Skills",
        items: skill.items.map((item) => String(item))
      };
    }
    if (skill.details) {
      return {
        category: skill.category ?? skill.label ?? "Skills",
        items: String(skill.details)
          .split(",")
          .map((token) => token.trim())
          .filter(Boolean)
      };
    }
    return {
      category: skill.category ?? skill.label ?? "Skills",
      items: []
    };
  });

const normalizeCertifications = (certifications = []) =>
  asArray(certifications).map((cert) => {
    if (!cert || typeof cert !== "object") return cert;
    return {
      ...cert,
      issuer: cert.issuer ?? cert.summary ?? "",
      year: cert.year ?? cert.date ?? "",
      highlights: asArray(cert.highlights)
    };
  });

export const parseYaml = (yamlText) => {
  try {
    const parsed = yaml.load(yamlText);
    validateShape(parsed);

    const cv = asObject(parsed.cv);
    const rootSections = asObject(parsed.sections);
    const cvSections = asObject(cv.sections);
    const sections = Object.keys(rootSections).length > 0 ? rootSections : cvSections;

    if (Object.keys(sections).length === 0) {
      throw new Error("Missing required 'sections' object.");
    }

    const socialContact = normalizeSocial(asArray(cv.social_networks));

    return {
      cv: {
        name: cv.name ?? "",
        contact: {
          ...socialContact,
          ...asObject(cv.contact),
          email: cv.email ?? asObject(cv.contact).email ?? ""
        }
      },
      sections: {
        summary: asArray(sections.summary),
        experience: asArray(sections.experience),
        education: asArray(sections.education),
        certifications: normalizeCertifications(sections.certifications),
        skills: normalizeSkills(sections.skills)
      }
    };
  } catch (error) {
    throw new Error(`YAML parsing error: ${error.message}`);
  }
};
