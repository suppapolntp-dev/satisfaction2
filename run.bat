@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ======================================================================
echo   Satisfaction Platform - Local Dev Services Bootstrapper
echo ======================================================================
echo.

:: Ensure dotnet is in PATH
where dotnet >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\dotnet\dotnet.exe" (
        set "PATH=%PATH%;C:\Program Files\dotnet"
    )
)

:: ----------------------------------------------------------------------
:: 1. Check Docker Containers (PostgreSQL 5432 and pgAdmin 5050)
:: ----------------------------------------------------------------------
echo [1/3] Checking Docker Containers (PostgreSQL ^& pgAdmin)...
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARN] Docker is not installed or not in PATH. Skipping Docker...
    goto :check_backend
)

powershell.exe -NoProfile -Command "if ((docker ps -q --filter 'name=satisfaction_postgres' --filter 'status=running') -ne $null) { exit 0 } else { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK]   PostgreSQL and pgAdmin are already running.
) else (
    echo [INFO] Starting PostgreSQL and pgAdmin via Docker Compose...
    docker compose up -d
    if !ERRORLEVEL! equ 0 (
        echo [OK]   Docker containers started successfully.
    ) else (
        echo [WARN] Failed to start Docker. Please ensure Docker Desktop is running.
    )
)

:check_backend
echo.
:: ----------------------------------------------------------------------
:: 2. Check Backend Service (ASP.NET Core on Port 5005)
:: ----------------------------------------------------------------------
echo [2/3] Checking Backend API (.NET on Port 5005)...
powershell.exe -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5005 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK]   Backend API is already running on http://localhost:5005
) else (
    echo [INFO] Starting Backend in a new window...
    start "Satisfaction Backend (Port 5005)" cmd /k "cd /d "%~dp0Backend" && dotnet run --urls "http://localhost:5005""
    echo [OK]   Backend launch command issued.
)

echo.
:: ----------------------------------------------------------------------
:: 3. Check Frontend Service (Next.js on Port 3000)
:: ----------------------------------------------------------------------
echo [3/3] Checking Frontend App (Next.js on Port 3000)...
powershell.exe -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK]   Frontend is already running on http://localhost:3000
) else (
    echo [INFO] Starting Frontend Next.js app in a new window...
    start "Satisfaction Frontend (Port 3000)" cmd /k "cd /d "%~dp0Frontend" && npm run dev"
    echo [OK]   Frontend launch command issued.
)

echo.
echo ======================================================================
echo   All Services Ready!
echo   - Frontend:    http://localhost:3000
echo   - Backend API: http://localhost:5005/swagger
echo   - pgAdmin:     http://localhost:5050
echo ======================================================================
echo.
