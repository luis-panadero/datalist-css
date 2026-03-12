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
    inputElement.addEventListener('focusin', listShowFocusInEventHandler);
    inputElement.addEventListener('input', listShowEventHandler);
  }
  if (inputElements.length > 0) {
    document.body.addEventListener('click', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEscape);
  }
}

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
function listShowFocusInEventHandler(evt) {
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
  listShowEventHandler(evt);
}

// Manages the input handler to show again the datalist
function listShowEventHandler(evt) {
  const input = target(evt);
  if (!input) {
    return;
  }
  
  // show datalist
  const dataListElement = input.datalist;
  if (dataListElement && !dataListElement.shown) {

    listHide(listActive);

    dataListElement.shown = true;
    dataListElement.classList.add("datalist--visible");
    listLimit(evt);
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

  const inputElement = target(evt);
  updateDataListOptions(inputElement);
}

// update datalist options visibility and tabindex
function updateDataListOptions(inputElement) {
  if (!inputElement || !inputElement.datalist) {
    return;
  }

  const value = inputElement.value.trim().toLowerCase();
  const optionElements = [...inputElement.datalist.getElementsByTagName('option')];
  for (const optionElement of optionElements) {
    optionElement.setAttribute('tabindex', 0);
    if (!value) {
      optionElement.style.display = 'none';
    } else {
      const elementValue = normalizeToUpperNoAccents(optionElement.value);
      optionElement.style.display = elementValue.includes(normalizeToUpperNoAccents(value)) ? 'block' : 'none';
    }
  }
}

function normalizeToUpperNoAccents(str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str
    .normalize('NFD')                     // Descompose characters from diacritics
    .replace(/[\u0300-\u036f]/g, '')      // Remove diacritics
    .toUpperCase();
}


// key event on input
function listControl(evt) {

  const input = target(evt);
  if (!input || !input.datalist || 'datalistNative' in input.dataset) {
    return;
  }

  switch (evt.keyCode) {

    case 40: {
      // arrow down
      let opt = input.datalist.firstElementChild;
      if (!opt.offsetHeight) {
        opt = visibleSibling(opt, 1);
      }
      opt && opt.focus();
      // evt.preventDefault();
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
    if (opt) {
      opt.focus();
      let viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (opt.getBoundingClientRect().top > viewportHeight || opt.getBoundingClientRect().top < 0 || isCovered(opt)) {
        opt.scrollIntoView({behavior: "auto", block: "center",});
      }
    }
    evt.preventDefault();

  } else if (kc === 9 || kc === 13 || kc === 32) {

    // tab, enter, space: use value
    listSet(evt);
  } else if (kc === 27) {

    // esc: hide list
    listHide(dl);
  } else /* if (kc === 8) */ {

    // backspace or any other key: return to input
    dl.input.focus();
  } 
}

// Check if an element is covered by another element
function isCovered(element) {
  const rect = element.getBoundingClientRect();

  // Check several points inside the element
  const points = [
      [rect.left + 1, rect.top + 1],
      [rect.right - 1, rect.top + 1],
      [rect.left + 1, rect.bottom - 1],
      [rect.right - 1, rect.bottom - 1],
      [rect.left + rect.width / 2, rect.top + rect.height / 2]
  ];

  for (const [x, y] of points) {
      const converingElement = document.elementFromPoint(x, y);
      if (converingElement !== element && !element.contains(converingElement)) {
          return true;  // another element is on top
      }
  }

  return false; // visible (not covered)
}

// get previous/next visible sibling
function visibleSibling(optionElement, dir) {
  let newOpt = optionElement;

  do {
    if (dir < 0) {
      newOpt = newOpt.previousElementSibling;
      if (!newOpt) {
        
        // Es el primero y estamos intentando subir arriba, volvemos el foco al input
        const datalist = optionElement.parentElement;
        datalist.input.focus();
        return;
      }
    } else if (dir > 0) {
      newOpt = newOpt.nextElementSibling;
    }

    if (newOpt && newOpt.offsetHeight) {
      optionElement = newOpt;
      dir -= Math.sign(dir);
    }

  } while (newOpt && dir);

  return optionElement;

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

export { inyectDataListCss, updateDataListOptions };
//# sourceMappingURL=datalist-css.js.map
