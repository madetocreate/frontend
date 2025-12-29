#!/bin/bash
# Performance Check Script
# Runs Lighthouse audit and collects performance metrics

set -e

echo "🚀 Starting Performance Check..."
echo ""

# Check if Lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "📦 Installing Lighthouse..."
    npm install -g lighthouse
fi

# Default URL
URL=${1:-"http://localhost:3000"}

echo "🔍 Running Lighthouse audit for: $URL"
echo ""

# Run Lighthouse
lighthouse "$URL" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=html,json \
    --output-path=./performance-report \
    --chrome-flags="--headless --no-sandbox" \
    --quiet || {
    echo "⚠️  Lighthouse audit completed with warnings"
}

echo ""
echo "✅ Performance report generated:"
echo "   - HTML: ./performance-report.html"
echo "   - JSON: ./performance-report.json"
echo ""
echo "📊 Opening report..."
open ./performance-report.html 2>/dev/null || xdg-open ./performance-report.html 2>/dev/null || echo "   Please open ./performance-report.html manually"

