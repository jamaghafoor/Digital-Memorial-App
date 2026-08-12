export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "";

export const lifeDates = (card) =>
  [formatDate(card.birthDate), formatDate(card.deathDate)]
    .filter(Boolean)
    .join(" — ");

export const setMeta = (property, content) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export const initialCard = {
  name: "",
  bio: "",
  birthDate: "",
  deathDate: "",
  epitaph: "",
  imageUrl: "",
  headstoneDesignId: "",
  isPublic: true,
  reminderDate: "",
  reminderPhone: "",
};
