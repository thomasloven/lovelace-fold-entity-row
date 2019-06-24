!function(e){var t={};function i(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){"use strict";i.r(t);const n=Object.getPrototypeOf(customElements.get("home-assistant-main")),o=n.prototype.html,s=n.prototype.css;function r(e,t,i=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},i)i.dispatchEvent(e);else{var n=document.querySelector("home-assistant");(n=(n=(n=(n=(n=(n=(n=(n=(n=(n=(n=n&&n.shadowRoot)&&n.querySelector("home-assistant-main"))&&n.shadowRoot)&&n.querySelector("app-drawer-layout partial-panel-resolver"))&&n.shadowRoot||n)&&n.querySelector("ha-panel-lovelace"))&&n.shadowRoot)&&n.querySelector("hui-root"))&&n.shadowRoot)&&n.querySelector("ha-app-layout #view"))&&n.firstElementChild)&&n.dispatchEvent(e)}}const a="custom:";function c(e,t){const i=document.createElement("hui-error-card");return i.setConfig({type:"error",error:e,config:t}),i}function l(e,t){if(!t||"object"!=typeof t||!t.type)return c(`No ${e} type configured`,t);let i=t.type;if(i=i.startsWith(a)?i.substr(a.length):`hui-${i}-${e}`,customElements.get(i))return function(e,t){const i=document.createElement(e);try{i.setConfig(t)}catch(e){return c(e,t)}return i}(i,t);const n=c(`Custom element doesn't exist: ${i}.`,t);n.style.display="None";const o=setTimeout(()=>{n.style.display=""},2e3);return customElements.whenDefined(i).then(()=>{clearTimeout(o),r("ll-rebuild",{},n)}),n}customElements.define("fold-entity-row",class extends n{static get properties(){return{hass:{},open:Boolean}}setConfig(e){this._config=Object.assign({},{open:!1,padding:20,group_config:{}},e),this.open=this._config.open,this._head=this._renderRow(this._config.head,!0);let t=this._config.items;this._config.entities&&(t=this._config.entities),"string"==typeof this._config.head&&this._config.head.startsWith("group.")&&(t=document.querySelector("home-assistant").hass.states[this._config.head].attributes.entity_id),t&&(this._entities=t.map(e=>this._renderRow(e)))}_renderRow(e,t=!1){e="string"==typeof e?{entity:e}:e,t||(e=Object.assign({},this._config.group_config,e));const i=function(e){const t=new Set(["call-service","divider","section","weblink"]);if(!e||"object"!=typeof e||!e.entity&&!e.type)return c("Invalid configuration given.",e);const i=e.type||"default";if(t.has(i)||i.startsWith(a))return l("row",e);const n=e.entity.split(".",1)[0];return Object.assign(e,{type:{alert:"toggle",automation:"toggle",climate:"climate",cover:"cover",fan:"toggle",group:"group",input_boolean:"toggle",input_number:"input-number",input_select:"input-select",input_text:"input-text",light:"toggle",lock:"lock",media_player:"media-player",remote:"toggle",scene:"scene",script:"script",sensor:"sensor",timer:"timer",switch:"toggle",vacuum:"toggle",water_heater:"climate",input_datetime:"input-datetime"}[n]||"text"}),l("entity-row",e)}(e);return e.entity&&!["input_number","input_select","input_text","input_datetime","scene","weblink"].includes(e.entity.split(".",1)[0])?i.addEventListener("click",()=>{r("hass-more-info",{entityId:e.entity},this)}):t&&(i.addEventListener("click",()=>this.open=!this.open),i.classList.add("fold-toggle")),t&&"section"===e.type&&i.updateComplete.then(()=>{i.shadowRoot.querySelector(".divider").style.marginRight="-56px"}),i}render(){return this._head.hass=this.hass,this._entities&&this._entities.forEach(e=>e.hass=this.hass),o`
    <div id="head"
      ?open=${this.open}
    >
      <div id="entity">
        ${this._head}
      </div>
      <div id="toggle">
        <ha-icon
        @click="${e=>{e.stopPropagation(),this.open=!this.open}}"
        icon=${this.open?"mdi:chevron-up":"mdi:chevron-down"}
        class="fold-toggle"
        ></ha-icon>
      </div>
      </div>
    <div id="items"
    ?open=${this.open}
    style="
      ${this._config.padding?`padding-left: ${this._config.padding}px;`:""}
      "
    >
      ${this._entities}
    </div>
    `}static get styles(){return s`
      #head {
        display: flex;
      }
      #entity {
        flex: 1 1 auto;
        width: 0px;
      }
      #toggle {
        flex 0 1 40px;
        display: flex;
        align-items: center;
      }
      #items {
        padding: 0;
        margin: 0;
        overflow: hidden;
        max-height: 0;
      }
      #items[open] {
        overflow: none;
        max-height: none;
      }
      ha-icon {
        width: 40px;
      }
      .state-card-dialog {
        cursor: pointer;
      }
      .fold-toggle {
        cursor: s-resize;
      }
      .fold-toggle[open], #head[open] .fold-toggle{
        cursor: n-resize;
      }

    `}})}]);