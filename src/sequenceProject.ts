import { defaultIntro, defaultOutro, type IntroOutroConfig } from './introOutro'

export interface SequenceProject {
 intro: IntroOutroConfig
 outro: IntroOutroConfig
 quranDuration: number
}

export const defaultSequenceProject: SequenceProject = {
 intro: { ...defaultIntro },
 outro: { ...defaultOutro },
 quranDuration: 30,
}

export function totalProjectDuration(project: SequenceProject): number {
 return (project.intro.enabled ? project.intro.duration : 0) + project.quranDuration + (project.outro.enabled ? project.outro.duration : 0)
}
