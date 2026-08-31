import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import ShareButtons from "../components/ShareButtons";
import Guestbook from "../components/Guestbook";
import MemorialStone from "../components/MemorialStone";
import { lifeDates, setMeta } from "../utils";

export default function MemoryPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    api(`/cards/public/${id}`)
      .then(({ card: result }) => {
        setCard(result);
        document.title = `${result.name} | Memory Card`;
        const copy =
          result.epitaph || result.bio || `Remembering ${result.name}`;
        const description = document.querySelector('meta[name="description"]');
        if (description) description.content = copy;
        setMeta("og:title", `Remembering ${result.name}`);
        setMeta("og:description", copy);
        setMeta(
          "og:image",
          result.imageUrl || `${window.location.origin}/logo512.png`,
        );
      })
      .catch((err) => setError(err.message));
  }, [id]);
  
  if (error)
    return (
      <main className="page not-found">
        <h1>This memory is unavailable.</h1>
        <p>{error}</p>
        <Link to="/">Return home</Link>
      </main>
    );
    
  if (!card)
    return (
      <main className="page">
        <p className="muted">Opening this memory…</p>
      </main>
    );
    
  return (
    <main className="memory-page">
      <section className="memory-hero">
        {card.headstoneDesignId?.imageUrl ? (
          <MemorialStone card={card} />
        ) : card.imageUrl ? (
          <div className="memory-photo">
            <img src={card.imageUrl} alt={card.name} />
          </div>
        ) : null}
        <div className="memory-main">
          <p className="eyebrow">In loving memory</p>
          <h1>{card.name}</h1>
          <p className="life-dates">{lifeDates(card)}</p>
          {card.epitaph && <blockquote>“{card.epitaph}”</blockquote>}
          <ShareButtons card={card} />
        </div>
      </section>
      <section className="memory-content">
        <article>
          <h2>A life remembered</h2>
          <p>
            {card.bio ||
              "Their story will live on in the hearts of everyone who knew and loved them."}
          </p>
        </article>
        <aside className="qr-card">
          <img src={card.qrCode} alt={`QR code for ${card.name}'s memory`} />
          <strong>Carry this memory with you</strong>
          <p>Scan to revisit and share this memorial.</p>
          <a
            className="outline-button"
            download={`${card.name}-memory-qr.png`}
            href={card.qrCode}
          >
            Download QR code
          </a>
        </aside>
      </section>
      <Guestbook cardId={card._id} />
    </main>
  );
}
