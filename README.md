# Chronos
A basic time-rapporting system in AWS. Below is a quick guide on how to set it up.

## Prerequisites
1. AWS Account: Ensure you have an AWS account.
2. AWS CLI: Install and configure the AWS CLI.
3. Terraform: Install Terraform on your local machine.
4. IAM User/Role: Ensure you have an IAM user or role with sufficient permissions to create resources.

## Step 1: Define Requirements
1. Data Storage: Use Amazon DynamoDB for storing time entries.
2. API Gateway: Use Amazon API Gateway to expose APIs for CRUD operations.
3. Lambda Functions: Use AWS Lambda for backend logic.
4. Authentication: Use Amazon Cognito for user authentication.

# Testing the API

curl -X POST -H "Content-Type: application/json" \
     -d '{"clientId": "client1", "duration": 120}' \
     https://<api-id>.execute-api.<region>.amazonaws.com/dev/time-entry

# Front end
Tools and frameworks
1. NextJS
2. AWS Cognito
3. AWS Amplify

# Cognito

1. Create a User Pool manually through the console
2. Get `Token signing key URL` example `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-123abc456`
3. Get audience from Cognito -> App Clients -> Client ID example `12345abcde12345abcde12345`
4. Navigate to API Gateway
5. Choose the API
6. Click Develop -> Authorization -> Manage Authorizers -> Create
7. Select JWT
8. Fill in Issuer ID = Token signing key URL and Audience from step 3
9. Click Create
10. Go to `Routes`
11. Attach the new authorizer to the endpoints

Challenge: Do this setup in Terraform

# Deploy steps

The terraform project need to be initialized first.
`terraform init`

Deploy the project and perform the resource changes by using apply.
`terraform apply`

# Amplify

## Webhook
