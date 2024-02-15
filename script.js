async function catchedFetch(url, options) {
    let result = { response: null, type: "" };
    try {
        const response = await fetch(url, options);
        result = !response.ok
            ? { response: await response.text(), type: "error" }
            : { response: await response.text(), type: "success" };
    } catch (error) {
        console.error("Chybka :c ", error);
        result = { response: error, type: "error" };
    }
    return result;
}

async function fetchTasks() {
    const date = document.getElementById("date-picker").value;

    const result = await catchedFetch(`http://localhost:3000/?date=${date}`, {
        method: "GET",
    });

    const response = result.response;
    if (result.type === "success") {
        const tasks = JSON.parse(response);
        console.log("I'm running", result);

        document.getElementById("task-list-items").replaceChildren();

        for (const task of tasks) {
            createTaskElement(task.id, task.task);
        }
    } else {
        raiseToast(`Tasks failed to fetch because: ${response}`, "error");
    }
}

async function createTask() {
    const requestBody = {
        task: document.getElementById("task-input").value,
        date: document.getElementById("date-picker").value,
    };
    console.log(document.getElementById("date-picker").value);

    const result = await catchedFetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    const response = result.response;

    if (result.type === "success") {
        const responseText = JSON.parse(response);
        document.getElementById("task-input").value = "";
        console.log(responseText);
        createTaskElement(responseText.id, responseText.task);

        raiseToast("Task added successfully!", "success");
    } else {
        raiseToast(`Creating task failed because: ${response}`, "error");
    }
}

async function updateTask(taskId, element) {
    console.log("updating!");
    console.log(element.firstChild.nextSibling.value);

    const requestBody = {
        task: element.firstChild.nextSibling.value,
        id: taskId,
    };

    const result = await catchedFetch("http://localhost:3000/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    const response = result.response;

    if (result.type === "success") {
        const responseText = JSON.parse(response);

        document.getElementById("edit").remove();
        document.getElementById(`update-button-${taskId}`).style.visibility =
            "hidden";
        const content = document.getElementById(`task-id-${taskId}`).firstChild
            .nextSibling;
        content.innerText = responseText.task;

        console.log(responseText.task);

        raiseToast("Task successfully updated!", "success");
    } else {
        raiseToast(`Updating task failed because: ${response}`, "error");
    }
}

async function deleteTask(taskId) {
    console.log("deleting?");

    const requestBody = { id: taskId };

    const result = await catchedFetch("http://localhost:3000/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    const response = result.response;

    if (result.type === "success") {
        raiseToast("Task successfully deleted!", "success");
    } else {
        raiseToast(`Deleting task failed because: ${response}`, "error");
    }

    fetchTasks();
}

function createTaskButton(text, onclick) {
    const button = document.createElement("button");

    button.classList.add("task-button");
    button.onclick = onclick;
    button.innerHTML = text;

    return button;
}

function editTaskElement(content, element, button) {
    console.log("editiing");
    const task = content.innerText;
    const editTask = document.createElement("input");
    editTask.id = "edit";
    editTask.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            document.getElementsByClassName("update-button").click();
        }
    });
    content.innerHTML = "";
    editTask.value = task;
    element.insertBefore(editTask, element.firstChild.nextSibling);
    button.style.visibility = "visible";
    console.log(element);
}

function checkTaskElement(id, checkbox) {
    document.getElementById(`task-id-${id}`).style.color = checkbox.checked
        ? "darkGray"
        : "";
}

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function changeDay(by) {
    const newDate = document.getElementById("date-picker").valueAsDate;
    newDate.setDate(newDate.getDate() + by);
    document.getElementById("date-picker").value = formatDate(newDate);
    fetchTasks();
}

function setDate() {
    document.getElementById("date-picker").value = formatDate(new Date());
    //console.log(document.getElementById("date-picker").value);
    console.log(document.getElementById("date-picker").innerText);
    console.log(formatDate(new Date()));
}

function changeDateHandler() {
    fetchTasks();
}

function inputHandler() {
    const input = document.getElementById("task-input");
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            document.getElementById("create-task-button").click();
        }
    });
}

function createTaskElement(id, task) {
    const element = document.createElement("div");
    const content = document.createElement("div");

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.onclick = () => checkTaskElement(id, checkBox);
    const updateButton = createTaskButton(
        '<img src="assets/icons/pen.png">',
        () => updateTask(id, element)
    );
    updateButton.id = `update-button-${id}`;
    updateButton.style.visibility = "hidden";
    updateButton.classList.add("update-button");
    const deleteButton = createTaskButton(
        '<img src="assets/icons/bin.png">',
        () => deleteTask(id)
    );

    element.setAttribute("id", `task-id-${id}`);
    element.setAttribute("class", `flex mx-auto`);
    element.appendChild(checkBox);
    element.classList.add("task");
    element.appendChild(content);
    content.innerText = task;
    content.addEventListener("click", () =>
        editTaskElement(content, element, updateButton)
    );
    element.appendChild(updateButton);
    element.appendChild(deleteButton);

    document.getElementById("task-list-items").appendChild(element);
}

function raiseToast(message, type) {
    const toasts = document.getElementById("toasts");
    const element = document.createElement("div");

    element.classList.add(
        "bg-white/30",
        "rounded-xl",
        "p-3",
        "pb-4",
        "text-center",
        "overflow-hidden",
        "relative"
    );
    element.classList.add(
        "before:absolute",
        "before:content-['']",
        "before:h-[10px]",
        "before:w-full",
        "before:bottom-0",
        "before:left-0",
        "before:animate-[progress_3s_linear_forwards]"
    );
    const colors = {
        error: "before:bg-pink-500",
        success: "before:bg-teal-400",
    };
    element.classList.add(colors[type]);

    element.innerText = message || "something went wromg :c";

    const exitButton = document.createElement("button");

    exitButton.classList.add(
        "absolute",
        "top-0",
        "right-0",
        "mr-4",
        "mt-2",
        "drop-shadow-md"
    );
    exitButton.classList.add(
        "transition",
        "ease-in-out",
        "duration-75",
        "hover:scale-110",
        "hover:drop-shadow-2xl"
    );
    exitButton.innerText = "\u2716";
    exitButton.onclick = () => element.remove();

    element.appendChild(exitButton);
    toasts.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, 3_000);
}

setDate();
inputHandler();

fetchTasks();
