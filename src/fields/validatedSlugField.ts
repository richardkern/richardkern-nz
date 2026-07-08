import type { Field, TextFieldSingleValidation } from 'payload'

import { slugField } from 'payload'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const validateSlug: TextFieldSingleValidation = (value) => {
  if (typeof value === 'string' && !SLUG_PATTERN.test(value)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only (e.g. "about" or "my-first-post"). Check for browser autofill: it once put an email address here.'
  }
  return true
}

/**
 * slugField with format validation. Drafts autosave without validation, so a
 * corrupted slug can land in a draft — but it can never be published.
 */
export const validatedSlugField: typeof slugField = (args = {}) =>
  slugField({
    ...args,
    overrides: (field) => {
      const withValidation = {
        ...field,
        fields: field.fields.map((f) =>
          'name' in f && f.name === (args.name ?? 'slug') && f.type === 'text'
            ? ({ ...f, validate: validateSlug } as Field)
            : f,
        ),
      }
      return typeof args.overrides === 'function' ? args.overrides(withValidation) : withValidation
    },
  })
