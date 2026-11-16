export function Knight({ white = false }: { white?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`knight ${white ? "white-knight" : ""}`}
    >
      <path d="M22 85h57v-9H65c0-18 11-25 9-42L57 13l-2 15-18 10-15 20 15 7 14-15c3 11-12 16-11 26H22z" />
      <circle cx="55" cy="38" r="2.5" />
    </svg>
  );
}
