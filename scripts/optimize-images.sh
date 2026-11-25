#!/bin/bash

# 🖼️ Image Optimization Script for Luca Gandolfi Portfolio
# This script optimizes images for web using ImageMagick and ffmpeg

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    if ! command -v convert &> /dev/null; then
        echo -e "${RED}ImageMagick not found. Installing...${NC}"
        apt-get update && apt-get install -y imagemagick > /dev/null 2>&1
    fi
    
    echo -e "${GREEN}✓ ImageMagick installed${NC}"
}

# Function to optimize JPEG
optimize_jpeg() {
    local input=$1
    local output=$2
    local quality=${3:-85}
    
    echo -e "${YELLOW}Optimizing JPEG: $input${NC}"
    
    convert "$input" \
        -quality "$quality" \
        -interlace Plane \
        -strip \
        "$output"
    
    local original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")
    local optimized_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
    local saving=$(( (original_size - optimized_size) * 100 / original_size ))
    
    echo -e "${GREEN}✓ Saved: ${saving}% ($(numfmt --to=iec $optimized_size 2>/dev/null || echo $optimized_size bytes))${NC}"
}

# Function to create WebP versions
create_webp() {
    local input=$1
    local output=$2
    local quality=${3:-80}
    
    echo -e "${YELLOW}Creating WebP: $input → $output${NC}"
    
    convert "$input" \
        -quality "$quality" \
        -strip \
        "$output"
    
    local optimized_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
    echo -e "${GREEN}✓ WebP created ($(numfmt --to=iec $optimized_size 2>/dev/null || echo $optimized_size bytes))${NC}"
}

# Function to create responsive thumbnails
create_thumbnails() {
    local input=$1
    local basename=$2
    local dir=$3
    
    echo -e "${YELLOW}Creating responsive thumbnails${NC}"
    
    # Small (mobile)
    convert "$input" -resize 480x480 -quality 85 "${dir}/${basename}-small.jpg"
    
    # Medium (tablet)
    convert "$input" -resize 768x768 -quality 85 "${dir}/${basename}-medium.jpg"
    
    # Large (desktop)
    convert "$input" -resize 1200x1200 -quality 85 "${dir}/${basename}-large.jpg"
    
    echo -e "${GREEN}✓ Thumbnails created${NC}"
}

# Main script
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🖼️  Image Optimization Script${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    check_dependencies
    
    echo -e "\n${BLUE}Processing images...${NC}\n"
    
    # Create output directory
    mkdir -p /workspaces/portfolio/assets/optimized
    
    # Optimize profile image
    if [ -f "/workspaces/portfolio/assets/cv_gandolfi.jpeg" ]; then
        optimize_jpeg \
            "/workspaces/portfolio/assets/cv_gandolfi.jpeg" \
            "/workspaces/portfolio/assets/optimized/cv_gandolfi-optimized.jpg" \
            85
        
        create_webp \
            "/workspaces/portfolio/assets/cv_gandolfi.jpeg" \
            "/workspaces/portfolio/assets/optimized/cv_gandolfi.webp" \
            80
        
        create_thumbnails \
            "/workspaces/portfolio/assets/cv_gandolfi.jpeg" \
            "cv_gandolfi" \
            "/workspaces/portfolio/assets/optimized"
    fi
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Image optimization complete!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${BLUE}Summary:${NC}"
    echo -e "  Output directory: /workspaces/portfolio/assets/optimized/"
    echo -e "  Formats created:"
    echo -e "    • JPG (optimized)"
    echo -e "    • WebP (modern browsers)"
    echo -e "    • Thumbnails (responsive)"
}

# Run main function
main "$@"
