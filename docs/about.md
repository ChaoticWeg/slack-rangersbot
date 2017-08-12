---
layout: default
title: About
---

## Background

The MLB provides scores and live game updates via a service called [Gameday](https://www.mlb.com/scores). A quick peek 
under the hood exposes a REST API that we can hook into, which is the basis for several existing npm modules. Since we 
only really need two MLB-related functions (`game/:id/feed/live` for live game data and `schedule` for upcoming games), 
it's easiest just to roll our own.

While discussing an ongoing baseball game, users may experience various, distinct delays: the FM radio broadcast is 
quicker than the local TV broadcast, which is quicker than streaming audio and video from the MLB. This makes it 
difficult for Slack users to discuss the ongoing game and react to plays without spoiling them for others who are 
behind. RangersBot aims to provide a cue for users to react in chat to the previous play, while providing an 
informative description of the play for users who are not able to keep up with the game otherwise.

## Implementation

RangersBot has already been implemented by [/u/snang](https://reddit.com/u/snang). The existing implementation must be 
manually run by a team admin, making it difficult at times to find someone available to host and run the bot during a 
game. This new implementation is written to be portable and platform-independent (via Node.js) and will be run on an 
Amazon EC2 server.

The goal here is for RangersBot to be easily managed by several users.