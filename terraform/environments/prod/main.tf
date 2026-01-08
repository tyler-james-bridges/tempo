# Production Environment Configuration
# This file instantiates the modules for the production environment

terraform {
  required_version = ">= 1.0"

  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
}

provider "vercel" {
  api_token = var.vercel_api_token
}

# Supabase Module
module "supabase" {
  source = "../../modules/supabase"

  organization_id   = var.supabase_organization_id
  project_name      = "tempomap-prod"
  database_password = var.supabase_database_password
  region            = "us-east-1"
}

# Vercel Module
module "vercel" {
  source = "../../modules/vercel"

  project_name = "tempomap"
  framework    = "nextjs"

  git_repository = {
    type = "github"
    repo = "tyler-james-bridges/tempo"
  }

  root_directory = "apps/web"

  supabase_url              = module.supabase.api_url
  supabase_anon_key         = var.supabase_anon_key
  supabase_service_role_key = var.supabase_service_role_key
  anthropic_api_key         = var.anthropic_api_key
}

# Outputs
output "supabase_project_id" {
  description = "The Supabase project ID"
  value       = module.supabase.project_id
}

output "supabase_api_url" {
  description = "The Supabase API URL"
  value       = module.supabase.api_url
}

output "vercel_project_url" {
  description = "The Vercel deployment URL"
  value       = module.vercel.project_url
}

# Variables (inherited from root or tfvars)
variable "supabase_access_token" {
  description = "Supabase Management API access token"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "supabase_organization_id" {
  description = "Supabase organization ID"
  type        = string
}

variable "supabase_database_password" {
  description = "Supabase database password"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key for server-side operations"
  type        = string
  sensitive   = true
}
