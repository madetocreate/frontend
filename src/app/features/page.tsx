/* eslint-disable @next/next/no-img-element */
'use client'

import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'

const primaryFeatures = [
  {
    name: 'Modulare System-Bausteine',
    description:
      'Baue wiederverwendbare Flows für Support, Operations und Produkt – ohne jedes Mal bei Null zu starten.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Sichere Automationen',
    description:
      'Logging, Freigaben und Rückfallpfade sorgen dafür, dass deine KI-Flows stabil laufen und nachvollziehbar bleiben.',
    icon: LockClosedIcon,
  },
  {
    name: 'Versionierte Playbooks',
    description:
      'Halte Varianten von Prompts, Workflows und Systemlogik fest und rolle Updates kontrolliert in dein Team aus.',
    icon: ServerIcon,
  },
]

const secondaryFeatures = [
  {
    name: 'Tokens & Wissensräume',
    description:
      'Mappe Texte, Prozesse und Daten über Tokens, damit dein System konsistent bleibt – auch wenn Inhalte sich ändern.',
    href: '#',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Integrationen',
    description:
      'Verbinde Aklow mit deinen bestehenden Tools und Datenquellen statt alles in ein neues System zu migrieren.',
    href: '#',
    icon: LockClosedIcon,
  },
  {
    name: 'Monitoring & Iteration',
    description:
      'Beobachte, wie deine Flows im Alltag genutzt werden, und justiere sie an zentraler Stelle nach.',
    href: '#',
    icon: ArrowPathIcon,
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _featuredTestimonial = {
  body:
    'Mit Aklow konnten wir aus einem Experiment ein wartbares System bauen. Änderungen passieren jetzt an einer Stelle – statt in zig Docs und Skripten.',
  author: {
    name: 'Brenna Goyette',
    handle: 'ops-lead',
    imageUrl:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80',
    logoUrl: 'https://tailwindcss.com/plus-assets/img/logos/savvycal-logo-gray-900.svg',
  },
}

const testimonials = [
  [
    [
      {
        body:
          'Wir haben mit Aklow unseren Support-Backlog reduziert, ohne ein neues Ticket-System bauen zu müssen.',
        author: {
          name: 'Leslie Alexander',
          handle: 'lesliealexander',
          imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Die wichtigsten Flows liegen jetzt in Aklow – Änderungen sind in Minuten statt in Tagen live.',
        author: {
          name: 'Michael Foster',
          handle: 'michaelfoster',
          imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Wir konnten unser internes Wiki mit System-Tokens entlasten – weniger Pflegeaufwand, mehr Klarheit.',
        author: {
          name: 'Dries Vincent',
          handle: 'driesvincent',
          imageUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body:
          'Aklow war der erste Ansatz, bei dem wir KI wirklich an bestehende Systeme andocken konnten.',
        author: {
          name: 'Lindsay Walton',
          handle: 'lindsaywalton',
          imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Wir testen neue Ideen jetzt in einem dedizierten Workspace, bevor sie ins laufende System wandern.',
        author: {
          name: 'Courtney Henry',
          handle: 'courtneyhenry',
          imageUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
  ],
  [
    [
      {
        body:
          'Durch die wiederverwendbaren Module ist unser Setup deutlich weniger fehleranfällig geworden.',
        author: {
          name: 'Tom Cook',
          handle: 'tomcook',
          imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Wir können heute klare System-Grenzen ziehen: Was ist Prozess, was ist KI, was ist Mensch.',
        author: {
          name: 'Whitney Francis',
          handle: 'whitneyfrancis',
          imageUrl:
            'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body:
          'Das Monitoring in Aklow hilft uns, Engpässe in den Flows früh zu erkennen.',
        author: {
          name: 'Leonard Krasner',
          handle: 'leonardkrasner',
          imageUrl:
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Wir sind von „KI-Experimenten“ zu einem geordneten System mit klarer Roadmap gekommen.',
        author: {
          name: 'Floyd Miles',
          handle: 'floydmiles',
          imageUrl:
            'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      {
        body:
          'Neue Kolleg:innen verstehen den Setup schneller, weil die Flows in Aklow visibel sind.',
        author: {
          name: 'Emily Selman',
          handle: 'emilyselman',
          imageUrl:
            'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
  ],
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function FeaturesPage() {
  return (
    <div className="bg-[var(--ak-color-bg-app)]">
      <main>
        <div className="relative isolate pt-24 sm:pt-32">
          {/* Background Gradient */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[var(--ak-color-primary)] to-[var(--ak-color-accent-purple)] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                 style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <div className="flex">
                <div className="relative flex items-center gap-x-4 rounded-full bg-[var(--ak-color-bg-surface)] px-4 py-1 text-sm leading-6 text-[var(--ak-color-text-secondary)] ring-1 ring-[var(--ak-color-border-subtle)] hover:ring-[var(--ak-color-border-default)] transition-all">
                  <span className="font-semibold text-[var(--ak-color-primary)]">Features & Module</span>
                  <span aria-hidden="true" className="h-4 w-px bg-[var(--ak-color-border-subtle)]" />
                  <span>Bausteine im Aklow-System</span>
                </div>
              </div>
              <h1 className="mt-10 text-5xl font-bold tracking-tight text-[var(--ak-color-text-primary)] sm:text-7xl ak-heading">
                Features für dein laufendes System – nicht nur für Demos.
              </h1>
              <p className="mt-8 text-lg leading-8 text-[var(--ak-color-text-secondary)]">
                Aklow bündelt deine KI-Flows, Prompts und Integrationen in einem System-Layer. Statt Einzellösungen
                bekommst du wiederverwendbare Bausteine, die in deinem Alltag stabil laufen – von der Analyse bis zur
                Ausführung.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="#primary-features"
                  className="rounded-xl bg-[var(--ak-color-primary)] px-5 py-3 text-sm font-semibold shadow-sm hover:bg-[var(--ak-color-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ak-color-primary)] transition-all"
                  style={{ color: 'var(--ak-text-primary-dark)' }}
                >
                  Features entdecken
                </a>
                <a href="#secondary-features" className="text-sm font-semibold leading-6 text-[var(--ak-color-text-primary)] flex items-center gap-1 group">
                  Systembereiche ansehen <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
            {/* Image Section - Stylized */}
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:shrink-0 lg:grow">
               <div className="relative w-full max-w-[600px] aspect-[9/16] mx-auto rounded-[var(--ak-radius-2xl)] bg-[#1D1D1F] border-4 border-[#2D2D2F] shadow-2xl overflow-hidden">
                   {/* Mock UI for Aklow App */}
                   <div className="absolute top-0 left-0 right-0 h-14 bg-[#2D2D2F] flex items-center justify-center">
                      <div className="w-20 h-6 bg-[var(--ak-color-graphite-base)] rounded-full" />
                   </div>
                   <div className="p-6 pt-20 space-y-4">
                      <div className="flex justify-between items-center">
                         <div className="w-10 h-10 rounded-full bg-[var(--ak-color-primary)] opacity-80" />
                         <div className="w-8 h-8 rounded-full bg-[var(--ak-color-graphite-base)]" />
                      </div>
                      <div className="h-32 bg-[var(--ak-color-bg-surface-muted)] rounded-2xl animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-[var(--ak-color-bg-surface-muted)] rounded w-3/4" />
                        <div className="h-4 bg-[var(--ak-color-bg-surface-muted)] rounded w-1/2" />
                      </div>
                       <div className="grid grid-cols-2 gap-4 pt-4">
                         <div className="h-24 bg-[var(--ak-color-bg-surface-muted)] rounded-xl" />
                         <div className="h-24 bg-[var(--ak-color-bg-surface-muted)] rounded-xl" />
                       </div>
                   </div>
               </div>
            </div>
          </div>
        </div>

        {/* Primary Features */}
        <div id="primary-features" className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-[#1D1D1F] px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
              <div className="lg:row-start-2 lg:max-w-md">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl ak-heading" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  Die Kern-Bausteine deines Aklow-Systems.
                </h2>
                <p className="mt-6 text-lg leading-8 text-[var(--ak-color-text-secondary)]">
                  Jeder Baustein ist so gedacht, dass er in deinem Alltag wiederverwendbar ist: einmal sauber gebaut,
                  dann über Tokens und Konfiguration an neue Use-Cases angepasst.
                </p>
              </div>
              <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-[var(--ak-surface-1)]/10 lg:pt-10">
                <dl className="max-w-xl space-y-8 text-base leading-7 text-[var(--ak-color-text-secondary)] lg:max-w-none">
                  {primaryFeatures.map((feature) => (
                    <div key={feature.name} className="relative">
                      <dt className="ml-9 inline-block font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                        <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-[var(--ak-color-primary)]" />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Features */}
        <div id="secondary-features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-[var(--ak-color-primary)]">Systembereiche</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--ak-color-text-primary)] sm:text-5xl ak-heading">
              Alles, was du für produktive KI-Systeme brauchst.
            </p>
            <p className="mt-6 text-lg leading-8 text-[var(--ak-color-text-secondary)]">
              Aklow ist kein einzelner Bot, sondern ein System aus Modulen: Wissensräume, Tokens, Integrationen und
              Flows greifen ineinander, damit du nicht in Tool-Wildwuchs landest.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {secondaryFeatures.map((feature) => (
                <div key={feature.name} className="flex flex-col bg-[var(--ak-color-bg-surface)] p-6 rounded-2xl border border-[var(--ak-color-border-subtle)] shadow-sm hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold text-[var(--ak-color-text-primary)]">
                    <feature.icon aria-hidden="true" className="h-5 w-5 flex-none text-[var(--ak-color-primary)]" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[var(--ak-color-text-secondary)]">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <a href={feature.href} className="text-sm font-semibold leading-6 text-[var(--ak-color-primary)] hover:text-[var(--ak-color-primary-hover)] flex items-center gap-1">
                        Mehr erfahren <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
            {/* Reuse existing component logic but ensure backgrounds match */}
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold text-[var(--ak-color-primary)]">Stimmen aus Projekten</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--ak-color-text-primary)] sm:text-5xl ak-heading">
                  Wie Aklow in der Praxis wirkt.
                </p>
              </div>
            {/* Render testimonials grid (simplified for tokens) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.flat().flat().map((t, i) => (
                     <figure key={i} className="rounded-2xl bg-[var(--ak-color-bg-surface)] p-6 shadow-sm ring-1 ring-[var(--ak-color-border-subtle)]">
                        <blockquote className="text-[var(--ak-color-text-primary)]">
                          <p>{`“${t.body}”`}</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-x-4">
                              <img
                                alt=""
                            src={t.author.imageUrl}
                            className="h-10 w-10 rounded-full ak-bg-surface-2"
                              />
                              <div>
                            <div className="font-semibold text-[var(--ak-color-text-primary)]">{t.author.name}</div>
                            <div className="text-[var(--ak-color-text-muted)]">{`@${t.author.handle}`}</div>
                              </div>
                            </figcaption>
                          </figure>
                        ))}
          </div>
        </div>
      </main>
    </div>
  )
}
