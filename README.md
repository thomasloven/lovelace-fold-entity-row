folding-group-entity-row
========================

Display all entities in a group on a lovelace entities card - and fold it away when you don't want to see it.

---

```yaml
resources:
  - url: /local/folding-group-entity-row.js
    type: js

views:
  - title: My view
    cards:
    - type: entities
      entities:
      - entity: group.my_group
        type: custom:folding-group-entity-row
```

![folding_group_demo1](https://user-images.githubusercontent.com/1299821/46227495-ac033180-c35f-11e8-8c6c-acdb74bc5087.png)

### Other options

- `config:` Config options to apply to each row in the group - same as for entity card
- `group_config:` Config options to apply to the group row - same as for entity card

Example:
```yaml
      - entity: group.my_group
        type: custom:folding-group-entity-row
        config:
          secondary_info: entity-id
        group_config:
          secondary_info: last-changed
          type: custom:toggle-lock-entity-row
```

![folding_group_demo2](https://user-images.githubusercontent.com/1299821/46227497-adccf500-c35f-11e8-9942-769bbd4931c1.png)
