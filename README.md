# (WIP) nexus-plugin-auth0 <!-- omit in toc -->

**Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Example Usage](#example-usage)
- [Runtime Contributions](#runtime-contributions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br>

## Installation

```
npm install nexus-plugin-auth0
```

<br>

## Example Usage

```ts
use(
  auth({
    auth0Audience: 'nexus-plugin-auth0',
    auth0Domain: 'graphql-nexus.eu.auth0.com',
    protectedPaths: ['Query.posts'],
  })
)
```
### Settings
```ts
type Settings = {
  auth0Domain: string
  auth0Audience: string
  protectedPaths?: string[]
  debug?: boolean
}

```

<br>

## Runtime Contributions

TODO
