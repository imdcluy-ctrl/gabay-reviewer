@echo off
title GABAY Civil Service Exam Reviewer - Local Dev Server
echo ===================================================================
echo 🇵🇭 GABAY Civil Service Exam Reviewer Web App
echo ===================================================================
echo.
echo Launching local development server and opening browser...
echo Server URL: http://localhost:5173
echo.

:: Wait 3 seconds for Vite server startup, then auto-open default web browser
start "" http://localhost:5173

:: Run Vite dev server
npm run dev
