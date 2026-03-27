'use client';

import { useAppStore } from '@/store/useAppStore';
import {
  TECHNIQUE_OPTIONS,
  GUARD_OPTIONS,
  PERSONA_OPTIONS,
} from '@/lib/prompts';
import type { ModelId, PromptOption } from '@/types';
import styles from './SettingsPanel.module.css';

const MODEL_OPTIONS: { value: ModelId; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
];

interface PromptSectionProps {
  title: string;
  options: PromptOption[];
  value: string;
  onChange: (v: string) => void;
}

function PromptSection({
  title,
  options,
  value,
  onChange,
}: PromptSectionProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className={styles.promptRow}>
      <p className={styles.promptLabel}>{title}</p>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={title}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {selected && selected.description && (
        <div className={styles.descBox}>{selected.description}</div>
      )}
    </div>
  );
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  decimals?: number;
}

function Slider({ label, min, max, step, value, onChange, decimals = 1 }: SliderProps) {
  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderLabel}>
        <span className={styles.sliderName}>{label}</span>
        <span className={styles.sliderValue}>{value.toFixed(decimals)}</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
}

export function SettingsPanel() {
  const {
    model,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    techniqueValue,
    personaValue,
    guardValue,
    messages,
    totalTokensUsed,
    sessionTopicsVisited,
    updateSettings,
    resetSession,
  } = useAppStore();

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <aside className={styles.panel}>
      <div className={styles.stickyHeader}>
        <span className={styles.headerTitle}>Settings</span>
      </div>

      <div className={styles.scrollBody}>
        {/* ── Persona ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Persona</p>
          <PromptSection
            title=""
            options={PERSONA_OPTIONS}
            value={personaValue}
            onChange={(v) => updateSettings({ personaValue: v })}
          />
        </div>

        {/* ── Model ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Model</p>
          <select
            className={styles.select}
            value={model}
            onChange={(e) => updateSettings({ model: e.target.value as ModelId })}
            aria-label="Select model"
          >
            {MODEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Parameters ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Parameters</p>
          <Slider
            label="Temperature"
            min={0}
            max={2}
            step={0.05}
            value={temperature}
            onChange={(v) => updateSettings({ temperature: v })}
          />
          <Slider
            label="Max Tokens"
            min={128}
            max={4096}
            step={64}
            value={maxTokens}
            onChange={(v) => updateSettings({ maxTokens: v })}
            decimals={0}
          />
          <Slider
            label="Top P"
            min={0}
            max={1}
            step={0.01}
            value={topP}
            onChange={(v) => updateSettings({ topP: v })}
            decimals={2}
          />
          <Slider
            label="Freq. Penalty"
            min={-2}
            max={2}
            step={0.05}
            value={frequencyPenalty}
            onChange={(v) => updateSettings({ frequencyPenalty: v })}
          />
        </div>

        {/* ── Prompt Technique ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Prompt Technique</p>
          <PromptSection
            title=""
            options={TECHNIQUE_OPTIONS}
            value={techniqueValue}
            onChange={(v) => updateSettings({ techniqueValue: v })}
          />
        </div>

        {/* ── Safety Guard ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Safety Guard</p>
          <PromptSection
            title=""
            options={GUARD_OPTIONS}
            value={guardValue}
            onChange={(v) => updateSettings({ guardValue: v })}
          />
        </div>

        {/* ── Session Stats ── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Session Stats</p>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{visibleMessages.length}</div>
              <div className={styles.statLabel}>Messages</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{sessionTopicsVisited.length}</div>
              <div className={styles.statLabel}>Topics visited</div>
            </div>
            <div className={styles.statCardWide}>
              <div className={styles.statValue}>{totalTokensUsed.toLocaleString()}</div>
              <div className={styles.statLabel}>Tokens used (est.)</div>
            </div>
          </div>
        </div>
      </div>

      <button
        className={styles.resetBtn}
        onClick={resetSession}
        title="Clear current session messages and stats"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset session
      </button>
    </aside>
  );
}
