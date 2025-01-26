import LoginPage from "@/components/forms/log-in-page";
import { getServerUser } from "@/utils/users/server";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({
  searchParams,
}: {
  searchParams: { message: string, redirect: string };
}) => {
  console.log("searchParams", searchParams);
  const user = await getServerUser();
  const redirectUrl = decodeURIComponent(searchParams.redirect as string); // Decode the redirectUrl
  if (user) {
    redirect("/itinerary");
  }
  return <LoginPage data={
    {
      message: searchParams.message,
      redirectUrl,
    }
  } />;
};

export default page;
