'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Wallet, Copy, Trash2, Plus, Menu, X, Zap, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { useZGInference } from '@/hooks/use-zg-inference'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  model?: string
  error?: boolean
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  lastUpdated: Date
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
}

export default function AIChatInterface() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const {
    broker,
    isInitialized,
    isLoading: brokerLoading,
    currentService,
    initializeBroker,
    setupLedger,
    discoverServices,
    runInference
  } = useZGInference()

  // UI State - Remove isClient state
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [brokerStatus, setBrokerStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [walletLogs, setWalletLogs] = useState<string[]>([])
  const [showWalletLogs, setShowWalletLogs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if we're in demo mode (no contracts deployed)
  const isDemoMode = !process.env.NEXT_PUBLIC_INFT_ADDRESS || !process.env.NEXT_PUBLIC_ORACLE_ADDRESS

  // Proper hydration check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize 0G broker when wallet connects - Updated condition
  useEffect(() => {
    if (isConnected && address && !isInitialized && mounted) {
      handleBrokerInitialization()
      addWalletLog(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
    }
  }, [isConnected, address, isInitialized, mounted])

  // Update broker status based on hook state
  useEffect(() => {
    if (brokerLoading) {
      setBrokerStatus('connecting')
    } else if (isInitialized && broker && currentService) {
      setBrokerStatus('connected')
      addNotification('success', '0G Network connected successfully!')
    } else if (isConnected && !brokerLoading) {
      setBrokerStatus('error')
    } else {
      setBrokerStatus('disconnected')
    }
  }, [brokerLoading, isInitialized, broker, currentService, isConnected])

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1))
    }, 5000)
    return () => clearTimeout(timer)
  }, [notifications])

  // Auto-remove copy success message
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copySuccess])

  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev.slice(0, 2)]) // Keep max 3 notifications
  }

  const handleBrokerInitialization = async () => {
    try {
      setBrokerStatus('connecting')
      addNotification('info', 'Connecting to 0G Network...')
      
      // Initialize broker with retry logic
      let newBroker = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          newBroker = await initializeBroker()
          if (newBroker) break
        } catch (error) {
          console.warn(`Broker initialization attempt ${attempt} failed:`, error)
          if (attempt === 3) throw error
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        }
      }
      
      if (!newBroker) throw new Error('Failed to initialize broker after 3 attempts')
      
      // Setup ledger with error handling
      try {
        await setupLedger(newBroker)
        addNotification('success', 'Ledger setup completed')
      } catch (ledgerError) {
        console.warn('Ledger setup failed:', ledgerError)
        addNotification('warning', 'Ledger setup failed, but continuing...')
      }
      
      // Discover services with error handling
      try {
        await discoverServices(newBroker)
        addNotification('success', 'AI services discovered')
      } catch (serviceError) {
        console.warn('Service discovery failed:', serviceError)
        addNotification('error', 'Failed to discover AI services')
        throw serviceError
      }
      
      setBrokerStatus('connected')
      setRetryCount(0)
    } catch (error) {
      console.error('Broker initialization failed:', error)
      setBrokerStatus('error')
      setRetryCount(prev => prev + 1)
      
      let errorMessage = 'Failed to connect to 0G Network'
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Network connection failed. Please check your internet connection.'
        } else if (error.message.includes('wallet')) {
          errorMessage = 'Wallet connection failed. Please ensure MetaMask is connected.'
        } else if (error.message.includes('balance')) {
          errorMessage = 'Insufficient balance on 0G network. Please add funds to continue.'
        }
      }
      
      addNotification('error', errorMessage)
    }
  }

  const handleWalletConnect = async () => {
    try {
      if (isConnected) {
        disconnect()
        setBrokerStatus('disconnected')
        const logMessage = `Wallet disconnected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
        addWalletLog(logMessage)
        addNotification('info', 'Wallet disconnected')
      } else {
        addNotification('info', 'Opening wallet connection...')
        addWalletLog('Opening wallet connection...')
        open()
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      addWalletLog(`Error: Failed to connect wallet`)
      addNotification('error', 'Failed to connect wallet')
    }
  }
  
  const addWalletLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setWalletLogs(prev => [logEntry, ...prev.slice(0, 4)]) // Keep only the last 5 logs
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const createNewSession = () => {
    try {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)
      setSidebarOpen(false)
      addNotification('success', 'New chat session created')
    } catch (error) {
      console.error('Failed to create new session:', error)
      addNotification('error', 'Failed to create new chat session')
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !isInitialized || !currentService) {
      if (!message.trim()) {
        addNotification('warning', 'Please enter a message')
      } else if (!isInitialized) {
        addNotification('error', 'Please wait for 0G Network to connect')
      } else if (!currentService) {
        addNotification('error', 'No AI service available')
      }
      return
    }

    let session = currentSession
    if (!session) {
      session = {
        id: Date.now().toString(),
        title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      }
      setSessions(prev => [session!, ...prev])
      setCurrentSession(session)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    }

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      lastUpdated: new Date()
    }

    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s))
    setMessage('')
    setIsLoading(true)

    try {
      // Use the 0G inference hook for AI requests with timeout
      const systemPrompt = "You are a helpful AI assistant powered by 0G Labs decentralized compute network."
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
      
      const inferencePromise = runInference(message, systemPrompt)
      
      const aiResponse = await Promise.race([inferencePromise, timeoutPromise]) as string

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        model: currentService.model
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        lastUpdated: new Date()
      }

      setCurrentSession(finalSession)
      setSessions(prev => prev.map(s => s.id === session.id ? finalSession : s))
      addNotification('success', 'AI response received')

    } catch (error) {
      console.error('Inference failed:', error)
      
      let errorMessage = 'Sorry, I encountered an error processing your request.'
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a shorter message.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('service')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again later.'
        }
      }
      
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
        error: true
      }

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessageObj],
        lastUpdated: new Date()
      }

      setCurrentSession(errorSession)
      setSessions(prev => prev.map(s => s.id === session.id ? errorSession : s))
      addNotification('error', 'Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(messageId)
      addNotification('success', 'Message copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      addNotification('error', 'Failed to copy message')
    }
  }

  const deleteSession = (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
      }
      addNotification('success', 'Chat session deleted')
    } catch (error) {
      console.error('Failed to delete session:', error)
      addNotification('error', 'Failed to delete chat session')
    }
  }

  const retryConnection = () => {
    if (isConnected && !isInitialized) {
      handleBrokerInitialization()
    } else {
      addNotification('info', 'Please connect your wallet first')
    }
  }

  const getBrokerStatusIcon = () => {
    switch (brokerStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'connecting':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Zap className="w-4 h-4 text-gray-400" />
    }
  }

  const getBrokerStatusText = () => {
    switch (brokerStatus) {
      case 'connected':
        return '0G Network Connected'
      case 'connecting':
        return 'Connecting to 0G...'
      case 'error':
        return '0G Connection Failed'
      default:
        return '0G Network Disconnected'
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  // Replace the loading check
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white">Loading 0G AI Chat...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 p-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
              notification.type === 'success' ? 'bg-green-900/90 border border-green-500/30' :
              notification.type === 'error' ? 'bg-red-900/90 border border-red-500/30' :
              notification.type === 'warning' ? 'bg-yellow-900/90 border border-yellow-500/30' :
              'bg-blue-900/90 border border-blue-500/30'
            }`}
          >
            {getNotificationIcon(notification.type)}
            <span className="text-sm">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                0G AI Chat
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={createNewSession}
              disabled={!isConnected}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg transition-all duration-200 font-medium disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h2>
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No chat sessions yet.<br />Start a new conversation!
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'bg-gray-700 border border-yellow-500/30'
                      : 'hover:bg-gray-700/50'
                  }`}
                  onClick={() => {
                    setCurrentSession(session)
                    setSidebarOpen(false)
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-400">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-600 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Connection Status */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getBrokerStatusIcon()}
                <span className="text-sm">{getBrokerStatusText()}</span>
              </div>
              {brokerStatus === 'error' && (
                <button
                  onClick={retryConnection}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Retry connection"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                </button>
              )}
            </div>
            
            {/* Wallet Connection */}
            <button
              onClick={handleWalletConnect}
              className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-200 font-medium ${
                isConnected
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnected
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : 'Connect Wallet'
                }
              </span>
            </button>
            
            {retryCount > 0 && (
              <div className="mt-2 text-xs text-gray-400 text-center">
                Connection attempts: {retryCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getBrokerStatusIcon()}
              <span className="text-sm text-gray-300">{getBrokerStatusText()}</span>
            </div>
            
            {currentService && (
              <div className="text-sm text-gray-400">
                Model: <span className="text-yellow-400">{currentService.model}</span>
              </div>
            )}
            
            {isConnected && (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button
                  onClick={() => setShowWalletLogs(!showWalletLogs)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  {showWalletLogs ? 'Hide Logs' : '5 Logs'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentSession?.messages.length ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                        : msg.error
                        ? 'bg-red-900/20 border border-red-500/30'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.model && (
                          <p className="text-xs text-gray-400 mt-2">Model: {msg.model}</p>
                        )}
                        {msg.error && (
                          <p className="text-xs text-red-400 mt-2 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Error occurred
                          </p>
                        )}
                      </div>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="ml-2 p-1 rounded hover:bg-gray-700 transition-colors relative"
                        >
                          {copySuccess === msg.id ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Welcome to 0G AI Chat
                </h2>
                <p className="text-gray-400 mb-6">
                  Powered by 0G Labs decentralized compute network
                </p>
                {!isConnected ? (
                  <button
                    onClick={handleWalletConnect}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    Connect Wallet to Start
                  </button>
                ) : brokerStatus === 'error' ? (
                  <button
                    onClick={retryConnection}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry 0G Connection</span>
                  </button>
                ) : isDemoMode ? (
                  <div className="text-gray-400">
                    <p className="mb-2">Demo mode: No contracts deployed.</p>
                    <p className="mb-2">Please deploy contracts to use the 0G AI Chat.</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={
                    !isConnected ? "Connect wallet to start chatting" :
                    !isInitialized ? "Connecting to 0G Network..." :
                    "Type your message..."
                  }
                  disabled={!isConnected || !isInitialized || isLoading || isDemoMode}
                  className="w-full p-4 pr-12 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isConnected || !isInitialized || isLoading || isDemoMode}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-black" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Status Messages */}
            {brokerStatus === 'error' && (
              <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">
                      Failed to connect to 0G network. Please check your wallet connection.
                    </span>
                  </div>
                  <button
                    onClick={retryConnection}
                    className="text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {brokerStatus === 'connecting' && (
              <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-yellow-400">
                    Connecting to 0G network... This may take a moment.
                  </span>
                </div>
              </div>
            )}
            
            {/* Wallet Logs Display */}
            {showWalletLogs && walletLogs.length > 0 && (
              <div className="mt-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Wallet Logs (5)</h3>
                  <button 
                    onClick={() => setShowWalletLogs(false)}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 text-xs text-gray-400 font-mono">
                  {walletLogs.map((log, index) => (
                    <div key={index} className="border-b border-gray-700/50 pb-1 last:border-0">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

const isWalletAvailable = () => {
  return typeof window !== 'undefined' && 
         (typeof window.ethereum !== 'undefined' || 
          typeof (window as any).web3 !== 'undefined');
}

const checkWalletConnection = async () => {
  if (!isWalletAvailable()) {
    throw new Error('No wallet detected');
  }
  
  // Let wagmi handle the connection check
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.request({ method: 'eth_accounts' }).then(accounts => accounts.length > 0);
}

const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
}

export const checkMetaMaskConnection = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await (window.ethereum as any).request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Failed to check MetaMask connection:', error);
    return false;
  }
}