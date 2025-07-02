"use client";
import { MessageForm } from "../components/MessageForm";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  return (
    <main
      className="min-h-screen   flex justify-center items-center px-4 py-6 transition-colors duration-300 
      bg-white dark:bg-gradient-to-br  dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 
      text-black dark:text-white"
    >
      <div className=" max-w-7xl  mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="lg:text-[25px] md:text-2xl text-[18px] font-extrabold tracking-tight">
            🌉 Cross‑Chain Messenger
          </h1>
          <ThemeToggle />
        </div>
        <MessageForm />
      </div>
    </main>
  );
}
