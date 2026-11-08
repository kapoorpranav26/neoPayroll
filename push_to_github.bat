@echo off
cd /d "%~dp0"
echo ========================================================
echo   Pushing NeoPayroll to GitHub (kapoorpranav26/neoPayroll)
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo [ERROR] Push failed. If prompted, please complete browser authentication.
)
echo.
pause
