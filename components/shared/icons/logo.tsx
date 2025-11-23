import * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 40"
    fill="none"
    {...props}
  >
    <rect
      x="2"
      y="2"
      width="116"
      height="36"
      rx="8"
      className="text-slate-900"
      fill="currentColor"
    />
    <path
      d="M16 28V12h6.4c3.9 0 6.1 2.1 6.1 5.2 0 2.4-1.3 4.3-3.7 5l3.9 5.8h-5.1l-3.1-4.9H21v4.9H16Z"
      fill="#38bdf8"
    />
    <path
      d="M38.5 28.3c-4.9 0-8.3-3.4-8.3-8.2 0-4.7 3.4-8.2 8.3-8.2 4.9 0 8.3 3.5 8.3 8.2 0 4.8-3.4 8.2-8.3 8.2Zm0-4c2 0 3.5-1.6 3.5-4.2s-1.5-4.2-3.5-4.2-3.5 1.6-3.5 4.2 1.5 4.2 3.5 4.2Z"
      fill="#a5b4fc"
    />
    <path
      d="M53.4 28V12h4.9l5 8.4V12h4.8v16h-4.9L58.2 19v9h-4.8Z"
      fill="#38bdf8"
    />
    <circle cx="86" cy="20" r="3.4" fill="#a5b4fc" />
    <circle cx="95" cy="20" r="3.4" fill="#38bdf8" />
    <circle cx="104" cy="20" r="3.4" fill="#a5b4fc" />
  </svg>
);

export default Logo;
