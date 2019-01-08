const http = require('http');

const hostname = '172.21.101.17';
const port = 8888;
const path = require('path');

const express=require('express');
const cookieParser=require('cookie-parser');
const swig=require('swig');
const bodyParser = require('body-parser');
const app=express();
app.locals.title='My application';
const router=express.Router({caseSensitive:true,strict:true});

const multer  = require('multer');
/* multer是一个专门用来处理multipart/form-data的node.js的一个中间件函数 */
app.set('etag','strong');  
app.use(cookieParser());
// app.use('/showStatic',express.static(__dirname + '/static'));  //设置静态文件目录
/* 访问页面上的静态资源 express.static函数里面的参数是该资源在磁盘的完整路径，app.use函数的第一个参数
是在页面访问的时候在原有域名下，需要通过该路由加上静态资源的位置才能访问
例如 访问/static/img/test.png 在页面上通过访问 localhost:8888/public/img/static
感觉整体上就是用public路由代替原本静态资源所在的目录static实现的
*/
// app.use(express.static(path.join(__dirname,'static')));
var options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
};
app.use(express.static('static',options)); //跟16行的对比，感觉__dirname + '/static'整个字符串作为参数和'static'字符串作为参数效果是一样的 
/* 上面的内容和app.use(express.static(__dirname + '/static'))是一样的效果 */
swig.setDefaults({cache:false});
console.log('dirname',__dirname);
/* 在这里 __dirname指的就是那个这个项目在硬盘中的地址 */
app.set('views','./view');
/* 设置application'views的目录 */
app.set('view engine','html');
/* view engine 属性的属性值是一个字符串，it is used to set default engine extension to use when omitted */
app.engine('html',swig.renderFile);
/* map the swig template engine to “.html” files */
app.use(bodyParser.urlencoded({extended:true}));
let storage = multer.diskStorage({
  // 通过一个回调函数cb来设置存储路径  cb作为参数 结果是存储到当前项目文件夹下面的uploads文件夹里面了
  destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, 'uploads'));
  },
  // 通过一个回调对上传文件进行重命名
  filename: function (req, file, cb) {

      let lastPointIndex = file.originalname.lastIndexOf('.');
      let ext = file.originalname.substring( lastPointIndex );

      cb(null, file.originalname.substring(0, lastPointIndex) + '-' + Date.now() + ext)
  }
});
// let upload = multer({ storage: storage });
var upload = multer({dest:'uploads/'});

var frontNeedData={
  "success":"true",
  "data":{
      "list":[
          {"name":"name1","value":"10"},
          {"name":"name2","value":"20"},
          {"name":"name3","value":"6"},
          {"name":"name4","value":"50"}
      ]
  }
};



// app.use((req,res,next)=>{
//   console.log(req.cookies.nick);
//   next();  //req.cookies.nick 获取req header 里面的cookie name
// })

// app.get('/user/0',(req,res,next)=>{
//   res.cookie('nick','little horse'); //res.cookie(name,value) 设置cookie
//   res.send('ok');
// })
/*
在使用cookie-parser的时候，cookie-parser 大致的一个实现过程如下，有助理解，但不包含在server.js 中
app.use(function (req, res, next) {
  req.cookies = cookie.parse(req.headers.cookie);
  next();
});
*/

// app.all('/secret', function (req, res, next) {
//   console.log('Accessing the secret section ...')
//   res.send('for all method,to /secret will apply');
// })

router.use(function(req,res,next){
  console.log('now time',Date.now());
  next();
})

// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use('/user/:id', function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})

var arr=['aaa','bbb','ccc','ddd','fff'];

router.get('/user/:id',function(req,res,next){
  if(req.params.id==='0'){
    console.log('enter this');
    next('route');
  }else{
    next();
  }
},function(req,res,next){
  next();
  // res.send('now enter regular');
  // res.download('static/html/index.html'); //Prompt a file to be downloaded. relative path relatie to server.js
  // res.send('regular now');  //Send a response of various types.
  // res.end(); //End the response process. 正常情况下，web页面接收到200的statuscode
  // res.json(frontNeedData); //Send a JSON response.
  // res.jsonp() //Send a JSON response with JSONP support.
  // res.redirect('/data2');  //Redirect a request.
  // res.set('Content-Type','text/html');
  // res.render('page2');  //Render a view template.
  // res.sendFile()  //Send a file as an octet stream.
  // res.sendStatus()  // Set the response status code and send its string representation as the response body.
  // res.send(arr);
  // res.sendStatus(200);
  // res.redirect('../../users/:id');
})

var admin=express();
admin.on('mount',function(parent){
  console.log('admin mounted');
})

admin.get('/',function(req,res){
  res.send('admin homepage');
})

app.use('/admin',admin);

app.disable('trust proxy');
console.log('is : ',app.get('trust proxy'));
app.enable('trust proxy');
console.log('disabled:',app.disabled('trust proxy'));

/*
var admin=express();
admin.get('/use*',function(req,res){
  console.log('req.baseUrl',req.baseUrl);  //  '/admin'
  console.log('admin.mountpath',admin.mountpath);  //  ['/adm*n','/manager']
  res.send('admin homepage');
})


var secret=express();
secret.get('/user',function(req,res,next){
  console.log(secret.mountpath);
  res.send('secret homepage');
})

admin.use('/secr*t',secret);  //load the 'secret' router on '/secr*t', on the 'admin' sub-app
app.use(['/adm*n','/manager'],admin); //load the 'admin' router on '/adm*n' and '/manager', on the parent app

console.log('admin.path2',admin.path()); //  /adm*n  /manager
*/

app.get('/file/:name', function (req, res, next) {

  var options = {
    root: __dirname + '/static/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.get('/error',function(req,res,next){
  res.send('after add /error route');// mark as funD
})

router.post('/fileUpload',upload.single('avatar'),function(req,res,next){
  console.log('enter /fileUpload route');
  console.log('req.body',req.body);
  console.log('req.file',req.file);
})
/*  //  上面例子中req.file 的console 结果是{ fieldname: 'avatar',
  originalname: 'Capture.PNG',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: 'uploads/',
  filename: '2d4e9cca360273e00660e1100a2ccf87',
  path: 'uploads\\2d4e9cca360273e00660e1100a2ccf87',
  size: 1627 }
 */




router.param('id',function(req,res,next,id){
  console.log('this is id :',id);
  console.log('called only once');
  next();
})

// handler for the /user/:id path, which renders a special page
router.get('/user/:id', function (req, res, next) {
  // res.set({
  //   'Content-Type': 'text/plain',
  //   'Content-Length': '123',
  //   'ETag': '12345'
  // });
  // res.type('html');
  // res.send(frontNeedData);
  console.log('although this matches');
  next();
})

router.get('/user/:id',(req,res,next)=>{
  console.log('and this matches too');
  res.send('enter /user/:id');
})

router.param('user_id',(req,res,next,id)=>{
  req.user={
    id:id,
    name:'MLJ'
  };
  next();
});

router.route('/Users/:user_id').all(function(req,res,next){
  next();
}).get(function(req,res,next){
  console.log('app.locals.title',app.locals.title);
  // res.json(req.user);
  res.render('page2');
})




// mount the router on the app
app.use('/', router);
/* 
这样建立的路由，那么套用router的中间件，必须是以/app 开头的，并且后面紧跟着的路由是router.use()或者router.get()的里面的第一个参数
例如 访问localhost:8888/app/error 就可以访问上面的中间件函数，mark as funD
*/
 
/*
app.get('/error',function(req,res){
 throw new Error('BROKEN');
})

app.use('/users/:id',(req,res)=>{
  // console.log('Request type',req.method);
  res.send('now enter /users/:id route');
});

app.get('/user/:id', function (req, res, next) {
  if(req.params.id==='0'){
    next('route');
  }else{
    next();
  }
  // console.log('Request URL:', req.originalUrl)  //  req.originalUrl is /url/99 
}, function (req, res, next) {
  res.send('regular');
})

app.get('/user/:id',(req,res)=>{
 console.log('now enter this route /user/:id');
  res.set({
    'Content-Type': 'text/plain',
    'Content-Length': '123',
    'ETag': '12345'
  });
  res.send(frontNeedData);
});




app.get('/download/data', (req, res) => {
    // res.send(path.resolve(__dirname, 'data/1.jpg'));
    res.sendFile( path.resolve(__dirname, 'static/img/test.png') );
});

app.get('/data1',(req,res)=>{
  // var responseTxt='Hello world </br>';
  // res.send(responseTxt);
  res.send(frontNeedData)
})

app.get('/data2',(req,res)=>{
  res.render('page2');
})


app.get('/test', function (req, res) {
  res.send('Hello World  222!')
})
app.get('/', function (req, res) {
  res.send('Hello World index!')
})

app.get('/random.text',(req,res)=>{
  res.render('page2');  //route path will match requests to /random.text 
})

app.get('/ab?cd',(req,res)=>{
  res.send('ab?cd');
})

// app.get(/a/,(req,res)=>{
//   res.send('route has a a in it');
// })

app.get(/.*fly$/,(req,res)=>{
  res.send('route will end up with fly');
})

//
app.get('/users/:userId/books/:bookId',(req,res)=>{
  console.log('req.params',req.params);
  res.send(req.params);
})

app.get('/flights/:start-:end',(req,res)=>{
  res.send(req.params);  //除了-还有 一个是下标的点. 也可以发挥它巨大的作用 反正参数就是参数名前面带上:
})

app.get('/example/b', function (req, res, next) {
  // res.send('now end the request-respond cycle');
  console.log('the response will be sent by the next function ...')
  next();
}, function (req, res) {
  res.send('Hello from B!')
})
*/



/* 
route支持正则的表示 如果第一个参数是一个字符串，那么形如 '/ab?cd'的路由可以匹配/abcd或者/acd这样的route
形如'/ab+cd' 可以匹配/abcd 或者/abbbcd 这样的route 
形如'/ab*cd' 可以匹配 abcd, abxcd, abRANDOMcd, ab123cd
形如'/ab(cd)?e' 可以匹配 /abcde /abe 
如果第一个参数直接是一个正则表达式 形如 /a/ 这样的，可以匹配包含a字母的 /.*fly$/ 可以匹配以fly结束的route
*/





/*
app.listen(8888,function(){
  console.log('Server running at localhost:8888');
});
上面的这个是用express这个web框架来建立的一个服务 监听某个端口
*/

/*
const server = http.createServer((req, res) => {
  // res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/

1111;
2222;

http.createServer(app).listen(8888,(req,res)=>{
  console.log(`Server running at http://${hostname}:${port}/`);
})