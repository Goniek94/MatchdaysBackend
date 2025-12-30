@echo off
echo ========================================
echo   Matchdays Backend - Start Database
echo ========================================
echo.

echo [1/4] Sprawdzanie Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker nie jest zainstalowany!
    echo Pobierz Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker jest zainstalowany
echo.

echo [2/4] Uruchamianie bazy danych PostgreSQL...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Nie udalo sie uruchomic bazy danych!
    pause
    exit /b 1
)
echo [OK] Baza danych uruchomiona
echo.

echo [3/4] Czekanie na gotowość bazy danych...
timeout /t 5 /nobreak >nul
echo [OK] Baza danych gotowa
echo.

echo [4/4] Testowanie polaczenia...
call npm run test:db
echo.

echo ========================================
echo   Baza danych dziala!
echo ========================================
echo.
echo Dane polaczenia:
echo   Host: localhost
echo   Port: 5432
echo   Database: matchdays
echo   User: matchdays_user
echo   Password: matchdays_password_2024
echo.
echo Nastepne kroki:
echo   1. npm run prisma:migrate
echo   2. npm run start:dev
echo.
pause
