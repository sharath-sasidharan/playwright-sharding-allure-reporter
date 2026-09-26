# Playwright Sharding + Allure Reporter + GitHub Actions

A Playwright automation project demonstrating **parallel test execution using sharding**, **Allure reporting**, **GitHub Actions CI**, and **automatic deployment of the Allure report to GitHub Pages**.

## 🚀 Live Allure Report

**[View the Latest Allure Report](https://sharath-sasidharan.github.io/playwright-sharding-allure-reporter/)**

---

## 📌 Project Overview

This project demonstrates how to run Playwright tests in multiple shards using GitHub Actions.

Instead of running the complete test suite in a single CI job, the tests are divided into multiple shards.

For example, with 2 shards:

```text
GitHub Actions
      │
      ├── Shard 1/2
      │     └── Playwright Tests
      │
      └── Shard 2/2
            └── Playwright Tests
```

Each shard produces its own Allure test results.

The results are then combined into a single Allure report and automatically deployed to GitHub Pages.

---

# 🛠️ Tech Stack

* Playwright
* TypeScript
* Node.js
* Allure Report
* GitHub Actions
* GitHub Pages
* npm

---

# 1. 📦 Project Setup

Create a Playwright project:

```bash
npm init playwright@latest
```

Select:

```text
TypeScript
Playwright tests
```

Install the project dependencies:

```bash
npm install
```

---

# 2. 📊 Install Allure Reporter

Install the Playwright Allure reporter:

```bash
npm install -D allure-playwright
```

Install the Allure command-line tool:

```bash
npm install -D allure-commandline
```

The two packages have different purposes:

### `allure-playwright`

Generates the raw Allure test result files after Playwright tests run.

### `allure-commandline`

Takes those result files and generates the actual HTML Allure report.

---

# 3. ⚙️ Configure Allure in Playwright

In `playwright.config.ts`, configure the reporters:

```typescript
reporter: [
  ['list'],
  ['allure-playwright']
],
```

Example:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  reporter: [
    ['list'],
    ['allure-playwright']
  ],

  use: {
    trace: 'on-first-retry'
  }
});
```

After running the tests, Allure result files are generated inside:

```text
allure-results/
```

These files contain the raw test execution information used to build the final Allure report.

---

# 4. ▶️ Run Playwright Tests Locally

Run the complete test suite:

```bash
npx playwright test
```

This generates Allure results:

```text
allure-results/
```

---

# 5. 🔀 Playwright Sharding

Playwright supports sharding using:

```bash
--shard
```

For example, to divide the test suite into 2 shards:

### Shard 1

```bash
npx playwright test --shard=1/2
```

### Shard 2

```bash
npx playwright test --shard=2/2
```

The test suite is divided between the two shards.

Conceptually:

```text
100 Tests
   │
   ├── Shard 1/2
   │      └── Part of the tests
   │
   └── Shard 2/2
          └── Remaining tests
```

The purpose of sharding is to distribute the test suite across multiple CI jobs.

---

# 6. 📄 Generate the Allure Report Locally

After running the tests, generate the HTML report:

```bash
npx allure generate allure-results --clean -o allure-report
```

This creates:

```text
allure-report/
```

The `allure-results` directory contains the **raw test result data**.

The `allure-report` directory contains the **generated HTML report**.

---

# 7. 🌐 Open the Allure Report Locally

Run:

```bash
npx allure open allure-report
```

This opens the report in the browser.

The local report is useful for checking the results before implementing CI.

---

# 8. 🤖 GitHub Actions CI

A GitHub Actions workflow was created under:

```text
.github/workflows/playwright.yml
```

The workflow automatically runs when code is pushed to the repository or a pull request is created.

The workflow uses a matrix strategy to create two shard jobs.

```yaml
strategy:
  matrix:
    shard: [1, 2]
```

Each job runs a different shard:

```yaml
run: npx playwright test --shard=${{ matrix.shard }}/2
```

This results in:

```text
GitHub Actions
│
├── test (1)
│     └── Shard 1/2
│
└── test (2)
      └── Shard 2/2
```

The two jobs can run independently and in parallel.

---

# 9. 📦 Upload Allure Results as Artifacts

Each shard generates its own `allure-results`.

The workflow uploads the results using GitHub Actions artifacts.

Shard 1:

```text
allure-results-1
```

Shard 2:

```text
allure-results-2
```

Example:

```yaml
- name: Upload Allure Results
  if: ${{ !cancelled() }}
  uses: actions/upload-artifact@v4
  with:
    name: allure-results-${{ matrix.shard }}
    path: allure-results/
    retention-days: 30
```

This allows the results from both CI jobs to be used later.

---

# 10. 🔗 Combine Allure Results

A separate `report` job runs after the test jobs.

```yaml
report:
  needs: test
```

The report job downloads the results from all shards:

```yaml
- name: Download Allure Results
  uses: actions/download-artifact@v4
  with:
    pattern: allure-results-*
    path: allure-results
    merge-multiple: true
```

The results are combined into:

```text
allure-results/
```

The combined results are then used to generate one Allure report:

```bash
allure generate allure-results --clean -o allure-report
```

---

# 11. 📊 Generate the Combined Allure Report

The report job installs the Allure command-line tool:

```yaml
- name: Install Allure Commandline
  run: npm install -g allure-commandline
```

Then generates the report:

```yaml
- name: Generate Allure Report
  run: allure generate allure-results --clean -o allure-report
```

The final report is stored in:

```text
allure-report/
```

This report contains the results from both shards.

---

# 12. 📤 Upload the Final Allure Report

The generated report is also stored as a GitHub Actions artifact:

```yaml
- name: Upload Allure Report
  if: ${{ always() }}
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
    retention-days: 30
```

This allows the generated report to be downloaded from the GitHub Actions run.

---

# 13. 🌐 GitHub Pages Deployment

GitHub Pages was configured as the deployment destination.

The workflow uploads the generated Allure report as a Pages artifact:

```yaml
- name: Upload Pages Artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: allure-report
```

A separate deployment job then publishes it:

```yaml
deploy:
  needs: report
```

The deployment uses:

```yaml
uses: actions/deploy-pages@v4
```

The workflow also has the required permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

---

# 14. 🔄 Complete CI/CD Flow

The complete workflow is:

```text
Developer pushes code
        │
        ▼
GitHub Actions
        │
        ├──────────────────┐
        ▼                  ▼
   Shard 1/2           Shard 2/2
   Playwright          Playwright
        │                  │
        ▼                  ▼
allure-results-1     allure-results-2
        │                  │
        └────────┬─────────┘
                 ▼
          Report Job
                 │
                 ▼
       Combine Allure Results
                 │
                 ▼
        Generate Allure Report
                 │
                 ▼
        Upload Pages Artifact
                 │
                 ▼
         GitHub Pages Deploy
                 │
                 ▼
        🌐 Shareable Report URL
```

---

# 15. 📁 Important Project Structure

The project contains the following important components:

```text
playwright-sharding-allure-reporter/
│
├── tests/
│   └── *.spec.ts
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

The following directories are generated during execution:

```text
allure-results/
allure-report/
```

---

# 16. 💡 Why Use Sharding?

Without sharding:

```text
GitHub Actions
      │
      ▼
 One CI Job
      │
      ▼
All Playwright Tests
```

With sharding:

```text
GitHub Actions
      │
      ├── Job 1 → Shard 1/2
      │
      └── Job 2 → Shard 2/2
```

Sharding allows the test suite to be distributed across multiple CI jobs.

This can reduce the overall CI execution time when the test suite is large enough to benefit from parallel execution.

---

# 17. 🧠 Worker vs Shard

### Worker

A Playwright worker is a process that executes tests in parallel within a CI job.

### Shard

A shard represents a portion of the overall test suite.

Example:

```text
GitHub Actions
│
├── Job 1
│    └── Shard 1/2
│         ├── Worker 1
│         └── Worker 2
│
└── Job 2
     └── Shard 2/2
          ├── Worker 1
          └── Worker 2
```

So:

**Shard = divides the test suite across CI jobs**

**Worker = executes tests in parallel within a job**

---

# 18. 🎯 What This Project Demonstrates

This project demonstrates practical experience with:

* Playwright automation
* TypeScript
* Test parallelization
* Playwright sharding
* GitHub Actions
* CI pipelines
* Allure reporting
* Artifact management
* Combining test results
* Continuous Delivery
* GitHub Pages deployment
* Shareable automated test reports

---

# 🔗 Live Report

The latest generated Allure report is available here:

**(https://sharath-sasidharan.github.io/playwright-sharding-allure-reporter/)**

---

# 👨‍💻 Author

**Sharath Sasidharan**

QA Engineer | Playwright | TypeScript | Test Automation

GitHub: https://github.com/sharath-sasidaran
