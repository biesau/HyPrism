# HyPrism

A multiplatform Hytale launcher with online mode support, auto-updater, game fetcher, and skin creator.

## Features

- 🎮 **Game Management**: Download and launch Hytale with one click
- 🌐 **Online Mode**: Play multiplayer with the integrated online fix (Windows)
- 🔄 **Auto-Updater**: Automatically checks and installs launcher updates
- 🎨 **Skin Creator**: Customize your character's appearance
- 🔧 **Diagnostics**: Built-in system diagnostics tool
- 💻 **Cross-Platform**: Works on Windows, macOS, and Linux

## Architecture

- **Backend**: Go 1.23+ with Wails v2
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Game Patching**: Butler (itch.io) for .pwr file processing
- **Java Runtime**: Adoptium JRE 21 (auto-downloaded)

## Prerequisites

**Note**: The background video asset (`frontend/src/assets/background.mp4`) is not included in the repository due to GitHub's file size limits. The launcher will work without it, or you can add your own background video.

- [Go 1.23+](https://golang.org/dl/)
- [Node.js 18+](https://nodejs.org/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation)

## Development

### Install Wails CLI
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Install Dependencies
```bash
# Frontend dependencies
cd frontend && npm install && cd ..

# Go dependencies
go mod download
```

### Run in Development Mode
```bash
wails dev
```

### Build for Production
```bash
# Build for current platform
wails build

# Build for specific platform
wails build -platform windows/amd64
wails build -platform darwin/arm64
wails build -platform linux/amd64
```

## Project Structure

```
HyPrism/
├── app/                    # Main application logic
│   ├── app.go             # Core App struct and methods
│   ├── config.go          # Configuration management
│   ├── diagnostics.go     # System diagnostics
│   ├── errors.go          # Error handling
│   ├── updater.go         # Update check/download
│   └── util.go            # Utility functions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── wailsjs/           # Wails JS bindings
├── internal/              # Internal packages
│   ├── config/            # Configuration types
│   ├── env/               # Environment variables
│   ├── game/              # Game install/launch
│   ├── java/              # JRE management
│   ├── pwr/               # PWR file handling
│   ├── skin/              # Skin customization
│   └── util/              # Utilities
├── updater/               # Self-updater package
├── main.go                # Application entry point
└── wails.json             # Wails configuration
```

## Skin Creator

The skin creator modifies `AvatarPresets.json` in your game directory. The format follows:
- Simple items: `ID.Color` (e.g., `Almond_Eyes.Blue`)
- Complex items: `ID.Color.Variant` (e.g., `Slickback.Black.SlickbackClean`)

### Available Categories
- Body Characteristics
- Face
- Eyes
- Haircut
- Facial Hair
- Eyebrows
- Undertop
- Overtop
- Pants
- Shoes
- Head Accessory
- Face Accessory
- Gloves
- Cape

## Credits

- Based on [HyLauncher](https://github.com/ArchDevs/HyLauncher) architecture
- Skin customization based on [Reddit guide](https://www.reddit.com/r/PiratedGames/comments/1qcjzid/)

## License

MIT License
