output "project_id" {
  description = "The Supabase project ID"
  value       = supabase_project.main.id
}

output "project_ref" {
  description = "The Supabase project reference"
  value       = supabase_project.main.id
}

output "api_url" {
  description = "The Supabase API URL"
  value       = "https://${supabase_project.main.id}.supabase.co"
}
