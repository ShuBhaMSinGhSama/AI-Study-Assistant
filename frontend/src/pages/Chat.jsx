import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, fetchChatMessages } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Chat.css'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your AI Study Assistant. I can help you understand concepts, answer questions from your materials, or quiz you on topics. What would you like to study today?",
  created_at: new Date().toISOString(),
}

const suggestedPrompts = [
  "📖 Explain the concept of Big O notation",
  "🧮 Help me understand linear regression",
  "🧠 Quiz me on neural networks",
  "📝 Summarize my uploaded notes",
]

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([welcomeMessage])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
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
    if (!messageText || isTyping) return

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await sendChatMessage({
        message: messageText,
        session_id: sessionId || undefined,
      })

      // Save session_id for conversation continuity
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id)
      }

      const aiMessage = {
        id: response.message_id || Date.now() + 1,
        role: 'assistant',
        content: response.ai_response,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please make sure the backend server is running.`,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
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
                <span className="chat__bubble-time">{formatTime(msg.created_at)}</span>
              </div>
              {msg.role === 'user' && (
                <div className="chat__avatar chat__avatar--user">
                  <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
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

