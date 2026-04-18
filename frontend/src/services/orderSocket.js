import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/** HTTP origin for SockJS (same rules as api.js base URL). */
export function getWsHttpBase() {
  const api =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    (typeof window !== "undefined" && window.location?.origin) ||
    "http://localhost:8080";
  if (api.startsWith("/")) {
    return typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:8080";
  }
  return api.replace(/\/api\/?$/, "");
}

/**
 * Subscribe to backend STOMP topic /topic/orders (ORDER_CREATED, PAYMENT_COMPLETED, ORDER_STATUS_UPDATED).
 * @returns unsubscribe function
 */
export function subscribeOrderEvents(onMessage) {
  const base = getWsHttpBase();
  const client = new Client({
    reconnectDelay: 4000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,
    webSocketFactory: () => new SockJS(`${base}/ws`),
    onConnect: () => {
      client.subscribe("/topic/orders", (frame) => {
        try {
          onMessage(JSON.parse(frame.body));
        } catch {
          onMessage(null);
        }
      });
    },
    onStompError: () => {},
    onWebSocketError: () => {},
  });
  client.activate();
  return () => {
    try {
      client.deactivate();
    } catch {
      /* ignore */
    }
  };
}
