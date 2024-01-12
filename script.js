
async function fetchTasks() {
    const response = await fetch("http://localhost:3000/", { 
        method : "GET",
        })
    const text = JSON.parse(await response.text());
    console.log("Im running!");

    document.getElementById("task-list-items").replaceChildren();

    for(const task of text){
        if(task.date == document.getElementById("date-picker").value){
        console.log("tady");
        console.log(task);
        createElement(task.id, task.task);
        }
    }
}
async function createTask() {
    const requestBody = {"task" : document.getElementById("task-input").value,
                        "date" : document.getElementById("date-picker").value
                        };
    console.log(document.getElementById("date-picker").value);

    const response = await fetch("http://localhost:3000/", {
        method : "POST",
        headers : { "Content-Type": "application/json" },
        body : JSON.stringify(requestBody)
        })
    
    const responseText = JSON.parse(await response.text());
    document.getElementById("task-input").value = "";
    console.log(responseText);
    createElement(responseText.id, responseText.task);
}
async function updateTask(taskId, element) {
    console.log("updating!");
    console.log(element.firstChild.nextSibling.value);

    const requestBody = {
        "task": element.firstChild.nextSibling.value,
        "id": taskId
    }

    const response = await fetch("http://localhost:3000/", {
        method : "PUT",
        headers : { "Content-Type": "application/json" },
        body : JSON.stringify(requestBody)
        })
    const responseText = JSON.parse(await response.text());

    document.getElementById("edit").remove();
    document.getElementById(`update-button-${taskId}`).style.visibility = "hidden";
    const content = document.getElementById(`task-id-${taskId}`).firstChild.nextSibling;
    content.innerText = responseText.task;
    
    console.log(responseText.task);
}
async function deleteTask(taskId) {
    console.log("deleting?");

    const requestBody = {"id" : taskId};

    const response = await fetch("http://localhost:3000/", {
        method : "DELETE",
        headers : { "Content-Type": "application/json" },
        body : JSON.stringify(requestBody)
        })

    fetchTasks();
}
function createButton(text, onclick){
    const button = document.createElement("button");
    button.classList.add("task-button");
    button.onclick = onclick;
    button.innerHTML = text;
    return button;
}
function editTask(content, element, button){
    console.log("editiing");
    const task = content.innerText;
    const editTask = document.createElement("input");
    editTask.id = "edit";
    content.innerHTML = "";
    editTask.value = task;
    element.insertBefore(editTask, element.firstChild.nextSibling);
    button.style.visibility = "visible";
    console.log(element);
}
function doneTask(id, checkbox){
    document.getElementById(`task-id-${id}`).style.color = checkbox.checked ? "darkGray" : "";
}
function dateFormat(date){
    return date.toISOString().slice(0, 10);
}
function changeDay(by){
    const newDate = document.getElementById("date-picker").valueAsDate;
    newDate.setDate(newDate.getDate() + by); 
    document.getElementById("date-picker").value = dateFormat(newDate);
    fetchTasks();
}
function setDate(){
    document.getElementById("date-picker").value = dateFormat(new Date());
    //console.log(document.getElementById("date-picker").value);
    console.log(document.getElementById("date-picker").innerText);
    console.log(dateFormat(new Date()));
}
function dateChangeHandler(){
    fetchTasks();
}
function inputHandler(){
    const input = document.getElementById("task-input");
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            document.getElementById("create-task-button").click();
        }
    })
}
function createElement(id, task){
    const element = document.createElement("div");
        const content = document.createElement("div");

        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.onclick = () => doneTask(id, checkBox);
        const updateButton = createButton('<img src="assets/icons/pen.png">', () => updateTask(id, element));
        updateButton.id = `update-button-${id}`;
        updateButton.style.visibility = "hidden";
        const deleteButton = createButton('<img src="assets/icons/bin.png">', () => deleteTask(id));

        element.setAttribute("id", `task-id-${id}`);
        element.setAttribute("class", `flex mx-auto`);
        element.appendChild(checkBox);
        element.classList.add("task");
        element.appendChild(content);
        content.innerText = task;
        content.addEventListener("click", () => editTask(content, element, updateButton));
        element.appendChild(updateButton);
        element.appendChild(deleteButton);

        document.getElementById("task-list-items").appendChild(element);
}
fetchTasks();
document.addEventListener("DOMContentLoaded", () => {
    setDate();
    inputHandler();
});
