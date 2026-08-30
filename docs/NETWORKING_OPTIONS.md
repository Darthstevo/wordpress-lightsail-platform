# Lightsail Networking Options

## Current Configuration: Default Lightsail Network

The current Terraform configuration uses **Lightsail's default network**:

- All Lightsail instances in the region share this network
- Instances can communicate with each other
- Firewall rules control access
- No additional cost

## Option 1: Keep Default Network (RECOMMENDED)

**Pros:**

- ✅ Simple and straightforward
- ✅ No additional configuration needed
- ✅ No extra cost
- ✅ Works great for single WordPress site
- ✅ Instances isolated from EC2/other accounts

**Cons:**

- ⚠️ Other Lightsail instances in same region could potentially communicate (if firewall allows)

**Best for**: Single WordPress site, no complex networking needs

## Option 2: Create Dedicated Lightsail VPC (Available in some regions)

**Note**: Lightsail doesn't have traditional VPCs, but you can achieve isolation through:

1. **Firewall Rules** - Restrict traffic to specific IPs/ports
2. **Private IP Configuration** - Use private networking only
3. **VPC Peering** (optional) - Connect to EC2 VPC if needed

**Terraform Addition Required:**

```hcl
# Note: Lightsail instances are automatically placed in AWS-managed network
# Network isolation is handled via firewall rules, not VPC creation
```

## Option 3: Enable VPC Peering to EC2 VPC

If you need to connect Lightsail to EC2/RDS resources in a VPC:

```hcl
resource "aws_lightsail_instance_public_ports" "blog" {
  instance_name = aws_lightsail_instance.blog.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = ["YOUR_IP/32"]  # SSH only from your IP
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]  # HTTP from anywhere (LB needs this)
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]  # HTTPS from anywhere (LB needs this)
  }
}
```

## 🎯 Recommendation for Your Use Case

**Use Option 1: Default Network with Firewall Rules**

**Why:**

- You're running a standalone WordPress blog
- Database is local (no external DB connection needed)
- Load balancer handles public traffic
- Ansible will configure firewall rules on the instance
- Simplest and cheapest option

### Security Configuration:

The setup will use:

1. **Lightsail Firewall** - Controls which ports are accessible
2. **Instance Firewall (UFW)** - Managed by Ansible hardening role
3. **Nginx** - Only exposes port 80 to load balancer
4. **MySQL** - Only accessible locally (127.0.0.1)

This provides **excellent security** without VPC complexity.

## Do You Need VPC?

**You would only need VPC peering if:**

- ❌ Connecting to separate RDS database (you're not - using local DB)
- ❌ Accessing ElastiCache (you're not using it)
- ❌ Connecting to resources in EC2 VPC (you're migrating away from that)
- ❌ Using AWS PrivateLink services (not needed for WordPress)

**Answer: No, you don't need a VPC for this setup!**

## What We'll Configure Instead

The Ansible hardening role will configure:

- UFW firewall (allow 22, 80, 443 only)
- SSH key-only authentication
- Fail2ban for brute force protection
- MySQL bound to localhost only
- Nginx with security headers

This is **more than adequate** for a WordPress blog.

## If You Want Extra Isolation

We can add firewall rules to the Terraform config to restrict SSH access to your IP only:

```hcl
resource "aws_lightsail_instance_public_ports" "blog" {
  instance_name = aws_lightsail_instance.blog.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = ["YOUR_PUBLIC_IP/32"]  # Replace with your IP
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]
  }
}
```

Would you like me to add this?

---

**TL;DR**:

- ❌ Don't need EC2 VPC
- ✅ Lightsail default network is fine
- ✅ Firewall rules provide security
- ✅ Can add IP restrictions if you want
