/** <COMMON> **/

function htmlToDom(html){
    var temp = document.createElement('template');
    temp.innerHTML = html;
    return temp.content;
}

function dequals(a, b){
    return deepEqual(a, b, {strict: true});
}

function lookForParentOfClass(el, className){
    for (;el != document.body; el = el.parentNode){
        if (el.classList.contains(className)){
            return el;
        }
    }
    return null;
}

const defaultNoty = {
    theme: 'mint',
    progressBar: true,
    timeout: 3000
};

function noty(params){
    return new Noty(Object.assign({}, defaultNoty, params));
}

/** </COMMON> **/

const pao = new (class PageObject{
    get idToObjectMap() {return this._idToObjectMap;}
    set idToObjectMap(val) {this._idToObjectMap = val;}

    get idToNodeMap() {return this._idToNodeMap;}
    set idToNodeMap(val) {this._idToNodeMap = val;}

    constructor(){
        this.idToObjectMap = {};
        this.idToNodeMap = {};
    }

    idToObj(id, val){
        if (val){
            this.idToObjectMap[id] = val;
            return this;
        }
        return this.idToObjectMap[id];
    }

    idToNode(id, val){
        if (val){
            this.idToNodeMap[id] = val;
            return this;
        }
        return this.idToNodeMap[id];
    }
})();

const listContainer = document.getElementById("list-container");
const forceForm = document.getElementById("force-form");

function redraw(many){
    many.forEach(redrawOne);
    const receivedIds = many.map(o=>o._id);
    Object.keys(pao.idToNodeMap).forEach(id=>{
        if (!receivedIds.includes(id)){
            removeOneById(id);
        }
    });
}

function fetchRedraw(){
    fetch(`/all/detailed`).then(d=>d.json()).then(d=>{redraw(d)});
}

fetchRedraw();

function removeOneById(id){
    pao.idToNode(id).remove();
    delete pao.idToNodeMap[id];
    delete pao.idToObjectMap[id];
}

function redrawOne(one){
    const id = one._id;
    if (!dequals(pao.idToObj(id), one)){
        const newNode = oneToHtml(one),
              oldNode = pao.idToNode(id);

        if (oldNode){
            listContainer.replaceChild(newNode, oldNode);
        } else{
            listContainer.appendChild(newNode);
        }
        pao.idToNode(id, newNode);
        pao.idToObj(id, one);
    }
}

function oneToHtml(one){
    return htmlToDom(`
<li id="${one._id}" class="has-loader default">
    <div class="row default">
        <div class="six columns">
            <div class="url"><textarea>${one.url}</textarea></div>
        </div>
        <div class="six columns">
            <div class="code">
                <textarea>${one.code || ""}</textarea>
            </div>
        </div>
    </div>
    <div class="row default">
        <div class="two columns">
            <label>
                <input type="checkbox" ${one.enabled ? 'checked' : ''}/>
                Enabled
            </label>
        </div>
        <div class="three columns">
            <label>
                Order
                <input type="number" name="order" ${one.order ? `value=${one.order}` : `placeholder="0"`} step="1" min="0" max="10000" pattern="\\d+"/>
            </label>
        </div>
        <div class="three columns">
            <label title="Show url for N seconds">
                Show for
                <input type="number" name="show-for" ${one.show_for_s ? `value=${one.show_for_s}` : `placeholder="0"`} step="1" min="0" max="10000" pattern="\\d+"/>
            </label>
        </div>        
        <div class="four columns u-pull-right">
            <div class="controls">
                <input type="button" value="SAVE" data-type="save-button" data-oneid="${one._id}"/>
                <input type="button" value="REMOVE" data-type="remove-button" data-oneid="${one._id}"/> 
            </div>
        </div>
    </div>
    <div class="row loading">
        <div class="twelve columns">
            <div class="lds-circle"></div>
        </div>
    </div>
</li>`).querySelector("*");
}

/** <EVENTS> **/

function resetCreateFormToDefault(){
    const form = document.getElementById("create");
    form.querySelector('div.url textarea').value = "";
    form.querySelector('div.code textarea').value = "";
    form.className = "has-loader default";
}

document.getElementById("addButton").addEventListener('click', e=>{
    const button = e.target,
          container = lookForParentOfClass(button, "has-loader"),
          urlVal = container.querySelector("div.url textarea").value.trim(),
          codeVal = container.querySelector("div.code textarea").value.trim();

    if (urlVal.length < 5){
        noty({
            type: 'error',
            layout: 'topRight',
            text: 'Url should be filled'
        }).show();
        return;
    }

    const putO = {
        url: urlVal
    };

    if (codeVal.length > 0){
        putO.code = codeVal
    }

    container.classList.remove("default");
    container.classList.add("loading");

    fetch('/url', {
        method: 'put',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(putO)
    })
        .then(d=>d.json())
        .then(d=>{
            noty({type: 'success', text: "Added successfully"}).show();
            resetCreateFormToDefault();
            fetchRedraw();
        })
        .catch(err=>{
            noty({type: 'error', text: `Error: ${err.toString()}`}).show();
            container.classList.remove("loading");
            container.classList.add("default");
        })
});

listContainer.addEventListener('click', e=>{
    const dataType = e.target.getAttribute("data-type");
    if (dataType === "remove-button"){
        onDeleteClick(e);
    } else if (dataType === "save-button") {
        onSaveClick(e);
    }
});

function onDeleteClick(e){
    const target = e.target,
          id = target.getAttribute('data-oneid');

    const parent = lookForParentOfClass(target, 'has-loader');

    parent.classList.remove("default");
    parent.classList.add("loading");

    fetch(`/id/${id}`, {
        method: 'delete',
    })
        .then(d=>{d.json()})
        .then(d=>{
            removeOneById(id);
            noty({type: 'success', text: "Removed successfully"}).show();
        })
        .catch(err=>{
            noty({type: 'error', text: `Error: ${err.toString()}`}).show();
            parent.classList.add("default");
            parent.classList.remove("loading");
        })
}

function onSaveClick(e){
    const target = e.target,
          id = target.getAttribute("data-oneid");

    const parent = lookForParentOfClass(target, 'has-loader');

    parent.classList.remove("default");
    parent.classList.add("loading");

    function hideLoading(){
        parent.classList.add("default");
        parent.classList.remove("loading");
    }

    const urlVal = parent.querySelector("div.url textarea").value.trim(),
          codeVal = parent.querySelector("div.code textarea").value.trim(),
          enabled = parent.querySelector("input[type='checkbox']").checked,
          order = parseInt(parent.querySelector("input[type='number'][name='order']").value),
          showFor = parseInt(parent.querySelector("input[type='number'][name='show-for']").value);

    if (urlVal.length < 5){
        noty({
            type: 'error',
            layout: 'topRight',
            text: 'Url should be filled'
        }).show();
        hideLoading();
        return;
    }

    const select = {
            _id: id
          },
          update = {
              url:     urlVal,
              code:    codeVal,
              enabled: enabled
          };

    if (order){
        update.order = order;
    }

    if (showFor){
        update.show_for_s = showFor;
    }

    fetch(`/update`, {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            select, update
        })
    })
        .then(d=>{d.json()})
        .then(d=>{
            noty({type: 'success', text: "Updated successfully"}).show();
            hideLoading();
        })
        .catch(err=>{
            noty({type: 'error', text: `Error: ${err.toString()}`}).show();
            hideLoading();
        })
}

forceForm.addEventListener('submit', onForce);

function onForce(e){
    const inputName = forceForm.querySelector("input[name='url']"),
          inputShowFor = forceForm.querySelector("input[name='show_for_s']"),
          url = inputName.value,
          show_for_s = parseInt(inputShowFor.value);

    function showLoading(v){
        if (v){
            forceForm.classList.remove("default");
            forceForm.classList.add("loading");
        }else{
            forceForm.classList.remove("loading");
            forceForm.classList.add("default");
        }
    }

    showLoading(true);

    fetch('/force', {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url, show_for_s
        })
    })
        .then(()=>{
            inputName.value = "";
            inputShowFor.value = "";
            showLoading(false);
        })
}

/** </EVENTS> **/

/** <SYNC> **/
function sync(){
    fetch('/sync')
        .then(d=>d.json())
        .then(d=>{
            if (d && d._id){
                const li = document.getElementById(d._id);
                const old = document.querySelector("li.on-air");
                if (li !== old){
                    if (old) old.classList.remove("on-air");
                    if (li)  li.classList.add("on-air");
                }
            }
        })
        .then(()=>{
            setTimeout(()=>{
                sync()
            }, 2000)
        })
        .catch(()=>{
            setTimeout(()=>{
                sync()
            }, 2000)
        })
}

setTimeout(()=>{sync()}, 2000);
/** </SYNC> **/