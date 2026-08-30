# WordPress Lightsail Platform

Portable, production-minded WordPress platform template on AWS Lightsail with **Infrastructure as Code**.

This repository is the **platform/infrastructure repo** only (OpenTofu/Terraform + Ansible + optional CDK observability).
It is intended for **fresh WordPress deployments**. Site-specific themes/plugins/content artifacts should live in a separate app repository.

## 🎯 What Is This?

A **reusable WordPress platform** that provisions and configures core runtime infrastructure on AWS:

- ✅ AWS Lightsail instance with Ubuntu 22.04
- ✅ Nginx web server with TLS/HTTPS
- ✅ PHP 8.2 with optimized settings
- ✅ MySQL 8.0 database
- ✅ WordPress latest version
- ✅ Optional load balancer with automatic TLS certificates
- ✅ Optional CloudWatch monitoring and alerting
- ✅ Optional S3 backup/media patterns
- ✅ Security hardening out of the box

**Cost posture:** low-cost by default, with optional enhancements (especially a load balancer and synthetic monitoring) when availability/operational needs justify the spend.

### Platform ownership vs. application ownership

This repository is intentionally the **platform layer**. It should not be the long-term home for a specific site's content.

**Platform repository owns:**

- AWS/Lightsail infrastructure lifecycle
- DNS and TLS integration
- WordPress runtime (Nginx, PHP, database connectivity)
- Server hardening and baseline security
- Optional observability and backup/recovery patterns
- Repeatable configuration management automation

**Separate WordPress application/site repository owns:**

- Themes and custom plugins
- Site-specific assets and content workflows
- Site-specific configuration and deployment artifacts
- Application release process

## 🚀 Quick Start

### Prerequisites

1. AWS account with Route53 hosted zone for your domain
2. A separate app repository for your site-specific WordPress artifacts (themes/plugins/content)
3. Basic familiarity with Git

### 1. Fork/Clone This Repository

```bash
gh repo fork your-org/wordpress-lightsail-platform --clone
cd wordpress-lightsail-platform
```

### 2. Configure GitHub Variables and Secrets

Go to your repository **Settings → Secrets and variables → Actions**, and add:

**Repository Variables (minimum):**

| Variable Name                  | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `AWS_ROLE_ARN_TERRAFORM`       | IAM role ARN for OpenTofu/Terraform workflow           |
| `AWS_ROLE_ARN_CDK`             | IAM role ARN for CDK observability workflow            |
| `AWS_REGION`                   | AWS region (for example: `us-east-1`)                  |
| `WP_DOMAIN`                    | Primary domain (for example: `example.com`)            |
| `ROUTE53_ZONE_ID`              | Hosted zone ID (for example: `Z123EXAMPLE`)            |
| `LIGHTSAIL_INSTANCE_NAME`      | Lightsail instance name                                |
| `LIGHTSAIL_LOAD_BALANCER_NAME` | Lightsail load balancer name                           |
| `LIGHTSAIL_STATIC_IP_NAME`     | Lightsail static IP resource name                      |
| `LIGHTSAIL_KEY_PAIR_NAME`      | Lightsail key pair name                                |
| `LIGHTSAIL_CERTIFICATE_NAME`   | Lightsail certificate resource name                    |
| `WP_ALT_NAMES`                 | JSON list of SANs (for example: `["www.example.com"]`) |

**Repository Secrets:**

| Secret Name                 | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `LIGHTSAIL_SSH_PRIVATE_KEY` | SSH key for instance access                                      |
| `ANSIBLE_VAULT_PASSWORD`    | Vault password for `ansible/group_vars/wordpress.vault.yml`      |
| `ALERT_EMAIL`               | Email address for CloudWatch/SNS alerts (optional observability) |

### 3. Configure Your Platform Variables

Copy and edit these public-safe examples:

- `terraform/terraform.tfvars.example` → `terraform/terraform.tfvars`
- `ansible/group_vars/wordpress.vault.yml.example` → `ansible/group_vars/wordpress.vault.yml`
- `.env.example` → `.env` (optional local helper)

Then update your actual values in the copied files.

### 4. Configure Your Site Defaults

Edit `ansible/group_vars/wordpress.yml`:

```yaml
wp_domain: yourdomain.com
wp_site_url: https://yourdomain.com
wp_admin_email: admin@yourdomain.com
```

### 5. Deploy!

```bash
# Via GitHub Actions
# Go to: Actions → "Provision + Configure" → Run workflow
```

**Duration:** ~15-20 minutes

Your fresh WordPress site will be live at `https://yourdomain.com` 🎉

Complete the WordPress installation at `https://yourdomain.com/wp-admin/install.php`

## 📁 Repository Structure

```
.
├── .github/workflows/       # CI/CD pipelines
│   ├── provision-and-configure.yml  # Main deployment
│   ├── destroy-all.yml             # Teardown infrastructure
│   └── quality-gates.yml           # CI validation
├── terraform/              # AWS infrastructure (Lightsail)
├── ansible/                # Server configuration
│   ├── roles/             # Reusable components
│   └── playbooks/         # Deployment tasks
├── cdk/                    # Monitoring stacks (CloudWatch)
└── docs/                   # Comprehensive documentation
```

## 🎨 Customization

### Add Your WordPress Theme (manual bootstrap path)

Manual SSH-based theme/plugin deployment is acceptable for initial setup and troubleshooting.
For ongoing operations, the preferred model is to deploy site artifacts from a separate WordPress application repository.

```bash
# On the deployed server
ssh ubuntu@your-instance-ip
cd /var/www/html/wp-content/themes
sudo git clone https://github.com/yourusername/your-theme.git
sudo chown -R www-data:www-data your-theme
```

Then activate via WordPress Admin → Appearance → Themes

### Add Custom Plugins

Same manual process as themes:

```bash
cd /var/www/html/wp-content/plugins
sudo git clone https://github.com/yourusername/your-plugin.git
sudo chown -R www-data:www-data your-plugin
```

### Environment Variables

Edit `ansible/templates/wp-config.php.j2` to add custom defines:

```php
define('WP_DEBUG', false);
define('WP_CACHE', true);
// Add your custom defines here
```

## 📊 Optional Observability (CDK)

Observability stacks are optional enhancements and can be deployed when needed:

- **CloudWatch Dashboard** - Real-time metrics
- **5 Critical Alarms** - Email alerts
- **Uptime Monitoring** - 5-minute checks
- **Cost Tracking** - Budget alerts

Deploy observability stacks:

```bash
cd cdk
npm install
npx cdk deploy --all
```

See [docs/OBSERVABILITY_STACKS.md](docs/OBSERVABILITY_STACKS.md) for details.

## 🔒 Security Features

- ✅ Automatic security updates (unattended-upgrades)
- ✅ UFW firewall configured
- ✅ SSH hardening (key-only, no root)
- ✅ HTTPS supported (with or without load balancer, depending on chosen topology)
- ✅ WordPress security headers
- ✅ MySQL secured (no remote access)
- ✅ PHP security settings optimized

## 💰 Cost Optimization

### Included Optimizations

- Smaller instance sizes (for example nano) are typically best for labs, development, testing, and very low-traffic sites
- S3 media offload (optional, saves disk space)
- CloudFront CDN integration (optional)
- Lifecycle policies for backups (auto-delete old)

### Conceptual deployment profiles

Use these as decision guides (documentation-only for now):

- **Minimal**: single Lightsail instance, managed database, no load balancer, basic backups
- **Recommended**: right-sized instance, managed database, HTTPS, baseline monitoring, snapshots/backups
- **Enhanced**: optional load balancer, additional monitoring/alerting, higher-availability-focused operations

Choose sizing and optional components based on actual traffic, availability targets, and recovery objectives.

### Cost Breakdown

| Component               | Monthly Cost |
| ----------------------- | ------------ |
| Lightsail Nano Instance | $3.50        |
| Lightsail Load Balancer | $18.00       |
| Route53 Hosted Zone     | $0.50        |
| CloudWatch Monitoring   | $3.00        |
| CloudWatch Alarms       | $1.00        |
| Synthetic Monitoring    | $5-10.00     |
| **Total**               | **~$31-36**  |

Compare to:

- WordPress.com Business: $25-300/month
- Kinsta: $35+/month
- WP Engine: $30+/month

## 📖 Documentation

### Getting Started

- [GitHub Setup Checklist](docs/GITHUB_SETUP_CHECKLIST.md)
- [Portability Checklist](docs/PORTABILITY_CHECKLIST.md)
- [Deployment Order](docs/DEPLOYMENT_ORDER.md)
- [SSH Setup](docs/SSH_SETUP.md)

### Operations

- [Observability Guide](docs/OBSERVABILITY_STACKS.md)
- [Backup and Recovery](docs/backup-and-recovery-strategy.md)
- [Monthly Patching](runbooks/11-monthly-patching-and-backups.md)

### Advanced

- [WordPress Asset Management](docs/WORDPRESS_ASSET_MANAGEMENT.md)
- [Platform Architecture](docs/PLATFORM_ARCHITECTURE.md)
- [Cost Analysis](docs/cost-analysis.md)

## 🛠️ Development Workflow

### Platform vs App Repo Boundary

- **This repo (platform)**: AWS resources, server bootstrap/config, security, observability, backup patterns.
- **Your app repo**: themes, plugins, media/content workflows, and WordPress customization code.
- **Recommended flow**: deploy platform here, then deploy app artifacts from your app repo.

### Future deployment model (target state)

`wordpress-lightsail-platform` provisions/configures the runtime platform,
and a separate WordPress site repository delivers themes/plugins/site artifacts into that runtime.

### Recommended Setup

**For Your WordPress Code:**
Create a separate repository:

```
my-wordpress-site/
├── wp-content/
│   ├── themes/
│   │   └── my-theme/
│   └── plugins/
│       └── my-plugin/
└── .github/workflows/
    └── deploy.yml  # Triggers platform deployment
```

See [docs/PLATFORM_ARCHITECTURE.md](docs/PLATFORM_ARCHITECTURE.md) for two-repository model details.

### Local Development

Use standard WordPress local development tools:

- **Local by Flywheel** (recommended)
- **MAMP/WAMP**
- **Docker Compose**

Deploy to your target environment when ready:

```bash
git push origin main  # Triggers deployment
```

## 🔧 Maintenance

### Monthly Tasks

- Security updates (automatic)
- WordPress core updates (via WP Admin)
- Optional backups to S3 (via your own scheduled workflow)

See [runbooks/11-monthly-patching-and-backups.md](runbooks/11-monthly-patching-and-backups.md)

### Disaster Recovery

Create snapshot before major changes:

```bash
# Via GitHub Actions
# Go to: Actions → Run workflow → snapshot-prep.yml
```

Restore from snapshot:

```bash
# Via AWS Lightsail console
# Instances → Snapshots → Create instance from snapshot
```

## 🤝 Contributing

This is a **platform template** meant to be forked and customized for your needs.

Improvements welcome via PRs:

- Bug fixes
- Documentation improvements
- New features (Redis cache, CDN, etc.)
- Security enhancements

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Built with:

- [OpenTofu](https://opentofu.org/) - Infrastructure as Code
- [Ansible](https://www.ansible.com/) - Configuration Management
- [AWS CDK](https://aws.amazon.com/cdk/) - Monitoring Infrastructure
- [GitHub Actions](https://github.com/features/actions) - CI/CD

## 📞 Support

- **Documentation:** Check [docs/](docs/) folder
- **Issues:** GitHub Issues for bug reports
- **Discussions:** GitHub Discussions for questions
- **Email:** Contact repository owner

## 🎯 Use Cases

Perfect for:

- ✅ Personal blogs
- ✅ Portfolio websites
- ✅ Small business sites
- ✅ Client projects
- ✅ Learning DevOps/IaC
- ✅ Cost-optimized hosting

Not suitable for:

- ❌ High-traffic sites (>100k visitors/month)
- ❌ E-commerce requiring PCI compliance
- ❌ Multi-site WordPress networks
- ❌ Sites requiring Windows hosting

For high-traffic sites, consider AWS EC2 with auto-scaling or managed WordPress hosts.

## 🚀 What's Next?

After deploying:

1. **Complete WordPress setup** at `/wp-admin/install.php`
2. **Install your theme** and customize
3. **Add essential plugins**:
   - Wordfence Security
   - WP Offload Media (for S3)
   - WP Super Cache
   - Yoast SEO
4. **Configure monitoring** (deploy CDK stacks)
5. **Set up backups** (automated via workflow)
6. **Go live!** Update DNS to your target domain

---

**Built for teams and developers who want a practical, production-oriented DevOps/Platform Engineering reference implementation.**

⭐ Star this repo if you find it useful!
