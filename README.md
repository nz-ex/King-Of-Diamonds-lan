# King of Diamonds LAN – Alice in Borderland Style

A LAN-based multiplayer implementation of the King of Diamonds game from Alice in Borderland.
Players connect over the same Wi‑Fi/network, secretly choose numbers, and lose health based on how far they are from the target.

Features

    LAN multiplayer (same Wi‑Fi / local network)

    Hidden choices (no cheating between players)

    Target is the average of all choices × 0.8

    Each player starts with 10 HP

    Closest player(s) lose 0 HP, everyone else loses 1 HP

    Simple browser UI built with React + Vite

Requirements

    Node.js (v18+ recommended)

    npm (comes with Node)

    All players must be on the same local network (Wi‑Fi or Ethernet)

Installation

bash
# 1. Clone or download this repo
git clone https://github.com/your-username/king-of-diamonds-lan.git
cd king-of-diamonds-lan

# 2. Install dependencies
npm install

That’s it for setup.
How to Run (Host)

The host is the person running the server on their PC.
Option A – Manual (no batch script required)

In one terminal (server):

bash
npm run server

You should see:

text
🟢 Server ready - Waiting for players...

In a second terminal (game client / Vite dev server):

bash
npm run dev -- --host 0.0.0.0

Vite will print something like:

text
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/

    The Network URL (http://192.168.x.x:5173/) is what other players use.

    Keep both terminals open while you play.

Option B – Using a batch script (Windows)

Create a file named start-lan.bat in the project folder:

text
@echo off
cd /d "%~dp0"
echo ========================================
echo King of Diamonds LAN Multiplayer
echo ========================================
echo.

REM Kill existing server on port 3001 (if any)
echo [0/4] Clearing old server...
netstat -ano | findstr :3001 >nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo    Old server killed.
)

echo [1/4] Finding your WiFi IP...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192"') do (
    set IP=%%i
    set IP=%IP: =%
    goto :found_ip
)
:found_ip
echo 🎮 YOUR IP: %IP%
echo 📱 Share: http://%IP%:5173
echo.

echo [2/4] Starting Server...
start "King of Diamonds Server" cmd /k "npm run server"
timeout /t 4 >nul

echo [3/4] Starting Game...
npm run dev -- --host 0.0.0.0

echo [4/4] Ready! Press any key to close.
pause

Notes:

    cd /d "%~dp0" makes it work from any folder (no username/path editing).

    Double‑click start-lan.bat to start server + game and print the shareable IP.

How Players Join

    Host runs the game (using Option A or B above).

    Host looks at:

        The Network URL from Vite, or

        The IP shown by the batch script (e.g., http://192.168.1.105:5173).

    Every player on the same Wi‑Fi/LAN opens that URL in a browser.

    Each player:

        Enters a name.

        Clicks “Enter Borderland”.

    When at least 2 players are in the lobby, someone clicks Start Round.

Game Rules (Implemented)

    Each round, every player chooses an integer from 0–100.

    The server computes:

        Average of all choices

        Target = average × 0.8

    One or more players will be closest to the target:

        Closest player(s): lose 0 HP

        All other players: lose 1 HP

    Each player starts at 10 HP.

    When your HP hits 0, you’re effectively “dead” (displayed as eliminated).
