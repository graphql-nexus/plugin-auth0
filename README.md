# nexus-plugin-auth0 <!-- omit in toc -->
![npm](https://img.shields.io/npm/v/nexus-plugin-auth0?style=flat-square)
![npm (tag)](https://img.shields.io/npm/v/nexus-plugin-auth0/next?style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)


**Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [How it Works](#how-it-works)
- [Examples](#examples)
  - [Protected Paths](#protected-paths)
  - [Usage with **nexus-plugin-shield**](#usage-with-nexus-plugin-shield)
- [Plugin Settings](#plugin-settings)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br>

## Installation

```
npm install nexus-plugin-auth0
```

<br>

## How it Works

The plugin currently expects the "UsersAccessToken" to be in the following format on the header of the incoming request.

```json
{
  "authorization": "Bearer UsersAccessToken"
}
```

There are two main ways to use this plugin.

1. Using the `protectedPaths` to deny access to certain paths.
1. Using it to only validate and decode then to using the decoded token (available as ctx.token) to control access using another plugin such as `nexus-plugin-sheild`

The decoded token will be added to Nexus Context under `ctx.token` which has the following type

```ts
type DecodedAccessToken = {
  iss: string
  sub: string
  aud: string[]
  iat: number
  exp: number
  azp: string
  scope: string
}
// ctx.token
type ContextToken = DecodedAccessToken | null
```

## Examples

### Protected Paths

If `protectedPaths` is passed, then only valid access tokens will be allowed to access these paths

```ts
import { use } from 'nexus'
import { auth } from 'nexus-plugin-auth0'

use(
  auth({
    auth0Audience: 'nexus-plugin-auth0',
    auth0Domain: 'graphql-nexus.eu.auth0.com',
    protectedPaths: ['Query.posts'],
  })
)
```

### Usage with **nexus-plugin-shield**

All paths will have the decoded token added to `ctx` only if the token is validated but will not deny access. The token can then be used by `nexus-plugin-shield` to control access.

```ts
import { use } from 'nexus'
import { auth } from 'nexus-plugin-auth0'
import { rule } from 'nexus-plugin-shield'


const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx: NexusContext, info) => {
  const userId = ctx?.token?.sub
  return Boolean(userId)
})

const rules = {
  Query: {
    posts: isAuthenticated,
  },
  Mutation: {
    deletePost: isAuthenticated,
  },
}

use(
  auth({
    auth0Audience: 'nexus-plugin-auth0',
    auth0Domain: 'graphql-nexus.eu.auth0.com',
  })
)

use(
  shield({
    rules,
  })
)
```

## Plugin Settings

```ts
type Settings = {
  auth0Domain: string
  auth0Audience: string
  protectedPaths?: string[]
  debug?: boolean
}
```

<br>
