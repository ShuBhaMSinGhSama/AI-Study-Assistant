import { useState, useRef, useEffect } from 'react'
import './Chat.css'

const mockMessages = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! I'm your AI Study Assistant. I can help you understand concepts, answer questions from your materials, or quiz you on topics. What would you like to study today?",
    timestamp: new Date(Date.now() - 300000),
  },
]

const suggestedPrompts = [
  "📖 Explain the concept of Big O notation",
  "🧮 Help me understand linear regression",
  "🧠 Quiz me on neural networks",
  "📝 Summarize my uploaded notes",
]

export default function Chat() {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generateMockResponse(messageText),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat">
      {/* Chat Messages Area */}
      <div className="chat__messages-area glass-card">
        <div className="chat__messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat__message chat__message--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat__avatar chat__avatar--ai">
                  <span>🧠</span>
                </div>
              )}
              <div className={`chat__bubble chat__bubble--${msg.role}`}>
                <p className="chat__bubble-text">{msg.content}</p>
                <span className="chat__bubble-time">{formatTime(msg.timestamp)}</span>
              </div>
              {msg.role === 'user' && (
                <div className="chat__avatar chat__avatar--user">
                  <span>S</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat__message chat__message--assistant">
              <div className="chat__avatar chat__avatar--ai">
                <span>🧠</span>
              </div>
              <div className="chat__typing">
                <div className="chat__typing-dot" />
                <div className="chat__typing-dot" />
                <div className="chat__typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (show when empty) */}
        {messages.length <= 1 && (
          <div className="chat__suggestions">
            <p className="chat__suggestions-title">Try asking:</p>
            <div className="chat__suggestions-grid">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="chat__suggestion-chip"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat__input-area glass-card-strong">
        <div className="chat__input-wrapper">
          <textarea
            ref={inputRef}
            className="chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI tutor anything..."
            rows={1}
          />
          <button
            className="chat__send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <span className="chat__send-icon">➤</span>
          </button>
        </div>
        <p className="chat__input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// Mock response generator
function generateMockResponse(input) {
  const responses = [
    "That's a great question! Let me break this down for you.\n\nThe concept you're asking about is fundamental to understanding this topic. Think of it as building blocks — each piece connects to form a larger picture.\n\nWould you like me to go into more detail on any specific aspect?",
    "Based on your study materials, here's what I found:\n\nThis topic relates closely to what you've been studying. The key points to remember are:\n\n1. Start with the fundamentals\n2. Build upon each concept progressively\n3. Practice with real-world examples\n\nShall I create some flashcards to help you memorize these points?",
    "Let me help you understand this better!\n\nThe core idea here is about establishing connections between concepts. When you grasp the underlying principles, everything becomes clearer.\n\nI'd recommend reviewing your notes on this topic and then we can do a quick quiz to test your understanding. Ready?",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
