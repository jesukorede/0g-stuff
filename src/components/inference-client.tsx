'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'
import { BrowserProvider } from 'ethers'
import OpenAI from 'openai'
import { LogEntry, InferenceService } from '@/types'
import { Wallet, Brain, Trash2, Loader2 } from 'lucide-react'

// Use any type for the actual broker since we don't have exact types
type ActualZGBroker = any

export function InferenceClient() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [response, setResponse] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [broker, setBroker] = useState<ActualZGBroker | null>(null)
  const [services, setServices] = useState<InferenceService[]>([])
  const [currentService, setCurrentService] = useState<InferenceService | null>(null)

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }])
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const clearLogs = () => {
    setLogs([])
    setResponse('')
  }

  // Initialize broker when wallet connects
  useEffect(() => {
    const initializeBroker = async () => {
      if (!isConnected || !address || !window.ethereum) return
      
      try {
        addLog('Initializing 0G Labs broker...', 'info')
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        const newBroker = await createZGComputeNetworkBroker(signer) as ActualZGBroker
        setBroker(newBroker)
        addLog('Broker initialized successfully', 'success')
        
        // Get wallet balance
        const balance = await provider.getBalance(address)
        addLog(`Wallet balance: ${balance.toString()} wei`, 'info')
        
        // Setup ledger
        await setupLedger(newBroker)
        
        // Discover services
        await discoverServices(newBroker)
        
      } catch (error) {
        addLog(`Failed to initialize broker: ${error}`, 'error')
      }
    }

    initializeBroker()
  }, [isConnected, address])

  const setupLedger = async (broker: ActualZGBroker) => {
    try {
      addLog('Setting up ledger account...', 'info')
      
      try {
        const ledger = await broker.ledger.getLedger()
        addLog(`Account exists. Balance: ${ledger.totalBalance || ledger}`, 'success')
        
        // Add funds if balance is low
        const balanceNum = Number(ledger.totalBalance || ledger)
        if (balanceNum < 0.05) {
          addLog('Adding funds to account...', 'info')
          await broker.ledger.depositFund(0.1)
          addLog('Funds added successfully', 'success')
        }
      } catch (error) {
        addLog('Creating new ledger account...', 'info')
        await broker.ledger.addLedger(0.1)
        addLog('Ledger account created successfully', 'success')
      }
    } catch (error) {
      addLog(`Ledger setup failed: ${error}`, 'error')
    }
  }

  const discoverServices = async (broker: ActualZGBroker) => {
    try {
      addLog('Discovering AI services...', 'info')
      const availableServices = await broker.inference.listService()
      setServices(availableServices)
      addLog(`Found ${availableServices.length} available services`, 'success')
      
      if (availableServices.length > 0) {
        const service = availableServices[0]
        setCurrentService(service)
        addLog(`Selected service provider: ${service.provider}`, 'info')
        
        // Acknowledge provider
        try {
          const isAcknowledged = await broker.inference.userAcknowledged(service.provider)
          if (!isAcknowledged) {
            addLog('Acknowledging service provider...', 'info')
            await broker.inference.acknowledgeProviderSigner(service.provider)
            addLog('Provider acknowledged successfully', 'success')
          }
        } catch (ackError) {
          addLog(`Provider acknowledgment warning: ${ackError}`, 'info')
        }
        
        // Get service metadata with fallback
        try {
          const metadata = await broker.inference.getServiceMetadata(service.provider)
          addLog(`Service endpoint: ${metadata.endpoint}`, 'info')
          addLog(`Model: ${metadata.model}`, 'info')
          setCurrentService({ ...service, ...metadata })
        } catch (metaError) {
          addLog(`Using basic service info (metadata unavailable)`, 'info')
          // Set fallback values
          setCurrentService({
            ...service,
            endpoint: service.endpoint || 'https://api.openai.com/v1',
            model: service.model || 'gpt-3.5-turbo'
          })
        }
      } else {
        addLog('No services available. Please check network connection.', 'error')
      }
    } catch (error) {
      addLog(`Service discovery failed: ${error}`, 'error')
      addLog('This might be due to network issues or service unavailability', 'info')
    }
  }

  const runInference = async () => {
    if (!broker || !currentService || !currentService.endpoint) {
      addLog('Broker or service not ready', 'error')
      return
    }

    setIsLoading(true)
    setResponse('')
    
    try {
      const message = "Tell me a short joke about programming."
      const systemPrompt = "You are a helpful assistant with a sense of humor."
      
      addLog('Preparing inference request...', 'info')
      
      // Fix: Use the correct OpenAI message type
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
      
      // Get request headers
      const headers = await broker.inference.getRequestHeaders(currentService.provider, message)
      addLog('Got authentication headers', 'success')
      
      // Create OpenAI client
      const openai = new OpenAI({
        baseURL: currentService.endpoint,
        apiKey: "",
        defaultHeaders: { ...headers } as Record<string, string>,
        dangerouslyAllowBrowser: true
      })
      
      addLog('Making inference request...', 'info')
      
      const completion = await openai.chat.completions.create({
        messages,
        model: currentService.model || 'gpt-3.5-turbo',
      })
      
      const aiResponse = completion.choices[0]?.message?.content || 'No response'
      setResponse(aiResponse)
      addLog('Inference completed successfully!', 'success')
      
      // Show final balances
      try {
        const finalLedger = await broker.ledger.getLedger()
        addLog(`Updated ledger balance: ${finalLedger.totalBalance || finalLedger}`, 'info')
      } catch (balanceError) {
        addLog('Could not get updated balance', 'info')
      }
      
    } catch (error) {
      addLog(`Inference failed: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="p-4 rounded-lg border">
        {!isConnected ? (
          <button
            onClick={() => open()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
            <div>
              <strong>Connected:</strong> {address}
              {currentService && (
                <div className="text-sm mt-1">
                  Service: {currentService.provider.slice(0, 10)}...{currentService.provider.slice(-8)}
                </div>
              )}
            </div>
            <button
              onClick={() => disconnect()}
              className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="flex gap-4">
          <button
            onClick={runInference}
            disabled={isLoading || !currentService}
            className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isLoading ? 'Running...' : 'Run AI Inference'}
          </button>
          <button
            onClick={clearLogs}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Response:</h3>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
            {response}
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Logs:</h3>
          <div className="bg-gray-50 border border-gray-300 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'success' ? 'text-green-600' :
                  'text-gray-700'
                }`}
              >
                {log.timestamp}: {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}