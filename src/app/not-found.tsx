import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">We could not find that page or product.</p>
      <Link href="/" className="btn-primary mt-4">
        Back home
      </Link>
    </div>
  );
}
