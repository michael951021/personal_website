export const site = {
  name: 'Kevin Rodriguez',
  email: 'kjr64@cornell.edu',
  role: 'Software Engineer',
  location: 'Ithaca, NY',
  bio: 'I build systems that are fast, clear, and maintainable. Currently at Cornell and working on Computer Vision.',
  available: false,
  github: 'https://github.com/michael951021',
  linkedin: 'https://www.linkedin.com/in/kevin-jay-rodriguez/',
}

// The one project pinned on the home page. Swap this out when something newer takes over.
export const current = {
  title: 'Local Multi-Agent Loop',
  href: '/writing/local-multi-agent-loop',
  // A recorded run's dashboard; point this at a live one when it's hosted.
  runUrl: '/writing/local-multi-agent-loop/sample-run.html',
  summary:
    'Two Qwen 27B agents sharing a pair of 3090s, working through a ~140-task plan to find, reproduce and fix bugs in ' +
    'open-source ML repos. The interesting part is everything around the model: a task tree so each step knows where it ' +
    'sits, short handoff notes when an agent stops, and a llama-server setup that keeps the prompt cache warm. The ' +
    'second agent bought about 20% more throughput.',
}
