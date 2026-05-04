import { DualPath } from '../components/landingSections'
import { PageIntro } from '../components/PageIntro'

export function StartPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageIntro
        title="Choose Your Adventure"
        description="Pick the option that best applies to you."
        hideBottomBorder
      />
      <DualPath />
    </div>
  )
}
