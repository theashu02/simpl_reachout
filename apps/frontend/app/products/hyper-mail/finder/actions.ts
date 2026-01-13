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
