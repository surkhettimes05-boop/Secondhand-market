export class ApiError extends Error {
  constructor(public status: number, message: string, public issues: { path: string; message: string }[] = []) { super(message); }
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
  let result;
  try { result = await response.json(); } catch { throw new ApiError(response.status, "The service returned an unreadable response."); }
  if (!response.ok) throw new ApiError(response.status, result.error || "The request failed.", result.issues || []);
  return result as T;
}
