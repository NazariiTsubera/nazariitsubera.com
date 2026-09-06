import type { Product } from "../../contracts/content";
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { products: Product[]; assets: Record<string, RenderAsset> };

const CARD_SIZES = "(min-width: 64rem) 22vw, (min-width: 40rem) 30vw, 45vw";

function CardBody({ product, asset }: { product: Product; asset: RenderAsset | undefined }) {
  return (
    <>
      <div className="card-media">{asset ? <Picture asset={asset} sizes={CARD_SIZES} /> : null}</div>
      <div className="card-body">
        <h3>{product.name}</h3>
        {product.blurb ? <p className="blurb">{product.blurb}</p> : null}
        {product.priceHint ? <p className="price">{product.priceHint}</p> : null}
      </div>
    </>
  );
}

export function Products({ products, assets }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="section" id="products" aria-labelledby="products-title">
      <div className="wrap">
        <h2 className="eyebrow" id="products-title">
          Products
        </h2>
        <ul className="grid">
          {products.map((product) => {
            const asset = assets[product.assetId];
            return (
              <li key={product.assetId}>
                {product.checkoutUrl ? (
                  <a className="card" href={product.checkoutUrl} target="_blank" rel="noopener">
                    <CardBody product={product} asset={asset} />
                  </a>
                ) : (
                  <div className="card">
                    <CardBody product={product} asset={asset} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
