import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QuickActionsWidget } from "../components/QuickActionsWidget";

describe("QuickActionsWidget", () => {
  it("renders provided actions", () => {
    const actions = [
      {
        id: "action-1",
        title: "Test Action",
        description: "This is a test action",
      },
    ];

    render(
      <QuickActionsWidget
        title="Test Widget"
        subtitle="Sub"
        source="test"
        actions={actions}
      />
    );

    expect(screen.getByText("Test Action")).toBeInTheDocument();
  });
});
