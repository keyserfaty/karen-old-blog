---
layout: post
title:  "Entendiendo call y apply en Javascript (3)"
date:   2015-05-03 21:57
categories: js
---

En el posteo anterior estuve tratando de entender cómo se podría aplicar el método `call` en JS. Esto me llevó a considerar ejemplos en los que `call` se usa para pedir métodos prestados a otros objetos. Todo esto, a su vez, me remite a intentar comprender el funcionamiento de `arguments` (ya veremos por qué).

### Objeto `arguments`

(Todo lo que voy a analizar a continuación lo estoy leyendo desde [acá](http://adripofjavascript.com/blog/drips/arbitrary-parameters-with-the-arguments-object)).
El texto se pregunta cómo podría hacer para pasarle argumentos (*no parámetros*) infinitos  a una función. Pone por ejemplo una función que permite sumar todos los argumentos que le pasamos:

``` js
function addAll () {
// ¿Qué debería contener?
}

// Debería devolver 6
addAll(1, 2, 3);

// Debería devolver 10
addAll(1, 2, 3, 4);
```

Dice que podemos hacer esto con el objeto `arguments`. `arguments` no es un array pero funciona como tal, puesto que contiene a todos los paráemtros pasados a una función. ¿Qué quiere decir esto? Que podemos acceder al primer parámetro de una función usando `arguments[0]`, por ejemplo.
Un ejemplo de funcionamiento:

``` js
function myFunc () {
    console.log(arguments[0], arguments[1]);
}

// Outputs "param1" and "param2"
myFunc("param1", "param2");
```

La función `myFunc` imprime el valor del primer argumento y del segundo. Luego cuando se la llama con `"param1"` y `"param2"`, estos se vuelven el parámetro 0 y el 1 y por tanto son estos strings los que se imprimen.
Ahora muestra el ejemplo de la suma infinita usando `arguments`:

``` js
function addAll () {
    var sum = 0;

    for (var i = 0; i < arguments.length; i++) {
        sum = sum + arguments[i];
    }

    return sum;
}

// Devuelve 6
addAll(1, 2, 3);

// Devuelve 10
addAll(1, 2, 3, 4);
```

El problema de `arguments` es que no es un array, por lo que no podemos usar los métodos de los arrays ni podemos pasar lo que contiene, por ejemplo, a algo que esté esperando un array (como ser una función). Para convertirlo, entonces, se puede hacer lo siguiente:

``` js
function sortArgs () {

// Convierte el objeto arguments a un array verdadero
var args = [].slice.call(arguments);

// Esto debería funcionar
sorted = args.sort()
return sorted;
}
```

Lo que hace la primera línea es lo siguiente:

 1. Crea un array vacío.
 2. Le aplica el método `slice` (que crea un array con los elementos seleccionados de un array). Si no le damos argumentos a `slice` debería devolver un array entero (o sea que básicamente lo que estoy haciendo es una copia de un array).
 3. Aplica el método `call`.
 4. Le dice a `call` que en vez de aplicar `slice` al array vacío del frente se lo aplique a `arguments`.


La maravilla de `call` es que podemos usarlo para definir sobre qué queremos que aplique un método.
¿Esto quiere decir que podría convertir un string a un array haciendo algo así?:

    [].slice.call(miString) 

Sí. La expresión anterior, aplicada sobre un string que contiene `"hola"`, genera `[ 'h', 'o', 'l', 'a' ]`.


### Conclusiones sobre `apply` y `call`

En base a todo esto (y con la ayuda de [este](http://effectivejs.com/) libro) podemos resumir dos cosas:

 - El método `call` se puede usar para definir sobre quién queremos que se aplique un método. Esto puede servir para hacer *method borrowing*, es decir, para aplicar métodos a elementos que no los contenían o a quienes no aplicaban inicialmente. Gracias a esto, como vimos recién, podemos convertir el tipo de un elemento.
 - El método `apply` se puede usar 1) para lo mismo que lo anterior, pero además 2) para pasarle a la función una serie de argumentos definidos en un array. Esto puede servir para definir funciones que reciban sus argumentos posteriormente. Esto significa que sirve, además, cuando no sabemos cuántos argumentos puede tomar una función. Este método nos permite agregar todos lo que queramos.

### Preguntas

 - ¿`call` y `apply` agregan argumentos o agregan parámetros a las funciones?
 
### Pasos siguientes
 - Leer más sobre el `arguments` en el libro.
 - Leer más sobre *higher-order functions*.