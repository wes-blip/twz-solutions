import { CaseStudy, SelectedProjects } from '../components/landingSections'
import { PageIntro } from '../components/PageIntro'

export function BuildsPage() {
  return (
    <>
      <PageIntro
        title="Our builds"
        description="Case studies and selected work—health-tech, consumer apps, and enterprise automation."
      />
      <SelectedProjects />
      <CaseStudy />
    </>
  )
}
