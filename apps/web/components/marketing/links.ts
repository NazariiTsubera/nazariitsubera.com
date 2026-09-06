export const SITE_URL = "https://nazariitsubera.com";

/** Every destination the marketing pages link to, in one place. */
export const LINKS = {
  home: "/",
  business: "/business",
  engineering: "/engineering",
  work: "/work",
  writing: "/writing",
  about: "/about",
  contact: "/contact",
  storefront: "/storefront",
  resume: "/Nazarii-Tsubera-Resume.pdf",
  email: "mailto:hello@nazariitsubera.com",
  emailText: "hello@nazariitsubera.com",
  phone: "tel:+12109806600",
  phoneText: "(210) 980-6600",
  github: "https://github.com/NazariiTsubera",
  linkedin: "https://www.linkedin.com/in/nazarii-tsubera-b4198b240/",
} as const;

export const NAV = [
  { href: LINKS.business, label: "For business" },
  { href: LINKS.engineering, label: "Engineering" },
  { href: LINKS.work, label: "Work" },
  { href: LINKS.writing, label: "Writing" },
  { href: LINKS.about, label: "About" },
] as const;
