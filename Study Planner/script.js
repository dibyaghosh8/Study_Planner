function login(){
    let name=document.getElementById("nameInput").value;
    if(name.trim()==""){
        alert("Enter Your Name");
        return;
    }
    localStorage.setItem("studyUser",name.trim());
    window.location.href="dashboard.html";
}

// USER PROFILE
let user=localStorage.getItem("studyUser");
if(user){
    let userName=document.getElementById("userName");
    let welcomeName=document.getElementById("welcomeName");
    if(userName){
        userName.innerHTML=user;
    }

    if(welcomeName){
        welcomeName.innerHTML=user;
    }

}


// TASK DATA

function getUserTasks(){

    let user=localStorage.getItem("studyUser");

    return JSON.parse(
        localStorage.getItem(user+"_tasks")
    ) || [];

}


let tasks=getUserTasks();
let dailyGoal=8;
let timers={};
let timerSeconds={};


// UPDATE PERFORMANCE
function updateProgress(){
    let totalTask=tasks.length;
    let completedTask=
    tasks.filter(task=>task.complete).length;
    let totalMinutes=
    tasks.reduce(
        (sum,task)=>
        sum+Number(task.focusTime||0),
        0
    );
    let progress=
    (totalMinutes/(dailyGoal*60))*100;
    if(progress>100){
        progress=100;
    }
    let ids={

        progressPercent:"progressPercent",
        completed:"completedCount",
        pending:"pendingCount",
        focus:"focusTime",
        goal:"dailyGoal",
        score:"score"

    };


    if(document.getElementById(ids.progressPercent))
    document.getElementById(ids.progressPercent).innerHTML=
    Math.round(progress)+"%";

    if(document.getElementById(ids.completed))
    document.getElementById(ids.completed).innerHTML=
    completedTask;

    if(document.getElementById(ids.pending))
    document.getElementById(ids.pending).innerHTML=
    totalTask-completedTask;

    if(document.getElementById(ids.focus))
    document.getElementById(ids.focus).innerHTML=
    totalMinutes;


    if(document.getElementById(ids.goal))
    document.getElementById(ids.goal).innerHTML=
    dailyGoal;

    if(document.getElementById(ids.score))
    document.getElementById(ids.score).innerHTML=
    Math.round(progress);

    let circle=document.querySelector(".progress-circle");
    if(circle){

        circle.style.background=
        `conic-gradient(
        #322ac4 ${progress*3.6}deg,
        #ddd ${progress*3.6}deg
        )`;

    }


}

// OPEN TASK BOX

function openTaskBox(){
    let box=document.getElementById("taskBox");
    if(box.style.display=="block"){

        box.style.display="none";

    }
    else{

        box.style.display="block";
    }

}

// ADD TASK
function addTask(){
let name=document.getElementById("taskName").value;
let subject=document.getElementById("subject").value;
let hour=document.getElementById("durationHour").value;
let minute=document.getElementById("durationMinute").value;
if(name=="" || subject=="" || hour==""){
    alert("Fill all fields");
    return;

}

let task={
    name:name,
    subject:subject,
    hour:Number(hour),
    minute:Number(minute||0),
    complete:false,
  focusTime:0

};

tasks.push(task);
saveTasks();
showTask();
updateProgress();

document.getElementById("taskName").value="";
document.getElementById("subject").value="";
document.getElementById("durationHour").value="";
document.getElementById("durationMinute").value="";
}

// SHOW TASK

function showTask(){
    let list=document.getElementById("taskList");
    if(!list){
        return;
    }
    list.innerHTML="";
    if(tasks.length==0){
        list.innerHTML=
        `
        <div class="empty-task">
            No Task Added
        </div>
        `;

        return;

    }


    tasks.forEach((task,index)=>{
        list.innerHTML +=
        `
        <div class="task-card">
        <h3>${task.name}</h3>
        <p>
        Subject: ${task.subject}
        </p>
        <p>
        Duration: ${task.hour}h ${task.minute}m
        </p>

        <div class="task-timer" id="timer${index}">
        ${formatTime(timerSeconds[index]||0)}
        </div>

        <p>
        Status:
        ${task.complete ? "Completed":"Pending"}
        </p>

        <button 
        class="focus-btn"
        onclick="startStopTimer(${index})">
        ${timers[index] ? "Stop":"Start"}

        </button>

        <button 
        class="complete-btn"
        onclick="completeTask(${index})">

        Complete

        </button>

        <button 
        class="daily-btn"
        onclick="showDaily(${index})">
        Daily

        </button>





        <button 
        class="edit-btn"
        onclick="editTask(${index})">

        Edit

        </button>

        <button 
        class="delete-btn"
        onclick="deleteTask(${index})">

        Delete

        </button>



        </div>

        `;


    });


}


// TIMER START STOP


function startStopTimer(index){

    if(!timers[index]){
        timerSeconds[index]=
        timerSeconds[index] || 0;
        timers[index]=setInterval(()=>{


            timerSeconds[index]++;

            if(timerSeconds[index]%60==0){

                tasks[index].focusTime++;

                saveTasks();

                updateProgress();

            }

            let timerBox=
            document.getElementById(
                "timer"+index
            );

            if(timerBox){

                timerBox.innerHTML=
                formatTime(timerSeconds[index]);

            }

        },1000);

        showTask();

    }
    else{
        clearInterval(timers[index]);
        delete timers[index];
        showTask();


    }
}

// FORMAT TIME


function formatTime(sec){

    let h=Math.floor(sec/3600);

    let m=Math.floor(
        (sec%3600)/60
    );

    let s=sec%60;

    return (

        String(h).padStart(2,"0")
        +":"
        +
        String(m).padStart(2,"0")
        +":"
        +
        String(s).padStart(2,"0")

    );


}

// COMPLETE TASK

function completeTask(index){

    if(timers[index]){
        clearInterval(timers[index]);
        delete timers[index];
    }

    if(tasks[index].focusTime===0){
        tasks[index].focusTime=
        (tasks[index].hour*60)+tasks[index].minute;
    }

    tasks[index].complete=true;

    saveTasks();
    updateProgress();
    showDailyReport();
    showTask();
}


// DAILY TASK

function showDaily(index){
    let task=tasks[index];
    alert(
        "Task: "+task.name+
        "\nSubject: "+task.subject+
        "\nFocus Time: "+
        task.focusTime+
        " Minutes"

    );


}


// EDIT TASK
function editTask(index){
    let name=prompt(
        "Update Task Name",
        tasks[index].name
    );

    if(name){

        tasks[index].name=name;
        saveTasks();
        showTask()

    }

}

// DELETE TASK

function deleteTask(index){

    if(timers[index]){
        clearInterval(timers[index]);
        delete timers[index];
    }

    tasks.splice(index,1);
    saveTasks();
    updateProgress();
    showTask();
}
// TODAY'S REPORT


function showDailyReport(){
    let report=document.getElementById("dailyReport");
    if(!report){
        return;
    }
    let totalTask=tasks.length;
    let completed=
    tasks.filter(task=>task.complete).length;

    let pending=
    totalTask-completed;

    let totalMinutes=
    tasks.reduce(
        (sum,task)=>
        sum+Number(task.focusTime||0),
        0
    );

    let progress=
    (totalMinutes/(dailyGoal*60))*100;

    if(progress>100){
        progress=100;
    }

    document.getElementById("reportTotal").innerHTML=
    totalTask;

    document.getElementById("reportCompleted").innerHTML=
    completed;

    document.getElementById("reportPending").innerHTML=
    pending;

    document.getElementById("reportFocus").innerHTML=
    Math.floor(totalMinutes/60)
    +" Hours "
    +(totalMinutes%60)
    +" Minutes";

    document.getElementById("reportGoal").innerHTML=
    dailyGoal;

    document.getElementById("reportProgress").innerHTML=
    Math.round(progress);

    report.style.display="block";

    report.scrollIntoView({

        behavior:"smooth"

    });


}



// SAVE TASK

function saveTasks(){
    let user=
    localStorage.getItem("studyUser");
    if(user){
        localStorage.setItem(

            user+"_tasks",

            JSON.stringify(tasks)

        );


    }


}

// LOAD DATA


window.addEventListener("load",function(){
    showTask();
    updateProgress();
});
