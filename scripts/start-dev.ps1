# Start the development stack using docker-compose and wait for services to be reachable
# Usage: .\scripts\start-dev.ps1

Write-Host "Starting docker compose..."
docker compose up --build -d

Write-Host "Waiting for backend (http://localhost:8000) to become ready..."
$attempt = 0
while ($attempt -lt 30) {
    try {
        $r = Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { Write-Host "Backend is ready."; break }
    } catch {
        Start-Sleep -Seconds 2
    }
    $attempt++
}

if ($attempt -ge 30) { Write-Host "Timed out waiting for backend."; exit 1 }

Write-Host "All services started. Backend docs available at http://localhost:8000/docs and frontend at http://localhost:3000 (if frontend is built or running)."
