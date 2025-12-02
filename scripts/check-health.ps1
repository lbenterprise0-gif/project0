# Quick health checks for backend and API endpoints
# Usage: .\scripts\check-health.ps1

$endpoints = @(
    'http://localhost:8000/',
    'http://localhost:8000/docs',
    'http://localhost:8000/api/v1/listings',
    'http://localhost:8000/api/v1/users/register'
)

foreach ($url in $endpoints) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        Write-Host "$url -> $($r.StatusCode)"
    } catch {
        Write-Host "$url -> FAILED: $($_.Exception.Message)"
    }
}
