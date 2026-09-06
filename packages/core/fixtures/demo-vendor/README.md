# demo-vendor fixture

`render-input.json` is a complete `RenderInput` for a fictional vendor. It is the input for the
template snapshot tests and for the render CLI.

Render it:

    pnpm --filter @nazariitsubera/core render:fixture
    pnpm --filter @nazariitsubera/core render:fixture --theme candy

Output lands in `packages/core/out/demo-vendor[-<theme>]/`. Images referenced under `images/` are
generated as SVG placeholders of the right aspect when no file exists in this directory's
`images/` folder. Drop real files with the same names here to render with photos.

Serve the output for a Lighthouse run:

    python3 -m http.server 4173 --directory packages/core/out/demo-vendor

Publish it to the local database and open it on a local subdomain:

    docker compose up -d
    pnpm --filter @nazariitsubera/core publish:fixture
    pnpm dev

Then open the printed `http://pearl-street-pottery.localhost:3000/?p=...` link. Product images
are placeholders until Plan 3 adds photo storage; the page, banner, fonts, and headers are real.
