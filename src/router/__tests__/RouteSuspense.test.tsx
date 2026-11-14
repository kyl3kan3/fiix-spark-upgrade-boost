import { StrictMode, lazy } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { captureInitialPrerender } from "@/lib/initialPrerender";
import { RouteSuspense } from "../RouteSuspense";

const guidePath = "/learn/ai-native-cmms";
const initialContent = {
  pathname: guidePath,
  html: '<main data-prerender="static"><h1>AI-Native CMMS</h1><p>Existing guide content.</p><h2 id="buyer-guide">Buyer guide</h2></main>',
};

function deferredPage() {
  let resolve!: (value: { default: () => JSX.Element }) => void;
  const component = lazy(() => new Promise<{ default: () => JSX.Element }>((done) => { resolve = done; }));
  return { component, resolve: (text: string) => resolve({ default: () => <main><h1>{text}</h1></main> }) };
}

afterEach(cleanup);

describe("initial public prerender capture", () => {
  it.each([guidePath, "/landing"])("captures only the page body at %s", (pathname) => {
    const document = new DOMParser().parseFromString(`<div id="root">${initialContent.html}</div>`, "text/html");
    expect(captureInitialPrerender(document, pathname)).toEqual({ pathname, html: initialContent.html });
  });

  it.each(["/auth", "/dashboard", "/assets/123", "/not-a-real-page"])("does not retain private or unknown content at %s", (pathname) => {
    const document = new DOMParser().parseFromString(`<div id="root">${initialContent.html}</div>`, "text/html");
    expect(captureInitialPrerender(document, pathname)).toBeNull();
  });
});

describe("route loading content", () => {
  it("keeps one meaningful H1/body during a delayed chunk, then replaces it once ready", async () => {
    const deferred = deferredPage();
    const Page = deferred.component;
    render(
      <StrictMode>
        <MemoryRouter initialEntries={[guidePath]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouteSuspense initialContent={initialContent}><Page /></RouteSuspense>
        </MemoryRouter>
      </StrictMode>,
    );
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(document.querySelector('[data-prerender="static"]')?.closest('[aria-hidden="true"]')).toBeTruthy();
    expect(document.body.textContent).toContain("Existing guide content.");
    expect(document.querySelectorAll("#buyer-guide")).toHaveLength(1);
    expect(screen.queryByText("Loading page")).not.toBeInTheDocument();

    await act(async () => deferred.resolve("Interactive guide"));
    expect(screen.getByRole("heading", { level: 1, name: "Interactive guide" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(document.querySelector('[data-prerender="static"]')).toBeNull();
  });

  it("drops the initial body when navigating away and never reuses it on return", () => {
    const Guide = deferredPage().component;
    const PrivatePage = deferredPage().component;
    function Navigation() {
      const navigate = useNavigate();
      return <><button onClick={() => navigate("/dashboard")}>Dashboard</button><button onClick={() => navigate(guidePath)}>Guide</button></>;
    }
    render(
      <MemoryRouter initialEntries={[guidePath]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navigation />
        <RouteSuspense initialContent={initialContent}>
          <Routes>
            <Route path={guidePath} element={<Guide />} />
            <Route path="/dashboard" element={<PrivatePage />} />
          </Routes>
        </RouteSuspense>
      </MemoryRouter>,
    );
    expect(screen.getByText("Existing guide content.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    expect(screen.getByText("Loading page")).toBeInTheDocument();
    expect(screen.queryByText("Existing guide content.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guide" }));
    expect(screen.getByText("Loading page")).toBeInTheDocument();
    expect(screen.queryByText("Existing guide content.")).not.toBeInTheDocument();
  });
});
