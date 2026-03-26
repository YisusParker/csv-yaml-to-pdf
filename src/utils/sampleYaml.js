const sampleYaml = `cv:
  name: Jane Doe
  contact:
    email: jane.doe@email.com
    linkedin: linkedin.com/in/janedoe
    github: github.com/janedoe
sections:
  summary:
    - Senior fullstack engineer focused on document rendering and high-quality PDF generation.
  experience:
    - position: Senior Software Engineer
      company: Atlas Systems
      location: San Francisco, CA
      start_date: 2022-01
      end_date: Present
      summary: Led migration of CV rendering pipeline to a structured YAML-driven architecture with **React, TypeScript, and Node.js**.
      highlights:
        - Reduced PDF layout regressions by 80% through visual QA snapshots.
        - Built dynamic two-column timeline rendering for dates and content.
    - position: Software Engineer
      company: Nova Labs
      location: Austin, TX
      start_date: 2019-03
      end_date: 2021-12
      summary: Implemented data ingestion and formatting services with **Python and PostgreSQL**.
      highlights:
        - Created reusable parsers for unstructured profile data.
  education:
    - institution: University of Texas
      area: B.S. Computer Science
      location: Austin, TX
      start_date: 2015
      end_date: 2019
      highlights:
        - Graduated magna cum laude.
  certifications:
    - name: AWS Certified Developer - Associate
      issuer: Amazon Web Services
      year: 2023
  skills:
    - category: Languages
      items:
        - JavaScript
        - TypeScript
        - Python
    - category: Tools
      items:
        - React
        - Node.js
        - Docker
`;

export default sampleYaml;
