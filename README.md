# 力盘搜 - Lipanso
基于「大力盘API」的网盘搜索服务

## 原理说明

搜索API：
```
https://fc-resource-node-api.pbox.cloud/api/v1/pan/search?resType={搜索源}&version=v2&kw={搜索关键字}&page={搜索页数}&searchType={搜索方式}&category={文件类型}&minSize={文件最小大小}&maxSize={文件最大大小}
```

详细可以见index.js

## 关于获取网盘链接
要获取网盘链接，必须要传递t(时间)和id，并在headers处添加自己的TOKEN
```
headers: {
    "X-Authorization": TOKEN
}
```

其中t可以通过```(new Date).getTime()```来获得
