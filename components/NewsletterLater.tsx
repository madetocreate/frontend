export default function NewsletterLater() {
  return (
    <section className="bg-[var(--ak-color-bg-surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-[var(--ak-color-graphite-base)] px-6 py-24 shadow-[var(--ak-elev-4)] sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-[var(--ak-color-text-inverted)] sm:text-5xl">
            Updates zu Aklow und neuen System-Features
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-center text-lg text-[var(--ak-color-text-secondary)]">
            Produkt-Updates, Roadmap-Einblicke und ausgewählte Learnings aus echten Projekten – kompakt und ohne Spam.
          </p>
          <form className="mx-auto mt-10 flex max-w-md gap-x-4">
            <label htmlFor="newsletter-email-later" className="sr-only">
              Email-Adresse
            </label>
            <input
              id="newsletter-email-later"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-[var(--ak-color-text-inverted)] outline-1 -outline-offset-1 outline-white/10 placeholder:text-[var(--ak-color-text-muted)] focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--ak-color-accent)] sm:text-sm/6"
            />
            <button
              type="submit"
              className="flex-none rounded-md bg-[var(--ak-color-bg-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--ak-color-text-primary)] shadow-[var(--ak-elev-1)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ak-color-accent)]"
            >
              Benachrichtigen
            </button>
          </form>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2"
          >
            <circle r={512} cx={512} cy={512} fill="url(#newsletter-later-gradient)" fillOpacity="0.7" />
            <defs>
              <radialGradient
                r={1}
                cx={0}
                cy={0}
                id="newsletter-later-gradient"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(512 512) rotate(90) scale(512)"
              >
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  )
}
