# WordPress Lightsail Platform

Production-grade WordPress hosting platform on AWS Lightsail with **Infrastructure as Code**. Deploy custom WordPress sites with zero infrastructure knowledge—just focus on your themes and plugins.

## 🎯 What Is This?

A **reusable infrastructure template** that automatically provisions and configures everything needed to run WordPress on AWS:

- ✅ AWS Lightsail instance with Ubuntu 22.04
- ✅ Nginx web server with TLS/HTTPS
- ✅ PHP 8.2 with optimized settings
- ✅ MySQL 8.0 database
- ✅ WordPress latest version
- ✅ Load balancer with automatic TLS certificates
- ✅ CloudWatch monitoring and alerting
- ✅ Optional S3 backup/media patterns
- ✅ Security hardening out of the box

**Cost:** ~$30-36/month total (Lightsail $21.50 + monitoring ~$9-14)

## 🚀 Quick Start

### Prerequisites

1. AWS account with Route53 hosted zone
2. GitHub repository for your WordPress site
3. Basic familiarity with Git

### 1. Fork/Clone This Repository

```bash
gh repo fork Darthstevo/wordpress-lightsail-platform --clone
cd wordpress-lightsail-platform
```

### 2. Configure GitHub Variables and Secrets

Go to your repository **Settings → Secrets and variables → Actions**, and add:

**Repository Variable:**

| Variable Name | Description | How to Get |
|------------|-------------|------------|
| `AWS_ROLE_ARN_TERRAFORM` | IAM role for infrastructure | See [docs/github-oidc-setup.md](docs/github-oidc-setup.md) |

**Repository Secrets:**

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `LIGHTSAIL_SSH_PRIVATE_KEY` | SSH key for instance access | Generate with `ssh-keygen -t ed25519` |
| `ANSIBLE_VAULT_PASSWORD` | Ansible vault password | Generate with `openssl rand -base64 32` |

### 3. Configure Your Site

Edit `ansible/group_vars/wordpress.yml`:

```yaml
wp_domain: yourdomain.com
wp_site_url: https://yourdomain.com
wp_admin_email: admin@yourdomain.com
```

### 4. Deploy!

```bash
# Via GitHub Actions
# Go to: Actions → "Provision + Configure" → Run workflow
```

**Duration:** ~15-20 minutes

Your WordPress site will be live at `https://yourdomain.com` 🎉

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

### Add Your WordPress Theme

```bash
# On the deployed server
ssh ubuntu@your-instance-ip
cd /var/www/html/wp-content/themes
sudo git clone https://github.com/yourusername/your-theme.git
sudo chown -R www-data:www-data your-theme
```

Then activate via WordPress Admin → Appearance → Themes

### Add Custom Plugins

Same process as themes:

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

## 📊 Monitoring

Every deployment includes:

- **CloudWatch Dashboard** - Real-time metrics
- **5 Critical Alarms** - Email alerts
- **Uptime Monitoring** - 5-minute checks
- **Cost Tracking** - Budget alerts

Deploy monitoring stacks:

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
- ✅ HTTPS enforced via load balancer
- ✅ WordPress security headers
- ✅ MySQL secured (no remote access)
- ✅ PHP security settings optimized

## 💰 Cost Optimization

### Included Optimizations

- Nano instance ($3.50/month) sufficient for most blogs
- S3 media offload (optional, saves disk space)
- CloudFront CDN integration (optional)
- Lifecycle policies for backups (auto-delete old)

### Cost Breakdown

| Component | Monthly Cost |
|-----------|--------------|
| Lightsail Nano Instance | $3.50 |
| Lightsail Load Balancer | $18.00 |
| Route53 Hosted Zone | $0.50 |
| CloudWatch Monitoring | $3.00 |
| CloudWatch Alarms | $1.00 |
| Synthetic Monitoring | $5-10.00 |
| **Total** | **~$31-36** |

Compare to:
- WordPress.com Business: $25-300/month
- Kinsta: $35+/month
- WP Engine: $30+/month

## 📖 Documentation

### Getting Started
- [GitHub Setup Checklist](docs/GITHUB_SETUP_CHECKLIST.md)
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

Deploy to production when ready:

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
6. **Go live!** Update DNS to production domain

---

**Built with ❤️ for WordPress developers who want production-grade infrastructure without the complexity.**

⭐ Star this repo if you find it useful!
