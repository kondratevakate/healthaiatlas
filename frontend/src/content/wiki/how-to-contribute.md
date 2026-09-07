---
title: How to contribute to the Atlas wiki
summary: What an Atlas wiki article is, the evidence standard every claim must meet, and the two-click path from reading a page to opening a pull request.
tags: [meta, contributing]
updated: 2026-09-07
authors: [Kate Kondrateva]
---

The Atlas wiki holds the **explanatory layer** of HealthAI Atlas. The directory
answers *who* and *what*; the wiki answers *why it works this way*, *how the
regulation is actually shaped*, and *what a newcomer needs before the data means
anything*.

## What belongs here

- Concept explainers — a mechanism, a regulatory instrument, a technical method.
- Landscape notes — how a field is organised, who the actors are, where the gaps sit.
- Method notes — how a particular Atlas dataset was assembled and what it cannot tell you.

## What does not belong here

- Structured records about specific organisations, deals, or events. Those are
  data, and data goes through the verification pipeline into the directory —
  not into prose.
- Opinion pieces with no evidence trail.
- Duplicates of a page that already exists elsewhere in the Atlas. Link to it instead.

## The evidence standard

This is the part that is not negotiable.

**Every factual assertion carries a link to primary evidence** — the regulator's
own document, the journal article, the company's own filing. Not a news summary
of the document. Not a blog post about the article.

If you cannot find primary evidence for a sentence, you have three options, in
order of preference:

1. Cut the sentence.
2. Rewrite it as a question the wiki has not yet answered.
3. Keep it and label it explicitly as inference: *"No primary source located;
   this is an inference from X and Y."*

Never invent a URL that looks plausible. A dead link is worse than no link,
because it reads as verified when it is not.

## How to edit

Every article has an **Edit this page** link at the bottom. It opens the file in
GitHub's web editor. Make your change, write one sentence describing it, and
GitHub opens a pull request for you. No local setup, no build, no command line.

To start a new article, use **Propose an article** on the wiki index. Copy the
frontmatter block from any existing file — `title`, `summary`, `tags`, `updated`,
`authors` are all required, and the build fails loudly if one is missing or
malformed.

## Review

Pull requests are reviewed before merge. Review checks two things: that the
evidence standard above holds, and that the article does not restate a page the
Atlas already has. Expect questions about sources — they are not a challenge to
your competence, they are the product.
