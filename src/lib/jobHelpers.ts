import { supabase } from "@/integrations/supabase/client";

export type JobType =
  | "backlinks_analysis"
  | "traffic_analysis"
  | "keyword_research"
  | "keyword_clustering"
  | "competitor_analysis"
  | "serp_tracking"
  | "bulk_analysis"
  | "pdf_report";

export interface CreateJobParams {
  jobType: JobType;
  inputData: Record<string, any>;
  totalItems?: number;
}

/**
 * Create a new background job
 */
export async function createJob({
  jobType,
  inputData,
  totalItems = 1,
}: CreateJobParams) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      job_type: jobType,
      input_data: inputData,
      total_items: totalItems,
      status: "pending",
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Trigger job processing
 */
export async function triggerJob(jobId: string) {
  const { data, error } = await supabase.functions.invoke("job-worker", {
    body: { jobId },
  });

  if (error) throw error;
  return data;
}

/**
 * Create and immediately trigger a job
 */
export async function createAndTriggerJob(params: CreateJobParams) {
  const job = await createJob(params);
  
  // Trigger job processing (don't await - let it run in background)
  triggerJob(job.id).catch((error) => {
    console.error("Failed to trigger job:", error);
  });

  return job;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string) {
  const { error } = await supabase
    .from("jobs")
    .update({ status: "cancelled" })
    .eq("id", jobId)
    .eq("status", "pending"); // Only cancel pending jobs

  if (error) throw error;
}

/**
 * Subscribe to job updates
 */
export function subscribeToJob(
  jobId: string,
  callback: (job: any) => void
) {
  const channel = supabase
    .channel(`job_${jobId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "jobs",
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
