import { useEffect, useState } from 'react'
import { CompactCard, CompactCardContent, CompactCardDescription, CompactCardHeader, CompactCardTitle } from './CompactCard'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { useLanguage } from '../../locales'

const MCPSettings = () => {
  const { t } = useLanguage()
  const [mcpUrl, setMcpUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const url = await window.electron.settings.getByKey('mcpUrl')
        if (url) {
          setMcpUrl(url)
        }

        // Check connection status
        const connected = await window.electron.mcp.isConnected()
        setIsConnected(connected)

        if (connected) {
          const status = await window.electron.mcp.getConnectionStatus()
          setConnectionStatus(status)
        }
      } catch (error) {
        console.error('Error loading MCP settings:', error)
      }
    }

    loadSettings()
  }, [])

  const handleConnect = async () => {
    if (!mcpUrl) return

    setIsLoading(true)
    setError('')

    try {
      // Save MCP URL
      await window.electron.settings.set('mcpUrl', mcpUrl)

      // Connect to MCP server
      const result = await window.electron.mcp.connect(mcpUrl)

      setIsConnected(true)
      const status = await window.electron.mcp.getConnectionStatus()
      setConnectionStatus(status)
    } catch (error) {
      console.error('Error connecting to MCP server:', error)
      setError(t.mcp.error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)

    try {
      await window.electron.mcp.disconnect()
      setIsConnected(false)
      setConnectionStatus('')
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.mcp.serverConfig}</CompactCardTitle>
          <CompactCardDescription className="text-xs">
            {t.mcp.serverConfigDescription}
          </CompactCardDescription>
        </CompactCardHeader>
        <CompactCardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="mcpUrl" className="text-xs">{t.mcp.serverUrl}</Label>
            <div className="flex space-x-2">
              <Input
                id="mcpUrl"
                className="h-8 text-xs"
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000"
                disabled={isLoading}
              />
              {isConnected ? (
                <Button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  variant="destructive"
                  className="h-8 text-xs px-2"
                >
                  {t.mcp.disconnect}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading || !mcpUrl}
                  className="h-8 text-xs px-2"
                >
                  {isLoading ? t.mcp.connecting : t.mcp.connect}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertCircle className="h-3 w-3" />
              <AlertTitle className="text-xs font-medium">{t.mcp.error}</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {isConnected && (
            <Alert className="py-2 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              <AlertTitle className="text-xs font-medium">{t.mcp.connected}</AlertTitle>
              <AlertDescription className="text-xs">
                {t.mcp.connectedDescription}
                {connectionStatus && (
                  <div className="mt-1">
                    <p className="text-xs">{connectionStatus}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CompactCardContent>
      </CompactCard>

      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.mcp.features}</CompactCardTitle>
          <CompactCardDescription className="text-xs">
            {t.mcp.featuresDescription}
          </CompactCardDescription>
        </CompactCardHeader>
        <CompactCardContent>
          <p className="text-xs text-muted-foreground">
            {t.mcp.withMcp}
          </p>
          <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground space-y-0.5">
            <li>{t.mcp.accessFileSystem}</li>
            <li>{t.mcp.performWebSearches}</li>
            <li>{t.mcp.callExternalApis}</li>
            <li>{t.mcp.runCode}</li>
            <li>{t.mcp.andMore}</li>
          </ul>
        </CompactCardContent>
      </CompactCard>
    </div>
  )
}

export default MCPSettings
