class FoldingGroupRow extends Polymer.Element {

  static get template() {
    return Polymer.html`
    <style>
      li, ul {
        list-style: none;
      }
      ul {
        transition: max-height 0.5s;
        -webkit-transition: max-height 0.5s;
        overflow: hidden;
        padding: 0 0 0 40px;
        margin: 0;
      }
      .closed > ul {
        max-height: 0;
      }
      .open > ul {
        max-height: 40px;
      }
      #head {
        display: flex;
        align-items: center;
      }
      .toggle {
        width: 40px;
        height: 40px;
        align-items: center;
        display: flex;
      }
      .toggle ha-icon {
        flex: 0 0 40px;
      }
    </style>
    <div id=head>
      <div class=toggle on-click="doToggle">
      <ha-icon icon="[[_icon]]"></ha-icon>
      </div>
    </div>
    <li id="rows" class="closed">
    </li>
    `
  }

  update() {
    this._icon = this.closed ? 'mdi:menu-right' : 'mdi:menu-down';
    if(this.$)
      this.$.rows.className = this.closed ? 'closed' : 'open';

  }

  doToggle(ev) {
    this.closed = !this.closed;
    this.update();
    ev.stopPropagation();
  }

  ready() {
    super.ready();
    let conf = [Object.assign({entity: this._config.entity}, this._config.group_config || {})];
    this._hass.states[this._config.entity].attributes.entity_id.forEach((e) => {
      conf.push(Object.assign({entity: e}, this._config.config || {}));
    });
    this.dummy = document.createElement('hui-entities-card');
    this.dummy.setConfig({entities: conf});
    this.dummy.hass = this._hass;
    this.appendChild(this.dummy);

    let divs = this.dummy.shadowRoot.querySelector("ha-card").querySelector("#states");
    let head = divs.firstChild.firstChild;
    head.style.width = '100%';
    this._addHeader(head);
    while(divs.firstChild) {
      this._addRow(divs.firstChild);
    }

    this.removeChild(this.dummy);
  }

  _addHeader(row)
  {
    this.$.head.appendChild(row);
  }
  _addRow(row)
  {
    let item = document.createElement('ul');
    item.appendChild(row);
    this.$.rows.appendChild(item);
  }

  setConfig(config) {
    this._config = config;
    this.closed = true;
    this.update();
  }

  set hass(hass) {
    this._hass = hass;
    if(this.dummy)
      this.dummy.hass = hass;
  }

}

customElements.define('folding-group-entity-row', FoldingGroupRow);
