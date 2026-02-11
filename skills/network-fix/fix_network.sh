#!/bin/bash
# Network Fix Script - Fix VPN proxy settings for GitHub API

echo "=== Network Fix Script ==="
echo ""

# Step 1: Check if VPN is connected
echo "Step 1: Checking VPN connection..."
if curl -s --connect-timeout 5 "https://api.github.com/" > /dev/null 2>&1; then
    echo "✅ Direct connection to GitHub API works!"
    VPN_CONNECTED=true
else
    echo "⚠️  Direct connection failed, checking VPN..."
    VPN_CONNECTED=false
fi

echo ""

# Step 2: Handle proxy settings
echo "Step 2: Configuring proxy settings..."

if [ "$VPN_CONNECTED" = false ]; then
    # Check if VPN might be on (different port check)
    if curl -s --connect-timeout 5 -x "http://127.0.0.1:7890" "https://api.github.com/" > /dev/null 2>&1; then
        echo "🔄 VPN detected on port 7890, setting proxy..."
        export https_proxy=http://127.0.0.1:7890
        export http_proxy=http://127.0.0.1:7890
        echo "✅ Proxy set: http://127.0.0.1:7890"
    elif curl -s --connect-timeout 5 -x "http://127.0.0.1:1080" "https://api.github.com/" > /dev/null 2>&1; then
        echo "🔄 VPN detected on port 1080, setting proxy..."
        export https_proxy=http://127.0.0.1:1080
        export http_proxy=http://127.0.0.1:1080
        echo "✅ Proxy set: http://127.0.0.1:1080"
    else
        echo "🔧 No VPN detected, removing proxy settings..."
        unset https_proxy http_proxy HTTPS_PROXY HTTP_PROXY
        echo "✅ Proxy settings removed"
    fi
else
    # Direct connection works, ensure no proxy
    unset https_proxy http_proxy HTTPS_PROXY HTTP_PROXY
    echo "✅ Using direct connection"
fi

echo ""

# Step 3: Test GitHub API
echo "Step 3: Testing GitHub API connection..."
if curl -s --max-time 10 "https://api.github.com/user" -H "Authorization: token ${GH_TOKEN:-}" > /dev/null 2>&1; then
    echo "✅ GitHub API is accessible!"
else
    echo "❌ GitHub API still not accessible"
    echo "💡 Please check:"
    echo "   1. Is VPN turned on?"
    echo "   2. Is GH_TOKEN set?"
    echo "   3. Try: export https_proxy=http://127.0.0.1:7890"
fi

echo ""
echo "=== Done ==="
