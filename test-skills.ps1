$body = @{
    userId = "689093c6e8bf20afc1df896e"
    skills = @("JavaScript", "React", "Node.js")
} | ConvertTo-Json

Write-Host "Testing direct skills update..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test-skills" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
