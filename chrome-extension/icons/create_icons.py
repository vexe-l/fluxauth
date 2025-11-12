from PIL import Image, ImageDraw, ImageFont

# Create icons in different sizes
sizes = [16, 48, 128]

for size in sizes:
    # Create image with gradient-like background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple lock shape
    if size >= 48:
        # Lock body
        lock_size = int(size * 0.4)
        lock_x = (size - lock_size) // 2
        lock_y = int(size * 0.45)
        draw.rectangle([lock_x, lock_y, lock_x + lock_size, lock_y + lock_size], 
                      fill='white', outline='white')
        
        # Lock shackle (arc)
        shackle_size = int(size * 0.25)
        shackle_x = (size - shackle_size) // 2
        shackle_y = int(size * 0.25)
        draw.arc([shackle_x, shackle_y, shackle_x + shackle_size, shackle_y + shackle_size], 
                0, 180, fill='white', width=int(size * 0.08))
    else:
        # For 16x16, just draw a simple white circle
        center = size // 2
        radius = size // 3
        draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                    fill='white')
    
    # Save
    img.save(f'/Users/anirudh/Vexel/Vexel FluxAuth/chrome-extension/icons/icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created!')
