---
title: Template Page
show_page: false
---

# Template Page

This is a template page for creating new content. This page is hidden from the navigation (show_page: false) but can be copied and modified when you want to create new pages.

## Instructions for Creating New Pages

1. **Copy this file** and give it a new name (e.g., `new_page.md`)
2. **Update the title** in the YAML front matter
3. **Set show_page to true** if you want it to appear in navigation
4. **Replace this content** with your new page content
5. **Run the build script** to generate the updated website

## YAML Front Matter Options

```yaml
---
title: "Your Page Title"          # Required: appears in navigation and page header
show_page: true                   # Required: true to show in nav, false to hide
---
```

## Markdown Formatting Examples

### Headers
Use # for main headings, ## for subheadings, etc.

### Text Formatting
- **Bold text** using **double asterisks**
- *Italic text* using *single asterisks*
- `Code text` using `backticks`

### Lists
#### Unordered Lists:
- Item 1
- Item 2
- Item 3

#### Ordered Lists:
1. First item
2. Second item
3. Third item

### Links
[Link text](https://example.com)

### Images
![Alt text](images/your-image.jpg)

### Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|

### Blockquotes
> This is a blockquote
> It can span multiple lines

### Code Blocks
```
This is a code block
Multiple lines of code
```

## Special Pages

### Gallery Page
If creating a gallery-style page, remember to:
1. Add images to the `images/` folder
2. Update `images/images.yml` with image metadata

### Hiking/Maps Page
If creating a page with GPX tracks:
1. Add GPX files to the `gpx/` folder  
2. Update `gpx/tracks.yml` with track metadata

## Tips for Good Content

- **Keep sentences clear and concise**
- **Use headings to structure your content**
- **Include relevant links to external resources**
- **Add images to break up long text sections**
- **Consider your audience** (potential guests)
- **Proofread before publishing**

Remember to run `python3 build.py` after making changes to regenerate the website! 