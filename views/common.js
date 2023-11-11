let select_rows = [];
let n = 0;
let tbl = [];
let startId = undefined;
let endId   = undefined;
let forms = document.getElementsByClassName('eva-form');
for (const div of forms) {                            
    // div.setAttribute("style", "overflow-y: scroll;");           
    div.setAttribute("style", "height: calc(100vh - 131px); overflow-y: scroll;");               
    tbl[n] = document.createElement('table');
    tbl[n].setAttribute("class", "table table-striped table-hover table-sm table-responsive");              
    div.appendChild(tbl[n]); 
    n = n + 1;
}
function row_select(e) {
    console.log('row_select');

    const path = e.path || (e.composedPath && e.composedPath());
    const row  = path[1];

    if (e.target.nodeName  === 'TH') {
        
        const tBody = e.currentTarget.tBodies[0];
        const rows = Array.from(tBody.rows);
        
        let reverse = 1;
        
        const cellIndex = e.target.cellIndex;                
                    
        if (e.target.getAttribute("sort-attr") === "desc" ) {
          reverse = -1;
          e.target.setAttribute("sort-attr", "asc");
        } else {
          reverse = 1;
          e.target.setAttribute("sort-attr", "desc");        
        }
        
        rows.sort((tr1, tr2) => {    
          const tr1Text = tr1.cells[cellIndex].textContent;
          const tr2Text = tr2.cells[cellIndex].textContent;       
          return reverse * (tr1Text.localeCompare(tr2Text));
        });
    
        tBody.append(...rows);

        for (cell of row.cells) {
            cell.style.color = 'black';
        }
        e.target.style.color = 'aquamarine';

    } else {
        let text;
        if (e.ctrlKey) {
            text = 'The CTRL key was pressed!';
            select_rows.push(row);
            row.style.background = 'aquamarine';
            console.log('select_rows count: ', select_rows.length);
        } else {
            text = 'The CTRL key was NOT pressed!';
            for (const rows of select_rows) {
                rows.style.background = '';
            }
            select_rows.splice(0, select_rows.length);
            row.style.background = 'aquamarine';
            select_rows.push(row);
        }
        console.log(text);
    }
}
async function show_table(show_tbl , hide, col, data) {
    console.log('>>show_table...'); 
  
    if (show_tbl) {
      show_tbl.addEventListener('click', row_select);

      show_tbl.addEventListener('dblclick',  (e) => {
        
        if (e.target.nodeName  === 'TH') {
          return;
        } else {
          const currentForm = e.currentTarget.parentNode.parentNode;
                  
          const modalTrigger = currentForm.getElementsByClassName('eva-edit');
          if (modalTrigger[0]) {
            modalTrigger[0].click();
          }
        }
      });

      const debounce = (func, delay) => {
        let timeoutId;
        
        return (...args) => {
          clearTimeout(timeoutId);
          
          timeoutId = setTimeout(() => {
            func.apply(this, args);
          }, delay);
        };
      };

      const debouncedUpdateNode = async(e) => {     
      
        debounce(async () => {                  

          let deltaY = await e.deltaY; 
          startId = data[0].id;
          endId   = data[data.length-1].id;
          console.log(startId);                  
          console.log(endId); 
          
          let I = 1;
        
          if (deltaY > 100) {
            startId = startId + I;         
            endId   = endId - I;                
          } else if (deltaY < 100) {        
            startId = startId - I;         
            endId   = endId + I;                         
          }                             
                          
          await show_config_table();    

        }, 200);      
      }
  
  
      show_tbl.addEventListener('wheel', async (e) => {         

        await debouncedUpdateNode(e);
                            
      }, { passive: true });
      
    }

    show_tbl.innerHTML = '';
  
    const thead = document.createElement('thead');
    thead.style.position = 'sticky';  
    thead.style.top      = '0px';
    thead.style.border   = '#00ff92';
    thead.style.background = 'White';  
    show_tbl.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    show_tbl.appendChild(tbody);
  
    const tr = document.createElement('tr'); 
    thead.appendChild(tr);
    
    for (const e of Object.keys(col)) {             
      const th = document.createElement('th');    
      th.setAttribute("sort-attr", "");                        
      for (const h of hide) {   
        if (e===h)     
        th.style.display = "none";        
      }
      tr.appendChild(th);        
      th.textContent = col[e];      
    }       
  
    for (const rows of data) {                  
      const tr = document.createElement('tr');
      tbody.appendChild(tr);             
      for (let p of Object.keys(col)) {            
        const td = document.createElement('td');    
        tr.appendChild(td);              
        td.textContent = rows[p];    
        for (const h of hide) {   
            if (p===h)     
            td.style.display = "none";        
        }
      }
    }   
}
/////////////////////////////////////////////////////////////////////////////
let input_username = document.getElementById('input-username');

async function select_user() {
    console.log('>>select_user...');          
    let data = await getUsers();    
    console.log(data);  
    for(let rows of data) {
        
        let option = document.createElement('option');
        option.value = rows['Name'];
        option.text  = rows['Name'];
        input_username.appendChild(option);
        
    }
}
async function show_user_table() {
    
    let data = await getUsers();   

    const col  = { 'id':'Id', 'Name':'Name', 'Descr':'Descr', 'Role':'Role','email':'E-mail', 'Show':'Show',  'EAuth':'EAuth' };  
    const hide = ['id'];  

    await show_table(tbl[0], hide, col, data);

}
async function getUsers() {
    console.log('getUsers');
    let res;
    try{
        const response = await fetch('/users');
        res = await response.json();
    } catch (err) {
        console.log(err)
    }
    return res;
}
async function create_user(data) {
    console.log('>>create_user...');
    let res;
    try {
        let response = await fetch('/createuser', {
            method  : 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        console.log(JSON.stringify(data));
        res = await response.json();
    } catch(err) {
        console.log(err);
    }
    return res;
}
async function user_create() {
    console.log('>>user_create...');

    const input_username    = document.getElementById('input-username');
    const input_password    = document.getElementById('input-password');
    const input_confirmpass = document.getElementById('input-confirmpass');
    const input_descr       = document.getElementById('input-descr');
    const input_eauth       = document.getElementById('input-eauth');
    const input_show        = document.getElementById('input-show');
    const input_role        = document.getElementById('input-role');

    if (input_password.value !== input_confirmpass.value) alert('Неверное подтверждение пароля!');
    if (!input_username.value) alert('Не заполнено имя пользователя!');

    const data =  {
        'Name'    : input_username.value,
        'Descr'   : input_descr.value,
        'Password': input_password.value,
        'RoleId'  : input_role.getAttribute("eva-id"),
        'EAuth'   : input_eauth.value,
        'Show'    : input_show.value
    };
    
    let result;
    try {
        result = await create_user(data)
        //console.log(result);        
    } catch (e) {
        console.log(e);
    }

    if (result) await show_user_table();

}
async function edit_user(data) {
    console.log('>>edit_user..'); 
  
    let res;
    try {
      let response = await fetch('/updateuser', { 
          method  : 'post',    
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)            
        });  
        res = await response.json();                      
    } catch (e) {
      console.log(e);
    }

    return res;
}
async function user_edit_modal() {
    console.log('user_modal'); 
  
    const row = select_rows[0];  
          
    const input_form        = document.getElementById('create-user-form');  
    const input_name        = document.getElementById('input-edit-username');  
    const input_descr       = document.getElementById('input-edit-descr');    
    const input_email       = document.getElementById('input-edit-email');    
    const input_role        = document.getElementById('input-edit-role');           
    const input_password    = document.getElementById('input-edit-password');    
    const input_confirmpass = document.getElementById('input-edit-confirmpass'); 
    const input_show        = document.getElementById('input-edit-show');
    const input_eauth       = document.getElementById('input-edit-eauth');

    let data = { 'id': row.cells[0].innerText };

    let res;
    try {    
        let response = await fetch('/getone', {
            method  : 'post',    
            headers : {'Content-Type': 'application/json'},
            body    : JSON.stringify(data)            
        });  
        res = await response.json();     
       
    } catch (err) {
      console.log(err);
    }
  
    if (res) {
       
        input_form.setAttribute("eva-id", res[0].id);
        input_name.value        = res[0].Name;
        input_descr.value       = res[0].Descr;   
        input_email.value       = res[0].email;   
        input_role.value        = res[0].Role;           
        input_role.setAttribute("eva-id", res[0].RoleId);
        input_password.value    = '';   
        input_confirmpass.value = '';                
        input_show.value        = res[0].Show;  
        input_eauth.value       = res[0].EAuth;       
    }         

}
async function user_edit() {
    console.log('user_edit'); 
      
    const input_form        = document.getElementById('create-user-form');  
    const input_name        = document.getElementById('input-edit-username');  
    const input_descr       = document.getElementById('input-edit-descr');     
    const input_email       = document.getElementById('input-edit-email');    
    const input_password    = document.getElementById('input-edit-password');    
    const input_confirmpass = document.getElementById('input-edit-confirmpass'); 
    const input_eauth       = document.getElementById('input-edit-eauth');   
    const input_show        = document.getElementById('input-edit-show');   
    const input_role        = document.getElementById('input-edit-role'); 

    if (!input_password.value === input_confirmpass.value) return;
    
    const data =  {
        'id'          : input_form.getAttribute("eva-id"),
        'Name'        : input_name.value,
        'Descr'       : input_descr.value,
        'email'       : input_email.value,
        'Password'    : input_password.value,
        'EAuth'       : input_eauth.value,
        'Show'        : input_show.value,
        'RoleId'      : input_role.getAttribute("eva-id")
    };
  
    console.log(data);

    let result;
    try {
      result = await edit_user(data)     
    } catch (e) {
      console.log(e);
    }
    //if (result) {      
      await show_user_table();     
    //}
}
async function delete_user(data) {
    console.log('>>delete_user...');
    let res;
    try {
        let response = await fetch('/deluser', {
            method  : 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        res = await response.json();
    } catch (err) {
        console.log(err);
    }
    return res;
}
async function user_delete() {
    console.log('>>user_delete...');
    let result;
    for (const row of select_rows){

        let data = {'id': row.cells[0].innerText};

        result = await delete_user(data);        
    }

    if(result) await show_user_table();
}
/////////////////////////////////////////////////////////////////////////////
async function show_role_table() {
    
    let data = await getUsersRoles();   

    console.log(data);

    const col  = { 'id':'Id', 'Name':'Name' };  
    const hide = ['id'];  

    await show_table(tbl[1], hide, col, data);

}
async function getUsersRoles() {
    console.log('getUsersRoles...');
    let res;
    try{
        const response = await fetch('/roles');
        res = await response.json();
    } catch (err) {
        console.log(err)
    }
    return res;
}
async function create_role(data) {
    console.log('>>create_role...');
    let res;
    try {
        let response = await fetch('/createrole', {
            method  : 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        res = await response.json();
    } catch(err) {
        console.log(err);
    }
    return res;
}
async function role_create() {
    console.log('>>role_create...');

    const input_rolename    = document.getElementById('input-rolename')
    
    if (!input_rolename.value) alert('Не заполнено наименование!');

    const data =  {
        'Name'    : input_rolename.value,
    };
    
    let result;
    try {
        result = await create_role(data)
        //console.log(result);        
    } catch (e) {
        console.log(e);
    }

    if (result) await show_role_table();

}
let currentModal;
async function user_edit_role() {
  console.log('>>user_edit_role...'); 

  let editUserRoleModal = document.getElementById("editUserRoleModal");
  let options =  {
    focus: true
  };

  currentModal = new bootstrap.Modal(editUserRoleModal, options);
  currentModal.show();

  let data = await getUsersRoles();  

  const col = {'id':'Id', 'Name':'Name'};  
  const hide = ['id'];
  
  await show_table(tbl[6], hide, col, data);
 
}
async function role_select() {
  console.log('>>role_select...'); 

  const row = select_rows[0];  

  const input_role        = document.getElementById('input-role');   
  const input_edit_role   = document.getElementById('input-edit-role');   

  input_role.value        = row.cells[1].innerText;
  input_role.setAttribute("eva-id", row.cells[0].innerText);
  input_edit_role.value   = row.cells[1].innerText;
  input_edit_role.setAttribute("eva-id", row.cells[0].innerText);

  currentModal.hide();
           
}
async function delete_role(data) {
    console.log('>>delete_role...');
    let res;
    try {
        let response = await fetch('/delrole', {
            method  : 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        res = await response.json();
    } catch (err) {
        console.log(err);
    }
    return res;
}
async function role_delete() {
    console.log('>>role_delete...');
    let result;
    for (const row of select_rows){

        let data = {'id': row.cells[0].innerText};

        result = await delete_role(data);        
    }

    if(result) await show_role_table();
}
/////////////////////////////////////////////////////////////////////////////
async function show_unit_table() {
  console.log('>>show_unit_table...'); 

  let data = await getUnits();  

  const col = {'id':'Ид', 'kod':'Код', 'parentid':'Ид родителя', 'name':'Наименование', 'parent':'Родитель', 'classes':'Тип' , 'descr':'Описание'};  
  const hide = ['id','parentid'];
  
  await show_table( tbl[3], hide, col, data);
    
}   
async function getUnits() {
    console.log('>>getUnits...'); 
    let res;
    try{
      const response = await fetch('/getunits'); 
      res = await response.json();
    } catch (err) {
      console.log(err)
    }
    return res;
}
async function create_unit(data) {
  console.log('>>create_unit...');
  let res;
  try {
    let response = await fetch('/addnode', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    res = await response.json();
  } catch (err) {
    console.log(err);
  }
  return res;
}  
async function unit_create() {
  console.log('>>unit_create...');

  const input_unit_name  = document.getElementById('input-unit-name');
  const input_unit_descr = document.getElementById('input-unit-descr');

  let data = { 
    name: input_unit_name.value,
    descr: input_unit_descr.value,
    classes : 'unit'
  };

  let result;
  try {
    result = await create_unit(data);
    //console.log(result);
  } catch (e) {
    console.log(e);
  }

  if (result) await show_unit_table();
} 
async function edit_unit(data) {
  console.log('edit_unit', data);  

  let res;
  try {

    let response = await fetch('/modnode', { 
        method  : 'post',    
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)            
      });

      res = await response.json();                      
  } catch (e) {
    console.log(e);
  }

  return res;
}
async function unit_modal() {
  console.log('>>unit_modal...'); 

  const row = select_rows[0];  

  const input_id          = document.getElementById('input-unit-edit-id'); 
  const input_kod         = document.getElementById('input-unit-edit-kod'); 
  const input_parentId    = document.getElementById('input-unit-edit-parentId'); 
  const input_parent      = document.getElementById('input-unit-edit-parent'); 
  const input_name        = document.getElementById('input-unit-edit-name');  
  const input_descr       = document.getElementById('input-unit-edit-descr');

  input_id.value       = row.cells[0].innerText;
  input_kod.value      = row.cells[1].innerText;
  input_parentId.value = row.cells[2].innerText;  
  input_name.value     = row.cells[3].innerText;
  input_parent.value   = row.cells[4].innerText;
  input_descr.value    = row.cells[6].innerText;            
}
async function unit_edit() {
  console.log('>>unit_edit...'); 

  const input_kod         = document.getElementById('input-unit-edit-kod');  
  const input_name        = document.getElementById('input-unit-edit-name');  
  const input_descr       = document.getElementById('input-unit-edit-descr');
  const input_parentId    = document.getElementById('input-unit-edit-parentId');
  const input_id          = document.getElementById('input-unit-edit-id');

  const row = select_rows[0];  
  let id    = input_id.value;
  let kod   = input_kod.value;
  let name  = input_name.value;
  let descr = input_descr.value;
  let parentId = input_parentId.value;  
  
  const data =  {
      'id'      : id,
      'kod'     : kod,
      'parent'  : parentId, 
      'name'    : name,
      'descr'   : descr,             
  };

  let result;
  try {
    result = await edit_unit(data)     
  } catch (e) {
    console.log(e);
  }
  //if (result) {      
    await show_unit_table();     
  //}

  let ele = cy.getElementById(id);
  await ele.data("kod", kod);
  await ele.data("name", name);
  await ele.data("descr", descr);
  await ele.data("parent", parentId);
  // cy.update();

}
async function delete_unit(data){
  console.log('>>delete_unit...', data);
  let res;
  try {
    let response = await fetch('/delnode', { 
      method  : 'post',        
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)            
    });
    res = await response.json();
  } catch (err) {
    console.log(err);
  }

  return res;
}
async function unit_delete() {
  console.log('>>unit_delete...');

  let result, id, data, ele, name;
  for (const row of select_rows){

    id     = row.cells[0].innerText;    
    data   = {'id': id};
    result = await delete_unit(data);   
        
  }

  if(result){    
    await show_unit_table();    
  }
}
async function getUnitParents() {
  console.log('>>getUnitParents...'); 
  let res;
  try{
    const response = await fetch('/getunitparents'); 
    res = await response.json();
  } catch (err) {
    console.log(err)
  }
  return res;
}
async function unit_edit_parent() {
  console.log('>>unit_edit_parent...'); 

  let editUnitParentModal = document.getElementById("editUnitParentModal");
  let options =  {
    focus: true
  };

  currentModal = new bootstrap.Modal(editUnitParentModal, options);
  currentModal.show();

  let data = await getUnitParents();  

  const col = {'id':'id', 'kod':'Код',  'parent':'Родитель', 'name':'Наименование','classes':'Тип' , 'descr':'Описание'};  
  const hide = ['id', 'parent'];
  
  await show_table(tbl[8], hide, col, data);
 
}
async function unit_select() {
  console.log('>>unit_select...'); 

  const row = select_rows[0];  

  const input_parentId    = document.getElementById('input-unit-edit-parentId'); 
  const input_parentKod   = document.getElementById('input-unit-edit-parentKod');
  const input_parent      = document.getElementById('input-unit-edit-parent');   
  const node_parent       = document.getElementById('node_parent');   
  const node_parentId     = document.getElementById('node_parentId');   

  input_parentId.value  = row.cells[0].innerText;
  node_parentId.value   = row.cells[0].innerText;
  input_parentKod.value = row.cells[1].innerText;;
  input_parent.value    = row.cells[3].innerText;
  node_parent.value     = row.cells[3].innerText;

  currentModal.hide();
           
}
/////////////////////////////////////////////////////////////////////////////
async function getConfig() {
    console.log('>>getConfig...');

    let data = { 'startId': startId,
                 'endId': endId };

    let res;
    try {
      const response = await fetch('/config', {
        method  : 'post',    
        headers : {'Content-Type': 'application/json'},
        body    : JSON.stringify(data)  
      });
      res = await response.json();
    } catch (err) {
      console.log(err);
    }
    return res;
}
async function show_config_table() {
    let tmp = await getConfig();
    let data = [];
   
    for (const row of tmp) {
      let strJson = row.data;      
      let Elements = JSON.parse(strJson);

      let createdAt = new Date(row.createdAt); 
      let date  = { date: createdAt.toLocaleString()};
      let elem1 = { temp_1: Elements[0].value };
      let elem2 = { temp_2: Elements[1].value };
      let elem3 = { pressure_1: Elements[2].value };
      let elem4 = { pressure_2: Elements[3].value };
  
      data.push(
        Object.assign(
          { id: row.id },
          date,
          elem1,
          elem2,
          elem3,
          elem4
        )
      );
    }
  
    const col = {
      'id': 'Id',
      'date': 'Дата и время',
      'temp_1': 'Температура вход, °C',
      'temp_2': 'Температура выход, °C',
      'pressure_1': 'Давление вход',
      'pressure_2': 'Давление выход'
    };
    const hide = [];
  
    await show_table(tbl[5], hide, col, data);
}  
async function create_config(data) {
    console.log('>>create_config...');
    let res;
    try {
      let response = await fetch('/createconf', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      res = await response.json();
    } catch (err) {
      console.log(err);
    }
    return res;
}  
async function config_create() {
    console.log('>>config_create...');
  
    const input_type = document.getElementById('input-type');
    const input_textId = document.getElementById('input-textId');
  
    if (!input_textId.value) alert('Не заполнен идентификатор!');
  
    let tmp = { typeId: input_type.value, textId: input_textId.value };
  
    const data = {
      'data': JSON.stringify(tmp),
    };
  
    let result;
    try {
      result = await create_config(data);
      //console.log(result);
    } catch (e) {
      console.log(e);
    }
  
    if (result) await show_config_table();
}  
async function delete_config(data) {
    console.log('>>delete_user...');
    let res;
    try {
      let response = await fetch('/delconf', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      res = await response.json();
    } catch (err) {
      console.log(err);
    }
    return res;
} 
async function config_delete() {
    console.log('>>config_delete...');
    let result;
    for (const row of select_rows) {
      let data = { 'id': row.cells[0].innerText };
      result = await delete_config(data);
    }
  
    if (result) await show_config_table();
} 
async function getData(startTime, endTime) {
  console.log('>>getData...');

  let data = {startTime, endTime};
  console.log(data);
  let res;
  try {
    const response = await fetch('/getdata', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    res = await response.json();
  } catch (err) {
    console.log(err);
  }
  return res;
}
/////////////////////////////////////////////////////////////////////////////
async function init() {
    // Where you want to render the map.
    let element = document.getElementById('osm-map');
  
    // Height has to be set. You can do this in CSS too.
    element.style.height = 'calc(100vh - 94px)';
  
    // Create Leaflet map on map element.
    let map = L.map(element);
  
    // Add OSM tile layer to the Leaflet map.
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Target's GPS coordinates.
    let target = L.latLng('54.923477', '82.984862');
  
    // Set map's center to target with zoom 14.
    map.setView(target, 14);
  
    // Place a marker on the same location.
    let marker = L.marker(target).addTo(map);
  
    await marker.on('click', async function (e) {
      let unitChartModal = document.getElementById("unitChartModal");
      let options = {
        focus: true
      };
  
      currentModal = new bootstrap.Modal(unitChartModal, options);
      currentModal.show();
               
      const displayFormats = {
        second: 'HH:mm',
        minute: 'HH:mm',
        hour: 'HH:mm',
        day: 'D MMM',
        month: 'MMM YYYY'
      }
      let time = {
        tooltipFormat: 'll HH:mm',
        unit: 'second',
        round: 'second',
        displayFormats: displayFormats
      };
      let Interval  = 1;
      let endTime   = new Date(Date.now());
      let startTime = new Date(endTime.getTime() - 3600 * 1000 * Interval);
       
      const input_startDate = document.getElementById('input-startDate');
      const input_endDate   = document.getElementById('input-endDate');      

      input_endDate.value   = await moment(endTime).format("YYYY-MM-DD HH:mm");
      input_startDate.value = await moment(startTime).format("YYYY-MM-DD HH:mm");
      
      console.log(input_endDate.value)

      async function roundTime(d) {       
        let ms = 1000 * 60 * 5; // convert minutes to ms
        let roundedDate = new Date(Math.round(d.getTime() / ms) * ms);
      
        return roundedDate;          
      }

      let xValues  = [];
      let yValues  = [];
      let y2Values = [];
      let y3Values = [];
      let y4Values = [];

      async function getXY(startTime, endTime, Interval) {        

        const tmp = await getData(startTime, endTime);  
        console.log(tmp); 

        xValues  = [];
        yValues  = [];
        y2Values = [];
        y3Values = [];
        y4Values = [];

        // console.log(yValues);       

          let chunkSize = 1;
          if (Interval === 1) {
            chunkSize = 1;  
          } else if (Interval === 24) {
            chunkSize = 18;          
          } else if (Interval === 720) {
            chunkSize = 540;
          } else if (Interval === 8760) {
            chunkSize = 6570;
          }  
          for (let i = 0; i < tmp.length; i += chunkSize) {

            const row  = await tmp[i];           
            xValues.push(new Date(row.createdAt));
            const rowd = await JSON.parse(row.data);
            yValues.push(await rowd[0].value);
            y2Values.push(await rowd[1].value);
            y3Values.push(await rowd[2].value / 1000);
            y4Values.push(await rowd[3].value / 1000);               
          }         
        console.log(xValues); 
      }   
      
      await getXY(startTime, endTime, Interval);
  
      let ctx = document.getElementById('myChart').getContext('2d');
      let myChart = await Chart.instances[0]; // Get the existing chart instance, if any
      console.log('До удаления', myChart)
      if (myChart) {
        await myChart.destroy();
      }
      console.log('После удаления', myChart)
      
      myChart = await new Chart(ctx, {
        type: "line",
        // display: true,
        // cubicInterpolationMode: 'monotone',
        data: {
          labels: xValues,
          datasets: [
            {
              label: 'T1 вход, C°',
              // fill: false,
              // lineTension: 0,
              tension: 0.5,
              pointRadius: 1,
              backgroundColor: "DeepPink",
              data: yValues,
              yAxisID: 'yAxis',
              xAxisID: 'xAxis',
            },
            {
              label: 'T2 выход, C°',
              // fill: false,
              // lineTension: 0,
              tension: 0.5,
              pointRadius: 1,
              backgroundColor: "DeepSkyBlue",
              data: y2Values,
              yAxisID: 'yAxis',
              xAxisID: 'xAxis',
            },
            {
              label: 'Давление вход, МПа',
              // fill: false,
              // lineTension: 0,              
              // tension: 0,
              pointRadius: 1,
              backgroundColor: "Aquamarine",
              data: y3Values,
              yAxisID: 'y2Axis',
              xAxisID: 'xAxis',
            },
            {
              label: 'Давление выход, МПа',
              // fill: false,
              // lineTension: 0,
              // tension: 1,
              pointRadius: 1,
              backgroundColor: "Bisque",
              data: y4Values,
              yAxisID: 'y2Axis',
              xAxisID: 'xAxis',
            },
          ],
        },
        options: {
          animation: false,
          // showLines: true,
          // responsive: true,
          scales: {
            xAxis: {
              type: 'time',
              min: await roundTime(startTime),
              max: await roundTime(endTime),                          
              time: time,
              grid: {
                tickColor: 'red'
              },
              // offsetAfterAutoskip: true,
              ticks: {
                // source: 'auto',
                // autoSkip: true,
                maxTicksLimit: 12,                
                minRotation: 45,
                // stepSize: 300              
              }, 
            },
            yAxis: {
              min: -40,
              max: 160,
              stepSize: 20,
              ticks: {
                callback: function (value) {
                  return value + ' C°';
                },
              },
            },
            y2Axis: {
              min: 0,
              max: 1.2,
              stepSize: 0.2,
              ticks: {
                callback: function (value) {
                  return value + ' МПа';
                },
              },
            },
          },
        },
      });
    
    await myChart.canvas.addEventListener('wheel',  async (e) => {
           
      let deltaY = await e.deltaY;
      
      const startDate = await input_startDate.value;
      const endDate   = await input_endDate.value;

      let  _startTime = new Date(startDate);         
      let  _endTime   = new Date(endDate);               

      console.log(startDate);
    
      const I = 3600*1000*Interval/12;                    
      
      if (deltaY > 0) {
        _startTime = new Date(_startTime.getTime() - I);         
        _endTime   = new Date(_endTime.getTime() - I);                
      } else if (deltaY < 0) {        
        _startTime = new Date(_startTime.getTime() + I);         
        _endTime   = new Date(_endTime.getTime() + I);               
      }                                                                          

      input_startDate.value = await moment(_startTime).format('YYYY-MM-DD HH:mm');      
      input_endDate.value   = await moment(_endTime).format('YYYY-MM-DD HH:mm');  

      myChart.options.scales.xAxis.min = await roundTime(_startTime); 
      myChart.options.scales.xAxis.max = _endTime;  

      await getXY(_startTime, _endTime, Interval);  
      myChart.data.labels = xValues;
      myChart.data.datasets[0].data = yValues;
      myChart.data.datasets[1].data = y2Values;
      myChart.data.datasets[2].data = y3Values;
      myChart.data.datasets[3].data = y4Values;     
      await myChart.update();                       
    }, { passive: true });

    const btnradio = document.getElementsByName('btnradio');    
    for (let btn of btnradio) {
      btn.addEventListener("click", async () => {
        let radio_id = btn.getAttribute("id");        
        
        if (radio_id === 'radio_hour') {
          Interval = 1;
          time = {
            tooltipFormat: 'll HH:mm',
            unit: 'second',
            round: 'second', //minute
            displayFormats: displayFormats            
          };                   
        } else if (radio_id === 'radio_day') {
          Interval = 24;
          time = {
            tooltipFormat: 'll HH:mm',
            unit: 'hour',            
            round: 'minute',
            displayFormats: displayFormats
          };               
        } else if (radio_id === 'radio_month') {
          Interval = 720;
          time = {
            tooltipFormat: 'll',
            unit: 'day',
            round: 'hour',
            displayFormats: displayFormats            
          };              
        } else if (radio_id === 'radio_year') {
          Interval = 8760;
          time = {
            tooltipFormat: 'll',
            unit: 'month',
            round: 'day',
            displayFormats: displayFormats            
          };                    
        }        
                        
        const endDate = await input_endDate.value;        
  
        const _endTime   = new Date(endDate);                 
        const _startTime = new Date(_endTime.getTime() - 3600*1000*Interval);

        input_startDate.value = await moment(_startTime).format("YYYY-MM-DD HH:mm");                                 
        
        await getXY(_startTime, _endTime, Interval);  

        myChart.options.scales.xAxis.min  = await roundTime(_startTime);           
        myChart.options.scales.xAxis.time = time;     
        myChart.data.labels = xValues;
        myChart.data.datasets[0].data = yValues;
        myChart.data.datasets[1].data = y2Values;
        myChart.data.datasets[2].data = y3Values;
        myChart.data.datasets[3].data = y4Values;

        await myChart.update();       

      });
    } 

    input_startDate.addEventListener("input", async (e) => {
      if (e.target === input_startDate) {
        const startDate = await e.target.value;        
        console.log('Изменен период (startDate): ' + startDate);

        const _startTime = new Date(startDate);         
        const _endTime   = new Date(_startTime.getTime() + 3600 * 1000 * Interval);

        input_endDate.value = await moment(_endTime).format("YYYY-MM-DD HH:mm");
                 
        myChart.options.scales.xAxis.min  = await roundTime(_startTime);
        myChart.options.scales.xAxis.max  = await roundTime(_endTime);    

        await getXY(_startTime, _endTime, Interval);   
        myChart.data.labels = xValues;
        myChart.data.datasets[0].data = yValues;
        myChart.data.datasets[1].data = y2Values;
        myChart.data.datasets[2].data = y3Values;
        myChart.data.datasets[3].data = y4Values;    
        
        await myChart.update();
      }
    });
    
    input_endDate.addEventListener("input", async (e) => {
      if (e.target === input_endDate) {
        const endDate = await e.target.value;        
        console.log('Изменен период (endDate): ' + endDate);

        const _endTime   = new Date(endDate); 
        const _startTime = new Date(_endTime.getTime() - 3600 * 1000 * Interval);

        input_startDate.value = await moment(_startTime).format("YYYY-MM-DD HH:mm");      
               
        myChart.options.scales.xAxis.min  = await roundTime(_startTime);
        myChart.options.scales.xAxis.max  = await roundTime(_endTime);   
        
        await getXY(_startTime, _endTime, Interval);  
        myChart.data.labels = xValues;
        myChart.data.datasets[0].data = yValues;
        myChart.data.datasets[1].data = y2Values;
        myChart.data.datasets[2].data = y3Values;
        myChart.data.datasets[3].data = y4Values;
        
        await myChart.update();
      }
    });

  });       
}
  
window.onload = async function() {    
    await select_user();
    await init();    
}