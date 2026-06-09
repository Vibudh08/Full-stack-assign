import { CheckCircle2, Layers3, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#16182f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 top-24 size-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-28 right-0 size-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 text-xl font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-primary">
              <Layers3 className="size-5" />
            </span>
            Taskflow
          </div>
        </div>
        <div className="relative max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
            <Sparkles className="size-3.5" />
            Built for focused work
          </div>
          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">
            Turn your plans into meaningful progress.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-indigo-100/75">
            Organize priorities, keep deadlines visible, and move every task
            forward from one calm workspace.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-indigo-50/90">
            {[
              "A clear view of everything that matters",
              "Fast, focused task management",
              "Secure access across your workflow",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-indigo-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-indigo-100/60">
          <ShieldCheck className="size-4" />
          Your workspace is private and secure.
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
