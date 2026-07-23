import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Activity, ShieldHalf, Menu, X } from "lucide-react";
import { ConnectButton } from "@/features/wallet/ConnectButton";
import styles from "./AppShell.module.css";
import { Eye } from "lucide-react";
import { WatchModal } from "@/features/watch/WatchModal";

const NAV = [
  { to: "/", label: "Portfolio", icon: LayoutDashboard, end: true },
  { to: "/activity", label: "Activity", icon: Activity, end: false },
  { to: "/security", label: "Security", icon: ShieldHalf, end: false },
];

function Brand() {
  return (
    <div className={styles.brand}>
      <div className={styles.logo}>P</div>
      <span className={styles.brandName}>PERPETUA</span>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }: { isActive: boolean }) =>
            [styles.navItem, isActive && styles.active].filter(Boolean).join(" ")
          }
        >
          <Icon size={18} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

// Wallet block: RainbowKit connect button + demo/network note. Reused in the
// desktop sidebar and the mobile drawer.
function WalletBlock({ onWatch }: { onWatch: () => void }) {
  return (
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <ConnectButton />
      <button
        onClick={onWatch}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          minHeight: 36,
          borderRadius: "var(--r-md)",
          background: "transparent",
          border: "1px solid var(--c-line)",
          color: "var(--c-steel)",
          cursor: "pointer",
          fontSize: 12.5,
          fontFamily: "var(--f-body)",
        }}
      >
        <Eye size={14} /> Watch an address
      </button>
      <div style={{ fontSize: 11, color: "var(--c-amber)", textAlign: "center" }}>
        Demo · Sepolia testnet
      </div>
    </div>
  );
}

export function AppShell() {
  const [menu, setMenu] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  return (
    <div>
      {/* desktop sidebar */}
      <aside className={styles.sidebar}>
        <Brand />
        <NavItems />
        <WalletBlock
          onWatch={() => {
            setWatchOpen(true);
            setMenu(false);
          }}
        />
      </aside>

      {/* mobile drawer */}
      {menu && <div className={styles.backdrop} onClick={() => setMenu(false)} />}
      <aside className={[styles.drawer, menu && styles.open].filter(Boolean).join(" ")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand />
          <button className={styles.burger} onClick={() => setMenu(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <NavItems onNavigate={() => setMenu(false)} />
        <WalletBlock
          onWatch={() => {
            setWatchOpen(true);
            setMenu(false);
          }}
        />
      </aside>

      {/* main */}
      <main className={styles.main}>
        <div className={styles.topbar}>
          <Brand />
          <button
            className={styles.burger}
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            style={{ marginLeft: "auto" }}
          >
            <Menu size={20} />
          </button>
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      <WatchModal open={watchOpen} onClose={() => setWatchOpen(false)} />
    </div>
  );
}
