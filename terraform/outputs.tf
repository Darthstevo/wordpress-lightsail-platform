# Terraform outputs placeholder.

output "instance_name" {
  value     = aws_lightsail_instance.blog.name
  sensitive = true
}

output "static_ip" {
  value     = aws_lightsail_static_ip.blog_ip.ip_address
  sensitive = true
}

output "load_balancer_dns_name" {
  value = aws_lightsail_lb.blog_lb.dns_name
}

output "load_balancer_certificate_validation_records" {
  value = aws_lightsail_lb_certificate.blog_cert.domain_validation_records
}
