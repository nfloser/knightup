export function ProfilePage({
  ready,
  backup,
  restore,
}: {
  ready: boolean;
  backup: () => void;
  restore: (file?: File) => Promise<void>;
}) {
  return (
    <>
      <div className="page-title">
        <p className="eyebrow">YOUR SPACE, YOUR DATA</p>
        <h1>Keep your progress.</h1>
        <p className="lead">Private by default. No account required.</p>
      </div>
      <section className="surface">
        <h2>Progress backup</h2>
        <p>
          Learning progress lives in this browser. Export a backup before
          switching devices or clearing browser data. Import merges completed
          exercises.
        </p>
        <div className="actions">
          <button className="primary" disabled={!ready} onClick={backup}>
            Export progress
          </button>
          <label className={`file-button ${!ready ? "disabled" : ""}`}>
            Import backup
            <input
              type="file"
              accept="application/json,.json"
              disabled={!ready}
              onChange={(e) => {
                void restore(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>
      <section className="surface">
        <h2>Install KnightUp</h2>
        <p>
          On iPhone: Safari → Share → Add to Home Screen. On Android or desktop:
          use your browser’s install option. Open once online to prepare offline
          practice.
        </p>
        <p>
          Updates are offered when available. Local progress is kept across
          deployments. Cross-device sync is not yet available.
        </p>
      </section>
      <section className="surface">
        <h2>Privacy</h2>
        <p>
          No trackers, credentials or remote coaching uploads. Static hosting
          may retain standard access logs. Exported backups contain your lesson
          completions. Store them somewhere you trust.
        </p>
      </section>
      <p>
        <a href={`${import.meta.env.BASE_URL}licenses/THIRD_PARTY.md`}>
          Open-source credits and licenses
        </a>
      </p>
    </>
  );
}
