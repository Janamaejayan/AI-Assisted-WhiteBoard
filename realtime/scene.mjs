export function mergeScene(current, incoming) {
  const elements = new Map((current?.elements || []).map((element) => [element.id, element]))

  for (const candidate of incoming.elements) {
    if (!candidate || typeof candidate.id !== 'string' || typeof candidate.version !== 'number') continue
    const previous = elements.get(candidate.id)
    if (!previous || candidate.version > previous.version ||
        (candidate.version === previous.version && (candidate.updated || 0) > (previous.updated || 0)) ||
        (candidate.version === previous.version && candidate.updated === previous.updated &&
          (candidate.versionNonce || 0) > (previous.versionNonce || 0))) {
      elements.set(candidate.id, candidate)
    }
  }

  return {
    elements: [...elements.values()],
    files: { ...(current?.files || {}), ...(incoming.files || {}) },
    appState: {
      viewBackgroundColor: incoming.appState?.viewBackgroundColor ||
        current?.appState?.viewBackgroundColor || '#ffffff',
    },
  }
}
