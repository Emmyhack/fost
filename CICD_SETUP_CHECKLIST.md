# FOST CI/CD Setup Checklist

Complete this checklist to set up FOST CI/CD in your project.

---

## ✅ Phase 1: Local Setup (5 minutes)

- [ ] Clone/fork FOST repository
  ```bash
  git clone https://github.com/your-org/fost.git
  cd fost
  ```

- [ ] Install dependencies
  ```bash
  npm install
  npm run build
  ```

- [ ] Test local SDK generation
  ```bash
  npm run batch:generate --specs-dir ./api-specs --output ./generated-sdks
  ```

- [ ] Create `api-specs/` directory if it doesn't exist
  ```bash
  mkdir -p api-specs
  ```

- [ ] Add your first API spec
  ```bash
  # Copy your OpenAPI spec or create a test one
  cp your-api-spec.json api-specs/
  ```

---

## ✅ Phase 2: Git Setup (5 minutes)

- [ ] Initialize git repository (if not already)
  ```bash
  git init
  git add .
  git commit -m "Initial commit with FOST CI/CD"
  ```

- [ ] Add remote origin
  ```bash
  git remote add origin https://github.com/your-org/your-repo.git
  ```

- [ ] Push to GitHub or GitLab
  ```bash
  git push -u origin main
  ```

---

## ✅ Phase 3: GitHub Actions Setup (10 minutes)

**If using GitHub:**

- [ ] Workflow file already exists
  ```bash
  cat .github/workflows/generate-and-publish-sdk.yml
  ```

- [ ] Go to repository **Settings** → **Secrets and variables** → **Actions**

- [ ] Create `NPM_TOKEN` secret
  ```
  Name: NPM_TOKEN
  Secret: [your-npm-token]
  ```

- [ ] Create `PYPI_TOKEN` secret
  ```
  Name: PYPI_TOKEN
  Secret: [your-pypi-token]
  ```

- [ ] (Optional) Create `SLACK_WEBHOOK_URL` secret for notifications
  ```
  Name: SLACK_WEBHOOK_URL
  Secret: [your-slack-webhook]
  ```

- [ ] Go to **Actions** tab and verify workflow exists
  - Workflow: "Generate and Publish SDK"
  - Should appear in the list

---

## ✅ Phase 4: GitLab CI Setup (10 minutes)

**If using GitLab:**

- [ ] Pipeline file already exists
  ```bash
  cat .gitlab-ci.yml
  ```

- [ ] Go to project **Settings** → **CI/CD** → **Variables**

- [ ] Add `NPM_TOKEN` variable
  ```
  Key: NPM_TOKEN
  Value: [your-npm-token]
  Protect: Yes
  Mask: Yes
  ```

- [ ] Add `PYPI_TOKEN` variable
  ```
  Key: PYPI_TOKEN
  Value: [your-pypi-token]
  Protect: Yes
  Mask: Yes
  ```

- [ ] (Optional) Add `SLACK_WEBHOOK_URL` variable for notifications

- [ ] Go to **CI/CD** → **Pipelines** and verify pipeline runs on next push

---

## ✅ Phase 5: Test Workflow (5 minutes)

**Create a test commit:**

- [ ] Create API spec or modify existing one
  ```bash
  echo '{"openapi":"3.0.0","info":{"title":"Test API","version":"1.0.0"},"paths":{}}' > api-specs/test.json
  ```

- [ ] Commit and push
  ```bash
  git add api-specs/
  git commit -m "Add test API spec"
  git push origin main
  ```

- [ ] **GitHub:** Go to **Actions** tab
  - [ ] Verify workflow started
  - [ ] Watch "Generate and Publish SDK" job
  - [ ] Check for errors in logs

- [ ] **GitLab:** Go to **CI/CD** → **Pipelines**
  - [ ] Verify pipeline started
  - [ ] Watch jobs complete
  - [ ] Check for errors in logs

---

## ✅ Phase 6: Verify Generated SDKs (5 minutes)

- [ ] **GitHub:**
  - [ ] Go to workflow run
  - [ ] Scroll to **Artifacts**
  - [ ] Download generated SDK (e.g., `generated-sdk-test`)
  - [ ] Extract and verify contents

- [ ] **GitLab:**
  - [ ] Click on job
  - [ ] Go to **Artifacts**
  - [ ] Download generated SDKs
  - [ ] Extract and verify contents

- [ ] Check generated SDK structure
  ```
  generated-sdk-test/
  ├── typescript/
  │   ├── package.json
  │   ├── src/
  │   └── README.md
  ├── python/
  │   ├── setup.py
  │   ├── src/
  │   └── README.md
  └── go/
      ├── go.mod
      ├── *.go
      └── README.md
  ```

---

## ✅ Phase 7: Configure Publishing (10 minutes)

**Only if you want to auto-publish to registries:**

- [ ] Get npm authentication token
  ```
  npm.org → Account → Authentication Tokens → Create Token
  Scope: Automation (Read and Publish)
  ```

- [ ] Add to GitHub Secrets or GitLab Variables
  ```
  NPM_TOKEN=npm_xxxxxxxxxxxx
  ```

- [ ] Get PyPI authentication token
  ```
  pypi.org → Account → API tokens → Add API token
  Copy the token (format: pypi-AgEI...)
  ```

- [ ] Add to GitHub Secrets or GitLab Variables
  ```
  PYPI_TOKEN=pypi-AgEIcHlwaS5vcmc...
  ```

- [ ] Verify by running manual publish (dry-run)
  ```bash
  npm run publish:sdk \
    --sdk-dir ./generated-sdks/test/typescript \
    --registry npm \
    --dry-run
  ```

---

## ✅ Phase 8: Enable Auto-Publishing (5 minutes)

**For GitHub Actions:**

- [ ] Publishing jobs are already configured in `.github/workflows/generate-and-publish-sdk.yml`
  - Triggered automatically on pushes to `main` branch
  - Or use `workflow_dispatch` to manually trigger

**For GitLab CI:**

- [ ] Go to **CI/CD** → **Pipelines**
- [ ] Run pipeline with manual trigger
- [ ] Click **play** button on `publish_npm` job
- [ ] Click **play** button on `publish_pypi` job

---

## ✅ Phase 9: Add More API Specs (Optional)

- [ ] Add multiple API specs
  ```bash
  cp api-1.json api-specs/
  cp api-2.json api-specs/
  cp api-3.json api-specs/
  git add api-specs/
  git commit -m "Add more API specs"
  git push
  ```

- [ ] Workflow should detect all changes and generate for each

- [ ] Verify all SDKs generated
  ```bash
  ls -la generated-sdks/
  ```

---

## ✅ Phase 10: Set Up Notifications (Optional)

**Slack Integration:**

- [ ] Get Slack webhook URL
  ```
  Slack → Your Workspace → Apps → Incoming Webhooks → Create
  Copy the Webhook URL
  ```

- [ ] Add to secrets as `SLACK_WEBHOOK_URL`

- [ ] Next CI run will send Slack notifications

- [ ] Verify notifications appear in Slack channel

---

## ✅ Advanced: Scheduled Builds (Optional)

**GitHub Actions - Daily Generation:**

Edit `.github/workflows/generate-and-publish-sdk.yml` and add:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
```

**GitLab CI - Weekly Generation:**

Add to `.gitlab-ci.yml`:

```yaml
# In GitLab UI:
# CI/CD → Schedules → New schedule
# Select branch → Save
```

---

## ✅ Troubleshooting

If any step fails:

1. **Check logs:**
   - GitHub: **Actions** tab → Click workflow run → Click job
   - GitLab: **CI/CD** → **Pipelines** → Click job

2. **Run locally to debug:**
   ```bash
   npm run batch:generate --specs-dir ./api-specs --output ./generated-sdks
   ```

3. **Check environment variables:**
   ```bash
   # Verify tokens are set
   echo $NPM_TOKEN
   echo $PYPI_TOKEN
   ```

4. **Test publishing (dry-run):**
   ```bash
   npm run publish:sdk \
     --sdk-dir ./generated-sdks/test/typescript \
     --registry npm \
     --dry-run
   ```

5. **See [CI_CD_GUIDE.md](./CI_CD_GUIDE.md#troubleshooting) for more troubleshooting**

---

## 🎉 Done!

Your FOST CI/CD is now set up! 

**Next time you:**
- ✅ Add/modify an API spec
- ✅ Commit and push to main
- ✅ SDKs generate automatically
- ✅ Publish to npm/PyPI

---

## Quick Reference

### Useful Commands

```bash
# Local SDK generation
npm run batch:generate --specs-dir ./api-specs --output ./generated-sdks

# Local validation
npm run ci:validate

# Manual publish to npm
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/typescript --registry npm

# Manual publish to PyPI
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/python --registry pypi

# Dry-run (test without publishing)
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/typescript --registry npm --dry-run
```

### Important Files

- `.github/workflows/generate-and-publish-sdk.yml` - GitHub Actions
- `.gitlab-ci.yml` - GitLab CI
- `scripts/batch-generate.ts` - Batch generation
- `scripts/publish-sdk.ts` - Publishing
- `CI_CD_GUIDE.md` - Full documentation
- `CI_CD_EXAMPLES.md` - Copy-paste examples

### Support

- 📖 [Full Guide](./CI_CD_GUIDE.md)
- 📋 [Examples](./CI_CD_EXAMPLES.md)
- 🐛 [Issues](https://github.com/your-org/fost/issues)

---

**Last Updated:** January 15, 2026
**FOST Version:** 0.1.0+
