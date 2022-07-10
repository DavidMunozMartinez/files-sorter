/**
 * This is my attempt at creating a simple enough HTML render engine similar to what ALL popular front-end frameworks/libraries already do perfectly, AKA data binding
 * except "cheaper" and without the extra fancy features, this is targeted to smaller "simpler" projects that only want to bind data to the HTML with as
 * minimum configuration or setup as possible, the end goal here is to have minimum extra knowledge outside HTML and JavaScript and be able to empower your templates.
 * HOPEFULLY once the actual project where this file is being used is done, I can move forward on this idea. for now its current state is enough for the project needs
 *
 * # Bind examples
 *
 * ```html
 * <div id="main-content">
 *  <div bind:innerText="this.test"><div>
 * <div>
 * ```
 *
 * ```js
 * let renderer = new Renderer({
 *  id: 'main-content',
 *  bind: {
 *    test: 'Hello world!'
 *  }
 * });
 * ```
 *
 * ## HTML outputs:
 * <div id="main-content">
 *  <div bind:innerText="this.test">Hello world!<div>
 * <div>
 */
const BindableMouseEvents = [
  "onclick",
  // 'ondblclick',
  // 'ondrag',
  // 'ondragend',
  // 'ondragenter',
  // 'ondragleave',
  // 'ondragover',
  // 'ondragstart',
  // 'ondrop',
  // 'onmousedown',
  // 'onmousemove',
  // 'onmouseout',
  // 'onmouseover',
  // 'onmouseup',
  // 'onmousewheel',
  // 'onscroll',
];

// To add more binding types/logic first add them to this array then, for behavior add its function to the BindHandlers Object
const BindValues = [
  // Element binds
  "innerHtml",
  "innerText",
  "class",
  "style",
  "attr",
  "if",
  // Mouse events
  "onclick",
  // 'ondblclick',
  // 'ondrag',
  // 'ondragend',
  // 'ondragenter',
  // 'ondragleave',
  // 'ondragover',
  // 'ondragstart',
  // 'ondrop',
  // 'onmousedown',
  // 'onmousemove',
  // 'onmouseout',
  // 'onmouseover',
  // 'onmouseup',
  // 'onmousewheel',
  // 'onscroll',
  // ...BindableEvents
] as const;
type ArrayAsTypes<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ArrayAsTypes
>
  ? ArrayAsTypes
  : never;
type BindTypes = ArrayAsTypes<typeof BindValues>;

export class Renderer {
  id: string;
  template?: string;
  bind: any = {};
  container: HTMLElement | null;
  bindAs?: string | null;

  private rendererBinds: IRendererBindMaps = {};

  // private eventBindHandlers = BindableEvents.reduce((acc: any, curr: string) => (acc[curr]= (bind: any) => {
  //   bind.element[bind.type] = () => this.evaluateDOMExpression(bind.expression);
  // } , acc), {});

  /**
   * These functions are the core functionality of this library, each bind type ends up executing one of these functions which
   * each manipulates a referenced HTMLElement or DOM in a very specific way that should react to the data changes or events
   */
  private bindHandlers: BindHandlers = {
    // Probably shouldn't use this, since seems unsafe
    innerHtml: (bind: ITemplateBind) => {
      bind.element.innerHTML = String(bind.result);
    },
    innerText: (bind: ITemplateBind) => {
      bind.element.innerText = String(bind.result);
    },
    class: (bind: ITemplateBind) => {
      let current = String(bind.result);
      let previous = bind.element.getAttribute("data-bind-class");
      if (
        previous &&
        current !== previous &&
        bind.element.classList.contains(previous)
      ) {
        bind.element.classList.remove(previous);
      }
      if (current) {
        bind.element.classList.add(current);
        bind.element.setAttribute("data-bind-class", current);
      }
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
    onclick: (bind: ITemplateBind) => {
      bind.element.onclick = () => {
        this.evaluateDOMExpression(bind.expression);
      };
    },
    // ... this.eventBindHandlers
  };

  constructor(data: IRenderer) {
    this.id = data.id;
    this.template = data.template?.toString();
    this.container = document.getElementById(this.id);
    this.bindAs = data.bindAs || null;

    if (this.container && this.template) {
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
    if (!this.container) return true;
    if (this.rendererBinds[key]) {
      let rendererBind = this.rendererBinds[key];
      if (rendererBind.affects) {
        // Update all DOM connections to this data
        rendererBind.affects.forEach((templateBind: ITemplateBind) => {
          // Re-evaluate DOM expression
          templateBind.result = this.evaluateDOMExpression(
            templateBind.expression
          );
          // Execute bind handler
          this.bindHandlers[templateBind.type](templateBind);
        });
      }
    } else {
      // If we don't have this key, it means it was added before the renderer initialization
      // so we need to re-define our binds
      // TODO: Find a way to just re-define binds that concern this property
      this.defineBinds();
    }
    return true;
  }

  /**
   * Does a check in the renderer container to look for tempalte bindings and properly create the renderer
   * bind mapings
   */
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
      // this.defineBinds();
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
    // No functions allowed in bind cause -> effect logic
    let bindsPropertyKeys = Object.keys(this.bind).filter((key) => typeof this.bind[key] !== 'function');
    let templateBinds: ITemplateBind[] = this.getTemplateBinds();

    bindsPropertyKeys.forEach((propKey) => {
      let affects: ITemplateBind[] = [];
      templateBinds.forEach((templateBind: ITemplateBind) => {
        if (
          // Expression in this template bind requires this bind property
          templateBind.expression.indexOf(propKey) > -1 &&
          // Bindable mouse event should not be reactive to changes
          BindableMouseEvents.indexOf(templateBind.type) == -1
        ) {
          affects.push(templateBind);
          templateBind.isAffectedBy.push(propKey);
        }
      });
      this.rendererBinds[propKey] = { affects };
    });
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
      if (typeof val === "object" && val !== null) {
        validBinds = false;
        break;
      }
    }
    return validBinds;
  }

  private evaluateDOMExpression(expression: string): unknown {
    let alias = this.bindAs ? `let ${this.bindAs}=this;` : "";
    // I probably need to sanitize this
    return Function(`${alias} return ${expression};`).apply(this.bind);
  }

  private getTemplateBinds(container?: HTMLElement): ITemplateBind[] {
    return BindValues.map((type) => {
      let result: ITemplateBind[] = [];
      if (container) {
      }
      let list = this.container?.querySelectorAll(`[bind\\:${type}]`) || [];
      if (list.length) {
        let entries = list.entries();
        let current = entries.next();
        while (!current.done) {
          let element = <HTMLElement>current.value[1];
          let data = this.getTemplateBindingData(element, type);
          result.push(data);
          current = entries.next();
        }
      }
      return result;
    }).reduce((prev: any, current: any) => {
      return (prev = prev.concat(current));
    });
  }

  private getTemplateBindingData(
    element: HTMLElement,
    type: BindTypes
  ): ITemplateBind {
    let expression = element.getAttribute(`bind:${type}`) || "";
    let isEvent = BindableMouseEvents.indexOf(String(type)) > -1;
    let data = {
      type: <BindTypes>type,
      element: element,
      expression: expression,
      // Event bindings should not evaluate their expression until the event is triggered
      result: !isEvent ? this.evaluateDOMExpression(expression) : null,
      isAffectedBy: [],
    };

    this.bindHandlers[type](data);

    return data;
  }
}

type BindHandlers = { [key in BindTypes]: (bind: ITemplateBind) => void };

interface IRenderer {
  /**
   * Id of the element that will benefit from the context of this renderer
   */
  id: string;
  /**
   * If exsits, it will replace the innerHTML content of the container, can be a path or a NodeRquire statement
   * if the string contains valid HTML it will be attached as is, if the string ends with .html, it will attempt
   * to do a fetch to the file
   */
  template?: NodeRequire | string;
  /**
   * This object will be attached to the container (found by the id property) and it will make the
   * data accessible to the entire container and its children trough the 'this' keyword
   */
  bind?: any;
  /**
   * Alias that will be used within the template context, so you can use that alias instead of the 'this' keyword
   */
  bindAs?: string | null;
}

interface ITemplateBind {
  element: HTMLElement;
  type: BindTypes;
  result: unknown;
  expression: string;
  isAffectedBy: string[];
}

interface IRendererBindMaps {
  [key: string]: IRendererBind;
}

interface IRendererBind {
  affects: ITemplateBind[];
}
