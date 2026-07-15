---
title: JavaScript 对象属性与枚举
date: 2026-07-11
tags: [ TypeScript, JavaScript ]
pinned: false
collection: 深入理解 Ts/Js
outline:
  - title: 1. 属性键
    slug: 属性键
  - title: 1.1 属性键的转换
    slug: 属性键的转换
    level: 1
  - title: 1.2 字符串键
    slug: 字符串键
    level: 1
  - title: 1.3 Symbol 键
    slug: Symbol键
    level: 1
  - title: 1.4 属性的定义与访问
    slug: 属性的定义与访问
    level: 1
    
  - title: 2. 属性描述符
    slug: 属性描述符
  - title: 2.1 描述符的两种类型
    slug: 描述符的两种类型
    level: 1
  - title: 2.2 数据描述符
    slug: 数据描述符
    level: 1
  - title: 2.3 访问器描述符
    slug: 访问器描述符
    level: 1
  - title: 2.4 共享操作标志
    slug: 共享操作标志
    level: 1
  - title: 2.5 属性描述符 API
    slug: 属性描述符API
    level: 1
  - title: 2.5.1 getOwnPropertyDescriptor
    slug: getOwnPropertyDescriptor
    level: 2
  - title: 2.5.2 defineProperty
    slug: defineProperty
    level: 2
  - title: 2.5.3 批量描述符 API
    slug: 批量描述符API
    level: 2
  - title: 2.6 创建方式与默认值
    slug: 创建方式与默认值
    level: 1
  - title: 2.6.1 对象字面量与赋值
    slug: 对象字面量与赋值
    level: 2
  - title: 2.6.2 类字段与类方法
    slug: 类字段与类方法
    level: 2
  - title: 2.6.3 通过属性描述符创建属性
    slug: 通过属性描述符创建属性
    level: 2

  - title: 3. 属性的可枚举性
    slug: 属性的可枚举性
  - title: 3.1 自有属性与继承属性
    slug: 自有属性与继承属性
    level: 1
  - title: 3.2 可枚举属性与不可枚举属性
    slug: 可枚举属性与不可枚举属性
    level: 1

  - title: 4. 属性枚举
    slug: 属性枚举
  - title: 4.1 枚举接口
    slug: 枚举接口
    level: 1
  - title: 4.1.1 for...in
    slug: for-in
    level: 2
  - title: 4.2 属性键顺序
    slug: 属性键顺序
    level: 1
  - title: 4.3 键枚举与值读取
    slug: 键枚举与值读取
    level: 1

  - title: 5. 原型链枚举
    slug: 原型链枚举
  - title: 5.1 属性遮蔽
    slug: 属性遮蔽
    level: 1

  - title: 6. 属性复制与序列化
    slug: 属性复制与序列化
  - title: 6.1 Object.assign 与对象展开
    slug: Object-assign与对象展开
    level: 1
  - title: 6.2 保留属性描述符的复制
    slug: 保留属性描述符的复制
    level: 1
  - title: 6.3 JSON.stringify
    slug: JSON-stringify
    level: 1

  - title: 7. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: TypeScript 与 JavaScript 复习系列第二篇，整理 JavaScript 属性的组成、字符串与 Symbol 键、计算属性名、属性描述符、所有权、可枚举性及枚举接口。
  - - meta
    - name: keywords
      content: JavaScript, 对象属性, 计算属性名, 属性描述符, enumerable, Object.keys, Reflect.ownKeys, for...in, Object.assign, Symbol
---

本文先说明属性键以及属性数据与元数据，再讨论属性的枚举行为。

---

[JavaScript 原型与类型](./ts-review-01-prototype.md) 介绍了属性查找与原型链。 在 JavaScript 中，每个对象属性都由属性键和属性描述符组成：

- 属性键是属性的名称，用来在对象中定位属性。
- 属性描述符记录属性的数据和元数据。数据属性的值保存在描述符的 `value` 字段中；访问器属性使用 `get`、`set`
  字段记录读写函数。元数据是控制属性行为的信息，例如能否写入、能否枚举以及能否重新定义。

因此，属性值包含在属性描述符中，不是与属性键、属性描述符并列的第三部分。

## 1. 属性键{#属性键}

属性键用来在对象中定位属性，最终类型只有字符串和 `Symbol`。

### 1.1 属性键的转换{#属性键的转换}

方括号访问、计算属性名以及 `Object.hasOwn()` 等接收属性键的方法遇到其他类型的键时，会先执行属性键转换；ECMAScript
规范把这一步称为 `ToPropertyKey`。

待用作属性键的值是对象时，JavaScript 先把它转换成字符串、数字、布尔值或 `Symbol` 等非对象值，规范把这类值称为原始值。转换结果是
`Symbol` 时直接使用，否则继续转成字符串。
`ToPropertyKey` 是规范中的内部操作，不是可以在代码中直接调用的函数。

| 输入值            | 最终的属性键                     |
|----------------|----------------------------|
| 字符串 `"name"`   | 字符串 `"name"`               |
| 数字 `1`         | 字符串 `"1"`                  |
| BigInt `1n`    | 字符串 `"1"`                  |
| 布尔值 `true`     | 字符串 `"true"`               |
| `null`         | 字符串 `"null"`               |
| `undefined`    | 字符串 `"undefined"`          |
| `Symbol('id')` | 原来的 `Symbol`               |
| 普通对象 `{}`      | 通常是字符串 `"[object Object]"` |

> 对象可以通过 `Symbol.toPrimitive`、`toString()` 或 `valueOf()` 影响自身的转换结果，因此表中的 `{}`
> 只表示普通对象的默认行为。

不同类型的值可能转换成同一个字符串键。下面的数字 `1`、BigInt `1n` 和字符串 `"1"` 操作的是同一条属性：

```js
const record = {}

record[1] = 'number'
record[1n] = 'bigint'

console.log(record['1']) // bigint
console.log(record['1'] === record[1] && record['1'] === record[1n]) // true
```

### 1.2 字符串键{#字符串键}

大多数属性使用字符串键。代码已经确定键名时可以使用点号；键名保存在变量中，或者包含连字符等不能写在点号后的字符时，使用方括号。

- `record.name` 固定访问字符串键 `"name"`。
- `record['display-name']` 访问字符串键 `"display-name"`。
- `record[field]` 先读取变量 `field`，再把变量值转换成属性键。

```js
const field = 'display-name'
const record = {
  name: 'Ada',
  'display-name': 'Ada Lovelace',
}

console.log(record.name) // Ada
console.log(record['name']) // Ada
console.log(record[field]) // Ada Lovelace
```

> 点号后的名称不会被当作变量求值。即使存在变量 `name`，`record.name` 访问的仍然是字符串键 `"name"`；只有
> `record[name]` 才会使用变量 `name` 保存的值作为键。

### 1.3 Symbol 键{#Symbol键}

`Symbol` 也可以作为属性键。每次调用 `Symbol()` 都会创建一个新的 `Symbol`，因此它适合添加不易与现有字符串键冲突的属性。
`Symbol` 键不能写在点号后；使用对象字面量定义或使用属性访问语法时，都要把它放在方括号中。

```js
// 相同描述文本创建不同的 Symbol
const localId = Symbol('id')
const anotherLocalId = Symbol('id')
console.log(localId === anotherLocalId) // false

// Symbol.for() 为相同的注册表键返回同一个 Symbol
const sharedId = Symbol.for('shared.id')
const sameSharedId = Symbol.for('shared.id')
console.log(sharedId === sameSharedId) // true

// Symbol() 与 Symbol.for() 相互独立
const scopedId = Symbol('app.id')
const globalId = Symbol.for('app.id')
console.log(scopedId === globalId) // false
```

> `Symbol()` 不访问全局 `Symbol` 注册表，每次调用都返回不同的值。`Symbol.for(key)` 会先在全局注册表中查找字符串 `key`
> ：找到时返回已有的 `Symbol`，找不到时创建并登记一个新的 `Symbol`。因此，重复调用 `Symbol.for('shared.id')` 会得到同一个值，但
> `Symbol('shared.id')` 与它并不相等。

### 1.4 属性的定义与访问{#属性的定义与访问}

定义属性和访问属性都可以直接写出键，也可以在运行时计算键。定义语法中的 `[expression]` 称为计算属性名；
`object[expression]` 则是方括号属性访问。

| 阶段 | 语法                  | 属性键的来源                 | 作用                  |
|----|---------------------|------------------------|---------------------|
| 定义 | `{ name: value }`   | 固定字符串 `"name"`         | 创建属性，值取自表达式 `value` |
| 定义 | `{ name }`          | 固定字符串 `"name"`         | 创建属性，值取自同名变量 `name` |
| 定义 | `{ [name]: value }` | 求值变量 `name` 后执行属性键转换   | 使用计算属性名创建属性         |
| 访问 | `object.name`       | 固定字符串 `"name"`         | 读取或写入已有对象的对应属性      |
| 访问 | `object[name]`      | 每次求值变量 `name` 后执行属性键转换 | 读取或写入已有对象的对应属性      |

下面的 `field` 和 `token` 只有放进方括号后，变量保存的字符串与 `Symbol` 才会成为属性键：

```js
const field = 'score'
const token = Symbol('token')

const record = {
  // 静态属性名
  field: 0,              // 字符串键 "field"
  token,                 // 字符串键 "token"，值是 token 保存的 Symbol
  // 计算属性名，先求值再作为键
  [field]: 1,            // 字符串键 "score"
  [token]: 2,            // Symbol键 Symbol('token')
  ['score-' + 1]: 90,    // 字符串键 "score-1"
}

// 静态属性名访问，作为固定字符串
console.log(record.field) // 0
console.log(record.score) // 1
console.log(record.token === token) // true

// 方括号属性访问，先求值再作为键访问属性
console.log(record[token]) // 2
console.log(record['score-1']) // 90
```

计算属性名在创建对象或者访问属性时求值一次。修改变量不会重命名已经创建的属性：

```js
let key = 'first'

const obj = {
  // 创建属性时求值一次
  [key]: 1,
}
console.log(obj) // { first: 1 }
console.log(obj[key]) // 1

key = 'second'
console.log(obj) // { first: 1 }
console.log(obj[key]) // undefined，访问属性时求值一次
```

方法和访问器同样可以使用计算属性名：

```js
const methodName = 'readScore'
const resultName = Symbol('doubleScore')

const score = {
  value: 2,
  [methodName]() {
    return this.value
  },
  get [resultName]() {
    return this.value * 2
  },
}

console.log(score.readScore()) // 2
console.log(score[methodName]()) // 2
console.log(score[resultName]) // 4
```

> ##### 补充：Symbol键 只能使用计算属性名
> 由于静态属性名 `{ name: value }`、`{ name }` 与 `object.name` 不会被求值，并且作为固定字符串键使用，因此，`Symbol`
> 键在定义属性与访问属性时都必须使用计算属性名。且必须注意不同 `Symbol()` 调用创建出的 Symbol 并不相同。
> ```js
> let key = Symbol('id')
> 
> const obj = {
>   key: 1, // 字符串键 "key": 1
>   [key]: 2, // Symbol键 Symbol("id"): 2
> }
> 
> console.log(obj.key) // 1
> console.log(obj[key]) // 2
> console.log(obj['key']) // 1
> 
> key = Symbol('id')  // 重新创建新的 Symbol
> console.log(obj[key]) // undefined
> ```


> ##### 补充：对象字面量中的 `__proto__` 键
> 对象字面量中的 `__proto__` 是一个特殊属性名。只有冒号定义 `__proto__: prototype` 与
> `"__proto__": prototype` 具有特殊行为：右侧为对象或 `null` 时设置新对象的原型，其他值会被忽略，并且不会创建自有
> `__proto__` 属性。计算形式 `['__proto__']: value`、简写形式 `{ __proto__ }`、方法及访问器形式都按普通属性处理。
>
> ```js
> const prototype = {}
> // 使用 "__proto__" 或 __proto__ 指定对象原型
> const withPrototype = { __proto__: prototype }
> // 使用计算属性名 ['__proto__'] 会创建新属性，而非指定原型
> const withProperty = { ['__proto__']: prototype }
>
> console.log(Object.getPrototypeOf(withPrototype) === prototype) // true
> console.log(Object.hasOwn(withPrototype, '__proto__')) // false
>
> console.log(Object.getPrototypeOf(withProperty) === prototype) // false
> console.log(Object.hasOwn(withProperty, '__proto__')) // true
> ```

## 2. 属性描述符{#属性描述符}

属性描述符记录属性保存的数据与元数据。每个实际存在的自有属性都有一份完整描述符。

### 2.1 描述符的两种类型{#描述符的两种类型}

属性描述符分为数据描述符和访问器描述符：

| 类型     | 读取属性时                               | 写入属性时                     |
|--------|-------------------------------------|---------------------------|
| 数据描述符  | 返回属性直接保存的值                          | 由 `writable` 决定写入行为       |
| 访问器描述符 | 调用 getter；没有 getter 时返回 `undefined` | 调用 setter；没有 setter 时写入失败 |

一条属性只能属于其中一种类型。数据描述符直接保存值，访问器描述符通过函数处理读写。

例如，对于对象 `obj`：

```js
const obj = {
  // 数据属性
  name: 'scoreRecord',

  // 访问器属性
  get score() {
    return this._score
  },
  set score(value) {
    return this._score = value
  },

  //访问器的后备字段，实际上也是数据属性
  _score: 100,
}

console.log(Object.getOwnPropertyDescriptor(obj, 'name'))
// {
//   value: 'scoreRecord',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

console.log(Object.getOwnPropertyDescriptor(obj, 'score'))
// {
//   get: [Function: get score],
//   set: [Function: set score],
//   enumerable: true,
//   configurable: true
// }
```

### 2.2 数据描述符{#数据描述符}

数据描述符包含两个专有字段：

| 字段         | 含义                        |
|------------|---------------------------|
| `value`    | 属性保存的值，可以是任意 JavaScript 值 |
| `writable` | 是否允许普通赋值通过这条数据属性完成写入      |

`value` 是对象时，属性保存对象引用；`value` 是函数时，这条属性通常作为方法使用。
直接给持有属性的对象赋值时，`writable: true` 允许替换 `value`，`writable: false` 会阻止属性值改变（当属性是引用类型时，只拒绝引用本身改变）。

例如：

```js
const profile = {}

Object.defineProperty(profile, 'nameList', {
  value: [],
  writable: false,
  configurable: true,
  enumerable: true,
})

console.log(profile) // { nameList: [] }

// writable 为 false 只影响属性本身，不影响指向的对象
profile.nameList.push('Ada')
console.log(profile) // { nameList: [ 'Ada' ] }

// 对 writable 为 false 的属性赋值将被静默忽略 
profile.nameList = []
console.log(profile) // { nameList: [ 'Ada' ] }
```

可写数据属性位于原型上时，给派生对象赋值通常会在派生对象上创建同名自有属性，而不是修改原型属性。

```js
const profile = {
  name: '',
}

const user = {
  __proto__: profile
}
console.log(user.hasOwnProperty("name")) // false
user.name = 'Ada'
console.log(user.hasOwnProperty("name")) // true
```

数据描述符还包含 `enumerable` 和 `configurable`，这两个共享字段在 [第 2.4 节 共享操作标志](#共享操作标志) 统一说明。

### 2.3 访问器描述符{#访问器描述符}

访问器描述符不包含 `value` 和 `writable`，它使用两个专有字段 `get` 与 `set` 定义读写行为。字段值可以是函数或 `undefined`：

| 字段    | 含义                             |
|-------|--------------------------------|
| `get` | getter 函数或 `undefined`；读取属性时调用 |
| `set` | setter 函数或 `undefined`；写入属性时调用 |

getter 存在时，每次读取都会重新调用它并使用其返回值；没有 getter 时，读取结果是 `undefined`。setter 存在时，赋值会把新值交给它；没有
setter 时，赋值失败，并在严格模式下抛出 `TypeError`。

```js
const user = {
  _name: 'Ada',
  get label() {
    return this._name.toUpperCase()
  },
  set label(value) {
    this._name = value.trim()
  },
}

console.log(user.label) // ADA
console.log(Object.getOwnPropertyDescriptor(user, 'label'))
// {
//  get: [Function: get label],
//  set: [Function: set label],
//  enumerable: true,
//  configurable: true
// }
```

访问器描述符同样包含 `enumerable` 和 `configurable`。

### 2.4 共享操作标志{#共享操作标志}

数据描述符和访问器描述符都包含以下两个布尔字段：

| 字段             | 含义                            |
|----------------|-------------------------------|
| `enumerable`   | 特定枚举、复制和序列化操作是否选择该属性；不影响直接访问  |
| `configurable` | 是否允许删除属性、切换描述符类型，以及修改大部分描述符字段 |

`enumerable` 将会影响属性枚举、复制和序列化操作：

```js
const profile = {}

// 可枚举属性 name
Object.defineProperty(profile, 'name', {
  value: "Ada",
  enumerable: true,
  writable: true,
  configurable: true,

})
// 不可枚举属性 nickname
Object.defineProperty(profile, 'nickname', {
  value: "Bob",
  enumerable: false,
  writable: true,
  configurable: true,
})

// 不可枚举属性不会被 for...in... 枚举
for (const key in profile) {
  console.log(`profile.${key} = ${profile[key]}`) // profile.name = Ada
}

// 不可枚举属性不会被打印或序列化
console.log(profile) // { name: 'Ada' }
console.log(JSON.stringify(profile)) // {"name":"Ada"}

// 不可枚举属性不会 Object.keys 枚举
console.log(Object.keys(profile))// [ 'name' ]
```

> 值得注意的是，`for...in...`、`Object.keys` 等枚举方法并不只受属性的 `enumerable`
> 影响，参见 [属性的可枚举性](#属性的可枚举性)

`configurable: false` 不表示属性完全不能变化，但会禁止以下操作：

- 把 `configurable` 从 `false` 改回 `true`；
- 改变 `enumerable`；
- 删除属性；
- 在数据属性与访问器属性之间转换

> 不可配置的数据属性允许在 `writable: true` 时修改 `value`。
>
> 不可配置的数据属性允许将 `writable` 由 `true` 改为 `false`，但不允许将其由 `false` 改为 `true`。
>
> 不可配置的访问器属性仍允许调用 getter 或 setter，但不允许替换 getter 或 setter。

### 2.5 属性描述符 API{#属性描述符API}

`Object` 提供读取和定义属性描述符的方法：

| 目的        | API                                     |
|-----------|-----------------------------------------|
| 读取一个自有属性  | `Object.getOwnPropertyDescriptor()`     |
| 读取全部自有属性  | `Object.getOwnPropertyDescriptors()`    |
| 定义一个属性    | `Object.defineProperty()`               |
| 定义多个属性    | `Object.defineProperties()`             |
| 创建对象并定义属性 | `Object.create(prototype, descriptors)` |

以上所有方法均只访问对象的自有属性，它们都不会沿原型链查询或修改继承属性。

#### 2.5.1 getOwnPropertyDescriptor{#getOwnPropertyDescriptor}

`Object.getOwnPropertyDescriptor(object, key)` 读取 `object` 上键为 `key` 的自有属性描述符。`key` 可以是字符串或
`Symbol`；属性不存在时返回 `undefined`。

```js
const record = {
  _reads: 0,
  name: 'Ada',
  get label() {
    this._reads += 1
    return this.name
  },
}
const nameDescriptor = Object.getOwnPropertyDescriptor(record, 'name')
const labelDescriptor = Object.getOwnPropertyDescriptor(record, 'label')
const missingDescriptor = Object.getOwnPropertyDescriptor(record, 'missing')

console.log(nameDescriptor)
// {
//  value: 'Ada',
//  writable: true,
//  enumerable: true,
//  configurable: true
// }
console.log(labelDescriptor)
// {
//  get: [Function: get label],
//  set: undefined,
//  enumerable: true,
//  configurable: true
// }

console.log(missingDescriptor) // undefined
console.log(labelDescriptor.get.call(record)) // Ada
```

返回的描述符是普通对象快照。修改这个对象不会修改原属性；其中的对象值、getter 和 setter 函数仍与原属性引用相同的对象或函数。

#### 2.5.2 defineProperty{#defineProperty}

`Object.defineProperty(object, key, descriptor)` 在 `object` 上新建或更新一个自有属性，并返回原对象。它直接定义属性，不会像普通赋值那样调用原型上的同名
setter。

```js
const record = {}

const returned = Object.defineProperty(record, 'count', {
  value: 1,
  writable: true,
  enumerable: true,
  configurable: true,
})

record.count = 2

console.log(returned === record) // true
console.log(record.count) // 2
```

传入的描述符可以省略字段，但不能同时包含数据描述符的专有字段与访问器描述符的专有字段。字段混用或修改方式违反现有描述符约束时，方法会抛出
`TypeError`：

```js
const record = {}

try {
  Object.defineProperty(record, 'invalid', {
    value: 1,
    get: function() {
      return 1
    },
  })
} catch (error) {
  console.log(error instanceof TypeError) // true
}
```

#### 2.5.3 批量描述符 API{#批量描述符API}

`Object.getOwnPropertyDescriptors(object)` 返回对象的全部自有属性描述符，包含字符串键、`Symbol` 键和不可枚举属性。

```js
const profile = {
  name: 'Ada',
  reads: 1,
}

const descriptors = Object.getOwnPropertyDescriptors(profile)
console.log(descriptors)
// {
//  name: {
//      value: 'Ada',
//      writable: true,
//      enumerable: true,
//      configurable: true
//  },
//  reads: { value: 1, writable: true, enumerable: true, configurable: true }
// }
```

`Object.defineProperties(object, descriptors)` 使用描述符映射一次定义多个属性。

```js
const source = {}

Object.defineProperties(source, {
  _reads: {
    value: 0,
    writable: true,
    enumerable: false,
    configurable: false,
  },
  read: {
    get() {
      return this._reads
    },
    set(value) {
      _reads += 1
    },
    enumerable: true,
    configurable: false,
  },
})

console.log(source) // { read: [Getter/Setter] }
```

### 2.6 创建方式与默认值{#创建方式与默认值}

属性主要来自三类创建方式

| 创建来源       | 一般形式                                              |
|------------|---------------------------------------------------|
| 对象字面量与普通赋值 | `const obj = { name: value }`、`obj.name = value`  | 
| 类成员        | `class` 中的 `name = value`、` #name = value` 以及方法等  |
| 属性描述符 API  | `Object.defineProperty`、`Object.defineProperties` |

#### 2.6.1 对象字面量与赋值{#对象字面量与赋值}

对象字面量中的数据属性和方法默认 `writable: true`、`enumerable: true`、`configurable: true`。访问器默认 `enumerable: true`、
`configurable: true`。

在普通可扩展对象上通过赋值成功新增数据属性时，三个布尔字段也都是 `true`：

```js
const record = {
  _value: 1,
  get doubled() {
    return this._value * 2
  },
}

record.reads = 0
const readsDescriptor = Object.getOwnPropertyDescriptor(record, 'reads')
const doubledDescriptor = Object.getOwnPropertyDescriptor(record, 'doubled')

console.log(readsDescriptor)
// {
//  value: 0,
//  writable: true,
//  enumerable: true,
//  configurable: true
// }
console.log(doubledDescriptor)
// {
//  get: [Function: get doubled],
//  set: undefined,
//  enumerable: true,
//  configurable: true
// }
```

#### 2.6.2 类字段与类方法{#类字段与类方法}

类成员所在的对象及其默认描述符如下：

| 成员类型   | 所在对象           | 描述符类型  | `writable` | `enumerable` | `configurable` |
|--------|----------------|--------|------------|--------------|----------------|
| 公开实例字段 | 实例对象           | 数据描述符  | `true`     | `true`       | `true`         |
| 公开静态字段 | 类对象            | 数据描述符  | `true`     | `true`       | `true`         |
| 实例方法   | 类的 `prototype` | 数据描述符  | `true`     | `false`      | `true`         |
| 静态方法   | 类对象            | 数据描述符  | `true`     | `false`      | `true`         |
| 实例访问器  | 类的 `prototype` | 访问器描述符 | —          | `false`      | `true`         |
| 静态访问器  | 类对象            | 访问器描述符 | —          | `false`      | `true`         |

```js
// 类定义包含公开字段、方法和访问器
class Example {
  field = 1
  static count = 0

  method() {
    return this.field
  }

  get doubled() {
    return this.field * 2
  }
}

// 创建实例以检查实例字段
const instance = new Example()

// 分别读取实例、原型和类对象上的描述符
const fieldDescriptor = Object.getOwnPropertyDescriptor(instance, 'field')
const methodDescriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'method')
const accessorDescriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'doubled')
const staticFieldDescriptor = Object.getOwnPropertyDescriptor(Example, 'count')

console.log(fieldDescriptor)
// {
//  value: 1,
//  writable: true,
//  enumerable: true,
//  configurable: true
// }

console.log(methodDescriptor)
// {
//  value: [Function: method],
//  writable: true,
//  enumerable: false,
//  configurable: true
// }

console.log(accessorDescriptor)
// {
//  get: [Function: get doubled],
//  set: undefined,
//  enumerable: false,
//  configurable: true
// }

console.log(staticFieldDescriptor)
// {
//  value: 0,
//  writable: true,
//  enumerable: true,
//  configurable: true
// }
```

公开类字段使用字段定义语义，不会调用原型上的同名 setter。[JavaScript 原型与类型](./ts-review-01-prototype.md)
已经介绍了类成员所在的对象层级。

#### 2.6.3 通过属性描述符创建属性{#通过属性描述符创建属性}

通过 `Object.defineProperty()`、`Object.defineProperties()` 或 `Object.create()` 的描述符参数新建属性时，省略字段采用以下默认值：

| 字段             | 适用类型      | 默认值         |
|----------------|-----------|-------------|
| `value`        | 数据描述符     | `undefined` |
| `writable`     | 数据描述符     | `false`     |
| `get`          | 访问器描述符    | `undefined` |
| `set`          | 访问器描述符    | `undefined` |
| `enumerable`   | 数据/访问器描述符 | `false`     |
| `configurable` | 数据/访问器描述符 | `false`     |

与此同时，重新定义已有的同类属性时，省略的字段保留原状态：

```js
const record = {
  existing: 1,
}

Object.defineProperty(record, 'existing', {
  value: 2,
})

Object.defineProperty(record, 'created', {
  value: 3,
})

const existingDescriptor = Object.getOwnPropertyDescriptor(record, 'existing')
const createdDescriptor = Object.getOwnPropertyDescriptor(record, 'created')

console.log(existingDescriptor)
// { 
//  value: 2, 
//  writable: true, 
//  enumerable: true, 
//  configurable: true 
// }

console.log(createdDescriptor)
// { 
//  value: 3, 
//  writable: false, 
//  enumerable: false, 
//  configurable: false
// }
```

## 3. 属性的可枚举性{#属性的可枚举性}

数据属性与访问器属性是按描述符结构进行的分类。枚举接口还会从三个互相独立的维度选择属性：键是字符串还是 `Symbol`
，属性是对象自有还是从原型继承，以及属性是否可枚举。

| 维度  | 分类                | 决定的行为                   |
|-----|-------------------|-------------------------|
| 键类型 | 字符串键 / `Symbol` 键 | 属性的访问方式，以及枚举接口是否会包含该键   |
| 所有权 | 自有属性 / 继承属性       | 属性存放在当前对象还是原型链中的其他对象上   |
| 可枚举 | 可枚举属性 / 不可枚举属性    | 部分枚举、复制与默认序列化操作是否会选择该属性 |

这三个维度不能互相推导，彼此之间保持相互独立。

下面的 `object` 包含分属六个组合的属性，后文使用它们比较各个接口的选择范围：

```js
const inheritedSymbol = Symbol('inherited')
const ownSymbol = Symbol('own')

const prototype = {
  inheritedVisible: 'prototype',
  [inheritedSymbol]: 'prototype symbol',
}

Object.defineProperty(prototype, 'inheritedHidden', {
  value: 'prototype hidden',
  enumerable: false,
})

const obj = Object.create(prototype)
obj.ownVisible = 'object'
obj[ownSymbol] = 'object symbol'

Object.defineProperty(obj, 'ownHidden', {
  value: 'object hidden',
  enumerable: false,
})
```

相对于 `obj`，各属性的分类如下：

| 属性                 | 键类型      | 所有权 | `enumerable` |
|--------------------|----------|-----|--------------|
| `ownVisible`       | 字符串      | 自有  | 是            |
| `ownHidden`        | 字符串      | 自有  | 否            |
| `ownSymbol`        | `Symbol` | 自有  | 是            |
| `inheritedVisible` | 字符串      | 继承  | 是            |
| `inheritedHidden`  | 字符串      | 继承  | 否            |
| `inheritedSymbol`  | `Symbol` | 继承  | 是            |

### 3.1 自有属性与继承属性{#自有属性与继承属性}

所有权是属性相对于当前对象的位置关系。属性直接存放在对象上时是自有属性；属性存放在原型链的其他对象上时，对当前对象而言是继承属性。

继承属性是原型对象的自有属性。例如，`inheritedHidden` 的描述符存放在 `prototype` 上，没有复制到 `object`
。要读取这份描述符，应查询真正持有属性的 `prototype`。

```js
const prototype = {
  name: 'proto',
}

const obj = Object.create(prototype)
console.log(Object.getOwnPropertyDescriptor(obj, 'name')) // undefined
console.log(Object.getOwnPropertyDescriptor(prototype, 'name'))
// {
//  value: 'proto',
//  writable: true,
//  enumerable: true,
//  configurable: true
// }
```

`key in object` 沿原型链检查属性是否存在，`Object.hasOwn(object, key)` 只检查对象的自有属性。并且都不受 `enumerable`
影响，都支持字符串与 `Symbol` 键。

```js
const prototype = {
  name: 'proto',
}

const obj = Object.create(prototype)

console.log(Object.hasOwn(obj, 'name')) // false
console.log(Object.hasOwn(prototype, 'name')) // true

console.log('name' in obj) // true
console.log('name' in prototype) // true
```

### 3.2 可枚举属性与不可枚举属性{#可枚举属性与不可枚举属性}

可枚举性来自属性描述符中的 `enumerable` 标志。影响特定的枚举、复制和序列化接口。

`Object.prototype.propertyIsEnumerable()` 只在属性既是对象的自有属性又可枚举时返回 `true`。它同样支持字符串和 `Symbol`
键。通用代码通过 `call()` 调用该方法，可以避开对象没有原型或覆盖同名属性的情况：

```js
const prototype = {
  name: 'proto',
}

const obj = Object.create(prototype)

console.log(Object.hasOwn(obj, 'name')) // false
console.log(Object.hasOwn(prototype, 'name')) // true

console.log('name' in obj) // true
console.log('name' in prototype) // true
```

## 4. 属性枚举{#属性枚举}

JavaScript 没有一个默认包含所有类别属性的“通用枚举”接口。每个接口都对键类型、所有权与可枚举性作出固定选择。

### 4.1 枚举接口{#枚举接口}

常用属性枚举接口的选择范围如下：

| 接口                                   | 键类型             | 所有权   | `enumerable`     |
|--------------------------------------|-----------------|-------|------------------|
| `Object.keys()`                      | 字符串键            | 自有    | `true`           |
| `Object.values()`                    | 字符串键            | 自有    | `true`           |
| `Object.entries()`                   | 字符串键            | 自有    | `true`           |
| `Object.getOwnPropertyNames()`       | 字符串键            | 自有    | `true` / `false` |
| `Object.getOwnPropertySymbols()`     | `Symbol` 键      | 自有    | `true` / `false` |
| `Reflect.ownKeys()`                  | 字符串键、`Symbol` 键 | 自有    | `true` / `false` |
| `Object.getOwnPropertyDescriptors()` | 字符串键、`Symbol` 键 | 自有    | `true` / `false` |
| `for...in`                           | 字符串键            | 自有、继承 | `true`           |

`true` / `false` 表示接口不按 `enumerable` 过滤，同时包含可枚举属性与不可枚举属性。

`Reflect.ownKeys()` 是获取单个对象全部自有键的直接接口。它仍然不会沿原型链查找；需要检查原型时，应显式调用
`Object.getPrototypeOf()` 并逐层处理。

#### 4.1.1 for...in{#for-in}

`for...in` 依次产生对象及其原型链上可枚举的字符串键。它不包含不可枚举属性，也不会包含任何 `Symbol` 键。

沿用第 3 节的 `obj`：

```js
for (const key in obj) {
  console.log(key)
}

// ownVisible
// inheritedVisible
```

当对象及其原型链上的各层都是普通对象，并且遍历期间结构不变时，`for...in`
先处理对象自身，再逐层处理原型；每一层内部遵循该层的字符串键顺序。同名键最多产生一次，离对象最近的属性占据这个键名。

> `for...in` 枚举属性键；`for...of` 不按键类型、所有权或 `enumerable` 选择属性，而是调用对象的
> `Symbol.iterator`，依次取得迭代器产生的值。普通对象默认不可迭代，直接对其使用 `for...of` 会抛出 `TypeError`。

遍历过程中新增或删除属性、修改原型或改变可枚举性会使结果难以推断。只需稳定处理当前对象的自有键时，可以按所需属性类别通过
`Object.keys()` 或 `Reflect.ownKeys()` 取得键数组，再处理该数组。这个快照不包含继承键，也不会冻结后续读取到的属性值。

### 4.2 属性键顺序{#属性键顺序}

普通对象的自有键顺序分为三组：

1. 数组索引字符串按数值升序排列。
2. 其他字符串键按创建顺序排列。
3. `Symbol` 键按创建顺序排列。

```js
const marker = Symbol('marker')
const object = {}

object.beta = 'B'
object[10] = 'ten'
object[2] = 'two'
object.alpha = 'A'
object[marker] = 'symbol'

console.log(Reflect.ownKeys(object))
// ['2', '10', 'beta', 'alpha', Symbol(marker)]
```

数组索引字符串的范围是 `"0"` 至 `"4294967294"`。`"01"`、`"-0"`、`"1.0"` 和 `"4294967295"` 都属于普通字符串键，按创建顺序排列。

重新给已有属性赋值不会改变它的位置。删除普通字符串键或 `Symbol` 键后重新创建，会把它放到所属分组的末尾。

### 4.3 键枚举与值读取{#键枚举与值读取}

`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()` 和 `Reflect.ownKeys()` 只收集键，不会对属性执行普通读取。
`也就是说，访问器属性的 getter 不会执行。

`Object.values()` 与 `Object.entries()` 会读取属性值，因此可能执行 getter。第 6 节中的 `Object.assign()`、对象展开和
`JSON.stringify()` 也会读取选中的属性值。

```js
let reads = 0
const source = {
  get total() {
    reads += 1
    return 3
  },
}

Object.keys(source)
Reflect.ownKeys(source)
Object.getOwnPropertyDescriptors(source)
console.log(reads) // 0

Object.values(source)
console.log(reads) // 1

Object.entries(source)
console.log(reads) // 2
```

## 5. 原型链枚举{#原型链枚举}

大部分属性枚举接口只处理自有属性。`for...in` 是常用接口中会沿原型链枚举的一项，它的选择范围也因此更容易被误用。

### 5.1 属性遮蔽{#属性遮蔽}

近层的不可枚举属性也会遮蔽原型上的同名可枚举属性。下面的 `child.status` 命中自有属性，但 `for...in` 不产生 `status`
，也不会继续产生原型上的同名键：

```js
const parent = {
  status: 'parent',
}

const child = Object.create(parent)

Object.defineProperty(child, 'status', {
  value: 'child',
  enumerable: false,
})

console.log(child.status) // child

for (const key in child) {
  console.log(key) // 不会执行
}
```

## 6. 属性复制与序列化{#属性复制与序列化}

属性复制与序列化同样建立在属性选择规则之上。对象展开、`Object.assign()` 和 `JSON.stringify()` 的选择范围并不等同于对象的全部状态。

### 6.1 Object.assign 与对象展开{#Object-assign与对象展开}

`Object.assign(target, ...sources)` 与对象展开 `{ ...source }` 都读取来源对象中可枚举的自有属性，并且同时包含字符串键和
`Symbol` 键。二者都是浅层值复制，不复制继承属性、不可枚举属性、原型或原始属性描述符。

```js
const secret = Symbol('secret')
const nested = { count: 1 }
const source = {}

Object.defineProperties(source, {
  visible: {
    value: nested,
    enumerable: true,
  },
  hidden: {
    value: 2,
    enumerable: false,
  },
  [secret]: {
    value: 3,
    enumerable: true,
  },
})

const assigned = Object.assign({}, source)
const spread = { ...source }

console.log(Reflect.ownKeys(assigned)) // ['visible', Symbol(secret)]
console.log(Reflect.ownKeys(spread)) // ['visible', Symbol(secret)]
console.log(spread.visible === nested) // true
```

复制时会读取来源属性的当前值，所以来源对象的 getter 会执行，但 getter 和 setter 本身不会作为描述符复制。
对象展开会创建普通数据属性；`Object.assign()` 只有在目标没有同名属性时才会创建数据属性，目标上已有 setter
或同名属性时，会执行对应的写入语义。

因此：

- `Object.assign()` 修改传入的目标对象，并通过普通赋值写入，因此可能触发目标对象或其原型上的 setter。
- 对象展开在新对象上创建自有数据属性，不会触发这个新对象原型上的同名 setter。
- 二者都会读取来源属性的当前值，因此 getter 会执行，且访问器本身被视为数据属性复制。

对象展开与 `Object.assign()` 的来源选择相近，但两者不能在所有情况下互换。

两者按每个来源对象的自有键顺序处理属性；存在多个来源时按参数或展开表达式从左到右处理，后面的值会覆盖前面的同名值。

### 6.2 保留属性描述符的复制{#保留属性描述符的复制}

复制属性描述符时，应先取得来源对象的全部自有描述符，再通过 `Object.defineProperties()` 定义目标属性：

```js
const clone = Object.create(
  Object.getPrototypeOf(source),
  Object.getOwnPropertyDescriptors(source),
)
```

这段代码保留来源对象的直接原型，并浅复制自有属性值；内置对象的内部槽、类的私有字段等状态不能通过属性描述符通用复制。

只需把描述符添加到已有对象时，可以使用：

```js
Object.defineProperties(
  target,
  Object.getOwnPropertyDescriptors(source),
)
```

### 6.3 JSON.stringify{#JSON-stringify}

默认序列化普通对象时，`JSON.stringify()` 只选择可枚举的自有字符串属性。不可枚举属性、继承属性与所有 `Symbol` 键都会被忽略，键顺序与
`Object.keys()` 一致。

```js
const marker = Symbol('marker')
const prototype = {
  inherited: 1,
}
const record = Object.create(prototype)

record.visible = 2
record[marker] = 3

Object.defineProperty(record, 'hidden', {
  value: 4,
  enumerable: false,
})

console.log(JSON.stringify(record)) // {"visible":2}
```

序列化会读取选中属性的值，因此可能执行 getter。

普通对象中值为 `undefined`、函数或 `Symbol` 的属性会被省略；数组对应位置会写成 `null`。这些规则使
`JSON.stringify()` 适合生成 JSON 数据，但不适合作为完整复制对象状态的方式。

## 7. 小结{#小结}

| 接口                                                        | 键类型             | 所有权   | `enumerable`     |
|-----------------------------------------------------------|-----------------|-------|------------------|
| `key in object`                                           | 字符串键、`Symbol` 键 | 自有、继承 | `true` / `false` |
| `Object.hasOwn(object, key)`                              | 字符串键、`Symbol` 键 | 自有    | `true` / `false` |
| `Object.prototype.propertyIsEnumerable.call(object, key)` | 字符串键、`Symbol` 键 | 自有    | `true`           |
| `Object.keys()`                                           | 字符串键            | 自有    | `true`           |
| `Object.values()`                                         | 字符串键            | 自有    | `true`           |
| `Object.entries()`                                        | 字符串键            | 自有    | `true`           |
| `Object.getOwnPropertyNames()`                            | 字符串键            | 自有    | `true` / `false` |
| `Object.getOwnPropertySymbols()`                          | `Symbol` 键      | 自有    | `true` / `false` |
| `Reflect.ownKeys()`                                       | 字符串键、`Symbol` 键 | 自有    | `true` / `false` |
| `Object.getOwnPropertyDescriptors()`                      | 字符串键、`Symbol` 键 | 自有    | `true` / `false` |
| `for...in`                                                | 字符串键            | 自有、继承 | `true`           |

