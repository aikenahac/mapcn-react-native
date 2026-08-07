import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsLink,
} from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routes",
};

export default function RoutesPage() {
  const routeSource = getExampleSource("route-example");
  const osrmRouteSource = getExampleSource("osrm-route-example");

  return (
    <DocsLayout
      title="Routes"
      description="Draw polylines and paths connecting coordinates on the map."
      prev={{ title: "Popups", href: "/docs/popups" }}
      next={{ title: "Clusters", href: "/docs/clusters" }}
    >
      <DocsSection>
        <p>
          Use <DocsCode>MapRoute</DocsCode> to draw polylines connecting a series of
          coordinates. Perfect for showing directions, trails, delivery routes, or
          any path between points. Routes are drawn using native MapLibre layers
          for optimal performance.
        </p>
      </DocsSection>

      <DocsSection title="Basic Route">
        <p>Draw a route with numbered stop markers along the path.</p>
      </DocsSection>

      <ComponentPreview code={routeSource} screenshotName="route.png" qrCodeName="route.png" />

      <DocsSection title="Route Planning">
        <p>
          Display multiple route options and let users select between them. This
          example fetches real driving directions from the{" "}
          <DocsLink href="https://project-osrm.org/" external>
            OSRM API
          </DocsLink>
          . Press on a route or use the buttons to switch.
        </p>
      </DocsSection>

      <ComponentPreview
        code={osrmRouteSource}
        screenshotName="osrm-route.png"
        qrCodeName="osrm-route.png"
        className="h-[500px]"
      />
    </DocsLayout>
  );
}
