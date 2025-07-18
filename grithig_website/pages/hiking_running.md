---
title: Hiking and Running
show_page: true
---

# Hiking and Running Trails

The area around Y Grithig offers some of the most spectacular hiking and trail running opportunities in Wales. From gentle valley walks to challenging mountain ascents, there's something for every level of outdoor enthusiast.

## Our Favorite Routes

We've carefully selected and mapped our favorite local routes to share with you. Each trail has been personally tested by our family and offers its own unique rewards - whether it's a hidden waterfall, panoramic views, or peaceful woodland paths.

The routes below are displayed on an interactive map where you can:
- **Hover** over any route to see details about distance, elevation, and difficulty
- **Click** the download button to get the GPX file for your GPS device or smartphone
- **Explore** the surrounding area to plan your adventure

## Trail Information

All routes start and end at accessible locations with parking available. We've included estimated times for moderate pace hiking, but feel free to take your time and enjoy the scenery!

**Safety Note**: Weather in the Welsh hills can change quickly. Please check local conditions, carry appropriate gear, and let someone know your planned route before setting out.

---

## GPX File Format Instructions

**For parents updating this page:**

To add new trails to this page, follow these steps:

1. **Add your GPX file** to the `gpx/` folder
2. **Update the `gpx/tracks.yml` file** with the new route details

### tracks.yml Format:
```yaml
tracks:
  - filename: "your_route.gpx"
    name: "Route Name"
    type: "hiking"          # or "running"
    distance: "5.2 km"      # optional
    elevation_gain: "300m"  # optional
    description: "Brief description of the route and highlights"
```

### GPX File Requirements:
- Files should be saved with `.gpx` extension
- The GPX should contain track data (not just waypoints)
- Name your files descriptively (e.g., `henrhyd_falls_circular.gpx`)

### Example Entry:
Based on the sample GPX file, here's how it should appear in tracks.yml:
```yaml
- filename: "y_grithig_to_henrhyd_waterfalls.gpx"
  name: "Henrhyd Falls from Y Grithig"
  type: "hiking"
  distance: "8.2 km"
  elevation_gain: "409m"
  description: "Beautiful waterfall hike through ancient woodland"
``` 