# This is Luca Gandolfi 🚀

A modern, futuristic personal portfolio website built with vanilla HTML, CSS, and JavaScript. Features stunning animations, responsive design, and a clean interface to showcase your professional profile, projects, and social links.

![Portfolio Preview](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Futuristic Design**: Cyberpunk-inspired aesthetic with cyan and white color scheme
- **Animated Background**: Dynamic particle system creating an immersive experience
- **Scroll Animations**: Smooth fade-in effects as you scroll through sections
- **Rotating Profile Ring**: Eye-catching animated border around profile picture
- **Responsive Layout**: Optimized for all devices (mobile, tablet, desktop)
- **Project Showcase**: Display GitHub projects with image/GIF previews
- **Social Integration**: Quick links to all your social media profiles
- **CV Download**: Direct link to download or view your resume
- **Zero Dependencies**: Pure vanilla JavaScript - no frameworks required
- **Easy Customization**: Simple configuration through JavaScript object and HTML elements

## 📱 Demo Sections

1. **Hero Section**: Animated profile picture with shimmer title effect
2. **Personal Information**: Grid layout for contact details
3. **CV Download**: Prominent button to access your resume
4. **Social Links**: Beautiful grid of social media connections
5. **Project Gallery**: Interactive cards showcasing your GitHub projects

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/this-is-luca-gandolfi.git
cd this-is-luca-gandolfi
```

### 2. Create Assets Folder

Create an `assets` folder in the same directory as `index.html`:

```
project-folder/
├── index.html
└── assets/
    ├── profile.jpg        # Your profile picture
    ├── cv.pdf            # Your resume/CV
    ├── project1.jpg      # Project 1 preview
    ├── project2.gif      # Project 2 preview (can be GIF)
    └── project3.jpg      # Project 3 preview
```

### 3. Customize Your Information

Open `index.html` and modify the following:

#### Personal Information (in HTML section)
```html
<div class="info-value" id="email">your.email@example.com</div>
<div class="info-value" id="phone">+1 234 567 8900</div>
<div class="info-value" id="location">Your City, Country</div>
<div class="info-value" id="specialization">Your Specialization</div>
```

#### Social Links (in HTML section)
```html
<a href="https://github.com/yourusername" target="_blank" class="social-link">
<a href="https://linkedin.com/in/yourprofile" target="_blank" class="social-link">
<a href="https://twitter.com/yourhandle" target="_blank" class="social-link">
<a href="https://instagram.com/yourhandle" target="_blank" class="social-link">
```

#### Projects (in JavaScript section)
```javascript
const projects = [
    {
        title: "Your Project Name",
        description: "Brief description of your project",
        image: "./assets/project1.jpg",
        link: "https://github.com/yourusername/project-repo"
    },
    // Add more projects...
];
```

### 4. Open in Browser

Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## 🎨 Customization Guide

### Colors

The color scheme uses cyan/blue tones. To change colors, modify these CSS variables:

```css
/* Primary cyan: #00d4ff */
/* Secondary blue: #0099ff */
/* Dark background: #0a1628 */
/* Light cyan: #64c8ff */
```

### Animations

All animations can be adjusted in the CSS section:
- `fadeInUp`: Entry animation timing
- `rotate`: Profile ring rotation speed
- `shimmer`: Title shimmer effect
- `float`: Particle movement

### Adding More Social Links

Add new social links in the HTML section:

```html
<a href="YOUR_URL" target="_blank" class="social-link">
    <span>🎵</span>
    <span>Spotify</span>
</a>
```

### Adding More Projects

Simply add more objects to the `projects` array in JavaScript:

```javascript
{
    title: "New Project",
    description: "Project description here",
    image: "./assets/new-project.jpg",
    link: "https://github.com/yourusername/new-project"
}
```

## 📂 File Structure

```
project/
│
├── index.html              # Main HTML file with embedded CSS and JS
│
└── assets/                 # All media files
    ├── profile.jpg         # Profile picture (200x200px recommended)
    ├── cv.pdf             # Resume/CV document
    ├── project1.jpg       # Project preview 1 (400x200px recommended)
    ├── project2.gif       # Project preview 2 (animated GIFs work!)
    └── project3.jpg       # Project preview 3
```

## 🌐 Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select main branch as source
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify

1. Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

### Vercel

```bash
npm i -g vercel
vercel
```

## 🔧 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

The portfolio is fully responsive with:
- Touch-friendly buttons and links
- Optimized font sizes for mobile
- Responsive grid layouts
- Smooth scroll animations

## 🎯 Performance

- **Single File**: Everything in one HTML file for fast loading
- **No External Dependencies**: No frameworks or libraries needed
- **Optimized Animations**: GPU-accelerated CSS animations
- **Lazy Loading**: Images load efficiently with fallbacks
- **Lightweight**: Total size under 50KB (without assets)

## 🐛 Troubleshooting

### Images not loading?
- Check that the `assets` folder is in the same directory as `index.html`
- Verify file names match exactly (case-sensitive)
- Fallback placeholders will display if images are missing

### Animations not working?
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)

### Layout issues on mobile?
- Clear browser cache
- Test in different mobile browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Luca Gandolfi - [Your Email](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/this-is-luca-gandolfi](https://github.com/yourusername/this-is-luca-gandolfi)

---

⭐ **Star this repo if you find it useful!**

Made with 💙 by Luca Gandolfi