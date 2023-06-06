const finishedLoading = () => {
  return new Promise<void>(resolve => {
    if (document.querySelectorAll('img[alt="Loading"]').length === 0) {
      return resolve();
    }

    const observer = new MutationObserver(mutations => {
      console.log('found mutations!')
      if (document.querySelectorAll('img[alt="Loading"]').length === 0) {
        resolve();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface Entry {
  id: string;
  section: string;
  days: string;
  time: string;
  location: string;
  instructor: string;
}

interface DiscussionEntry extends Entry { }

interface LectureEntry extends DiscussionEntry {
  discussions?: DiscussionEntry[];
}

const rowFields = (c: HTMLElement): Entry | null => {
  const p = [
    'enrollColumn',
    'sectionColumn',
    'statusColumn',
    'infoColumn',
    'dayColumn',
    'timeColumn',
    'locationColumn',
    'unitsColumn',
    'instructorColumn',
  ].map(cls => c.querySelector(`.${cls}`))

  if (!p.every(e => e !== null)) return null;

  const id = c.parentElement!.id.replace(/-children$/, '')

  const [enroll, section, status, info, days, time, location, units, instructor] = p as Element[];

  const entry = {
    id: id,
    section: section.querySelector('a')?.innerText,
    days: days.querySelector('button')?.innerText,
    time: time.querySelector('p')?.innerText,
    location: location.querySelector('p')?.innerText,
    instructor: instructor.querySelector('p')?.innerText,
  }
  if (Object.values(entry).includes(undefined)) return null
  return entry as Entry
}

const data: Map<string, Entry> = new Map()

window.onload = async () => {
  document.querySelectorAll('.class-title button').forEach(node => (node as HTMLElement).click())

  await delay(1000)
  await finishedLoading()

  document.querySelectorAll('.primary-row .transparentButton').forEach(b => {
    (b as HTMLButtonElement).click()
  })

  await delay(1000)
  await finishedLoading()

  document.querySelectorAll('.primary-row').forEach(lec => {
    const lecEntry = rowFields(lec as HTMLElement) as LectureEntry

    const discussions = lec.querySelector('.secondarySection')
    if (discussions !== null) {
      lecEntry.discussions = []
      discussions.querySelectorAll('.secondary-row').forEach(disc => {
        const discEntry = rowFields(disc as HTMLElement)
        if (discEntry === null) return;
        lecEntry.discussions!.push(discEntry)
      })
    }
    data.set(lecEntry.id, lecEntry)
  })
}
