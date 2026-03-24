# 不透過 npm 啟動 DB，避免舊版 Node 無法執行現代 npm。
# 用法：於 PowerShell 執行  pwsh -File .\scripts\db-up.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose up -d
Write-Host "MySQL 已於背景啟動（預設 localhost:3306）。"
