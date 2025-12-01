'use client'

import HomePage from "@/components/common/LandingPage/HomePage";
import Preloader from "@/components/common/Loader/Preloader";
import { useState } from "react";

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  return (
    <>
      {!loadingComplete && (
        <Preloader onComplete={() => setLoadingComplete(true)} />
      )}
      <HomePage />
    </>
  );
}
