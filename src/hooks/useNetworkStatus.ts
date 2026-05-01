import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    NetInfo.fetch().then(s => {
      setIsOnline(!!s.isConnected);
      setConnectionType(s.type);
    });

    const unsub = NetInfo.addEventListener(s => {
      setIsOnline(!!s.isConnected);
      setConnectionType(s.type);
    });

    return unsub;
  }, []);

  return { isOnline, connectionType };
}
