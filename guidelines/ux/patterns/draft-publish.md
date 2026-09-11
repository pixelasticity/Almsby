# Draft / Publish

## Problem

Users need to work on content without accidentally exposing incomplete or incorrect information publicly.

## States

At minimum, distinguish:

- Draft
- Published
- Unpublished
- Processing, where relevant
- Failed, where relevant

## Pattern

Editing should be safe to perform without implying that changes are already public.

Publishing is an explicit state transition.

The interface should communicate:

- current state;
- what the user is changing;
- whether the public experience is affected;
- what happens after the action.

## Guardrails

Never imply that a draft is publicly live.

Never silently publish consequential content.

If publication fails, explain the failure and provide a recovery path.
