# Supabase Project Configuration
# Note: This module manages Supabase resources via the Supabase Terraform provider
# Documentation: https://registry.terraform.io/providers/supabase/supabase/latest/docs

terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

# Reference existing project (for importing existing infrastructure)
# To import: terraform import module.supabase.supabase_project.main <project_id>
resource "supabase_project" "main" {
  organization_id   = var.organization_id
  name              = var.project_name
  database_password = var.database_password
  region            = var.region

  lifecycle {
    # Prevent accidental destruction of the project
    prevent_destroy = true
  }
}

# Note: Storage buckets are managed via the Supabase dashboard or SQL migrations
# The Supabase Terraform provider focuses on project-level resources
# For bucket management, use SQL migrations in your codebase:
#   INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);
