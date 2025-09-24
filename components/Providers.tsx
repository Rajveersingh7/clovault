"use client";

import {NotificationProvider} from "@/components/Notification";
import type {ReactNode} from "react";

export default function Providers({children}: {children: ReactNode}) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
