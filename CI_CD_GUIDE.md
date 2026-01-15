# FOST CI/CD Integration Guide

This guide covers FOST's comprehensive CI/CD capabilities for automating SDK generation, validation, and publishing.

## Table of Contents

1. [Quick Start](#quick-start)
2. [GitHub Actions](#github-actions)
3. [GitLab CI](#gitlab-ci)
4. [Local CI/CD](#local-cicd)
5. [Package Publishing](#package-publishing)
6. [Environment Setup](#environment-setup)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. **Setup Your Repository**

```bash
# Add API specs to your repo
mkdir -p api-specs
cp your-api-spec.json api-specs/

# Commit to git
git add .
git commit -m "Add API specifications"
```

### 2. **Enable CI/CD**

**For GitHub:**
- Workflows are automatically detected from `.github/workflows/generate-and-publish-sdk.yml`
- No additional setup needed

**For GitLab:**
- Add `.gitlab-ci.yml` to your repository root
- No additional setup needed

### 3. **Configure Secrets**

**GitHub Secrets** (Settings → Secrets and Variables → Actions):
```
NPM_TOKEN=your-npm-token
PYPI_TOKEN=your-pypi-token
SLACK_WEBHOOK_URL=your-slack-webhook
```

**GitLab CI/CD Variables** (Settings → CI/CD → Variables):
```
NPM_TOKEN: your-npm-token
PYPI_TOKEN: your-pypi-token
SLACK_WEBHOOK_URL: your-slack-webhook
```

---

## GitHub Actions

### Workflow: `generate-and-publish-sdk.yml`

Automatically generates SDKs when API specs change and optionally publishes them.

### Trigger Events

1. **Push to main/dev** (with spec changes)
   ```
   Detects changes → Generates SDKs → Publishes (main only)
   ```

2. **Pull Request** (with spec changes)
   ```
   Detects changes → Generates SDKs → Comments on PR
   ```

3. **Manual Trigger** (workflow_dispatch)
   ```
   GitHub UI → Workflow → Run workflow → Select options
   ```

### Workflow Structure

```
┌─────────────────────┐
│  detect-changes     │  (Detect modified API specs)
└──────────┬──────────┘
           │
           ├─ Changed specs?
           │
           v
┌─────────────────────┐
│  generate-sdk       │  (Multi-language generation)
│  (TypeScript/Python │
│   /Go - parallel)   │
└──────────┬──────────┘
           │
           ├─ If main branch
           │
           v
    ┌──────┴──────┐
    │             │
    v             v
┌─────────────┐ ┌──────────────┐
│publish-npm  │ │publish-pypi  │
└─────────────┘ └──────────────┘
```

### Example Workflow Run

```bash
# 1. Modify API spec
echo '{...updated spec...}' > api-specs/my-api.json

# 2. Push changes
git add api-specs/my-api.json
git commit -m "Update API spec"
git push origin feature-branch

# 3. Create PR
# → GitHub Actions runs:
#    ✓ Detects spec changes
#    ✓ Generates TypeScript/Python/Go SDKs
#    ✓ Validates generated code
#    ✓ Comments on PR with artifacts

# 4. Merge to main
# → If publish enabled:
#    ✓ Publishes to npm
#    ✓ Publishes to PyPI
#    ✓ Creates GitHub Release
```

### Configuration Options

In `.github/workflows/generate-and-publish-sdk.yml`:

```yaml
# Control which branches trigger the workflow
on:
  push:
    branches:
      - main    # Generate + Publish
      - dev     # Generate only
```

### Manual Trigger

Go to **Actions** tab → **Generate and Publish SDK** → **Run workflow**

Options:
- **sdk_name**: Leave empty to auto-detect all changed specs
- **publish**: Set to `true` to publish to package managers

---

## GitLab CI

### Pipeline: `.gitlab-ci.yml`

Similar to GitHub Actions but using GitLab CI/CD runner.

### Trigger Events

1. **Push to main/develop**
   ```
   Detects changes → Generates → Validates
   ```

2. **Merge Request**
   ```
   Detects changes → Generates → Validates → Comments
   ```

3. **Manual Pipeline** (web)
   ```
   GitLab UI → CI/CD → Pipelines → Run Pipeline
   ```

### Pipeline Stages

```
1. detect              - Detect API spec changes
2. generate            - Generate SDKs (TS/Python/Go)
3. validate            - Validate generated code
4. publish             - Publish to registries (manual trigger)
5. release             - Create release (manual trigger)
6. notify              - Send Slack notification
```

### Example Pipeline Run

```bash
# 1. Create feature branch
git checkout -b feature/new-api

# 2. Add/modify API spec
git add api-specs/new-api.json
git commit -m "Add new API spec"
git push origin feature/new-api

# 3. Create Merge Request
# → GitLab CI/CD runs automatically:
#    ✓ detect_spec_changes
#    ✓ generate_typescript
#    ✓ generate_python
#    ✓ generate_go
#    ✓ validate_typescript
#    ✓ validate_python
#    ✓ validate_go

# 4. Merge to main
# → Pipeline runs again, ready for manual publish
```

### Manual Actions

In GitLab CI, use the **play** button to run manual jobs:

1. **publish_npm** - Publish TypeScript SDKs to npm
2. **publish_pypi** - Publish Python SDKs to PyPI
3. **create_release** - Create GitLab Release

### Pages Deployment

GitLab automatically publishes SDK documentation:
```
https://your-gitlab-group.gitlab.io/your-project/
```

---

## Local CI/CD

Run CI/CD locally for testing without pushing to git.

### Install Dependencies

```bash
npm install
npm run build
```

### Run Batch Generation

```bash
# Generate SDKs for all specs in api-specs/
npm run batch:generate \
  --specs-dir ./api-specs \
  --output ./generated-sdks \
  --languages typescript,python,go \
  --include-docs \
  --include-tests

# Output:
# generated-sdks/
# ├── my-api-1/
# │   ├── typescript/
# │   ├── python/
# │   └── go/
# └── my-api-2/
#     ├── typescript/
#     ├── python/
#     └── go/
```

### Options

```bash
--specs-dir <path>        # Directory containing API specs (default: ./api-specs)
--output <path>           # Output directory (default: ./generated-sdks)
--languages <list>        # Comma-separated languages (default: typescript,python,go)
--parallel <n>            # Number of parallel jobs (default: 3)
--include-docs            # Include documentation
--include-tests           # Include tests
--no-validate             # Skip validation
```

### Run Full CI Locally

```bash
# Build → Generate → Validate (like CI pipeline)
npm run ci:local
```

---

## Package Publishing

### Manual Publishing

Use the `publish:sdk` command to publish a single generated SDK:

```bash
# Publish TypeScript SDK to npm
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm

# Publish Python SDK to PyPI
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/python \
  --registry pypi

# Dry run (no actual publish)
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm \
  --dry-run

# Update version before publishing
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm \
  --version 1.2.3
```

### Supported Registries

| Registry | Command | Requirements |
|----------|---------|--------------|
| npm | `npm` | `NPM_TOKEN` env var |
| PyPI | `pypi` | `PYPI_TOKEN` env var |
| Maven | `maven` | `MVN_REPO_URL`, `MVN_USER`, `MVN_PASSWORD` |
| NuGet | `nuget` | `NUGET_API_KEY` env var |

### Publishing Options

```bash
--sdk-dir <path>      # Path to generated SDK (required)
--registry <name>     # npm, pypi, maven, nuget (default: npm)
--dry-run            # Test publish without uploading
--version <semver>   # Update SDK version before publish
```

---

## Environment Setup

### GitHub Secrets Setup

1. Go to repository **Settings**
2. Select **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

**NPM_TOKEN**
```
Get from: npm.org → Account → Authentication Tokens → Create Token
Scope: Automation (Read and Publish)
```

**PYPI_TOKEN**
```
Get from: pypi.org → Account → API tokens → Add API token
Name: FOST
```

**SLACK_WEBHOOK_URL** (Optional)
```
Get from: Slack Workspace → Apps → Incoming Webhooks → Create
Copy the Webhook URL
```

### GitLab CI/CD Variables Setup

1. Go to project **Settings** → **CI/CD** → **Variables**
2. Click **Add variable**
3. Add these variables:

```
Variable: NPM_TOKEN
Value: [your npm token]
Protect: Yes
Mask: Yes
```

```
Variable: PYPI_TOKEN
Value: [your pypi token]
Protect: Yes
Mask: Yes
```

### Local Environment Variables

```bash
# For local testing
export NPM_TOKEN=your-npm-token
export PYPI_TOKEN=your-pypi-token
export SLACK_WEBHOOK_URL=your-slack-webhook

# Verify
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/typescript --registry npm --dry-run
```

---

## Troubleshooting

### Issue: No specs detected in CI

**Symptoms:** Pipeline runs but no SDKs generated

**Solutions:**
1. Check spec file extension (`.json`, `.yaml`, `.yml`)
2. Ensure spec is in `api-specs/` directory
3. Verify spec was actually changed/added in commit
4. Check GitHub Actions logs for `detect-changes` job

**Debug:**
```bash
# Locally check what specs are detected
git diff HEAD~1 --name-only | grep api-specs
```

### Issue: SDK generation fails

**Symptoms:** `generate-sdk` job fails in CI

**Solutions:**
1. Check spec validity with local generation:
   ```bash
   npm run cli -- generate --input ./api-specs/my-api.json --language typescript
   ```
2. Check logs for specific language errors
3. Validate OpenAPI spec:
   ```bash
   npm run cli -- validate --input ./api-specs/my-api.json
   ```

### Issue: Publishing fails to npm

**Symptoms:** `publish-npm` job fails, authentication error

**Solutions:**
1. Verify `NPM_TOKEN` is set in GitHub Secrets:
   ```bash
   # In GitHub Actions logs, you should see:
   echo "npm token found" (if correctly masked)
   ```
2. Check token is valid:
   ```bash
   npm whoami --registry https://registry.npmjs.org/
   ```
3. Ensure package name is unique (not already published)
4. Check `package.json` has valid `name` field

### Issue: GitHub Actions not running

**Symptoms:** Workflow doesn't trigger on push

**Solutions:**
1. Verify workflow file is in `.github/workflows/` directory
2. Check branch name matches trigger conditions
3. Ensure YAML syntax is valid (use VS Code YAML extension)
4. Manually trigger workflow to test:
   - Go to **Actions** tab
   - Select workflow
   - Click **Run workflow**

### Issue: Pull Request comment not appearing

**Symptoms:** No CI status comment on PR

**Solutions:**
1. Verify permissions in workflow:
   ```yaml
   permissions:
     pull-requests: write
   ```
2. Check PR is from same repository (not fork)
3. Enable "Allow GitHub Actions to create and approve pull requests"
   in repo settings

### Issue: Rate limiting from package managers

**Symptoms:** Publishing fails with rate limit error

**Solutions:**
1. Add delay between publishes (configure in workflow)
2. Check package manager limits:
   - npm: 50 requests/minute (free)
   - PyPI: No strict limit, but use `skip-existing`
3. Use separate tokens for different environments

### Debugging Tips

**View GitHub Actions Logs:**
1. Push changes to trigger workflow
2. Go to **Actions** tab
3. Click on workflow run
4. Click on job to see logs

**View GitLab Pipeline Logs:**
1. Go to **CI/CD** → **Pipelines**
2. Click on pipeline
3. Click on job to see logs

**Local Testing:**
```bash
# Test generation locally first
npm run batch:generate \
  --specs-dir ./api-specs \
  --output ./generated-sdks

# Test publishing (dry run)
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm \
  --dry-run
```

---

## Advanced Configuration

### Custom SDK Naming

In your CI/CD workflow, customize SDK package names:

**GitHub Actions:**
```yaml
- name: Generate with custom name
  run: |
    npm run cli -- generate \
      --input api-specs/my-api.json \
      --language typescript \
      --output generated-sdks/my-api/typescript \
      --package-name @myorg/my-api-sdk
```

### Multi-Registry Publishing

Publish same SDK to multiple registries:

```bash
# npm
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/typescript --registry npm

# npm (scoped)
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/typescript --registry npm --version 1.2.3

# PyPI (Python)
npm run publish:sdk --sdk-dir ./generated-sdks/my-api/python --registry pypi
```

### Conditional Publishing

Only publish on certain conditions:

**GitHub Actions:**
```yaml
if: |
  github.event_name == 'push' && 
  github.ref == 'refs/heads/main' &&
  contains(github.event.head_commit.message, '[publish]')
```

**GitLab CI:**
```yaml
only:
  - main
  - web  # Manual trigger only
```

---

## Next Steps

1. **[Set up your repository](#environment-setup)** with API specs
2. **[Configure secrets](#environment-setup)** for package publishing
3. **[Test locally](#local-cicd)** with batch generation
4. **[Push changes](#github-actions)** to trigger CI/CD
5. **[Monitor runs](#troubleshooting)** in GitHub Actions or GitLab CI

For more help, check the [Troubleshooting](#troubleshooting) section or file an issue on GitHub.
