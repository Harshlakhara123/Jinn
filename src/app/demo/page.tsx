"use client";

import { Button } from "@/components/ui/button";
import { se } from "date-fns/locale";
import { useState } from "react";

export default function DemoPage(){

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleBlocking = async () => {
    setLoading(true);
    await fetch('/api/demo/blocking', {
      method: 'POST',
    });
    setLoading(false);
  };

  const handleBackground = async () => {
    setLoading2(true);
    await fetch('/api/demo/background', {
      method: 'POST',
    });
    setLoading2(false);
  };

  return (
    <div className="p-8 space-x-4">
      <button disabled={loading} onClick={handleBlocking}>
        {loading ? 'loading...' : 'Blocking'}
      </button>
      <button disabled={loading2} onClick={handleBackground}>
        {loading2 ? 'loading...' : 'Background'}
      </button>
    </div>
  );
};