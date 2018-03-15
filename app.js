var express     =require("express");
var path	=require("path");
var logger      =require("morgan");
var bodyParser  =require("body-parser");
var cookieParser=require("cookie-parser");	
var redis       =require("redis");
var app=express();
var PORT=process.env.PORT||3000;

var client=redis.createClient();
client.on('connect',function(err,conn){
	if(err){
	console.log(err);
	}else{
	console.log("redis connected !!!")
	}
});


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.get("/",function(req,res){
	var title ='Task list';
	

	client.lrange('tasks',0,-1,function(err,data){
	   client.hgetall('call',function(err,call){
		res.render('index',{title:title,reply:data,call:call});
	});	
    });
});
app.post("/add/task",function(req,res){
var task=req.body.task;
client.rpush('tasks',task,function(err,data){
	if(err){
	console.log(err);
	}else if(data){
	console.log("task added successfully");
	res.redirect("/");
	}
});

});

app.post("/task/delete",function(req,res){
var taskToDelete=req.body.tasks;
client.lrange('tasks',0,-1,function(err,tasks){
	for(var i=0;i<tasks.length;i++){
		if(taskToDelete.indexOf(tasks[i]) > -1){
			client.lrem('tasks',0,tasks[i],function(){
				if(err){
					console.log(err);	
				}else{
					console.log("task deleted successfully");
				}
			});
		}
	}
res.redirect("/");
   });

});

app.post("/call/add",function(req,res){
var newCall={};
	newCall.name=req.body.name;
	newCall.company=req.body.company;
	newCall.phone=req.body.phone;
	newCall.time=req.body.time;
	
	client.hmset('call',['name',newCall.name,'company',newCall.company,'phone',newCall.phone,'time',newCall.time],function(err,rply){
	if(err){
	console.log(err);
	}else{
         res.redirect("/");
	}
});


});



app.listen(PORT);
console.log('server started !!');
module.exports=app;
