import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface ConnectionStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
}

/**
 * Hook to monitor connection status and warn users of connectivity issues
 * Critical for handling 500+ concurrent users with varying network conditions
 */
export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null,
  });

  const checkConnectionSpeed = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const isSlowConnection = effectiveType === "slow-2g" || effectiveType === "2g";
      
      setStatus(prev => ({
        ...prev,
        isSlowConnection,
        connectionType: effectiveType,
      }));
      
      if (isSlowConnection) {
        toast.warning("Slow connection detected. Some features may take longer to load.");
      }
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      toast.success("Connection restored");
      checkConnectionSpeed();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast.error("Connection lost. Some features may not work.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connection type on mount
    checkConnectionSpeed();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", checkConnectionSpeed);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", checkConnectionSpeed);
      }
    };
  }, [checkConnectionSpeed]);

  return status;
}

/**
 * Queue for offline operations - stores failed requests to retry when online
 */
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  add(operation: () => Promise<void>) {
    this.queue.push(operation);
    this.persist();
  }

  private persist() {
    try {
      localStorage.setItem("offline_queue_count", String(this.queue.length));
    } catch (e) {
      // localStorage may be full
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue[0];
      try {
        await operation();
        this.queue.shift();
        this.persist();
      } catch (e) {
        // If still failing, stop processing
        break;
      }
    }
    
    this.isProcessing = false;
  }

  get pendingCount() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
