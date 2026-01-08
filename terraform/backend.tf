# Terraform Backend Configuration
#
# This configuration uses S3 for remote state storage with DynamoDB for state locking.
# This is currently commented out for initial local development.
#
# To enable remote state:
# 1. Create an S3 bucket for state storage
# 2. Create a DynamoDB table for state locking (partition key: "LockID")
# 3. Uncomment the backend configuration below
# 4. Run: terraform init -migrate-state
#
# AWS CLI commands to create the backend resources:
#
# # Create S3 bucket
# aws s3api create-bucket \
#   --bucket tempomap-terraform-state \
#   --region us-east-1
#
# # Enable versioning on the bucket
# aws s3api put-bucket-versioning \
#   --bucket tempomap-terraform-state \
#   --versioning-configuration Status=Enabled
#
# # Enable encryption on the bucket
# aws s3api put-bucket-encryption \
#   --bucket tempomap-terraform-state \
#   --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
#
# # Create DynamoDB table for state locking
# aws dynamodb create-table \
#   --table-name tempomap-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

# terraform {
#   backend "s3" {
#     bucket         = "tempomap-terraform-state"
#     key            = "terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "tempomap-terraform-locks"
#   }
# }
