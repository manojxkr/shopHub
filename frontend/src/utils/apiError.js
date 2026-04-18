/** Normalize axios / fetch errors for user-visible messages. */
export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  if (!err) return fallback;
  const code = err.code;
  const msg = err.message || "";
  if (code === "ERR_NETWORK" || msg === "Network Error" || msg.includes("Network Error")) {
    return "The product catalog could not load because this page could not talk to the server. Fix: (1) Start the Java backend from the backend folder (for example: mvnw spring-boot:run) and wait until it says it is listening on port 8080. (2) Reload this page. With npm run dev, requests go to /api and are proxied to port 8080 automatically. If your API is on another host or port, create frontend/.env with VITE_API_BASE_URL=… and restart npm run dev.";
  }
  const body = err.response?.data;
  if (body?.message) return body.message;
  if (typeof body === "string") return body;
  return msg || fallback;
}
