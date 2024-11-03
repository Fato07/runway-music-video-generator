# Runway Music Video Generator

Transform audio tracks into stunning AI-generated visual experiences. This application analyzes music to create synchronized, mood-driven visual scenes using advanced AI technology.

## Core Features

### Audio Analysis
- Precise beat detection and tempo analysis
- Intelligent mood recognition
- Dynamic segment identification with timestamps
- Seamless audio file upload via drag-and-drop

### Visual Generation
- DALL-E 3 powered scene generation
- Mood-adaptive visual theming
- Dynamic transitions based on audio segments
- Artistic styles:
  - Surreal: dreamlike, abstract forms
  - Real-world: life-like, grounded compositions
- Resolution options:
  - Landscape: 1792x1024
  - Square: 1024x1024
  - Portrait: 1024x1792
- Quality settings: Standard/HD

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
Create `.env.local` with required API keys:

OPENAI_API_KEY=your_openai_api_key

3. Launch development server:
```npm run dev```

Access the application at http://localhost:3000


## Development Stack

- Next.js 14
- TypeScript
- OpenAI DALL-E 3 API
- Web Audio API

## Key Components

- `AudioUpload`: Handles audio file processing and analysis
- `audioAnalysisService`: Extracts beats, tempo, mood, and segments
- `imageGeneratorService`: Creates AI-generated scenes with mood-based prompts
- `sceneGeneratorService`: Coordinates scene generation based on audio analysis

## API Integration

The application leverages OpenAI's DALL-E 3 for image generation with:
- Enhanced prompt engineering
- Mood-based visual styling
- Tempo-synchronized scene generation
- Quality and resolution controls

## Contributing

We welcome contributions! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - Feel free to use this project commercially or personally.

