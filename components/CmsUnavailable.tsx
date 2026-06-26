import { AlertTriangle } from "lucide-react";

const CmsUnavailable = ({ message }: { message: string }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black-100 px-4 text-white">
      <section className="max-w-2xl rounded-lg border border-amber-300/25 bg-amber-300/10 p-6 md:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-amber-100">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
          CMS unavailable
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
          Portfolio content is waiting for Supabase.
        </h1>
        <p className="mt-5 text-base leading-7 text-white-200">{message}</p>
        <p className="mt-4 text-sm leading-6 text-white-200">
          Configure the environment variables from `implement.md`, apply the
          Supabase schema and seed, then refresh this site.
        </p>
      </section>
    </main>
  );
};

export default CmsUnavailable;
