@echo off
echo ========================================
echo   Deploying Gabay to Vercel...
echo ========================================
echo.
cd /d "C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project\Board Exam Reviewer Web App"
echo Project directory set.
echo.
echo Running Vercel deploy (this takes 1-2 minutes)...
call npx vercel deploy --prod --yes
echo.
echo ========================================
if %errorlevel% EQU 0 (
    echo ? DEPLOY SUCCESSFUL!
    echo Your app should be live soon!
) else (
    echo ? Deploy failed. Check the error above.
)
echo ========================================
echo.
pause
