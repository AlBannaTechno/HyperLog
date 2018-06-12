/**
 * By : Osama Al Banna (Al Banna Techno)
 * TODO : Need TO Document This File
 */
const util = require('util');
// let log=function log(ltype,message,additional_objects,object_color=true){
//     console.log((ltype.toUpperCase()+"::"+message)+ (additional_objects===undefined ?"":"\n"+util.inspect(additional_objects,false,null,object_color)));
// };
const getParents=require('./get_parents').getParents;
const serialize=require('./get_parents').serialize;
let sep=require('path').sep;
let log=(function(){
    return function(show_undefined=false){
        let showUndefined=show_undefined;
        let log_list={};
        let block_list=null;
        let non_block_list=null;
        // to get Error Object
        function getErrorObject(full_description=false) {
            try {
                throw Error('')
            } catch (err) {
                return [err,full_description];
            }
        }
        this.ln=getErrorObject;
        // private
        let getLineAll=function (err,full_description=false){

            let caller_line = err.stack.split("\n")[2];
            if(full_description){
                let index_1=caller_line.indexOf(' (');
                return caller_line.slice(index_1+1);
            }
            // first get line number
            let index_1 = caller_line.lastIndexOf(":");
            let index_2 = caller_line.slice(0,index_1).lastIndexOf(":");
            let clean_line_number = caller_line.slice(index_2+1, index_1);
            // second get file name
            let index_3=caller_line.lastIndexOf(sep);
            let clean_file_name=caller_line.slice(index_3+1,index_2);
            return clean_file_name+":"+clean_line_number;
        };
        this.hide=function(log_name){
            if(typeof(log_name)==="object"){
                for(let c=0;c<log_name.length;c++){
                    log_list[log_name[c]]=false;
                }
            }
            else{
                log_list[log_name]=false;
            }
        };
        this.show=function(log_name){
            if(typeof(log_name)==="object"){
                for(let c=0;c<log_name.length;c++){
                    log_list[log_name[c]]=true;
                }
            }
            else{
                log_list[log_name]=true;
            }
        };
        this.showAllElse=function(log_name){
            if(typeof(log_name)==="object"){
                for(let log in log_list){
                    if(log_name.indexOf(log)===-1){
                        log_list[log]=true;
                    }
                    else{
                        log_list[log]=false;
                    }
                }
            }else{
                for(let log in log_list){ // log :key
                    log_list[log]=!(log===log_name);
                }
            }
        };
        this.hideAllElse=function(log_name){
            if(typeof(log_name)==="object"){
                for(let log in log_list){
                    if(log_name.indexOf(log)===-1){
                        log_list[log]=false;
                    }
                    else{
                        log_list[log]=true;
                    }
                }
            }else{
                for(let log in log_list){ // log :key
                    log_list[log]=log===log_name;
                }
            }
        };
        this.dropLogs=function(log_name){
            if(typeof(log_name)==="object"){
                for(let log in log_name){
                    delete log_name[log];
                }
            }else{
                delete log_list[log_name];
            }
        };
        this.toggleLogs=function(){
            for(let log in log_list){
                log_list[log]=!log_list[log];
            }
        };
        // this will use to prevent any feature block log : but if we don't use show/hideAllElse functions
        // but because we used those two functions blockAllElse,notBlockAllElse,dropBlock been deprecated
        this.blockAllElse=function(log_name){
            if(typeof(log_name)==="object"){
                block_list=log_name;
            }else{
                block_list=[log_name];
            }
        };
        this.notBlockAllElse=function(log_name){
            if(typeof(log_name)==="object"){
                non_block_list=log_name;
            }else{
                non_block_list=[log_name];
            }
        };
        this.dropBlock=function(){
            block_list=null;
            non_block_list=null;
        };
        this.l=function log(ltype,c_message,additional_objects,hidden_depth_add_objects=null,caller=[true,false],first_parent_caller=[true,false],object_color=true,caller_level=0){
            // if we need to skip just but value to null
            if(first_parent_caller===null) first_parent_caller=[true,false];
            hidden_depth_add_objects=hidden_depth_add_objects===null ?[false,null] :hidden_depth_add_objects===-2 ? [true,null] :[true,hidden_depth_add_objects];
            /*
                first_parent_caller:[
                    show first_parent_caller,
                    get first_parent_caller parameters {as a string}
                   ]
                caller:[] as first_parent_caller
                 // next method
                hidden_depth_add_objects: if this is changed : show hidden object option will turn to true
                But Notice:
                    hidden_depth_add_objects    =   -1   will get this object only :/ no benefit of using it
                    hidden_depth_add_objects    =   -2   will get use depth with null it's mean get full branches /nodes : it's not advisable to use it at all
;

             */
            /*
                use : ["message",log.ln()]      >> to get line number and filename
                use : ["message",log.ln(true)]  >> to get full-path:lineNumber:indicator
                log.l("info",["triangles",log.ln()],triangles);
             */
            let message;
            if(typeof(c_message)==="object"){
                message="{ FILE : "+getLineAll(...c_message[1])+" }";
                message+=" , "+c_message[0];

            }
            else{
                message=c_message;
            }
            let _parents=getParents(caller_level+2);
            let _caller;
            let _first_parent_caller="";
            let _caller_message="";
            let _first_parent_message="";
            if(caller[0]){
                _caller=_parents[caller_level+1] || ["{MAIN_FILE}",process.argv];
                if(caller[1]){
                    _caller=[_caller[0],serialize(_caller[1])]
                }
                else{
                    _caller=_caller[0];
                }
                _caller=_caller.toString();
                _caller_message=" , %CALLER% : "+_caller;
            }
            if(first_parent_caller[0] && _parents[1]!==undefined){ // to prevent any problem if we call log directly from the main file
                _first_parent_caller=_parents[caller_level+2] || ["{MAIN_FILE}",process.argv];
                if(first_parent_caller[1]){
                    _first_parent_caller=[_first_parent_caller[0],serialize(_first_parent_caller[1])]
                }
                else{
                    _first_parent_caller=_first_parent_caller[0];
                }
                _first_parent_caller=_first_parent_caller.toString();
                _first_parent_message=" , %PARENT% : "+_first_parent_caller;
            }

            let _message=message+_caller_message+_first_parent_message;
            let check=log_list.hasOwnProperty(ltype);
            if(check){
                if(log_list[ltype]){
                    console.log((ltype.toUpperCase()+"::"+_message)+ (additional_objects===undefined ?"":"\n"+util.inspect(additional_objects,hidden_depth_add_objects[0],hidden_depth_add_objects[1],object_color)));
                }
            }
            else{
                if(showUndefined){
                    log_list[ltype]=true;
                    console.log((ltype.toUpperCase()+"::"+_message)+ (additional_objects===undefined ?"":"\n"+util.inspect(additional_objects,hidden_depth_add_objects[0],hidden_depth_add_objects[1],object_color)));

                }
            }
        };
        this.setShowUndefined=function(show=true){
            showUndefined=show;
        };
        this.getLogList=function(){
            return log_list;
        };
        this.setLogList=function(list){
            log_list=list;
        };
        this.invoke=function(log_name){
            this.show(log_name);
            let th=this;
            return function (c_message,additional_objects,hidden_depth_add_objects=null,caller=[true,false],first_parent_caller=[true,false],object_color=true) {
                 th.l(log_name,c_message,additional_objects,hidden_depth_add_objects,caller,first_parent_caller,object_color,1);
            }
        }
    };

}());
module.exports=log;
/*How to use*/
if (require.main === module) {
    let _log=require('./hyper_log');
    let log=new _log();
// old method
    log.show("info");
    let info=function(...args){
        log.l("info",...args);
    };
// new method
    let data_log=log.invoke("data");
    data_log("message",{d:234,f:{x:3243,z:"345345"}});
    function test(){
        data_log("Calling_data",{ff:54,y:33});
        log.l("data","work_correctly");
    }
    test();
}