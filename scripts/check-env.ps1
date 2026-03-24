# 檢查：Node 20+、Docker CLI、Docker daemon 是否可用
$ErrorActionPreference = "Continue"
$ok = $true

Write-Host "=== charity-donation 環境檢查 ===" -ForegroundColor Cyan

# Node
try {
  $nv = node -v 2>$null
  if (-not $nv) { throw "no node" }
  Write-Host "[OK] Node: $nv"
  if ($nv -match '^v(\d+)') {
    $major = [int]$Matches[1]
    if ($major -lt 20) {
      Write-Host "[!!] 需要 Node >= 20（目前 major=$major）。請 volta install node@20" -ForegroundColor Yellow
      $ok = $false
    }
  }
} catch {
  Write-Host "[XX] 找不到 node。請安裝 Node 20+ 或 Volta。" -ForegroundColor Red
  $ok = $false
}

# Docker CLI
$dockerBin = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerBin) {
  Write-Host "[XX] 找不到 docker。請安裝 Docker Desktop 並重開終端機。" -ForegroundColor Red
  $ok = $false
} else {
  Write-Host "[OK] docker 指令存在: $($dockerBin.Source)"
}

# Docker daemon
if ($dockerBin) {
  docker info 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[XX] 無法連線 Docker daemon。請開啟 Docker Desktop 並等狀態變成 Running。" -ForegroundColor Red
    $ok = $false
  } else {
    Write-Host "[OK] Docker daemon 可連線"
  }
}

# .env
$envFile = Join-Path $PSScriptRoot "..\apps\bff\.env"
if (Test-Path $envFile) {
  Write-Host "[OK] apps\bff\.env 存在"
} else {
  Write-Host "[!!] 尚無 apps\bff\.env — 請執行: copy apps\bff\.env.example apps\bff\.env" -ForegroundColor Yellow
}

Write-Host ""
if ($ok) {
  Write-Host "環境就緒。可執行: npm run db:up" -ForegroundColor Green
} else {
  Write-Host "請先修正上述紅色項目，再執行 npm run db:up" -ForegroundColor Yellow
}
exit $(if ($ok) { 0 } else { 1 })
