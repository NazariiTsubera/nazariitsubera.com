import type { ContentJson } from "../../contracts/content";
import { formatPhone } from "../format";

type Props = { contact: ContentJson["contact"]; businessName: string };

export function Contact({ contact, businessName }: Props) {
  const handle = contact.instagramHandle?.replace(/^@/, "") ?? null;
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact">
        <h2 className="eyebrow" id="contact-title">
          Get in touch
        </h2>
        <a className="btn" href={`tel:${contact.phone}`}>
          {contact.ctaLabel} {formatPhone(contact.phone)}
        </a>
        <div className="links">
          {handle ? (
            <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener">
              @{handle}
            </a>
          ) : null}
          <span>{businessName}</span>
        </div>
      </div>
    </section>
  );
}
