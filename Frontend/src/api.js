import { toast } from "./lib/notify.js";

const BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/words";

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function handleResponse(res) {
  const payload = await parseJson(res);

  if (!res.ok || payload?.success === false) {
    const errorMessage =
      payload?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMessage);
    err.statusCode = payload?.error?.statusCode || res.status;
    err.payload = payload?.error;
    try {
      toast({ type: "error", message: errorMessage });
    } catch {}
    throw err;
  }

  return payload?.data;
}

async function request(endpoint, options) {
  let response;

  try {
    response = await fetch(endpoint, options);
  } catch (networkError) {
    const err = new Error(
      "Unable to reach the server. Please check your connection.",
    );
    err.statusCode = 0;
    throw err;
  }

  return handleResponse(response);
}

export async function getWords() {
  return request(BASE);
}

export async function addWord(word) {
  const data = await request(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  });

  try {
    toast({ type: "success", message: `Added "${data.word || word}"` });
  } catch {}

  return data;
}

export async function deleteWord(id) {
  const data = await request(`${BASE}/${id}`, { method: "DELETE" });

  try {
    toast({ type: "success", message: "Removed word" });
  } catch {}

  return data;
}

export async function getReviewQueue() {
  return request(`${BASE}/review/queue`);
}

export async function submitReview(id, result, devMode) {
  const data = await request(`${BASE}/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result, devMode }),
  });

  try {
    toast({
      type: "success",
      message:
        result === "right" ? "Nice — review recorded" : "Marked as needs work",
    });
  } catch {}

  return data;
}

export async function devSkipToDue() {
  return request(`${BASE}/dev/skip-to-due`, { method: "POST" });
}
