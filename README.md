fold-entity-row
===============

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

Fold away and hide rows in lovelace [entities](https://www.home-assistant.io/lovelace/entities/) cards.

For installation instructions [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

Install `fold-entity-row.js` as a `module`.

```yaml
resources:
  - url: /local/fold-entity-row.js
    type: module
```

## Usage
Add this to an entities card:

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

### Options

- `head:` and any row in `entities:` can be customized in exactly the same ways as ordinary [entities](https://www.home-assistant.io/lovelace/entities/) card rows.

```yaml
type: custom:fold-entity-row
head:
  type: section
  label: Customizations
entities:
  - light.bed_light
  - entity: light.ceiling_lights
    name: A light
  - light.kitchen_lights
```

- Options specified in `group_config:` will be applied to all rows in the fold.

```yaml
type: custom:fold-entity-row
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
type: custom:fold-entity-row
head:
  type: section
  label: padding
padding: 5
entities:
  - light.bed_light
  - light.ceiling_lights
  - light.kitchen_lights
```

- Setting `head:` to a group will populate the entities list with the entities of that group.

```yaml
type: custom:fold-entity-row
head: group.all_lights
```

- Setting `open:` to true will make the fold open by default.

```yaml
type: custom:fold-entity-row
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

### Advanced

- Folds can be nested

```yaml
type: custom:fold-entity-row
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
type: custom:auto-entities
filter:
  include:
    - domain: sensor
card:
  type: custom:fold-entity-row
  head:
    type: section
    label: Automatically populated
```

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


---
<a href="https://www.buymeacoffee.com/uqD6KHCdJ" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
