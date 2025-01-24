import config from "@/lib/config";
import { Client as WorkflowClient } from "@upstash/workflow";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});
