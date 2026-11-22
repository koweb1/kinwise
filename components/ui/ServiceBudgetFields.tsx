"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { FiCheck } from "react-icons/fi";
import { BUDGET_OPTIONS, SERVICE_OPTIONS, type ServiceId } from "@/lib/contact";

export const FIELD_CLASS =
  "w-full rounded-2xl border border-white/15 bg-ink px-4 py-3.5 text-base text-white outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-white/40 focus:border-volt focus:shadow-[0_0_0_4px_rgba(217,254,27,0.15)] aria-[invalid=true]:border-red-400";

const CHIP =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt";
const CHIP_OFF = "border-white/15 text-white/80 hover:border-white/40 hover:text-white";
const CHIP_ON = "border-volt bg-volt text-ink";

type Props = {
  services: ServiceId[];
  budget: string;
  onServicesChange: (next: ServiceId[]) => void;
  onBudgetChange: (next: string) => void;
  idPrefix: string;
  error?: string;
};

export default function ServiceBudgetFields({
  services,
  budget,
  onServicesChange,
  onBudgetChange,
  idPrefix,
  error,
}: Props) {
  const budgetRef = useRef<HTMLDivElement>(null);
  const showBudget = services.length === 1;

  const toggleService = (id: ServiceId) => {
    let next: ServiceId[];

    if (id === "not-sure") {
      next = services.includes("not-sure") ? [] : ["not-sure"];
    } else {
      const others = services.filter((service) => service !== "not-sure");
      next = others.includes(id) ? others.filter((service) => service !== id) : [...others, id];
    }

    onServicesChange(next);
    // Several services (or none): the budget question goes away and its answer is cleared
    if (next.length !== 1) onBudgetChange("");
  };

  // The budget question opens and closes smoothly
  useEffect(() => {
    const element = budgetRef.current;
    if (!element) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(element, {
      height: showBudget ? "auto" : 0,
      autoAlpha: showBudget ? 1 : 0,
      duration: reduce ? 0 : 0.55,
      ease: "power3.out",
      overwrite: true,
    });
  }, [showBudget]);

  return (
    <>
      <fieldset aria-describedby={error ? `${idPrefix}-services-error` : undefined}>
        <legend className="text-sm font-medium text-white">
          What do you need? <span className="font-normal text-white/50">Choose one or more</span>
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((option) => {
            const selected = services.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleService(option.id)}
                className={`${CHIP} ${selected ? CHIP_ON : CHIP_OFF}`}
              >
                {selected && <FiCheck aria-hidden="true" />}
                {option.label}
              </button>
            );
          })}
        </div>

        {error && (
          <p id={`${idPrefix}-services-error`} role="alert" className="mt-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </fieldset>

      {/* Budget: only when exactly one service is chosen, and always optional */}
      <div
        ref={budgetRef}
        inert={!showBudget}
        style={{ height: 0, opacity: 0, visibility: "hidden" }}
        className="overflow-hidden"
      >
        <fieldset className="pt-6">
          <legend className="text-sm font-medium text-white">
            Budget <span className="font-normal text-white/50">Optional</span>
          </legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((option) => {
              const selected = budget === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onBudgetChange(selected ? "" : option)}
                  className={`${CHIP} ${selected ? CHIP_ON : CHIP_OFF}`}
                >
                  {selected && <FiCheck aria-hidden="true" />}
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </>
  );
}