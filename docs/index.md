---
layout: default
---

# RangersBot

RangersBot watches Texas Rangers games and announces each play to the [RangerFam](https://reddit.com/r/TexasRangers) 
Slack. RangersBot is written entirely in JavaScript and runs on [Node.js](https://nodejs.org/)

### Planned features

- Configurable announcement delay
- New, informative messages that enhance MLBAM-provided play descriptions
- Simple multi-user management
- ...and more

### Copyright

RangersBot is provided for free under the [GNU GPLv3](//www.gnu.org/licenses/gpl-3.0.en.html). More information can be found in [LICENSE.txt](//github.com/ChaoticWeg/slack-rangersbot/blob/master/LICENSE.txt).

Since RangersBot makes use of MLBAM's in an individual, non-commercial, non-bulk way, it complies with their copyright statement, found [here](//gdx.mlb.com/components/copyright.txt).

{% if site.links %}
### Links

<ul>
    {% for link in site.links %}
        <li><a href="{{ link.href }}">{{ link.name }}</a></li>
    {% endfor %}
</ul>
{% endif %}