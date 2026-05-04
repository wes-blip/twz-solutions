import { FounderBio } from '../components/landingSections'
import { PageIntro } from '../components/PageIntro'

export function AboutPage() {
  return (
    <>
      <PageIntro
        title="About us"
        description="We ship fast for founders and operators—MVPs in days, not months, and automation that fits how your business actually runs."
      />
      <FounderBio />
    </>
  )
}
