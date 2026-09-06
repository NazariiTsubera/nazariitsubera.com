import type { RenderInput } from "../../contracts/render";
import type { Theme } from "../../themes/types";
import { About } from "./about";
import { Contact } from "./contact";
import { Hero } from "./hero";
import { Products } from "./products";
import { Visit } from "./visit";

type Props = { input: RenderInput; theme: Theme; css: string; fontsBaseUrl: string };

export function Document({ input, theme, css, fontsBaseUrl }: Props) {
  const { content, assets, context } = input;
  const hero = content.heroAssetId ? (assets[content.heroAssetId] ?? null) : null;
  const person = content.personAssetId ? (assets[content.personAssetId] ?? null) : null;
  const title = `${content.businessName} · ${content.tagline}`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={content.heroSub} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={content.heroSub} />
        {hero ? <meta property="og:image" content={hero.variants.w960} /> : null}
        <link rel="canonical" href={context.siteUrl} />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`${fontsBaseUrl}/${theme.fonts.heading.file}`}
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <Hero content={content} hero={hero} />
        <main>
          <Products products={content.products} assets={assets} />
          <About about={content.about} person={person} />
          <Visit visit={content.visit} />
          <Contact contact={content.contact} businessName={content.businessName} />
        </main>
        <footer>
          <div className="wrap">
            <span>{content.businessName}</span> · <a href={context.operatorUrl}>Site by {context.operatorName}</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
