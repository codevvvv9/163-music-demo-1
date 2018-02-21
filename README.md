# 仿网易云音乐
> 首先是云音乐的需求分析以及基本环境的搭建，主要是LeanCloud和七牛的使用。

## 需求分析

先根据[网易云音乐](https://music.163.com/m/)移动端去分析需求，看看有哪些能做的

### 做啥

![用例图](http://p3tha6q4v.bkt.clouddn.com/18-2-20/82573501.jpg)

目前初步分析的需求如上图所示，主要针对两个角色（普通用户和管理员）。

### 用啥

在学习阶段主要是学会核心概念、流程、代码，能用原生JS做就用原生JS做，少用库去做事。

可是到了做项目的时候项目（建立在已经学会了基本的概念与敲了足够的代码量之后），应该采取不同的策略去完成项目，例如选择合适的库、看文档、写demo、copy大神成功的代码。

所以本项目采用了成熟的jQuery以及LeanCloud、七牛作为后台的数据库。

![架构图](http://p3tha6q4v.bkt.clouddn.com/18-2-20/69890088.jpg)

##  LeanCloud

一个简单的数据库(比MySQL都简单，主要是更加形象，能与项目迅速的结合并给我很多正反馈)。

### 安装

直接去看[文档](https://leancloud.cn/docs/sdk_setup-js.html#hash1620893804)

```javascript
//存储服务（包括推送和统计）
cd 项目目录
npm install leancloud-storage --save
// 2. 在html里引入av.min.js
<script src="../node_modules/leancloud-storage/dist/av-min.js"></script>
```

### 初始化AV对象

我们使用LeanCloud主要是用的这个AV对象

```JavaScript
var APP_ID = '0ISMRGDfPWtQcP8WktXGADsl-gzGzoHsz'; //与项目相关
var APP_KEY = 'FKV4IYQNPyB6C5jFBv8vJ7LT'; //与项目相关

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
```

写完上述代码可以简单的测试一下是否成功，最简单的就是直接打印`console.log(window.AV)`

官方推荐如下

```javascript
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  words: 'Hello World!'
}).then(function(object) {
  alert('LeanCloud Rocks!'); //成功后将在屏幕上弹出这句话	
})
```

此时会发现LeanCloud的项目应用下多一个表`TestObject`,表里面有一个字段是`words`，值是`Hello World!`

所以可以推测出这个就是LeanCloud提供给我们生成数据库表以及字段的代码，所以我实际中可以如下使用

```javascript
 //创建数据库，只是本地而已
 var TestObject = AV.Object.extend('Playlist'); 
 //创建一条记录
 var testObject = new TestObject(); 
 //保存记录，LeanCloud端
 testObject.save({ 
   name: 'test',
   cover: 'test',
   creatorId: 'test',
   description: 'test',
   songs: ['1', '2']
 }).then(function(object) { 
 	alert('LeanCloud Rocks!'); 
 }, () => {
 	alert('failed')
 })
```

效果如下图所示

![LeanCloud的变化](http://p3tha6q4v.bkt.clouddn.com/18-2-20/57467194.jpg)

通过上图可以简单的看出LeanCloud可以存储字符串以及数组。

`ACL`: Access Control Layer

像MP3等文件只能借助下面的七牛去存储了

## 七牛

这是一个使用云存储的信赖度极高的工具。

毫无疑问的，先要看[文档](https://developer.qiniu.com/kodo/sdk/1283/javascript)安装

### 安装

目前有1.X和2.X版本，可以预料到版本的问题有可能会产生bug.

```javascript
npm install qiniu-js
<script src="../node_modules/qiniu-js/dist/qiniu.min.js"></script>
```

通过sctipt标签引入该文件，会在全局生成名为 `qiniu` 的对象(2.X版本的)，而这个对象会为后面的上传文件埋下致命的bug。

可以通过简单的`console.log(qiniu)`，验证是否成功。

可以看一下，七牛的[用例](http://jssdk.demo.qiniu.io/)

### 一个小bug

在后面的plupload的时候会报错，很奇怪。后来看七牛的用例的源码，在人家的`qiniu.min.js`的里面发现的`Qiniu`,而我的没有，所以猜测七牛用例使用的是1.x版本，果断通过更改版本

```javascript
"dependencies": {
    "leancloud-storage": "^3.6.0",
    "qiniu-js": "^1.0.2"
  }
  
 //修改完package.json
 npm i 
```

### 上传文件

在页面中引入qiniu.min.js后，初始化uploader，在这之前需要安装plupload,而安装这个有需要安装moxie。

plupload直接通过npm就可以了，而这个moxie需要去github下载源码自己导入。

***

### 服务端准备

> 本 SDK 依赖服务端颁发的上传凭证，可以通过以下二种方式实现：
>
> - 利用七牛服务端 SDK 构建后端服务
> - 利用七牛底层 API 构建服务，详见七牛[上传策略](https://developer.qiniu.com/kodo/manual/put-policy)和[上传凭证](https://developer.qiniu.com/kodo/manual/upload-token)
>
> 后端服务应提供一个 URL 地址，供 SDK 初始化使用，前端通过 Ajax 请求该地址后获得 upToken。 Ajax 请求成功后，服务端应返回json

如上是七牛为了安全性考虑的，必须获得一个token。所以我选择使用node做一个假的服务端，来获取token.

### nodejsServer

惯例使用七牛的[nodejs文档](https://developer.qiniu.com/kodo/sdk/1289/nodejs)

先安装

```javascript
npm install qiniu
```

在`server.js`里面简单的构建

```javascript
if (path === '/uptoken') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', '*')

    //定义好其中鉴权对象mac：
    var config = fs.readFileSync('./qiniu-key.json') //真正的accessKey, secretKey在这里
    config = JSON.parse(config)

    let {accessKey, secretKey} = config
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    //简单上传的凭证
    var options = {
      scope: "163-music-demo-1", //应用的名字
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken=putPolicy.uploadToken(mac);
    response.write(`
    {
      "uptoken": "${uploadToken}"
    }
    `)
    response.end()
  }
```

做好这个工作之后，uploader可以工作了

```javascript
var uploader = Qiniu.uploader({
	...
	uptoken_url: 'http://localhost:8888/uptoken', 
	//只需要注意这一句，其他代码抄文档。以后每次先开一个node server.js 8888
	...
});
```

至此所有的代码，可以看这个[版本](https://github.com/codevvvv9/163-music-demo-1/tree/d21fefc6ab09f50393df99de210b9a7ed3eddf58)

既然支持拖曳上传和普通上传，需要做一些简单的css样式的修改以及html的改动。

```html
<style>
  p{margin: 5px; padding: 0;}
  #container{
  padding: 50px 80px;
  border: 2px dashed #ddd;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  flex-direction: column;
  }
 </style>
   
   <div id="container">
     <span id="pickfiles">点击或者拖曳文件</span>
     <p>文件大小不能超过 40MB</p>
     </div>
   <div id="uploadStatus"></div>
```

```javascript
var uploader = Qiniu.uploader({
	browse_button: 'pickfiles',       //上传选择的点选按钮，**必需**
	...
    container: 'container',           //上传区域DOM ID，默认是browser_button的父元素，
    max_file_size: '40mb',           //最大文件体积限制
    dragdrop: true,                   //开启可拖曳上传
    drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
    auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
    init: {
      'FilesAdded': function (up, files) {
      plupload.each(files, function (file) {
        // 文件添加进队列后,处理相关的事情
      });
      },
      'BeforeUpload': function (up, file) {
        // 每个文件上传前,处理相关的事情
      },
      'UploadProgress': function (up, file) {
        // 每个文件上传时,处理相关的事情
        uploadStatus.textContent = '上传中' //提示用户上传进度的
      },
      'FileUploaded': function (up, file, info) {
        uploadStatus.textContent = '上传完毕'
      },
      'Error': function (up, err, errTip) {
        //上传出错时,处理相关的事情
      },
      'UploadComplete': function () {
        //队列文件处理完毕后,处理相关的事情
      }
    }
  });
```

至此，简单的上传文件的效果做完了，全部的[代码版本](https://github.com/codevvvv9/163-music-demo-1)

![](http://p3tha6q4v.bkt.clouddn.com/18-2-20/72923380.jpg)
