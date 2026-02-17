#!/bin/bash
cd /home/reza/AIRouter/frontend
pkill -f "next dev"
sleep 2
rm -rf .next
npm run dev > /tmp/airouter-frontend-final.log 2>&1 &
echo "Frontend restarting... PID: $!"
echo "Wait 10 seconds then test: http://ai.nexairalab.net/login"

