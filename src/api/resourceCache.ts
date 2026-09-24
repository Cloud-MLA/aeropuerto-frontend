export function createResourceCache<T>(load: () => Promise<T>, ttlMs: number) {
  let value: T | undefined
  let expiresAt = 0
  let pending: Promise<T> | null = null
  let generation = 0

  return {
    peek: () => value,
    get(force = false): Promise<T> {
      if (!force && value !== undefined && Date.now() < expiresAt) return Promise.resolve(value)
      if (pending) return pending
      const currentGeneration = generation
      const request = load().then((result) => {
        if (generation === currentGeneration) {
          value = result
          expiresAt = Date.now() + ttlMs
        }
        return result
      })
      pending = request.finally(() => { pending = null })
      return pending
    },
    update(updater: (current: T) => T): void {
      generation += 1
      if (value !== undefined) {
        value = updater(value)
        expiresAt = Date.now() + ttlMs
      }
    },
    invalidate(): void {
      generation += 1
      value = undefined
      expiresAt = 0
    },
  }
}
