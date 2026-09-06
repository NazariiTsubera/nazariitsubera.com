/* @jsxRuntime automatic */
/* @jsxImportSource react */
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { about: string | null; person: RenderAsset | null };

export function About({ about, person }: Props) {
  if (!about) return null;
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div>
          <h2 className="eyebrow" id="about-title">
            About
          </h2>
          <p>{about}</p>
        </div>
        {person ? (
          <div className="portrait">
            <Picture asset={person} sizes="(min-width: 48rem) 30vw, 100vw" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
