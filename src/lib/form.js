import { invalidateAll } from '$app/navigation'

// this action (https://svelte.dev/tutorial/actions) allows us to
// progressively enhance a <form> that already works without JS
/**
 * @param {HTMLFormElement} form
 * @param {{
 *   pending?: ({ data, form }: { data: FormData; form: HTMLFormElement }) => void;
 *   error?: ({
 *     data,
 *     form,
 *     response,
 *     error
 *   }: {
 *     data: FormData;
 *     form: HTMLFormElement;
 *     response: Response | null;
 *     error: Error | null;
 *   }) => void;
 *   result?: ({
 *     data,
 *     form,
 *     response
 *   }: {
 *     data: FormData;
 *     response: Response;
 *     form: HTMLFormElement;
 *   }) => void;
 * }} opts
 */
export function enhance (form, { pending, error, result } = {}) {
  let currentToken

  /** @param {SubmitEvent} event */
  async function handleSubmit (event) {
    const token = (currentToken = {})

    event.preventDefault()

    const data = new FormData(form) // eslint-disable-line no-undef

    if (pending) pending({ data, form })

    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: {
          accept: 'application/json'
        },
        body: data
      })

      if (token !== currentToken) return

      if (response.ok) {
        if (result) result({ data, form, response })
        invalidateAll()
      } else if (error) {
        error({ data, form, error: null, response })
      } else {
        console.error(await response.text())
      }
    } catch (err) {
      if (error && err instanceof Error) {
        error({ data, form, error: err, response: null })
      } else {
        throw err
      }
    }
  }

  form.addEventListener('submit', handleSubmit)

  return {
    destroy () {
      form.removeEventListener('submit', handleSubmit)
    }
  }
}
