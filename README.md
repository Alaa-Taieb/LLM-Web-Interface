# React Chat Application with Groq API Integration

This project is a React-based chat application that integrates with the Groq API to provide intelligent responses. It features a user-friendly interface for sending messages and displaying chat history.

## Features

- Real-time chat interface
- Integration with Groq API for intelligent responses
- Markdown support for message rendering
- Syntax highlighting for code snippets
- Dynamic textarea sizing based on input length
- Responsive design

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/react-chat-app.git
   ```
2. Navigate to the project directory:
   ```
   cd react-chat-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your Groq API key (refer to the Groq documentation for details on obtaining an API key).

## Usage

1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` (or the port specified in your configuration).

3. Start chatting! Type your message in the input field and press Enter or click the send button to receive a response.

## Project Structure

- `ChatApp.jsx`: Main component that manages the chat application state and renders child components.
- `ChatHistory.jsx`: Displays the chat history.
- `ChatInput.jsx`: Handles user input for sending messages.
- `Message.jsx`: Renders individual messages with Markdown and code syntax highlighting.
- `HandleMessages.js`: Custom hook for managing chat messages and interaction with the Groq API.

## Dependencies

- React
- Groq SDK
- Showdown (for Markdown conversion)
- Prism (for code syntax highlighting)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Groq for providing the API used in this project
- The React team for the fantastic framework