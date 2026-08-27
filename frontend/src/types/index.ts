export type SampleType =
  | "drinking_water"
  | "wastewater"
  | "groundwater"
  | "surface_water";

export interface Sample {
  id: number;
  sample_code: string;
  client_name: string;
  source_location: string | null;
  sample_type: SampleType;
  collected_by: string | null;
  collected_at: string;
  status: "registered" | "in_analysis" | "analyzed" | "reported";
  created_at: string;
}

export interface SampleRegistrationInput {
  sample_code: string;
  client_name: string;
  source_location?: string;
  sample_type: SampleType;
  collected_by?: string;
  collected_at?: string;
}

export interface Result {
  id: number;
  sample_id: number;
  parameter: string;
  value: number;
  unit: string | null;
  threshold_min: number | null;
  threshold_max: number | null;
  is_compliant: boolean;
  tested_by: string | null;
  tested_at: string;
}

export interface Report {
  id: number;
  sample_id: number;
  report_number: string;
  overall_compliant: boolean;
  summary: string;
  generated_at: string;
  sample_code?: string;
  client_name?: string;
  cache?: "hit" | "miss";
}
