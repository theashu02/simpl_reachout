"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import { setUserData, type UserDataState } from "@/lib/store/slices/userDataSlice";
import { useEffect } from "react";

export default function UserStoreInitializer({ user }: { user: Partial<UserDataState> }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserData(user));
  }, [dispatch, user]);

  return null;
}