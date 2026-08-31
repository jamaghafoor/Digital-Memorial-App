const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "";

const designKey = (design) => {
  const value = `${design?.name || ""} ${design?.imageUrl || ""}`.toLowerCase();
  if (value.includes("heart")) return "heart";
  if (value.includes("bronze") || value.includes("urn")) return "urn";
  if (value.includes("fairy")) return "fairy";
  if (value.includes("book")) return "book";
  if (value.includes("red")) return "red-arch";
  if (value.includes("rose") || value.includes("pink")) return "rose-arch";
  return "classic";
};

export default function MemorialStone({ card, compact = false }) {
  const design = card?.headstoneDesignId;
  if (!design?.imageUrl) return null;

  const birthDate = shortDate(card.birthDate);
  const deathDate = shortDate(card.deathDate);

  return (
    <figure
      className={`memorial-stone ${compact ? "memorial-stone--compact" : "memorial-stone--detail"}`}
      data-design={designKey(design)}
      aria-label={`${card.name} memorial on the ${design.name} design`}
    >
      <img className="memorial-stone__art" src={design.imageUrl} alt="" />
      <figcaption className="memorial-stone__inscription">
        {card.imageUrl ? (
          <img className="memorial-stone__portrait" src={card.imageUrl} alt={card.name} />
        ) : (
          <span className="memorial-stone__portrait memorial-stone__portrait--empty" aria-hidden="true">✦</span>
        )}
        <strong className="memorial-stone__name">{card.name}</strong>
        {(birthDate || deathDate) && (
          <span className="memorial-stone__dates">
            {birthDate && <span>{birthDate}</span>}
            {deathDate && <span>{deathDate}</span>}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
