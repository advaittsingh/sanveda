import { Check } from 'lucide-react'
import { FORM_STEP_SHORT, FORM_STEPS } from '../../constants/volunteerContent'

interface Props {
  step: number
}

export default function VolunteerFormStepper({ step }: Props) {
  return (
    <div className="volunteer-stepper" aria-label="Application progress">
      <div className="volunteer-stepper-meta">
        <span className="volunteer-stepper-count">
          Step {step + 1} of {FORM_STEPS.length}
        </span>
        <span className="volunteer-stepper-current">{FORM_STEPS[step]}</span>
      </div>

      <ol className="volunteer-stepper-track">
        {FORM_STEP_SHORT.map((label, index) => {
          const done = index < step
          const active = index === step
          return (
            <li key={label} className="volunteer-stepper-item" data-active={active} data-done={done}>
              <div className="volunteer-stepper-node">
                {done ? <Check size={14} strokeWidth={3} /> : index + 1}
              </div>
              <span className="volunteer-stepper-label">{label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
