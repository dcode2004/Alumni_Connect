import HeroSectionMain from '@/components/hero/HeroSectionMain'
import MemoriesSection from '@/components/landingPage/memoriesSection/MemoriesSection'
import Notes from '@/components/landingPage/noteSection/Notes'
import NoticeSection from '@/components/landingPage/noticeSection/NoticeSection'

export default function Home() {
  return (
    <main>
      <HeroSectionMain />
      <MemoriesSection />
      <NoticeSection />
    </main>
  )
}
