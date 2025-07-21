#!/usr/bin/env python3
"""
Y Grithig Website Builder
Static site generator for the family AirBnB website
"""

import os
import shutil
import yaml
import markdown
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import xml.etree.ElementTree as ET
import gpxpy
from datetime import datetime

class WebsiteBuilder:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.pages_dir = self.base_dir / 'pages'
        self.templates_dir = self.base_dir / 'templates'
        self.static_dir = self.base_dir / 'static'
        # Output goes directly to the repository-root "docs" folder so GitHub Pages can serve it.
        self.build_dir = self.base_dir.parent / 'docs'
        self.gpx_dir = self.base_dir / 'gpx'
        self.images_dir = self.base_dir / 'images'
        
        # Initialize Jinja2 environment
        self.env = Environment(loader=FileSystemLoader(self.templates_dir))
        
        # Initialize Markdown processor
        self.md = markdown.Markdown(extensions=['meta', 'tables', 'fenced_code'])
    
    def clean_build_dir(self):
        """Clean and recreate the build (docs) directory; remove legacy grithig_website/build if present."""
        # Remove old build directory inside the package, if it exists
        legacy_build = self.base_dir / 'build'
        if legacy_build.exists():
            shutil.rmtree(legacy_build)

        # Remove and recreate the docs directory (self.build_dir)
        if self.build_dir.exists():
            shutil.rmtree(self.build_dir)
        self.build_dir.mkdir(parents=True, exist_ok=True)
    
    def copy_static_files(self):
        """Copy static files (CSS, JS, images) to build directory"""
        if self.static_dir.exists():
            shutil.copytree(self.static_dir, self.build_dir / 'static')
    
    def copy_gpx_files(self):
        """Copy GPX files to build directory"""
        if self.gpx_dir.exists():
            build_gpx_dir = self.build_dir / 'gpx'
            build_gpx_dir.mkdir(exist_ok=True)
            for gpx_file in self.gpx_dir.glob('*.gpx'):
                shutil.copy2(gpx_file, build_gpx_dir)
    
    def copy_images(self):
        """Copy image files to build directory"""
        if self.images_dir.exists():
            build_images_dir = self.build_dir / 'images'
            build_images_dir.mkdir(exist_ok=True)
            for img_file in self.images_dir.iterdir():
                if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    shutil.copy2(img_file, build_images_dir)
    
    def load_track_metadata(self):
        """Load GPX track metadata from tracks.yml"""
        tracks_file = self.gpx_dir / 'tracks.yml'
        if tracks_file.exists():
            with open(tracks_file, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {'tracks': []}
    
    def load_image_metadata(self):
        """Load image metadata from images.yml"""
        images_file = self.images_dir / 'images.yml'
        if images_file.exists():
            with open(images_file, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {'images': []}
    
    def parse_gpx(self, gpx_file):
        """Parse GPX file to extract basic information"""
        try:
            tree = ET.parse(gpx_file)
            root = tree.getroot()
            
            # Handle namespace
            ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
            
            # Extract metadata
            metadata = {}
            
            # Try to get name from metadata
            name_elem = root.find('.//gpx:metadata/gpx:name', ns) or root.find('.//gpx:name', ns)
            if name_elem is not None:
                metadata['name'] = name_elem.text
            
            # Get bounds for center calculation
            bounds_elem = root.find('.//gpx:metadata/gpx:bounds', ns)
            if bounds_elem is not None:
                minlat = float(bounds_elem.get('minlat'))
                maxlat = float(bounds_elem.get('maxlat'))
                minlon = float(bounds_elem.get('minlon'))
                maxlon = float(bounds_elem.get('maxlon'))
                
                metadata['center_lat'] = (minlat + maxlat) / 2
                metadata['center_lon'] = (minlon + maxlon) / 2
            
            return metadata
        except Exception as e:
            print(f"Error parsing GPX file {gpx_file}: {e}")
            return {}

    def update_track_metadata(self):
        """Compute distance/ascents for each GPX and update tracks.yml before the rest of the build."""
        try:
            tracks_file = self.gpx_dir / 'tracks.yml'

            # Load any existing YAML so we preserve descriptions or custom fields
            existing = {}
            if tracks_file.exists():
                with open(tracks_file, 'r', encoding='utf-8') as f:
                    data = yaml.safe_load(f) or {}
                    for tr in data.get('tracks', []):
                        existing[tr['filename']] = tr

            updated_tracks = []

            for gpx_path in self.gpx_dir.glob('*.gpx'):
                filename = gpx_path.name

                # Parse GPX with gpxpy
                with open(gpx_path, 'r', encoding='utf-8') as f:
                    gpx = gpxpy.parse(f)

                distance_m = 0
                elevation_gain = 0
                for trk in gpx.tracks:
                    for seg in trk.segments:
                        # Distance – prefer 3-D if available
                        distance_m += seg.length_3d() or seg.length_2d() or 0

                        # Cumulative ascent
                        pts = seg.points
                        for i in range(1, len(pts)):
                            if pts[i].elevation is not None and pts[i-1].elevation is not None:
                                diff = pts[i].elevation - pts[i-1].elevation
                                if diff > 0:
                                    elevation_gain += diff

                distance_km = round(distance_m / 1000, 2)
                elevation_gain = round(elevation_gain)
                # If elevation gain is zero, leave the field blank so it is not displayed in the UI
                elevation_gain_str = "" if elevation_gain == 0 else f"{elevation_gain}m"

                # Prefer name from GPX metadata, then existing YAML, else filename
                name = gpx.name or existing.get(filename, {}).get('name') or filename.replace('_', ' ').title()

                track_entry = existing.get(filename, {}).copy()
                track_entry.update({
                    'filename': filename,
                    'name': name,
                    'type': track_entry.get('type', 'hiking'),
                    'distance': f"{distance_km} km",
                    'elevation_gain': elevation_gain_str,
                    'description': track_entry.get('description', '')
                })

                updated_tracks.append(track_entry)

            # Keep deterministic order (by name)
            updated_tracks.sort(key=lambda t: t['name'])

            with open(tracks_file, 'w', encoding='utf-8') as f:
                yaml.safe_dump({'tracks': updated_tracks}, f, sort_keys=False, allow_unicode=True)
        except Exception as e:
            print(f"⚠️  Could not update track metadata: {e}")
    
    def get_pages(self):
        """Get all markdown pages with their metadata"""
        pages = []
        
        for md_file in self.pages_dir.glob('*.md'):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse markdown and metadata
            html_content = self.md.convert(content)
            metadata = self.md.Meta
            
            # Reset markdown processor for next file
            self.md.reset()
            
            # Extract show_page setting (default to True)
            show_page = True
            if 'show_page' in metadata:
                show_page = str(metadata['show_page'][0]).lower() == 'true'
            
            # Skip hidden pages
            if not show_page:
                continue
            
            # Get page title (from metadata or filename)
            title = metadata.get('title', [md_file.stem.replace('_', ' ').title()])[0]
            
            pages.append({
                'filename': md_file.stem,
                'title': title,
                'content': html_content,
                'metadata': metadata
            })
        
        return pages
    
    def build_pages(self):
        """Build all pages"""
        pages = self.get_pages()
        
        # Load additional data for special pages
        track_data = self.load_track_metadata()
        image_data = self.load_image_metadata()
        
        # Load templates
        page_template = self.env.get_template('page.html')
        
        for page in pages:
            # Prepare context for template
            context = {
                'page': page,
                'pages': pages,
                'site_title': 'Y Grithig',
                'build_date': datetime.now().strftime('%Y-%m-%d %H:%M')
            }
            
            # Add special data for specific pages
            if page['filename'] == 'hiking_running':
                context['tracks'] = track_data.get('tracks', [])
                # Parse GPX files for additional data
                for track in context['tracks']:
                    gpx_path = self.gpx_dir / track['filename']
                    if gpx_path.exists():
                        gpx_data = self.parse_gpx(gpx_path)
                        track.update(gpx_data)
            
            elif page['filename'] == 'gallery':
                context['images'] = image_data.get('images', [])
            
            # Render page
            html = page_template.render(context)
            
            # Write to build directory
            output_file = self.build_dir / f"{page['filename']}.html"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html)
        
        # Create index.html (redirect to first page or welcome)
        first_page = pages[0] if pages else None
        welcome_page = next((p for p in pages if p['filename'] == 'welcome'), first_page)
        
        if welcome_page:
            index_template = self.env.get_template('index.html')
            index_html = index_template.render({
                'redirect_to': f"{welcome_page['filename']}.html",
                'site_title': 'Y Grithig'
            })
            
            with open(self.build_dir / 'index.html', 'w', encoding='utf-8') as f:
                f.write(index_html)
    
    def build(self):
        """Build the complete website"""
        print("Building Y Grithig website...")
        print("0. Updating GPX track metadata...")
        self.update_track_metadata()
        
        print("1. Cleaning build directory...")
        self.clean_build_dir()
        
        print("2. Copying static files...")
        self.copy_static_files()
        
        print("3. Copying GPX files...")
        self.copy_gpx_files()
        
        print("4. Copying images...")
        self.copy_images()
        
        print("5. Building pages...")
        self.build_pages()
        
        print(f"✅ Website built successfully in {self.build_dir}")
        print(f"Open {self.build_dir}/index.html in your browser to view the site")

if __name__ == '__main__':
    builder = WebsiteBuilder()
    builder.build() 