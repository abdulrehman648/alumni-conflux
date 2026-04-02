# Poppins Font Setup Guide

## Overview
The Alumni Conflux authentication redesign uses the **Poppins** font family throughout. The app is configured to load Poppins fonts from the `assets/fonts/` directory.

## Required Font Files

Download the following font files from [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins) and place them in the `assets/fonts/` directory:

### Font Variants Needed:
1. **Poppins-Regular.ttf** (Weight: 400)
2. **Poppins-Medium.ttf** (Weight: 500)
3. **Poppins-SemiBold.ttf** (Weight: 600)
4. **Poppins-Bold.ttf** (Weight: 700)

## Installation Steps

### Option 1: Manual Download (Recommended)

1. Go to [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
2. Click "Download family" button (top right)
3. Extract the downloaded ZIP file
4. Navigate to the `/static/` or `/download/` folder
5. Copy these files to your project's `/assets/fonts/` directory:
   - `Poppins-Regular.ttf`
   - `Poppins-Medium.ttf`
   - `Poppins-SemiBold.ttf`
   - `Poppins-Bold.ttf`

### Option 2: Using Command Line (Alternative)

If you have curl or wget installed, you can download directly:

```bash
cd assets/fonts/

# Download each font variant
curl -o Poppins-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf"
curl -o Poppins-Medium.ttf "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Medium.ttf"
curl -o Poppins-SemiBold.ttf "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf"
curl -o Poppins-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf"
```

## Verification

After adding the font files, verify the structure:

```
assets/
├── fonts/
│   ├── Poppins-Regular.ttf
│   ├── Poppins-Medium.ttf
│   ├── Poppins-SemiBold.ttf
│   └── Poppins-Bold.ttf
├── illustrations/
│   └── select-role.png
└── images/
```

## Testing

1. Run the app: `npx expo start`
2. Check the authentication screens:
   - Role Selection (`/role`)
   - Login (`/login`)
   - Sign Up (`/signup`)
3. Verify that text appears in Poppins font (distinctive rounded letterforms)

## How It Works

The app uses `expo-font` to load the fonts on app startup:

- **File**: `/app/_layout.tsx`
- **Method**: `useFonts()` hook from `expo-font`
- **Fallback**: If fonts fail to load, the components will use platform default fonts

## Font Usage in Components

The components reference fonts from `/constants/theme.ts`:

```typescript
export const FontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};
```

Used in components like:
- `RoundedButton.tsx` - Button text (SemiBold)
- `AuthInput.tsx` - Input labels and text (Regular/Medium)
- `AuthCard.tsx` - Card containers
- `AuthHeader.tsx` - Page titles and subtitles (Bold)

## Troubleshooting

### Fonts Not Displaying Correctly
- Ensure all 4 font files are in `/assets/fonts/` directory
- Check that file names match exactly (case-sensitive on Linux/Mac)
- Rebuild the app: `npx expo start --clear`

### App Shows Default Fonts
- Check browser console or device logs for font loading errors
- Verify font files exist and are valid TTF files
- Try clearing cache: `npx expo start --clear`

### Font File Not Found Error
- Ensure the path in `_layout.tsx` matches your font file location
- Update `require()` paths if you move the fonts directory

## Font Information

**Poppins Font Family**
- Designer: Niranthan Qiara
- License: Open Font License (OFL)
- Category: Geometric Sans-serif
- Source: [Google Fonts](https://fonts.google.com/specimen/Poppins)

**Why Poppins?**
- Modern, friendly, and geometric design
- Excellent readability at all sizes
- Professional appearance suitable for educational platform
- Consistent with contemporary mobile app design trends
- Good support across all platforms (iOS, Android, Web)

## Related Files

- `/constants/theme.ts` - Font configuration and design tokens
- `/app/_layout.tsx` - Font loading logic
- `/src/components/RoundedButton.tsx` - Example component using Poppins
- `/src/components/AuthInput.tsx` - Example component using Poppins
- `/src/components/AuthHeader.tsx` - Example component using Poppins

## Next Steps

Once fonts are set up:
1. Test all authentication screens
2. Verify font rendering on iOS and Android
3. Test on different device sizes
4. Proceed to Phase 2: Main screen redesign (if applicable)
