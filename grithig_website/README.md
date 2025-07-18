# Y Grithig Website

Welcome to your new website! This README contains everything you need to know about managing and updating your Y Grithig holiday home website.

## Quick Start

To update your website:

1. **Edit the content files** (markdown files in the `pages/` folder)
2. **Run the build command**: `python3 build.py`
3. **Upload the `build/` folder** to your web hosting service

That's it! Your website will be updated.

## Website Structure

```
grithig_website/
├── build.py                 # The build script (generates your website)
├── requirements.txt         # Python dependencies
├── pages/                   # Your website content (EDIT THESE)
│   ├── welcome.md
│   ├── hiking_running.md
│   ├── house_details.md
│   ├── local_sightseeing.md
│   ├── gallery.md
│   ├── local_wildlife.md
│   ├── reviews.md
│   ├── contact.md
│   └── template.md
├── gpx/                     # GPS hiking tracks
│   ├── tracks.yml           # Track information (EDIT THIS)
│   └── *.gpx files
├── images/                  # Gallery photos
│   ├── images.yml           # Photo information (EDIT THIS)
│   └── *.jpg files
├── static/                  # Website styling (don't edit unless necessary)
├── templates/               # Website layout (don't edit unless necessary)
└── build/                   # Generated website (upload this to your host)
```

## Editing Your Website Content

### Page Content

All your page content is stored in the `pages/` folder as markdown files. Each file represents one page on your website.

#### Basic Page Structure

Every page file starts with some settings at the top:

```markdown
---
title: Your Page Title
show_page: true
---

# Your Page Content

Write your content here using markdown formatting.
```

**Important Settings:**
- `title`: The name that appears in the navigation menu
- `show_page: true`: Makes the page visible (set to `false` to hide)

#### Editing Pages

1. **Open any `.md` file** in the `pages/` folder
2. **Edit the content** using simple markdown formatting
3. **Save the file**
4. **Run `python3 build.py`** to update your website

#### Markdown Formatting Basics

```markdown
# Main Heading
## Sub Heading
### Smaller Heading

**Bold text**
*Italic text*

- Bullet point 1
- Bullet point 2

1. Numbered list item 1
2. Numbered list item 2

[Link text](https://example.com)
```

### Adding Hiking/Running Routes

To add new GPS routes to your hiking page:

1. **Add your GPX file** to the `gpx/` folder
2. **Edit `gpx/tracks.yml`** and add details about your route:

```yaml
tracks:
  - filename: "your_new_route.gpx"
    name: "Route Name"
    type: "hiking"              # or "running"
    distance: "5.2 km"          # optional
    elevation_gain: "300m"      # optional
    description: "Description of the route and what makes it special"
```

### Adding Gallery Photos

To add new photos to your gallery:

1. **Add your image files** to the `images/` folder
   - Supported formats: JPG, PNG, GIF, WebP
   - Recommended size: 1200px wide maximum

2. **Edit `images/images.yml`** and add details about your photos:

```yaml
images:
  - filename: "new_photo.jpg"
    caption: "Description of what's in the photo"
    alt: "Alternative text for accessibility"
```

## Building Your Website

### Prerequisites

Make sure you have Python 3 installed on your computer. You can check by running:

```bash
python3 --version
```

### First-Time Setup

1. **Install the required Python packages** (only needed once):
   ```bash
   cd grithig_website
   pip3 install -r requirements.txt
   ```

### Building the Website

Every time you make changes, run this command from the `grithig_website` folder:

```bash
python3 build.py
```

You should see output like:
```
Building Y Grithig website...
1. Cleaning build directory...
2. Copying static files...
3. Copying GPX files...
4. Copying images...
5. Building pages...
✅ Website built successfully in /path/to/build
```

## Publishing Your Website

After running the build script, you'll have a complete website in the `build/` folder. To make it live:

1. **Upload the entire `build/` folder** to your web hosting service
2. **Make sure `index.html` is in the root** of your website
3. **Test the website** by visiting your domain

### Popular Hosting Options

- **GitHub Pages**: Free hosting for static websites
- **Netlify**: Free with easy deployment
- **Traditional Web Hosting**: Upload via FTP/cPanel

## Managing Content

### Hiding Pages

To hide a page from the navigation menu, edit the page file and change:

```markdown
---
title: Page Title
show_page: false    # This hides the page
---
```

### Creating New Pages

1. **Copy `template.md`** and rename it (e.g., `new_page.md`)
2. **Edit the title and content**
3. **Set `show_page: true`** to make it visible
4. **Run the build script**

### Updating Contact Details

Edit `pages/contact.md` and replace the placeholder information with your real details:

- Email addresses
- Phone numbers
- Property address
- GPS coordinates

### Adding Reviews

Edit `pages/reviews.md` and add new guest reviews following the existing format.

## Troubleshooting

### Build Script Errors

If you see errors when running `python3 build.py`:

1. **Check that all YAML files are properly formatted** (indentation matters!)
2. **Make sure all referenced image/GPX files exist**
3. **Check that Python dependencies are installed**: `pip3 install -r requirements.txt`

### Missing Images

If images don't appear on your website:

1. **Check that image files are in the `images/` folder**
2. **Verify the filename in `images/images.yml` matches exactly**
3. **Make sure the file extension is included** (e.g., `.jpg`)

### GPX Routes Not Showing

If hiking routes don't appear on the map:

1. **Check that GPX files are in the `gpx/` folder**
2. **Verify the filename in `gpx/tracks.yml` matches exactly**
3. **Ensure your GPX file contains track data** (not just waypoints)

## Tips for Success

### Content Writing
- **Write for your guests**: What would they want to know?
- **Use clear, welcoming language**
- **Include practical information** (distances, times, contact details)
- **Add personal touches** that make your property special

### Photos
- **Use natural lighting** when possible
- **Show different angles** of rooms and views
- **Include seasonal variety**
- **Keep file sizes reasonable** (under 2MB each)

### GPS Tracks
- **Test your routes** before adding them
- **Include difficulty levels** in descriptions
- **Provide safety information**
- **Add estimated times**

## Getting Help

If you need assistance:

1. **Check this README** for common solutions
2. **Review the example content** to see the correct format
3. **Start small**: Make one change at a time and test it
4. **Keep backups**: Save copies of your content before making major changes

## File Backup

**Important**: Always keep backups of your content!

- **Your content**: Everything in `pages/`, `gpx/`, and `images/` folders
- **Settings**: The `.yml` files in `gpx/` and `images/` folders

The `build/` folder can always be regenerated, so you don't need to back that up.

---

**Remember**: After making any changes, always run `python3 build.py` to update your website, then upload the `build/` folder to your hosting service.

Enjoy managing your Y Grithig website! 🏡✨ 