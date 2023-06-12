# Philosophy

This section is intended to help you understand how Proto works and how to best configure it for your needs.
We will assume you have finished [setting up](./setup.md) your installation.

---

## Why Proto?

Before we begin, it's important to understand why Proto was developed in the first place.
Proto is intended to be a **universal, open-source toolset for learning new languages**.
By **universal**, we mean that Proto's main features are available for all languages—the app is entirely customizable to ensure that it will work well no matter what language you choose to learn.
By **open-source**, we are referring to Proto's permissive [GPL v3 license](https://www.gnu.org/licenses/quick-guide-gplv3.html), which gives you the right to modify and redistribute Proto's source code with appropriate attribution and an identical license.
This ensures all improvements are publicly available forever.
By **toolset**, we mean that Proto is more than an application—it is a collection of interdependent and flexible tools intended to help you learn new languages.

In short, unlike other popular applications used for language learning (e.g. Quizlet or Remnote), Proto is free and will remain so forever.
Proto never sends your data to a third-party and runs the language server locally on your machine.
Proto is also a universal toolset designed specifically for language learning, which provides much more flexibility than its competitors.
When you learn a word, you can store additional information, like the definition for a specific context and its part of speech, along with that word.
You can also create custom grammatical properties attached to each word that you will study alongside it.
Lastly, Proto's novel [spaced repetition algorithm](#spaced-repetition) tracks your progress towards learning new words and updates your queue automatically.

## Spaced Repetition

**Spaced repetition** is a specialized algorithm to determine what cards, based on past accuracy, times studied, and other metrics, are most likely to have been forgotten by the user.
These cards are then prompted to be studied again in the queue.

The central idea behind spaced repetition is that cards that are more easily remembered should be studied less often whereas cards that are less likely to be remembered should be studied more frequently.
This has been shown to increase connections in **long-term memory**, as the user must be able to recall cards from past sessions, thus leading to an increased likelihood of recall at a later point in time.[^1]

In order to track which cards are most likely to be forgotten, it is necessary to develop a system that is capable of predicting, given available metrics, the **retention rate**, or amount of information retained as a percentage, of a particular card.
This is achieved using a **forgetting curve**, which models the retention rate as a function of time.[^2]

Proto models the forgetting curve as the solution to a particular differential equation, which yields the following function of time for the retention rate:

$$ R(t) = \frac{\mu}{\ln t + C} $$

where $\mu$ and $C$ are parameters that Proto tunes based on your current "streak" (the number of times a card has been correctly studied since the last time it was incorrectly studied or created).
This method ensures that as cards are studied, they will be tested less often; however, if they are forgotten at any time, the card will be treated as new to ensure that mastery is achieved.
For more details about this process, see the [technical description](../api/docs/repetition.md).

## Language Configuration

Now that we've covered some of the theory behind how Proto works, let's see how to configure it for a specific language.
You will want to make these changes from your local file system and *not* the frontend UI, which currently does not support writing this type of configuration.

First, locate your storage directory (this should be the path specified as `root` in your configuration).
Once you decide on which languages to study (you can always change this later), add a folder entitled `lang-xx` to your storage directory, where `xx` matches the corresponding [ISO language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (639-1).
While the part after the `lang-` prefix can technically be anything, it's a good idea to use the proper language code as Proto may periodically roll out features targeted at specific languages for technical or practical reasons.
For example, we may use your language code to identify what fonts to load or what the text direction is.[^3]

Inside each language directory, you'll need to tell Proto what grammatical properties you want to study.
These are optional attributes that can be specified along with words you learn that can be tested or shown to the user.
Even if you do not intend on using them, you'll need a basic grammar configuration so that Proto can identify the language directory without any errors.
To do this, create a file `grammar.json` with the following structure:

```ts
{
  config: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'Choice' | 'GrammarCard'
    test: boolean
    method?: 'prefix' | 'suffix' | 'inline' | 'separately'
    hint?: boolean
    separator?: string
    choices?: Choice
    default?: string | string[] | number | boolean | GrammarCard
  }>
}
```

This file should contain a single `config` property, which is an array of grammar property objects with the structure shown inside the config array above.
If you do not want to add any grammatical properties, enter the following into `grammar.json`:

```json
{ "config": [] }
```

If you do wish to add grammatical attributes, keep reading.
The `name` should be a short and unique identifier that will be entered when the property is tested.
**Do not** include spaces in the name.
The `'string'` and `'number'` types will trigger input boxes for tested properties where you can enter the value for that property.
`'Choice'` should be used for multiple-choice string properties.
Lastly, the `'GrammarCard'` type will create a nested flashcard underneath the base card for testing a specific grammatical property.
Set `test` to false if you do not want to be tested on this grammatical property but still want to store it along with card metadata.
In this case, the only other property you may want to set is the `default` property, which should be of the `type` specified and adds a default value to properties unset in the UI.
Otherwise, these properties will simply be discarded for a specific card if they were not entered along with the card's term and definition in the UI.

For default values, choices should be specified as a string representing the default choice or a list of strings if multiple choices are allowed. Grammar cards should be specified as an object with type:

```ts
{
  term: string
  definition: string
}
```

If you have a property of type `Choice`, tested or not, you will need to add a `choices` property to your properties configuration with the following structure:

```ts
{
  options: string[]
  multiple?: boolean
}
```

The `multiple` property should be set to `true` only if your options are not mutually exclusive (i.e. a single card can have multiple options attached to this grammatical property).
This is *not* the same as allowing multiple correct answers—if multiple choices are selected for a specific card, all of them will be required in the response in order for the card to be marked correct.
If you do enable multiple options, make sure none of them contains a space, as this is the delimiter that Proto uses to split up the entered options during testing.

If you have a tested property of any type, you will need to include the `method` field.
If you don't, it will default to `'inline'`.
This will test any property type (except `'GrammarCard'`) along with the card that it is attached to, but separately from that card's definition.
If this is a `GrammarCard`, you **must** specify `method` to be `'separately'`, which will test the card as a separate flashcard.
This is available for all other types as well.
The prefix and suffix options will require that the property value be included at the beginning or at the end of the definition when tested.
These methods are only available for `'string'` and `'number'` types (using them for other types will not work properly).
The way that the definition is segmented depends on the `separator` field, which should be set to a token for separating parts of the definition (default is a space, which uses first or last word of the definition for prefixed and suffixed property testing).

Lastly, for inline-tested properties with no default, Proto can provide a hint to the user that the property has a value during testing.
When the property is specified for a specific card, Proto will automatically create an input box with a label corresponding to the property's name.
To enable this, set `hint` to `true`.

As a final note, you don't need to add a context or part of speech grammatical property as these are already built-in to Proto.

### Examples

That's a lot to take in, so here are a few examples of grammatical properties you may wish to embed into your grammar configuration and potentially modify to suit your needs:[^4]

**Articles for Spanish**:

```json
{
  "name": "article",
  "type": "Choice",
  "test": true,
  "method": "prefix",
  "choices": {
    "options": [
      "el",
      "la",
      "el/la",
      "los",
      "las",
      "los/las"
    ]
  }
}
```

**Transitive/intransitive verb categorization**:

```json
{
  "name": "obj",
  "type": "Choice",
  "test": true,
  "hint": true,
  "method": "inline",
  "choices": {
    "options": [
      "trans",
      "int"
    ]
  }
}
```

**Switch for verbs with indirect object pronouns**:

```json
{
  "name": "ind",
  "type": "boolean",
  "test": true,
  "method": "inline"
}
```

[^1]: Smolen, et al. "The right time to learn: mechanisms and optimization of spaced learning" *Nature* <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5126970/>
[^2]: "Forgetting curves" *Wikipedia* <https://en.wikipedia.org/wiki/Forgetting_curve>
[^3]: Proto actually uses a [universal Noto font](https://github.com/satbyy/go-noto-universal), so this doesn't matter much at the moment.
[^4]: By the way, if you have a grammar configuration or set of grammatical properties you think works well for a particular language, feel free to open a pull request and add them to the [examples](#examples) section.
