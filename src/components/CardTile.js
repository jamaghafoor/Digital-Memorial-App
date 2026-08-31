import { Link } from "react-router-dom";
import { lifeDates } from "../utils";
import MemorialStone from "./MemorialStone";

export default function CardTile({ card }) {
  return (
    <Link to={`/memory/${card._id}`} className="memory-tile">
      <div className={`tile-image ${card.headstoneDesignId?.imageUrl ? "tile-image--headstone" : ""}`}>
        {card.headstoneDesignId?.imageUrl ? (
          <MemorialStone card={card} compact />
        ) : card.imageUrl ? (
          <img src={card.imageUrl} alt="" />
        ) : (
          <div className="image-placeholder">✦</div>
        )}
      </div>
      <div className="tile-copy">
        <h3>{card.name}</h3>
        <p>{lifeDates(card)}</p>
        {card.epitaph && <span>“{card.epitaph}”</span>}
      </div>
    </Link>
  );
}
