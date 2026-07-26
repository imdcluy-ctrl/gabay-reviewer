@echo off
echo Starting Gabay Web App...
echo.

:: Start the Vite development server in the background and open the browser
start cmd /c "npm run dev"
echo Waiting for the server to start...
timeout /t 3 /nobreak > nul

:: Open the default browser to the localhost URL
start http://localhost:5173

echo Gabay is running in your browser!
echo Close the Node.js command window to stop the server.
