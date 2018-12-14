fold-entity-row
========================

Make a group from entities in a lovelace entities card - and fold them away when you don't want to see them.

This card requires [card-tools](https://github.com/thomasloven/lovelace-card-tools) to be installed.

## Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:fold-entity-row`
| head | entity/object | **Required** | The entity or row that should be the header
| items | list | none | Entites or rows to put in the fold
| group_config | object | none | Extra options to put on each item in the list
| open | boolean | false | Set to true to have the fold opened by default

---

```yaml
type: entities
title: Folding entities
entities:
  - light.bed_light
  - type: custom:fold-entity-row
    head: sensor.yr_symbol
    items:
      - sensor.outside_humidity
      - sensor.outside_temperature
  - light.bed_light
  - type: custom:fold-entity-row
    head:
      type: section
      label: Lights
    group_config:
      secondary_info: last-changed
    items:
      - light.bed_light
      - light.ceiling_lights
      - light.kitchen_lights
  - light.bed_light
```

![fold-entity-row](https://user-images.githubusercontent.com/1299821/47855185-281be980-dde4-11e8-92a6-643e8a47d8e9.png)

### Groups will populate the fold automatically

If the head is a group, `items:` will be ignored and the fold will instead be filled with the entities in the group.

```yaml
type: entities
title: Folding groups
entities:
  - type: custom:fold-entity-row
    head: group.all_lights
  - type: custom:fold-entity-row
    head: group.all_scripts
  - type: custom:fold-entity-row
    head: group.all_automations
```

![folding groups](https://user-images.githubusercontent.com/1299821/47855259-5d283c00-dde4-11e8-8405-94c269e53935.png)
