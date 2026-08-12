import { useTranslation } from "react-i18next";

export default function ShareButtons({ card }) {
  const { t } = useTranslation();
  const url = card.publicUrl || window.location.href;
  const encoded = encodeURIComponent(url);
  const copy = async () => {
    await navigator.clipboard?.writeText(url);
    window.alert("Link copied to your clipboard.");
  };
  return (
    <div className="share">
      <span>{t("share")}</span>
      <button onClick={copy}>Copy link</button>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
      >
        Facebook
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://wa.me/?text=${encoded}`}
      >
        WhatsApp
      </a>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(`Remembering ${card.name}`)}`}
      >
        X
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(`Remembering ${card.name}`)}&body=${encoded}`}
      >
        Email
      </a>
    </div>
  );
}
