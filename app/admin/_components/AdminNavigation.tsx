"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-navigation.module.css";

type NavigationItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    href: "/admin/products",
    label: "商品",
  },
  {
    href: "/admin/products/health",
    label: "商品健檢",
  },
  {
    href: "/admin/categories",
    label: "分類",
  },
  {
    href: "/admin/series",
    label: "系列",
    disabled: true,
  },
  {
    href: "/admin",
    label: "網站編輯",
  },
  {
    href: "/admin/home",
    label: "首頁",
  },
  {
    href: "/admin/banners",
    label: "Banner",
    disabled: true,
  },
  {
    href: "/admin/media",
    label: "Media",
    disabled: true,
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className={styles.navigation}
      aria-label="後台主要導覽"
    >
      <Link
        href="/admin/dashboard"
        className={styles.brand}
      >
        Jourdeness CMS
      </Link>

      <div className={styles.links}>
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/admin/products"
                ? pathname === "/admin/products" ||
                  (pathname.startsWith("/admin/products/") &&
                    !pathname.startsWith("/admin/products/health"))
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className={`${styles.link} ${styles.disabled}`}
                title="此功能尚未開放"
                aria-disabled="true"
              >
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <Link
        href="/"
        target="_blank"
        rel="noreferrer"
        className={styles.storefrontLink}
      >
        開啟前台
      </Link>
    </nav>
  );
}