This is a maintained fork of [cannon.js](https://github.com/schteppe/cannon.js), originally created by Stefan Hedman [@schteppe](https://github.com/schteppe).

It's a type-safe flatbundle (esm and cjs) which allows for **tree shaking** and usage in **typescript** environments.

These minor changes and improvements were also made:

- These PRs from the original repo were merged: https://github.com/schteppe/cannon.js/pull/433, https://github.com/schteppe/cannon.js/pull/430, https://github.com/schteppe/cannon.js/pull/418, https://github.com/schteppe/cannon.js/pull/360, https://github.com/schteppe/cannon.js/pull/265
- The `ConvexPolyhedron` constructor now accepts an object instead of a list of arguments https://github.com/react-spring/cannon-es/pull/6
- `World.activeBodies: Body[]` has been replaced with `World.hasActiveBodies: boolean`
- Deprecated properties and methods have been removed

## Installation

```
yarn add cannon-es
```

## Usage

```js
import { World } from 'cannon-es'

// ...
```

or, if you're using webpack, you can import it like this while still taking advantage of tree shaking:

```js
import * as CANNON from 'cannon-es'

// ...
```

<!-- ## [Documentation]() -->

## [Examples](https://react-spring.github.io/cannon-es/)

#### TO DO:

- Correct & standardize JSDoc comments
- Fix Octree `as any` assertions, and remove `as any` type assertions wherever possible
- Remove use of defined assertion (!) where possible (profile performance to ensure no degradation)
- Convert to static methods where possible? (memory savings)
- Convert to abstract classes where possible (Equation, Solver, etc.?)
- Test possible performance improvements by converting arrays and objects to Maps
- V-HACD support (https://github.com/react-spring/use-cannon/issues/35#issuecomment-600188994)
- Explore performance enhancements:
  - https://github.com/RandyGaul/qu3e
  - https://github.com/RandyGaul/cute_headers
  - https://github.com/TheRohans/dapao/issues?q=is%3Aissue
  - https://github.com/swift502/Sketchbook/commits/master/src/lib/cannon/cannon.js
  - https://github.com/schteppe/cannon.js/pulls
