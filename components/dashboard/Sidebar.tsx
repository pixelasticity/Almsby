import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import {
  getOwnedBusiness,
  getRecentProducts,
  type RecentProduct,
} from "@/lib/products/queries";
import styles from "./sidebar.module.css";
import MenuButton from "./MenuButton";
import SidebarLink from "./SidebarLink";
import AccountChip from "./AccountChip";

/** Maker dashboard side bar: brand, primary nav links, sign-out. */
export default async function Sidebar() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();
  // Null while onboarding is pending — the button still renders, the name
  // falls back until the Business row exists. Recent products (4, its query
  // default) run in parallel with the business fetch: independent reads, so
  // this adds no wall-clock latency.
  const [business, recent] = user
    ? await Promise.all([
        // Fail-closed: a DB hiccup here must not take down the whole sidebar,
        // so the workspace name falls back to its translated default below.
        // The original error is still logged — never swallowed silently
        // (AGENTS.md rule 1).
        getOwnedBusiness(user.id).catch((error: unknown) => {
          console.error("[sidebar] business query failed", error);
          return null;
        }),
        // Fail-closed: a DB hiccup must not take down the whole sidebar, so
        // the section renders empty. The original error is still logged —
        // never swallowed silently (AGENTS.md rule 1).
        getRecentProducts(user.id).catch((error: unknown) => {
          console.error("[sidebar] recent products query failed", error);
          return [] as RecentProduct[];
        }),
      ])
    : [null, [] as RecentProduct[]];
  const accountName = t("accountFallbackName");
  const accountEmail = user?.email ?? "";
  const workspaceName = business?.name ?? t("workspaceFallbackName");
  const initials = accountName.charAt(0).toUpperCase();
  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav} aria-label={t("primary")}>
        <div className={styles["section-top"]}>
          <span className={styles.wrap}>
            <MenuButton id="menu-button" chevron="down">
              <span
                data-slot="avatar"
                className={styles.image}
                aria-hidden="true"
              >
                {workspaceName.charAt(0).toUpperCase()}
              </span>
              <span className={styles.truncate}>{workspaceName}</span>
            </MenuButton>
          </span>
        </div>
        <div className={styles["section-main"]}>
          <div data-slot="section" className={styles.section}>
            <span className={styles.wrap}>
              <SidebarLink href="/">
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className={styles.truncate}>{t("dashboard")}</span>
              </SidebarLink>
            </span>
            <span className={styles.wrap}>
              <SidebarLink href="/products">
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h6.5A2.25 2.25 0 0 1 13 4.25V5.5H9.25A3.75 3.75 0 0 0 5.5 9.25V13H4.25A2.25 2.25 0 0 1 2 10.75v-6.5Z"></path>
                  <path d="M9.25 7A2.25 2.25 0 0 0 7 9.25v6.5A2.25 2.25 0 0 0 9.25 18h6.5A2.25 2.25 0 0 0 18 15.75v-6.5A2.25 2.25 0 0 0 15.75 7h-6.5Z"></path>
                </svg>
                <span className={styles.truncate}>{t("products")}</span>
              </SidebarLink>
            </span>
            <span className={styles.wrap}>
              <a
                className={styles["nav-link"]}
                type="button"
                data-headlessui-state=""
                href="/orders"
              >
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.75 3A2.25 2.25 0 0 1 18 5.25v1.214c0 .423-.277.788-.633 1.019A2.997 2.997 0 0 0 16 10c0 1.055.544 1.982 1.367 2.517.356.231.633.596.633 1.02v1.213A2.25 2.25 0 0 1 15.75 17H4.25A2.25 2.25 0 0 1 2 14.75v-1.213c0-.424.277-.789.633-1.02A2.998 2.998 0 0 0 4 10a2.997 2.997 0 0 0-1.367-2.517C2.277 7.252 2 6.887 2 6.463V5.25A2.25 2.25 0 0 1 4.25 3h11.5ZM13.5 7.396a.75.75 0 0 0-1.5 0v1.042a.75.75 0 0 0 1.5 0V7.396Zm0 4.167a.75.75 0 0 0-1.5 0v1.041a.75.75 0 0 0 1.5 0v-1.041Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className={styles.truncate}>Orders</span>
              </a>
            </span>
            <span className={styles.wrap}>
              <SidebarLink href="/settings">
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className={styles.truncate}>{t("settings")}</span>
              </SidebarLink>
            </span>
          </div>
          {recent.length > 0 && (
            <div
              data-slot="section"
              className={`max-lg:hidden ${styles.section}`}
            >
              <h3 className={styles.heading}>{t("recentProducts")}</h3>
              {recent.map((p) => (
                <span key={p.id} className={styles.wrap}>
                  <SidebarLink href={`/products/${p.id}`}>
                    <span className={styles.target} aria-hidden="true"></span>
                    <span className={styles.truncate}>{p.name}</span>
                  </SidebarLink>
                </span>
              ))}
            </div>
          )}
          <div aria-hidden="true" className={styles.spacer}></div>
          <div data-slot="section" className={styles.section}>
            <span className={styles.wrap}>
              <button className={styles["nav-link"]} type="button">
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className={styles.truncate}>Support</span>
              </button>
            </span>
            <span className={styles.wrap}>
              <button className={styles["nav-link"]} type="button">
                <span className={styles.target} aria-hidden="true"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z"></path>
                </svg>
                <span className={styles.truncate}>Changelog</span>
              </button>
            </span>
          </div>
        </div>
        <div className={styles["section-bottom"]}>
          <AccountChip
            name={accountName}
            email={accountEmail}
            initials={initials}
          />
        </div>
      </nav>
    </div>
  );
}
