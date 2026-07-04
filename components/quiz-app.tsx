"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";

import { Formula } from "./formula";
import { createSession, getProblem } from "../lib/game";
import { SessionQuestion } from "../lib/types";

function GraphCard({
  problemId,
  state,
  onClick,
  disabled,
}: {
  problemId: string;
  state: "idle" | "correct" | "wrong" | "selected";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group rounded-[1.4rem] border bg-[var(--panel-strong)] p-2 text-left shadow-panel transition duration-200",
        "hover:-translate-y-0.5 hover:border-ink-400 hover:shadow-2xl disabled:cursor-default disabled:hover:translate-y-0",
        state === "idle" && "border-[var(--border)]",
        state === "selected" && "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]",
        state === "correct" && "border-[color:var(--success)] ring-4 ring-[rgba(15,159,110,0.18)]",
        state === "wrong" && "border-[color:var(--danger)] ring-4 ring-[rgba(214,69,69,0.18)]",
      )}
    >
      <div className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-white/85 p-1.5 dark:bg-slate-950/70">
        <img
          src={`/graphs/${problemId}.svg`}
          alt="グラフ候補"
          className="aspect-[4/3] w-full rounded-[0.8rem] object-contain"
        />
      </div>
    </button>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl items-center px-5 py-8">
      <div className="w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8">
        <div className="space-y-4 text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            関数のグラフ概形
            <br />
            4択ゲーム
          </h1>
          <p className="text-sm leading-7 text-[var(--muted)] sm:text-base">
            数式から正しい概形を選ぶ10問モードです。
          </p>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            はじめる
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <section className="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-8">
      <div className="w-full rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Result</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold">10問終了</h2>
        <p className="mt-4 text-5xl font-semibold text-[var(--accent)]">{score} / 10</p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
          代表関数の形を迷った問題は、平行移動と漸近線、極値の有無を先に見分けると安定します。
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95"
        >
          もう一度挑戦
        </button>
      </div>
    </section>
  );
}

export function QuizApp() {
  const [phase, setPhase] = useState<"start" | "playing" | "result">("start");
  const [session, setSession] = useState<SessionQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = session[index];
  const selectedProblem = selectedId ? getProblem(selectedId) : null;

  const statusText = useMemo(() => {
    if (!current || !selectedId) {
      return null;
    }

    return selectedId === current.problem.id
      ? { label: "正解！", color: "text-[color:var(--success)]" }
      : { label: "不正解！", color: "text-[color:var(--danger)]" };
  }, [current, selectedId]);

  const startGame = () => {
    setSession(createSession());
    setIndex(0);
    setSelectedId(null);
    setScore(0);
    setPhase("playing");
  };

  const handleSelect = (problemId: string) => {
    if (!current || selectedId) {
      return;
    }

    setSelectedId(problemId);
    if (problemId === current.problem.id) {
      setScore((value) => value + 1);
    }
  };

  const handleNext = () => {
    if (!current) {
      return;
    }

    if (index === session.length - 1) {
      setPhase("result");
      return;
    }

    setSelectedId(null);
    setIndex((value) => value + 1);
  };

  if (phase === "start") {
    return <StartScreen onStart={startGame} />;
  }

  if (phase === "result") {
    return <ResultScreen score={score} onRestart={startGame} />;
  }

  if (!current) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-3 py-3 sm:px-4 sm:py-4">
      <section className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Question {index + 1} / 10</p>
            <h1 className="mt-1 font-serif text-xl font-semibold sm:text-2xl">正しいグラフを1つ選んでください</h1>
          </div>
          <div className="rounded-full bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--accent)] sm:text-sm">
            正答数 {score}
          </div>
        </div>

        <div className="mt-3 rounded-[1rem] border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3">
          <Formula latex={current.problem.formula_latex} block className="overflow-x-auto text-lg sm:text-xl" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
          {current.optionIds.map((optionId) => {
            let state: "idle" | "correct" | "wrong" | "selected" = "idle";

            if (selectedId) {
              if (optionId === current.problem.id) {
                state = "correct";
              } else if (optionId === selectedId) {
                state = "wrong";
              }
            }

            return (
              <GraphCard
                key={optionId}
                problemId={optionId}
                state={state}
                disabled={Boolean(selectedId)}
                onClick={() => handleSelect(optionId)}
              />
            );
          })}
        </div>

        {selectedId && selectedProblem && statusText && (
          <div className="mt-3 rounded-[1rem] border border-[var(--border)] bg-[var(--panel-strong)] p-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <p className={clsx("text-lg font-semibold", statusText.color)}>{statusText.label}</p>
                <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">{current.problem.explanation}</p>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95"
              >
                {index === session.length - 1 ? "結果を見る" : "次へ"}
              </button>
            </div>
            <div className="mt-3 rounded-[0.9rem] border border-[var(--border)] bg-white/90 p-2 dark:bg-slate-950/70">
              <img
                src={`/graphs/${current.problem.id}.svg`}
                alt="正解のグラフ"
                className="mx-auto aspect-[4/3] w-full max-w-xl rounded-[0.75rem] object-contain"
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
