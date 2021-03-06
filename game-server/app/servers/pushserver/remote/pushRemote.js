/**
 * Created with JetBrains WebStorm.
 * User: youxiachai
 * Date: 13-6-17
 * Time: 上午1:46
 * To change this template use File | Settings | File Templates.
 */


module.exports = function(app) {
    return new PushRemote(app);

};

var PushRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

//获得当前用户列表
PushRemote.prototype.getUsers = function(name){
    var users = [];
    var channel = this.channelService.getChannel(name, false);
    if(!!channel){
        //获得推送客户端
        users = channel.getMembers();
    }
    return users;
};

//把客户端添加到推送列表中
PushRemote.prototype.add = function(uid, role, sid, channelName, cb){
    var channel = this.channelService.getChannel(channelName, true);
    if(role === 'server'){
        cb(null ,this.getUsers(channelName));
    }else {
        if(!!channel){
            channel.add(uid ,sid);
        }
        cb(null, null);
        //uuid 告诉给服务端onAdd 事件
        //, [{uid: userId, sid: frontendServerId}]
        var server = [{uid: channelName, sid: sid}];
       this.channelService.pushMessageByUids('onAdd', {msg: "add ok", users:this.getUsers(channelName)},server, function(err){
           if(err){
               console.log(err);
               return;
           }
       });
    }
};

//删除推送列表中离线的客户端
PushRemote.prototype.kick = function(uid, sid, channelName){
    var channel = this.channelService.getChannel(channelName, false);
    if(!!channel){
        console.log('kick' + uid);
        channel.leave(uid, sid);
    }
};

PushRemote.prototype.pushAll = function(msg,  next){
    var pushMsg = this.channelService.getChannel(msg.apikey, false);
    console.log(this.getUsers(msg.apikey));
    pushMsg.pushMessage('onMsg',{msg: msg.msg}, function(err){
        if(err){
            console.log(err);
        } else{
            console.log('push ok');
            next(null, {code: 200, msg: 'push is ok.'});
        }
    });
//    var server = [{uid: "android device1", sid: "connector-server-client"}];
//    this.channelService.pushMessageByUids('onMsg', {msg: "push ok"},server, function(err){
//        if(err){
//            console.log(err);
//            return;
//        }
//    });

};

