/** Mirrors public/Nazarii-Tsubera-Resume.pdf. Update both together. */
export const EXPERIENCE = {
  company: "Global Virtual Opportunities",
  role: "Backend and Infrastructure Engineer",
  period: "May 2025 — present",
  place: "San Antonio, Texas",
  products: "markomax.com · nowlifestyle.com · gotbackup.com · gogvo.com",
  bullets: [
    "Re-architected MarkoMax from a basic post composer into a production social-media orchestration platform serving 2,000+ users on a 3-node Docker Swarm backed by PostgreSQL, Redis and Ceph.",
    "Built async media-processing and generation pipelines producing ~10,000 posts a day, with SSE status streaming, idempotent job handling, and heartbeat and stale-job detection for automatic recovery after worker failure.",
    "Cut per-post AI generation cost by chunking source video and caching fragments by cosine similarity over vector embeddings, serving near-duplicate requests from prior renders.",
    "Built a public MCP server and a Mastra/LangGraph auto-reply system handling 70,000+ social messages a day across Instagram, Facebook and LinkedIn.",
    "Built integration-test infrastructure for a legacy payments monolith with Vitest, Testcontainers and real dependencies, isolated with tmpfs-backed database state across 4 parallel CI forks. Led a team of 4 engineers; ran code reviews and hiring loops.",
    "Led the payments platform migration from PHP 7.4 to 8.4 with characterization tests and gradual rollout; now containerizing it and moving workloads toward Kubernetes.",
    "Drove infrastructure modernization across 140+ Linux servers: Ansible IaC, centralized Git configuration, CI-run playbooks, HA load balancing, Ceph-backed external state, OpenObserve logging and metrics.",
    "Designed a 4-attempt SMS dunning sequence for a 15,000-user affiliate CRM, with severity scaled to account-deletion proximity and magic-link payment updates, cutting failed payments from 10.7% to 5.2%.",
  ],
};

export const SIDE_PROJECTS = [
  {
    title: "SheetX",
    stack: "Google Sheets API · diff3 reconciliation",
    href: "https://sheetx.co/",
    body: "A bidirectional sync engine for concurrent human and API edits, using stable row identity and diff3 reconciliation to merge conflicting state without silently overwriting changes. Durable, eventually consistent writes: bursts collapse into batched Google API jobs, and quota-limited jobs re-enqueue until reconciliation completes.",
  },
  {
    title: "OpenRenderer",
    stack: "C++ · OpenGL · CMake · GLSL",
    href: "https://github.com/NazariiTsubera/OpenRenderer",
    body: "A modular rendering engine with configurable render passes, shader and material abstractions, GPU buffer and texture management, and experimental ray-marching shaders.",
  },
  {
    title: "Circuit X",
    stack: "C++ · SFML · ImGui · Eigen",
    href: "https://github.com/NazariiTsubera/circuitx",
    body: "A real-time circuit simulator with a Backward-Euler differential solver and a Modified Nodal Analysis pipeline that turns drawn schematics into solvable node trees.",
  },
];

export const SKILLS = [
  { group: "Programming", items: "C++, TypeScript, JavaScript, PHP, SQL, Python, Java" },
  { group: "Backend & systems", items: "NestJS, Symfony, Laravel, Linux, Docker, Kubernetes, Ansible, AWS, GitLab CI/CD" },
  { group: "Data & infrastructure", items: "PostgreSQL, MySQL, Redis, Ceph/S3, Kafka, gRPC, BullMQ, Nginx, OpenObserve" },
  { group: "Testing & AI", items: "Vitest, Testcontainers, Playwright, LangGraph, Mastra, MCP, vector embeddings" },
];

export const EDUCATION = [
  {
    school: "University of Texas at San Antonio",
    degree: "B.S. Computer Science",
    when: "Expected 2028",
  },
  {
    school: "Northeast Lakeview College",
    degree: "A.S. Computer Science, GPA 4.0",
    when: "2026",
    note: "81+ credits in one year. Twice on the President’s List. Phi Theta Kappa.",
  },
];
