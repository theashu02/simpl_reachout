"use server";

import { getServerAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserCompanyDetails, type ICompanyDetail, type IUserCompanyDetails } from "@/lib/models/hyper-mail-models/userCompanyDetailsModel";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function getAuthenticatedUser() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return null;
  }
  return { id: session.user.id };
}

// Helper to serialize MongoDB documents to plain objects (removes ObjectId, Date, etc.)
function serializeCompany(company: ICompanyDetail): ICompanyDetail {
  return {
    company_name: company.company_name,
    exists: company.exists,
    domain: company.domain,
    url: company.url,
    confidence: company.confidence,
    title: company.title,
    description: company.description,
    verified: company.verified,
    source: company.source,
    linkedin_url: company.linkedin_url,
    logo_url: company.logo_url,
  };
}

// READ: Get all saved companies for the authenticated user
export async function getUserCompanies(): Promise<ApiResponse<ICompanyDetail[]>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: null, error: "Unauthorized - Please sign in" };
  }

  try {
    await connectToDatabase();

    const userDoc = await UserCompanyDetails.findOne({ userId: user.id }).lean<IUserCompanyDetails>();

    if (!userDoc || !userDoc.companies) {
      return { data: [], error: null };
    }

    return { data: userDoc.companies as ICompanyDetail[], error: null };
  } catch (error) {
    console.error("getUserCompanies error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[] | null;
  hasMore: boolean;
  total: number;
  error: string | null;
}

// Sort options for company list
export type SortOrder = "asc" | "desc";

// READ: Get paginated, sorted, and filtered companies for the authenticated user
export async function getUserCompaniesPaginated(page: number = 1, limit: number = 10, sortOrder: SortOrder = "asc", search?: string): Promise<PaginatedResponse<ICompanyDetail>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: null, hasMore: false, total: 0, error: "Unauthorized - Please sign in" };
  }

  // Safeguards: validate inputs
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const skip = (safePage - 1) * safeLimit;
  const sortDirection = sortOrder === "desc" ? -1 : 1;

  try {
    await connectToDatabase();

    // Build aggregation pipeline
    const pipeline: Parameters<typeof UserCompanyDetails.aggregate>[0] = [{ $match: { userId: user.id } }, { $unwind: { path: "$companies", preserveNullAndEmptyArrays: false } }];

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [{ "companies.company_name": searchRegex }, { "companies.domain": searchRegex }],
        },
      });
    }

    // Use $facet to get total count and paginated results in one query
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $sort: { "companies.company_name": sortDirection } }, { $skip: skip }, { $limit: safeLimit }, { $replaceRoot: { newRoot: "$companies" } }],
      },
    });

    const result = await UserCompanyDetails.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total ?? 0;
    const companies = (result[0]?.data ?? []).map(serializeCompany);
    const hasMore = skip + companies.length < total;

    return { data: companies, hasMore, total, error: null };
  } catch (error) {
    console.error("getUserCompaniesPaginated error:", error);
    return {
      data: null,
      hasMore: false,
      total: 0,
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}

// DELETE: Remove a company by domain
export async function deleteUserCompany(domain: string): Promise<ApiResponse<{ success: boolean }>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: null, error: "Unauthorized - Please sign in" };
  }

  try {
    await connectToDatabase();

    await UserCompanyDetails.findOneAndUpdate({ userId: user.id }, { $pull: { companies: { domain: domain.toLowerCase() } } });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("deleteUserCompany error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}
