# Prompt for Antigravity: "Kiddie Slides" — A Simplified PowerPoint Clone for 3rd Grade Students

## Project Goal
Build a JavaScript-based web application that visually and functionally mimics Microsoft PowerPoint's core dashboard and editing experience, but is scoped down to only the features a **third-grade student (age 8–9)** would realistically use. The look and layout should feel instantly familiar to anyone who has used PowerPoint, but simplified — fewer menus, bigger buttons, no clutter.

## ⭐ Core Design Principle: Match the Textbook, Not Just "PowerPoint Vibes"
The students learn PowerPoint from a specific printed textbook (a chapter titled "Creating a Presentation," using the "Plan → Make → Impress" framework, with a running example of a "My Role Model" presentation about Dr. APJ Abdul Kalam). **The website's job is to let a student follow that book's steps literally and land on the matching screen/button in the app.** This means visual similarity to PowerPoint isn't enough — the exact wording, tab order, and labels from the textbook must be reproduced. If the book says "click Insert, then Text Box," the app must have a tab literally labeled "Insert" containing a button literally labeled "Text Box," not a reworded equivalent.

Concretely, reproduce from the textbook:
- **Ribbon tabs, in this exact order**: Home, Insert, Design, Transitions, Animations, Slide Show, View (skip File/Review — not taught in the book)
- **Exact on-canvas placeholder text**: "Click to add title," "Click to add subtitle," "Click to add notes"
- **Exact panel labels**, matching the book's own labeled diagram of the PowerPoint window: *Slide and Outline Panel* (left), *Slide Area* (center), *Toolbar* (top, inside ribbon), *Speaker Note* (bottom strip). Consider a first-run "labeled tour" overlay using these exact terms so a student can visually match the book's diagram to the live app.
- **Exact named themes** (Design tab): Waveforms, Facet, Ion Boardroom, Atlas — these 4, styled to loosely resemble the book's swatches (blue wave, green facet, dark boardroom, orange/red blocks)
- **Exact named animations** (Animations tab): None, Appear, Fade, Fly In, Float In (Split, Wipe, Zoom can be a "more" overflow if included)
- **Exact named transitions** (Transitions tab): None, Cut, Fade, Push, Wipe as the core set; Reveal, Random Bars, Shape, Clock as an optional "more transitions" set shown later in the book
- **Exact keyboard shortcuts**, taken directly from the book's table — see dedicated section below
- **SmartArt** (Insert tab) — the book teaches this directly with a worked example (typing "Achievements," choosing Process → Vertical Process, using the Text Pane to enter bullet steps). Include a *simplified* SmartArt tool with 4 types: Process, Cycle, List, Hierarchy — each rendered as connected shapes generated from a simple text list the student types into a "Text Pane" panel, matching the book's exact workflow and terminology.
- **Speaker Notes** — promote this from optional to a real feature. A "Click to add notes" strip below the slide (matching the book's Normal View layout), plus a **Notes Page View** accessible from the View tab, matching the book's screenshot (slide on top, notes box below). Never shown in Present mode — matches the book's own description ("won't be visible to the audience").
- **View tab options**: Normal View and Slide Sorter View are essential (map to your existing canvas + sidebar); Notes Page View should be added given the emphasis above; Outline View and Reading View can be simplified stretch goals since they're lower-value for this age group.
- **"Getting Started" flow** — the book's flow is: right-click desktop → New → PowerPoint Presentation → name the file → open it → see a blank title slide. The web app can't replicate right-click-to-create, but it should replicate the *outcome*: creating a new presentation should immediately prompt "Name your presentation," then open directly onto a slide showing "Click to add title" / "Click to add subtitle," exactly like the book's page 28 screenshot.
- **Info Byte tip** — the book includes a memorable rule of thumb: a good presentation stays within 10 slides, 20 minutes, 30pt+ font size, 40 words per slide. Consider surfacing this as a small friendly tip/badge in the UI (e.g., a gentle warning if a text box gets very wordy), since it reinforces what the textbook is teaching.

## Target Audience
- Third-class (Grade 3) students, ~8–9 years old.
- Low tolerance for complex menus; needs big icons, simple labels, minimal text.
- May be using this on a school desktop, laptop, or tablet — assume mouse/touch, low typing speed.

## Tech Stack
- Plain **HTML, CSS, and JavaScript** (vanilla, no heavy framework) — keep it lightweight and easy to iterate on. If a framework genuinely simplifies state management, React is acceptable, but prefer vanilla JS unless justified.
- No backend required initially — use **browser localStorage** to save/load presentations.
- Must run entirely client-side (no server dependency) so it can be hosted as a static site.

## Overall Layout (mimic PowerPoint's dashboard)
1. **Top Ribbon/Toolbar** — simplified into 3 tabs max:
   - **Home**: New Slide, Delete Slide, Text Box, Font, Font Size, Font Color, Bold/Italic/Underline, Background Color
   - **Insert**: Text Box, Picture, Shapes (rectangle, circle, triangle, star), SmartArt (simplified: Process, Cycle, List, Hierarchy), Stickers/Emoji
   - **Design**: A small set of pre-made slide background themes/colors (5–8 kid-friendly themes)
2. **Left Sidebar** — vertical slide thumbnail panel (like PowerPoint's slide sorter), showing slide previews, with drag-to-reorder, right-click/long-press to duplicate or delete.
3. **Main Canvas** — the active slide, editable directly (click to add text, drag to move/resize elements).
4. **Bottom Bar** — slide number indicator, zoom control (optional), "Present" button (fullscreen slideshow mode).
5. **Top-left**: App name/logo + "New Presentation," "Save," "Open" (from localStorage).

## Features to INCLUDE
- Create/delete/duplicate/reorder slides
- **Pre-made starter layouts** for new slides (not a blank canvas): Title Slide, Title + Picture, Title + Text, Picture Only. Each layout shows placeholder boxes like "Click to add title" / "Click to add picture," similar to real PowerPoint, so kids aren't stuck facing an empty slide.
- Add and edit text boxes (font family from a short curated list, size, color, bold/italic/underline, alignment)
- Insert images (upload from device)
- Insert basic shapes (rectangle, circle, triangle, star) with fill color
- **Insert stickers/emoji** — a simple emoji picker panel, dragged/clicked onto the slide like an image. Cheap to build, high engagement for this age group.
- Change slide background color or pick from preset themes
- Drag, resize, and delete any element on a slide
- Undo/Redo (basic, last ~10 actions)
- Save presentation (see storage notes below); load a saved presentation; rename presentation
- **"My Presentations" home screen** — the app's landing page shows a gallery/grid of all saved presentations (thumbnail of first slide + title + last-edited date), with "Open," "Rename," "Duplicate," and "Delete" per item, plus a "+ New Presentation" button. This is the entry point to the app, not just a single save/load slot.
- **Visible save confirmation** — a small "Saved ✓" indicator (or "Saving..." → "Saved ✓") that appears briefly after autosave fires, so kids trust their work is safe.
- **Speaker Notes** — a "Click to add notes" strip below the slide canvas (matches the book's Normal View exactly), plus a Notes Page View reachable from the View tab (slide thumbnail on top, notes box below, matching the book's page 35 screenshot). Plain text only, never shown in Present mode.
- **Simplified SmartArt** — from the Insert tab, student types a label (e.g., "Achievements"), picks a type (Process, Cycle, List, or Hierarchy), then enters bullet points into a "Text Pane" panel; the app auto-generates connected shapes from that list, matching the book's worked example exactly (Process → Vertical Process, with a Text Pane for entering steps).

## Keyboard Shortcuts (must match the textbook's table exactly)
| Operation | Shortcut |
|---|---|
| New Slide | Ctrl + M |
| Copy | Ctrl + C |
| Paste | Ctrl + V |
| Delete | Delete key |
| Duplicate | Ctrl + D |
| Save | Ctrl + S |
| Present from Beginning | F5 |
| Present from Current Slide | Shift + F5 |
| Exit Present Mode | Esc |
- **Basic print support** — a simple CSS print stylesheet so the browser's native Print dialog (Ctrl/Cmd+P) renders one slide per page cleanly. This covers "show my teacher a printout" without building a PDF export pipeline.
- "Present" mode: fullscreen slideshow with Next/Previous (arrow keys + on-screen buttons), Esc to exit
- Simple slide transition: fade or none (just one or two options, not a whole gallery)
- Autosave every ~30 seconds or on change

## Features to explicitly EXCLUDE (do not build these)
- Macros/VBA, add-ins, scripting
- SmartArt, complex charts/graphs, embedded spreadsheets
- Master slide editing, custom layouts, slide masters
- Advanced animations (motion paths, entrance/exit libraries)
- Video/audio embedding (unless later requested)
- Multi-user collaboration / cloud sync / accounts
- Complex tables, WordArt effects, 3D shapes
- Advanced transition gallery (morph, push, etc.)
- Speaker notes, rehearse timings, slide numbering fields, headers/footers
- Print/export to PDF (can be a stretch goal, not v1)

## UI/UX Guidelines
- Big, clearly labeled buttons with icons (not tiny dropdown-heavy menus)
- Bright, friendly color palette; rounded buttons; generous spacing for easier clicking
- Minimal text — icon + short label combos (e.g., "🖼️ Image", "🔤 Text", "⬛ Shape")
- Tooltips on hover explaining each tool in one short phrase
- No jargon — avoid PowerPoint-native terms like "placeholder," "layout," "ribbon" in the visible UI; use plain words like "Add Text," "Add Picture," "Slide Background"
- Confirmation dialog before deleting a slide ("Are you sure you want to delete this slide?")

## ⚠️ Important Technical Note: Storage & Images
`localStorage` typically caps at ~5–10MB total per origin. If students insert several images as base64-encoded strings, this limit will be hit quickly and can cause **silent save failures** — the app appears to work but stops actually saving. To avoid this:
- **Resize/compress images on upload** (e.g., downscale to a max width like 1000px and re-encode as JPEG/WebP at moderate quality) before storing them.
- Prefer **IndexedDB over localStorage** for storing presentation data (especially image bytes), since IndexedDB has a much higher storage ceiling and is better suited for binary/large data. Use localStorage only for small metadata (like the list of presentation titles/IDs) if needed.
- Always handle storage write failures gracefully with a visible error message ("Couldn't save — try removing a picture or two") rather than failing silently.

## Suggested File Structure
```
/index.html
/css/
  style.css
/js/
  app.js          (app state, slide data model)
  ui.js           (rendering toolbar, sidebar, canvas)
  editor.js       (text/shape/image editing logic)
  slideshow.js    (present mode)
  storage.js      (localStorage save/load)
/assets/
  icons/
  themes/
```

## Data Model (suggested)
Each presentation is a JS object saved to localStorage:
```js
{
  id: "uuid",
  title: "My First Presentation",
  slides: [
    {
      id: "slide-1",
      background: "#ffffff",
      elements: [
        { type: "text", x, y, width, height, content, fontFamily, fontSize, color, bold, italic, underline, align },
        { type: "image", x, y, width, height, src },
        { type: "shape", x, y, width, height, shapeType, fillColor }
      ]
    }
  ]
}
```

## Acceptance Criteria (v1)
- A student can open the app, land on the "My Presentations" home screen, click "+ New Presentation," pick a starter layout for each slide, add 3–5 slides, add text/images/shapes/stickers to each, change backgrounds, reorder slides via the sidebar, and click "Present" to view a fullscreen slideshow.
- The app looks and behaves recognizably like PowerPoint's editor (ribbon + slide panel + canvas), just with far fewer options.
- Everything works offline once loaded; presentations persist across page reloads and are visible on the home screen with correct thumbnails and titles.
- A visible save confirmation appears after edits are autosaved.
- Printing a presentation via the browser's Print dialog produces one clean slide per page.
- **Textbook check**: hand a student the book open to page 29 ("Adding Text") — they should be able to find a tab literally labeled "Insert" and a button literally labeled "Text Box" without any translation. Repeat this check for each major textbook workflow (adding a slide via Ctrl+M, adding a theme via Design, adding SmartArt via Insert, adding an animation via Animations, adding a transition via Transitions, presenting via F5).
- Responsive enough to work on a school laptop screen (1280×720 and up); tablet support is a bonus, not required for v1.

## Stretch Goals (only after v1 is solid)
- Export slides as images (PNG) or a simple PDF
- More themes / seasonal templates for schools
- Simple sound effect on slide transition (toggleable)
- Teacher mode: lock certain elements from being deleted/edited
