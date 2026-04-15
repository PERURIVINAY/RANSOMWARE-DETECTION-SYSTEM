@echo off
echo =======================================================
echo Sentinel AI: Zero-Day Ransomware Detection System
echo =======================================================
echo.

echo [1/3] Starting Backend API...
start cmd /c "cd backend && python app.py"

echo [2/3] Starting Frontend Dashboard...
start cmd /c "cd frontend && npm run dev"

echo.
echo =======================================================
echo [+] Application is starting up!
echo [+] Backend running on: http://localhost:5000
echo [+] Frontend running on: http://localhost:5173 
echo.
echo To run a safe threat simulation, double-click:
echo "run_simulation.bat"
echo =======================================================
pause
