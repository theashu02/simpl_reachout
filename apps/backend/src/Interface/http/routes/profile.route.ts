import { Elysia } from "elysia";
import { getProfile } from "../controller/profile.controller";

const app = new Elysia();

export const profileRoutes = app.get("/profile", getProfile);
