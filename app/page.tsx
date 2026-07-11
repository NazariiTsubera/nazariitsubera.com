import Brand from "@/components/Brand";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import Frame from "@/components/Frame";
import GradientField from "@/components/GradientField";
import OptInForm from "@/components/OptInForm";
import Section from "@/components/Section";

const services = [
  {
    label: "Automate",
    title: "The busywork, gone",
    body: "Quoting, scheduling, data entry, follow-ups — the repetitive work eating your team's week, quietly running itself.",
  },
  {
    label: "Build",
    title: "Software shaped to you",
    body: "Not another off-the-shelf tool you bend your business around. Custom software built for how you actually work.",
  },
  {
    label: "Apply AI",
    title: "Practical, not flashy",
    body: "AI wired into your operations where it earns its keep — a real result in your business, not a demo to show off.",
  },
];

const steps = [
  {
    index: "01",
    title: "We talk",
    body: "You tell me what's slowing you down. No tech knowledge required — understanding it is my job, not yours.",
  },
  {
    index: "02",
    title: "I build",
    body: "I design and build the whole solution end to end, and keep you updated in plain language the entire way.",
  },
  {
    index: "03",
    title: "You run lighter",
    body: "It ships, your team adopts it, and I stay on call. You get your time — and your focus — back.",
  },
];

const promises = [
  ["1", "point of contact — me, from first call to handoff"],
  ["Weeks", "to your first working results, not months"],
  ["0", "jargon — everything explained in plain terms"],
];

export default function Home() {
  return (
    <div id="top">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/75 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-[min(theme(maxWidth.frame),100%)] items-center justify-between gap-6 px-[clamp(16px,4vw,24px)]">
          <Brand />
          <nav className="hidden gap-7 font-mono text-[0.8rem] tracking-[-0.01em] text-muted sm:flex">
            <a className="transition hover:text-ink" href="#approach">
              Approach
            </a>
            <a className="transition hover:text-ink" href="#services">
              Services
            </a>
            <a className="transition hover:text-ink" href="#results">
              Results
            </a>
          </nav>
          <Button href="#contact" variant="ghost">
            Start a conversation
          </Button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <Section padded={false} className="overflow-hidden">
          {/* gradient glow: strong toward the bottom, faint wash up top */}
          <GradientField className="opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_58%_at_50%_38%,theme(colors.paper)_34%,rgba(252,252,253,0.55)_62%,transparent_100%)]" />
          <Frame className="relative">
            <div className="flex flex-col items-start px-[clamp(24px,5vw,64px)] pb-[clamp(64px,10vw,120px)] pt-[clamp(88px,13vw,168px)]">
              <p className="eyebrow mb-5">AI &amp; automation, done for you</p>
              <h1 className="max-w-[15ch] font-serif text-[clamp(2.7rem,6.6vw,5.2rem)] font-medium leading-[1.01] tracking-[-0.04em]">
                Put AI to work in your business —{" "}
                <span className="gradient-text">without learning a thing.</span>
              </h1>
              <p className="mt-6 max-w-[54ch] text-[clamp(1.05rem,1.6vw,1.22rem)] leading-relaxed text-muted">
                I take the problems slowing your business down and solve them
                with automation, AI, and custom software. You stay focused on
                the business — I handle the technology.
              </p>
              <div className="mt-10 w-full max-w-[520px]" id="contact">
                <OptInForm />
              </div>
            </div>
          </Frame>
        </Section>

        <Divider />

        {/* EMPATHY / APPROACH */}
        <Section id="approach" tone="canvas">
          <Frame>
            <div className="max-w-[52ch] px-[clamp(24px,5vw,64px)]">
              <p className="eyebrow">Why now</p>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                You know AI matters. You just don&apos;t have time to figure it
                out.
              </h2>
              <p className="mt-6 text-[1.1rem] leading-relaxed text-muted">
                That&apos;s the whole point of working with me. You don&apos;t
                need to learn prompts, compare tools, or manage a team of
                developers. You hand me the problem — I hand you back a working
                solution, and explain it in language that actually makes sense.
              </p>
            </div>
          </Frame>
        </Section>

        <Divider />

        {/* SERVICES */}
        <Section id="services">
          <Frame>
            <div className="px-[clamp(24px,5vw,64px)]">
              <div className="mb-[clamp(36px,5vw,56px)] max-w-[44ch]">
                <p className="eyebrow">What I do</p>
                <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                  Three ways I take work off your plate.
                </h2>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
                {services.map((s) => (
                  <article
                    key={s.title}
                    className="flex min-h-[280px] flex-col bg-paper p-[clamp(28px,3vw,40px)]"
                  >
                    <p className="font-mono text-[0.72rem] tracking-[0.02em] text-accent">
                      {s.label}
                    </p>
                    <h3 className="mt-5 font-serif text-[1.7rem] font-medium leading-[1.1] tracking-[-0.03em]">
                      {s.title}
                    </h3>
                    <p className="mt-3.5 leading-relaxed text-muted">{s.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </Frame>
        </Section>

        <Divider />

        {/* HOW IT WORKS */}
        <Section tone="canvas">
          <Frame>
            <div className="px-[clamp(24px,5vw,64px)]">
              <div className="mb-[clamp(36px,5vw,56px)] max-w-[44ch]">
                <p className="eyebrow">How it works</p>
                <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                  Simple to start. Nothing technical asked of you.
                </h2>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line">
                {steps.map((step) => (
                  <article
                    key={step.index}
                    className="grid grid-cols-[56px_1fr] gap-5 bg-paper p-[clamp(24px,3vw,36px)] sm:grid-cols-[80px_1fr]"
                  >
                    <span className="font-mono text-[0.95rem] text-accent">
                      {step.index}
                    </span>
                    <div>
                      <h3 className="font-serif text-[1.4rem] font-medium tracking-[-0.03em]">
                        {step.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Frame>
        </Section>

        <Divider />

        {/* RESULTS / WHO I WORK WITH */}
        <Section id="results" className="overflow-hidden">
          <GradientField className="opacity-40" animate={false} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,theme(colors.paper)_30%,rgba(252,252,253,0.5)_66%,transparent_100%)]" />
          <Frame className="relative">
            <div className="px-[clamp(24px,5vw,64px)]">
              <div className="mx-auto mb-[clamp(36px,5vw,56px)] max-w-[46ch] text-center">
                <p className="eyebrow">Who I work with</p>
                <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                  From local businesses to established companies.
                </h2>
              </div>
              <dl className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
                {promises.map(([value, label]) => (
                  <div
                    key={label}
                    className="bg-paper/90 p-[clamp(28px,4vw,48px)] text-center backdrop-blur-sm"
                  >
                    <dt className="font-serif text-[clamp(2.4rem,4vw,3.4rem)] font-medium tracking-[-0.03em] gradient-text">
                      {value}
                    </dt>
                    <dd className="mx-auto mt-3 max-w-[24ch] font-mono text-[0.78rem] leading-relaxed text-muted">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Frame>
        </Section>

        <Divider />

        {/* CTA */}
        <Section className="overflow-hidden">
          <GradientField className="opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_45%,theme(colors.paper)_32%,rgba(252,252,253,0.5)_64%,transparent_100%)]" />
          <Frame className="relative">
            <div className="mx-auto flex max-w-[620px] flex-col items-center px-[clamp(24px,5vw,64px)] text-center">
              <p className="eyebrow">Let&apos;s talk</p>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                Ready to see what&apos;s possible in your business?
              </h2>
              <p className="mt-6 text-[1.1rem] leading-relaxed text-muted">
                Send me a line about what you do. I&apos;ll come back with where
                AI and automation would actually move the needle for you.
              </p>
              <div className="mt-9 w-full max-w-[520px]">
                <OptInForm />
              </div>
            </div>
          </Frame>
        </Section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-ink-line bg-ink-deep text-on-dark">
        <Frame tone="dark">
          <div className="flex flex-wrap items-center justify-between gap-5 px-[clamp(24px,5vw,64px)] py-[clamp(40px,6vw,72px)]">
            <Brand tone="dark" />
            <nav className="flex gap-6 font-mono text-[0.8rem] text-on-dark-soft">
              <a className="transition hover:text-on-dark" href="#approach">
                Approach
              </a>
              <a className="transition hover:text-on-dark" href="#services">
                Services
              </a>
              <a className="transition hover:text-on-dark" href="#results">
                Results
              </a>
              <a
                className="transition hover:text-on-dark"
                href="mailto:hello@lumen.example"
              >
                Contact
              </a>
            </nav>
            <p className="font-mono text-[0.75rem] text-on-dark-soft">
              © 2026 Lumen
            </p>
          </div>
        </Frame>
      </footer>
    </div>
  );
}
