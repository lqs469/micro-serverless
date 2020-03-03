# micro-serverless

A micro serverless service ([FaaS](https://en.wikipedia.org/wiki/Function_as_a_service)). Based on Node.js `vm`.

It provides a micro FaaS service allowing you to run, develop and manage application functionalities immediately without the complexity of building and deploying the infrastructure typically framework. Just upload your code and `micro-serverless` runs it for you. You can set up your code to automatically trigger from personal service or call it directly.

[中文 Readme](./README.zh-CN.md)

## Motivation

I wanted to build some simple personal assistant programs like weather tips, news feed or reminding me not to miss the game. And it's unnecessary to build several huge apps use Spring or complexity framework. a serverless service is proper I thought. So I made an uncomplicated and flexible serverless application with just-enough features.

## Quick Start

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

## Example

You can find them in `/src/fns/`. your code should have an only function `main()`, this function will be trigger when request GET `/vm/[filename]`, and the service response what you return in function `main()`.

#### 1. basic example

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

Function execution time is limited in 1.5s default or will throw the error. the Error response is a `JSON` with `error`.

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

#### 3. Async function

You can run an asynchronous function by `anyc` and `await`. And use `ctx.curl` (Shortcut for the `httpclient.curl`) if you want to fetch anything. the `ctx` is passed by `egg.js`, you can find more `API` in [egg.js context](https://eggjs.org/api/Context.html). Learn more about [egg.js](https://eggjs.org/en/index.html) or [koa.js](https://koajs.com/).

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

#### 4. Build a **Github Trending** service

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

#### 5. Build a realtime **Hacker news** service

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

#### 6. Check the **weather** by location.

You can run a function with `parameters`. In this case, Getting the data of weather according to a location by passed `query` in URL (`//127.0.0.1:7001/vm/weather?location=Tokyo`)

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

## FAQ

**What can this project be used for ?**

It‘s convenient to run some personal services, like checking the weather, finding the latest news and to-do list reminding, You can build yourself services on it easily and rapidly without concerning about infrastructure application, just need a function.

**Can this project be used for production ?**

I don't recommend you do this for two reasons: first is security, although `vm` guarantees a secure sandbox, it still exists risk, If you want to learn more about it, check the document [`vm` API](https://nodejs.org/api/vm.html). for another, this micro serverless program hardly automatically scales with the size of the workload due to it was designed to run a simple personal assistant service on a personal device, So I didn't consider too much about the performance (In fact, the framework egg.js has done it a lot about performance and it "born to build enterprise apps", But I don't know exactly how the performance of `vm`, This requires more experiments to prove).

## License

MIT License (MIT)
