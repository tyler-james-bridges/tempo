variable "organization_id" {
  description = "The Supabase organization ID"
  type        = string
}

variable "project_name" {
  description = "The name of the Supabase project"
  type        = string
  default     = "tempomap"
}

variable "database_password" {
  description = "The database password for the Supabase project"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "The region for the Supabase project"
  type        = string
  default     = "us-east-1"
}
