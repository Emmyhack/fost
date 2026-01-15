# FOST CI/CD Quickstart Examples

Quick copy-paste examples to get started with FOST CI/CD.

## Example 1: Local SDK Generation

Generate SDKs from API specs without CI/CD pipeline:

```bash
# Prerequisites
npm install
npm run build

# Generate SDKs for all specs
npm run batch:generate \
  --specs-dir ./api-specs \
  --output ./generated-sdks \
  --languages typescript,python,go \
  --include-docs

# Generated SDKs will be in:
# - ./generated-sdks/my-api/typescript/
# - ./generated-sdks/my-api/python/
# - ./generated-sdks/my-api/go/
```

---

## Example 2: GitHub Actions - Automatic on PR

Automatically generate SDKs when PR modifies API specs:

**File: `.github/workflows/generate-and-publish-sdk.yml`** (already created)

**Setup:**
1. Add API specs to `api-specs/` directory
2. Commit and push to trigger the workflow
3. Check **Actions** tab to see the workflow run

**Result:**
- ✅ SDKs generated for all languages
- ✅ Comment on PR with artifacts
- ✅ Artifacts available for download

---

## Example 3: Manual Publishing to npm

After generating SDKs locally, publish to npm:

```bash
# Set npm token
export NPM_TOKEN=npm_xxxxxxxxxxxx

# Dry run (test before publishing)
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm \
  --dry-run

# Actual publish
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm

# Publish with custom version
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/typescript \
  --registry npm \
  --version 1.0.0
```

---

## Example 4: Publishing Python SDK to PyPI

```bash
# Set PyPI token
export PYPI_TOKEN=pypi-AgEIcHlwaS5vcmc...

# Dry run
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/python \
  --registry pypi \
  --dry-run

# Publish
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/python \
  --registry pypi
```

---

## Example 5: CI/CD Setup - Complete Flow

Complete setup for automatic SDK generation and publishing:

**Step 1: Create API specs directory**
```bash
mkdir -p api-specs
```

**Step 2: Add your first API spec**
```bash
# Create a simple OpenAPI spec
cat > api-specs/petstore.json << 'EOF'
{
  "openapi": "3.0.0",
  "info": {
    "title": "Petstore API",
    "version": "1.0.0"
  },
  "paths": {
    "/pets": {
      "get": {
        "summary": "List all pets",
        "operationId": "listPets",
        "responses": {
          "200": {
            "description": "A list of pets"
          }
        }
      }
    }
  }
}
EOF
```

**Step 3: Add to git and push**
```bash
git add api-specs/
git commit -m "Add Petstore API spec"
git push origin main
```

**Step 4: GitHub Actions runs automatically**
- Detects `api-specs/petstore.json` was added
- Generates TypeScript, Python, Go SDKs
- Comments on PR/creates artifacts
- Ready to publish

**Step 5: Set up publishing (optional)**

GitHub Settings → Secrets and variables → Actions → New repository secret

```
NPM_TOKEN: <your-npm-token>
PYPI_TOKEN: <your-pypi-token>
```

**Step 6: Merge to main and publish**
- Workflow publishes SDKs to npm and PyPI automatically

---

## Example 6: GitLab CI Setup

**Step 1: Add `.gitlab-ci.yml` to your repo** (already created in `FOST`)

**Step 2: Configure CI/CD variables**

GitLab: Settings → CI/CD → Variables

```
NPM_TOKEN: <your-npm-token>
PYPI_TOKEN: <your-pypi-token>
```

**Step 3: Add API specs**
```bash
git add api-specs/
git commit -m "Add API specs"
git push origin main
```

**Step 4: Check pipeline**
- Go to CI/CD → Pipelines
- Watch SDKs generate
- Click "play" on publish jobs to publish

---

## Example 7: Monorepo - Multiple API Specs

Generate SDKs for multiple APIs:

```
your-repo/
├── api-specs/
│   ├── users-api.json
│   ├── payments-api.json
│   ├── notifications-api.json
│   └── analytics-api.json
├── generated-sdks/
│   ├── users-api/
│   │   ├── typescript/
│   │   ├── python/
│   │   └── go/
│   ├── payments-api/
│   │   ├── typescript/
│   │   ├── python/
│   │   └── go/
│   ├── notifications-api/
│   └── analytics-api/
```

**Generate all:**
```bash
npm run batch:generate \
  --specs-dir ./api-specs \
  --output ./generated-sdks \
  --languages typescript,python,go
```

**CI/CD automatically generates all** when any spec changes!

---

## Example 8: Validate Generated Code Locally

Before publishing, validate generated SDKs:

```bash
# Validate TypeScript SDK
cd generated-sdks/my-api/typescript
npm install
npm run build
npm test

# Validate Python SDK
cd ../python
python -m pytest
python -m mypy .

# Validate Go SDK
cd ../go
go test ./...
go vet ./...
```

---

## Example 9: GitHub Actions - Manual Trigger

Manually trigger SDK generation without pushing:

1. Go to **Actions** tab
2. Click **Generate and Publish SDK**
3. Click **Run workflow**
4. Options:
   - **sdk_name**: Leave empty for all specs
   - **publish**: Check to also publish to registries
5. Click **Run workflow**

---

## Example 10: Web3/Smart Contract SDKs

Generate SDKs for Ethereum smart contracts:

**Step 1: Add ABI to specs**
```bash
cat > api-specs/uniswap-v3.json << 'EOF'
{
  "ethereum": true,
  "chainId": 1,
  "contractName": "UniswapV3Router",
  "abi": [
    {
      "name": "swapExactTokensForTokens",
      "type": "function",
      "stateMutability": "nonpayable",
      "inputs": [...],
      "outputs": [...]
    }
  ]
}
EOF
```

**Step 2: Generate Web3 SDK**
```bash
npm run cli -- generate \
  --input api-specs/uniswap-v3.json \
  --language typescript \
  --type web3 \
  --output generated-sdks/uniswap-v3/typescript
```

**Step 3: Use generated Web3 SDK**
```typescript
import { UniswapV3Router } from '@sdk/uniswap-v3';

const router = new UniswapV3Router(provider);
await router.swapExactTokensForTokens({
  amountIn: ethers.parseUnits('1', 18),
  amountOutMin: 0,
  path: [USDC, WETH],
  to: recipientAddress,
  deadline: Math.floor(Date.now() / 1000) + 60 * 20,
});
```

---

## Example 11: Automated Updates

Update SDK every time API spec changes:

**Schedule workflow** (GitHub Actions):
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
```

Or use GitLab **scheduled pipeline**:
```
CI/CD → Schedules → New schedule → Select branch → Save
```

---

## Example 12: Conditional Publishing

Only publish when spec has breaking changes:

**In workflow YAML:**
```yaml
if: contains(github.event.head_commit.message, '[breaking]')
```

**Usage:**
```bash
git commit -m "Update API spec [breaking]"
git push
# → CI/CD detects [breaking] tag and publishes
```

---

## Troubleshooting Quick Fixes

### "No specs detected"
```bash
# Check files exist
ls -la api-specs/

# Check file extensions (.json, .yaml, .yml)
file api-specs/*

# Generate locally to test
npm run cli -- generate --input api-specs/your-spec.json ...
```

### "npm publish failed"
```bash
# Check npm token
npm whoami --registry https://registry.npmjs.org/

# Check package doesn't already exist
npm info @your-org/your-package

# Test publish (dry run)
npm publish --dry-run --registry https://registry.npmjs.org/
```

### "Python package already exists"
```bash
# PyPI doesn't allow version downgrades
# Always use a new version number
npm run publish:sdk \
  --sdk-dir ./generated-sdks/my-api/python \
  --registry pypi \
  --version 2.0.0
```

### "Workflow not triggering"
```bash
# Check file is in correct location
ls -la .github/workflows/generate-and-publish-sdk.yml

# Check YAML syntax (use online YAML validator)
# Check branch name matches trigger conditions
# Try manual trigger: Actions → Run workflow
```

---

## Environment Variables Reference

### npm
```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

### PyPI
```bash
export PYPI_TOKEN=pypi-AgEIcHlwaS5vcmc...
```

### Maven
```bash
export MVN_REPO_URL=https://repo.example.com/
export MVN_USER=your-username
export MVN_PASSWORD=your-password
```

### NuGet
```bash
export NUGET_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Slack (optional)
```bash
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## Next Steps

- ✅ [Set up local generation](#example-1-local-sdk-generation)
- ✅ [Push first API spec](#example-5-cicd-setup---complete-flow)
- ✅ [Watch CI/CD run](#example-2-github-actions---automatic-on-pr)
- ✅ [Publish SDKs](#example-3-manual-publishing-to-npm)
- ✅ [Set up automation](#example-11-automated-updates)

**Questions?** Check [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) for detailed documentation.
