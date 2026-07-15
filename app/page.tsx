"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";

const tabs = [
  { label: "Ask", href: "/", active: true },
  { label: "My Crew", href: "/crew" },
  { label: "Recommended", href: "/recommendations" },
];

const prompts = [
  "Find an agent that can plan a weekend trip",
  "Help me pick a marketing agent",
  "I need someone to summarize messy notes",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <main className="crt-shell relative min-h-screen overflow-hidden text-[#312d22]">
      <style>{`
        .crt-terminal-input {
          text-shadow: none;
        }

        .crt-terminal-textarea {
          color: transparent !important;
          -webkit-text-fill-color: transparent;
          text-shadow: none !important;
        }

        .crt-terminal-caret {
          display: inline-block;
          width: 0.72em;
          height: 1.18em;
          margin-left: 0.08em;
          transform: translateY(0.18em);
          background: #20380a;
          box-shadow: none;
          animation: crt-caret-blink 1.04s steps(1, end) infinite;
        }

        @keyframes crt-caret-blink {
          0%,
          46% {
            opacity: 1;
          }
          47%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 sm:px-8">
        <header className="sticky top-0 z-40 flex min-h-20 shrink-0 flex-col gap-3 rounded-b-[28px] border px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 text-left" aria-label="Curipo home">
            <span className="grid size-10 place-items-center border border-[#7db238] bg-[#c9f16c] text-sm font-black text-[#20380a]">
              C
            </span>
            <span>
              <span className="block text-lg font-black">CURIPO</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em]">
                Personal AI agent binder
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Primary">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:-translate-y-0.5 ${
                  tab.active ? "bg-[#c9f16c] text-[#20380a]" : "bg-white/55 text-[#312d22]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <div className="w-full max-w-3xl">
            <div className="mb-6 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#756f61]">
                Start with the job
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
                How can I help you?
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="border p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b px-2 pb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                  Curipo prompt
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#756f61]">
                  Search coming soon
                </p>
              </div>
              <div className="crt-terminal-input relative min-h-44">
                <div
                  aria-hidden="true"
                  className={`pointer-events-none min-h-44 whitespace-pre-wrap break-words px-2 py-5 text-xl font-semibold leading-8 ${
                    message ? "text-black" : "text-[#756f61]/60"
                  }`}
                >
                  {message || "Tell Curipo what you need..."}
                  {(inputFocused || message) && <span className="crt-terminal-caret" />}
                </div>
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Tell Curipo what you need..."
                  rows={5}
                  spellCheck={false}
                  className="crt-terminal-textarea absolute inset-0 min-h-44 w-full resize-none bg-transparent px-2 py-5 text-xl font-semibold leading-8 caret-transparent outline-none placeholder:text-transparent"
                />
              </div>
              <div className="flex flex-col gap-3 border-t px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold leading-5 text-[#756f61]">
                  This box is a placeholder for the future agent match flow.
                </p>
                <button
                  type="submit"
                  disabled
                  className="border px-5 py-3 text-sm font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Match soon
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setMessage(prompt);
                    inputRef.current?.focus();
                  }}
                  className="border bg-white/55 px-3 py-2 text-left text-xs font-bold transition hover:-translate-y-0.5 hover:bg-[#c9f16c]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
