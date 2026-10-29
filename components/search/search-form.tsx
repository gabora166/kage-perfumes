type SearchFormProps = {
  query?: string;
  inputId?: string;
};

export function SearchForm({ query = "", inputId = "store-search" }: SearchFormProps) {
  return (
    <form action="/search" className="flex max-w-xl border border-border bg-panel">
      <label className="sr-only" htmlFor={inputId}>
        بحث في العطور
      </label>
      <input
        id={inputId}
        name="q"
        defaultValue={query}
        maxLength={80}
        placeholder="اسم العطر أو نوتة"
        className="min-h-12 w-full bg-transparent px-4 text-sm text-ivory outline-none placeholder:text-mist"
      />
      <button type="submit" className="min-h-12 shrink-0 bg-seal px-5 text-sm text-ivory">
        ابحث
      </button>
    </form>
  );
}
