export default function PageHeader({ eyebrow, title, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "22px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <div className="eyebrow-label" style={{ marginBottom: "4px" }}>
          {eyebrow}
        </div>
        <h1 className="page-heading">{title}</h1>
      </div>

      {children}
    </div>
  );
}