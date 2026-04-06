import { useState, useEffect, useRef, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
  onOpen?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  sendMessage: (message: string | object) => void;
  lastMessage: WebSocketMessage | null;
  status: WebSocketStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    heartbeatMessage = JSON.stringify({ type: 'ping', timestamp: Date.now() }),
    onOpen,
    onMessage,
    onClose,
    onError,
    autoConnect = true,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatTimerRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(heartbeatMessage);
        }
      }, heartbeatInterval);
    }
  }, [heartbeatInterval, heartbeatMessage]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    clearTimers();
    isManualDisconnectRef.current = false;
    setStatus('connecting');
    setError(null);

    try {
      console.log(`[WebSocket] Connecting to ${url}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        console.log('[WebSocket] Connected');
        setStatus('connected');
        reconnectCountRef.current = 0;
        startHeartbeat();
        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(parsedMessage);
          onMessage?.(parsedMessage);
        } catch (err) {
          // 如果不是 JSON，作为原始文本处理
          const rawMessage: WebSocketMessage = {
            type: 'raw',
            data: event.data,
            timestamp: Date.now(),
          };
          setLastMessage(rawMessage);
          onMessage?.(rawMessage);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        setStatus('disconnected');
        clearTimers();
        onClose?.(event);

        // 如果不是手动断开，尝试重连
        if (!isManualDisconnectRef.current && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          console.log(`[WebSocket] Reconnecting... Attempt ${reconnectCountRef.current}/${reconnectAttempts}`);
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setStatus('error');
        setError(new Error('WebSocket connection error'));
        onError?.(event);
      };
    } catch (err) {
      console.error('[WebSocket] Connection failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [url, reconnectAttempts, reconnectInterval, onOpen, onMessage, onClose, onError, clearTimers, startHeartbeat]);

  const disconnect = useCallback(() => {
    console.log('[WebSocket] Disconnecting manually');
    isManualDisconnectRef.current = true;
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    reconnectCountRef.current = 0;
  }, [clearTimers]);

  const reconnect = useCallback(() => {
    console.log('[WebSocket] Manual reconnect triggered');
    disconnect();
    reconnectCountRef.current = 0;
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);

  // 自动连接
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    sendMessage,
    lastMessage,
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    reconnect,
    error,
  };
}

export default useWebSocket;
