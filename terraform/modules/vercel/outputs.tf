output "project_id" {
  description = "The Vercel project ID"
  value       = vercel_project.main.id
}

output "project_name" {
  description = "The Vercel project name"
  value       = vercel_project.main.name
}

output "project_url" {
  description = "The default Vercel deployment URL"
  value       = "https://${vercel_project.main.name}.vercel.app"
}
