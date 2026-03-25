"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-white/60 mb-8 max-w-md">
          We apologize for the inconvenience. Please try again or contact support
          if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
