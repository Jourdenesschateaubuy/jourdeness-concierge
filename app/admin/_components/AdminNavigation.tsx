"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-navigation.module.css";

type NavigationItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

type OrderNotificationPreview = {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderTime: string;
};

const ORDER_NOTIFICATION_STORAGE_KEY =
  "jourdeness_admin_last_seen_order_id_v1";

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
    href: "/admin/homepage-studio",
    label: "首頁管理",
  },
  {
    href: "/admin",
    label: "網站編輯",
  },
  
  {
    href: "/admin/website-studio/media",
    label: "Media Library",
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  const [newOrderCount, setNewOrderCount] =
    useState(0);

  const [latestOrderId, setLatestOrderId] =
    useState(0);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [previewOrders, setPreviewOrders] =
    useState<OrderNotificationPreview[]>([]);

  const notificationOpenRef =
    useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function refreshOrderNotifications() {
      try {
        const storedValue =
          window.localStorage.getItem(
            ORDER_NOTIFICATION_STORAGE_KEY
          );

        const parsedValue =
          Number(storedValue);

        const lastSeenId =
          storedValue !== null &&
          Number.isInteger(parsedValue) &&
          parsedValue >= 0
            ? parsedValue
            : null;

        const response =
          await fetch(
            `/api/admin/orders/notifications?afterId=${lastSeenId ?? 0}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as {
            latestId?: number;
            newCount?: number;
            orders?: OrderNotificationPreview[];
          };

        if (cancelled) {
          return;
        }

        const latestId =
          Number(data.latestId) || 0;

        const count =
          Math.max(
            0,
            Number(data.newCount) || 0
          );

        setLatestOrderId(latestId);

        const incomingOrders =
          Array.isArray(data.orders)
            ? data.orders
            : [];

        if (
          !notificationOpenRef.current &&
          incomingOrders.length > 0
        ) {
          setPreviewOrders(
            incomingOrders
          );
        }

        if (lastSeenId === null) {
          window.localStorage.setItem(
            ORDER_NOTIFICATION_STORAGE_KEY,
            String(latestId)
          );

          setNewOrderCount(0);
          return;
        }

        setNewOrderCount(count);
      } catch {
        // 通知檢查失敗時不影響 CMS 操作。
      }
    }

    void refreshOrderNotifications();

    const timer =
      window.setInterval(
        () => {
          void refreshOrderNotifications();
        },
        30000
      );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  function markOrdersSeen() {
    window.localStorage.setItem(
      ORDER_NOTIFICATION_STORAGE_KEY,
      String(latestOrderId)
    );

    setNewOrderCount(0);
  }

  function toggleNotificationPreview() {
    const nextOpen =
      !notificationOpenRef.current;

    notificationOpenRef.current =
      nextOpen;

    setNotificationOpen(nextOpen);

    if (nextOpen) {
      markOrdersSeen();
    }
  }

  function closeNotificationPreview() {
    notificationOpenRef.current = false;
    setNotificationOpen(false);
  }

  function formatOrderAmount(
    amount: number
  ) {
    return new Intl.NumberFormat(
      "zh-TW"
    ).format(amount);
  }

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

      <div className={styles.rightActions}>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className={styles.storefrontLink}
        >
          開啟前台
        </Link>

        <Link
          href="/admin/orders"
          className={
            pathname.startsWith("/admin/orders")
              ? `${styles.storefrontLink} ${styles.utilityActive}`
              : styles.storefrontLink
          }
        >
          訂單
        </Link>

        <Link
          href="/admin/customers"
          className={
            pathname.startsWith("/admin/customers")
              ? `${styles.storefrontLink} ${styles.utilityActive}`
              : styles.storefrontLink
          }
        >
          客戶資料
        </Link>

        <div className={styles.notificationWrap}>
          <button
            type="button"
            className={styles.notificationLink}
            onClick={toggleNotificationPreview}
            aria-label="查看新訂單"
            title="新訂單通知"
            aria-expanded={notificationOpen}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 6.5-3 7-3 9h18c0-2-3-2.5-3-9"
              />
              <path d="M10 21h4" />
            </svg>

            {newOrderCount > 0 ? (
              <span
                className={styles.notificationBadge}
              >
                {newOrderCount > 99
                  ? "99+"
                  : newOrderCount}
              </span>
            ) : null}
          </button>

          {notificationOpen ? (
            <div
              className={styles.notificationPanel}
              role="dialog"
              aria-label="新訂單預覽"
            >
              <div
                className={styles.notificationPanelHeader}
              >
                <div>
                  <span>NEW ORDERS</span>
                  <strong>新訂單</strong>
                </div>

                <button
                  type="button"
                  onClick={closeNotificationPreview}
                  aria-label="關閉新訂單預覽"
                >
                  ×
                </button>
              </div>

              {previewOrders.length > 0 ? (
                <div
                  className={styles.notificationOrders}
                >
                  {previewOrders.map((order) => (
                    <Link
                      key={order.id}
                      href="/admin/orders"
                      className={styles.notificationOrder}
                      onClick={() => {
                        markOrdersSeen();
                        closeNotificationPreview();
                      }}
                    >
                      <div>
                        <strong>
                          {order.customerName ||
                            "未填姓名"}
                        </strong>
                        <span>
                          {order.orderNumber}
                        </span>
                      </div>

                      <b>
                        NT$
                        {formatOrderAmount(
                          order.totalAmount
                        )}
                      </b>
                    </Link>
                  ))}
                </div>
              ) : (
                <p
                  className={styles.notificationEmpty}
                >
                  目前沒有新的訂單
                </p>
              )}

              <Link
                href="/admin/orders"
                className={styles.notificationAllLink}
                onClick={() => {
                  markOrdersSeen();
                  closeNotificationPreview();
                }}
              >
                查看全部訂單 →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}


