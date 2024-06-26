# Lambda to enter sweepstakes

provider "aws" {
  region = "us-west-2"
}

resource "aws_lambda_function" "sweepstakes" {
  function_name = "sweepstakes"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  memory_size   = 128
  timeout       = 10

  filename         = "./lambda.zip"
  source_code_hash = filebase64sha256("./lambda.zip")

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      FORM_URL = "https://www.hgtv.com/sweepstakes/hgtv-smart-home/sweepstakes?lid=3lzxbe6zqtwb&nl=R-HGTV:SH2024__EnterHGTV"
      EMAIL    = "DrewJohnsonGT@gmail.com"
      HEADLESS = "true"
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "sweepstakes-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}
