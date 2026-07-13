---
title: JavaScript 原型与类型
date: 2026-07-10
tags: [ TypeScript, JavaScript ]
pinned: false
collection: 深入理解 Ts/Js
outline:
  - title: 1. 结构示意
    slug: 结构示意

  - title: 2. 原型链
    slug: 原型链
  - title: 2.1 __proto__
    slug: __proto__
    level: 1
  - title: 2.2 属性查找
    slug: 属性查找
    level: 1
  - title: 2.3 属性掩蔽
    slug: 属性掩蔽
    level: 1
  - title: 2.4 属性删除
    slug: 属性删除
    level: 1
  - title: 2.5 prototype 与构造函数
    slug: prototype与构造函数
    level: 1

  - title: 3. 内置对象
    slug: 内置对象
  - title: 3.1 Object
    slug: Object
    level: 1
  - title: 3.2 Function
    slug: Function
    level: 1
  - title: 3.3 Array
    slug: Array
    level: 1
  - title: 3.4 RegExp
    slug: RegExp
    level: 1
  - title: 4. Object 原型 API
    slug: Object原型API

  - title: 5. 类
    slug: 类
  - title: 5.1 类对象
    slug: 类对象
    level: 1
  - title: 5.2 实例成员
    slug: 实例成员
    level: 1
  - title: 5.3 静态成员
    slug: 静态成员
    level: 1
  - title: 5.4 继承
    slug: 继承
    level: 1
  - title: 5.5 私有字段与静态块
    slug: 私有字段与静态块
    level: 1

  - title: 6. 类型判断
    slug: 类型判断
  - title: 6.1 typeof 与 instanceof
    slug: 运行时判断
    level: 1

  - title: 7. 类语法解糖
    slug: 类语法解糖
  - title: 7.1 基础类解糖
    slug: 基础类解糖
    level: 1
  - title: 7.2 继承解糖
    slug: 继承解糖
    level: 1
  - title: 7.3 专用语法
    slug: 专用语法
    level: 1
  - title: 7.4 语义差异
    slug: 语义差异
    level: 1

  - title: 8. 小结
    slug: 小结
    
  - title: 附录
    slug: 附录

    head:
  - - meta
  - name: description
    content: TypeScript 与 JavaScript 复习系列第一篇，整理 __proto__、prototype、构造函数、内置对象、class、运行时类型判断、TypeScript类型位置与类语法解糖
  - - meta
  - name: keywords
    content: JavaScript, TypeScript, __proto__, prototype, 原型链, 构造函数, new, class, instanceof, extends

---

本篇整理 JavaScript 的原型链、构造函数和类，并补充 TypeScript 中实例类型与构造函数类型的使用方法。

---

JavaScript 对象通过原型链接共享属性。构造函数和类负责批量创建对象，底层属性查找仍然沿同一条原型链进行。

## 1. 结构示意{#结构示意}

下文的对象结构示意使用 JSON 形式，并以 `__proto__` 表示 `[[Prototype]]` 链接，写法仿照对象字面量，便于直接观察每一层对象。

JSON 本身不保存原型信息，因此这些代码块是结构快照，并非 `JSON.stringify()` 的直接结果。

在下文的结构示意中，`"__proto__":...`表示对象的 `[[Prototype]]` 属性，其值可以是一个对象字面量，如：

```json
{
  "__proto__": {
    "b": 3,
    "c": 4
  }
}
```

也可以是另一个对象的名字，如：

```json
{
  "__proto__": "Object.prototype"
}
```

表示 `[[Prototype]]` 属性与 `Object` 的 `prototype` 属性指向一致。

除此之外，`[ClassName: ObjectName]`表示一个对象，其名称是 `ObjectName`，原始类型是 `ClassName`，如：

```json
{
  "toString": "[Function: toString]"
}
```

表示此对象的 `toString` 属性指向是一个名为 `toString` 的方法。

对于没有名称的对象（如对象字面量，或者匿名方法），则使用 `[ClassName (anonymous)]` 表示，如以下对象：

```js
const obj = {
  funcA: () => {
    console.log('funcA')
  },
  funcB: function() {
    console.log('funcB')
  },
  funcC: function namedFunc() {
    console.log('funcB')
  },
}
```

`obj` 结构示意如下：

```json
{
  "funcA": "[Function (anonymous)]",
  "funcB": "[Function (anonymous)]",
  "funcC": "[Function: namedFunc]",
  "__proto__": "Object.prototype"
}
```

## 2. 原型链{#原型链}

### 2.1 \_\_proto\_\_{#\_\_proto\_\_}

每个对象都有一个内部槽 `[[Prototype]]`，其值是另一个对象或 `null`。

以下结构示意展开了三层自定义对象：

```json
{
  "a": 1,
  "b": "[Array: myArray]",
  "__proto__": {
    "b": 3,
    "c": 4,
    "__proto__": {
      "d": 5,
      "__proto__": "Object.prototype"
    }
  }
}
```

对象字面量中的 `{ __proto__: obj }` 是 ECMAScript 规范定义的特殊语法，用于在对象创建时初始化对象的 `[[Prototype]]`。

通过 `obj.__proto__` 读取或修改原型时，访问的是 `Object.prototype` 上提供的历史遗留访问器属性。该访问器通过
getter/setter 操作对象的 `[[Prototype]]`，目前主要用于兼容旧代码。

实际程序使用 `Object.getPrototypeOf()` 读取对象的 `[[Prototype]]`，使用 `Object.setPrototypeOf()` 修改已有对象的
`[[Prototype]]`。

### 2.2 属性查找{#属性查找}

读取 `o.key` 时，运行时按以下顺序查找：

1. 在 `o` 的自有属性中查找。
2. 沿 `o.[[Prototype]]` 逐级检查。
3. 到达 `null` 后停止，仍未找到时返回 `undefined`。

以上述结构示意为例，`o.b` 返回第一层的 `myArray`，`o.c` 返回第二层的 `4`，`o.d` 返回第三层的 `5`。读取不存在的
`o.missing` 时，查找会在 `Object.prototype.[[Prototype]]` 的 `null` 处结束并返回 `undefined`。

方法与普通属性遵循相同的查找过程，调用时的 `this` 指向接收调用的对象：

```js
//通过字面量创建的对象，其 [[Prototype]] 是 Object.prototype
const parent = {
  value: 2,
  getValue() {
    return this.value
  },
}
// child 创建时指定 [[Prototype]] 为 parent
const child = {
  __proto__: parent,
}

console.log(child.getValue()) // 2
console.log(parent.getValue()) // 2, getValue 中的 this 指向 parent
```

`getValue` 来自 `parent`，以 `child.getValue()` 形式调用时，方法中的 `this` 仍然指向 `child`。

### 2.3 属性掩蔽{#属性掩蔽}

对象与原型包含同名属性时，属性查找会先命中对象的自有属性，使原型属性暂时不可见，这种关系称为属性掩蔽（property
shadowing）。本例中，原型上的 `value` 是可写数据属性，因此给 `child.value` 赋值会在 `child` 上创建自有属性，不会修改
`parent.value`。

```js
const parent = {
  value: 2,
  getValue() {
    return this.value
  },
}

const child = {
  __proto__: parent,
}

child.value = 4

console.log(child.value) // 4
console.log(child.getValue()) // 4，this 指向 child
console.log(parent.value) // 2
console.log(Object.hasOwn(child, 'value')) // true
```

赋值后的 `child`（`child.[[Prototype]] === parent`）：

```json
{
  "value": 4,
  "__proto__": {
    "value": 2,
    "getValue": "[Function: getValue]",
    "__proto__": "Object.prototype"
  }
}
```

### 2.4 属性删除{#属性删除}

`delete obj.key` 删除 `obj` 上可配置的自有属性。删除掩蔽原型属性的自有属性后，下一次读取会继续沿原型链查找。

```js
const parent = {
  value: 2,
}

const child = {
  value: 4,
  __proto__: parent,
}

console.log(child.value) // 4

delete child.value

console.log(child.value) // 2，继续查找到 parent.value
console.log(Object.hasOwn(child, 'value')) // false
console.log('value' in child) // true，原型链中仍有 value
console.log(parent.value) // 2
```

`delete child.value` 只处理 `child` 的自有属性，不会删除 `parent.value`。不可配置属性不能删除；严格模式下执行删除会抛出
`TypeError`。对数组索引使用 `delete` 会留下空位，数组的 `length` 保持不变：

```js
const values = ['a', 'b']

delete values[0]

console.log(values.length) // 2
console.log(0 in values) // false
console.log(values[0]) // undefined
```

### 2.5 prototype 与构造函数{#prototype与构造函数}

原型相关成员可以归纳为两类：

| 名称              | 所属对象       | 作用                                                     |
|-----------------|------------|--------------------------------------------------------|
| `[[Prototype]]` | 每个对象的内部槽   | 指向属性查找的下一层；下文的对象结构示意中使用 `__proto__` 表示 `[[Prototype]]` |
| `prototype`     | 可构造函数的自有属性 | `new` 创建实例时，用作实例的 `[[Prototype]]`                      |

二者并不相同，构造函数本身也是对象，所以它同样具有 `[[Prototype]]`，但通过 `new Constructor()`
创建对象时，获取 `Constructor.prototype`，如果它是一个对象，则作为新对象的 `[[Prototype]]`；否则使用 `Object.prototype`。

```js
function Box(value) {
  this.value = value;
}

Box.prototype.getValue = function() {
  return this.value;
};

const box = new Box(1);

console.log(box.value); // 1
console.log(box.getValue()); // 1
console.log(box.constructor === Box); // true
```

构造函数对象 `Box`：

```json
{
  "length": 1,
  "name": "Box",
  "prototype": {
    "constructor": "[Function: Box]",
    "getValue": "[Function: getValue]",
    "__proto__": "Object.prototype"
  },
  "__proto__": "Function.prototype"
}
```

实例对象 `box`：

```json
{
  "value": 1,
  "__proto__": {
    "constructor": "[Function: Box]",
    "getValue": "[Function: getValue]",
    "__proto__": "Object.prototype"
  }
}
```

默认情况下，`Box.prototype` 上存在一个名为 `constructor` 的普通属性，其值指向构造函数 `Box`。
由于 `box.[[Prototype]] === Box.prototype`，访问 `box.constructor` 时会沿原型链找到该属性，因此结果为 `Box`。

执行 `new Box(1)` 时，发生如下过程：

1. 创建一个新对象。
2. 获取 `Box.prototype`；若其值为对象，则将新对象的 `[[Prototype]]` 设为它，否则设为 `Object.prototype`。
3. 使用新对象作为 `this` 执行构造函数 (因此 `value` 是 `box` 的自有属性，而不是 `Box.prototype` 的一部分)。
4. 若构造函数返回一个对象（包括函数），则返回该对象；否则返回新创建的对象。

```js
function KeepCreatedObject() {
  this.value = 1
  //返回值并非对象，因此不会覆盖已创建对象
  return 2
}

function ReplaceCreatedObject() {
  this.value = 1
  //返回值是对象，因此会覆盖已创建对象
  return { name: 2 }
}

console.log(new KeepCreatedObject().value) // 1
console.log(new ReplaceCreatedObject().value) // undefined
```

值得注意的是，创建实例时，执行的是引用赋值（浅拷贝），实例保存的是创建时对原型对象的引用（`box.[[Prototype]]` 与
`Box.prototype` 指向同一对象）。修改现有 `Box.prototype` 会影响已有实例；但 `Box.prototype` 重新赋值为新对象只影响后续实例，还会丢失默认的
`constructor` 属性。日常扩展构造函数时，应在现有原型对象上增加成员。

比如在下面的例子中，由于重新赋值了 `Box.prototype`，且新赋值对象 `{}` 中不包含 `constructor` 属性，因此，新创建实例 `box` 的
`constructor` 属性退化为 `Object`。

```js
function Box(value) {
  this.value = value
}

Box.prototype = {}
const box = new Box(1)
console.log(box.constructor) // Object
```

`box` 的结构示意

```json
{
  "value": 1,
  "__proto__": {
    "__proto__": "Object.prototype"
  }
}

```

由于 `Object.prototype` 中包含 `constructor` 属性（指向 `Object`），且上层没有属性覆盖它，因此 `box` 的
`constructor` 属性退化为 `Object`（而不是 `Box`）。

## 3. 内置对象{#内置对象}

当通过字面量创建对象时，字面量会自动选择对应的内置原型：

| 创建语法              | 构造函数       | 对象的 `[[Prototype]]`  |
|-------------------|------------|----------------------|
| `{}`              | `Object`   | `Object.prototype`   |
| `function f() {}` | `Function` | `Function.prototype` |
| `[1, 2]`          | `Array`    | `Array.prototype`    |
| `/abc/`           | `RegExp`   | `RegExp.prototype`   |

```js
const object = { a: 1 }

function func(value) {
  return value
}

const array = [1, 2, 3]
const regexp = /abc/

console.log(object.toString()) // [object Object]
console.log(func(1)) // 1
console.log(array.map((value) => value * 2)) // [2, 4, 6]
console.log(regexp.test('abc')) // true
```

### 3.1 Object{#Object}

对象字面量 `{a: 1}`：

```json
{
  "a": 1,
  "__proto__": "Object.prototype"
}
```

其中，`Object.prototype` 包含了若干 `Object` 类型可使用的方法与属性，其结构示意如下：

```json
{
  "constructor": "[Function: Object]",
  "hasOwnProperty": "[Function: hasOwnProperty]",
  "isPrototypeOf": "[Function: isPrototypeOf]",
  "toString": "[Function: toString]",
  "...": "...",
  "__proto__": null
}
```

值得注意的是，`Object.prototype` 的 `[[Prototype]]` 是 `null`，表明属性查找到此将会终止。

### 3.2 Function{#Function}

函数也是对象。普通函数声明、普通函数表达式和 `Function` 构造器创建的函数的 `[[Prototype]]` 都是 `Function.prototype`：

```js
function declared(value) {
  return value;
}

const anonymous = function(value) {
  return value;
};

const arrow = (value) => value;
const dynamic = new Function("value", "return value");

console.log(typeof declared); // function
console.log(typeof anonymous.prototype); // object
console.log(arrow.prototype); // undefined
console.log(dynamic(1)); // 1
```

只有可作为构造函数调用的函数才拥有默认的 `prototype` 属性，它表示使用 `new` 调用该函数时，新创建对象的 `[[Prototype]]`。

```js
function car() {
  this.name = 'Car'
}

car.prototype.drive = function() {
  console.log('Drive')
}

const carObj = new car()
```

其中 `carObj` 结构示意如下：

```json
{
  "name": "Car",
  "__proto__": {
    "constructor": "[Function: Car]",
    "drive": "[Function: drive]",
    "__proto__": "Object.prototype"
  }
}
```

匿名的普通 `function` 表达式仍然拥有 `prototype`，也可以通过 `new` 调用。普通函数默认具有 `prototype` 属性；箭头函数和对象方法没有默认的
`prototype` 属性，因此不能作为构造函数。

普通函数对象结构示意：

```json
{
  "length": 1,
  "name": "funcName",
  "prototype": {
    "constructor": "[Function: funcName]",
    "__proto__": "Object.prototype"
  },
  "__proto__": "Function.prototype"
}
```

箭头函数对象和对象方法结构示意：

```js
const obj = {
  //对象方法
  method() {
  },
}
//箭头函数
const arrawFunc = () => {
}

console.log(obj.method.prototype) // undefined
console.log(arrawFunc.prototype) // undefined
//匿名箭头函数
console.log((() => {
}).prototype) // undefined

```

`obj.method` 对象示意如下：

```json
{
  "name": "method",
  "__proto__": "Function.prototype"
}
```

`arrawFunc`对象示意如下：

```json
{
  "name": "arrowFunc",
  "__proto__": "Function.prototype"
}
```

匿名箭头函数对象示意如下：

```json
{
  "name": "",
  "__proto__": "Function.prototype"
}
```

因此，箭头函数与对象方法均没有 `prototype` 属性，因此不可作为构造函数调用。

`new Function()` 创建的是全新的函数对象，其函数体始终在全局作用域中编译，不会捕获当前词法环境，无法形成闭包，因此它不能作为普通函数声明或函数表达式的等价替代。因此与字面量（如
`[1, 2, 3]`）可以改写为等价的构造函数形式（如 `new Array(1, 2, 3)`）不同，只有不依赖外部词法环境的函数，才能用
`new Function()` 表示；对于捕获了当前词法作用域的函数，则无法等价地使用 `new Function()` 创建。

例如以下函数定义：

```js
function add(a, b) {
  return a + b;
}
```

等价于声明函数对象：

```js
const add = new Function("a", "b", "return a+b");
```

但对于捕获了上下文的函数，如：

```js
const prefix = 'prefix'

function f(obj) {
  // 使用上下文中的 prefix 常量
  return prefix + ' ' + obj.toString()
}

// new Function() 定义的函数对象无法捕获上下文中的 prefix 常量
const fn = new Function(
  'obj',
  'return prefix + obj.toString()',
)
console.log(f({})) // prefix [object Object]
console.log(fn({})) // ReferenceError: prefix is not defined
```

则不可使用 `new Function()` 形式表示。

### 3.3 Array{#Array}

数组字面量 `[1, 2, 3]`：

```json
{
  "0": 1,
  "1": 2,
  "2": 3,
  "length": 3,
  "__proto__": "Array.prototype"
}
```

> 在数组中，下标被视为属性键，因此可以通过标准的属性访问语法 `array[index]` 或 `array["0"]`（本质上属性键都会转换为字符串）
> 访问元素。

> `new Array(3)` 表示创建长度为 3 的稀疏数组，与只含一个数字的 `[3]` 含义不同；`new Array(1, 2)` 表示创建数组 `[1, 2]`。

`Array.prototype` 本身也是简单对象，因此，`Array.prototype.[[Prototype]]` 是 `Object.prototype`。

`Array.prototype`结构示意如下：

```json
{
  "constructor": "[Function: Array]",
  "at": "[Function: at]",
  "concat": "[Function: concat]",
  "copyWithin": "[Function: copyWithin]",
  "find": "[Function: find]",
  "indexOf": "[Function: indexOf]",
  "map": "[Function: map]",
  "forEach": "[Function: forEach]",
  "...": "...",
  "__proto__": "Object.prototype"
}
```

### 3.4 RegExp{#RegExp}

正则表达式字面量 `/abc/`：

```json
{
  "source": "abc",
  "lastIndex": 0,
  "__proto__": "RegExp.prototype"
}
```

`RegExp.prototype` 本身也是简单对象，因此，`RegExp.prototype.[[Prototype]]` 是 `Object.prototype`。

`RegExp.prototype`结构示意如下：

```json
{
  "constructor": "[Function: RegExp]",
  "compile": "[Function: compile]",
  "exec": "[Function: exec]",
  "test": "[Function: test]",
  "source": "[Function: source]",
  "toString": "[Function: toString]",
  "...": "...",
  "__proto__": "Object.prototype"
}
```

## 4. Object 原型 API{#Object原型API}

`Object.prototype` 上定义了一系列对象默认可继承的方法。
除了通过 `Object.create(null)` 创建的无原型对象外，普通对象的原型链最终都会到达 `Object.prototype`，因此，如下API可以在绝大部分对象上使用。

| API                                 | 作用                          |
|-------------------------------------|-----------------------------|
| `Object.getPrototypeOf(obj)`        | 读取对象的直接原型                   |
| `Object.setPrototypeOf(obj, proto)` | 修改现有对象的直接原型                 |
| `Object.create(proto)`              | 创建以 `proto` 为直接原型的新对象       |
| `proto.isPrototypeOf(obj)`          | 判断 `proto` 是否位于 `obj` 的原型链中 |
| `Object.hasOwn(obj, key)`           | 判断属性是否为对象的自有属性              |

`Object.create(proto)` 创建以 `proto` 为直接原型的新对象：

```js
const base = {
  value: 1,
};

const child = Object.create(base);
child.name = "child";

console.log(Object.getPrototypeOf(child) === base); // true
console.log(base.isPrototypeOf(child)); // true
console.log(Object.hasOwn(child, "name")); // true
console.log(Object.hasOwn(child, "value")); // false
```

`child`：

```json
{
  "name": "child",
  "__proto__": {
    "value": 1,
    "__proto__": "Object.prototype"
  }
}
```

`Object.create(null)` 创建没有原型的对象：

```js
const dictionary = Object.create(null);
dictionary.name = "Ada";

console.log(Object.getPrototypeOf(dictionary)); // null
console.log(Object.hasOwn(dictionary, "name")); // true
console.log(dictionary.toString); // undefined
```

```json
{
  "name": "Ada",
  "__proto__": null
}
```

`Object.setPrototypeOf()` 会改变现有对象的结构，并可能使引擎放弃已经建立的属性访问优化。原型关系应尽量在对象创建时确定。扩展
`Object.prototype`、`Array.prototype` 等内置原型还可能与未来标准成员冲突，通常只用于兼容性补丁。

## 5. 类{#类}

### 5.1 类对象{#类对象}

类（`class`）声明在运行时创建一个类构造函数（constructor function），并将类名绑定到该函数对象。类名可以赋值和传参：

```js
class User {
  constructor(name) {
    this.name = name
  }

  greet() {
    return `Hello, ${this.name}`
  }
}

const UserAlias = User
const user = new UserAlias('Ada')

console.log(typeof User) // function
console.log(UserAlias === User) // true
console.log(user.greet()) // Hello, Ada
console.log(User.prototype.constructor === User)// true
```

类对象 `User`：

```json
{
  "length": 1,
  "name": "User",
  "prototype": "User.prototype",
  "__proto__": "Function.prototype"
}
```

原型对象 `User.prototype`：

```json
{
  "constructor": "[Class: User]",
  "greet": "[Function: greet]",
  "__proto__": "Object.prototype"
}
```

类中定义的方法会添加到 `User.prototype` 上，而不是复制到每个实例对象中，因此所有实例共享同一份方法。

实例对象 `user` 由 `User` 创建，因此其 `[[Prototype]]` 等于 `User.prototype`：

```json
{
  "name": "Ada",
  "__proto__": "User.prototype"
}
```

与普通函数相比，类具有以下特点：

1. 类必须通过 `new` 调用
2. 类体始终处于严格模式
3. 类声明具有暂时性死区（TDZ），声明前不可访问

```js
console.log(User) // ReferenceError: Cannot access 'User' before initialization

class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const obj = User() // TypeError: Class constructor User cannot be invoked without 'new'
```

`class` 并没有引入新的对象模型，它只是建立在原型继承之上的一种更易读的语法。

### 5.2 实例成员{#实例成员}

公共实例字段和构造函数中对 `this` 的赋值都会成为实例的自有属性；实例方法与访问器存放在 `ClassName.prototype` 上。

```js
class Counter {
  //公共实例字段会成为实例的自有属性
  value = 0

  constructor(step = 1) {
    // 构造函数中对 this 的赋值会成为实例的自有属性
    this.step = step
  }

  //访问器存放在 ClassName.prototype 上
  get doubled() {
    return this.value * 2
  }

  //实例方法存放在 ClassName.prototype 上
  add() {
    this.value += this.step
    return this.value
  }
}

const counter = new Counter(2)

console.log(counter.add()) // 2
console.log(counter.doubled) // 4
```

实例对象 `counter`：

```json
{
  "value": 2,
  "step": 2,
  "__proto__": "Counter.prototype"
}
```

原型对象 `Counter.prototype`：

```json
{
  "constructor": "[Class: Counter]",
  "doubled": "[Getter: doubled]",
  "add": "[Function: add]",
  "__proto__": "Object.prototype"
}
```

不同实例共享相同的实例方法与访问器，但各自保存公共实例字段。

### 5.3 静态成员{#静态成员}

静态字段、静态方法和静态访问器直接属于类对象，不会出现在实例上。

```js
class Counter {
  static kind = "counter";

  static create(step = 1) {
    return new Counter(step);
  }

  constructor(step) {
    this.step = step;
  }
}

const counter = Counter.create(2);

console.log(Counter.kind); // counter
console.log(counter.step); // 2
console.log(counter.kind); // undefined
```

类对象 `Counter`：

```json
{
  "name": "Counter",
  "prototype": "Counter.prototype",
  "kind": "counter",
  "create": "[Function: create]",
  "__proto__": "Function.prototype"
}
```

实例对象 `counter`：

```json
{
  "step": 2,
  "__proto__": "Counter.prototype"
}
```

不可直接在实例上访问静态成员，但由于实例的 `constructor` 属性指向构造函数（即类对象），因此可以通过`counter.constructor.key`
访问静态成员。

```js
class Counter {
  static kind = 'counter'

  static create(step = 1) {
    return new Counter(step)
  }

  constructor(step) {
    this.step = step
  }
}

const counter = Counter.create(2)

console.log(Counter.kind) // counter
console.log(counter.constructor.kind) // counter
```

### 5.4 继承{#继承}

`extends` 同时连接实例侧和静态侧。`super()` 调用父类构造逻辑，`super.method()` 从父类原型开始查找方法。

```js
class Animal {
  static category = "animal";

  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak() {
    return `${super.speak()}: wang`;
  }
}

const dog = new Dog("Mochi");

console.log(dog.speak()); // Mochi makes a sound: wang
console.log(Dog.category); // animal
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
```

### 5.5 私有字段与静态块{#私有字段与静态块}

私有字段使用 `#name` 声明。运行时会检查对象是否由对应类声明过该私有字段，类外代码和派生类都不能直接访问。

```js
class Counter {
  #value = 0;

  add() {
    this.#value += 1;
    return this.#value;
  }
}

const counter = new Counter();

console.log(counter.add()); // 1
console.log(counter.add()); // 2
```

静态初始化块（static initialization block）在类定义求值时运行，可访问类的静态私有成员：

```js
class Registry {
  static #entries = [];

  static {
    this.#entries.push("ready");
  }

  static list() {
    return [...this.#entries];
  }
}

console.log(Registry.list()); // ["ready"]
```

## 6. 类型判断{#类型判断}

### 6.1 typeof 与 instanceof{#运行时判断}

`typeof` 读取值的基础运行时标签；`instanceof` 检查指定构造函数的 `prototype` 属性是否位于对象的原型链中。

```js
class User {
}

const user = new User();

console.log(typeof User); // function
console.log(typeof user); // object
console.log(user instanceof User); // true
console.log(user instanceof Object); // true
console.log(Array.isArray([])); // true
console.log(typeof null); // object
```

| 接口                             | 适用内容             |
|--------------------------------|------------------|
| `typeof value`                 | 原始值、函数以及对象这一基础分类 |
| `value instanceof Constructor` | 构造函数原型是否位于对象原型链中 |
| `Array.isArray(value)`         | 值是否为真正的数组        |
| `Object.hasOwn(value, key)`    | 属性是否为对象的自有属性     |

`instanceof` 依赖当前运行环境中的构造函数和原型对象。

例如，一个简单的 `instanceof` 可以实现如下：

```js
function isInstanceOf(obj, constructor) {
  if (typeof obj !== 'object' || typeof constructor !== 'function')
    throw new TypeError('obj must be an object and constructor must be a function')

  let prototype = Object.getPrototypeOf(obj)

  while (prototype !== null) {
    //遍历对象的原型链，查找是否 prototype === constructor.prototype
    if (prototype === constructor.prototype) {
      return true
    }
    prototype = Object.getPrototypeOf(prototype)
  }
  return false
}
```

## 7. 类语法解糖{#类语法解糖}

JavaScript中的 `class` 语法实际上是建立在原型链上的语法糖。解糖（desugaring）将 `class` 语法转化为等价的原型链使用。下面的等价代码表达主要对象关系，并非
ECMAScript 规范级源码转换。

### 7.1 基础类解糖{#基础类解糖}

```js
class Counter {
  //公共实例字段
  value = 0

  //公共静态字段
  static kind = 'counter'

  //构造函数
  constructor(step = 1) {
    //构造函数中对 this 的赋值
    this.step = step
  }

  //公共实例方法
  add() {
    this.value += this.step
    return this.value
  }

  //公共静态方法
  static create(step) {
    return new Counter(step)
  }
}
```

主要运行时关系接近以下构造函数写法：

```js
function Counter(step = 1) {
  //实例字段 等价于 构造函数中对 this 的赋值
  this.value = 0

  this.step = step
}

//实例方法存储于 Counter.prototype 中
Object.defineProperty(Counter.prototype, 'add', {
  value: function add() {
    this.value += this.step
    return this.value
  },
  writable: true,
  configurable: true,
  enumerable: false,
})
//静态字段是类对象的自有属性
Counter.kind = 'counter'

//静态方法也是类对象的自有属性
Object.defineProperty(Counter, 'create', {
  value: function create(step) {
    return new Counter(step)
  },
  writable: true,
  configurable: true,
  enumerable: false,
})

const counter = Counter.create(2)
console.log(counter.add()) // 2
```

| 类语法                | 运行时位置               | `prototype` / 构造函数写法            |
|--------------------|---------------------|---------------------------------|
| 公共实例字段 `value`     | 实例自有属性              | 构造函数中执行 `this.value = 0`        |
| 构造函数中的 `this.step` | 实例自有属性              | 保留在函数构造器中执行                     |
| 实例方法 `add`         | `Counter.prototype` | 在 `Counter.prototype` 上定义不可枚举方法 |
| 公共静态字段 `kind`      | 构造函数对象 `Counter`    | 执行 `Counter.kind = "counter"`   |
| 静态方法 `create`      | 构造函数对象 `Counter`    | 在 `Counter` 上定义不可枚举方法           |

`Object.defineProperty()` 用于还原类方法默认不可枚举的属性描述符；直接执行 `Counter.prototype.add = ...` 会创建可枚举属性。

### 7.2 继承解糖{#继承解糖}

类继承需要连接两条原型链：

```js
function Animal(name) {
  this.name = name
}

//静态成员
Animal.category = 'animal'
Animal.logCategory = function() {
  console.log(this.category)
}

//实例方法
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`
}

//子类型
function Dog(name) {
  // 模拟 super，调用父类构造函数
  Animal.call(this, name)
}

//建立实例方法的继承关系（实例字段是对象的自有属性，并不在 prototype 中）
Object.setPrototypeOf(Dog.prototype, Animal.prototype)
//建立静态成员的继承关系
Object.setPrototypeOf(Dog, Animal)

//实例方法覆写
Dog.prototype.speak = function() {
  //使用 prototype.method.call(this) 调用父类实例方法
  return `${Animal.prototype.speak.call(this)}: wang`
}

//静态成员覆写
Dog.category = 'dog'
Dog.logCategory = function() {
  console.log(`${Animal.category} -> ${Dog.category}`)
}

const dog = new Dog('Mochi')

console.log(dog instanceof Dog) // true
console.log(dog instanceof Animal) // true
console.log(Dog.category) // dog
Dog.logCategory() // animal -> dog
```

实例对象 `dog` 的结构示意：

```json
{
  "name": "Mochi",
  "__proto__": {
    "constructor": "[Function: Dog]",
    "speak": "[Function: Dog.speak]",
    "__proto__": {
      "constructor": "[Function: Animal]",
      "speak": "[Function: Animal.speak]",
      "__proto__": "Object.prototype"
    }
  }
}
```

构造函数对象 `Dog` 的结构示意：

```json
{
  "name": "Dog",
  "prototype": {
    "constructor": "[Function: Dog]",
    "speak": "[Function: Dog.speak]",
    "__proto__": {
      "constructor": "[Function: Animal]",
      "speak": "[Function: Animal.speak]",
      "__proto__": "Object.prototype"
    }
  },
  "__proto__": {
    "name": "Animal",
    "category": "animal",
    "prototype": "Animal.prototype",
    "__proto__": "Function.prototype"
  }
}
```

`dog.__proto__` 展开实例方法继承链，`Dog.__proto__` 展开静态成员继承链。

- 实例方法继承：`Object.setPrototypeOf(Dog.prototype, Animal.prototype)` 建立实例方法继承（实例字段是对象的自有属性，并不在
  `prototype`
  中）。
- 静态成员继承：`Object.setPrototypeOf(Dog, Animal)` 建立静态成员继承。
- 调用父类实例方法：`Animal.prototype.speak.call(this)` 等价于 `super.speak()`。
- 调用父类构造函数：`Animal.call(this,name)` [***约等于***](#附录) `super(name)`。

### 7.3 专用语法{#专用语法}

第 5.5 节中的私有字段和静态初始化块包含类语法专用的运行时规则，无法通过简单的 `prototype` 赋值完整表达。

| 类语法           | 传统写法能够表达的部分            | 无法直接等价的部分           |
|---------------|------------------------|---------------------|
| 私有字段 `#value` | 可用闭包或 `WeakMap` 保存实例状态 | 私有名称语法、品牌检查和类体内访问权限 |
| 静态私有字段        | 可在模块闭包中保存共享状态          | 与类绑定的私有名称和品牌检查      |
| 静态初始化块        | 可在构造函数声明后立即执行普通代码      | 直接访问静态私有成员及块级作用域    |

公共字段仍可转化为构造函数中的赋值；这一节只说明缺少直接 `prototype` 等价形式的成员。

### 7.4 语义差异{#语义差异}

`class` 使用原型链共享方法，同时增加一组更严格的语言规则：

| 行为              | 函数构造器      | `class`                |
|-----------------|------------|------------------------|
| 不使用 `new` 调用    | 普通函数可以调用   | 抛出 `TypeError`         |
| 声明前访问           | 函数声明可用     | 处于暂时性死区                |
| 函数体模式           | 取决于上下文     | 类体始终为严格模式              |
| 方法可枚举性          | 直接赋值时可枚举   | 类方法不可枚举                |
| 方法能否通过 `new` 调用 | 普通函数值通常可以  | 类方法不可构造                |
| 私有字段            | 无直接语法      | 支持 `#field` 与品牌检查      |
| 静态初始化           | 类声明后执行普通代码 | 支持可访问私有成员的静态块          |
| 继承              | 手动维护两条原型链  | `extends`、`super` 统一维护 |

## 8. 小结{#小结}

- `[[Prototype]]` 存在于每个对象上，JSON 快照用 `__proto__` 展示这条链接。
- `prototype` 是可构造函数的自有属性，`new` 将它连接到新实例的 `[[Prototype]]`。
- 对象、函数、数组和正则表达式会自动接入对应的内置原型。
- 类名在运行时绑定类对象；实例方法位于类的 `prototype`，静态成员位于类对象本身。
- 类语法能够解糖到构造函数和原型操作，但私有字段、静态块及完整 `super` 无法完全使用构造函数和原型操作实现。

## 附录{#附录}

### `super(...arg)` 与 `Base.call(this, ...arg)`的区别

在[例](#继承解糖)中，使用 `Animal.call(this, name)` 在子类型构造函数中调用父类型构造函数，作为在无 `class` 语法下的
`super()` 近似实现。

但这只是传统函数构造器下的实现方式。对于 `class` 派生类，`super()` 并不是简单地执行父类构造函数，而是按照 ECMAScript
的派生构造规则初始化实例。因此，当父类使用 `class` 声明、依赖 `new.target` 或显式返回其他对象时，`Base.call(this, ...arg)`
无法完整模拟 `super(...arg)` 的行为。

#### 1. `class` 派生构造语义

#### 1.1 `class` 构造函数不能直接调用

```js
//父类使用 class 声明
class Animal {
  constructor(name) {
    this.name = name
  }
}

//子类型使用 构造函数形式 无法使用 Base.call(this, ...arg)
function DogFunction() {
  Animal.call(this, 'Mochi') // TypeError: Class constructor Animal cannot be invoked without 'new'
}

//子类型使用 class 语法 可以使用 super(...arg)
class DogClass extends Animal {
  constructor(name) {
    super(name)
  }
}
```

在子类型中，`super()` 可以正常工作，而 `Animal.call()` 会直接抛出异常，因此二者并不等价。

##### 1.2 派生类中的 `this` 必须由 `super()` 初始化

```js
class Animal {
  constructor(name) {
    this.name = name
  }
}

function DogFunction() {
  //由子类型创建this，并传递给父类构造函数
  this.detailedCategory = 'dog'
  Animal.call(this, 'Mochi')
}

class DogClass extends Animal {
  constructor(name) {
    //super执行结束后，this才可访问
    this.detailedCategory = 'dog' // ReferenceError: Must call super constructor before accessing 'this'
    super(name)
  }
}
```

在派生类中，`this` 并不是进入构造函数时就已经存在，而是执行 `super()` 后才完成初始化，使用构造函数形式无法实现此特性。

### 2. `super()` 会保留 `new.target`

`super()` 会保留真正正在构造的类型。

```js
function AnimalFunction() {
  console.log(new.target)
}

function DogFunction() {
  AnimalFunction.call(this)
}


class AnimalClass {
  constructor() {
    console.log(new.target.name)
  }
}

class DogClass extends AnimalClass {
  constructor() {
    super()
  }
}

new DogFunction() // undefined
new DogClass() // Dog
```

虽然执行的是 `Animal` 的构造函数，但 `new.target` 仍然是最终实例化的类型 `Dog`。

如果改成普通函数：

```js
function Animal() {
  console.log(new.target)
}

Animal.call({}) // undefined
```

因此 `Base.call(this, ...arg)` 无法模拟 `super(...arg)` 的这一行为。

### 3. `super()` 会处理父类返回对象

```js
function AnimalFunction() {
  return {
    name: 'replacement',
  }
}

function DogFunction() {
  const result = AnimalFunction.call(this)

  // result 被忽略
}

class AnimalClass {
  constructor() {
    return {
      name: 'replacement',
    }
  }
}

class DogClass extends AnimalClass {
  constructor() {
    super()
  }
}

console.log(new DogFunction()) // DogFunction {}
console.log(new DogClass()) // { name: 'replacement' }
```

`Animal.call(this)` 的返回值不会自动替换 `new Dog()` 创建的实例，而 `super()` 会按照 ECMAScript 的派生构造规则处理父类返回对象，因此二者行为不同。

可以把实例方法中的 `super.method(...arg)` 近似理解为 `Base.prototype.method.call(this, ...arg)`；但不要把构造函数中的
`super(...arg)` 理解为 `Base.call(this, ...arg)`。前者只是普通的方法调用，而后者涉及实例创建、`this` 初始化、`new.target`
传递以及父类返回对象等派生构造语义，因此二者并不等价。
