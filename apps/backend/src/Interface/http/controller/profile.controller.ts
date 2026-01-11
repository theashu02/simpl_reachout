import { authenticateRequest } from "../../../middleware/VerifyUser";

export const getProfile = async ({ request, set }: any) => {
  try {
    const user = await authenticateRequest(request);

    return {
      status: "ok",
      message: "Backend verified your NextAuth session.",
      user: {
        id: user.id ?? user.sub,
        email: user.email,
        name: user.name,
        image: user.picture,
      },
    };
  } catch (error) {
    set.status = 401;
    console.error("[backend] Unauthorized request rejected:", error);

    return {
      status: "error",
      message: "Unauthorized request. Include a valid NextAuth session token.",
    };
  }
};
