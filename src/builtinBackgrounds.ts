import type { BackgroundMedia } from './backgroundMedia'

const commonsFile = (name: string) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(name)}`

export const BUILTIN_BACKGROUND_SOURCES: BackgroundMedia[] = [
  { id:'commons-masjid', name:'Masjid Interior', kind:'image', url:commonsFile('Interior of a Masjid (Mosque).jpg'), thumbnailUrl:commonsFile('Interior of a Masjid (Mosque).jpg'), author:'DaSupremo', license:'CC BY-SA 4.0', attribution:'DaSupremo / Wikimedia Commons', sourceUrl:'https://commons.wikimedia.org/wiki/File:Interior_of_a_Masjid_(Mosque).jpg', verifiedRights:true },
  { id:'commons-badshahi', name:'Badshahi Mosque Interior', kind:'image', url:commonsFile('BadshahiInterior.jpg'), thumbnailUrl:commonsFile('BadshahiInterior.jpg'), author:'Shabi Abdullah', license:'CC BY-SA 4.0', attribution:'Shabi Abdullah / Wikimedia Commons', sourceUrl:'https://commons.wikimedia.org/wiki/File:BadshahiInterior.jpg', verifiedRights:true },
  { id:'commons-desert', name:'Desert Landscape', kind:'image', url:commonsFile('Desert Landscape (54598484368).jpg'), thumbnailUrl:commonsFile('Desert Landscape (54598484368).jpg'), author:'Joshua Tree National Park', license:'Public Domain', attribution:'NPS / Wikimedia Commons', sourceUrl:'https://commons.wikimedia.org/wiki/File:Desert_Landscape_(54598484368).jpg', verifiedRights:true },
  { id:'commons-mecca-video', name:'Great Mosque of Mecca — Video', kind:'video', url:commonsFile('Great Mosque of Mecca (video) - Feb 4, 2010.webm'), thumbnailUrl:commonsFile('Great Mosque of Mecca (video) - Feb 4, 2010.webm'), author:'Habib-Ur-Rehman Janjua', license:'CC BY', attribution:'Habib-Ur-Rehman Janjua / Wikimedia Commons', sourceUrl:'https://commons.wikimedia.org/wiki/File:Great_Mosque_of_Mecca_(video)_-_Feb_4,_2010.webm', verifiedRights:true },
  { id:'commons-kaaba-video', name:'Masjid al-Haram & Hajj — Video', kind:'video', url:commonsFile('Time lapse of Masjid al-Ḥarām (kaaba) & hajj rites.webm'), thumbnailUrl:commonsFile('Time lapse of Masjid al-Ḥarām (kaaba) & hajj rites.webm'), author:'Masajida Allah', license:'CC BY', attribution:'Masajida Allah / Wikimedia Commons', sourceUrl:'https://commons.wikimedia.org/wiki/File:Time_lapse_of_Masjid_al-%E1%B8%A4ar%C4%81m_(kaaba)_%26_hajj_rites.webm', verifiedRights:true },
]

export const FREE_MEDIA_DIRECTORIES = [
  { id:'pixabay', name:'Pixabay', url:'https://pixabay.com/videos/search/islam%20mosque/' },
  { id:'pexels', name:'Pexels', url:'https://www.pexels.com/search/videos/mosque%20in%20desert/' },
  { id:'commons', name:'Wikimedia Commons', url:'https://commons.wikimedia.org/wiki/Category:Videos_of_mosques' },
]
