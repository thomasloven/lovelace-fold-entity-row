class FoldRow extends Polymer.Element {

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
      #bar.closed {
        max-height: 0;
      }
      #bar.open {
        height: 1px;
        background-color: var(--secondary-text-color);
        opacity: 0.25;
        margin-left: -16px;
        margin-right: -16px;
        margin-top: 8px;
        margin-bottom: 8px;
      }
    </style>
    <div id=topbar class=nobar></div>
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
    this._icon = this.closed ? 'mdi:chevron-down' : 'mdi:chevron-up';
    if(this.$) {
      this.$.rows.className = this.closed ? 'closed' : 'open';
    }
  }

  doToggle(ev) {
    this.closed = !this.closed;
    this.update();
    ev.stopPropagation();
  }


  ready() {
    super.ready();
    let conf = [];
    let head = this._config.head;
    let items = this._config.items;
    if(typeof head === 'string') {
      head = {entity: head};
    }
    conf.push(head);
    if(head.entity && head.entity.startsWith('group')) {
      items = this._hass.states[head.entity].attributes.entity_id;
    }
    items.forEach((i) => {
      if(typeof i === 'string') i = {entity: i};
      conf.push(Object.assign(i, this._config.group_config));
    });

    this.items = [];

    this.dummy = document.createElement('hui-entities-card');
    this.dummy.setConfig({entities: conf});
    this.dummy.hass = this._hass;
    this.appendChild(this.dummy);

    const nextChild = (root) => {
      let child = root.firstChild;
      while(child && child.nodeType != 1) child = child.nextSibling;
      return child;
    }

    this.dummy.updateComplete.then( () => {

      let divs = this.dummy.shadowRoot.querySelector("ha-card").querySelector("#states");
      let child = nextChild(divs)
      this._addHeader(child, conf.shift())
      while(child = nextChild(divs)) {
        this._addRow(child, conf.shift());
      }

      this.update();
    });
  }

  _addHeader(row, data)
  {
    this.$.head.insertBefore(row, this.$.head.firstChild);
    row.style.width = '100%';
    if(row.tagName === 'DIV') {
      row = row.children[0];
    }
    this.items.push(row);
    if(row.tagName === 'HUI-SECTION-ROW'){
      if(row.updateComplete) {
        row.updateComplete.then( () => {
          row.shadowRoot.querySelector('.divider').style.marginRight = '-53px';
          if (!this.parentElement.previousElementSibling) {
            row.shadowRoot.querySelector('.divider').style.visibility = 'hidden';
            row.shadowRoot.querySelector('.divider').style.marginTop = '0';
          }
        });
      } else {
        row.shadowRoot.querySelector('.divider').style.marginRight = '-53px';
        if (!this.parentElement.previousElementSibling) {
          row.shadowRoot.querySelector('.divider').style.visibility = 'hidden';
          row.shadowRoot.querySelector('.divider').style.marginTop = '0';
        }
      }
    }
  }
  _addRow(row, data)
  {
    if(row.tagName === 'DIV') {
      this.items.push(row.children[0]);
    } else {
      this.items.push(row);
    }
    let item = document.createElement('ul');
    item.appendChild(row);
    row.classList.add('state-card-dialog');
    row.addEventListener('click', (e) => {
      let ev = new Event('hass-more-info', {
        bubbles: true,
        cancelable: false,
        composed: true,
      });
      const entityId = data.entity;
      ev.detail = { entityId };
      this.dispatchEvent(ev);
      e.stopPropagation();
    });
    this.$.rows.appendChild(item);
  }

  setConfig(config) {
    if (config.entity || config.config) {
      throw new Error("Breaking changes have been introduced. Please see https://github.com/thomasloven/lovelace-fold-entity-row");
    }
    this._config = config;
    this.closed = !this._config.open;
    this.update();
  }

  set hass(hass) {
    this._hass = hass;
  if(this.dummy)
  this.dummy.hass = hass;
    if(this.items && this.items.forEach)
      this.items.forEach( (c) => c.hass = hass);
  }
}

customElements.define('fold-entity-row', FoldRow);
