# Reset ParkHere Database containers and Flyway Schema
Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
docker ps >$null 2>&1
if ($LastExitCode -ne 0) {
    Write-Error "Docker is not running. Please start Docker Desktop first, then run this script again."
    Exit 1
}

Write-Host "Stopping existing containers and removing volumes..." -ForegroundColor Yellow
docker compose down -v

Write-Host "Starting containers..." -ForegroundColor Green
docker compose up -d --build

Write-Host "Database reset complete. Flyway schema will re-initialize on startup." -ForegroundColor Green
