const Section = ({ title, children }) => {
  return (
    <section className="cv-section">
      <div className="cv-section-heading">
        <h2>{title}</h2>
      </div>
      <div className="cv-section-content">{children}</div>
    </section>
  );
};

export default Section;
