"use client";

import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";
import styles from "./sidebar.module.css";
import MenuButton from "./MenuButton";
import { AccountMenu, MenuItem, MenuSeparator } from "./MenuItems";

const USER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z"
      clipRule="evenodd"
    />
  </svg>
);

const SIGN_OUT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H5.25a.75.75 0 0 1 0-1.5h7.19l-.97-.97a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * The sidebar's bottom account chip: real name/email (passed from the server
 * Sidebar) plus its dropdown menu — My account → /settings, Sign out →
 * signOutAction. Open state lives here so the chevron flips with the menu.
 */
export default function AccountChip({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) {
  const t = useTranslations("nav");
  return (
    <AccountMenu
      menuLabel={t("menuLabel")}
      trigger={(open, keyboard) => (
        <MenuButton
          id="account-menu-button"
          chevron={open ? "up" : "down"}
          expanded={open}
          {...keyboard}
        >
          <span className={styles.account}>
            <span data-slot="avatar" className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <span className={styles["account-details"]}>
              <span className={`${styles["account-detail"]} ${styles.name}`}>{name}</span>
              <span className={`${styles["account-detail"]} ${styles.email}`}>{email}</span>
            </span>
          </span>
        </MenuButton>
      )}
    >
      <MenuItem href="/settings" icon={USER_ICON}>
        {t("myAccount")}
      </MenuItem>
      <MenuSeparator />
      <MenuItem action={() => signOutAction()} icon={SIGN_OUT_ICON}>
        {t("signOut")}
      </MenuItem>
    </AccountMenu>
  );
}
