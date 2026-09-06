import type { ContentJson } from "../../contracts/content";
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { content: ContentJson; hero: RenderAsset | null };

export function Hero({ content, hero }: Props) {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">{content.businessName}</p>
          <h1>{content.heroHeadline}</h1>
          <p className="sub">{content.heroSub}</p>
          <a className="btn" href={`tel:${content.contact.phone}`}>
            {content.contact.ctaLabel}
          </a>
        </div>
        {hero ? (
          <div className="hero-media">
            <Picture asset={hero} sizes="(min-width: 48rem) 45vw, 100vw" priority />
          </div>
        ) : null}
      </div>
    </header>
  );
}
