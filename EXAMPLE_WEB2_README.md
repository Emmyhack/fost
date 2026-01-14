# GitHub API SDK

A type-safe TypeScript SDK for the GitHub REST API with built-in error handling, rate limiting, and complete method coverage.

**Version:** 1.0.0

##  Quick Links

- [ Quickstart Guide](#quickstart)
- [ Authentication Guide](#authentication)
- [ Examples](#examples)
- [ Error Handling](#error-handling)
- [ Troubleshooting](#troubleshooting)
- [ GitHub](https://github.com/example/github-sdk)
- [ Full Documentation](https://docs.example.com/github-sdk)

##  Features

- **Complete API coverage** - All GitHub REST API endpoints
- **Type-safe operations** - Full TypeScript support with generated types
- **Enterprise-ready** - Pagination, rate limiting, and retry logic built-in
- **Secure authentication** - OAuth, PAT, and App authentication
- **Comprehensive error handling** - 15+ error types with recovery strategies
- **Well-documented** - Examples for every common use case
- **Zero dependencies** - Lightweight and focused library

##  Installation

### Using npm

```bash
npm install @example/github-sdk
```

### From Source

```bash
git clone https://github.com/example/github-sdk.git
cd github-sdk
npm install
npm run build
```

##  Quick Start

### 1. Import the SDK

```typescript
import { GitHubSDK } from '@example/github-sdk';
```

### 2. Create a Client

```typescript
const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});
```

### 3. Make Your First Call

```typescript
// Get user information
const user = await github.users.getAuthenticatedUser();
console.log(`Hello, ${user.name}!`);
```

 **[Read the full quickstart guide ](#quickstart)**

##  Documentation

- **[Quickstart Guide](./docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Authentication Guide](./docs/AUTHENTICATION.md)** - Set up your credentials
- **[Usage Examples](./docs/EXAMPLES.md)** - Common use cases with code
- **[API Reference](./docs/API_REFERENCE.md)** - Complete method reference
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Understanding error codes and recovery
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

##  Support

**GitHub Issues:** [Report bugs](https://github.com/example/github-sdk/issues)

**Documentation:** [https://docs.example.com/github-sdk](https://docs.example.com/github-sdk)

**Email:** support@example.com

---

#  Authentication

The SDK supports multiple authentication methods:

## Personal Access Token (PAT)

Most common for personal use and CI/CD:

```typescript
const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});
```

### Get Your Token

1. Go to [GitHub Settings  Developer settings  Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes: `repo`, `user`, `gist`
4. Click **Generate token**
5. Store the token securely

### Using Environment Variables

```bash
echo "GITHUB_TOKEN=github_pat_..." > .env
```

## OAuth

For applications requesting user authorization:

```typescript
const github = new GitHubSDK({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/callback'
});

// Get authorization URL
const url = github.oauth.getAuthorizationUrl({
  scopes: ['repo', 'user']
});

// User visits URL and grants permission
// Handle callback to exchange code for token
const token = await github.oauth.exchangeCodeForToken(code);
```

## GitHub App

For server-to-server integrations:

```typescript
const github = new GitHubSDK({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
  installationId: process.env.GITHUB_INSTALLATION_ID
});
```

##  Security Best Practices

- Never hardcode tokens
- Store tokens in environment variables
- Use `.env` files locally (add to `.gitignore`)
- Rotate tokens regularly
- Use Personal Access Tokens with minimal scopes
- Revoke tokens immediately if compromised
- For apps, use GitHub's key rotation

---

#  Usage Examples

Complete code examples for common tasks.

## Beginner Examples

Great for learning the basics.

### Get Your GitHub Profile

Fetch your own user profile information:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

async function getProfile() {
  try {
    const user = await github.users.getAuthenticatedUser();
    console.log('Name:', user.name);
    console.log('Bio:', user.bio);
    console.log('Public repos:', user.public_repos);
  } catch (error) {
    console.error('Failed to fetch profile:', error.message);
  }
}

getProfile();
```

**Output:**

```
Name: Jane Developer
Bio: Open source enthusiast
Public repos: 42
```

**Explanation:**

This example shows the basic pattern: create a client with your token, then call methods. Error handling with try-catch ensures you can recover from failures.

### List Your Repositories

Get all repositories you have access to:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

async function listRepositories() {
  // Pagination is automatic
  let page = 1;
  
  while (true) {
    const repos = await github.repos.list({
      per_page: 30,
      page: page,
      sort: 'updated',
      direction: 'desc'
    });

    if (repos.length === 0) break;

    repos.forEach(repo => {
      console.log(`- ${repo.name}: ${repo.description}`);
    });

    page++;
  }
}

listRepositories();
```

**Explanation:**

Demonstrates pagination - the SDK handles rate limiting automatically, but you control which page to fetch. Loop until empty results.

### Check if a Repository Exists

Simple utility to verify a repo before working with it:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

async function repoExists(owner: string, repo: string) {
  try {
    await github.repos.get(owner, repo);
    return true;
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return false;
    }
    throw error;
  }
}

// Usage
const exists = await repoExists('torvalds', 'linux');
console.log(exists ? 'Found!' : 'Not found');
```

**Explanation:**

Shows error handling - catching specific error codes to distinguish between "not found" and real failures.

## Intermediate Examples

Build on the basics with more complex scenarios.

### Create and Configure a Repository

Create a new repository with specific settings:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

async function createRepository() {
  // Create repo
  const repo = await github.repos.create({
    name: 'my-new-project',
    description: 'An awesome new project',
    private: false,
    has_wiki: true,
    has_issues: true,
    auto_init: true
  });

  console.log('Repository created:', repo.html_url);

  // Configure branch protection
  await github.repos.updateBranchProtection(repo.owner.login, repo.name, 'main', {
    required_status_checks: {
      strict: true,
      contexts: ['continuous-integration/travis-ci']
    },
    required_pull_request_reviews: {
      dismissal_restrictions: {},
      require_code_owner_reviews: true
    }
  });

  console.log('Branch protection enabled');

  // Add collaborators
  await github.repos.addCollaborator(
    repo.owner.login, 
    repo.name, 
    'collaborator-username',
    { permission: 'pull' }
  );

  console.log('Collaborator added');
}

createRepository().catch(error => {
  if (error.code === 'VALIDATION_FAILED') {
    console.error('Validation error:', error.errors);
  } else {
    console.error('Failed:', error.message);
  }
});
```

**Explanation:**

Multi-step operation: create repo, configure protection rules, add collaborators. Shows how to chain multiple SDK calls and handle specific error types.

### Search and Filter Issues

Find issues matching criteria across multiple repositories:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

async function findOpenBugs(owner: string, repo: string) {
  const issues = await github.issues.list(owner, repo, {
    state: 'open',
    labels: 'bug',
    sort: 'created',
    direction: 'desc',
    per_page: 50
  });

  return issues.filter(issue => {
    // Filter out pull requests
    return !issue.pull_request;
  });
}

async function findMyAssignedTasks() {
  // Search across all your repos
  const result = await github.search.issues({
    q: 'assignee:octocat state:open',
    sort: 'updated',
    order: 'desc',
    per_page: 50
  });

  return result.items;
}

// Usage
const bugs = await findOpenBugs('octocat', 'Hello-World');
console.log(`Found ${bugs.length} open bugs`);

const tasks = await findMyAssignedTasks();
console.log(`You have ${tasks.length} assigned tasks`);
```

**Explanation:**

Demonstrates filtering, searching, and combining results. Shows how to structure reusable query functions.

## Advanced Examples

Powerful patterns for complex use cases.

### Watch Repository and React to Events

Monitor a repository and perform actions when events occur:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

class RepositoryMonitor {
  private lastCheckTime = Date.now();

  async monitorPullRequests(owner: string, repo: string) {
    while (true) {
      try {
        // Get recent pull requests
        const prs = await github.pulls.list(owner, repo, {
          state: 'open',
          sort: 'updated',
          direction: 'desc'
        });

        for (const pr of prs) {
          // Check if PR was updated since last check
          const updatedAt = new Date(pr.updated_at).getTime();
          if (updatedAt > this.lastCheckTime) {
            await this.handleNewOrUpdatedPR(owner, repo, pr);
          }
        }

        this.lastCheckTime = Date.now();

        // Wait before next check (respects rate limits)
        await this.sleep(60000); // Check every minute
      } catch (error) {
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
          // SDK handles this, but log for visibility
          console.log('Rate limited, backing off...');
          await this.sleep(60000);
        } else {
          console.error('Error monitoring PRs:', error);
        }
      }
    }
  }

  private async handleNewOrUpdatedPR(owner: string, repo: string, pr: any) {
    console.log(`PR #${pr.number}: ${pr.title}`);

    // Auto-request review from team lead
    await github.pulls.requestReviewers(owner, repo, pr.number, {
      reviewers: ['team-lead-username']
    });

    // Add labels
    await github.issues.addLabels(owner, repo, pr.number, ['needs-review']);

    // Post comment
    await github.issues.createComment(owner, repo, pr.number, {
      body: '👋 Thanks for the pull request! A team lead will review shortly.'
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const monitor = new RepositoryMonitor();
monitor.monitorPullRequests('my-org', 'my-repo');
```

**Explanation:**

Real-world pattern for monitoring and automation. Shows how to implement polling with rate limit awareness, handle errors gracefully, and take actions based on events.

### Batch Operations with Error Recovery

Update multiple repositories with rollback capability:

```typescript
import { GitHubSDK } from '@example/github-sdk';

const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

interface BatchUpdateResult {
  succeeded: string[];
  failed: Map<string, Error>;
}

async function updateRepositoriesWithRollback(
  repos: string[],
  updates: any
): Promise<BatchUpdateResult> {
  const result: BatchUpdateResult = {
    succeeded: [],
    failed: new Map()
  };

  const originalStates: Map<string, any> = new Map();

  for (const repoName of repos) {
    const [owner, repo] = repoName.split('/');

    try {
      // Save original state for rollback
      const original = await github.repos.get(owner, repo);
      originalStates.set(repoName, original);

      // Apply updates
      await github.repos.update(owner, repo, updates);
      result.succeeded.push(repoName);

      console.log(`✓ Updated ${repoName}`);
    } catch (error) {
      result.failed.set(repoName, error);
      console.error(`✗ Failed to update ${repoName}: ${error.message}`);
    }
  }

  // If too many failed, rollback all
  if (result.failed.size > repos.length / 2) {
    console.log('Too many failures, rolling back...');

    for (const repoName of result.succeeded) {
      const [owner, repo] = repoName.split('/');
      const original = originalStates.get(repoName);

      try {
        await github.repos.update(owner, repo, original);
        console.log(`↶ Rolled back ${repoName}`);
      } catch (error) {
        console.error(`✗ Failed to rollback ${repoName}: ${error.message}`);
      }
    }

    result.succeeded = [];
  }

  return result;
}

// Usage
const result = await updateRepositoriesWithRollback(
  ['my-org/repo1', 'my-org/repo2', 'my-org/repo3'],
  { description: 'Updated by automation' }
);

console.log(`Succeeded: ${result.succeeded.length}`);
console.log(`Failed: ${result.failed.size}`);
```

**Explanation:**

Advanced pattern for batch operations with transactional semantics - saves original state and rolls back on failure threshold.

---

#  Error Handling

Understanding and handling errors from the SDK.

## Error Types

### Authentication & Authorization

#### INVALID_CREDENTIALS

**Description:** The provided credentials are invalid or expired

**Cause:** Invalid token, wrong credentials, or expired OAuth token

**Solution:** Verify your token is correct and hasn't expired. Generate a new token if needed.

**Example:**

```typescript
try {
  const user = await github.users.getAuthenticatedUser();
} catch (error) {
  if (error.code === 'INVALID_CREDENTIALS') {
    console.error('Your token is invalid. Generate a new one.');
  }
}
```

#### INSUFFICIENT_PERMISSIONS

**Description:** Your token doesn't have permission for this operation

**Cause:** Token scopes are too restrictive

**Solution:** Check the required scopes and generate a new token with appropriate permissions

**Example:**

```typescript
try {
  await github.repos.create({ name: 'new-repo' });
} catch (error) {
  if (error.code === 'INSUFFICIENT_PERMISSIONS') {
    console.error('Your token needs repo scope');
  }
}
```

### Validation Errors

#### VALIDATION_FAILED

**Description:** Input validation failed

**Cause:** Invalid parameters, missing required fields, or invalid values

**Solution:** Check the error.errors array for details on which field failed

**Example:**

```typescript
try {
  await github.repos.create({
    name: '' // Invalid: empty name
  });
} catch (error) {
  if (error.code === 'VALIDATION_FAILED') {
    error.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
}
```

### Network Errors

#### RATE_LIMIT_EXCEEDED

**Description:** You've exceeded the API rate limit

**Cause:** Too many requests in a short time

**Solution:** The SDK handles this automatically with exponential backoff. For manual control, check error.retryAfter

**Example:**

```typescript
try {
  const user = await github.users.get('octocat');
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log(`Wait ${error.retryAfter} seconds before retrying`);
  }
}
```

#### CONNECTION_TIMEOUT

**Description:** Request timed out

**Cause:** Network is slow or server is not responding

**Solution:** Check your network connection and retry. The SDK retries automatically.

#### NOT_FOUND

**Description:** The requested resource was not found

**Cause:** Repository, user, or issue doesn't exist

**Solution:** Verify the resource exists before operating on it

**Example:**

```typescript
try {
  const repo = await github.repos.get('user', 'nonexistent');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Repository not found');
  }
}
```

## Recovery Strategies

### Automatic Retry with Backoff

The SDK automatically retries transient failures with exponential backoff:

```typescript
// SDK handles retries automatically
// Default: 3 retries with 1s, 2s, 4s backoff
const user = await github.users.get('octocat');
```

You can customize retry behavior:

```typescript
const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN,
  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 1000,
    backoffMultiplier: 2
  }
});
```

### Manual Error Handling

Detect errors and take appropriate action:

```typescript
try {
  const result = await client.operation();
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
    await sleep(error.retryAfter * 1000);
    return await client.operation();
  } else if (error.code === 'VALIDATION_FAILED') {
    // Fix and retry
    console.error('Validation errors:', error.errors);
    return null;
  } else if (error.recoverable) {
    // Transient error, SDK already retried
    throw error;
  } else {
    // Permanent error
    console.error('Cannot recover:', error);
    process.exit(1);
  }
}
```

## Best Practices

- Always wrap API calls in try-catch
- Check error codes to determine recovery strategy
- Implement exponential backoff for retries
- Log errors with full context
- Don't expose internal errors to users
- Provide helpful error messages
- Use error.recoverable flag to determine if retry is viable

---

#  Troubleshooting

## Common Issues

### "Invalid Token" Error

**Problem:** Getting `INVALID_CREDENTIALS` error

**Solutions:**
1. Verify token is copied correctly (no spaces)
2. Check token hasn't been revoked in GitHub settings
3. Generate a new token: https://github.com/settings/tokens
4. Verify token has correct scopes for your operation

### "Rate Limit Exceeded"

**Problem:** Getting `RATE_LIMIT_EXCEEDED` errors frequently

**Solutions:**
1. Reduce request frequency
2. Implement request batching
3. Use GraphQL API (more efficient)
4. Upgrade to GitHub Pro for higher limits
5. The SDK automatically handles retries with backoff

### "Permission Denied"

**Problem:** Getting `INSUFFICIENT_PERMISSIONS` error

**Solutions:**
1. Check your token scopes: https://github.com/settings/tokens
2. For repo access, ensure `repo` scope is selected
3. For public data, ensure `public_repo` scope is selected
4. For user data, ensure `user` scope is selected
5. Generate new token with required scopes

### "Timeout" Errors

**Problem:** Requests timing out

**Solutions:**
1. Check your internet connection
2. Try again - GitHub API might be slow
3. Increase timeout: `new GitHubSDK({ timeout: 30000 })`
4. Check GitHub status: https://www.githubstatus.com
5. Try a different network (VPN might help)

### "404 Not Found"

**Problem:** Getting `NOT_FOUND` errors for existing resources

**Solutions:**
1. Verify repository name spelling and case
2. Verify owner username is correct
3. Check repository isn't private (unless you have access)
4. Verify resource actually exists
5. Ensure you have access to the organization

---

##  License

This SDK is licensed under the MIT License - see LICENSE file for details.
