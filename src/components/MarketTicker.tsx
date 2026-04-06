import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useWebSocketContext } from '../contexts/WebSocketContext';

interface Ticker {
  symbol: string;
  price: number;
  change_24h: number;
  change_percent_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  timestamp: string;
}

const API_BASE_URL = 'https://copytrading-backend-production.up.railway.app/api/v1';

export default function MarketTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // WebSocket 上下文
  const { 
    isConnected, 
    status, 
    prices, 
    subscribeToSymbol, 
    unsubscribeFromSymbol,
    reconnect 
  } = useWebSocketContext();

  // 初始加载数据
  const fetchTickers = async () => {
    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/market/tickers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setTickers(result.data);
        setLastUpdate(new Date());
        
        // 订阅所有交易对的价格更新
        result.data.forEach((ticker: Ticker) => {
          subscribeToSymbol(ticker.symbol);
        });
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch tickers:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchTickers();
    
    // 清理函数：取消订阅
    return () => {
      tickers.forEach((ticker) => {
        unsubscribeFromSymbol(ticker.symbol);
      });
    };
  }, []);

  // 合并 WebSocket 实时数据
  useEffect(() => {
    if (prices.size > 0) {
      setTickers(prevTickers => {
        return prevTickers.map(ticker => {
          const livePrice = prices.get(ticker.symbol);
          if (livePrice) {
            return {
              ...ticker,
              price: livePrice.price,
              change_24h: livePrice.change_24h,
              change_percent_24h: livePrice.change_percent_24h,
              high_24h: livePrice.high_24h,
              low_24h: livePrice.low_24h,
              volume_24h: livePrice.volume_24h,
              timestamp: livePrice.timestamp,
            };
          }
          return ticker;
        });
      });
      setLastUpdate(new Date());
    }
  }, [prices]);

  // 获取连接状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-neutral-400';
    }
  };

  // 获取连接状态文本
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '实时推送中';
      case 'connecting':
        return '连接中...';
      case 'error':
        return '连接错误';
      default:
        return '已断开';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="ml-2 text-neutral-400">加载行情数据...</span>
        </div>
      </div>
    );
  }

  if (error && tickers.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">加载失败</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchTickers}
          className="mt-4 w-full py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (tickers.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <div className="text-center py-8 text-neutral-400">
          <p>暂无行情数据</p>
          <button 
            onClick={fetchTickers}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            刷新
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          实时行情
        </h3>
        <div className="flex items-center gap-4">
          {/* 连接状态指示器 */}
          <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span>{getStatusText()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>最后更新: {lastUpdate.toLocaleTimeString()}</span>
            <button 
              onClick={fetchTickers}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {!isConnected && (
              <button 
                onClick={reconnect}
                className="p-1 hover:bg-white/10 rounded transition-colors text-cyan-400"
                title="重新连接"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tickers.map((ticker) => (
          <div 
            key={ticker.symbol}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-colors relative overflow-hidden"
          >
            {/* 实时更新闪烁效果 */}
            {isConnected && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{ticker.symbol.replace('/USDT', '')}</span>
              {ticker.change_percent_24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${ticker.change_percent_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {ticker.change_percent_24h >= 0 ? '+' : ''}{ticker.change_percent_24h.toFixed(2)}%
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              24h量: ${(ticker.volume_24h / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-neutral-600 mt-1">
              高: ${ticker.high_24h.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              {' / '}
              低: ${ticker.low_24h.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
