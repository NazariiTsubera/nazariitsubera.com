/* @jsxRuntime automatic */
/* @jsxImportSource react */
import type { ContentJson } from "../../contracts/content";

type Props = { visit: ContentJson["visit"] };

export function Visit({ visit }: Props) {
  if (visit.markets.length === 0) return null;
  return (
    <section className="section" id="visit" aria-labelledby="visit-title">
      <div className="wrap">
        <h2 className="eyebrow" id="visit-title">
          Where to find us
        </h2>
        <ul className="markets">
          {visit.markets.map((market) => (
            <li className="market" key={market.name}>
              <strong>{market.name}</strong>
              {market.scheduleNote ? <span>{market.scheduleNote}</span> : null}
              {market.mapsUrl ? (
                <a href={market.mapsUrl} target="_blank" rel="noopener">
                  Open in Maps
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {visit.note ? <p className="note">{visit.note}</p> : null}
      </div>
    </section>
  );
}
