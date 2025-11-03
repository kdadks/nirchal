#!/usr/bin/env pwsh
# Test Razorpay Webhook Endpoint

Write-Host "Testing Razorpay Webhook Endpoint..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if endpoint is accessible
Write-Host "Test 1: Checking endpoint accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://nirchal.com/razorpay-webhook" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-razorpay-signature" = "test_signature"
        } `
        -Body '{"event":"test"}' `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Endpoint is accessible" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Gray
}

Write-Host ""

# Test 2: Check if Razorpay can reach the endpoint
Write-Host "Test 2: Simulating Razorpay webhook call..." -ForegroundColor Yellow

$webhookPayload = @{
    entity = "event"
    account_id = "test_account"
    event = "payment.captured"
    contains = @("payment")
    payload = @{
        payment = @{
            entity = @{
                id = "pay_test123"
                entity = "payment"
                amount = 1000
                currency = "INR"
                status = "captured"
                order_id = "order_test123"
                method = "card"
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "https://nirchal.com/razorpay-webhook" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-razorpay-signature" = "invalid_but_present"
        } `
        -Body $webhookPayload `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Webhook endpoint responded" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "Status Code: $statusCode" -ForegroundColor Gray
    
    if ($statusCode -eq 400) {
        Write-Host "✅ Endpoint is working (rejected invalid signature as expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check Cloudflare Pages Functions logs" -ForegroundColor White
Write-Host "2. Verify Razorpay Dashboard webhook configuration:" -ForegroundColor White
Write-Host "   URL: https://nirchal.com/razorpay-webhook" -ForegroundColor Yellow
Write-Host "   Events: payment.captured, order.paid" -ForegroundColor Yellow
Write-Host "3. Test with real order and check Razorpay webhook delivery logs" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
