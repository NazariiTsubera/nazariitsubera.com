import Brand from "@/components/Brand";
import GradientCanvas from "@/components/GradientCanvas";
import Marquee from "@/components/Marquee";
import OptInForm from "@/components/OptInForm";
import ScrollFX from "@/components/ScrollFX";

const services = [
  {
    n: "01",
    title: "Automate",
    body: "The repetitive work that eats your week — done automatically, quietly, every time. No one has to remember to do it.",
    eg: "INVOICING · SCHEDULING · FOLLOW-UPS · DATA ENTRY",
  },
  {
    n: "02",
    title: "Build",
    body: "Custom software shaped to how your business actually works — not off-the-shelf tools you bend yourself around.",
    eg: "INTERNAL TOOLS · DASHBOARDS · CLIENT PORTALS",
  },
  {
    n: "03",
    title: "Apply AI",
    body: "AI put to work only where it earns its keep — no hype, just fewer hours spent on the boring parts.",
    eg: "DRAFTING · SORTING · ANSWERING · SUMMARIZING",
  },
];

const steps = [
  {
    n: "01",
    title: "We talk",
    body: "You tell me where the friction is. No tech vocabulary required — just how the work feels.",
  },
  {
    n: "02",
    title: "I build",
    body: "I design, build, and run the solution end to end. You approve; I handle the rest.",
  },
  {
    n: "03",
    title: "You run lighter",
    body: "The work happens in the background. You stay focused on running the business.",
  },
];

const trust = [
  { stat: "1", label: "point of contact. Me, from first call to finished software." },
  { stat: "Weeks", label: "not months. You see working software fast, and often." },
  { stat: "0", label: "jargon. Every conversation stays in plain language." },
];

const navLinks = [
  ["Approach", "#approach"],
  ["Services", "#services"],
  ["Results", "#results"],
];

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      {/* NAV */}
      <header
        className="sticky top-0 z-40 border-b border-ink/[0.07] backdrop-blur-[12px]"
        style={{ background: "color-mix(in srgb, #f1eee6 78%, transparent)" }}
      >
        <nav className="mx-auto flex max-w-frame items-center gap-x-6 px-6 py-[18px] md:px-10 lg:gap-x-[34px]">
          <Brand className="mr-auto" />
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="navlink hidden font-mono text-[13px] tracking-[0.02em] text-body-2 lg:inline"
            >
              {label}
            </a>
          ))}
          <a
            href="#start"
            className="inkbtn hidden whitespace-nowrap rounded-[9px] border border-ink px-[18px] py-[11px] font-mono text-[13px] tracking-[0.02em] sm:inline-flex"
          >
            Start a conversation
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section id="top" data-tilt className="relative overflow-hidden">
          <div
            data-depth="18"
            data-parallax="0.16"
            data-scale="0.00020"
            className="pointer-events-none absolute left-[calc(50%-50vw)] top-[-40px] z-0 h-[calc(100%+260px)] w-screen"
            style={{
              transform:
                "translate3d(var(--mx,0px), calc(var(--sy,0px) + var(--my,0px)), 0) scale(var(--scl,1))",
              transformOrigin: "32% 30%",
              willChange: "transform",
            }}
          >
            <GradientCanvas
              variant="ambient"
              className="absolute inset-0 h-full w-full opacity-[0.55]"
              style={{
                WebkitMaskImage:
                  "radial-gradient(118% 96% at 30% 26%, #000 34%, transparent 80%)",
                maskImage:
                  "radial-gradient(118% 96% at 30% 26%, #000 34%, transparent 80%)",
              }}
            />
          </div>
          <div className="reveal relative z-[2] mx-auto max-w-frame px-6 pb-[68px] pt-24 md:px-10">
            <div className="mb-[30px] flex items-center gap-2.5">
              <span className="h-px w-[26px] bg-magenta-ink" />
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-eyebrow">
                Independent technology consultant
              </span>
            </div>
            <h1 className="mb-8 max-w-[15ch] text-balance font-serif text-[clamp(52px,8vw,106px)] font-normal leading-[0.94] tracking-[-0.042em]">
              Put AI to work in your business —{" "}
              <span className="gradient-text font-medium italic">
                without learning a thing.
              </span>
            </h1>
            <p className="mb-[34px] max-w-[52ch] text-[20px] leading-[1.55] text-body">
              I take the problems slowing your business down and solve them with
              automation, AI, and custom software. You stay focused on the
              business — I handle the technology.
            </p>
            <div id="start" className="max-w-[480px]">
              <OptInForm
                tone="light"
                layout="row"
                successNote="Watch for a short, personal note within a day — no sales team, no pitch."
                hint="Tell me your business. I'll reply personally — no sales team, no jargon."
              />
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <Marquee />

        {/* APPROACH */}
        <section id="approach" className="mx-auto max-w-frame px-6 py-[120px] md:px-10">
          <div className="grid gap-14 md:grid-cols-[0.42fr_0.58fr]">
            <div className="reveal">
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-eyebrow">
                (01) — The problem
              </div>
              <h2 className="mt-[22px] max-w-[14ch] font-serif text-[clamp(34px,3.8vw,52px)] font-normal leading-[1.02] tracking-[-0.028em]">
                You already know AI matters. You just don&apos;t have time to
                figure it out.
              </h2>
            </div>
            <div className="reveal max-w-[54ch] md:self-end">
              <p className="mb-[18px] text-[20px] leading-[1.62] text-body">
                Every week there&apos;s a louder headline about what AI could do
                for your business. But you&apos;re busy actually running it — and
                the tools are a maze of jargon, half-built apps, and consultants
                who talk over your head.
              </p>
              <p className="text-[20px] leading-[1.62] text-body">
                That&apos;s my job. I take the problems you already feel — the
                hours lost to admin, the work that shouldn&apos;t need a person —
                and quietly turn them into software that runs itself.{" "}
                <em className="italic text-ink">
                  You stay focused on the parts only you can do.
                </em>
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="border-t border-ink/[0.1]">
          <div className="mx-auto max-w-frame px-6 pb-10 pt-24 md:px-10">
            <div className="reveal mb-5 flex flex-wrap items-baseline justify-between gap-6">
              <h2 className="font-serif text-[clamp(30px,3.4vw,46px)] font-normal leading-none tracking-[-0.028em]">
                Three ways I take work off your plate.
              </h2>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-mono-soft">
                What I do
              </span>
            </div>
            <div>
              {services.map((svc) => (
                <div
                  key={svc.n}
                  className="svc-row reveal relative grid grid-cols-[56px_1fr] items-baseline gap-x-5 gap-y-2 border-t border-ink/[0.12] py-7 md:grid-cols-[96px_1fr_1.15fr_48px] md:items-center md:gap-6 md:py-[34px]"
                >
                  <div className="svc-bar absolute left-0 top-[-1px] h-0.5 w-full bg-grad-bar" />
                  <div className="svc-index font-mono text-sm tracking-[0.08em] text-faint">
                    {svc.n}
                  </div>
                  <h3 className="font-serif text-[clamp(30px,3.2vw,44px)] font-normal leading-none tracking-[-0.028em]">
                    {svc.title}
                  </h3>
                  <div className="col-span-2 md:col-span-1">
                    <p className="mb-2.5 text-base leading-[1.55] text-body-2">
                      {svc.body}
                    </p>
                    <div className="font-mono text-[11.5px] tracking-[0.06em] text-mono-soft">
                      {svc.eg}
                    </div>
                  </div>
                  <div className="svc-arrow hidden text-right font-mono text-[22px] text-violet-bright opacity-40 md:block">
                    →
                  </div>
                </div>
              ))}
              <div className="border-t border-ink/[0.12]" />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-ink/[0.1]">
          <div className="mx-auto max-w-frame px-6 py-[110px] md:px-10">
            <div className="reveal mx-auto mb-2 max-w-[22ch] text-center">
              <div className="mb-[18px] font-mono text-xs uppercase tracking-[0.16em] text-eyebrow">
                How it works
              </div>
              <h2 className="font-serif text-[clamp(32px,3.6vw,50px)] font-normal leading-[1.02] tracking-[-0.028em]">
                Simple on your side. All the work on mine.
              </h2>
            </div>

            <div className="reveal relative mx-auto mb-[60px] mt-12 aspect-square w-[min(440px,80vw)] animate-float motion-reduce:animate-none">
              <div
                className="absolute inset-0 overflow-hidden rounded-full"
                style={{
                  boxShadow:
                    "0 40px 90px rgba(47,59,214,.20), inset 0 0 0 1px rgba(23,22,28,.06)",
                }}
              >
                <GradientCanvas
                  variant="orb"
                  className="absolute inset-0 h-full w-full opacity-[0.72]"
                  style={{ filter: "saturate(1.08)" }}
                />
                <div className="grain" />
              </div>
              <span className="absolute left-[10%] top-[10%] h-[15px] w-[15px] border-l-[1.5px] border-t-[1.5px] border-white/70" />
              <span className="absolute right-[10%] top-[10%] h-[15px] w-[15px] border-r-[1.5px] border-t-[1.5px] border-white/70" />
              <span className="absolute bottom-[10%] left-[10%] h-[15px] w-[15px] border-b-[1.5px] border-l-[1.5px] border-white/70" />
              <span className="absolute bottom-[10%] right-[10%] h-[15px] w-[15px] border-b-[1.5px] border-r-[1.5px] border-white/70" />
            </div>

            <div className="grid gap-9 border-t border-ink/[0.12] pt-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="reveal">
                  <div className="mb-[14px] font-mono text-[13px] tracking-[0.1em] text-violet-bright">
                    {step.n}
                  </div>
                  <h3 className="mb-2.5 font-serif text-[26px] font-medium leading-[1.05] tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="max-w-[32ch] text-base leading-[1.58] text-body-2">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS / TRUST */}
        <section id="results" className="border-t border-ink/[0.1]">
          <div className="mx-auto max-w-frame px-6 py-24 md:px-10">
            <div className="reveal mb-10 font-mono text-xs uppercase tracking-[0.16em] text-eyebrow">
              Built for owners, not IT departments
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {trust.map((t) => (
                <div key={t.label} className="reveal border-t-2 border-ink pt-6">
                  <div className="font-serif text-[clamp(58px,7vw,92px)] font-normal leading-[0.9] tracking-[-0.04em]">
                    {t.stat}
                  </div>
                  <div className="mt-4 max-w-[26ch] text-[17px] leading-[1.5] text-body">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-ink-deep">
          <GradientCanvas
            variant="cta"
            className="absolute inset-0 h-full w-full opacity-50"
          />
          <div className="grain" style={{ opacity: 0.35 }} />
          <div className="relative mx-auto grid max-w-frame items-center gap-14 px-6 py-[120px] md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div className="reveal">
              <div className="mb-[22px] font-mono text-xs uppercase tracking-[0.16em] text-on-dark-lilac">
                Start here
              </div>
              <h2 className="mb-[18px] max-w-[15ch] font-serif text-[clamp(38px,4.6vw,64px)] font-normal leading-none tracking-[-0.032em] text-on-dark">
                Let&apos;s find the hours hiding in your week.
              </h2>
              <p className="max-w-[42ch] text-[19px] leading-[1.55] text-on-dark/[0.72]">
                Tell me where the friction is. I&apos;ll tell you what&apos;s
                possible — in plain language, at no cost.
              </p>
            </div>
            <div className="reveal">
              <OptInForm
                tone="dark"
                layout="stack"
                successNote="I'll be in touch within a day."
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-ink-deep">
        <div className="mx-auto flex max-w-frame flex-wrap items-center justify-between gap-6 px-6 py-[34px] md:px-10">
          <Brand tone="dark" size="sm" />
          <span className="font-mono text-[11.5px] tracking-[0.04em] text-on-dark/50">
            Independent technology consultant — AI, automation &amp; custom
            software.
          </span>
          <a
            href="mailto:hello@nazariitsubera.com"
            className="navlink font-mono text-[13px] text-on-dark-lilac2"
          >
            hello@nazariitsubera.com
          </a>
        </div>
      </footer>

      <ScrollFX />
    </div>
  );
}
