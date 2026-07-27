@echo off
cd /d "%~dp0"
echo ====================================
echo  Deploying to GitHub / Vercel...
echo ====================================
echo.
git add -A
if %errorlevel% neq 0 (
  echo [ERROR] git add failed
  pause
  exit /b 1
)
echo [OK] Files staged
echo.
git commit -m "Update: fix icons, modal portal, compact upgrade card"
if %errorlevel% neq 0 (
  echo [ERROR] git commit failed
  pause
  exit /b 1
)
echo [OK] Changes committed
echo.
git push origin master
if %errorlevel% neq 0 (
  echo [ERROR] git push failed
  pause
  exit /b 1
)
echo.
echo ====================================
echo  Deploy complete! Vercel will rebuild.
echo ====================================
pause
