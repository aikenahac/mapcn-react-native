import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - mapcn React Native",
  description: "Privacy policy for mapcn React Native mobile application",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            <strong>Last Updated:</strong> January 8, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Introduction
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              This privacy policy applies to the mapcn React Native mobile
              application (the "App"). This policy describes how the App
              handles user information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Data Collection
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              <strong>We do not collect any personal data.</strong>
            </p>
            <p className="text-foreground/90 leading-relaxed">
              The App is designed as a demonstration and reference application
              for the mapcn React Native library. It does not collect, store,
              transmit, or share any personal information or user data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Location Data
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              The App may request permission to access your device's location
              for the purpose of displaying your current location on the map.
              This location data is:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/90">
              <li>Only used locally on your device</li>
              <li>Never transmitted to any servers</li>
              <li>Never stored or logged</li>
              <li>Never shared with third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Third-Party Services
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The App uses the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>
                <strong>MapLibre:</strong> Open-source map rendering library
              </li>
              <li>
                <strong>CARTO Basemaps:</strong> Free map tiles for displaying
                the base map
              </li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-4">
              These services may have their own privacy policies. However, the
              App does not send any personal or identifying information to these
              services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Permissions
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The App may request the following permissions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>
                <strong>Location (When in Use):</strong> To display your
                current location on the map
              </li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-4">
              You can deny these permissions at any time. The App will continue
              to function but location-dependent features will be unavailable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Data Storage
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              The App does not store any user data on your device or on any
              remote servers. All data displayed in the App is demonstration
              data included with the application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Children's Privacy
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              The App does not knowingly collect or solicit any information from
              anyone under the age of 13. The App does not collect any personal
              information from any users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update this privacy policy from time to time. Any changes
              will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              If you have any questions about this privacy policy, please
              contact us at:
            </p>
            <p className="text-foreground/90 leading-relaxed mt-4">
              <a
                href="https://github.com/aikenahac/mapcn-react-native"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Summary
            </h2>
            <div className="bg-muted/50 border border-border rounded-lg p-6">
              <p className="text-foreground font-medium mb-2">In short:</p>
              <p className="text-foreground/90 leading-relaxed">
                This App does not collect, store, or transmit any personal data.
                Location permission is only used to display your position on the
                map locally within the App. No data ever leaves your device.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
