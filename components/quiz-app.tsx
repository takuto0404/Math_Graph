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
        "group rounded-3xl border bg-[var(--panel-strong)] p-3 text-left shadow-panel transition duration-200",
        "hover:-translate-y-0.5 hover:border-ink-400 hover:shadow-2xl disabled:cursor-default disabled:hover:translate-y-0",
        state === "idle" && "border-[var(--border)]",
        state === "selected" && "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]",
        state === "correct" && "border-[color:var(--success)] ring-4 ring-[rgba(15,159,110,0.18)]",
        state === "wrong" && "border-[color:var(--danger)] ring-4 ring-[rgba(214,69,69,0.18)]",
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white/85 p-2 dark:bg-slate-950/70">
        <img
          src={`/graphs/${problemId}.svg`}
          alt="グラフ候補"
          className="aspect-[4/3] w-full rounded-xl object-contain"
        />
      </div>
    </button>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)] shadow-panel">
            数IIB〜数III / 概形トレーニング
          </span>
          <div className="space-y-4">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              関数のグラフ概形
              <br />
              4択ゲーム
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              数式を見て、4つの候補から正しい概形を選ぶ10問モードです。代表関数を厚めに収録し、前半は基礎、後半は差がつきやすい問題に寄せています。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--panel)] px-4 py-2 shadow-panel">答えた後に正解グラフを拡大表示</span>
            <span className="rounded-full bg-[var(--panel)] px-4 py-2 shadow-panel">解説は入試向けに短く</span>
            <span className="rounded-full bg-[var(--panel)] px-4 py-2 shadow-panel">履歴保存なしで気軽に反復</span>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-base font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95"
          >
            はじめる
          </button>
        </div>
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-panel backdrop-blur">
          <div className="space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Sample Question</p>
            <Formula
              latex={"f(x)=\\dfrac{1}{x-1}+2"}
              block
              className="overflow-x-auto rounded-2xl bg-[var(--accent-soft)] px-4 py-5 text-2xl"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {["rational_shifted", "rational_reciprocal", "rational_negative_shifted", "rational_reciprocal_square"].map((id) => (
                <div key={id} className="rounded-2xl border border-[var(--border)] bg-white/90 p-2 dark:bg-slate-950/70">
                  <img src={`/graphs/${id}.svg`} alt="" className="aspect-[4/3] w-full rounded-xl object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-panel backdrop-blur">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Result</p>
        <h2 className="mt-4 font-serif text-4xl font-semibold">10問終了</h2>
        <p className="mt-6 text-6xl font-semibold text-[var(--accent)]">{score} / 10</p>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          代表関数の形を迷った問題は、平行移動と漸近線、極値の有無を先に見分けると安定します。
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-base font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95"
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
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-6 sm:px-6 sm:py-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-panel backdrop-blur sm:p-7">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Question {index + 1} / 10</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold">正しいグラフを1つ選んでください</h1>
          </div>
          <div className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">
            正答数 {score}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5">
          <Formula latex={current.problem.formula_latex} block className="overflow-x-auto text-2xl sm:text-3xl" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <div className="mt-6 rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <p className={clsx("text-2xl font-semibold", statusText.color)}>{statusText.label}</p>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">{current.problem.explanation}</p>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95"
              >
                {index === session.length - 1 ? "結果を見る" : "次へ"}
              </button>
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-3 dark:bg-slate-950/70">
              <img
                src={`/graphs/${current.problem.id}.svg`}
                alt="正解のグラフ"
                className="mx-auto aspect-[4/3] w-full max-w-3xl rounded-2xl object-contain"
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
