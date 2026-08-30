# Branch Protection and PR Workflow Guide

This guide will help you set up branch protection rules to enforce quality gates and establish a professional PR workflow.

## 🎯 Why Branch Protection?

**Benefits:**

- ✅ Forces code review (even if reviewing your own code)
- ✅ Ensures all CI checks pass before merge
- ✅ Creates audit trail of changes
- ✅ Prevents accidental direct pushes to main
- ✅ Practices professional git workflow
- ✅ Portfolio-ready development process

## 📋 Step-by-Step Setup

### 1. Enable Branch Protection Rules

**GitHub Web Interface:**

1. Go to your repository: `https://github.com/your-org/wordpress-lightsail-platform`
2. Click **Settings** (top menu)
3. Click **Branches** (left sidebar, under "Code and automation")
4. Click **Add branch protection rule**

### 2. Configure Protection Rules

**Branch name pattern:**

```
main
```

**Required Settings:**

#### ☑️ Require a pull request before merging

- Require approvals: **0** (since you're solo)
  - _Note: Set to 1+ when working with a team_
- Dismiss stale pull request approvals when new commits are pushed: ☑️
- Require review from Code Owners: ☐ (not needed for solo)

#### ☑️ Require status checks to pass before merging

- Require branches to be up to date before merging: ☑️
- **Status checks to require:**
  - Type in search box: `security-and-quality`
  - Select: **security-and-quality** (from quality-gates.yml)
  - Click **Add**

  ⚠️ **Important**: The check won't appear until it runs once!
  - If you don't see it now, save the rule without it
  - Come back and add it after quality-gates runs
  - Edit the rule and search for `security-and-quality`

#### ☑️ Require conversation resolution before merging

- Forces you to resolve any comments you add to PRs

#### ☑️ Require linear history

- Prevents merge commits, keeps history clean
- Forces rebase or squash merge

#### ☑️ Do not allow bypassing the above settings

- Enforces rules even for repo admins (you)
- Can temporarily disable if you need to hotfix

**Optional (Recommended for Learning):**

- ☑️ Require deployments to succeed before merging
  - Advanced: Requires deployment environments setup
  - Skip for now, add later when needed

**Save the rule:** Click **Create** at the bottom

### 3. Verify Configuration

After saving, you should see:

```
Branch protection rule: main
✓ Require a pull request before merging
✓ Require status checks to pass before merging
  └─ security-and-quality
✓ Require conversation resolution before merging
✓ Require linear history
✓ Do not allow bypassing the above settings
```

## 🚀 New Workflow (After Branch Protection)

### Creating a Feature Branch

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feat/add-mysql-role
# or
git checkout -b fix/wordpress-config
# or
git checkout -b chore/update-dependencies

# Branch naming convention:
# - feat/     : New features
# - fix/      : Bug fixes
# - chore/    : Maintenance (deps, docs, etc)
# - refactor/ : Code refactoring
# - docs/     : Documentation only
```

### Making Changes and Creating PR

```bash
# 1. Make your changes
vim ansible/roles/mysql/tasks/main.yml

# 2. Commit changes
git add .
git commit -m "feat: Add MySQL role for database installation"

# 3. Push to GitHub
git push origin feat/add-mysql-role

# 4. GitHub will show: "Create Pull Request" button
# Click it or use GitHub CLI:
gh pr create --title "Add MySQL role" --body "Implements database setup for WordPress"

# Or create via web: https://github.com/your-org/wordpress-lightsail-platform/compare
```

### PR Review Process

**On GitHub:**

1. **Go to Pull Requests tab**
   - You'll see your PR with checks running

2. **Wait for CI to complete**

   ```
   ⏳ security-and-quality — Running...

   After ~2 minutes:
   ✅ security-and-quality — All checks passed
   ```

3. **Review the Changes**
   - Click **Files changed** tab
   - Review your own code (good practice!)
   - Add comments if you notice issues
   - Click **Review changes** → **Approve**

4. **Merge the PR**
   - Click **Merge pull request**
   - Choose merge method:
     - **Squash and merge** (recommended) - Clean history
     - **Rebase and merge** - Preserves commits
     - **Create merge commit** - Traditional merge
   - Click **Confirm**
   - Delete the branch (GitHub prompts you)

5. **Update Local Main**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/add-mysql-role  # Delete local feature branch
   ```

## 🔄 Example Complete Workflow

```bash
# Starting a new feature
git checkout main
git pull
git checkout -b feat/add-canary-monitoring

# Make changes
vim cdk/lib/synthetic-monitoring-stack.ts
git add .
git commit -m "feat: Add uptime monitoring canary"

# Push and create PR
git push origin feat/add-canary-monitoring
gh pr create --title "Add uptime canary" --body "Monitors website availability every 5 minutes"

# On GitHub:
# 1. CI runs automatically
# 2. Review changes in PR
# 3. Approve PR
# 4. Merge PR (squash and merge)

# Back to terminal
git checkout main
git pull
git branch -d feat/add-canary-monitoring

# Ready for next feature!
```

## 🚨 What Happens If CI Fails?

```
PR created
    ↓
CI runs
    ↓
❌ tofu fmt check fails
    ↓
❌ Merge button disabled: "Required checks have failed"
    ↓
Fix the issue:
git checkout feat/my-branch
tofu fmt -recursive
git add .
git commit -m "style: Fix formatting"
git push
    ↓
CI runs again
    ↓
✅ All checks pass
    ↓
✅ Merge button enabled
    ↓
Merge!
```

## 💡 Pro Tips

### 1. Use Draft PRs for Work in Progress

```bash
# Create draft PR (GitHub CLI)
gh pr create --draft --title "WIP: Add observability" --body "Still working on it"

# Or on web: Check "Create draft pull request"

# When ready:
gh pr ready  # Marks PR as ready for review
```

### 2. Review Your Own PRs Before Marking Ready

- Look at the **Files changed** tab
- Add comments to your own code
- Think: "Would I approve this if someone else wrote it?"

### 3. Keep PRs Small and Focused

- ✅ Good: "Add MySQL role" (1 role, clear purpose)
- ❌ Bad: "Update WordPress setup and add monitoring and fix bugs" (too much)

### 4. Write Good PR Descriptions

```markdown
## What

Add MySQL role for database installation

## Why

WordPress needs MySQL database. Currently missing from setup.

## How

- Created ansible/roles/mysql/tasks/main.yml
- Installs MySQL server and Python bindings
- Creates WordPress database and user
- Removes default insecure settings

## Testing

- [x] Ansible-lint passes
- [x] Tested locally with Vagrant
- [x] Database creation confirmed

## Related

Fixes #5 (if you had GitHub issues)
```

### 5. Use GitHub CLI for Speed

```bash
# Install GitHub CLI (if not already)
brew install gh

# Authenticate
gh auth login

# Quick PR creation
gh pr create -f  # Uses commit message as PR title/body

# View PR status
gh pr status

# View PR checks
gh pr checks

# Merge from terminal
gh pr merge --squash --delete-branch
```

## 🎓 Learning Resources

- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

## 📊 Your Current Setup

**Workflows that run on PRs:**

- ✅ `quality-gates.yml` - Security and code quality checks
- ✅ Runs on: `push` to main, `pull_request` events

**Status checks that block merge:**

- ✅ `security-and-quality` job (after you add it to branch protection)

**What gets checked:**

1. Snyk security scanning (SCA + IaC)
2. Ansible linting
3. OpenTofu format and validation
4. Shell script syntax
5. CDK dependencies security

## 🎯 Next Steps After Setup

1. **Test the workflow:**

   ```bash
   git checkout -b test/branch-protection
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: Verify branch protection"
   git push origin test/branch-protection
   # Create PR and try to merge before CI completes
   ```

2. **Try to push directly to main (should fail):**

   ```bash
   git checkout main
   echo "# Direct edit" >> README.md
   git add README.md
   git commit -m "test: Try direct push"
   git push origin main
   # Should see: "refusing to allow a personal access token..."
   # Or: "Updates were rejected because the remote contains work..."
   ```

3. **Practice the PR workflow** with your next real change

## ❓ Troubleshooting

**"Can't see security-and-quality in status checks"**

- Wait for quality-gates workflow to run once on a PR
- Then go back to branch protection and add it

**"Can't push to main anymore"**

- ✅ This is correct! Use PRs from now on
- If you absolutely need to: Temporarily disable rule in Settings

**"PR says 'Merging is blocked'"**

- Check which status checks are failing
- Click "Details" to see the error
- Fix the issue and push again

**"Accidentally pushed to main"**

- If branch protection is on: It will be rejected
- If it went through: Protection not fully enabled yet
- Solution: Create PR from that commit to fix properly

---

## 🎉 Benefits You'll See

After using this workflow for a while:

1. **Better code quality** - Forced to review your own changes
2. **Cleaner git history** - Logical, atomic commits
3. **Audit trail** - See why changes were made
4. **Professional portfolio** - Shows good practices to employers
5. **Team-ready** - Already know the workflow when you collaborate
6. **Prevents mistakes** - CI catches issues before main branch

**Welcome to professional git workflow! 🚀**
