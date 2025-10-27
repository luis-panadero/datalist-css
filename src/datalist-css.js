/*
datalist-css.js module

load script:
<script type="module" src="./dist/datalist-css.js"></script>

Then style <datalist> and <option> fields using CSS.
Note the <datalist> should be placed immediately after its <input>.
*/

// currently active list
let listActive;

/**
  * Inyects datalist CSS to all <input> elements that have attached an <datalist>
  * @param {HTMLElement = document} rootElement - HTMLElement where begin to search for the input elements
  */
function inyectDataListCss(rootElement = document) {
  // datalist handler events
  const inputElements = getAllInputsWithDataLists(rootElement);
  for (const inputElement of inputElements) {
    inputElement.list.classList.add("datalist");
    inputElement.addEventListener('focusin', listShowEventHandler);
  }
  if (inputElements.length > 0) {
    document.body.addEventListener('click', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEscape);
  }
}
export { inyectDataListCss };

// do not run on the server
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => inyectDataListCss());
}


/**
  * Gets all <input> elements that have attached an <datalist>
  * @param {HTMLElement} rootElement
  */
function getAllInputsWithDataLists(rootElement ) {
  return [...rootElement.querySelectorAll('input[list]:not([list=""]):not([data-datalist-native])')]
    .filter(inputElement => inputElement.list !== null);
}

// datalist control focused?
function listShowEventHandler(evt) {

  const input = target(evt);
  if (!input) {
    return;
  }

  if (input.list) {

    // setup of datalist control
    const dataListElement = input.list;
    input.datalist = dataListElement;
    input.removeAttribute('list');

    dataListElement.input = input;
    dataListElement.setAttribute('tabindex', -1);

    // event handlers
    input.addEventListener('input', listLimit);
    input.addEventListener('keydown', listControl);
    dataListElement.addEventListener('keydown', listKey);
    dataListElement.addEventListener('click', listSet);

  }

  // show datalist
  const dataListElement = input.datalist;
  if (dataListElement && !dataListElement.shown) {

    listHide(listActive);

    dataListElement.shown = true;
    dataListElement.classList.add("datalist--visible");
    listLimit(evt);
    //dataListElement.style.width = input.offsetWidth + 'px';
    //dataListElement.style.left = input.offsetLeft + 'px';
    listActive = dataListElement;

  }

}

/**
  * Hide the datalist
  * @param dataListElement - DataList HTML element
  */
function listHide(dataListElement) {
  if (dataListElement && dataListElement.shown) {
    dataListElement.classList.remove("datalist--visible");
    dataListElement.shown = false;
  }
}


// enable valid and disable invalid options
function listLimit(evt) {

  const input = target(evt);
  if (!input || !input.datalist) {
    return;
  }

  const value = input.value.trim().toLowerCase();
  const optionElements = [...input.datalist.getElementsByTagName('option')];
  for (const optionElement of optionElements) {
    optionElement.setAttribute('tabindex', 0);
    optionElement.style.display = (!value || optionElement.value.toLowerCase().includes(value)) ? 'block' : 'none';
  }
}


// key event on input
function listControl(evt) {

  const input = target(evt);
  if (!input || !input.datalist) {
    return;
  }

  switch (evt.keyCode) {

    case 40: {
      // arrow down
      let opt = input.datalist.firstElementChild;
      if (!opt.offsetHeight) opt = visibleSibling(opt, 1);
      opt && opt.focus();
      break;
    }

    case 9:   // tab
      listHide(input.datalist);
      break;

    case 13:  // enter
    case 32:  // space
      listSet(evt);
      break;

  }

}


// key event on datalist
const keymap = {
  33: -12, // Page Up
  34: 12, // Page Down
  38: -1, // Arrow Up
  40: 1 // Arrow Down
};

function listKey(evt) {

  const targetElement = target(evt);
  if (!targetElement) {
    return;
  }

  const kc = evt.keyCode;
  const dir = keymap[kc];
  const dl = targetElement.parentElement;

  if (dir) {

    // move through list
    let opt = visibleSibling(targetElement, dir);
    opt && opt.focus();
    evt.preventDefault();

  } else if (kc === 9 || kc === 13 || kc === 32) {

    // tab, enter, space: use value
    listSet(evt);

  } else if (kc === 8) {

    // backspace: return to input
    dl.input.focus();

  } else if (kc === 27) {

    // esc: hide list
    listHide(dl);
  }
}


// get previous/next visible sibling
function visibleSibling(opt, dir) {

  let newOpt = opt;

  do {

    if (dir < 0) {
      newOpt = newOpt.previousElementSibling;
    } else if (dir > 0) {
      newOpt = newOpt.nextElementSibling;
    }

    if (newOpt && newOpt.offsetHeight) {
      opt = newOpt;
      dir -= Math.sign(dir);
    }

  } while (newOpt && dir);

  return opt;

}


// set datalist option to input value
function listSet(evt) {

  const t = target(evt);
  const dataListElement = t && t.parentElement;

  if (!dataListElement || !dataListElement.input) {
    return;
  }

  dataListElement.input.value = (t && t.value) || '';
  listHide(dataListElement);
}


/**
  * fetch target node
  * @param t - Event Handler
  */
function target(t) {
  return t && t.target;
}

/**
 * hides the datalist on click outside
 * @param evt - EventHandler
 */
function closeOnClickOutside(evt) {
  if (!listActive || listActive.contains(evt.target) || evt.target === listActive.input) {
    return;
  }
  listHide(listActive);
}

/**
 * hides the datalist on hit escape key
 * @param evt - EventHandler
 */
function closeOnEscape(evt) {
  if (!listActive || !['Esc', 'Escape'].includes(evt.key)) {
    return;
  }
  listHide(listActive);
}

