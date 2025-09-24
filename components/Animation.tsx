"use client";

import Lottie from "lottie-react";
import animation from "../public/animation.json";

export default function Animation() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <Lottie animationData={animation} loop={true} />
    </div>
  );
}
