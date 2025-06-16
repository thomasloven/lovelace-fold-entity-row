# fold-entity-row

Fold away and hide rows in lovelace [entities](https://www.home-assistant.io/lovelace/entities/) cards.

## Installing

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

Install using HACS or [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

## Quick Start

Add this to an [entities](https://www.home-assistant.io/lovelace/entities/) card:

```yaml
type: entities
entities:
  - light.bed_light
  - type: custom:fold-entity-row
    head: light.bed_light
    entities:
      - light.bed_light
      - light.ceiling_lights
      - light.kitchen_lights
```

This will show the row specified in `head:` with an arrow next to it. When clicked, the rows specified in `entities:` will be revealed.

![fold-entity-row](https://user-images.githubusercontent.com/1299821/59793417-ceb2ed00-92d6-11e9-9a7a-ad0a1a85b5e6.png)

> NOTE: You wouldn't _believe_ how many people miss the first line in this section.
>
> Add this **TO AN ENTITIES CARD**.
>
> This is NOT meant to be used except in an entities card. Any usage outside an entities card is entirely unsupported, and I won't help you fix it.

## Usage

- `head:` and any row in `entities:` can be customized in exactly the same ways as ordinary [entities](https://www.home-assistant.io/lovelace/entities/) card rows.

```yaml
type: entities
entities:
  - type: custom:fold-entity-row
    head:
      type: section
      label: Customizations
    entities:
      - light.bed_light
      - entity: light.ceiling_lights
        name: A light
      - light.kitchen_lights
```

> NOTE: I'm sorry, dear reader, for insulting your intelligence and including the two lines:
>
> ```
> type: entities
> entities:
> ```
>
> in every example, even though it is implied and the fact that fold-entity-row shall only ever be used in an entities card has been thoroughly beaten to death at this point.
>
> I really, really wish I didn't have to...

Another example of customizing the head entity:

```yaml
type: entities
entities:
  - light.bed_light
  - entity: light.bed_light
    icon: mdi:lamp
  - type: custom:fold-entity-row
    head:
      entity: light.bed_light
      icon: mdi:lamp
    entities:
      - light.ceiling_lights
      - light.kitchen_lights
```

> NOTE: On a regretably similar note as above; if it's not entirely obvious to you why the configuration of `head:` looks this way, please do both of us a favor and go back to read the documentation of the [entities](https://www.home-assistant.io/lovelace/entities/) card again. \
> Then play around with **just** the entities card for a while, get to know it, try things out, experiment. Then come back to fold-entity-rows in a week or two.
>
> That also applies if you've never seen `type: section` before and think that's something I just made up. \
> I will not answer any more questions about its use. It's a Home Assistant feature, not a fold-entity-row one.

- Options specified in `group_config:` will be applied to all rows in the fold.

```yaml
type: entities
entities:
  - type: custom:fold-entity-row
    head:
      type: section
      label: group_config
    group_config:
      secondary_info: last-changed
      icon: mdi:desk-lamp
    entities:
      - light.bed_light
      - light.ceiling_lights
      - light.kitchen_lights
```

- The left side padding can be adjusted by the `padding:` parameter (value in pixels).

```yaml
type: entities
entities:
  - type: entities
    entities:
      - type: custom:fold-entity-row
        head:
          type: section
          label: padding
        padding: 5
        entities:
          - light.bed_light
          - light.ceiling_lights
          - light.kitchen_lights
```

- Setting `head:` to a [group](https://www.home-assistant.io/integrations/group/) (including [light group](https://www.home-assistant.io/integrations/light.group/) or [cover group](https://www.home-assistant.io/integrations/cover.group/) ) will populate the entities list with the entities of that group.

```yaml
type: entities
entities:
  - type: custom:fold-entity-row
    head: group.all_lights
```

- Setting `open:` to true will make the fold open by default.

```yaml
type: entities
entities:
  - type: custom:fold-entity-row
    head:
      type: section
      label: open
    open: true
    entities:
      - light.bed_light
      - light.ceiling_lights
      - light.kitchen_lights
```

![options](https://user-images.githubusercontent.com/1299821/59793730-8ba54980-92d7-11e9-894b-50d8a437638a.png)

- If the header or any row in the group has the following tap-, hold- or double-tap-action defined, it will toggle the fold open or closed:

```yaml
tap_action:
  action: fire-dom-event
  fold_row: true
```

- Fold entity row will try to figure out if the header should be clickable to show and hide the fold or not. If it guesses wrong, you can help it with `clickable: true` or `clickable: false`. \
  This should only be used in exceptions, though. If your row supports `tap_action` use `fire-dom-event` instead.

## Advanced

- Folds can be nested

```yaml
type: entities
entities:
  - type: custom:fold-entity-row
    head:
      type: section
      label: Nested
    entities:
      - type: custom:fold-entity-row
        head: light.bed_light
        entities:
          - type: custom:fold-entity-row
            head: light.bed_light
            entities:
              - light.bed_light
```

- Folds can be populated by any wrapping element that fills the `entities:` parameter, such as [auto-entities](https://github.com/thomasloven/lovelace-auto-entities)

```yaml
type: entities
entities:
  - type: custom:auto-entities
    filter:
      include:
        - domain: sensor
    card:
      type: custom:fold-entity-row
      head:
        type: section
        label: Automatically populated
```

> Note: While the built-in `entity-filter` also does work, it is not recommended due to performance issues.

![advanced](https://user-images.githubusercontent.com/1299821/59793890-ed65b380-92d7-11e9-9ed6-8dc1c15d749b.png)

- If `entity` (not `entities`) is set and is a group, it will be expanded

```yaml
type: custom:auto-entities
card:
  type: entities
  title: All groups
filter:
  include:
    - domain: group
      options:
        type: custom:fold-entity-row
```

![image](https://user-images.githubusercontent.com/1299821/62471886-e4ed0d80-b79d-11e9-97b4-7edb721338cc.png)

## More examples

All my test cases are available in the `test/views` directory.

You can a demo in docker by going to the `test` directory and running:

```
docker-compose up
```

Then going to `http://localhost:8125` and logging in with username `dev` and password `dev`.

Or you could use the vscode devcontainer and run the task "`Run hass`".

## FAQ

### Why isn't the card header toggle working with all the entities in my fold?

This is a limitation in Home Assistant. The header toggle will look at each entry in the `entities` card, and if it has an `entity` option, it will toggle that. Nothing more.

### Why is there a line above the section row?

Because that's how the [Home Assistant Section Entities Row](https://www.home-assistant.io/lovelace/entities/#section) looks.

### Why all the passive aggressivenes?

I'm just So Bloody Tired of this - that's why.

NOT EVERYTHING IN LOVELACE IS A CARD!

### Does anyone ever actually ask the questions in your Frequently Asked Questions?

No

### Why doesn't this card have a background?

Please leave

---

<a href="https://www.buymeacoffee.com/uqD6KHCdJ" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
