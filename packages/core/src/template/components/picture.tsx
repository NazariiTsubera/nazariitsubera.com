/* @jsxRuntime automatic */
/* @jsxImportSource react */
import type { RenderAsset } from "../../contracts/render";

type Props = {
  asset: RenderAsset;
  /** The sizes attribute, describing the rendered width at each breakpoint. */
  sizes: string;
  /** Above the fold: eager, high priority. Everything else is lazy. */
  priority?: boolean;
};

export function Picture({ asset, sizes, priority = false }: Props) {
  const { w480, w960, w1440 } = asset.variants;
  return (
    <img
      src={w960}
      srcSet={`${w480} 480w, ${w960} 960w, ${w1440} 1440w`}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={asset.alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
