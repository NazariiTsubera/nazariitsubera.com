import { renderToStaticMarkup } from "react-dom/server";

import { renderInputSchema, type RenderInput } from "../contracts/render";
import { getTheme } from "../themes";
import { Document } from "./components/document";
import { buildStylesheet } from "./styles";

export type RenderResult = { html: string; bytes: number };

/**
 * The template's single entry point. Pure: identical input yields identical HTML.
 * Validates the input, resolves the theme, inlines the stylesheet, and returns a complete document.
 */
export function renderSite(rawInput: RenderInput): RenderResult {
  const input = renderInputSchema.parse(rawInput);
  const theme = getTheme(input.themeId);
  const fontsBaseUrl = `${input.context.assetsBaseUrl.replace(/\/$/, "")}/fonts`;
  const css = buildStylesheet(theme, fontsBaseUrl);
  const markup = renderToStaticMarkup(
    <Document input={input} theme={theme} css={css} fontsBaseUrl={fontsBaseUrl} />,
  );
  const html = `<!doctype html>\n${markup}`;
  return { html, bytes: new TextEncoder().encode(html).length };
}
