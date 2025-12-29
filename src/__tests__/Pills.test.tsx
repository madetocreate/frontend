import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Pills, type Pill } from "@/components/chat/Pills";

describe("Pills", () => {
  it("ruft onPillClick mit step_key/input_key weiter", () => {
    const onPillClick = vi.fn();
    const pill: Pill = {
      id: "pill-1",
      label: "Formal",
      value: "formal",
      step_key: "get_tone",
      input_key: "tone",
    };

    render(<Pills pills={[pill]} onPillClick={onPillClick} />);

    fireEvent.click(screen.getByText("Formal"));

    expect(onPillClick).toHaveBeenCalledTimes(1);
    expect(onPillClick).toHaveBeenCalledWith(
      expect.objectContaining({
        step_key: "get_tone",
        input_key: "tone",
        value: "formal",
      })
    );
  });

  it('"Mehr" toggelt nur UI und löst kein Input aus', () => {
    const onPillClick = vi.fn();
    const pills: Pill[] = [
      { id: "p1", label: "A", value: "a", step_key: "step_a" },
      { id: "p2", label: "B", value: "b", step_key: "step_a" },
      { id: "p3", label: "C", value: "c", step_key: "step_a" },
      { id: "p4", label: "D", value: "d", step_key: "step_a" },
    ];

    render(<Pills pills={pills} onPillClick={onPillClick} />);

    fireEvent.click(screen.getByText("Mehr"));

    expect(onPillClick).not.toHaveBeenCalled();
  });
});

