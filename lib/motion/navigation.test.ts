import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveInternalNavTarget,
  resolveTransitionIntensity,
  stripTrailingSlash,
} from "@/lib/motion/navigation";

describe("stripTrailingSlash", () => {
  it("keeps root and strips trailing slashes elsewhere", () => {
    assert.equal(stripTrailingSlash("/"), "/");
    assert.equal(stripTrailingSlash("/catalog/"), "/catalog");
  });
});

describe("resolveTransitionIntensity", () => {
  it("uses soft intensity around checkout and track", () => {
    assert.equal(resolveTransitionIntensity("/", "/checkout"), "soft");
    assert.equal(resolveTransitionIntensity("/catalog", "/track"), "soft");
    assert.equal(resolveTransitionIntensity("/checkout", "/catalog"), "soft");
  });

  it("uses ninja intensity for typical storefront moves", () => {
    assert.equal(resolveTransitionIntensity("/", "/catalog"), "ninja");
    assert.equal(resolveTransitionIntensity("/catalog", "/catalog/layl-al-anbar"), "ninja");
    assert.equal(resolveTransitionIntensity("/blend", "/discovery"), "ninja");
  });
});

describe("resolveInternalNavTarget", () => {
  const origin = "https://example.com";
  const baseEvent = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };

  function anchor(attrs: Record<string, string>): HTMLAnchorElement {
    const el = { getAttribute: (name: string) => attrs[name] ?? null } as HTMLAnchorElement;
    Object.defineProperty(el, "target", { value: attrs.target ?? "" });
    el.hasAttribute = (name: string) => Object.prototype.hasOwnProperty.call(attrs, name);
    Object.defineProperty(el, "dataset", {
      value: attrs["data-no-transition"] ? { noTransition: "true" } : {},
    });
    return el;
  }

  it("accepts a same-origin catalog hop", () => {
    const actual = resolveInternalNavTarget(
      anchor({ href: "/catalog" }),
      baseEvent,
      origin,
      "/",
      "",
    );
    assert.deepEqual(actual, { href: "/catalog", pathname: "/catalog", search: "", hash: "" });
  });

  it("ignores modifier clicks, blanks, downloads, and mailto", () => {
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/catalog" }), { ...baseEvent, metaKey: true }, origin, "/", ""),
      null,
    );
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/catalog", target: "_blank" }), baseEvent, origin, "/", ""),
      null,
    );
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/file.pdf", download: "" }), baseEvent, origin, "/", ""),
      null,
    );
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "mailto:atelier@ateeqperfumes.com" }), baseEvent, origin, "/", ""),
      null,
    );
  });

  it("ignores query-only changes and identical urls", () => {
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/catalog?family=woody" }), baseEvent, origin, "/catalog", ""),
      null,
    );
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/catalog" }), baseEvent, origin, "/catalog", ""),
      null,
    );
  });

  it("ignores admin and external urls", () => {
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "/admin/orders" }), baseEvent, origin, "/", ""),
      null,
    );
    assert.equal(
      resolveInternalNavTarget(anchor({ href: "https://other.test/catalog" }), baseEvent, origin, "/", ""),
      null,
    );
  });
});
