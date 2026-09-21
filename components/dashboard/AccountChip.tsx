"use client";

import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";
import styles from "./sidebar.module.css";
import MenuButton from "./MenuButton";
import { AccountMenu, MenuItem, MenuSeparator } from "./MenuItems";

const USER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
    <path
      fillRule="evenodd"
      d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z"
      clipRule="evenodd"
    />
  </svg>
);

const SHIELD_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
    <path
      fillRule="evenodd"
      d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71Zm2.34 5.504a.75.75 0 0 0-1.18-.926L7.394 9.17l-1.156-.99a.75.75 0 1 0-.976 1.138l1.75 1.5a.75.75 0 0 0 1.078-.106l2.75-3.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const LIGHTBULB_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
    <path
      d="M10.618 10.26c-.361.223-.618.598-.618 1.022 0 .226-.142.43-.36.49A6.006 6.006 0 0 1 8 12c-.569 0-1.12-.08-1.64-.227a.504.504 0 0 1-.36-.491c0-.424-.257-.799-.618-1.021a5 5 0 1 1 5.235 0ZM6.867 13.415a.75.75 0 1 0-.225 1.483 9.065 9.065 0 0 0 2.716 0 .75.75 0 1 0-.225-1.483 7.563 7.563 0 0 1-2.266 0Z"
    />
  </svg>
);

const SIGN_OUT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
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
 * signOutAction. Chevron points up toward the above-placed menu (data-anchor="top start") and does not rotate on open.
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
            trigger={(open, keyboard, toggle) => (
        <MenuButton
          id="account-menu-button"
          chevron="up"
          expanded={open}
          {...keyboard}
          onClick={toggle}
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
      <MenuItem href="/privacy-policy" icon={SHIELD_ICON}>
        {t("privacyPolicy")}
      </MenuItem>
      <MenuItem href="/contact/feedback" icon={LIGHTBULB_ICON}>
        {t("feedback")}
      </MenuItem>
      <MenuSeparator />
      <MenuItem action={() => signOutAction()} icon={SIGN_OUT_ICON}>
        {t("signOut")}
      </MenuItem>
    </AccountMenu>
  );
}
