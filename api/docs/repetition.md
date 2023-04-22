# Spaced Repetition

This document describes the spaced repetition algorithm used to learn and remember new words.

---

## Definitions

**Spaced repetition** is the process of remembering new words by repeating them at a later date.[^1]
It uses an algorithm to determine what cards, based on past accuracy, times studied, and other metrics, are most likely to have been forgotten by the user.
These cards are then prompted to be studied again.

The central idea behind spaced repetition is that cards that are more easily remembered should be studied less often whereas cards that are less likely to be remembered should be studied more frequently.
This has been shown to increase connections in **long-term memory**, as the user must be able to recall cards from past sessions, thus leading to an increased likelihood of recall at a later point in time.[^2]

In order to track which cards are most likely to be forgotten, it is necessary to develop a system that is capable of predicting, given available metrics, the **retention rate**, or amount of information retained as a percentage, of a particular card.
This is achieved using a **forgetting curve**, which models the retention rate as a function of time.[^3]

## Mathematical Modeling

In order to generate this forgetting curve, Proto makes certain assumptions about how this function should behave in the form of a differential equation.
First of all, we know that this curve is a function of time and that it must be monotonically decreasing.
In other words:

$$ \frac{dR}{dt} < 0 $$

Secondly, we make certain assumptions about how this rate decreases.
The more information is retained at any given point in time, the more potential exists for loss (i.e. the same percentage loss of information results in a greater absolute loss), which means that:

$$ \frac{dR}{dt} \propto -R $$

But this is not a simple linear relationship.
There is also a "scarcity" element, which essentially means that the less information is retained, the less work needs to be done to learn and remember the information, and thus the more likely it is to be remembered.
However, if too much information is retained, it is more likely to be forgotten given the amount of work required to learn and remember it.
Thus, the derivative must be twice proportional to the amount of information retained:

$$ \frac{dR}{dt} \propto -R^2 $$

A final proportionality that can be noted is that the derivative must be inversely proportional to time.
The reasoning behind this is that if information has already been remembered for a long time, it is unlikely to be forgotten a short time after.
In other words, the longer information has been remembered, the more likely it is to continue to be retained.
Putting all these proportional relationships together and adding a proportionality constant $\mu$ to symbolize the retention rate multiplier yields:

$$ \frac{dR}{dt} = \frac{-R^2}{\mu t} $$

This ODE can be solved using separation of variables quite easily, which yields the function in question:

$$ R(t) = \frac{\mu}{\ln t + C} $$

where $C$ is the constant of integration.

## Modifications

One of the problems with the resulting function $R(t)$ is that there is no "starting point" on the curve which always has $y = 1$ for some constant $x$, regardless of other parameters.
Instead, we need to understand what such a point *means*.
What this point really represents is the amount of time after which it is half as likely to be remembered, considering time alone (i.e. neglecting the scarcity factor).
If we let this time be $x_1$, then we simply change $C$ so that the point $(x_1, 1)$ is on the curve, meaning:

$$ C = \mu - \ln x_1 $$

We also need to relate $\mu$, whose domain is the set of all positive numbers, to measured statistical time-weighted accuracy, which ranges from 0 to 1, though the minimum bound may be changed depending on when something is considered "learned".
We should also note that $\mu$ is itself a proportionality constant, so in relating it to the measured accuracy $\sigma$, we also need to factor in some empirical constant $k$.
We can then define $\mu$ to be:

$$ \mu = \frac{k}{1 - \sigma} $$

A value of $k=0.25$ turns out to yield a good estimation of actual forgetting curves.
Additionally, if we calculate the initial halving time, we see that:

$$ t_{1/2} = x_1 e^\mu $$

This means that $x_1$ is linearly correlated with halving time whereas $\mu$ is exponentially related, so increasing $\mu$ can drastically increase the amount of time between spaced repetition.

## Parameter Estimation

Given the results in the previous section, we still need to calculate empirical values for $\sigma$ and $x_1$ from observed testing data.
We will start with $x_1$.
One of the simplest way to model $x_1$, which corresponds to the initial retention from learning (or how long it will take for retention to be cut in half from time effects alone), is as a linear function of the number of times studied correctly $N$ with $y$-intercept $b$ and slope $m$:

$$ x_1 = mN + b $$

However, this now begs the question of how to find $m$ and $b$.
As a general rule, we can set $b$ to simply equal $1$, as this value is not so important (changing $k$ will have a much larger effect on the shape of the resulting curve than $b$).
We can also similarly estimate $m$ to be some reasonable integer expressing how well each relearning event helps to improve retention ($m = 3$ is a good choice).

We are now almost done!
The one problem that remains is that $N$ cannot simply equal the number of times a card has been studied, as a user could potentially study the same card many times but over the course of a few seconds, meaning each subsequent relearning had almost no benefit.
One way to do this is to "weight" the relearning events based on their proximity to earlier events.
However, we also do not want to value relearning events that happened a long time after the first relearning event more than any other normal test, as this would result in very fast growth in $x_1$ which could lead to inaccurate results.
Rather, we simply want to devalue the relearning events that happened a short time after the first relearning event.
We can do this by taking:

$$ N = \sum_{i=1}^{n} \frac{\Delta T_i}{\Delta T_i + K} $$

where $ n $ is the number of correct responses, $\Delta T_i$ is the change in time from the most recent relearning event to $T_i$ and $K$ is a constant chosen to reduce the weight of "small" changes in time. $K = 1/8$ is a reasonable choice, which weights 1 hour as being equivalent to 1/4 of a day in terms of learning productivity. $N$ is limited to the current streak of correct responses to eliminate noise from incorrect responses.

Turning now to $\sigma$, we need a way of assessing *accuracy* based on previous tests.
However, its important to note that there is no baseline accuracy measurement, as accuracy is really a function of time that is constantly changing each time a card is relearned.
Instead, we will take a weighted average of past streak of correct responses (excluding the most recent incorrect response and any responses prior to that), which is the same as our calculation of $N$.

Next, we need to turn this into a probability distribution.
In other words, we can view each test as a "trial" in a binomial distribution[^4].
Then, we can use the well-known Rule of Succession to calculate the probability of a future correct response given the previous correct responses (i.e. accuracy)[^5].
This looks like:

$$ \sigma = \frac{N + 1}{N + 2} $$

[^1]: "Spaced Repetition" *Wikipedia* <https://en.wikipedia.org/wiki/Spaced_repetition>
[^2]: Smolen, et al. "The right time to learn: mechanisms and optimization of spaced learning" *Nature* <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5126970/>
[^3]: "Forgetting curves" *Wikipedia* <https://en.wikipedia.org/wiki/Forgetting_curve>
[^4]: "Binomial distribution" *Wikipedia* <https://en.wikipedia.org/wiki/Binomial_distribution>
[^5]: "Rule of Succession" *Wikipedia* <https://en.wikipedia.org/wiki/Rule_of_succession>
