- title: 8. TypeScript 类型
  slug: TypeScript类型
- title: 8.1 实例类型
  slug: 实例类型
  level: 1
- title: 8.2 构造函数类型
  slug: 构造函数类型
  level: 1

## 8. TypeScript 类型{#TypeScript类型}

TypeScript 的类型信息不会改变 JavaScript 的原型链。接口在编译后不存在，也不能作为 `instanceof` 的右侧值。

### 8.1 实例类型{#实例类型}

TypeScript 中的类声明同时创建运行时值和静态类型。类名出现在类型位置时，表示实例侧结构。

```ts
class User {
  constructor(public name: string) {
  }

  greet(): string {
    return `Hello, ${this.name}`;
  }
}

const user: User = new User("Ada");
console.log(user.greet()); // Hello, Ada

type UserInstance = InstanceType<typeof User>;
const sameUser: UserInstance = user;
console.log(sameUser.name); // Ada
```

实例类型采用结构化检查。公开成员兼容时，普通对象也可以赋给对应接口或类的实例类型；私有成员和受保护成员会收紧这种兼容关系。

```typescript
interface Named {
  name: string;

  greet(): string;
}

const named: Named = {
  name: 'Grace',
  greet() {
    return `Hello, ${this.name}`
  },
}

console.log(named.greet()) // Hello, Grace
```

静态类型兼容不会修改运行时原型链，因此 `named instanceof User` 仍为 `false`。

### 8.2 构造函数类型{#构造函数类型}

类名出现在值位置时指向类对象。`typeof User` 获取该值的类型，其中包含构造签名和静态成员。

```ts
class User {
  static kind = "user";

  constructor(public name: string) {
  }
}

const UserConstructor: typeof User = User;

console.log(UserConstructor.kind); // user
console.log(new UserConstructor("Ada").name); // Ada
```

接受“某个可通过 `new` 调用的值”时，应声明构造签名：

```ts
type Constructor<Instance, Args extends unknown[]> =
  new (...args: Args) => Instance;

function create<Instance, Args extends unknown[]>(
  ConstructorValue: Constructor<Instance, Args>,
  ...args: Args
): Instance {
  return new ConstructorValue(...args);
}

class User {
  constructor(public name: string) {
  }
}

const user = create(User, "Ada");
console.log(user.name); // Ada

type UserArgs = ConstructorParameters<typeof User>; // [name: string]
type UserObject = InstanceType<typeof User>; // User
```

| 写法                                   | 表示内容          |
|--------------------------------------|---------------|
| `User`                               | 实例侧类型         |
| `typeof User`                        | 类对象及静态成员的类型   |
| `InstanceType<typeof User>`          | 从构造函数类型提取实例类型 |
| `ConstructorParameters<typeof User>` | 从构造函数类型提取参数元组 |
