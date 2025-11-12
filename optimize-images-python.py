#!/usr/bin/env python3
"""
Image Optimization Script using PIL/Pillow
Converts and optimizes images without requiring ImageMagick
"""

import os
import sys
from pathlib import Path
from PIL import Image
import json

# Color codes for terminal output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    print(f"\n{Colors.BLUE}{Colors.BOLD}🖼️  Image Optimization Script (Python){Colors.RESET}\n")
    print("=" * 50)

def get_human_size(bytes_size):
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} GB"

def check_pil():
    """Check if PIL/Pillow is available"""
    try:
        import PIL
        return True
    except ImportError:
        print(f"{Colors.RED}❌ PIL/Pillow not found. Installing...{Colors.RESET}")
        os.system("pip install -q pillow")
        return True

def optimize_image(input_path, output_dir):
    """Optimize a single image and create multiple versions"""
    results = []
    
    try:
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path)
        filename = Path(input_path).stem
        
        print(f"\n{Colors.CYAN}Processing: {Path(input_path).name}{Colors.RESET}")
        print(f"  Original: {get_human_size(original_size)} ({img.size[0]}x{img.size[1]}px)")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert RGBA to RGB for JPEG
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # 1. Optimized JPEG (85% quality)
        jpeg_output = os.path.join(output_dir, f"{filename}-optimized.jpg")
        img.save(jpeg_output, 'JPEG', quality=85, optimize=True)
        jpeg_size = os.path.getsize(jpeg_output)
        jpeg_savings = ((original_size - jpeg_size) / original_size) * 100
        print(f"  ✓ JPEG (85%): {get_human_size(jpeg_size)} ({Colors.GREEN}-{jpeg_savings:.1f}%{Colors.RESET})")
        results.append(('JPEG', jpeg_output, jpeg_size, jpeg_savings))
        
        # 2. WebP format (80% quality)
        webp_output = os.path.join(output_dir, f"{filename}.webp")
        img.save(webp_output, 'WEBP', quality=80)
        webp_size = os.path.getsize(webp_output)
        webp_savings = ((original_size - webp_size) / original_size) * 100
        print(f"  ✓ WebP (80%): {get_human_size(webp_size)} ({Colors.GREEN}-{webp_savings:.1f}%{Colors.RESET})")
        results.append(('WebP', webp_output, webp_size, webp_savings))
        
        # 3. Small thumbnail (480x480)
        small_img = img.copy()
        small_img.thumbnail((480, 480), Image.Resampling.LANCZOS)
        small_jpeg = os.path.join(output_dir, f"{filename}-small.jpg")
        small_img.save(small_jpeg, 'JPEG', quality=85, optimize=True)
        small_size = os.path.getsize(small_jpeg)
        small_savings = ((original_size - small_size) / original_size) * 100
        print(f"  ✓ Small (480px): {get_human_size(small_size)} ({Colors.GREEN}-{small_savings:.1f}%{Colors.RESET})")
        results.append(('Small JPEG', small_jpeg, small_size, small_savings))
        
        small_webp = os.path.join(output_dir, f"{filename}-small.webp")
        small_img.save(small_webp, 'WEBP', quality=80)
        small_webp_size = os.path.getsize(small_webp)
        small_webp_savings = ((original_size - small_webp_size) / original_size) * 100
        print(f"  ✓ Small WebP: {get_human_size(small_webp_size)} ({Colors.GREEN}-{small_webp_savings:.1f}%{Colors.RESET})")
        results.append(('Small WebP', small_webp, small_webp_size, small_webp_savings))
        
        # 4. Medium thumbnail (768x768)
        medium_img = img.copy()
        medium_img.thumbnail((768, 768), Image.Resampling.LANCZOS)
        medium_jpeg = os.path.join(output_dir, f"{filename}-medium.jpg")
        medium_img.save(medium_jpeg, 'JPEG', quality=85, optimize=True)
        medium_size = os.path.getsize(medium_jpeg)
        medium_savings = ((original_size - medium_size) / original_size) * 100
        print(f"  ✓ Medium (768px): {get_human_size(medium_size)} ({Colors.GREEN}-{medium_savings:.1f}%{Colors.RESET})")
        results.append(('Medium JPEG', medium_jpeg, medium_size, medium_savings))
        
        medium_webp = os.path.join(output_dir, f"{filename}-medium.webp")
        medium_img.save(medium_webp, 'WEBP', quality=80)
        medium_webp_size = os.path.getsize(medium_webp)
        medium_webp_savings = ((original_size - medium_webp_size) / original_size) * 100
        print(f"  ✓ Medium WebP: {get_human_size(medium_webp_size)} ({Colors.GREEN}-{medium_webp_savings:.1f}%{Colors.RESET})")
        results.append(('Medium WebP', medium_webp, medium_webp_size, medium_webp_savings))
        
        # 5. Large thumbnail (1200x1200)
        large_img = img.copy()
        large_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        large_jpeg = os.path.join(output_dir, f"{filename}-large.jpg")
        large_img.save(large_jpeg, 'JPEG', quality=85, optimize=True)
        large_size = os.path.getsize(large_jpeg)
        large_savings = ((original_size - large_size) / original_size) * 100
        print(f"  ✓ Large (1200px): {get_human_size(large_size)} ({Colors.GREEN}-{large_savings:.1f}%{Colors.RESET})")
        results.append(('Large JPEG', large_jpeg, large_size, large_savings))
        
        large_webp = os.path.join(output_dir, f"{filename}-large.webp")
        large_img.save(large_webp, 'WEBP', quality=80)
        large_webp_size = os.path.getsize(large_webp)
        large_webp_savings = ((original_size - large_webp_size) / original_size) * 100
        print(f"  ✓ Large WebP: {get_human_size(large_webp_size)} ({Colors.GREEN}-{large_webp_savings:.1f}%{Colors.RESET})")
        results.append(('Large WebP', large_webp, large_webp_size, large_webp_savings))
        
        return True, results, original_size
    
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {str(e)}{Colors.RESET}")
        return False, [], 0

def main():
    print_header()
    
    # Check dependencies
    print("Checking dependencies...")
    if not check_pil():
        print(f"{Colors.RED}Failed to install PIL/Pillow{Colors.RESET}")
        sys.exit(1)
    print(f"{Colors.GREEN}✓ PIL/Pillow available{Colors.RESET}\n")
    
    # Set up paths
    portfolio_dir = Path("/workspaces/portfolio")
    assets_dir = portfolio_dir / "assets"
    output_dir = assets_dir / "optimized"
    
    # Find all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    image_files = []
    
    for ext in image_extensions:
        image_files.extend(assets_dir.glob(f'*{ext}'))
        image_files.extend(assets_dir.glob(f'*{ext.upper()}'))
    
    if not image_files:
        print(f"{Colors.YELLOW}No images found in {assets_dir}{Colors.RESET}\n")
        return
    
    print(f"Found {len(image_files)} image(s) to optimize:\n")
    
    total_original = 0
    total_optimized = 0
    all_results = {}
    
    # Process each image
    for image_file in image_files:
        success, results, original_size = optimize_image(str(image_file), str(output_dir))
        
        if success:
            total_original += original_size
            total_optimized += sum(r[2] for r in results)
            all_results[image_file.name] = results
    
    # Summary
    print("\n" + "=" * 50)
    print(f"\n{Colors.BOLD}{Colors.CYAN}📊 Optimization Summary{Colors.RESET}\n")
    
    if total_original > 0:
        total_savings = ((total_original - total_optimized) / total_original) * 100
        print(f"Original Total: {Colors.YELLOW}{get_human_size(total_original)}{Colors.RESET}")
        print(f"Optimized Total: {Colors.GREEN}{get_human_size(total_optimized)}{Colors.RESET}")
        print(f"Total Savings: {Colors.GREEN}{total_savings:.1f}%{Colors.RESET}")
        print(f"Space Freed: {Colors.GREEN}{get_human_size(total_original - total_optimized)}{Colors.RESET}")
    
    print(f"\n{Colors.BOLD}Output Location:{Colors.RESET} {output_dir}")
    print(f"\n{Colors.GREEN}✓ Optimization complete!{Colors.RESET}\n")
    
    # Save results to JSON
    results_file = output_dir / "optimization-results.json"
    with open(results_file, 'w') as f:
        json.dump({
            'timestamp': str(Path('/workspaces/portfolio').stat().st_mtime),
            'total_original_bytes': total_original,
            'total_optimized_bytes': total_optimized,
            'total_savings_percent': total_savings if total_original > 0 else 0,
            'files': {k: [(r[0], r[3]) for r in v] for k, v in all_results.items()}
        }, f, indent=2)
    
    print(f"Results saved to: {results_file}\n")

if __name__ == "__main__":
    main()
