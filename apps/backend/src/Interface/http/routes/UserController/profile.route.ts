import { Elysia } from "elysia";
import { getProfile } from "../../controller/UserController/profile.controller";

const app = new Elysia();

export const profileRoutes = app.get("/profile", getProfile);
