/*let str =
  '[{"id":8,"title":"Уборка"},' +
  '{"id":3,"title":"Поход в магазин"},' +
  '{"id":15,"title":"Сделать уроки"},' +
  '{"id":66,"title":"Перебрать бельё"},' +
  '{"id":0,"title":"Выйти на улицу"},' +
  '{"id":34,"title":"Зайти с улицы"},' +
  '{"id":4,"title":"Сделать сайт"}]';
let tasks = eval(str);*/
let tasks = [];

function newId() {
  let maxTaskId = 0;
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i]["id"] > maxTaskId) {
      maxTaskId = tasks[i]["id"];
    }
  }
  return maxTaskId + 1;
}

function addTask() {
  let newTaskName = prompt("Введите название нового задания: ", "");
  if (newTaskName == null) return;
  let newTaskId = newId();
  console.log(newTaskId);
  tasks.push({ id: newTaskId, title: newTaskName });
  renderTasks();
  /*let place = document.getElementById("addTaskTextArea");
  let x = document.createElement("textarea");
  x.id = "textareaID";
  place.appendChild(x);

  var button = document.createElement("button");
  button.innerHTML = "Done";
  button.onclick = function () {
    let newTaskName = document.getElementById("textareaID").value;
    console.log(newTaskName);
    let newTaskId = newId();
    tasks.push({ id: newTaskId, title: newTaskName });
    renderTasks();
  };
  place.appendChild(button);*/
}

function deleteTask(sender, id) {
  console.log(sender);
  let row = document.getElementById("row_" + id);
  row.style.backgroundColor = "#DEDEDE";

  setTimeout(() => {
    if (!window.confirm("Вы действительно хотите удалить задание?")) {
      row.style.backgroundColor = "white";
      return;
    }

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i]["id"] == id) {
        tasks.splice(i, 1);
        break;
      }
    }
    renderTasks();
  }, 50);
}

window.addEventListener("DOMContentLoaded", renderTasks);

function renderTasks() {
  fetch("http://localhost:8080/?action=read&id=1", { mode: "cors" })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      tasks = eval(data);
      doRender();
    });
}

function editTask(id) {
  let oldName = document.getElementById("row_" + id + "_cell_1").innerHTML;
  let newName = prompt("Введите новое название задания: ", oldName);

  fetch("http://localhost:8080/?action=update&id=" + id + "&value=" + newName, {
    mode: "cors",
  })
    .then((response) => {
      if (response.ok) {
        renderTasks();
        return null;
      }

      return response.text();
    })
    .then((data) => {
      if (data) alert(data);
    });
}

function doRender() {
  let table = document.getElementById("tblTasks");
  table.innerHTML = "";

  //console.log(table);

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    console.log(task);

    let row = table.insertRow();
    row.id = "row_" + tasks[i]["id"];

    let cell = row.insertCell();
    cell.innerHTML = (i + 1).toString() + ".";
    cell.id = row.id + "_cell_" + "0";

    cell = row.insertCell();
    cell.innerHTML = tasks[i]["name"];
    cell.id = row.id + "_cell_" + "1";

    cell = row.insertCell();
    var button = document.createElement("button");
    button.innerHTML = "edit";
    button.onclick = function () {
      editTask(tasks[i]["id"]);
    };
    cell.appendChild(button);

    cell = row.insertCell();
    var button = document.createElement("button");
    button.innerHTML = "delete";
    button.onclick = function () {
      deleteTask(this, tasks[i]["id"]);
    };
    cell.appendChild(button);
  }
}
