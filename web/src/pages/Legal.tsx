import type { ReactNode } from "react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/ui";

const UPDATED = "November 17, 2026";
const CONTACT = "privacy@hookboard.app";

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Nav variant="app" />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated {UPDATED}</p>
        <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        Hookboard helps creators plan social media posts. This page explains what we collect, why, and the choices you have.
        We keep it short because we collect very little.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details.</strong> If you sign in with Google or an email link, we receive your email address and a unique account ID. With Google we may also receive your name and profile picture; we don't use them for anything else.</li>
        <li><strong>What you type into the planner.</strong> Your niche, audience, goal, voice, any past captions you paste, and captions you ask us to check.</li>
        <li><strong>Saved plans.</strong> Plans you choose to save are stored in your account.</li>
        <li><strong>Basic technical data.</strong> Your IP address is used briefly to apply free-usage limits. It is held in memory and not stored in our database.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To generate your plans, hooks and caption feedback.</li>
        <li>To let you sign in and see your saved plans.</li>
        <li>To prevent abuse with hourly usage limits.</li>
      </ul>
      <p>We don't sell your data, show ads, or use your content to train AI models.</p>

      <h2>Who processes it</h2>
      <ul>
        <li><strong>Anthropic</strong> (Claude) receives what you type into the planner so it can write your plan. Anthropic does not use API inputs to train its models by default.</li>
        <li><strong>Supabase</strong> stores accounts and saved plans (hosted in Canada).</li>
        <li><strong>Google</strong> handles sign-in if you choose "Continue with Google".</li>
        <li><strong>Render</strong> hosts the Hookboard website and API.</li>
      </ul>

      <h2>Your own API key</h2>
      <p>
        If you add your own Anthropic API key in Settings, it stays in your browser tab and is sent only with your requests. We never store it.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Use the planner without an account; nothing is saved.</li>
        <li>Delete any saved plan from the Saved plans page at any time.</li>
        <li>Ask us to delete your account and all its data by emailing <a className="font-semibold text-cobalt underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
      </ul>

      <h2>Google user data</h2>
      <p>
        Hookboard's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use
        requirements. We only request your basic profile and email to sign you in.
      </p>

      <h2>Contact</h2>
      <p>Questions about privacy: <a className="font-semibold text-cobalt underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of service">
      <p>By using Hookboard you agree to these terms. If you don't agree, please don't use the service.</p>

      <h2>The service</h2>
      <p>
        Hookboard generates social media content suggestions using AI. It is offered free during beta, and features or limits may change.
        We may suspend accounts that abuse the service.
      </p>

      <h2>Your content</h2>
      <p>
        You own what you type in and the plans Hookboard writes for you. You're responsible for what you publish. Review AI-written
        suggestions before posting: they can be wrong, and you should make sure your posts follow each platform's rules and the law.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don't use Hookboard to create spam, harassment, misleading claims, or content that infringes others' rights.</li>
        <li>Don't try to break, overload or get around the service's limits.</li>
        <li>If you embed the widget on your site, don't change it to hide that it's powered by Hookboard.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        Hookboard is provided "as is", without warranties of any kind. To the extent the law allows, we aren't liable for indirect or
        consequential losses from using it, including results of posts you publish.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. We'll change the date at the top when we do; continuing to use Hookboard means you accept the update.</p>

      <h2>Contact</h2>
      <p>Questions: <a className="font-semibold text-cobalt underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalPage>
  );
}
