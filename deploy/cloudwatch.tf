# Cloud watch event rules to trigger the lambda function twice a day
# Once for each sweepstakes form

resource "aws_cloudwatch_event_rule" "rule1" {
  name                = "sweepstakes-morning"
  schedule_expression = "cron(0 10 * * ? *)" // Runs every day at 10:00 AM UTC
}

resource "aws_cloudwatch_event_target" "target1" {
  rule      = aws_cloudwatch_event_rule.rule1.name
  target_id = "SweepstakesFunction1"
  arn       = aws_lambda_function.sweepstakes.arn

  input = jsonencode({
    "formUrl" : "https://www.hgtv.com/sweepstakes/hgtv-smart-home/sweepstakes?lid=3lzxbe6zqtwb&nl=R-HGTV:SH2024__EnterHGTV",
    "email" : "DrewJohnsonGT@gmail.com",
    "headless" : "true"
  })
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_sweepstakes" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sweepstakes.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.rule1.arn
}

resource "aws_cloudwatch_event_rule" "rule2" {
  name                = "sweepstakes-evening"
  schedule_expression = "cron(0 2 * * ? *)" // Runs every day at 2:00 AM UTC (10:00 PM EST)
}

resource "aws_cloudwatch_event_target" "target2" {
  rule      = aws_cloudwatch_event_rule.rule2.name
  target_id = "SweepstakesFunction2"
  arn       = aws_lambda_function.sweepstakes.arn

  input = jsonencode({
    "formUrl" : "https://www.foodnetwork.com/sponsored/sweepstakes/hgtv-smart-home-sweepstakes?lid=ukfafnul4ip7&nl=R-HGTV:SH2024__EnterFood",
    "email" : "DrewJohnsonGT@gmail.com",
    "headless" : "true"
  })
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_sweepstakes2" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sweepstakes.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.rule2.arn
}
