import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/Redis/queue";
import { connectToDatabase } from "../db/db";
import { UserCompanyDetails, type ICompanyDetail } from "../db/models/companyDeatils/userCompanyDetailsModel";

export interface CompanyPersistJobData {
  userId: string;
  email: string;
  company: ICompanyDetail;
}

const processCompanyPersist = async (job: Job<CompanyPersistJobData>) => {
  const { userId, email, company } = job.data;

  await connectToDatabase();

  try {
    // First, try to update an existing company in the array
    const updated = await UserCompanyDetails.findOneAndUpdate(
      { userId, "companies.domain": company.domain },
      {
        $set: {
          email,
          "companies.$.company_name": company.company_name,
          "companies.$.exists": company.exists,
          "companies.$.domain": company.domain,
          "companies.$.url": company.url,
          "companies.$.confidence": company.confidence,
          "companies.$.title": company.title,
          "companies.$.description": company.description,
          "companies.$.verified": company.verified,
          "companies.$.source": company.source,
          "companies.$.linkedin_url": company.linkedin_url,
          "companies.$.logo_url": company.logo_url,
        },
      },
      { new: true }
    );

    // If no existing company was updated, add it to the array (or create new user doc)
    if (!updated) {
      await UserCompanyDetails.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          $set: { email },
          $push: { companies: company },
        },
        { upsert: true, new: true }
      );
    }

    console.log(`--- ✅ [Worker] Company saved for user ${userId}: ${company.domain} ---`);
    return { success: true, domain: company.domain };
  } catch (error) {
    console.error(`--- ❌ [Worker] Failed to persist ${company.domain}:`, error);
    throw error; // Re-throw to trigger retry
  }
};

export const startCompanyPersistWorker = () => {
  const worker = new Worker<CompanyPersistJobData>("company-persist", processCompanyPersist, {
    connection: redisConnection,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    console.log(`--- ✅ [Worker] Job ${job.id} completed ---`);
  });

  worker.on("failed", (job, err) => {
    console.error(`--- ❌ [Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("--- ❌ [Worker] Worker error:", err.message);
  });

  console.log("--- ✅ Company persist worker started ---");
  return worker;
};
