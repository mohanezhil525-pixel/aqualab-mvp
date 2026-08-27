import type { Sample, SampleRegistrationInput } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  createSample: (input: SampleRegistrationInput): Promise<Sample> =>
    fetch(`${API_URL}/samples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((res) => handle<Sample>(res)),

  listSamples: (): Promise<Sample[]> =>
    fetch(`${API_URL}/samples`).then((res) => handle<Sample[]>(res)),
};
