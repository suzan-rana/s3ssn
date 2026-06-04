import Link from 'next/link';
import { signupAction } from '../(auth)/actions';
import { ThemePicker } from '@/components/ThemePicker';
import { readTheme } from '@/lib/theme.server';

export default function Signup({ searchParams }: { searchParams: { next?: string } }) {
  const theme = readTheme();
  const next = searchParams.next ?? '';
  return (
    <main className="min-h-screen bg-ink text-bone grid grid-cols-12">
      <section className="col-span-12 lg:col-span-7 border-r hairline p-10 lg:p-16 flex flex-col justify-between">
        <Link href="/" className="font-display text-[22px] tracking-tightest leading-none">
          <span className="italic">V</span>eyra<span className="text-acid">.</span>
        </Link>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-4">
            Create account
          </div>
          <h1 className="font-display text-[64px] lg:text-[96px] leading-[0.95] tracking-tightest mb-10">
            Start the <span className="italic">journal</span>.
          </h1>
          <form action={signupAction} className="max-w-[420px] space-y-5">
            <input type="hidden" name="next" value={next} />
            <Field label="Name" type="text" name="name" />
            <Field label="Email" type="email" name="email" required />
            <Field label="Password" type="password" name="password" minLength={8} required />
            <button
              type="submit"
              className="w-full bg-acid text-ink py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-bone transition-colors"
            >
              Create account →
            </button>
          </form>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 max-w-[420px]">
            By signing up you agree to never have your code, keystrokes, or screen captured. That is
            our promise, not yours.
          </p>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Already have an account?{' '}
          <Link href="/login" className="text-bone link-grow ml-1">
            Sign in
          </Link>
        </div>
      </section>
      <aside className="hidden lg:flex col-span-5 hatch flex-col justify-center gap-10 p-10">
        <div className="max-w-[440px] space-y-4 text-ink-200">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
            What happens next
          </div>
          {[
            ['01', 'Install the VS Code extension'],
            ['02', 'Sign in with your dashboard token'],
            ['03', 'Start coding. Veyra does the rest.'],
          ].map(([n, t]) => (
            <div key={n} className="flex gap-4 border-b hairline pb-3">
              <span className="font-mono text-[12px] tnum text-acid">{n}</span>
              <span className="font-display text-[18px] tracking-tightest">{t}</span>
            </div>
          ))}
        </div>
        <div className="max-w-[440px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
            Pick a theme (you can change later)
          </div>
          <ThemePicker current={theme} size="sm" />
        </div>
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
