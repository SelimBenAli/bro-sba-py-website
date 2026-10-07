(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s), $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const types = [["CharField","Text · CharField"],["TextField","Long text · TextField"],["IntegerField","Integer · IntegerField"],["BigIntegerField","Large integer · BigIntegerField"],["FloatField","Number · FloatField"],["DecimalField","Fixed decimal · DecimalField"],["BooleanField","True / false · BooleanField"],["DateField","Date · DateField"],["DateTimeField","Date and time · DateTimeField"],["TimeField","Time · TimeField"],["UUIDField","UUID · UUIDField"],["ForeignKeyField","Related model · ForeignKeyField"],["FilePath","File upload path · CharField"],["ImagePath","Image upload path · CharField"]];
  const keywords = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
  const field = o => Object.assign({name:"field_name",type:"CharField",primary:false,nullable:false,unique:false,index:false,default:"",boolDefault:"none",create:true,required:true,update:true,search:false,operator:"eq",choices:"",sensitive:false,listed:true,maxLength:"",related:"User",backref:"items",display:"name",onDelete:"CASCADE"},o||{});
  const DRAFT_KEY="bro-sba-py:model-builder:draft:v1";
  let fields = [field({name:"title",required:true,search:true,operator:"like"}),field({name:"description",type:"TextField",nullable:true,required:false}),field({name:"status",default:"todo",required:false,search:true,choices:"todo, in_progress, done"}),field({name:"is_complete",type:"BooleanField",boolDefault:"false",required:false})];
  let actions = [], actionId=0;
  const list=$("#field-list"), actionList=$("#action-list"), output=$("#python-output"), msg=$("#validation-message");
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pystr=v=>JSON.stringify(String(v??""));
  const pybool=v=>v?"True":"False";
  const snake=v=>String(v||"").trim().replace(/([a-z0-9])([A-Z])/g,"$1_$2").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").toLowerCase();
  const pluralize=v=>{const w=String(v||"");if(/(?:s|x|ch|sh)$/i.test(w))return w+"es";if(/[^aeiou]y$/i.test(w))return w.slice(0,-1)+"ies";return w+"s";};
  const model=()=>$("#class-name").value.trim(), mod=()=>snake($("#module-name").value)||"model", lower=()=>snake(model())||"model";
  const pk=()=>fields.find(f=>f.primary)?.name||"id";
  const api=f=>f.type==="ForeignKeyField"?f.name+"_id":f.name;
  const peewee=f=>["FilePath","ImagePath"].includes(f.type)?"CharField":f.type;
  const ruleType=f=>f.type==="ForeignKeyField"||["IntegerField","BigIntegerField"].includes(f.type)?"int":["FloatField","DecimalField"].includes(f.type)?"float":f.type==="BooleanField"?"bool":f.type==="DateField"?'"date"':f.type==="DateTimeField"?'"datetime"':f.type==="FilePath"?'"file"':f.type==="ImagePath"?'"image"':"str";
  const choices=f=>f.choices.split(",").map(v=>v.trim()).filter(Boolean);

  function renderFields(){
    list.innerHTML=fields.map((f,i)=>{
      const options=types.map(([v,l])=>'<option value="'+v+'"'+(f.type===v?" selected":"")+'>'+l+"</option>").join("");
      const ops=["eq","like","gt","lt","in"].map(v=>'<option'+(f.operator===v?" selected":"")+'>'+v+"</option>").join("");
      const check=(k,l)=>'<label class="checkline"><input type="checkbox" data-fi="'+i+'" data-fk="'+k+'"'+(f[k]?" checked":"")+'><span>'+l+"</span></label>";
      let defaultInput=f.type==="BooleanField"?'<label>Default<select data-fi="'+i+'" data-fk="boolDefault"><option value="none"'+(f.boolDefault==="none"?" selected":"")+'>No default</option><option value="true"'+(f.boolDefault==="true"?" selected":"")+'>True</option><option value="false"'+(f.boolDefault==="false"?" selected":"")+'>False</option></select></label>':'<label>Default value<input data-fi="'+i+'" data-fk="default" value="'+esc(f.default)+'" placeholder="e.g. draft or 10"></label>';
      let extra=f.type==="CharField"?'<label>Max length<input type="number" data-fi="'+i+'" data-fk="maxLength" value="'+esc(f.maxLength)+'" placeholder="Optional"></label>':f.type==="DecimalField"?'<label>Digits<input type="number" data-fi="'+i+'" data-fk="digits" value="'+esc(f.digits||"10")+'"></label><label>Decimal places<input type="number" data-fi="'+i+'" data-fk="places" value="'+esc(f.places||"2")+'"></label>':"";
      if(["CharField","TextField"].includes(f.type))extra+='<label>Choices<input data-fi="'+i+'" data-fk="choices" value="'+esc(f.choices)+'" placeholder="Comma-separated, optional"></label>';
      const fk=f.type==="ForeignKeyField"?'<div class="fk-options"><label>Related model<input data-fi="'+i+'" data-fk="related" value="'+esc(f.related)+'"></label><label>Backref<input data-fi="'+i+'" data-fk="backref" value="'+esc(f.backref)+'"></label><label>Display field<input data-fi="'+i+'" data-fk="display" value="'+esc(f.display)+'"></label><label>On delete<select data-fi="'+i+'" data-fk="onDelete"><option>CASCADE</option><option'+(f.onDelete==="RESTRICT"?" selected":"")+'>RESTRICT</option><option'+(f.onDelete==="SET NULL"?" selected":"")+'>SET NULL</option></select></label></div>':"";
      return '<article class="field-card"><div class="field-card-head"><label>Field name<input data-fi="'+i+'" data-fk="name" value="'+esc(f.name)+'" placeholder="title"></label><label>Field type<select data-fi="'+i+'" data-fk="type">'+options+'</select></label><button class="icon-remove" data-rf="'+i+'" aria-label="Remove field">×</button></div><div class="field-options">'+check("primary","Primary key")+check("nullable","Can be empty")+check("unique","Unique")+check("index","Database index")+'</div><div class="field-rules">'+check("create","Create form")+check("required","Required")+check("update","Update form")+check("search","Searchable")+check("sensitive","Sensitive / hash")+check("listed","Show in admin")+ '<label class="search-operator">Search operator<select data-fi="'+i+'" data-fk="operator">'+ops+'</select></label></div><div class="field-extra">'+defaultInput+extra+"</div>"+fk+"</article>";
    }).join("");
  }
  function renderActions(){
    actionList.innerHTML=actions.map((a,i)=>{
      const behaviors=[["stub","Code stub"],["set","Set a field"],["increment","Increment a number"],["delete","Delete record"]];
      const behavior=behaviors.map(([v,l])=>'<option value="'+v+'"'+(a.behavior===v?" selected":"")+'>'+l+"</option>").join("");
      const targets=fields.map(f=>'<option value="'+esc(f.name)+'"'+(a.target===f.name?" selected":"")+'>'+esc(f.name)+"</option>").join("");
      let target=a.behavior==="set"||a.behavior==="increment"?'<label>Target field<select data-ai="'+i+'" data-ak="target">'+targets+"</select></label>":"";
      let amount=a.behavior==="set"?'<label>Set value<input data-ai="'+i+'" data-ak="value" value="'+esc(a.value)+'" placeholder="e.g. completed"></label>':a.behavior==="increment"?'<label>Increase by<input type="number" data-ai="'+i+'" data-ak="by" value="'+esc(a.by)+'"></label>':"";
      const generated=a.behavior!=="stub";
      return '<article class="action-card"><div class="action-head"><label>Action name<input data-ai="'+i+'" data-ak="name" value="'+esc(a.name)+'"></label><label>Admin label<input data-ai="'+i+'" data-ak="label" value="'+esc(a.label)+'"></label><label>Method<select data-ai="'+i+'" data-ak="method">'+["POST","PATCH","PUT","DELETE"].map(m=>'<option'+(a.method===m?" selected":"")+">"+m+"</option>").join("")+'</select></label><button class="icon-remove" data-ra="'+i+'" aria-label="Remove action">×</button></div><div class="action-settings"><label>Behavior<select data-ai="'+i+'" data-ak="behavior">'+behavior+"</select></label>"+target+amount+'<label>Parameters (one per line: name:type:required)<textarea rows="3" data-ai="'+i+'" data-ak="params" placeholder="reason:str:required">'+esc(a.params)+'</textarea></label><label>Custom route<input data-ai="'+i+'" data-ak="route" value="'+esc(a.route)+'" placeholder="Optional"></label><label class="checkline"><input type="checkbox" data-ai="'+i+'" data-ak="confirm"'+(a.confirm?" checked":"")+'><span>Ask for confirmation</span></label></div><p class="action-note">'+(generated?"Generated actions need the default API route so the record can be loaded.":"Creates a service stub for your own Python logic.")+"</p></article>";
    }).join("");
  }

  function value(v,n){
    const pad=" ".repeat(n||0), child=" ".repeat((n||0)+4);
    if(typeof v==="string")return pystr(v);if(typeof v==="boolean")return pybool(v);if(typeof v==="number")return isFinite(v)?String(v):"0";if(v==null)return "None";
    if(Array.isArray(v))return "["+v.map(x=>value(x,n)).join(", ")+"]";
    if(typeof v==="object"){const pairs=Object.entries(v);return pairs.length?"{\n"+pairs.map(([k,x])=>child+pystr(k)+": "+value(x,(n||0)+4)+",").join("\n")+"\n"+pad+"}":"{}";}
    return "None";
  }
  function params(text,name){const out={};text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(line=>{const p=line.split(":").map(x=>x.trim()),n=p[0],t=p[1]||"str";if(!/^[a-z_][a-z0-9_]*$/.test(n)||keywords.has(n))throw Error("Invalid action parameter: "+n);if(!["str","int","float","bool"].includes(t))throw Error("Parameter "+n+" must be str, int, float, or bool.");out[n]={type:t,required:(p[2]||"required")!=="optional"};});return out;}
  function actionCode(a,plural){
    const result={method:a.method||"POST",label:a.label||a.name,confirm:Boolean(a.confirm),expose_api:true,route:String(a.route||"").trim()||"/"+plural+"/<int:"+pk()+">/"+a.name};
    const ps=params(a.params||"",a.name);if(Object.keys(ps).length)result.params=ps;
    if(a.behavior==="stub"){result.generate="stub";return value(result,12);}
    result.generate="full";result.target=pk();
    if(a.behavior==="set"){const f=fields.find(x=>x.name===a.target);let val=a.value;if(f&&["IntegerField","BigIntegerField"].includes(f.type))val=parseInt(val||"0",10);else if(f&&["FloatField","DecimalField"].includes(f.type))val=Number(val||"0");else if(f&&f.type==="BooleanField")val=["true","yes","1"].includes(String(val).toLowerCase());result.logic={actions:[{set:{field:a.target,value:val}},{save:true}],return:"instance"};}
    if(a.behavior==="increment")result.logic={actions:[{increment:{field:a.target,by:Number(a.by||1)}},{save:true}],return:"instance"};
    if(a.behavior==="delete")result.logic={actions:[{delete:true}],return:"none"};
    return value(result,12);
  }
  function validate(){
    const name=model(), file=mod(), used=new Set();
    if(!/^[A-Z][A-Za-z0-9]*$/.test(name)||keywords.has(name))return "Use a class name like TaskItem.";
    if(!/^[a-z_][a-z0-9_]*$/.test(file)||keywords.has(file))return "Use a lowercase Python file name like task_item.";
    if(!$("#db-import").value.trim())return "Add the Python import line for your project's db object.";
    if(!fields.length)return "Add at least one field.";
    for(const f of fields){if(!/^[a-z_][a-z0-9_]*$/.test(f.name)||keywords.has(f.name))return "The field name “"+(f.name||"(empty)")+"” is not a valid Python name.";if(used.has(f.name))return "Duplicate field: "+f.name;used.add(f.name);if(f.type==="ForeignKeyField"&&!/^[A-Z][A-Za-z0-9]*$/.test(f.related))return "Enter a related model class for "+f.name+".";
      if(["IntegerField","BigIntegerField","FloatField","DecimalField"].includes(f.type)&&f.default.trim()&&!isFinite(Number(f.default)))return "Enter a numeric default for "+f.name+".";}
    if(fields.filter(f=>f.primary).length>1)return "Choose only one primary key.";
    if(used.has("id")&&!fields.find(f=>f.name==="id").primary&&!fields.some(f=>f.primary))return "Mark id as primary key or rename it; Peewee creates an id field automatically.";
    for(const a of actions){if(!/^[a-z_][a-z0-9_]*$/.test(a.name)||keywords.has(a.name))return "Custom action names must be valid Python names.";if(a.behavior==="increment"){const f=fields.find(x=>x.name===a.target);if(!f||!["IntegerField","BigIntegerField","FloatField","DecimalField"].includes(f.type))return "Choose a number field for "+a.name+".";if(!isFinite(Number(a.by)))return "Enter a valid increment for "+a.name+".";}if(a.behavior==="set"&&!fields.some(f=>f.name===a.target))return "Choose a field for "+a.name+".";}
    return "";
  }

  function defaultValue(f){
    if(f.type==="BooleanField")return f.boolDefault==="none"?"":pybool(f.boolDefault==="true");
    const v=(f.default||"").trim();if(!v)return "";
    if(["IntegerField","BigIntegerField"].includes(f.type))return String(parseInt(v,10));
    if(["FloatField","DecimalField"].includes(f.type))return String(Number(v));
    return pystr(v);
  }
  function declaration(f){
    const args=[],t=peewee(f);
    if(f.type==="ForeignKeyField"){args.push(f.related);if(f.backref)args.push("backref="+pystr(f.backref));if(f.onDelete)args.push("on_delete="+pystr(f.onDelete));}
    if(f.type==="CharField"&&f.maxLength)args.push("max_length="+parseInt(f.maxLength,10));
    if(f.type==="DecimalField"){args.push("max_digits="+(parseInt(f.digits,10)||10));args.push("decimal_places="+(parseInt(f.places,10)||2));}
    if(f.nullable)args.push("null=True");if(f.unique)args.push("unique=True");if(f.index)args.push("index=True");if(f.primary)args.push("primary_key=True");
    const d=defaultValue(f);if(d)args.push("default="+d);return f.name+" = "+t+"("+args.join(", ")+")";
  }
  function method(name,rows){return ["    @classmethod","    def "+name+"(cls):","        return {",...rows,"        }"];}
  function makeCode(){
    const imports=new Set(["Model"]);fields.forEach(f=>imports.add(peewee(f)));
    const lines=["from peewee import "+[...imports].sort().join(", ")],db=$("#db-import").value.trim();if(db)lines.push(db);
    [...new Set(fields.filter(f=>f.type==="ForeignKeyField").map(f=>f.related))].forEach(n=>lines.push("from models."+snake(n)+" import "+n));
    lines.push("","","class "+model()+"(Model):","    class Meta:","        database = db","");
    fields.forEach(f=>lines.push("    "+declaration(f)));
    const ins=fields.filter(f=>f.create&&!f.primary),upd=fields.filter(f=>f.update&&!f.primary),search=fields.filter(f=>f.search&&!f.sensitive);
    const formRule=(f,req)=>"            "+pystr(api(f))+': {"required": '+pybool(req)+', "type": '+ruleType(f)+(choices(f).length?', "choices": ['+choices(f).map(pystr).join(", ")+"]":"")+"},";
    if(ins.length)lines.push("",...method("insert_fields",ins.map(f=>formRule(f,f.required))));
    if(upd.length)lines.push("",...method("update_fields",upd.map(f=>formRule(f,false))));
    if(search.length)lines.push("",...method("search_fields",search.map(f=>"            "+pystr(api(f))+': {"type": '+ruleType(f)+', "operator": '+pystr(f.operator)+"},")));
    const sensitive=fields.filter(f=>f.sensitive).map(api);if($("#enable-auth").checked&&!sensitive.includes($('[data-auth="password_field"]').value.trim()||"password"))sensitive.push($('[data-auth="password_field"]').value.trim()||"password");
    if(sensitive.length)lines.push("","    @classmethod","    def sensitive_fields(cls):","        return ["+sensitive.map(pystr).join(", ")+"]");
    const admin={show_in_menu:$("#show-in-menu").checked,menu_label:$("#menu-label").value.trim()||model(),list_fields:fields.filter(f=>f.listed).map(api),actions:$$("[data-admin-action]").filter(x=>x.checked).map(x=>x.dataset.adminAction)};
    if(!fields.some(f=>f.primary))admin.list_fields.unshift("id");
    const perms={};$$("[data-permission]").forEach(x=>{const roles=x.value.split(",").map(y=>y.trim()).filter(Boolean);if(roles.length)perms[x.dataset.permission]=roles;});if(Object.keys(perms).length)admin.permissions=perms;
    const fk={};fields.filter(f=>f.type==="ForeignKeyField").forEach(f=>fk[api(f)]={model:snake(f.related),display_field:f.display||"id"});if(Object.keys(fk).length)admin.foreign_keys=fk;
    lines.push("","    @classmethod","    def admin_config(cls):","        return {");Object.entries(admin).forEach(([k,v])=>lines.push("            "+pystr(k)+": "+value(v,12)+","));lines.push("        }");
    if($("#enable-auth").checked){const auth={};$$("[data-auth]").forEach(x=>{if(x.value.trim())auth[x.dataset.auth]=x.value.trim();});$$("[data-auth-list]").forEach(x=>auth[x.dataset.authList]=x.value.split(",").map(y=>y.trim()).filter(Boolean));auth.signup_enabled=$("#signup-enabled").checked;const redirects={};$("[data-auth-redirects]").value.split(",").forEach(pair=>{const i=pair.indexOf(":");if(i>0)redirects[pair.slice(0,i).trim()]=pair.slice(i+1).trim();});if(Object.keys(redirects).length)auth.role_redirects=redirects;auth.default_redirect=auth.default_redirect||"/dashboard";lines.push("","    @classmethod","    def auth_config(cls):","        return {");Object.entries(auth).forEach(([k,v])=>lines.push("            "+pystr(k)+": "+value(v,12)+","));lines.push("        }");}
    if(actions.length){const plural=pluralize(lower());lines.push("","    @classmethod","    def custom_actions(cls):","        return {");actions.forEach(a=>lines.push("            "+pystr(a.name)+": "+actionCode(a,plural)+","));lines.push("        }");}
    const custom=$("#custom-methods").value.trim();if(custom)lines.push("",...custom.split(/\r?\n/).map(x=>x?"    "+x:""));
    return lines.join("\n").replace(/\n+$/,"")+"\n";
  }
  function saveDraft(){
    const state={version:1,className:$("#class-name").value,moduleName:$("#module-name").value,dbImport:$("#db-import").value,menuLabel:$("#menu-label").value,showInMenu:$("#show-in-menu").checked,adminActions:$$('[data-admin-action]').filter(x=>x.checked).map(x=>x.dataset.adminAction),permissions:Object.fromEntries($$('[data-permission]').map(x=>[x.dataset.permission,x.value])),authEnabled:$("#enable-auth").checked,authFields:Object.fromEntries($$('[data-auth]').map(x=>[x.dataset.auth,x.value])),authLists:Object.fromEntries($$('[data-auth-list]').map(x=>[x.dataset.authList,x.value])),authRedirects:$('[data-auth-redirects]').value,signupEnabled:$("#signup-enabled").checked,customMethods:$("#custom-methods").value,fields,actions};
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify(state));$("#draft-status").textContent="Draft saved automatically in this browser.";}catch(_){$("#draft-status").textContent="This browser could not save the draft.";}
  }
  function restoreDraft(){
    try{
      const raw=localStorage.getItem(DRAFT_KEY);if(!raw)return false;const state=JSON.parse(raw);if(!state||state.version!==1||!Array.isArray(state.fields)||!Array.isArray(state.actions))return false;
      if(typeof state.className==="string")$("#class-name").value=state.className;if(typeof state.moduleName==="string")$("#module-name").value=state.moduleName;if(typeof state.dbImport==="string")$("#db-import").value=state.dbImport;if(typeof state.menuLabel==="string")$("#menu-label").value=state.menuLabel;$("#show-in-menu").checked=state.showInMenu!==false;
      $$('[data-admin-action]').forEach(x=>x.checked=(state.adminActions||[]).includes(x.dataset.adminAction));$$('[data-permission]').forEach(x=>x.value=(state.permissions||{})[x.dataset.permission]||"");
      $("#enable-auth").checked=Boolean(state.authEnabled);$("#signup-enabled").checked=state.signupEnabled!==false;$("#signup-enabled").disabled=!state.authEnabled;$("#auth-fields").classList.toggle("is-disabled",!state.authEnabled);$("#auth-fields").setAttribute("aria-disabled",String(!state.authEnabled));$$('[data-auth]').forEach(x=>{if(Object.hasOwn(state.authFields||{},x.dataset.auth))x.value=state.authFields[x.dataset.auth];});$$('[data-auth-list]').forEach(x=>{if(Object.hasOwn(state.authLists||{},x.dataset.authList))x.value=state.authLists[x.dataset.authList];});$('[data-auth-redirects]').value=state.authRedirects||"";$("#custom-methods").value=state.customMethods||"";
      fields=state.fields.map(field);actions=state.actions.map((a,i)=>Object.assign({name:"custom_action_"+(i+1),label:"",method:"POST",behavior:"stub",target:state.fields[0]?.name||"",value:"",by:"1",params:"",route:"",confirm:false},a));$("#class-name").dataset.old=snake($("#class-name").value);return true;
    }catch(_){return false;}
  }
  function update(){saveDraft();const file=mod()+".py";$("#preview-filename").textContent=file;$("#download-model").dataset.filename=file;const err=validate();if(err){msg.textContent=err;msg.className="validation-message visible";output.value="# Fix the model settings to generate Python code.";return;}try{output.value=makeCode();msg.textContent="Model looks ready. Review the generated file before using it.";msg.className="validation-message visible ok";}catch(e){msg.textContent=e.message;msg.className="validation-message visible";output.value="# Check the model settings and custom action parameters.";}}
  function addAction(seed){actionId++;const n=seed&&seed.name||"custom_action_"+actionId;actions.push(Object.assign({name:n,label:n.replace(/_/g," "),method:"POST",behavior:"stub",target:fields[0]?.name||"",value:"",by:"1",params:"",route:"",confirm:false},seed||{}));renderActions();update();}
  function preset(k){const data={
    task:{name:"Task",file:"task",menu:"Tasks",fields:[field({name:"title",required:true,search:true,operator:"like",maxLength:"180"}),field({name:"description",type:"TextField",nullable:true,required:false}),field({name:"status",default:"todo",required:false,search:true,choices:"todo, in_progress, done"}),field({name:"is_complete",type:"BooleanField",boolDefault:"false",required:false})]},
    product:{name:"Product",file:"product",menu:"Products",fields:[field({name:"name",required:true,search:true,operator:"like"}),field({name:"category",required:true,choices:"furniture, electronics, clothing",search:true}),field({name:"price",type:"FloatField",required:true,search:true,operator:"gt"}),field({name:"in_stock",type:"BooleanField",boolDefault:"true",required:false}),field({name:"photo",type:"ImagePath",nullable:true,required:false})],actions:[{name:"mark_out_of_stock",label:"Mark out of stock",behavior:"set",target:"in_stock",value:"false"}]},
    user:{name:"User",file:"user",menu:"Users",auth:true,fields:[field({name:"name",required:true,search:true,operator:"like"}),field({name:"email",unique:true,required:true,search:true,operator:"like"}),field({name:"role",default:"user",required:false,search:true}),field({name:"password",update:false,sensitive:true,listed:false}),field({name:"is_verified",type:"BooleanField",boolDefault:"false",required:false})]}
  }[k];$("#class-name").value=data.name;$("#module-name").value=data.file;$("#menu-label").value=data.menu;fields=data.fields;actions=(data.actions||[]).map((a,i)=>Object.assign({name:"custom_action_"+(i+1),label:"",method:"POST",behavior:"stub",target:fields[0]?.name||"",value:"",by:"1",params:"",route:"",confirm:false},a));$("#enable-auth").checked=Boolean(data.auth);$("#auth-fields").classList.toggle("is-disabled",!data.auth);$("#auth-fields").setAttribute("aria-disabled",String(!data.auth));$("#signup-enabled").disabled=!data.auth;renderFields();renderActions();update();}

  list.addEventListener("input",changeField);list.addEventListener("change",changeField);
  function changeField(e){const el=e.target.closest("[data-fi]");if(!el)return;const f=fields[+el.dataset.fi];f[el.dataset.fk]=el.type==="checkbox"?el.checked:el.value;if(el.dataset.fk==="type"){renderFields();renderActions();}update();}
  list.addEventListener("click",e=>{const b=e.target.closest("[data-rf]");if(b){fields.splice(+b.dataset.rf,1);renderFields();renderActions();update();}});
  actionList.addEventListener("input",changeAction);actionList.addEventListener("change",changeAction);
  function changeAction(e){const el=e.target.closest("[data-ai]");if(!el)return;const a=actions[+el.dataset.ai];a[el.dataset.ak]=el.type==="checkbox"?el.checked:el.value;if(el.dataset.ak==="behavior")renderActions();update();}
  actionList.addEventListener("click",e=>{const b=e.target.closest("[data-ra]");if(b){actions.splice(+b.dataset.ra,1);renderActions();update();}});
  $("#add-field").addEventListener("click",()=>{fields.push(field({name:"field_"+(fields.length+1)}));renderFields();update();$("[data-fk='name']",list.lastElementChild).focus();});
  $("#add-action").addEventListener("click",()=>addAction());
  $$("[data-template]").forEach(b=>b.addEventListener("click",()=>preset(b.dataset.template)));
  $("#enable-auth").addEventListener("change",e=>{const on=e.target.checked;$("#auth-fields").classList.toggle("is-disabled",!on);$("#auth-fields").setAttribute("aria-disabled",String(!on));$("#signup-enabled").disabled=!on;update();});
  $("#signup-enabled").addEventListener("change",update);
  document.addEventListener("input",e=>{if(e.target.matches("#class-name")){const next=snake(e.target.value),old=e.target.dataset.old;if(!old||$("#module-name").value===old)$("#module-name").value=next;e.target.dataset.old=next;}if(e.target.matches("#class-name,#module-name,#db-import,#menu-label,#custom-methods,[data-auth],[data-auth-list],[data-auth-redirects],[data-permission],[data-admin-action]"))update();});
  document.addEventListener("change",e=>{if(e.target.matches("[data-auth],[data-auth-list],[data-auth-redirects],[data-permission],[data-admin-action]"))update();});
  $("#copy-model").addEventListener("click",async e=>{const b=e.currentTarget;try{await navigator.clipboard.writeText(output.value);b.textContent="Copied";}catch(_){output.focus();output.select();b.textContent="Select and copy";}setTimeout(()=>b.textContent="Copy code",1500);});
  $("#download-model").addEventListener("click",()=>{if(validate())return;const url=URL.createObjectURL(new Blob([output.value],{type:"text/x-python;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download=$("#download-model").dataset.filename||"model.py";a.click();URL.revokeObjectURL(url);});
  restoreDraft();
  $("#clear-draft").addEventListener("click",()=>{if(window.confirm("Clear the saved model builder draft and start over?")){try{localStorage.removeItem(DRAFT_KEY);}catch(_){}window.location.reload();}});
  renderFields();renderActions();update();
})();
