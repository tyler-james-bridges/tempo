variable "project_name" {
  description = "The name of the Vercel project"
  type        = string
  default     = "tempomap"
}

variable "framework" {
  description = "The framework used by the project"
  type        = string
  default     = "nextjs"
}

variable "git_repository" {
  description = "Git repository configuration"
  type = object({
    type = string
    repo = string
  })
  default = {
    type = "github"
    repo = "tyler-james-bridges/tempo"
  }
}

variable "root_directory" {
  description = "The root directory of the project in the repository"
  type        = string
  default     = "apps/web"
}

variable "build_command" {
  description = "The build command for the project"
  type        = string
  default     = null
}

variable "install_command" {
  description = "The install command for the project"
  type        = string
  default     = null
}

variable "environment_variables" {
  description = "Environment variables for the project"
  type = list(object({
    key       = string
    value     = string
    target    = list(string)
    sensitive = bool
  }))
  default = []
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for PDF analysis"
  type        = string
  sensitive   = true
}
