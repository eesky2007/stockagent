# GitHub Setup Guide for StockAgent

The application is now initialized as a local Git repository with an initial commit. Follow these steps to push it to GitHub.

## Option 1: Create Repository on GitHub via Web UI (Recommended)

### Step 1: Create a new repository on GitHub
1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `stockagent` (or your preferred name)
   - **Description**: AI-Powered Stock Research & Investment Platform
   - **Visibility**: Public or Private (your choice)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### Step 2: Connect and push your local repository
After creating the repository, GitHub will show you commands. Run these in PowerShell:

```powershell
cd "c:\Users\Ken.S\AI project"

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote was added
git remote -v

# Push the code to GitHub (will prompt for GitHub credentials or token)
git branch -M main
git push -u origin main
```

**Note**: You'll be prompted to authenticate. Use one of these options:
- GitHub username + personal access token (recommended)
- GitHub username + password (if enabled)
- SSH keys (if configured)

## Option 2: Using GitHub CLI (Faster)

If you prefer to install GitHub CLI first:

```powershell
# Install GitHub CLI via winget
winget install GitHub.cli

# Authenticate with GitHub (will open browser)
gh auth login

# Create repository directly
cd "c:\Users\Ken.S\AI project"
gh repo create stockagent --source=. --remote=origin --push
```

## Current Local Git Status

Your repository is ready with:
- ✅ 38 files committed
- ✅ Initial commit message created
- ✅ .gitignore configured
- ⏳ Remote not yet added (awaiting GitHub URL)

To check status at any time:
```powershell
cd "c:\Users\Ken.S\AI project"
git status
git log --oneline
git remote -v
```

## After Pushing to GitHub

Once pushed, you can:

1. **Clone in another machine**:
   ```
   git clone https://github.com/YOUR_USERNAME/stockagent.git
   ```

2. **Set up CI/CD** - Add GitHub Actions for automated testing/deployment

3. **Collaborate** - Invite team members, create branches, submit pull requests

4. **Track issues** - Use GitHub Issues for feature requests and bug tracking

5. **Deploy** - Connect to Azure App Service, Vercel, or other hosting

## Common Commands

```powershell
# Check remote configuration
git remote -v

# Create a new branch for features
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Description of changes"

# Push branch to GitHub
git push origin feature/new-feature

# View commit history
git log --oneline

# See what changed
git status
```

## Troubleshooting

**Error: "fatal: repository not found"**
- Verify the repository URL is correct
- Check your GitHub credentials are valid

**Error: "Permission denied"**
- Use a personal access token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**Cannot push to 'main' branch**
- Create the branch first: `git branch -M main`
- Then push: `git push -u origin main`

---

**Need help?** See GitHub's documentation:
- https://docs.github.com/en/get-started/importing-your-projects-to-github
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh
