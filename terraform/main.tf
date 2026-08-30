# Terraform placeholder for Lightsail resources.
# Add aws_lightsail_instance, aws_lightsail_static_ip, and attachment resources here.

provider "aws" {
  region = var.aws_region
}

# Create key pair for AWS console access (required by Lightsail)
# Uses the same CI/CD public key but with ignore_changes lifecycle
# This ensures the key pair exists without causing instance recreation
resource "aws_lightsail_key_pair" "blog_key" {
  name       = var.key_pair_name
  public_key = var.cicd_public_key

  lifecycle {
    # Don't recreate instance if key changes - user_data handles updates
    ignore_changes = [public_key]
  }
}

resource "aws_lightsail_instance" "blog" {
  name              = var.instance_name
  availability_zone = var.availability_zone
  blueprint_id      = var.blueprint_id
  bundle_id         = var.bundle_id
  key_pair_name     = var.key_pair_name # Keep using existing key pair name

  # Install CI/CD public key via user_data for Ansible access
  # This allows SSH without managing the Lightsail key pair resource
  user_data = <<-EOF
    #!/bin/bash
    # Add CI/CD public key for automation (does not affect Lightsail key pair)
    mkdir -p /home/ubuntu/.ssh
    chmod 700 /home/ubuntu/.ssh
    
    # Install the public key from the GitHub secret (generated from private key)
    echo "${var.cicd_public_key}" >> /home/ubuntu/.ssh/authorized_keys
    chmod 600 /home/ubuntu/.ssh/authorized_keys
    chown -R ubuntu:ubuntu /home/ubuntu/.ssh
    
    # Log for debugging
    echo "CI/CD public key installed at $(date)" >> /var/log/userdata.log
  EOF

  # Note: Removed lifecycle ignore_changes for user_data
  # Instance will be recreated if user_data changes (OK for demo/dev environment)
}

resource "aws_lightsail_static_ip" "blog_ip" {
  name = var.static_ip_name
}

resource "aws_lightsail_static_ip_attachment" "blog_ip_attach" {
  static_ip_name = aws_lightsail_static_ip.blog_ip.name
  instance_name  = aws_lightsail_instance.blog.name
}

resource "aws_lightsail_lb" "blog_lb" {
  name              = var.load_balancer_name
  instance_port     = var.load_balancer_instance_port
  health_check_path = var.load_balancer_health_check_path
}

resource "aws_lightsail_lb_attachment" "blog_lb_attach" {
  lb_name       = aws_lightsail_lb.blog_lb.name
  instance_name = aws_lightsail_instance.blog.name
}

resource "aws_lightsail_lb_certificate" "blog_cert" {
  lb_name     = aws_lightsail_lb.blog_lb.name
  name        = var.load_balancer_certificate_name
  domain_name = var.load_balancer_certificate_domain

  subject_alternative_names = var.load_balancer_certificate_alternative_names
}

resource "aws_route53_record" "lb_cert_validation" {
  for_each = var.enable_cert_validation_records ? {
    for idx, record in tolist(aws_lightsail_lb_certificate.blog_cert.domain_validation_records) :
    tostring(idx) => {
      name  = record.resource_record_name
      type  = record.resource_record_type
      value = record.resource_record_value
    }
  } : {}

  zone_id         = var.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 300
  records         = [each.value.value]
  allow_overwrite = true
}

resource "aws_route53_record" "lightsail_a_record" {
  for_each = var.enable_route53_a_records ? toset(var.route53_a_record_names) : []

  zone_id         = var.route53_zone_id
  name            = each.value
  type            = "A"
  allow_overwrite = true
  ttl             = 300
  records         = [aws_lightsail_static_ip.blog_ip.ip_address]
}