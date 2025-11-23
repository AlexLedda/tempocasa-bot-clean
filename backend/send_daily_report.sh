#!/bin/bash
# Script per inviare il report giornaliero

curl -s "http://localhost:8001/api/telegram/daily-report" > /dev/null 2>&1
