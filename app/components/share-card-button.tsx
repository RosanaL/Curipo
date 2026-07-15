"use client";

import { useState } from "react";

export function ShareCardButton({ title, text, className = "" }: { title: string; text?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className={className}
      style={{
        border: "3px solid #4a3421",
        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
        background: "#f4a261",
        color: "#4a3421",
      }}
    >
      {copied ? "Link copied ♥" : "Share this card"}
    </button>
  );
}
