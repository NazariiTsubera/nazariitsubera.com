const tools = [
  {
    status: "Free core",
    name: "PipeLab",
    description:
      "Visualize CPU pipelines, stalls, forwarding, and hazards in a browser-native simulator built for repeat practice.",
    meta: "Architecture simulator",
  },
  {
    status: "Local-first",
    name: "Prompt Shelf",
    description:
      "Store prompt templates, variables, and tested versions in a focused workspace that never turns into a messy doc.",
    meta: "Prompt operations",
  },
  {
    status: "Beta",
    name: "CiteGuard",
    description:
      "Scan bibliographies for weak chains, retracted work, and sources that deserve another pass before publishing.",
    meta: "Research QA",
  },
];

const metrics = [
  ["3", "focused tools"],
  ["0", "account walls"],
  ["< 30s", "to first result"],
];

const workflow = [
  {
    title: "Open the exact tool",
    text: "No suite navigation, no onboarding maze, no generic dashboard before the useful screen.",
  },
  {
    title: "Run the job in-browser",
    text: "Each utility is designed around a single repeatable task with obvious inputs and portable outputs.",
  },
  {
    title: "Leave with a clean artifact",
    text: "Copy results, save locally, or hand the output to another workflow without hidden lock-in.",
  },
];

const consoleLines = [
  ["pipe", "load risc-v hazard set"],
  ["scan", "detect 7 data hazards"],
  ["fix", "forwarding path suggested"],
  ["done", "24 checks passed"],
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Lumen Tools home">
      <span className="brandMark">L</span>
      <span>Lumen Tools</span>
    </a>
  );
}

function Arrow() {
  return <span aria-hidden="true">-&gt;</span>;
}

export default function Home() {
  return (
    <>
      <header className="siteHeader">
        <Brand />
        <nav className="navLinks" aria-label="Primary navigation">
          <a href="#tools">Tools</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
        </nav>
        <a className="headerCta" href="#tools">
          Try free <Arrow />
        </a>
      </header>

      <main id="top">
        <section className="heroSection">
          <div className="heroCopy">
            <p className="eyebrow">Browser utilities for people who move fast</p>
            <h1>Small tools that feel like unfair advantage.</h1>
            <p className="heroText">
              Lumen Tools turns specific, annoying workflows into fast browser
              surfaces: simulate, check, organize, and ship the result without
              installing a heavyweight app.
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#tools">
                Explore live tools <Arrow />
              </a>
              <a className="secondaryButton" href="#workflow">
                See how it works
              </a>
            </div>
            <dl className="metricStrip">
              {metrics.map(([value, label]) => (
                <div key={label}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="productShowcase" aria-label="Lumen Tools product preview">
            <div className="showcaseTopbar">
              <span />
              <span />
              <span />
              <strong>PipeLab session</strong>
            </div>
            <div className="showcaseGrid">
              <div className="panel timelinePanel">
                <div className="panelHeader">
                  <span>Cycle map</span>
                  <strong>12 ms</strong>
                </div>
                <div className="cycleGrid">
                  {Array.from({ length: 40 }).map((_, index) => (
                    <span
                      className={
                        index % 11 === 0
                          ? "cell hot"
                          : index % 7 === 0
                            ? "cell warn"
                            : index % 5 === 0
                              ? "cell cool"
                              : "cell"
                      }
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="panel commandPanel">
                <div className="panelHeader">
                  <span>Run log</span>
                  <strong>clean</strong>
                </div>
                <div className="consoleLines">
                  {consoleLines.map(([tag, line]) => (
                    <p key={line}>
                      <span>{tag}</span>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="panel resultPanel">
                <span className="resultLabel">Suggested next action</span>
                <strong>Add forwarding from MEM/WB to EX</strong>
                <p>
                  Removes one bubble while keeping the load-use stall explicit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="logoBand" aria-label="Positioning">
          <span>Built for students</span>
          <span>Makers</span>
          <span>Analysts</span>
          <span>Research workflows</span>
          <span>Practice loops</span>
        </section>

        <section className="sectionShell" id="tools">
          <div className="sectionHeading">
            <p className="eyebrow">Live surfaces</p>
            <h2>Focused tools with product-grade interfaces.</h2>
            <p>
              Each tool gets a dedicated workflow, polished defaults, and a
              clear exit path. No vague bundle. No fake platform story.
            </p>
          </div>

          <div className="toolGrid">
            {tools.map((tool) => (
              <article className="toolCard" key={tool.name}>
                <div>
                  <span className="statusPill">{tool.status}</span>
                  <p className="toolMeta">{tool.meta}</p>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>
                <a href="#book">
                  Open {tool.name} <Arrow />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="splitSection" id="workflow">
          <div className="sectionHeading compact">
            <p className="eyebrow">Conversion path</p>
            <h2>From landing page to useful result in one minute.</h2>
          </div>
          <div className="workflowList">
            {workflow.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="proofSection" id="proof">
          <div>
            <p className="eyebrow">Why it converts</p>
            <h2>Specific beats impressive.</h2>
          </div>
          <div className="proofGrid">
            <article>
              <strong>No signup cliff</strong>
              <p>Visitors can touch the useful surface before committing.</p>
            </article>
            <article>
              <strong>Product visible above the fold</strong>
              <p>The page shows what the tool does instead of hiding behind copy.</p>
            </article>
            <article>
              <strong>Clear audience and jobs</strong>
              <p>Students, makers, and analysts see focused workflows quickly.</p>
            </article>
          </div>
        </section>

        <section className="ctaSection" id="book">
          <p className="eyebrow">Start lightweight</p>
          <h2>Pick one small workflow and finish it.</h2>
          <p>
            Lumen Tools is for the tasks that should be faster than opening a
            full application, configuring a workspace, or asking where the
            export button went.
          </p>
          <a className="primaryButton" href="#tools">
            Choose a tool <Arrow />
          </a>
        </section>
      </main>

      <footer className="siteFooter">
        <Brand />
        <nav aria-label="Footer navigation">
          <a href="#tools">Tools</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
          <a href="mailto:hello@lumentools.example">Contact</a>
        </nav>
      </footer>
    </>
  );
}
