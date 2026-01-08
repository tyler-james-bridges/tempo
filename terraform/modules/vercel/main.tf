# Vercel Project Configuration
# Documentation: https://registry.terraform.io/providers/vercel/vercel/latest/docs

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

resource "vercel_project" "main" {
  name      = var.project_name
  framework = var.framework

  git_repository = {
    type = var.git_repository.type
    repo = var.git_repository.repo
  }

  root_directory = var.root_directory
}

# Environment Variables - managed separately from project
resource "vercel_project_environment_variable" "supabase_url" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "anthropic_api_key" {
  project_id = vercel_project.main.id
  key        = "ANTHROPIC_API_KEY"
  value      = var.anthropic_api_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "supabase_service_role_key" {
  project_id = vercel_project.main.id
  key        = "SUPABASE_SERVICE_ROLE_KEY"
  value      = var.supabase_service_role_key
  target     = ["production", "preview"]
  sensitive  = true
}

# Production domain (optional - uncomment to configure custom domain)
# resource "vercel_project_domain" "main" {
#   project_id = vercel_project.main.id
#   domain     = "tempomap.app"
# }
