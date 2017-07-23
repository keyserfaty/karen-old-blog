---
layout: post
title:  "Haciendo aplicaciones en vanilla js en ~2017"
date:   2017-23-07 11:49
categories: vanilla-js
---

Durante algunos fines de semana estuve trabajando en una app que levanta imágenes random de una API y te las muestra en el browser. Después el usuario usando la barra espaciadora puede navegar entre una y otra foto. Al empezar esta aplicación decidí no usar ningún framework por una serie de razones:

* Iba a querer hacer optimizaciones, como pre-cargar las imágenes.
* Iba a querer poner animaciones entre que el usuario pasa de una imagen a la siguiente.
* Es un side-project y por definición en los side projects hay que hacer todo de cero y perder muchísimo tiempo.

Por las dos primeras razones pensé en que hacer el proyecto con React me iba a complicar las cosas en vez de facilitármelas. Así que lo empecé a hacer con vanilla js (ES6, para usar algunas features lindas como el `spead operator`).

### State + Eventos + DOM
En mi humilde opinión una aplicación web consiste en tres cosas: un *estado*, una *serie de eventos* y el *DOM*. El estado sería todo lo que hay en la aplicación en un momento determinado (toda la data, por un lado: la que viene de API o la que genera el usuario; y el estado en que se encuentra la UI: menú abierto o cerrado, por ejemplo). El estado sería este objeto enorme que nos cuenta todo lo que sabemos sobre la aplicación en ese momento dado.

Los eventos, entonces, serían las acciones que hacen que ese estado vaya mutando. Un evento puede ser, por ejemplo, el click del usuario en el menú para abrirlo. Eso produciría un cambio en nuestro `state`:

``` js
const state = {
    menuOpen: false
}

const Menu = () => <Menu onClick={toggleMenu} />

/** -> Después de que el usuario clickea el menu el state cambia
* const state = {
*       menuOpen: true
* }
*/

```

Los eventos también pueden no ser producidos por los usuarios. Por ejemplo cuando /dispatcheamos/ una acción para traer data de una API. Eso también va a modificar nuestro estado.

Por último el DOM sería cómo se ve todo esto en la UI. En última instancia esto va a ser HTML en nuestro sitio pero si estamos construyendo los componentes desde Javascript primero entonces el DOM van a ser, momentáneamente, estos componentes.

Con todo esto en mente es que empecé a armar el esqueleto de mi aplicación. La primera cosa que contruí, entonces, fue un objeto de estado y algunas funciones para hacerlo ir cambiando de forma.

### Construyendo el `state` y sus mutaciones
El /state/ de mi aplicación solo tiene dos cosas: una lista de items y el id de la imagen que el usuario está viendo en ese momento:

``` js
const initialState = {
  list: [],
  currentImage: 0
}

```


Ahora que tengo el /state/ lo que necesito es una forma de que ese state vaya cambiando, es decir, que cuando /fetchee/ imágenes esas imágenes se guarden en la lista, por ejemplo. Para esto, indescaradamente, robé la idea de Redux de tener un /store/ que reciba acciones y vaya provocando cambios en el state de acuerdo a esas acciones.

Esta es mi mini implementación del store de Redux:
``` js
const createStore = function createStoreFn (reducer) {
  let state = undefined
  let subscribers = []

  return {
    dispatch: function (action) {
      state = reducer(state, action)
      subscribers.forEach(function (handle) {
        return handle(state, action)
      })
    },
    getState: function () {
      return state
    },
    subscribe: function (handler) {
      subscribers.push(handler)
    }
  }
}
```

Esta función funciona de la siguiente manera: recibe un reducer y devuelve una función `dispatch`, que se encarga de hacer cambios en el state; una función `getState` que devuelve el state en ese momento del tiempo y una función `subscribe` que se dispara cada vez que hay un cambio en el /state/. Solo con eso ya puedo armar mi estructura base de la aplicación.

Para poder usar esta función necesito crear un reducer. La función de mi reducer, para quienes nunca hayan usado Redux, es recibir una serie de acciones y hacer cambios en el state en base a esas acciones. Mi reducer ser ve más o menos así:

``` js
const reducer = function reducerFn (state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ALL_IMAGES_SUCCESS': {
      return {
        list: [
            ...state.list,
            ...action.payload.list,
        ]
      }
    }

    case 'ON_NEXT_IMAGE': {
      return {
        currentImage: action.payload.nextImage,
      }
    }

    default:
      return state
  }
}
```

Y para crear el store:

``` js
const store = createStore(reducer)
```

### Escuchando los eventos y haciendo cambios en el `state`

En el reducer anterior escuchamos dos acciones: `FETCH_ALL_IMAGES_SUCCESS` y  `ON_NEXT_IMAGE`. La primera se va a disparar cuando la página terminó de cargarse y la segunda se va a disparar cuando el usuario presiona la barra espaciadora. Esos son mis dos eventos. Me voy a concentrar solo en el primer evento para explicar a modo de ejemplo lo que hice.

Las acciones que tienen que suceder me las imagino de la siguiente forma:
1. La página termina de cargar. Eso dispara una acción `FETCH_ALL_IMAGES`
2. La acción `FETCH_ALL_IMAGES` va a hacer la llamada async a mi API y va a traer una lista de imágenes. Cuando termine satisfactoriamente se va a despachar una acción que se llame `FETCH_ALL_IMAGES_SUCCESS`. Si por alguna razón falla esa acción va a ser `FETCH_ALL_IMAGES_FAILURE`.
3. `FETCH_ALL_IMAGES_SUCCESS` va a recibir una lista de imágenes y va a /updatear/ mi array vacío con esa lista de imágenes.

Para la primera acción (`ON_WINDOW_LOAD`) voy a hacer lo siguiente:

``` js
window.addEventListener('load', function () {
  store.dispatch({
    type: 'FETCH_ALL_IMAGES'
  })
})
```

Esto va a disparar esa acción cuando el browser termina de cargar. Después de eso voy a escuchar esa acción para disparar mi acción asincrónica (la que trae las imágenes). Para hacer eso necesito escuchar los cambios en el store. Voy a usar mi función `subscribe`:

``` js
store.subscribe(function (state, action) {
  switch (action.type) {
    case 'FETCH_ALL_IMAGES': {
      var xml = new XMLHttpRequest();

      xml.addEventListener('load', function () {
          store.dispatch({
            type: 'FETCH_ALL_IMAGES_SUCCESS',
            payload: {
              list: JSON.parse(this.responseText)
            }
          })
        }
      );
      xml.open('GET', url + clientId);
      xml.send();

      break
    }
  }
})
```

### Haciendo cambios en el DOM

Por último me gustaría mostrar estas imágenes en el DOM. Como muchos sabrán usar la API de `document`para crear nodos en el DOM puede ser un poco engorroso a veces. Así que armé esta pequeña función:

``` js
const Node = (elem, attrs) => {
  const node = d.createElement(elem)
  Object.keys(attrs).forEach(function (key) {
    node.setAttribute(key, attrs[key])
  })

  return node
}
```

Esta función me permite crear nodos especificando como primer parámetro la etiqueta html y como segundo parámetro un objeto de atributos:

``` js
const nextImage = Node('img', {
  id: nextId,
  src: list[nextId].urls.small,
  style: 'width: 100%; display: none'
})
```

Seguramente después de ver eso estarán pensando lo mismo que [@okbel](https://twitter.com/okbel) cuando vio esa función y me dijo: ‘a esa función le falta un `children` para ser igual a `CreateElement`!’. Naturalmente yo no me había dado cuenta de ya existía una implementación de lo que acabo de mostrar. Una versión posterior que soporta `children` y eventos :) se ve así:

``` js
const EVENTS = {
  onClick: 'click',
  onKeyUp: 'keyup',
  onLoad: 'load',
  onFocus: 'focus',
  onBlur: 'blur'
}

export const Node = (elem, attrs, ...children) => {
  let node = d.createElement(elem)

  if (attrs != null) {
    Object.keys(attrs).forEach(key => {
      if (EVENTS.hasOwnProperty(key)) {
        node.addEventListener(EVENTS[key], attrs[key])
      } else {
        node.setAttribute(key, attrs[key])
      }
    })
  }

  if (children.length > 0) {
    children.forEach(child => {
      if (typeof child === 'string') {
        node.innerHTML = child
      }

      if (typeof child === 'object') {
        node.appendChild(child)
      }
    })
  }

  return node
}

```


Que en uso en un `SearchBox` para las imágenes se ve así:

``` js
const SearchBoxMain = props => {
  const { dispatch } = props

  const onKeyupInput = e => {
    if (e.keyCode === 13) {
      dispatch({
        type: 'ON_INPUT_ENTER_KEY_DOWN',
        payload: {
          searchValue: e.target.value,
          path: '/search'
        }
      })
    }
  }

  return (
    Node('div', { id: 'search' },
      Node('div', { class: 'search-box', onKeyUp: onKeyupInput },
        Node('div', { class: 'icon' }),
        Node('input', { type: 'text', placeholder: 'Search photos', autofocus: true }))
    )
  )
}
```

### Resumiendo
No mostré toda mi implementación pero sí algunas ideas generales que espero que puedan servirle a alguien más. En resumen, si mantenemos nuestro state, nuestros eventos y nuestros componentes relativamente aislados unos de otros podemos hacer aplicaciones en vanilla js sin ningún framework de forma relativamente escable y fácil de seguir.

Después de usar este patrón con una aplicación más grande llegué a algunas conclusiones y encontré algunas formas menos imperativas de resolver algunos problemas. También pude ver las limitaciones de Javascript en algunos sentidos y empecé a pensar en usar otros lenguajes (jm jm, Elm) para hacer esto mismo de forma más eficiente.

Mis próximos posteos van a ser sobre cómo migrar de una estructura como esta a Elm, que sigue convenciones muy (muy) parecidas pero que tiene algunas magias para resolver algunos problemas ([union types](https://guide.elm-lang.org/types/union_types.html)).







