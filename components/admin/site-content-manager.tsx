"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { saveSiteSectionAction } from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import type {
  FieldDef,
  ListFieldDef,
  SectionContent,
  SectionDef,
} from "@/lib/cms/registry";
import { cn } from "@/lib/utils";

/**
 * Schema-driven editor: one component renders the form for every registered
 * section from its field definitions, so adding a new editable section is a
 * registry entry — no new admin UI.
 */
export function SiteContentManager({
  sections,
  locale = "en",
}: {
  sections: Array<{ def: SectionDef; content: SectionContent }>;
  locale?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(
    sections[0]?.def.key ?? null,
  );

  return (
    <div className="space-y-4">
      {sections.map(({ def, content }) => (
        <SectionEditor
          key={def.key}
          def={def}
          locale={locale}
          initialContent={content}
          open={openKey === def.key}
          onToggle={() =>
            setOpenKey((current) => (current === def.key ? null : def.key))
          }
        />
      ))}
    </div>
  );
}

function SectionEditor({
  def,
  locale,
  initialContent,
  open,
  onToggle,
}: {
  def: SectionDef;
  locale: string;
  initialContent: SectionContent;
  open: boolean;
  onToggle: () => void;
}) {
  const push = useToast((s) => s.push);
  const [content, setContent] = useState<SectionContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function update(key: string, value: SectionContent[string]) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    const res = await saveSiteSectionAction(def.key, content, locale);
    setSaving(false);

    if (res?.error) {
      push(`Error: ${res.error}`);
      return;
    }
    setDirty(false);
    push(`Saved "${def.label}" (${locale.toUpperCase()}) — live on ${def.renderedOn}`);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-border dark:bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-muted/40"
      >
        <div>
          <h2 className="text-sm font-extrabold text-foreground">
            {def.label}
            {dirty && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                Unsaved changes
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {def.division === "DISPOSAL" ? "Disposal" : "Store"} · renders on{" "}
            {def.renderedOn}
          </p>
        </div>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-6 py-5 dark:border-border/60">
          <div className="space-y-5">
            {def.fields.map((field) =>
              field.type === "list" ? (
                <ListEditor
                  key={field.key}
                  field={field}
                  rows={
                    (content[field.key] as Array<Record<string, string>>) ?? []
                  }
                  onChange={(rows) => update(field.key, rows)}
                />
              ) : (
                <ScalarEditor
                  key={field.key}
                  field={field}
                  value={(content[field.key] as string) ?? ""}
                  onChange={(value) => update(field.key, value)}
                />
              ),
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-border/60">
            <p className="text-[11px] text-muted-foreground">
              Clearing a text field restores the built-in default copy.
            </p>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {saving ? "Saving…" : "Save & publish"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ScalarEditor({
  field,
  value,
  onChange,
}: {
  field: Exclude<FieldDef, ListFieldDef>;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `cms-${field.key}`;
  const shared =
    "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[#2E6F40]";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-muted-foreground">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, "resize-y")}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
    </div>
  );
}

function ListEditor({
  field,
  rows,
  onChange,
}: {
  field: ListFieldDef;
  rows: Array<Record<string, string>>;
  onChange: (rows: Array<Record<string, string>>) => void;
}) {
  function updateRow(index: number, key: string, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addRow() {
    onChange([
      ...rows,
      Object.fromEntries(field.itemFields.map((f) => [f.key, ""])),
    ]);
  }

  return (
    <fieldset className="rounded-xl border border-slate-200 p-4 dark:border-border">
      <legend className="px-1.5 text-xs font-bold text-muted-foreground">
        {field.label}
      </legend>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-lg bg-slate-50/80 p-3 dark:bg-muted/40"
          >
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {field.itemFields.map((itemField) => (
                <div
                  key={itemField.key}
                  className={cn(
                    itemField.type === "textarea" && "sm:col-span-2",
                  )}
                >
                  {itemField.type === "textarea" ? (
                    <textarea
                      rows={2}
                      value={row[itemField.key] ?? ""}
                      onChange={(e) =>
                        updateRow(index, itemField.key, e.target.value)
                      }
                      placeholder={itemField.label}
                      aria-label={`${field.label} ${index + 1} — ${itemField.label}`}
                      className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                    />
                  ) : (
                    <input
                      value={row[itemField.key] ?? ""}
                      onChange={(e) =>
                        updateRow(index, itemField.key, e.target.value)
                      }
                      placeholder={itemField.label}
                      aria-label={`${field.label} ${index + 1} — ${itemField.label}`}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-background disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="Move down"
                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-background disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Remove ${field.itemNoun}`}
                className="grid size-7 place-items-center rounded-md border border-border text-red-500 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2E6F40]/40 px-3.5 py-2 text-xs font-bold text-[#2E6F40] transition-colors hover:bg-[#2E6F40]/5"
      >
        <Plus className="size-3.5" />
        Add {field.itemNoun}
      </button>
    </fieldset>
  );
}
