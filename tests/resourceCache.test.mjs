import assert from 'node:assert/strict'
import test from 'node:test'
import { createResourceCache } from '../src/api/resourceCache.ts'

test('reutiliza la respuesta y comparte una descarga en curso', async () => {
  let calls = 0
  const cache = createResourceCache(async () => {
    calls += 1
    await new Promise((resolve) => setTimeout(resolve, 5))
    return [calls]
  }, 1_000)

  const [first, second] = await Promise.all([cache.get(), cache.get()])
  assert.equal(calls, 1)
  assert.deepEqual(first, [1])
  assert.strictEqual(first, second)
  assert.strictEqual(cache.peek(), first)
  assert.strictEqual(await cache.get(), first)
})

test('muestra el último dato mientras revalida y permite forzar actualización', async () => {
  let calls = 0
  const cache = createResourceCache(async () => ++calls, 0)
  assert.equal(await cache.get(), 1)
  assert.equal(cache.peek(), 1)
  assert.equal(await cache.get(), 2)
  assert.equal(cache.peek(), 2)
  assert.equal(await cache.get(true), 3)
})

test('una actualización local no es reemplazada por una respuesta antigua', async () => {
  let finish
  const cache = createResourceCache(() => new Promise((resolve) => { finish = resolve }), 1_000)
  const first = cache.get()
  cache.update((value) => value + 1)
  finish(10)
  assert.equal(await first, 10)
  assert.equal(cache.peek(), undefined)
})

test('un fallo no queda guardado y se puede reintentar', async () => {
  let calls = 0
  const cache = createResourceCache(async () => {
    if (++calls === 1) throw new Error('temporal')
    return 42
  }, 1_000)
  await assert.rejects(cache.get(), /temporal/)
  assert.equal(await cache.get(), 42)
  assert.equal(calls, 2)
})
