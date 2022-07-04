/**
 * This is my attempt at creating a simple enough HTML render engine similar to what ALL popular front-end frameworks/libraries already do perfectly, AKA data binding
 * except "cheaper" and without the extra fancy features, this is targeted to smaller "simpler" projects that only want to bind data to the HTML with as
 * minimum configuration or setup as possible, the end goal here is to have minimum extra knowledge outside HTML and JavaScript and be able to empower your templates
 * HOPEFULLY once the actual project where this file is being used is done, I can move forward on this. for now its current state is enough for the project needs
 */

// To add more binding types/logic first add them to this array then, for behavior add its function to the BindHandlers Object
const BindValues = [
  "inner-html",
  "inner-text",
  "class",
  "style",
  "attr",
  "if",
] as const;
type ArrayAsTypes<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ArrayAsTypes
>
  ? ArrayAsTypes
  : never;
type BindTypes = ArrayAsTypes<typeof BindValues>;

/**
 * These functions are the core functionality of this library, each bind type ends up executing one of these functions which
 * each manipulates a referenced HTMLElement or DOM in a very specific way that should react to the data changes
 */
const bindHandlers: BindHandlers = {
  "inner-html": (bind: ITemplateBind) => {
    bind.element.innerHTML = String(bind.result);
  },
  "inner-text": (bind: ITemplateBind) => {
    bind.element.innerText = String(bind.result);
  },
  class: (bind: ITemplateBind) => {
    throw new Error("class binding not implemented yet.");
  },
  style: (bind: ITemplateBind) => {
    throw new Error("style binding not implemented yet.");
  },
  attr: (bind: ITemplateBind) => {
    throw new Error("attr binding not implemented yet.");
  },
  if: (bind: ITemplateBind) => {
    throw new Error("if binding not implemented yet.");
  },
};

export class Renderer {
  id: string;
  template: string;
  bind: any = {};
  container: HTMLElement | null;

  private rendererBinds: any = {};

  constructor(data: IRenderer) {
    this.id = data.id;
    this.template = data.template.toString();
    this.container = document.getElementById(this.id);

    if (this.container) {
      this.container.innerHTML = this.template;
    }

    if (data.bind) {
      try {
        if (this.validateBindProps(data.bind)) {
          this.bind = new Proxy(data.bind, { set: this.update.bind(this) });
          this.defineBinds();
        } else {
          let err = new Error(
            "Cannot bind Objects, Arrays or Functions to the Renderer... Yet"
          );
          throw err;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Executed each time one of the bind properties is updated by the use or JS Proxy API
   * this is a intermediate process between the setters and getters of the bind properties sent
   * trough the Renderer class
   * @param target
   * @param key
   * @param value
   */
  update(target: any, key: string | symbol, value: any): boolean {
    key = String(key);
    target[key] = value;
    if (this.rendererBinds[key] && this.container) {
      let rendererBind = this.rendererBinds[key];
      if (rendererBind.affects) {
        // Update all DOM connections to this data
        rendererBind.affects.forEach((templateBind: ITemplateBind) => {
          // Re-evaluate DOM expression 
          templateBind.result = this.evaluateDOMExpression(templateBind.expression);
          // Execute bind handler
          bindHandlers[templateBind.type](templateBind);
        });
      }
    }
    return true;
  }

  updateBinds() {
    this.defineBinds();
  }

  /**
   * Exact same document.createElement function, except it re-defined bindings to keep them updated
   * this function should be used if you intend to add a new element with a property binded to it
   */
  createElement(...args: any) {
    try {
      let element = document.createElement.apply(null, args);
      this.defineBinds();
      return element;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * This is a somewhat expensive function in an attempt to keep the data/DOM updates as quick as possible,
   * we iterate over all found bindings and create a helper object with enough references to perform quick
   * updates whenever a binded property is updated
   * TODO: Make is so it only checks the new element for bind data connections instead of re-mapping everything
   */
  private defineBinds() {
    let bindsPropertyKeys = Object.keys(this.bind);
    let templateBindNodes = this.container?.querySelectorAll("[\\:bind]") || [];

    let templateBinds: ITemplateBind[] = [];
    let rendererBinds: IRendererBindMaps = {};

    templateBindNodes.forEach((node: Element) => {
      let pair = (node.getAttribute(":bind") || "").split(":") || [];

      if (!this.isBindingType(<BindTypes>pair[0])) {
        throw new Error(
          `Invalid bind type "${pair[0]}", valid bind types are: ${BindValues}.`
        );
      }

      let type = pair[0];
      let expression = pair[1];
      if (pair.length > 2) {
        pair.shift();
        expression = pair.reduce((prev: string, current: string) => (prev += ":" + current));
      }

      templateBinds.push({
        type: <BindTypes>type,
        element: <HTMLElement>node,
        expression: expression,
        result: this.evaluateDOMExpression(expression),
        isAffectedBy: []
      });
    });

    bindsPropertyKeys.forEach((propKey) => {
      let templateBindKeys = Object.keys(templateBinds);
      let affects: any = [];

      templateBindKeys.forEach((key: any) => {
        let templateBind = templateBinds[key];
        if (templateBind.expression.indexOf(propKey)) {
          affects.push(templateBind);
          templateBind.isAffectedBy.push(propKey);
        }
      });

      rendererBinds[propKey] = {
        affects: affects,
      };
    });

    this.rendererBinds = rendererBinds;
    // this.templateBinds = templateBinds
  }

  /**
   * This is to validate that the binds object contains valid values
   * @param bins Object containing all the data that will be binded
   * @returns
   */
  private validateBindProps(binds: any): boolean {
    let values = Object.values(binds);
    let validBinds = true;
    for (let i = 0; i <= values.length; i++) {
      let val = values[i];
      if (
        (typeof val === "object" || typeof val === "function") &&
        val !== null
      ) {
        validBinds = false;
        break;
      }
    }
    return validBinds;
  }

  /**
   * Checks if the string is a valid binding type
   * @param bindType Bind type string
   * @returns
   */
  private isBindingType(bindType: BindTypes): bindType is BindTypes {
    return BindValues.includes(bindType);
  }

  private evaluateDOMExpression(expression: string): unknown {
    return Function(`return ${expression}`).apply(this.bind);
  }
}

type BindHandlers = { [key in BindTypes]: (bind: ITemplateBind) => void };

interface IRenderer {
  id: string;
  template: NodeRequire;
  bind?: any;
}

interface ITemplateBind {
  element: HTMLElement,
  type: BindTypes,
  result: unknown,
  expression: string,
  isAffectedBy: string[]
}

interface IRendererBindMaps {
  [key: string]: IRendererBind;
}

interface IRendererBind {
  affects: string
}
