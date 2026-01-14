#  GitHub API SDK Quickstart

Get up and running with the GitHub SDK in 5 minutes.

## Prerequisites

- Node.js 14+ (for JavaScript/TypeScript)
- Python 3.8+ (for Python)
- Go 1.16+ (for Go)
- Your GitHub personal access token (get it from https://github.com/settings/tokens)

## Installation & Setup

### Step 1: Install the SDK

```bash
npm install @example/github-sdk
```

### Step 2: Set Your Credentials

```bash
export GITHUB_TOKEN="github_pat_..."
```

Or create a `.env` file:

```
GITHUB_TOKEN=github_pat_...
```

Then load it:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

## Your First Request

```typescript
import { GitHubSDK } from '@example/github-sdk';

// Initialize the SDK
const github = new GitHubSDK({
  token: process.env.GITHUB_TOKEN
});

// Make your first call
async function main() {
  // Get your user profile
  const user = await github.users.getAuthenticatedUser();
  console.log(`Welcome, ${user.name}!`);
  console.log(`Bio: ${user.bio}`);
}

main().catch(console.error);
```

 Success! You just made your first API call.

## Common Tasks

### Example 1: Get a User's Profile

Fetch details about any GitHub user:

```typescript
const user = await github.users.get('torvalds');
console.log(`${user.name} has ${user.followers} followers`);
```

### Example 2: Get a Repository

Access repository information:

```typescript
const repo = await github.repos.get('torvalds', 'linux');
console.log(`Stars: ${repo.stargazers_count}`);
console.log(`Forks: ${repo.forks_count}`);
console.log(`Language: ${repo.language}`);
```

### Example 3: List Your Repositories

Get all your repositories:

```typescript
const repos = await github.repos.list({
  per_page: 30,
  sort: 'updated',
  direction: 'desc'
});

repos.forEach(repo => {
  console.log(`- ${repo.name}: ${repo.description}`);
});
```

### Example 4: Search for Repositories

Find repositories by keyword:

```typescript
const results = await github.search.repositories({
  q: 'language:typescript stars:>1000',
  sort: 'stars',
  order: 'desc',
  per_page: 10
});

results.items.forEach(repo => {
  console.log(`${repo.full_name} - ${repo.stargazers_count} stars`);
});
```

### Example 5: Work with Issues

List and manage issues:

```typescript
// Get open issues
const issues = await github.issues.list('owner', 'repo', {
  state: 'open',
  labels: 'bug',
  per_page: 50
});

console.log(`Found ${issues.length} open bugs`);

// Create an issue
const newIssue = await github.issues.create('owner', 'repo', {
  title: 'Bug: Login fails on mobile',
  body: 'Steps to reproduce:\n1. Visit site on mobile\n2. Click login\n3. Error appears',
  labels: ['bug', 'mobile']
});

console.log(`Issue created: ${newIssue.html_url}`);

// Add a comment
await github.issues.createComment('owner', 'repo', newIssue.number, {
  body: 'This is a critical bug affecting mobile users.'
});
```

### Example 6: Manage Pull Requests

Work with pull requests:

```typescript
// List open pull requests
const prs = await github.pulls.list('owner', 'repo', {
  state: 'open',
  per_page: 20
});

// Request a review
await github.pulls.requestReviewers('owner', 'repo', prs[0].number, {
  reviewers: ['reviewer-username']
});

// Add a comment
await github.issues.createComment('owner', 'repo', prs[0].number, {
  body: ':+1: Looks great!'
});

// Approve the PR
await github.pulls.createReview('owner', 'repo', prs[0].number, {
  event: 'APPROVE',
  body: 'This looks good to merge.'
});
```

### Example 7: Handle Errors

Always handle errors gracefully:

```typescript
try {
  const user = await github.users.get('nonexistent-user');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('User not found');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log('Rate limited, try again later');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Next Steps

-  Read the [full documentation](./docs/)
-  Learn about [authentication methods](./docs/AUTHENTICATION.md)
-  Browse [more examples](./docs/EXAMPLES.md)
-  Understand [error handling](./docs/ERROR_HANDLING.md)
-  Check [troubleshooting](./docs/TROUBLESHOOTING.md)

## Need Help?

- **GitHub Issues:** [Report bugs](https://github.com/example/github-sdk/issues)
- **Documentation:** [https://docs.example.com/github-sdk](https://docs.example.com/github-sdk)
- **Email:** support@example.com
