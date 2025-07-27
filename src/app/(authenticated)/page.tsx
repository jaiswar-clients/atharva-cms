"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    if (router) {
      router.push("/colleges");
    }
  }, [router]);
  return null;
};

export default Page;
