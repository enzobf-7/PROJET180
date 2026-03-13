'use client'

export function DashboardAnimations() {
  return (
    <style>{`
      @keyframes p180-fade {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0);   }
      }
      @keyframes p180-slide {
        from { opacity: 0; transform: translateX(-12px); }
        to   { opacity: 1; transform: translateX(0);      }
      }
      @keyframes p180-ping {
        0%, 100% { transform: scale(1);   opacity: 1;   }
        50%      { transform: scale(1.6); opacity: 0.35; }
      }
      .p180-fade      { animation: p180-fade      0.45s cubic-bezier(0.2,0,0.1,1) both; }
      .p180-slide     { animation: p180-slide     0.4s  cubic-bezier(0.2,0,0.1,1) both; }
      .p180-ping      { animation: p180-ping      1.8s  ease-in-out infinite; }
      @keyframes p180-xp-rise {
        0%   { opacity: 0; transform: translateY(0) scale(0.8); }
        15%  { opacity: 1; transform: translateY(-4px) scale(1.15); }
        70%  { opacity: 1; transform: translateY(-36px) scale(1); }
        100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
      }
      @keyframes p180-ring-done {
        0%   { transform: scale(1); }
        30%  { transform: scale(1.18); }
        60%  { transform: scale(0.94); }
        100% { transform: scale(1); }
      }
      .p180-xp-rise   { animation: p180-xp-rise   1.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
      .p180-ring-done { animation: p180-ring-done  0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      @keyframes p180-habit-check {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.22); }
        70%  { transform: scale(0.92); }
        100% { transform: scale(1); }
      }
      .p180-habit-row:hover { background: rgba(58,134,255,0.06) !important; }
      .p180-card {
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }
      @media (hover: hover) {
        .p180-card:hover {
          border-color: rgba(58,134,255,0.15) !important;
          box-shadow: 0 0 0 1px rgba(58,134,255,0.06), 0 4px 24px rgba(0,0,0,0.25);
        }
      }
      .p180-btn-press {
        transition: transform 0.1s ease, opacity 0.1s ease;
      }
      .p180-btn-press:active {
        transform: scale(0.96);
        opacity: 0.85;
      }
      .p180-input-focus:focus {
        border-color: rgba(58,134,255,0.5) !important;
        box-shadow: 0 0 0 2px rgba(58,134,255,0.12);
        outline: none;
      }
      @keyframes p180-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .p180-skeleton {
        background: linear-gradient(90deg, #0F0F0F 25%, #1E1E1E 50%, #0F0F0F 75%);
        background-size: 200% 100%;
        animation: p180-shimmer 1.5s ease-in-out infinite;
        border-radius: 6px;
      }
      @keyframes p180-levelup-bg {
        0%   { opacity: 0; }
        15%  { opacity: 1; }
        80%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes p180-levelup-card {
        0%   { opacity: 0; transform: scale(0.72) translateY(24px); }
        25%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
        45%  { transform: scale(0.98) translateY(0); }
        60%  { transform: scale(1) translateY(0); }
        80%  { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(1.06) translateY(-12px); }
      }
      @keyframes p180-levelup-line {
        0%   { width: 0; opacity: 0; }
        40%  { width: 60px; opacity: 1; }
        80%  { width: 60px; opacity: 1; }
        100% { width: 0; opacity: 0; }
      }
    `}</style>
  )
}
