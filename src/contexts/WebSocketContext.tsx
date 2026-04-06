import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { useWebSocket, WebSocketMessage, WebSocketStatus } from '../hooks/useWebSocket';

// WebSocket 配置
export const WS_BASE_URL = 'wss://copytrading-backend-production.up.railway.app/ws';

// 消息类型定义
export interface PriceUpdateMessage {
  type: 'price_update';
  data: {
    symbol: string;
    price: number;
    change_24h: number;
    change_percent_24h: number;
    high_24h: number;
    low_24h: number;
    volume_24h: number;
    timestamp: string;
  };
}

export interface OrderUpdateMessage {
  type: 'order_update';
  data: {
    id: string;
    traderId: number;
    traderName: string;
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    status: 'open' | 'closed' | 'cancelled';
    pnl?: number;
    timestamp: string;
  };
}

export interface PositionUpdateMessage {
  type: 'position_update';
  data: {
    traderId: number;
    traderName: string;
    symbol: string;
    side: 'long' | 'short';
    amount: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    leverage: number;
    timestamp: string;
  };
}

export interface TradeHistoryMessage {
  type: 'trade_history';
  data: {
    trades: Array<{
      id: string;
      time: string;
      trader: string;
      pair: string;
      side: 'buy' | 'sell';
      amount: string;
      pnl: number;
    }>;
  };
}

export type WebSocketDataMessage = 
  | PriceUpdateMessage 
  | OrderUpdateMessage 
  | PositionUpdateMessage 
  | TradeHistoryMessage;

// Context 类型定义
interface WebSocketContextType {
  // 连接状态
  status: WebSocketStatus;
  isConnected: boolean;
  
  // 价格数据
  prices: Map<string, PriceUpdateMessage['data']>;
  getPrice: (symbol: string) => PriceUpdateMessage['data'] | undefined;
  
  // 订单数据
  latestOrder: OrderUpdateMessage['data'] | null;
  orders: OrderUpdateMessage['data'][];
  
  // 持仓数据
  positions: PositionUpdateMessage['data'][];
  getPosition: (traderId: number, symbol: string) => PositionUpdateMessage['data'] | undefined;
  
  // 交易历史
  tradeHistory: TradeHistoryMessage['data']['trades'];
  
  // 操作方法
  sendMessage: (message: string | object) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider 组件
interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({ 
  children, 
  url = WS_BASE_URL,
  autoConnect = true 
}: WebSocketProviderProps) {
  // 数据状态
  const [prices, setPrices] = useState<Map<string, PriceUpdateMessage['data']>>(new Map());
  const [latestOrder, setLatestOrder] = useState<OrderUpdateMessage['data'] | null>(null);
  const [orders, setOrders] = useState<OrderUpdateMessage['data'][]>([]);
  const [positions, setPositions] = useState<PositionUpdateMessage['data'][]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryMessage['data']['trades']>([]);

  // 处理接收到的消息
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'price_update':
        const priceData = (message as PriceUpdateMessage).data;
        setPrices(prev => new Map(prev).set(priceData.symbol, priceData));
        break;

      case 'order_update':
        const orderData = (message as OrderUpdateMessage).data;
        setLatestOrder(orderData);
        setOrders(prev => [orderData, ...prev].slice(0, 100)); // 保留最近100条
        break;

      case 'position_update':
        const positionData = (message as PositionUpdateMessage).data;
        setPositions(prev => {
          const existingIndex = prev.findIndex(
            p => p.traderId === positionData.traderId && p.symbol === positionData.symbol
          );
          if (existingIndex >= 0) {
            const newPositions = [...prev];
            newPositions[existingIndex] = positionData;
            return newPositions;
          }
          return [...prev, positionData];
        });
        break;

      case 'trade_history':
        const historyData = (message as TradeHistoryMessage).data;
        setTradeHistory(historyData.trades);
        break;

      case 'pong':
        // 心跳响应，无需处理
        break;

      default:
        console.log('[WebSocketContext] Unknown message type:', message.type);
    }
  }, []);

  // 使用 WebSocket hook
  const {
    sendMessage,
    status,
    isConnected,
    connect,
    disconnect,
    reconnect,
  } = useWebSocket({
    url,
    onMessage: handleMessage,
    reconnectAttempts: 10,
    reconnectInterval: 5000,
    heartbeatInterval: 30000,
    autoConnect,
  });

  // 辅助方法
  const getPrice = useCallback((symbol: string) => {
    return prices.get(symbol);
  }, [prices]);

  const getPosition = useCallback((traderId: number, symbol: string) => {
    return positions.find(p => p.traderId === traderId && p.symbol === symbol);
  }, [positions]);

  const subscribeToSymbol = useCallback((symbol: string) => {
    sendMessage({
      type: 'subscribe',
      channel: 'price',
      symbol,
    });
  }, [sendMessage]);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel: 'price',
      symbol,
    });
  }, [sendMessage]);

  const value: WebSocketContextType = {
    status,
    isConnected,
    prices,
    getPrice,
    latestOrder,
    orders,
    positions,
    getPosition,
    tradeHistory,
    sendMessage,
    connect,
    disconnect,
    reconnect,
    subscribeToSymbol,
    unsubscribeFromSymbol,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

export default WebSocketContext;
