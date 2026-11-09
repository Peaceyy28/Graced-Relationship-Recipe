import './WisdomTicker.css';

export default function WisdomTicker() {
  const items = [
    "Covenant Love",
    "Patience in Speech",
    "Unconditional Forgiveness",
    "Scripture-First Relationships",
    "Emotional Safety & Healing",
    "Praying Together Daily",
    "Grace Over Perfection",
    "Flourishing Marriages"
  ];

  // Duplicate for seamless loop
  const loopItems = [...items, ...items];

  return (
    <div className="editorial-ticker-wrap" aria-hidden="true">
      <div className="editorial-ticker-track">
        {loopItems.map((text, idx) => (
          <span key={idx} className="ticker-item">
            <span>{text}</span>
            <span className="ticker-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
