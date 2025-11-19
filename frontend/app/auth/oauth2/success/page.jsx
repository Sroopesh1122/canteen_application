"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const role = searchParams.get("role");

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
      if(role ==="ADMIN")
      {
         router.push('/admin');
      }
      else if (role ==="CUSTOMER" ){
        router.push('/user');
      }
      else{
        router.push("/")
      }
    }
  }, [token, router]);

  return (
    <div className="text-center min-h-screen w-full flex justify-center items-center bg-white text-black p-6">
      Logging you in, please wait...
    </div>
  );
};

export default Page;
