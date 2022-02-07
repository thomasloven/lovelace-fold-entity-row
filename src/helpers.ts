import { noChange } from "lit";
import { Directive, directive } from "lit/directive.js";

export async function findParentCard(
  node: any,
  step = 0
): Promise<any | false> {
  if (step == 100) return false;
  if (!node) return false;

  if (node.localName === "hui-entities-card") return node;
  if (node.localName === "hui-picture-elements-card") return node;

  if (node.updateComplete) await node.updateComplete;
  if (node.parentElement) return findParentCard(node.parentElement, step + 1);
  else if (node.parentNode) return findParentCard(node.parentNode, step + 1);
  if ((node as any).host) return findParentCard(node.host, step + 1);
  return false;
}

export const actionHandlerBind = (element, options) => {
  const actionHandler: any = document.body.querySelector("action-handler");
  if (!actionHandler) return;
  actionHandler.bind(element, options);
};

export const actionHandler = directive(
  class extends Directive {
    update(part, [options]) {
      actionHandlerBind(part.element, options);
      return noChange;
    }

    render(_options) {}
  }
);
