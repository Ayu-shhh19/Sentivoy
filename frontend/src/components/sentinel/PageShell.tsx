import type { ReactNode } from "react";
import { AppFrame } from "./AppFrame";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppFrame>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace / {title}</div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      {children}
    </AppFrame>
  );
}
