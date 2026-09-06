import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        AI Meeting Notes &amp; Action Item Extractor
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
        Paste your raw meeting notes and let AI generate a clean summary and
        actionable to-dos automatically assigned to owners, tracked to completion.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/register">
          <Button size="md">Get Started — It&apos;s Free</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="md">
            Sign In
          </Button>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">AI-Powered Summaries</h3>
          <p className="mt-1 text-sm text-gray-500">
            Automatically extract clear summaries from messy meeting notes using AI.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Action Item Tracking</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tasks, owners, and deadlines detected automatically — never miss a follow-up.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Secure &amp; Private</h3>
          <p className="mt-1 text-sm text-gray-500">
            Every account&apos;s meetings and tasks are fully isolated and secure.
          </p>
        </div>
      </div>

      {/* <p className="mt-10 text-xs text-gray-400">
        Built with FastAPI, PostgreSQL, Next.js, TypeScript, and Groq AI.
      </p> */}
    </div>
  );
}