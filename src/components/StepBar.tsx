interface Step {
  label: string;
  icon?: string;
}

interface StepBarProps {
  steps: Step[];
  current: number; // 0-indexed
}

export default function StepBar({ steps, current }: StepBarProps) {
  return (
    <div className="step-bar">
      {steps.map((step, i) => (
        <div key={i} className="step-item">
          <div className="step-full">
            <div className={`step-dot ${i < current ? 'completed' : i === current ? 'active' : ''}`}>
              {i < current ? '✓' : step.icon || i + 1}
            </div>
            <span className={`step-label ${i < current ? 'completed' : i === current ? 'active' : ''}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector ${i < current ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
