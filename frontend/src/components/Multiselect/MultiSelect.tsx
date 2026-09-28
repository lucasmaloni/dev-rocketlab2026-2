import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./MultiSelect.module.css";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  loading?: boolean;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  loading = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const labelByValue = new Map(options.map((option) => [option.value, option.label]));

  return (
    <div
      className={styles.root}
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <span className={styles.label} id={labelId}>
        {label}
      </span>

      <button
        type="button"
        className={styles.trigger}
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected.length === 0 ? styles.placeholder : undefined}>
          {selected.length === 0 ? placeholder : `${selected.length} selecionado(s)`}
        </span>
        <ChevronDown size={18} className={open ? styles.chevronOpen : undefined} />
      </button>

      {selected.length > 0 && (
        <ul className={styles.chips}>
          {selected.map((value) => {
            const optionLabel = labelByValue.get(value) ?? value;
            return (
              <li key={value} className={styles.chip}>
                {optionLabel}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remover ${optionLabel}`}
                  onClick={() => toggle(value)}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div className={styles.panel} id={panelId} role="group" aria-labelledby={labelId}>
          {loading ? (
            <p className={styles.panelMessage}>Carregando...</p>
          ) : options.length === 0 ? (
            <p className={styles.panelMessage}>Nenhuma opção disponível.</p>
          ) : (
            options.map((option) => (
              <label key={option.value} className={styles.option}>
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                />
                {option.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
