import Link from 'next/link';
import { loginAction } from '../(auth)/actions';

export default function Login({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next ?? '';
  return (
    <main className="min-h-screen bg-ink text-bone grid grid-cols-12">
      <section className="col-span-12 lg:col-span-7 border-r hairline p-10 lg:p-16 flex flex-col justify-between">
        <Link href="/" className="font-display text-[22px] tracking-tightest leading-none">
          <span className="italic">V</span>eyra<span className="text-acid">.</span>
        </Link>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-4">
            Sign in
          </div>
          <h1 className="font-display text-[64px] lg:text-[96px] leading-[0.95] tracking-tightest mb-10">
            Back to <span className="italic">work</span>.
          </h1>
          <form action={loginAction} className="max-w-[420px] space-y-5">
            <input type="hidden" name="next" value={next} />
            <Field label="Email" type="email" name="email" required />
            <Field label="Password" type="password" name="password" required />
            <button
              type="submit"
              className="w-full bg-acid text-ink py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-bone transition-colors"
            >
              Continue →
            </button>
          </form>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          New here?{' '}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} className="text-bone link-grow ml-1">
            Create an account
          </Link>
        </div>
      </section>
      <aside className="hidden lg:flex col-span-5 hatch items-center justify-center p-10">
        <blockquote className="font-display italic text-[36px] leading-[1.2] max-w-[420px] text-ink-200">
          “S3ssn tracks coding context, not your code.”
        </blockquote>
      </aside>
    </main>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
        {label}
      </span>
      <input
        {...rest}
        className="mt-2 w-full bg-transparent border-b hairline focus:border-acid outline-none py-3 px-3 text-[16px]"
      />
    </label>
  );
}
