# I RUN JHB - Premium South African Streetwear Website

A modern, responsive e-commerce website for I RUN JHB, celebrating Johannesburg's hustle culture and African heritage through premium streetwear.

## 🚀 Features

### ✨ User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Fast Loading**: Critical CSS, lazy loading, and performance optimization
- **Accessibility**: WCAG 2.1 compliant with screen reader support
- **SEO Optimized**: Meta tags, structured data, and social media integration

### 🛒 E-commerce Functionality
- **Shopping Cart**: Add, remove, and modify items with size selection
- **Wishlist**: Save favorite items for later
- **Product Filtering**: Filter by collection, price, and category
- **Secure Checkout**: Input validation and error handling
- **Order Tracking**: Track order status and history

### 🔒 Security & Performance
- **XSS Protection**: Input sanitization and validation
- **Error Handling**: Comprehensive error management system
- **Performance Monitoring**: Real-time performance tracking
- **Image Optimization**: WebP support and lazy loading

## 📁 Project Structure

```
I RUN JHB/
├── assets/                 # Static assets
│   ├── img/               # Product and hero images
│   ├── logo/              # Brand logos
│   └── video/             # Background videos
├── backend/               # Server-side code
├── css/                   # Stylesheets
│   └── critical.css       # Critical above-the-fold CSS
├── js/                    # JavaScript modules
│   ├── security.js        # Security utilities
│   ├── error-handler.js   # Error handling system
│   ├── performance.js     # Performance optimization
│   ├── cart.js           # Shopping cart functionality
│   ├── products.js       # Product management
│   ├── wishlist.js       # Wishlist functionality
│   └── forms.js          # Form validation
├── *.html                # Main pages
├── *.css                 # Page-specific styles
├── robots.txt            # SEO crawler instructions
├── sitemap.xml           # Site structure for search engines
└── favicon.ico           # Website icon
```

## 🛠 Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (Apache, Nginx, or development server)
- Text editor or IDE

### Local Development
1. **Clone or download** the project files
2. **Install a local web server**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open browser** and navigate to `http://localhost:8000`

### Production Deployment
1. **Upload files** to your web server
2. **Configure SSL certificate** for HTTPS
3. **Update configuration**:
   - Replace demo credentials in `checkout.js`
   - Add real Google Analytics ID in `js/main.js`
   - Generate and replace `favicon.ico`
   - Update domain in `robots.txt` and `sitemap.xml`
4. **Set server headers** (see DEPLOYMENT_CHECKLIST.md)
5. **Test thoroughly** using the deployment checklist

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production settings:
```env
DOMAIN=https://www.irunjhb.com
GA_TRACKING_ID=G-XXXXXXXXXX
PAYMENT_API_KEY=your_production_key
EMAIL_SERVICE_KEY=your_email_key
```

### Payment Integration
Update payment credentials in `checkout.js`:
```javascript
// Replace demo values with production credentials
const YOCO_PUBLIC_KEY = 'pk_live_your_key_here';
const PAYFAST_MERCHANT_ID = 'your_merchant_id';
```

### Analytics Setup
Add your Google Analytics tracking ID in `js/main.js`:
```javascript
gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 ID
```

## 🎨 Customization

### Brand Colors
Update CSS variables in `styles.css`:
```css
:root {
    --primary-black: #1a1a1a;
    --gold-accent: #d4af37;
    --warm-white: #fafafa;
    /* Add your brand colors */
}
```

### Product Data
Update product information in `js/products.js`:
```javascript
const products = [
    {
        id: 'product-id',
        name: 'Product Name',
        price: 999,
        image: 'path/to/image.jpg',
        // Add product details
    }
];
```

### Content Management
- **Images**: Replace files in `assets/img/` and `images/`
- **Text**: Update HTML files with your content
- **Styling**: Modify CSS files for design changes

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works on all devices
- [ ] Cart functionality (add, remove, update)
- [ ] Wishlist functionality
- [ ] Form submissions
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Performance Testing
```bash
# Using Lighthouse CLI
npm install -g lighthouse
lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html

# Check Core Web Vitals
# - Largest Contentful Paint (LCP): < 2.5s
# - First Input Delay (FID): < 100ms
# - Cumulative Layout Shift (CLS): < 0.1
```

### Accessibility Testing
- Use screen reader (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Check color contrast ratios
- Validate HTML markup

## 📊 Monitoring & Analytics

### Performance Monitoring
The website includes built-in performance monitoring:
- Page load times
- Core Web Vitals
- Error tracking
- User interaction metrics

### Error Logging
Errors are automatically logged and can be sent to external services:
```javascript
// Configure error reporting in js/error-handler.js
const errorService = {
    endpoint: 'https://your-error-service.com/api/errors',
    apiKey: 'your-api-key'
};
```

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Check uptime, review error logs
- **Monthly**: Update dependencies, security review
- **Quarterly**: Performance audit, SEO analysis

### Updates
1. **Backup** current files
2. **Test changes** in staging environment
3. **Deploy** to production
4. **Verify** functionality post-deployment

### Security
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular security audits
- Backup data regularly

## 🆘 Troubleshooting

### Common Issues

**Images not loading**
- Check file paths and permissions
- Verify image formats are supported
- Check server configuration

**JavaScript errors**
- Check browser console for errors
- Verify all script files are loaded
- Check for syntax errors

**Performance issues**
- Optimize images (compress, convert to WebP)
- Minify CSS and JavaScript
- Enable server compression
- Use CDN for static assets

**Mobile display issues**
- Test on actual devices
- Check viewport meta tag
- Verify responsive CSS rules

### Support
For technical support or questions:
- Check the deployment checklist
- Review error logs
- Test in different browsers
- Validate HTML/CSS markup

## 📄 License

This project is proprietary software for I RUN JHB. All rights reserved.

## 🤝 Contributing

This is a private project for I RUN JHB. For modifications or improvements, please contact the development team.

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Compatibility**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)