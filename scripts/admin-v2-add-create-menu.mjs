import fs from "node:fs";

const file = "app/page.tsx";
let source = fs.readFileSync(file, "utf8");

const eol = source.includes("\r\n") ? "\r\n" : "\n";

function replaceOnce(label, from, to) {
  from = from.replace(/\r?\n/g, eol);
  to = to.replace(/\r?\n/g, eol);

  if (!source.includes(from)) {
    throw new Error(`Cannot find target: ${label}`);
  }

  source = source.replace(from, to);
}

if (source.includes("admin-v2-create-entry-button")) {
  console.log("Admin V2 create menu already exists. Nothing changed.");
  process.exit(0);
}

replaceOnce(
  "create menu state",
  `  const [managedProductId, setManagedProductId] = useState<number | null>(null);`,
  `  const [managedProductId, setManagedProductId] = useState<number | null>(null);
  const [isAdminCreateMenuOpen, setIsAdminCreateMenuOpen] = useState(false);`
);

replaceOnce(
  "close create menu when edit mode ends",
  `      if (!enabled) {
        setManagedProductId(null);
      }`,
  `      if (!enabled) {
        setManagedProductId(null);
        setIsAdminCreateMenuOpen(false);
      }`
);

replaceOnce(
  "drawer create button",
  `            </nav>

            <button
              type="button"
              className="drawer-line-button"`,
  `            </nav>

            {isAdminMode && isAdminEditMode && (
              <button
                type="button"
                className="admin-v2-create-entry-button"
                onClick={() => setIsAdminCreateMenuOpen(true)}
              >
                <span className="admin-v2-create-entry-plus">+</span>
                <span>\u65b0\u589e\u5167\u5bb9</span>
              </button>
            )}

            <button
              type="button"
              className="drawer-line-button"`
);

replaceOnce(
  "create bottom sheet portal",
  `          </aside>
        </section>
      )}

      <section className="dragon-hero-v330 dragon-hero-v340"`,
  `          </aside>
        </section>
      )}

      {isAdminMode &&
        isAdminEditMode &&
        isAdminCreateMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="admin-v2-create-backdrop"
            role="presentation"
            onClick={() => setIsAdminCreateMenuOpen(false)}
          >
            <section
              className="admin-v2-create-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-v2-create-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-v2-create-handle" aria-hidden="true" />

              <div className="admin-v2-create-header">
                <div>
                  <span className="admin-v2-create-kicker">\u65b0\u589e</span>
                  <h2 id="admin-v2-create-title">\u65b0\u589e\u5167\u5bb9</h2>
                </div>

                <button
                  type="button"
                  className="admin-v2-create-close"
                  aria-label="\u95dc\u9589\u65b0\u589e\u5167\u5bb9"
                  onClick={() => setIsAdminCreateMenuOpen(false)}
                >
                  \u00d7
                </button>
              </div>

              <div className="admin-v2-create-options">
                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>\u5546\u54c1</strong>
                    <small>\u65b0\u589e\u4e00\u822c\u6216\u7d44\u5408\u5546\u54c1</small>
                  </span>
                </button>

                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>\u7cfb\u5217</strong>
                    <small>\u5728\u6307\u5b9a\u5206\u985e\u4e0b\u5efa\u7acb\u65b0\u7cfb\u5217</small>
                  </span>
                </button>

                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>\u5206\u985e</strong>
                    <small>\u5efa\u7acb\u65b0\u7684\u5546\u54c1\u5206\u985e</small>
                  </span>
                </button>
              </div>

              <p className="admin-v2-create-preview-note">
                \u76ee\u524d\u5148\u78ba\u8a8d\u65b0\u589e\u5165\u53e3\u7684\u4f4d\u7f6e\u8207\u64cd\u4f5c\u624b\u611f
              </p>

              <button
                type="button"
                className="admin-v2-create-cancel"
                onClick={() => setIsAdminCreateMenuOpen(false)}
              >
                \u53d6\u6d88
              </button>
            </section>
          </div>,
          document.body
        )}

      <section className="dragon-hero-v330 dragon-hero-v340"`
);

replaceOnce(
  "create menu styles",
  `        .hero-section {
          display: grid;`,
  `        .admin-v2-create-entry-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 52px;
          margin-top: 14px;
          padding: 0 18px;
          border: 1.5px dashed rgba(154, 48, 66, 0.52);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.82);
          color: #8f2b3c;
          font-family: inherit;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(84, 44, 37, 0.06);
        }

        .admin-v2-create-entry-plus {
          display: inline-grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #9a3042;
          color: #fff;
          font-size: 19px;
          line-height: 1;
          font-weight: 700;
        }

        .admin-v2-create-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 18px 14px 0;
          background: rgba(45, 30, 25, 0.42);
          backdrop-filter: blur(3px);
        }

        .admin-v2-create-sheet {
          width: min(100%, 520px);
          max-height: min(82vh, 650px);
          overflow-y: auto;
          padding: 10px 18px 22px;
          border: 1px solid rgba(154, 48, 66, 0.13);
          border-bottom: 0;
          border-radius: 30px 30px 0 0;
          background: #fffaf6;
          box-shadow: 0 -20px 55px rgba(57, 35, 29, 0.2);
        }

        .admin-v2-create-handle {
          width: 44px;
          height: 5px;
          margin: 1px auto 15px;
          border-radius: 999px;
          background: rgba(76, 52, 43, 0.18);
        }

        .admin-v2-create-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .admin-v2-create-kicker {
          display: block;
          margin-bottom: 3px;
          color: #9a3042;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .admin-v2-create-header h2 {
          margin: 0;
          color: #432f29;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 950;
        }

        .admin-v2-create-close {
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(80, 55, 46, 0.12);
          border-radius: 999px;
          background: #fff;
          color: #4b352d;
          font: inherit;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .admin-v2-create-options {
          display: grid;
          gap: 10px;
        }

        .admin-v2-create-options > button {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 70px;
          padding: 12px 14px;
          border: 1px solid rgba(154, 48, 66, 0.14);
          border-radius: 19px;
          background: #fff;
          color: #49332c;
          font-family: inherit;
          text-align: left;
        }

        .admin-v2-create-options > button:disabled {
          opacity: 1;
          cursor: default;
        }

        .admin-v2-create-option-icon {
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: #f7e7e9;
          color: #9a3042;
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
        }

        .admin-v2-create-options strong,
        .admin-v2-create-options small {
          display: block;
        }

        .admin-v2-create-options strong {
          margin-bottom: 3px;
          font-size: 16px;
          font-weight: 950;
        }

        .admin-v2-create-options small {
          color: #856f66;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-v2-create-preview-note {
          margin: 13px 4px 0;
          color: #9a8278;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .admin-v2-create-cancel {
          width: 100%;
          min-height: 48px;
          margin-top: 14px;
          border: 0;
          border-radius: 16px;
          background: #eee6e0;
          color: #5c443b;
          font-family: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .hero-section {
          display: grid;`
);

fs.writeFileSync(file, source, "utf8");

console.log("Added Admin V2 create-content UI to app/page.tsx");
