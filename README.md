# Coaster

## Mission

Coaster is a convention-oriented framework for rapidly creating distributed, high-performance applications suitable for mid-to-large-size teams.

### Guiding principles

- Convention over configuration
  Although configuration is required, Coaster strives to provide reasonable defaults that can later be modified and/or expanded to suit specific needs

- There is always an escape hatch, for when convention isn't enough
  Convention represents only our reasonable defaults, but those defaults can always be overridden.

- Designed to replace
  Coaster is a core CLI tool and infrastructure runner. It can be swapped out and replaced if necessary. The code you write in Coaster is your business, and should be as portable as your business requires.

- Communication through primitives
  Coaster tracks need to be able to communicate with one another. To do so in a portable, scalable way, a singular, guiding principal for Coaster is that all communication through layers occurs through JSON primitives, allowing cross-track communication via any mechanism the user requires. This allows users to setup complex, distributed systems with ease.
