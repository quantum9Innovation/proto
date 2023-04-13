# Card Schema

This document describes the validation schema for cards, which are the most basic structural unit used in the virtual file system (VFS).

---

**Cards**, at the most basic level, are a collection of **terms** and **definitions**, which can be shown to the user to test how well they are able to remember a specific concept.
For example, the following is an example of a simple card:

```json
{
  "term": "line",
  "definition": "línea"
}
```

However, cards typically have more information than just that.
For example, we might want to add information about the word's grammatical properties, like its part of speech.
This information goes in a special `grammar` object:

```json
{
  "pos": "noun",
  "context": "geometry"
}
```

`pos` and `context` are the two **standard identifiers**, meaning they are the only top-level, language-agnostic properties of the `grammar` object.
The rest of the properties go in a `properties` object within the `grammar` one.
These are language-specific and the structure of this object is defined at the language level config file.

Here's an example of what the `grammar` object might look like for our example:

```json
{ "article": "la" }
```

In addition to the `grammar` object, there are other objects that exist which store other metadata about the card.
These are:

- `tags: string[]`: A list of strings that can be used to categorize the card (this is for search purposes only and not used in testing)
- `notes: string`: A string that can be used to store user-generated notes about the card
- `phrases: Array<Phrase>`: A list of phrases that are related to the card; can have many (but not all) of the properties that standard cards do

The `Phrase` type is defined as follows:

```ts
interface Phrase {
  term: string
  definition: string
  grammar?: Grammar
  tags?: string[]
  notes?: string
}
```

For our example, reasonable values for these properties might be:

```json
{
  "tags": ["geometry"],
  "notes": "This is a note about the card",
  "phrases": [
    {
      "term": "line segment",
      "definition": "segmento de línea",
      "grammar": { "article": "el" }
    }
  ]
}
```

The language settings determine what `grammar.properties` should look like for each card, if it exists.
These settings should contain a list of standard identifiers within this field, along with various properties about those identifiers, which include:

- `name`: Property name (e.g. `article`, `gender`, `tense`)
- `type`: The type of the property (e.g. `string`, `number`, `boolean`, `Choice`, `GrammarCard`―card without grammar and phrases)
- `test`: Boolean indicating whether the property should be tested
- `method?`: When testing is enabled, the method for collecting responses (one of `prefix`, `suffix`, `inline` (**default**), or `separately`)
- `hint?`: When `prefix`, `suffix`, or `inline` testing is enabled, whether the property should be tested with a hint (defaults to false)
- `separator?`: When `prefix` or `suffix` are enabled, what separator to use (default is space)
- `choices?`: A `Choice` object with a list of choices for the property value, if applicable
- `default?`: The default value of the property (instance of `type`)
- `only?`: If test and default are enabled, the probability with which default values should be tested (zero is never, one is always (**default**))

There should only be one prefix and one suffix property maximum with the same separator.
These properties should be either strings, numbers, or single choice items (multiple choices will not be registered).
Booleans must be tested inline and grammar cards must be tested separately.
Hinting is disabled for separately tested cards and booleans.

An example for the `article` property described in the above card might be:

```json
{
  "name": "article",
  "type": "Choice",
  "test": true,
  "method": "prefix",
  "choices": {
    "options": ["el", "la"]
  }
}
```

Additionally, all objects that can be tested are assigned a `history` property with various data about how often that card has been tested and how accurately it was remembered.
Cards are also assigned an `id` property, which uniquely identifies them in a document.
For grammar properties that are tested, the corresponding `history` properties are instead relabeled as `{property}-history`.

The idea behind the `history` property is to keep track of both accuracy and the time since the card was last studied.
Every user interaction with the card should be logged in the `history` object so that it can be used for spaced repetition calculations.

The `history` object should contain the following properties:

- `tests: Array<number, boolean>`: A list of all the times the card was tested and whether it was remembered correctly
- `score: number`: A number between 0 and 1 representing how well the card is known by the user (with 1 representing full accuracy); automatically recalculated after an update to `tests`

An example `history` object for a card might be:

```json
{
  "tests": [
    [1667286000123, false],
    [1667698575175, true]
  ],
  "score": 0.82
}
```
