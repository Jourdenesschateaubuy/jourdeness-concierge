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
    href: "/admin/orders",
    label: "訂單",
  },
  {
    href: "/admin/products/health",
    label: "商品資料健檢",
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
    href: "/admin/storefront",
    label: "商城展示配置",
  },
  {
    href: "/admin/homepage-studio",
    label: "首頁管理",
  },
  {
    href: "/admin",
    label: "網站編輯",
  },
  {
    href: "/admin/home",
    label: "預覽網站",
  },
  {
    href: "/admin/website-studio/media",
    label: "Media Library",
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className={styles.navigation}
      aria-label="後台管理導覽"
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
                title="目前尚未開放"
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
