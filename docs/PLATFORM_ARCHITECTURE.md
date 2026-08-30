# WordPress Platform Architecture (SaaS-Style)

## Vision

Transform this repository into a **reusable WordPress hosting platform** that separates infrastructure concerns from application code, enabling anyone to deploy production-grade WordPress sites with zero infrastructure knowledge.

## Architecture Overview

### Two-Repository Model

```
┌─────────────────────────────────────────┐
│  Platform Repository (Public/Template)  │
│  lightsail-wordpress-platform           │
│                                         │
│  - Infrastructure as Code (Terraform)   │
│  - Server Configuration (Ansible)       │
│  - Monitoring (CDK)                     │
│  - CI/CD Workflows                      │
│  - Documentation                        │
└──────────────┬──────────────────────────┘
               │
               │ Repository Dispatch Event
               │ (triggered by app repo)
               ↓
┌─────────────────────────────────────────┐
│  Application Repository (User's Site)   │
│  my-wordpress-site                      │
│                                         │
│  - Custom Themes                        │
│  - Custom Plugins                       │
│  - Site Configuration                   │
│  - Content (via wp-cli or manual)      │
└─────────────────────────────────────────┘
```

## Platform Repository (This Repo)

### Purpose
Provides the **infrastructure template** that anyone can use to deploy WordPress on AWS Lightsail.

### What It Contains

#### Infrastructure (Terraform/OpenTofu)
```hcl
# Creates AWS resources
- Lightsail instance (Ubuntu 22.04)
- Static IP address
- Load balancer with TLS
- DNS records (Route53)
- Firewall rules
```

#### Configuration Management (Ansible)
```yaml
# Installs and configures
- Nginx web server
- PHP 8.2 + extensions
- MySQL 8.0
- WordPress core (latest)
- Security hardening
- SSL/HTTPS setup
```

#### Observability (AWS CDK)
```typescript
// Monitoring stacks
- CloudWatch dashboard
- Alarms and alerts
- Synthetic monitoring (uptime checks)
- SNS notifications
```

#### CI/CD Workflows
```yaml
.github/workflows/
├── provision-infrastructure.yml    # Deploy AWS resources
├── configure-server.yml            # Run Ansible playbooks
├── deploy-application.yml          # Deploy from app repo
└── destroy-infrastructure.yml      # Tear down resources
```

### Configuration Interface

**Platform Config (for users to customize):**
```yaml
# platform-config.yml (in user's app repo)
platform:
  version: "1.0.0"                    # Platform version to use
  
infrastructure:
  instance_size: "nano"               # nano, micro, small, medium
  region: "us-east-1"
  domain: "example.com"
  enable_load_balancer: true
  enable_static_ip: true
  
database:
  engine: "mysql"                     # mysql or mariadb
  version: "8.0"
  backup_retention_days: 7
  
monitoring:
  enable_dashboard: true
  enable_alerts: true
  enable_synthetic: true
  alert_email: "ops@example.com"
  
wordpress:
  version: "latest"                   # or specific version
  php_version: "8.2"
  memory_limit: "256M"
  upload_max_filesize: "64M"
  
security:
  enable_wordfence: true
  enable_2fa: true
  disable_xmlrpc: true
  block_author_scanning: true
```

## Application Repository (User's Site)

### Purpose
Contains the **actual WordPress site** - themes, plugins, and configuration.

### Structure

```
my-wordpress-site/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Main deployment workflow
│       └── backup.yml              # Automated backups
│
├── wp-content/
│   ├── themes/
│   │   ├── my-theme/              # Custom theme
│   │   │   ├── style.css
│   │   │   ├── functions.php
│   │   │   └── ...
│   │   └── .gitkeep
│   │
│   ├── plugins/
│   │   ├── my-plugin/             # Custom plugin
│   │   │   ├── my-plugin.php
│   │   │   └── ...
│   │   └── .gitkeep
│   │
│   └── mu-plugins/                # Must-use plugins
│       ├── security-headers.php
│       └── custom-post-types.php
│
├── config/
│   ├── platform-config.yml        # Platform configuration
│   ├── wordpress.env.example      # Environment variables template
│   ├── plugins.txt                # Required plugins (from wp.org)
│   └── nginx-custom.conf          # Custom nginx rules (optional)
│
├── database/
│   ├── seeds/                     # Database seeders (optional)
│   └── migrations/                # Schema migrations (optional)
│
├── scripts/
│   ├── post-deploy.sh             # Post-deployment script
│   └── pre-deploy.sh              # Pre-deployment checks
│
├── composer.json                  # PHP dependencies
├── package.json                   # Frontend build tools
├── .gitignore
└── README.md
```

### Deployment Workflow

**User's `.github/workflows/deploy.yml`:**
```yaml
name: Deploy WordPress Site

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout app repository
        uses: actions/checkout@v4
        with:
          path: app
      
      - name: Checkout platform repository
        uses: actions/checkout@v4
        with:
          repository: Darthstevo/lightsail-wordpress-platform
          ref: v1.0.0
          path: platform
      
      - name: Validate configuration
        run: |
          python platform/scripts/validate-config.py app/config/platform-config.yml
      
      - name: Deploy infrastructure
        uses: ./platform/.github/workflows/provision-infrastructure.yml
        with:
          config: app/config/platform-config.yml
          environment: ${{ inputs.environment }}
      
      - name: Build application assets
        working-directory: app
        run: |
          npm install
          npm run build
      
      - name: Deploy application
        run: |
          platform/scripts/deploy-application.sh \
            --app-path app/ \
            --config app/config/platform-config.yml \
            --environment ${{ inputs.environment }}
```

## Communication Between Repositories

### Method 1: Repository Dispatch (Recommended)

**App repo triggers platform deployment:**

```yaml
# In app repo: .github/workflows/deploy.yml
- name: Trigger platform deployment
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.PLATFORM_REPO_PAT }}
    repository: Darthstevo/lightsail-wordpress-platform
    event-type: deploy-application
    client-payload: |
      {
        "app_repo": "${{ github.repository }}",
        "app_ref": "${{ github.ref }}",
        "environment": "${{ inputs.environment }}",
        "config_url": "${{ github.server_url }}/${{ github.repository }}/raw/${{ github.sha }}/config/platform-config.yml"
      }
```

**Platform repo listens and deploys:**

```yaml
# In platform repo: .github/workflows/deploy-application.yml
name: Deploy Application

on:
  repository_dispatch:
    types: [deploy-application]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout platform
        uses: actions/checkout@v4
      
      - name: Clone application repository
        run: |
          git clone https://github.com/${{ github.event.client_payload.app_repo }} app
          cd app
          git checkout ${{ github.event.client_payload.app_ref }}
      
      - name: Download configuration
        run: curl -o config.yml ${{ github.event.client_payload.config_url }}
      
      - name: Deploy infrastructure
        run: ./scripts/deploy-infrastructure.sh config.yml
      
      - name: Deploy application
        run: ./scripts/deploy-application.sh app/ config.yml
```

### Method 2: Reusable Workflows (Alternative)

**Platform provides reusable workflow:**

```yaml
# platform/.github/workflows/reusable-deploy.yml
name: Reusable Deploy Workflow

on:
  workflow_call:
    inputs:
      app_repo:
        required: true
        type: string
      config_path:
        required: true
        type: string
    secrets:
      AWS_ROLE_ARN:
        required: true
      SSH_PRIVATE_KEY:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Deploy logic here
```

**App repo calls reusable workflow:**

```yaml
# app/.github/workflows/deploy.yml
jobs:
  deploy-site:
    uses: Darthstevo/lightsail-wordpress-platform/.github/workflows/reusable-deploy.yml@v1.0.0
    with:
      app_repo: ${{ github.repository }}
      config_path: config/platform-config.yml
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

## Deployment Flow

### First-Time Setup

```
1. User forks/clones platform repository (or just uses it)
2. User creates their app repository from template
3. User configures platform-config.yml
4. User adds secrets to app repo:
   - AWS_ROLE_ARN (for infrastructure)
   - SSH_PRIVATE_KEY (for deployment)
   - PLATFORM_REPO_PAT (for triggering platform)
5. User commits their theme/plugins
6. Push to main → triggers deployment
```

### Deployment Sequence

```
User pushes to app repo
       ↓
App workflow validates config
       ↓
Triggers platform via repository_dispatch
       ↓
Platform deploys/updates infrastructure (if needed)
       ↓
Platform configures server (Ansible)
       ↓
Platform pulls app code to server
       ↓
Platform runs build scripts (if any)
       ↓
Platform deploys to /var/www/html
       ↓
Platform runs post-deploy hooks
       ↓
Site is live ✅
```

## Platform Features (What Makes This "SaaS-like")

### 1. **Zero Infrastructure Knowledge Required**
Users only need to:
- Write WordPress code
- Configure via simple YAML
- Push to Git

Platform handles:
- AWS resource provisioning
- Server configuration
- Security hardening
- SSL certificates
- Monitoring setup
- Backup automation

### 2. **Multiple Environment Support**
```yaml
# Automatic staging/production separation
environments:
  staging:
    domain: staging.example.com
    instance_size: nano
    enable_monitoring: false
  
  production:
    domain: example.com
    instance_size: small
    enable_monitoring: true
    enable_cdn: true
```

### 3. **One-Click Deployments**
```bash
# Users just push code
git push origin main

# Platform handles:
✅ Infrastructure updates
✅ Dependency installation
✅ Asset compilation
✅ Database migrations
✅ Cache warming
✅ Health checks
```

### 4. **Built-in Monitoring**
Every deployment automatically includes:
- CloudWatch dashboard
- Uptime monitoring
- Error alerting
- Performance metrics
- Cost tracking

### 5. **Automatic Backups**
```yaml
# Configured via platform-config.yml
backups:
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention_days: 30
  s3_bucket: auto-generated
  include_uploads: true
```

### 6. **Cost Optimization**
Platform automatically:
- Chooses right instance size
- Enables S3 for media offload
- Configures CloudFront CDN
- Sets up lifecycle policies
- Monitors costs

## User Experience

### For Platform Maintainers (You)

**Responsibilities:**
- Maintain infrastructure templates
- Update Ansible roles
- Add new features (e.g., Redis cache)
- Security patches
- Documentation
- Support users via Issues

**Versioning:**
```bash
git tag v1.0.0  # Stable release
git tag v1.1.0  # New features
git tag v2.0.0  # Breaking changes
```

Users pin to specific versions:
```yaml
# app's deploy.yml
uses: Darthstevo/lightsail-wordpress-platform@v1.0.0
```

### For End Users (WordPress Developers)

**Experience:**
1. **Start from template**
   ```bash
   gh repo create my-wordpress-site --template Darthstevo/wordpress-app-template
   ```

2. **Configure platform**
   ```yaml
   # config/platform-config.yml
   domain: myblog.com
   instance_size: nano
   alert_email: me@example.com
   ```

3. **Add secrets to GitHub**
   - Via web UI or gh CLI
   - One-time setup

4. **Develop locally**
   ```bash
   docker-compose up  # Local dev environment
   # OR use Local by Flywheel, MAMP, etc.
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "feat: new blog post template"
   git push
   # Platform automatically deploys ✅
   ```

6. **Monitor**
   - Automatic dashboard link in deployment output
   - Email alerts if site goes down
   - Cost reports monthly

## Monetization Opportunities

If you wanted to turn this into a business:

### Free Tier
- Open source platform (MIT license)
- Self-hosted
- Community support via GitHub Issues
- Documentation

### Paid Tiers

**Starter ($5/month)**
- Hosted control plane (no need to maintain platform repo)
- Web dashboard for deployments
- Email support
- Pre-configured templates

**Pro ($20/month)**
- Multi-site support
- Advanced monitoring
- Priority support
- Custom domains included
- CDN included

**Enterprise (Custom)**
- Dedicated infrastructure
- SLA guarantees
- Custom integrations
- Phone support
- Compliance (SOC2, HIPAA)

## Migration Path

### Phase 1: Refactor Current Repo
- ✅ Separate concerns within repo
- ✅ Create clear interfaces
- ✅ Document architecture
- ✅ Add configuration validation

### Phase 2: Template Repository
- Create `wordpress-app-template` repo
- Sample theme and plugin
- Pre-configured workflows
- Comprehensive README

### Phase 3: Platform Extraction
- Fork this repo as platform
- Remove site-specific code
- Make everything configurable
- Version and release

### Phase 4: Example Sites
- Create 3-5 example sites
- Different use cases:
  - Personal blog
  - Business site
  - E-commerce (WooCommerce)
  - Membership site
  - Portfolio

### Phase 5: Community
- Documentation site
- Video tutorials
- Community forum/Discord
- Showcase gallery

## Benefits of This Architecture

### For You
- ✅ Portfolio piece showing platform thinking
- ✅ Reusable for multiple clients
- ✅ Potential SaaS product
- ✅ Open source contributions
- ✅ Infrastructure expertise showcase

### For Users
- ✅ Production-ready WordPress hosting
- ✅ No AWS knowledge needed
- ✅ Automatic best practices
- ✅ Cost-effective (~$30/month)
- ✅ Full control (not locked in)
- ✅ Git-based workflow

### For Employers
- ✅ Demonstrates system design skills
- ✅ Shows DevOps/Platform engineering
- ✅ Real-world infrastructure code
- ✅ Production monitoring setup
- ✅ Security-first approach

## Next Steps

1. **Validate Architecture**
   - Review this document
   - Identify gaps
   - Plan refactoring

2. **Create Repository Structure**
   - Split concerns in current repo
   - Create app template
   - Set up example workflows

3. **Build Proof of Concept**
   - Deploy one site using new architecture
   - Document pain points
   - Iterate

4. **Write Documentation**
   - Platform docs (for maintainers)
   - User docs (for WordPress devs)
   - API reference
   - Troubleshooting guides

5. **Launch**
   - GitHub release
   - Blog post
   - Dev.to article
   - Twitter/LinkedIn announcement

## Comparison to Alternatives

| Feature | This Platform | WordPress.com | Kinsta | WP Engine | DigitalOcean |
|---------|--------------|---------------|---------|-----------|--------------|
| **Cost** | ~$30/month | $25-300/month | $35+/month | $30+/month | $12+/month |
| **Infrastructure as Code** | ✅ | ❌ | ❌ | ❌ | Partial |
| **Git-based Deploy** | ✅ | ❌ | ✅ | Partial | ❌ |
| **Full AWS Control** | ✅ | ❌ | ❌ | ❌ | N/A |
| **Monitoring Included** | ✅ | Limited | ✅ | ✅ | ❌ |
| **Open Source** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Self-Hosted** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Customizable** | ✅✅✅ | ❌ | Limited | Limited | ✅✅ |

## Conclusion

This architecture transforms your WordPress infrastructure into a **reusable platform** that demonstrates:

- **Platform Engineering** skills
- **DevOps** best practices
- **System Design** thinking
- **Product** vision
- **Open Source** contribution potential

It's not just a portfolio project—it's a **real product** that solves a real problem: making professional WordPress hosting accessible to developers without infrastructure expertise.

Would you like to proceed with refactoring the current repo to support this architecture?
