# Terraform variables placeholder.

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Lightsail availability zone"
  type        = string
  default     = "us-east-1a"
}

variable "instance_name" {
  description = "Lightsail instance name"
  type        = string
  default     = "blog-dev-1"
}

variable "blueprint_id" {
  description = "Lightsail blueprint ID (e.g., ubuntu_22_04, wordpress)"
  type        = string
  default     = "ubuntu_22_04"
}

variable "bundle_id" {
  description = "Lightsail bundle ID (e.g., micro_2_0)"
  type        = string
  default     = "micro_2_0"
}

variable "key_pair_name" {
  description = "Lightsail key pair name"
  type        = string
  default     = "blog-wordpress-key"
}

variable "public_key_path" {
  description = "Path to SSH public key file (for Lightsail key pair resource)"
  type        = string
  default     = "~/.ssh/lightsail_blog_key.pub"
}

variable "cicd_public_key" {
  description = "Public SSH key for CI/CD automation (installed via user_data)"
  type        = string
  default     = ""
}

variable "static_ip_name" {
  description = "Lightsail static IP name"
  type        = string
  default     = "blog-dev-ip"
}

variable "load_balancer_name" {
  description = "Lightsail load balancer name"
  type        = string
  default     = "blog-dev-lb"
}

variable "load_balancer_instance_port" {
  description = "Instance port for the Lightsail load balancer"
  type        = number
  default     = 80
}

variable "load_balancer_health_check_path" {
  description = "Health check path for the Lightsail load balancer"
  type        = string
  default     = "/"
}

variable "load_balancer_certificate_name" {
  description = "Lightsail TLS certificate name"
  type        = string
  default     = "blog-dev-cert"
}

variable "load_balancer_certificate_domain" {
  description = "Primary domain for the TLS certificate"
  type        = string
  default     = "thebasictek.com"
}

variable "load_balancer_certificate_alternative_names" {
  description = "Subject alternative names for the TLS certificate"
  type        = list(string)
  default     = ["www.thebasictek.com"]
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS validation records"
  type        = string
  default     = "Z0869026ZCPNGM8HB5I6"
}

variable "enable_route53_a_records" {
  description = "Create Route53 A records for the Lightsail static IP"
  type        = bool
  default     = true
}

variable "route53_a_record_names" {
  description = "Route53 record names to create for the static IP"
  type        = list(string)
  default     = ["thebasictek.com"]
}

variable "enable_cert_validation_records" {
  description = "Create Route53 validation records after the certificate exists"
  type        = bool
  default     = false
}
