# Integration Manifests

## Purpose

An integration manifest is a versioned JSON document describing the credentials, triggers and actions an integration makes available to Weave Engine.

## Manifest structure

A manifest contains:

- `schemaVersion` - Version of the WeaveNG manifest format.
- `id` - Stable integration identifier, unique in the platform, may be prefixed with an owner id.
- `version` - Immutable manifest version.
- `name` - Display name.
- `credentials` - Integration-managed credential definitions, importantly a definition of a credential, not actual credentials.
- `triggers` - Trigger definitions, defines what triggers this integration makes available.
- `actions` - Action definitions, defines what actions this integration makes available.

The integration `id` scopes all credentials, triggers, and actions in the manifest.

## Internal integrations

Internal integrations are trusted systems operated as part of Weave Engine. Their manifests may define integration-managed credentials and contain complete internal URLs.

### GitHub example

```json
{
  "schemaVersion": 1,
  "id": "github",
  "version": "1.0.0",
  "name": "GitHub",
  "credentials": [
    {
      "id": "github.oauth2",
      "type": "oauth2",
      "name": "GitHub OAuth",
      "flow": "client_credentials",
      "tokenUrl": "https://github-auth-server.com/v1/token"
    }
  ],
  "triggers": [
    {
      "id": "issue-opened",
      "name": "Issue Opened",
      "credential": "github.oauth2",
      "registration": {
        "method": "POST",
        "url": "https://github.integration.internal/v1/triggers/issue-opened/register"
      },
      "configuration": {
        "owner": {
          "type": "string",
          "required": true
        },
        "repository": {
          "type": "string",
          "required": true
        }
      },
      "event": {
        "owner": {
          "type": "string",
          "required": true
        },
        "repository": {
          "type": "string",
          "required": true
        },
        "issueNumber": {
          "type": "integer",
          "required": true
        },
        "title": {
          "type": "string",
          "required": true
        },
        "body": {
          "type": "string",
          "required": false
        },
        "author": {
          "type": "string",
          "required": true
        },
        "url": {
          "type": "string",
          "required": true
        }
      }
    }
  ],
  "actions": [
    {
      "id": "add-comment",
      "name": "Add Comment",
      "credential": "github.oauth2",
      "execution": {
        "method": "POST",
        "url": "https://github.integration.internal/v1/actions/add-comment/execute"
      },
      "input": {
        "owner": {
          "type": "string",
          "required": true
        },
        "repository": {
          "type": "string",
          "required": true
        },
        "issueNumber": {
          "type": "integer",
          "required": true
        },
        "body": {
          "type": "string",
          "required": true
        }
      },
      "output": {
        "commentId": {
          "type": "integer",
          "required": true
        },
        "url": {
          "type": "string",
          "required": true
        }
      }
    }
  ]
}
```

### Internal credential ownership

The GitHub integration owns credentials identified by `github.oauth2`. Control stores the credential identifier and display metadata, while the GitHub integration stores the OAuth values.

```json
{
  "id": "github-credential-123",
  "organisationId": "organisation-123",
  "credential": "github.oauth2",
  "name": "WeaveNG GitHub Account"
}
```

When Engine calls the internal GitHub integration, it sends `github-credential-123`. The GitHub integration resolves the credential and uses it when calling GitHub.

The credential used to authenticate Engine to the GitHub integration is separate service-to-service authentication.

## External integrations

An organisation may register an externally hosted integration. Its manifest contains complete HTTPS URLs but cannot define its own credentials.

External manifests may reference only platform credentials owned by the internal HTTP Integration system, such as `http.oauth2`.

Engine never calls an external manifest URL directly. It delegates the request to HTTP Integration. Engine sends the credential identifier only to that trusted internal system. HTTP Integration resolves and applies the credential before making the external request.

### External example

```json
{
  "schemaVersion": 1,
  "id": "acme-issues",
  "version": "1.0.0",
  "name": "Acme Issues",
  "triggers": [
    {
      "id": "issue-opened",
      "name": "Issue Opened",
      "credential": "http.oauth2",
      "registration": {
        "method": "POST",
        "url": "https://integrations.acme.example/weaveng/v1/triggers/issue-opened/register"
      },
      "configuration": {
        "project": {
          "type": "string",
          "required": true
        }
      },
      "event": {
        "project": {
          "type": "string",
          "required": true
        },
        "issueNumber": {
          "type": "integer",
          "required": true
        },
        "title": {
          "type": "string",
          "required": true
        },
        "body": {
          "type": "string",
          "required": false
        }
      }
    }
  ],
  "actions": [
    {
      "id": "add-comment",
      "name": "Add Comment",
      "credential": "http.oauth2",
      "execution": {
        "method": "POST",
        "url": "https://integrations.acme.example/weaveng/v1/actions/add-comment/execute"
      },
      "input": {
        "project": {
          "type": "string",
          "required": true
        },
        "issueNumber": {
          "type": "integer",
          "required": true
        },
        "body": {
          "type": "string",
          "required": true
        }
      },
      "output": {
        "commentId": {
          "type": "integer",
          "required": true
        },
        "url": {
          "type": "string",
          "required": true
        }
      }
    }
  ]
}
```

The organisation supplies the manifest JSON or a URL from which Control can retrieve it. A compatible HTTP credential is selected when configuring each trigger or action node.

## Organisation integration versions

Integration version selection belongs to the organisation, not to individual Weaves.

```json
{
  "organisationId": "organisation-123",
  "integrations": {
    "github": {
      "version": "1.0.0"
    },
    "acme-issues": {
      "version": "1.0.0"
    }
  }
}
```

The selected version controls which credential, trigger, and action definitions are available while authoring and validating Weaves.

## Weave references

Editable Weaves reference integration and capability identifiers without an integration version.

### Trigger reference

```json
{
  "integration": "github",
  "trigger": "issue-opened",
  "credentialId": "github-credential-123",
  "configuration": {
    "owner": "weaveng",
    "repository": "weaveng.io"
  }
}
```

### Action node reference

```json
{
  "id": "comment-on-issue",
  "integration": "github",
  "action": "add-comment",
  "credentialId": "github-credential-123",
  "input": {
    "owner": "${trigger.owner}",
    "repository": "${trigger.repository}",
    "issueNumber": "${trigger.issueNumber}",
    "body": "Thanks for opening this issue."
  }
}
```

The node does not require a separate `type` field. `integration` and `action` identify the capability Engine must execute.

## Deployment integration lock

When Control publishes a Weave, it resolves each integration against the organisation's selected version and records the result in the deployment artifact.

```json
{
  "weaveId": "weave-123",
  "deploymentVersion": 7,
  "integrationLock": {
    "github": "1.0.0"
  }
}
```

Changing an organisation's selected integration version does not alter an existing deployment. Affected Weaves must be validated and republished before they use the new version.

## Trigger registration

When a published Weave becomes active, the platform registers its trigger using the resolved manifest.

### Internal trigger

The platform calls the internal integration's `registration.url` and sends the integration-managed credential identifier.

```json
{
  "registrationId": "trigger-registration-456",
  "credentialId": "github-credential-123",
  "configuration": {
    "owner": "weaveng",
    "repository": "weaveng.io"
  },
  "callbackUrl": "https://triggers.weaveng.io/integrations/trigger-registration-456"
}
```

The internal integration resolves the credential and registers the provider trigger.

### External trigger

The platform sends an internal request to HTTP Integration containing the selected HTTP credential and the external request to perform.

```json
{
  "organisationId": "organisation-123",
  "credentialId": "http-oauth-123",
  "request": {
    "method": "POST",
    "url": "https://integrations.acme.example/weaveng/v1/triggers/issue-opened/register",
    "body": {
      "registrationId": "trigger-registration-789",
      "configuration": {
        "project": "WEAVE"
      },
      "callbackUrl": "https://triggers.weaveng.io/integrations/trigger-registration-789"
    }
  }
}
```

HTTP Integration verifies that the credential belongs to the organisation, resolves it, validates the target URL, and applies the credential to the outbound request.

The external integration receives only the request body:

```json
{
  "registrationId": "trigger-registration-789",
  "configuration": {
    "project": "WEAVE"
  },
  "callbackUrl": "https://triggers.weaveng.io/integrations/trigger-registration-789"
}
```

Neither the credential identifier nor credential values are sent externally.

## Trigger delivery

When an integration detects an event, it sends the event to the callback URL issued during trigger registration.

```json
{
  "eventId": "integration-event-123",
  "event": {
    "project": "WEAVE",
    "issueNumber": 42,
    "title": "Example issue",
    "body": "Something is broken"
  }
}
```

Authentication for inbound calls to Trigger Handler is separate from the outbound credential used during trigger registration.

## Action execution

### Internal action

Engine calls the internal integration's `execution.url` and sends its integration-managed credential identifier.

```json
{
  "organisationId": "organisation-123",
  "executionId": "execution-123",
  "nodeId": "comment-on-issue",
  "credentialId": "github-credential-123",
  "input": {
    "owner": "weaveng",
    "repository": "weaveng.io",
    "issueNumber": 42,
    "body": "Thanks for opening this issue."
  }
}
```

The internal integration resolves the credential and performs the provider request.

### External action

Engine sends an internal request to HTTP Integration. The request contains the selected HTTP credential identifier and the target defined by the external manifest.

```json
{
  "organisationId": "organisation-123",
  "credentialId": "http-oauth-123",
  "request": {
    "method": "POST",
    "url": "https://integrations.acme.example/weaveng/v1/actions/add-comment/execute",
    "body": {
      "executionId": "execution-123",
      "nodeId": "comment-on-issue",
      "input": {
        "project": "WEAVE",
        "issueNumber": 42,
        "body": "Thanks for opening this issue."
      }
    }
  }
}
```

HTTP Integration verifies ownership, resolves and applies the credential, validates the target URL, and makes the external request.

The external integration receives only:

```json
{
  "executionId": "execution-123",
  "nodeId": "comment-on-issue",
  "input": {
    "project": "WEAVE",
    "issueNumber": 42,
    "body": "Thanks for opening this issue."
  }
}
```

Credential identifiers and credential values never leave WeaveNG.

### Action response

HTTP Integration returns the external response to Engine. Engine validates it against the action's declared output.

```json
{
  "output": {
    "commentId": 123456,
    "url": "https://integrations.acme.example/issues/42/comments/123456"
  }
}
```

Failures use a common error envelope:

```json
{
  "error": {
    "code": "rate-limited",
    "message": "The integration rejected the request because its rate limit was exceeded.",
    "retryable": true
  }
}
```

## Validation and security

Control validates every manifest before making it available.

All manifests must satisfy these rules:

- `schemaVersion`, `id`, `version`, and `name` are required.
- Integration, credential, trigger, and action identifiers use a restricted lowercase format.
- Credential, trigger, and action identifiers are unique within the manifest.
- Field types are supported and every field declares `required`.
- Manifest size and field counts are bounded.
- A registered manifest version is immutable.

Trusted internal manifests may define namespaced credentials such as `github.oauth2` and use URLs approved for the internal environment.

External manifests:

- Cannot define credentials.
- May reference only credentials owned by HTTP Integration, such as `http.oauth2`.
- Must provide complete HTTPS URLs.
- Are rejected when a URL targets a disallowed internal, private, link-local, or metadata address.

HTTP Integration repeats URL validation when executing a request and verifies that the selected credential belongs to the organisation.

When publishing a Weave, Control verifies that:

- Every referenced integration has an organisation-level version selection.
- Referenced triggers and actions exist in the selected manifests.
- Selected credentials match the required credential identifiers.
- Required configuration and input mappings are present.
- The deployment artifact contains a complete integration lock.