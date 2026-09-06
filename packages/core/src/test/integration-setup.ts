// Integration tests only ever touch the test database. Refuse to run otherwise.
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("TEST_DATABASE_URL is not set; run pnpm test:integration from the repo root.");
if (!/_test(\?|$)/.test(testUrl)) throw new Error("TEST_DATABASE_URL must point at a database whose name ends in _test.");
process.env.DATABASE_URL = testUrl;
