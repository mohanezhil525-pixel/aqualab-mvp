import { useState, FormEvent } from "react";
import { api } from "../api/client";
import type { Sample, SampleRegistrationInput, SampleType } from "../types";

const SAMPLE_TYPES: { value: SampleType; label: string }[] = [
  { value: "drinking_water", label: "Drinking water" },
  { value: "groundwater", label: "Groundwater" },
  { value: "surface_water", label: "Surface water" },
  { value: "wastewater", label: "Wastewater" },
];

const EMPTY_FORM: SampleRegistrationInput = {
  sample_code: "",
  client_name: "",
  source_location: "",
  sample_type: "drinking_water",
  collected_by: "",
};

interface Props {
  /** Called after a sample is registered, so a parent list/table can refresh. */
  onRegistered?: (sample: Sample) => void;
}

export default function SampleRegistrationForm({ onRegistered }: Props) {
  const [form, setForm] = useState<SampleRegistrationInput>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRegistered, setLastRegistered] = useState<Sample | null>(null);

  function update<K extends keyof SampleRegistrationInput>(
    key: K,
    value: SampleRegistrationInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.sample_code.trim() || !form.client_name.trim()) {
      setError("Sample code and client name are required.");
      return;
    }

    setSubmitting(true);
    try {
      const sample = await api.createSample(form);
      setLastRegistered(sample);
      setForm(EMPTY_FORM);
      onRegistered?.(sample);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register sample.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-lab-900 rounded-t-lg px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Register Sample</h2>
        <p className="text-sm text-lab-100">
          Log a new sample before it goes to the bench for analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {lastRegistered && (
          <div className="rounded-md border border-lab-600/30 bg-lab-50 px-3 py-2 text-sm text-lab-700">
            Registered <span className="font-semibold">{lastRegistered.sample_code}</span> for{" "}
            {lastRegistered.client_name}.
          </div>
        )}

        <div>
          <label htmlFor="sample_code" className="block text-sm font-medium text-slate-700">
            Sample code <span className="text-red-500">*</span>
          </label>
          <input
            id="sample_code"
            type="text"
            required
            placeholder="WS-2026-0003"
            value={form.sample_code}
            onChange={(e) => update("sample_code", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-lab-600 focus:outline-none focus:ring-1 focus:ring-lab-600"
          />
        </div>

        <div>
          <label htmlFor="client_name" className="block text-sm font-medium text-slate-700">
            Client name <span className="text-red-500">*</span>
          </label>
          <input
            id="client_name"
            type="text"
            required
            placeholder="Chennai Municipal Corp"
            value={form.client_name}
            onChange={(e) => update("client_name", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-lab-600 focus:outline-none focus:ring-1 focus:ring-lab-600"
          />
        </div>

        <div>
          <label htmlFor="source_location" className="block text-sm font-medium text-slate-700">
            Source location
          </label>
          <input
            id="source_location"
            type="text"
            placeholder="Borewell #3, Sector 12"
            value={form.source_location}
            onChange={(e) => update("source_location", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-lab-600 focus:outline-none focus:ring-1 focus:ring-lab-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sample_type" className="block text-sm font-medium text-slate-700">
              Sample type
            </label>
            <select
              id="sample_type"
              value={form.sample_type}
              onChange={(e) => update("sample_type", e.target.value as SampleType)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-lab-600 focus:outline-none focus:ring-1 focus:ring-lab-600"
            >
              {SAMPLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="collected_by" className="block text-sm font-medium text-slate-700">
              Collected by
            </label>
            <input
              id="collected_by"
              type="text"
              placeholder="A. Kumar"
              value={form.collected_by}
              onChange={(e) => update("collected_by", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-lab-600 focus:outline-none focus:ring-1 focus:ring-lab-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-lab-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lab-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Registering…" : "Register sample"}
        </button>
      </form>
    </div>
  );
}
