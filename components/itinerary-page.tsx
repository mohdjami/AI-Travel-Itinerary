"use client";

import { useState } from "react";
import TravelItineraryForm from "./forms/travel-form";
import { RequestCredits } from "./request-credits";
const ItineraryHome = ({ email, initialCredits }: {email: string; initialCredits: number }) => {
  const [credits, setCredits] = useState(initialCredits);

  return (
    <TravelItineraryForm email={email} initialCredits={credits} setCredits={setCredits} />
  );
};

export default ItineraryHome;
