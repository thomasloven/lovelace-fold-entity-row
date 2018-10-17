fold-entity-row
========================

Make a group from entities in a lovelace entities card - and fold them away when you don't want to see them.

---

```yaml
resources:
  - url: /local/fold-entity-row.js
    type: js

views:
  - title: My view
    cards:
    - type: entities
      entities:
      - type: custom:fold-entity-row
        head: input_select.tod
        items:
        - switch.tod_dark
        - entity: input_datetime.tod_morning
          type: custom:time-input-row
        ...
```

![closed open](https://user-images.githubusercontent.com/1299821/47018117-5b0f7d80-d154-11e8-91b1-3405cd5c0662.jpg)

### Options

- `head` (required) - The entity that will be on the top of the list. Can be any type of entity that works in a entities card, with any options. If the entity is a group, the items of the fold will be automatically populated by the entities in the group.
- `items` - Entities in the fold. Can be any kind of entity that works in an entities card, with any options.
- `group_config` - configuration options that will be applied to every entity in the fold.
- `open` - set to `true` to have the fold opened by default.

---

```yaml
  - type: entities
    entities:
      - type: custom:fold-entity-row
        head: group.flux_switches
      - type: custom:fold-entity-row
        head:
          entity: light.taklampa_vardagsrum
          type: custom:toggle-lock-entity-row
        group_config:
          icon: mdi:fan
        items:
          - light.takflakt1
          - light.takflakt2
          - entity: light.takflakt3
            type: custom:slider-entity-row
          - light.takflakt4
      - type: custom:fold-entity-row
        head:
          type: divider
          style:
            height: 30px
            margin: 4px 0
            background: center / contain url("/local/images/divider.png")
            background-repeat: no-repeat
        items:
          - light.takflakt1
          - light.takflakt2
          - light.takflakt3
          - light.takflakt4
```

![special options](https://user-images.githubusercontent.com/1299821/47018785-cf96ec00-d155-11e8-8156-d54524d387ad.jpg)

