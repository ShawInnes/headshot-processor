# Headshot photo processing tool

This tool is to help process full of headshot's that have been taken.

## Features

1. allow the user to select a folder containing the photos
2. once the folder has been selected innumerate all of the JPEG files in that folder and add them to a list to display
   to the user
3. Include the mediator from the EXIF data within the JPEG files
4. Add a feature to rename all of the files based on the meta data within each file
5. There will be a field within the matter data containing the employee name. You need to select all photos pertaining
   to that particular employee and export them as employee_00 one employee_002 etc.
6. The files have been renamed. There needs to be a feature that will look up an API end point based on the employee
   name and obtain the email address
7. Once the email address has been obtained for that employee we need to email them their headshot photos.

## Technology Requirements

1. Use React
2. Use Shad-cn for components
3. Use Electron for cross-platform desktop capability

Based on your requirements, here's a comprehensive task breakdown for building the headshot photo processing tool:

## Project Setup Tasks

### 1. **Project Initialization**

- [x] Set up Electron + React project structure
- [x] Configure TypeScript for type safety
- [x] Install and configure Shadcn/ui component library
- [x] Set up build tools (Vite/Webpack) for Electron
- [x] Configure ESLint and Prettier
- [x] Set up package.json with all required dependencies

### 2. **Core Dependencies**

- [x] Install EXIF data reading library (e.g., `exifr` or `piexifjs`)
- [x] Install file system utilities for cross-platform compatibility
- [x] Install email sending library (e.g., `nodemailer`)
- [x] Install HTTP client for API calls (e.g., `axios`)
- [x] Install path manipulation utilities

## Core Feature Implementation

### 3. **Folder Selection & File Discovery** ✅ COMPLETED

- [x] Create folder selection dialog using Electron's native dialog
- [x] Implement recursive JPEG file enumeration
- [x] Add file validation (check file extensions: .jpg, .jpeg)
- [x] Create file listing component with Shadcn Table
- [x] Add loading states and progress indicators

### 4. **EXIF Data Extraction & Display** ✅ COMPLETED

- [x] Implement EXIF data reader for JPEG files
- [x] Extract metadata including employee name field
- [x] Create metadata display component
- [x] Handle missing or corrupted EXIF data gracefully
- [x] Add metadata validation and error handling

### 5. **Photo Management Interface** ✅ PARTIALLY COMPLETED

- [x] Create photo thumbnail gallery using Shadcn components
- [x] Implement photo preview modal/dialog
- [ ] Add photo selection/deselection functionality
- [x] Create employee grouping view
- [ ] Add search and filter capabilities by employee name

### 6. **File Renaming System**

- [ ] Implement metadata-based file renaming logic
- [ ] Create employee-specific numbering system (employee_001, employee_002, etc.)
- [ ] Add rename preview functionality
- [ ] Implement batch rename operations
- [ ] Add undo/rollback functionality for renames
- [ ] Handle file naming conflicts and duplicates

### 7. **Employee Management**

- [ ] Create employee detection from EXIF metadata
- [ ] Implement photo grouping by employee
- [ ] Create employee selection interface
- [ ] Add manual employee name correction/assignment
- [ ] Export selected employee photos functionality

### 8. **API Integration for Email Lookup**

- [ ] Design API endpoint configuration interface
- [ ] Implement employee name to email address lookup
- [ ] Add API error handling and retry logic
- [ ] Create email validation functionality
- [ ] Add manual email override capability

### 9. **Email Functionality**

- [ ] Configure email service (SMTP settings interface)
- [ ] Implement photo attachment preparation
- [ ] Create email template system
- [ ] Add email preview before sending
- [ ] Implement batch email sending
- [ ] Add email delivery status tracking
- [ ] Handle email sending errors and retries

## User Interface Components

### 10. **Main Application Layout**

- [ ] Create main window layout with navigation
- [ ] Implement responsive design with Shadcn components
- [ ] Add application menu and toolbar
- [ ] Create status bar with progress indicators

### 11. **Settings and Configuration**

- [ ] Create settings panel for API configuration
- [ ] Add email server configuration interface
- [ ] Implement export/import settings functionality
- [ ] Add application preferences (themes, default folders, etc.)

### 12. **Progress and Feedback**

- [ ] Implement progress bars for long operations
- [ ] Add toast notifications using Shadcn Toast
- [ ] Create detailed operation logs
- [ ] Add confirmation dialogs for destructive operations

## Quality Assurance & Polish

### 13. **Error Handling & Validation**

- [ ] Implement comprehensive error handling
- [ ] Add input validation for all forms
- [ ] Create user-friendly error messages
- [ ] Add fallback mechanisms for failed operations

### 14. **Performance Optimization**

- [ ] Implement lazy loading for large photo sets
- [ ] Add photo thumbnail caching
- [ ] Optimize EXIF data reading for large batches
- [ ] Implement background processing for heavy operations

### 15. **Testing**

- [ ] Write unit tests for core functionality
- [ ] Implement integration tests for file operations
- [ ] Add end-to-end testing for main workflows
- [ ] Test cross-platform compatibility (Windows, macOS, Linux)

### 16. **Documentation & Help**

- [ ] Create user manual/help documentation
- [ ] Add tooltips and contextual help
- [ ] Implement onboarding flow for new users
- [ ] Create troubleshooting guide

## Deployment & Distribution

### 17. **Build & Package**

- [ ] Configure Electron builder for all platforms
- [ ] Set up code signing for security
- [ ] Create installer packages
- [ ] Set up auto-updater functionality

### 18. **Final Polish**

- [ ] Add application icons and branding
- [ ] Implement keyboard shortcuts
- [ ] Add drag-and-drop functionality
- [ ] Final UI/UX review and improvements

## Priority Recommendations

## 🎯 CURRENT DEVELOPMENT STATUS

### ✅ STAGE 1-3 COMPLETED:

**Project Foundation:**
- [x] Electron + React + TypeScript project structure
- [x] Vite build configuration optimized for Electron
- [x] Shadcn/ui component library fully integrated
- [x] Tailwind CSS styling system
- [x] ESLint and Prettier configuration

**Core Dependencies Installed:**
- [x] EXIF data reading (`exifr` library)
- [x] File system utilities (Node.js built-in + glob)
- [x] HTTP client (`axios`) ready for API integration
- [x] Email functionality (`nodemailer`) prepared
- [x] Cross-platform path utilities

**Implemented Features:**
1. **Folder Selection & File Discovery** ✅ FULLY COMPLETED
   - Native Electron dialog for folder selection
   - Recursive JPEG enumeration with glob patterns
   - File validation (.jpg, .jpeg extensions)
   - Responsive file listing with Shadcn Table component
   - Real-time loading states and progress indicators

2. **EXIF Data Extraction & Display** ✅ FULLY COMPLETED
   - Comprehensive EXIF metadata reader
   - Multi-field employee name detection (Artist, Copyright, Keywords, etc.)
   - Detailed metadata display with error handling
   - Graceful handling of corrupted/missing EXIF data

3. **Photo Management Interface** ✅ CORE COMPLETED
   - Responsive photo thumbnail gallery
   - Modal photo preview with full metadata
   - Employee grouping and statistics
   - Modern UI with Shadcn components (Cards, Dialogs, Progress bars)

**Technical Architecture:**
- [x] IPC communication between main and renderer processes
- [x] TypeScript definitions for all components and data structures
- [x] Comprehensive error handling and validation
- [x] Progress tracking for batch operations
- [x] Responsive design with mobile-first approach

**Employee Detection System:**
The application intelligently searches for employee names across these EXIF fields:
- Standard fields: Artist, Copyright, ImageDescription, UserComment
- Windows fields: XPSubject, XPComment, XPAuthor, XPKeywords
- IPTC fields: Keywords, Subject, PersonInImage, RegionPersonDisplayName
- XMP metadata fields for comprehensive coverage

### 🚀 NEXT PRIORITY PHASES:
**Phase 1 (Current Focus):**
- Task 6: File Renaming System implementation
- Task 7: Advanced Employee Management features
- Enhanced photo selection/deselection functionality

**Phase 2 (Core Features):**
- Task 8: API Integration for Email Lookup
- Task 9: Email Functionality with SMTP configuration
- Advanced search and filtering capabilities

**Phase 3 (Polish & Deploy):**
- Tasks 10-18: UI improvements, testing, and deployment preparation

## Setup Instructions
### Installing Tailwind with Vite

Install Tailwind CSS

Install tailwindcss and @tailwindcss/vite via npm.

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the @tailwindcss/vite plugin to your Vite configuration.

vite.config.ts
```typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
plugins: [
tailwindcss(),
],
})
```

Import Tailwind CSS

Add an @import to your CSS file that imports Tailwind CSS.

```css
@import "tailwindcss";
```