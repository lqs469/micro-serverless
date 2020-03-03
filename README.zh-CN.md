# micro-serverless

基于 Node.js `vm` 实现一款个人 serverless 服务。

使用 MidwayTS 搭建。跟其他大型 FaaS 服务一样，你可以在上面运行、开发和管理你的 serverless 函数，而无需考虑构建和部署基础结构，也不用写任何框架相关的代码，只专注于业务。

## Quick Start

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

## Example

你可以在 `/src/fns/` 下找到所有例子。每个函数都使用 `main()` 作为统一的入口，当你请求接口 `/vm/[functionName]` 时，会触发对应函数中的 `main()` 方法，同时接口将返回 `main()` 中 `return` 的内容。

#### 1. Hello world

```js
// function_a
async function main() {
  return 'Hello world!';
}
```

GET `//127.0.0.1:7001/vm/function_a`

```
Hello world
```

#### 2. overtime

函数默认请求超时时间为 1.5s，如果超时，系统会自动抛出异常中止请求，而服务并不会受到影响。

```js
// function_b
function main(ctx) {
  while (1) {}

  return 'Hello world!!';
}
```

GET `//127.0.0.1:7001/vm/function_b`

```JSON
{
  "error": "Error: Script execution timed out after 1500ms at Script..."
}
```

#### 3. 异步请求

`main` 函数可以是一个异步函数，通过使用 `anyc` 和 `await` 实现。在函数中会暴露一个全局变量 `ctx`，这个全局变量就是 `egg.js` 中的`ctx`，通过它你就可以和平时一样调用 `egg.js` 提供的方法来快速实现逻辑了，比如下面例子中的 `ctx.curl`。更多文档可以查看[egg.js context](https://eggjs.org/api/Context.html)，[egg.js](https://eggjs.org/en/index.html)，[koa.js](https://koajs.com/).

Fetch an URL:

```js
// function_c
async function main() {
  const { location } = ctx.query;

  const URL = `https://bing.com`;
  const data = await ctx.curl(URL, {
    dataType: 'json',
  });

  return { data } || {};
}
```

Sleep 1s:

```js
// function_d
async function main() {
  const start = new Date().toLocaleTimeString();

  const end = await new Promise(resolve => {
    setTimeout(() => {
      resolve(new Date().toLocaleTimeString());
    }, 1000 * 1);
  });

  return {
    start,
    end,
  };
}
```

#### 4. 做一个 **Github 趋势** 服务

```js
// github_trending
async function main() {
  const url = 'https://github-trending-api.now.sh/repositories';

  const res = await ctx.curl(
    'https://github-trending-api.now.sh/repositories',
    { dataType: 'json' },
  );

  return res.data.map(item => ({
    title: `${item.name} | 👨‍💻${item.author} | ⭐️${item.stars} | ${item.language}`,
    url: item.url,
    desc: item.description,
  }));
}
```

GET `//127.0.0.1:7001/vm/github_trending`

```JSON
[
  {
    "title": "...",
    "url": "...",
    "desc": "..."
  },
  ...
]
```

#### 5. 做一个实时 **Hacker news** 服务

```js
async function main() {
  const tops =
    (await ctx.curl(
      'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty',
      {
        dataType: 'json',
      },
    )) || [];

  let hnList = [];

  await Promise.all(
    tops.data
      .slice(0, 10)
      .map(item =>
        ctx.curl(
          `https://hacker-news.firebaseio.com/v0/item/${item}.json?print=pretty`,
          { dataType: 'json' },
        ),
      ),
  ).then(data => {
    hnList = data.map(item => ({
      title: item.data.title,
      url:
        item.data.url || `https://news.ycombinator.com/item?id=${item.data.id}`,
      info:
        `${item.data.score} points By ${item.data.by}` +
        `${new Date(item.data.time * 1000).toLocaleString()} | ` +
        `${item.data.descendants} comments`,
    }));
  });

  return hnList;
}
```

#### 6. 通过地理位置查询今日天气

你可以给函数加入参数，方法时通过请求 URL 的 query，然后在函数中通过 `ctx.query` 取到。比下面的例子可以请求：`//127.0.0.1:7001/vm/weather?location=Tokyo`。

```js
// weather.js

async function main() {
  const { location = 'New York' } = ctx.query;
  const url = `http://api.weatherstack.com/current?access_key=95f5ee664befefc1c49fa0dac0da19c7&query=${location}`;

  const res = await ctx.curl(url, { dataType: 'json' });

  return res.data;
}
```

GET `//127.0.0.1:7001/vm/weather?location=Tokyo`

## 动机

我想搭建一些简单的个人助理服务，例如天气提示，新闻推送或单纯提醒我不要错过比赛直播。 而这些小需求并没有必要用完整的框架来搭建几个复杂完整的应用程序来解决。 而 serverless 显然很合适。 所以，我做了这个能满足我需求且简易，灵活的 serverless 服务。

## FAQ

**这个应用能用来干嘛 ?**

它用来运行一些个人服务会非常方便，例如查看天气，推送最新新闻和待办事项提醒。您可以轻松，迅速地在上面建立好自己的服务，而无需考虑基础结构应用程序，只需要一个函数即可。

**该项目可以用于生产吗?**

我并不建议您这样做，有两个原因：首先是安全性，尽管 `vm` 保证了安全的沙箱，但仍然存在风险。如果您想了解更多有关信息，请查看 API 文档[`vm`](https ：//nodejs.org/api/vm.html)。 另一个原因是，使用 `vm` 来搭建 serverless 服务的初衷是在个人设备上运行简单的小型服务，它几乎无法自动根据工作负载的大小进行扩展，而这整是大型 serverless 服务必备的。因此，我对性能没有考虑太多（实际上，框架 egg.js 在性能方面做了很多工作，并且天生就是“为构建企业应用程序”而设计，但是我并不知道 `vm` 的性能究竟如何，这需要更多的实验来证明）。

## License

MIT License (MIT)
