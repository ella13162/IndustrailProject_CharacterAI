# AI Character Chat Application

A sophisticated React application that enables users to engage in conversations with AI-powered characters including Elon Musk, Taylor Swift, Joe Biden, and a general AI assistant. The application uses OpenAI's GPT model for generating responses and Firebase for authentication and data persistence.

## Features

- **Multiple AI Characters**: Chat with different AI personalities, each with unique traits and expertise
- **Real-time Chat**: Instant message updates using Firebase real-time database
- **Authentication**: Secure user authentication system
- **Chat History**: Preserved chat sessions organized by date
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar
- **Character Switching**: Seamlessly switch between different AI characters
- **Smart Chat Titles**: Automatically generated titles based on conversation context
- **User Statistics**: Track chat sessions and message counts

## Prerequisites

Before running the application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- OpenAI API key

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd industrial-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── routing/       # Routing components
│   └── shared/        # Shared components
├── config/            # Configuration files
├── contexts/          # React contexts
├── pages/             # Application pages
│   ├── protected/     # Authentication required pages
│   └── public/        # Public pages
└── styles/            # Global styles and themes
```

## Available Characters

1. **Elon Musk**
   - Focus on technology, space exploration, and innovation
   - Direct and sometimes provocative communication style

2. **Taylor Swift**
   - Focus on music, creativity, and artistic expression
   - Warm and engaging personality

3. **Joe Biden**
   - Focus on American values, policy, and governance
   - Characteristic speaking style with emphasis on unity

4. **AI Assistant**
   - General purpose helpful AI
   - Professional and informative responses

## Features in Detail

### Authentication
- Protected routes requiring user authentication
- Secure Firebase authentication system

### Chat System
- Real-time message updates
- Message history preservation
- Automatic chat title generation
- Character-specific conversation contexts

### User Interface
- Responsive design for all devices
- Collapsible sidebar for chat history
- Easy character switching
- Message timestamps and organization

### Data Management
- Firebase Firestore for data persistence
- User statistics tracking
- Chat session management
- Character interaction history

## Technologies Used

- React
- TypeScript
- Firebase (Authentication & Firestore)
- OpenAI API
- Styled Components
- React Router
- date-fns

## Development

To run the project in development mode:

```bash
npm start
```

To build for production:

```bash
npm run build
```

## Firebase Configuration

The application requires a Firebase project with:
- Authentication enabled
- Firestore database
- Appropriate security rules

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
